# Testing

Every merged change to `@vendure-io/ui` is consumer-facing on the next publish, so CI runs two Storybook-driven gates in addition to unit tests and the build: an accessibility smoke test and a visual regression check. Both live in `apps/storybook`.

## Accessibility gate

Every story is visited with [`@storybook/test-runner`](https://github.com/storybookjs/test-runner) and scanned with [`axe-playwright`](https://github.com/abhinaba-ghosh/axe-playwright). The check reports on `serious` or `critical` axe violations; `minor`/`moderate` findings are logged but never counted. Configuration lives in `apps/storybook/.storybook/test-runner.ts`.

**Currently advisory.** The existing story suite carries pre-existing `serious`/`critical` violations — mostly isolated stories that render a bare control without a surrounding labelled form (unlabeled inputs/checkboxes/switches, icon-only buttons without an accessible name). Until that debt is triaged and cleared, the CI step runs with `continue-on-error: true`: violations show up in the job log and as a step annotation, but they don't fail the build. Remove `continue-on-error` from the "Storybook a11y smoke test" step in `.github/workflows/ci.yml` to make the gate enforcing once the suite is clean — fix the underlying markup (or, for genuine false positives only, opt the story out as below) rather than lowering the bar.

### Run locally

```bash
cd apps/storybook
bun run build
bunx http-server storybook-static --port 6006 &
bun run test-storybook -- --url http://127.0.0.1:6006 --ci
```

### Opting a story out

Set `parameters.a11y.skip` on the story or its meta:

```tsx
export const Default: Story = {
  parameters: {
    a11y: { skip: true },
  },
};
```

Only do this for a documented, unfixable false positive (e.g. a third-party icon library markup quirk). Skipping a story hides real regressions from CI, so leave a comment explaining why next to the parameter, and prefer fixing the underlying markup over skipping.

## Visual regression gate

A Playwright spec (`apps/storybook/visual/visual.spec.ts`) reads the built `storybook-static/index.json`, screenshots every story's `#storybook-root` at a fixed 1280x800 viewport with animations and reduced motion forced off, and compares against baselines committed under `apps/storybook/visual/__screenshots__/linux/`.

Baselines are Linux-only (font rendering differs across OSes) and are captured against whatever CI runs on (`ubuntu-latest`). The spec skips itself with a clear message on any other platform.

### Run locally

Baselines were captured on Linux CI, so a local macOS/Windows run will report diffs on font rendering alone. Use it to review new/changed stories, not to reproduce a CI failure byte-for-byte, unless you're running inside a Linux container.

```bash
cd apps/storybook
bun run build
bun run test:visual
```

### Seeding or refreshing baselines

The first time a story is added (or intentionally changed visually), its baseline won't exist yet. CI detects an empty/missing `apps/storybook/visual/__screenshots__/linux/` directory and does not fail the build in that case; it uploads the generated screenshots as the `visual-regression-output` workflow artifact instead. To adopt them:

1. Download the `visual-regression-output` artifact from the CI run (or run the steps below in a Linux container/VM).
2. Copy the contents into `apps/storybook/visual/__screenshots__/linux/`.
3. Commit the new/updated PNGs.

Once baselines exist for a story, a real visual diff fails the build as a normal test failure (no more `continue-on-error`). To intentionally update baselines after a deliberate visual change, run on Linux:

```bash
cd apps/storybook
bun run build
bun run test:visual:update
```

Then commit the updated files under `apps/storybook/visual/__screenshots__/linux/`.

## CI

Both gates run as steps in the `ci` job in `.github/workflows/ci.yml`, after the existing "Build Storybook" step, using the same static build the job already produces. Neither requires secrets.
