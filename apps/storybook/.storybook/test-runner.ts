import type { Page } from '@playwright/test';
import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { getViolations, injectAxe } from 'axe-playwright';

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

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);
    await pressText(page, storyContext.parameters?.pressText);
    await pressRowText(page, storyContext.parameters?.pressRowText);

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
