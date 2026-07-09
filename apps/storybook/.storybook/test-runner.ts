import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import { getViolations, injectAxe } from 'axe-playwright';

// Violations at these impact levels fail the build. `minor`/`moderate` findings
// are logged but non-blocking, matching axe-core's own severity scale.
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    const storyContext = await getStoryContext(page, context);

    // Opt a story out via `parameters.a11y.skip` in its meta or story export.
    // See docs/testing.md for when this is an acceptable escape hatch.
    if (storyContext.parameters?.a11y?.skip) {
      return;
    }

    const violations = await getViolations(page, '#storybook-root', storyContext.parameters?.a11y?.config);
    const blocking = violations.filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ''));

    if (blocking.length === 0) {
      return;
    }

    const details = blocking
      .map(
        (violation) =>
          `- [${violation.impact}] ${violation.id}: ${violation.help} (${violation.nodes.length} node(s)) — ${violation.helpUrl}`,
      )
      .join('\n');

    throw new Error(`Accessibility violations in "${context.title} > ${context.name}":\n${details}`);
  },
};

export default config;
