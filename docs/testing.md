# Testing

Every merged change to `@vendure-io/ui` is consumer-facing on the next publish, so CI runs two Storybook-driven gates in addition to unit tests and the build: an accessibility smoke test and a visual snapshot capture. The capture is not a gate. Both live in `apps/storybook`.

## Accessibility gate

Every story is visited with [`@storybook/test-runner`](https://github.com/storybookjs/test-runner) and scanned with [`axe-playwright`](https://github.com/abhinaba-ghosh/axe-playwright) two times: once in light mode and once with the `dark` class on `<html>`. Each reported violation names its theme, for example `[dark] [serious] color-contrast`. The check reports on `serious` or `critical` axe violations; `minor`/`moderate` findings are logged but never counted. Configuration lives in `apps/storybook/.storybook/test-runner.ts`.

**Blocking.** A `serious` or `critical` violation in either theme fails the CI job. Fix the markup. Opt a story out (see below) only for a documented false positive.

A story that renders a bare control must still give it an accessible name. Use `aria-label` on icon-only buttons and toggles, and a label connected to every input. Checkbox, RadioGroup and Switch need `aria-label` or `aria-labelledby`, because Base UI puts the `id` on a hidden input.

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

## Visual snapshots (artifact, not a gate)

A Playwright spec (`apps/storybook/visual/visual.spec.ts`) reads the built `storybook-static/index.json` and screenshots every story's `#storybook-root` at a fixed 1280x800 viewport, in light and in dark mode, with animations disabled and `prefers-reduced-motion` set to `reduce`. The images are written to `apps/storybook/visual-output/` as `<story-id>.png` and `<story-id>--dark.png`, and published as the `visual-snapshots` CI artifact for manual review.

There are no committed baselines and no pixel diff — the step never fails the build. Baseline PNGs are deliberately kept out of git (`visual-output/` is gitignored); download the artifact from a CI run to eyeball how stories render, or compare two runs' artifacts by hand.

> Deferred, not dropped: pixel-diff visual regression (committed baselines or a hosted service like Chromatic) can be turned back on later. For now we only capture and store the snapshots.

### Run locally

```bash
cd apps/storybook
bun run build
bun run test:visual
```

The PNGs land in `apps/storybook/visual-output/`. Rendering differs across OSes (fonts, subpixel), so treat local output as a rough preview, not a byte-for-byte match of the CI artifact.

## CI

Both steps run in the `ci` job in `.github/workflows/ci.yml`, after the existing "Build Storybook" step, using the same static build the job already produces. Neither requires secrets.
