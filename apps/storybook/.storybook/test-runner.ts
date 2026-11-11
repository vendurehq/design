import type { Page } from '@playwright/test';
import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { configureAxe, getViolations, injectAxe } from 'axe-playwright';

// Violations at these impact levels fail the build. `minor`/`moderate` findings
// are logged but non-blocking, matching axe-core's own severity scale.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);
const THEMES = ['light', 'dark'] as const;

/**
 * `parameters.pressText` asks for a real mouse press on a piece of text, which
 * a play function cannot make: `userEvent` dispatches events to an element, so
 * nothing is hit-tested and `:active` never applies. The press must end on a
 * button named `expectButton` and must not navigate. `reducedMotion: true`
 * presses with `prefers-reduced-motion: reduce` emulated. Pass a list to press
 * several texts in turn. The button name must match exactly, so "Select" does
 * not pass for a button named "Selected".
 */
type TextPress = { text: string; expectButton: string; reducedMotion?: boolean };

async function pressText(page: Page, presses?: TextPress | TextPress[]) {
  for (const press of presses ? [presses].flat() : []) await pressOneText(page, press);
}

async function pressOneText(page: Page, press: TextPress) {
  // A tooltip from the last press can cover this text. Move the pointer away
  // first, as a user would, and wait for every tooltip to close. A tooltip
  // that a play function opened with a synthetic hover never closes: the real
  // pointer never entered its trigger, so it cannot leave it.
  await page.mouse.move(0, 0);
  await page
    .locator('[data-slot=tooltip-content]')
    .first()
    .waitFor({ state: 'detached', timeout: 2000 })
    .catch(() => {
      throw new Error(
        `pressText: a tooltip is still open before pressing "${press.text}". If the play function clicks or hovers a tooltip trigger, end with userEvent.unhover on it.`,
      );
    });
  const root = page.locator('#storybook-root');
  const box = await root.getByText(press.text, { exact: true }).boundingBox();
  if (!box) throw new Error(`pressText: "${press.text}" is not visible`);
  const url = page.url();
  if (press.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' });
  try {
    await page.mouse.click(box.x + 4, box.y + box.height / 2);
    await root
      .getByRole('button', { name: press.expectButton, exact: true })
      .waitFor({ timeout: 1000 });
  } finally {
    if (press.reducedMotion) await page.emulateMedia({ reducedMotion: null });
  }
  if (page.url() !== url) throw new Error(`pressText: the press navigated to ${page.url()}`);
}

/**
 * `parameters.hoverText` moves a real mouse onto each text in turn, in one
 * stroke, without leaving the story in between. After each move, exactly one
 * tooltip must be open, and it must contain `expectTooltip`. A tooltip from
 * the last text that stays open over this one fails the check: the pointer
 * then lands on that tooltip, not on the text.
 */
type TextHover = { text: string; expectTooltip: string };

async function hoverText(page: Page, hovers?: TextHover | TextHover[]) {
  const list = hovers ? [hovers].flat() : [];
  if (list.length === 0) return;
  const root = page.locator('#storybook-root');
  for (const hover of list) {
    const box = await root.getByText(hover.text, { exact: true }).boundingBox();
    if (!box) throw new Error(`hoverText: "${hover.text}" is not visible`);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
    await page
      .waitForFunction(
        (expected) => {
          const open = [
            ...document.querySelectorAll('[data-slot=tooltip-content]:not([data-ending-style])'),
          ];
          return open.length === 1 && Boolean(open[0]?.textContent?.includes(expected));
        },
        hover.expectTooltip,
        { timeout: 1000 },
      )
      .catch(async () => {
        const open = await page
          .locator('[data-slot=tooltip-content]:not([data-ending-style])')
          .allTextContents();
        throw new Error(
          `hoverText: over "${hover.text}", expected one tooltip with "${hover.expectTooltip}", found ${JSON.stringify(open)}`,
        );
      });
  }
  await page.mouse.move(0, 0);
  await page.locator('[data-slot=tooltip-content]').first().waitFor({ state: 'detached' });
}

/**
 * `parameters.pressNear` presses with a real mouse at `distance` px outside
 * one edge of the button named `button`, centred along that edge. Only a real
 * press is hit-tested, so only it reaches a button's invisible click area.
 * Afterwards a button named `expectButton` must exist: a toggle that was hit
 * renames itself, one that was missed keeps its name (pass the old name).
 */
type NearPress = {
  button: string;
  edge: 'top' | 'bottom' | 'left' | 'right';
  distance: number;
  expectButton: string;
};

async function pressNear(page: Page, presses?: NearPress | NearPress[]) {
  const root = page.locator('#storybook-root');
  for (const press of presses ? [presses].flat() : []) {
    await page.mouse.move(0, 0);
    const box = await root.getByRole('button', { name: press.button, exact: true }).boundingBox();
    if (!box) throw new Error(`pressNear: "${press.button}" is not visible`);
    const midX = box.x + box.width / 2;
    const midY = box.y + box.height / 2;
    const [x, y] = {
      top: [midX, box.y - press.distance],
      bottom: [midX, box.y + box.height + press.distance],
      left: [box.x - press.distance, midY],
      right: [box.x + box.width + press.distance, midY],
    }[press.edge] as [number, number];
    await page.mouse.click(x, y);
    // A miss changes nothing, so give a hit time to re-render before checking.
    await page.waitForTimeout(100);
    await root
      .getByRole('button', { name: press.expectButton, exact: true })
      .waitFor({ timeout: 1000 })
      .catch(() => {
        throw new Error(
          `pressNear: a press ${press.distance}px off the ${press.edge} edge of "${press.button}" did not leave a button named "${press.expectButton}"`,
        );
      });
  }
}

/**
 * `parameters.pressRowText` presses a piece of plain text in a table row with
 * a real mouse, as `pressText` does, and expects the press to open the row's
 * link: the URL hash must become `expectHash`. A press scale on the link would
 * make it the containing block of its stretched ::after, so the mouseup would
 * miss it; only a real press shows that.
 */
async function pressRowText(page: Page, press?: { text: string; expectHash: string }) {
  if (!press) return;
  const root = page.locator('#storybook-root');
  const box = await root.getByText(press.text, { exact: true }).boundingBox();
  if (!box) throw new Error(`pressRowText: "${press.text}" is not visible`);
  await page.evaluate(() => history.replaceState(null, '', location.pathname + location.search));
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const hash = await page.evaluate(() => location.hash);
  await page.evaluate(() => history.replaceState(null, '', location.pathname + location.search));
  if (hash !== press.expectHash) {
    throw new Error(`pressRowText: expected ${press.expectHash}, the press opened "${hash}"`);
  }
}

/**
 * `parameters.pressSelectsRow` presses a piece of text in a table row with a
 * real mouse while rows are selected, and expects the press to select the row:
 * the checkbox named `expectChecked` must become checked and the URL must not
 * change. A play function's click is not hit-tested against the page around
 * the table; this press is.
 */
async function pressSelectsRow(page: Page, press?: { text: string; expectChecked: string }) {
  if (!press) return;
  const root = page.locator('#storybook-root');
  const box = await root.getByText(press.text, { exact: true }).boundingBox();
  if (!box) throw new Error(`pressSelectsRow: "${press.text}" is not visible`);
  const url = page.url();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await root
    .getByRole('checkbox', { name: press.expectChecked, exact: true })
    .and(page.locator('[aria-checked=true]'))
    .waitFor({ timeout: 1000 })
    .catch(() => {
      throw new Error(
        `pressSelectsRow: the press on "${press.text}" did not check "${press.expectChecked}"`,
      );
    });
  if (page.url() !== url) throw new Error(`pressSelectsRow: the press navigated to ${page.url()}`);
}

/**
 * `parameters.pressSelectCell` presses the four corners of a DataTable
 * selection slot with a real mouse: the full row height, from the table's
 * start edge to where the next cell's content starts. Each press must toggle
 * the checkbox named `checkbox` and must not navigate. The slot of the header
 * row is checked the same way when `header` names the select-all checkbox.
 */
async function pressSelectCell(page: Page, press?: { checkbox: string; header?: string }) {
  if (!press) return;
  const root = page.locator('#storybook-root');
  for (const name of [press.checkbox, press.header].filter(Boolean) as string[]) {
    const checkbox = root.getByRole('checkbox', { name, exact: true });
    const slot = await checkbox.evaluate((box) => {
      const cell = box.closest('td,th') as HTMLElement;
      const next = cell.nextElementSibling as HTMLElement;
      const row = cell.getBoundingClientRect();
      const content = next.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(next).paddingLeft);
      const table = (cell.closest('table') as HTMLElement).getBoundingClientRect();
      return { left: table.left, right: content, top: row.top, bottom: row.bottom };
    });
    const corners = [
      [slot.left + 1, slot.top + 1],
      [slot.right - 1, slot.top + 1],
      [slot.right - 1, slot.bottom - 1],
      [slot.left + 1, slot.bottom - 1],
    ];
    const url = page.url();
    for (const [x, y] of corners) {
      const before = await checkbox.getAttribute('aria-checked');
      await page.mouse.click(x as number, y as number);
      await page
        .waitForFunction(
          ([label, was]) =>
            document.querySelector(`[role=checkbox][aria-label="${label}"]`)?.getAttribute('aria-checked') !== was,
          [name, before] as const,
          { timeout: 1000 },
        )
        .catch(() => {
          throw new Error(`pressSelectCell: a press at (${Math.round(x as number)}, ${Math.round(y as number)}) did not toggle "${name}"`);
        });
      if (page.url() !== url) throw new Error(`pressSelectCell: the press navigated to ${page.url()}`);
    }
  }
}

/**
 * `parameters.pressOpen` presses a trigger's text with a real mouse, so the
 * browser counts the open as a pointer interaction. A play function's click
 * is synthetic and leaves `:focus-visible` matching. The opened overlay must
 * move focus to the button named `expectFocus`, and that button must show a
 * solid outline. Escape closes the overlay again.
 */
async function pressOpen(page: Page, press?: { text: string; expectFocus: string }) {
  if (!press) return;
  const root = page.locator('#storybook-root');
  const box = await root.getByText(press.text, { exact: true }).boundingBox();
  if (!box) throw new Error(`pressOpen: "${press.text}" is not visible`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  const focused = page.locator('body').getByRole('button', { name: press.expectFocus, exact: true });
  await page.waitForFunction(
    (name) => document.activeElement?.textContent?.trim() === name,
    press.expectFocus,
    { timeout: 2000 },
  ).catch(() => {
    throw new Error(`pressOpen: "${press.expectFocus}" did not take focus`);
  });
  const outline = await focused.evaluate((button) => getComputedStyle(button).outlineStyle);
  if (outline !== 'solid') {
    throw new Error(`pressOpen: "${press.expectFocus}" has focus but no ring (outline ${outline})`);
  }
  await page.keyboard.press('Escape');
}

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
    // Placeholder text is a hint, not content: the v3 look sets it in
    // `faint-foreground`, below 4.5:1. Fields mark it with `data-placeholder`
    // (Select, Combobox and the date pickers; a native ::placeholder is never
    // scanned), so the contrast rule skips it. All other text is still checked.
    //
    // Base UI renders focus guards (`[data-base-ui-focus-guard]`) around some
    // popups, such as the open NavigationMenu. They are aria-hidden and
    // tabbable on purpose: they catch Tab at the popup edge and move focus into
    // it. Base UI says to exclude them from axe (mui/base-ui#5237); removing
    // `aria-hidden` raises `aria-required-children` instead. Only this rule
    // skips them.
    await configureAxe(page, {
      rules: [
        { id: 'color-contrast', selector: '*:not([data-placeholder])' },
        { id: 'aria-hidden-focus', selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])' },
      ],
    });
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    await hoverText(page, storyContext.parameters?.hoverText);
    await pressText(page, storyContext.parameters?.pressText);
    await pressNear(page, storyContext.parameters?.pressNear);
    await pressRowText(page, storyContext.parameters?.pressRowText);
    await pressSelectsRow(page, storyContext.parameters?.pressSelectsRow);
    await pressSelectCell(page, storyContext.parameters?.pressSelectCell);
    await pressOpen(page, storyContext.parameters?.pressOpen);

    // Opt a story out via `parameters.a11y.skip` in its meta or story export.
    // See docs/testing.md for when this is an acceptable escape hatch.
    if (storyContext.parameters?.a11y?.skip) {
      return;
    }

    // Scan every story in both themes. The themes addon toggles the `dark`
    // class on <html>, so set the same class here, then wait for the color
    // transitions to finish before axe reads the computed colors.
    const failures: string[] = [];
    for (const theme of THEMES) {
      await page.evaluate(async (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        // Every animation that ends: transitions, keyframes and Web Animations
        // (the bulk bar's exit). Infinite ones such as spinners never finish.
        // Two frames first, so an exit that starts after the last commit counts.
        for (let frame = 0; frame < 2; frame++) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        const finite = document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);
        await Promise.allSettled(finite.map((animation) => animation.finished));
      }, theme === 'dark');

      const violations = await getViolations(
        page,
        '#storybook-root',
        storyContext.parameters?.a11y?.config,
      );
      const blocking = violations.filter((violation) =>
        BLOCKING_IMPACTS.has(violation.impact ?? ''),
      );
      failures.push(
        ...blocking.map(
          (violation) =>
            `- [${theme}] [${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) — ${violation.helpUrl}\n${violation.nodes.map((node) => `    ${node.target.join(' ')}: ${node.any[0]?.message ?? ''}`).join('\n')}`,
        ),
      );
    }

    if (failures.length === 0) {
      return;
    }

    const details = failures.join('\n');

    throw new Error(
      `Accessibility violations in "${context.title} > ${context.name}":\n${details}`,
    );
  },
};

export default config;
