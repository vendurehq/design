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
  // first, as a user would, and wait for every tooltip to close.
  await page.mouse.move(0, 0);
  await page.locator('[data-slot=tooltip-content]').first().waitFor({ state: 'detached' });
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
    await configureAxe(page, {
      rules: [{ id: 'color-contrast', selector: '*:not([data-placeholder])' }],
    });
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    await hoverText(page, storyContext.parameters?.hoverText);
    await pressText(page, storyContext.parameters?.pressText);
    await pressRowText(page, storyContext.parameters?.pressRowText);
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
        // Only transitions: infinite animations such as spinners never finish.
        const transitions = document
          .getAnimations()
          .filter((animation) => animation instanceof CSSTransition);
        await Promise.allSettled(transitions.map((transition) => transition.finished));
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
            `- [${theme}] [${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) — ${violation.helpUrl}`,
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
