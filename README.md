<p align="center">
  <a href="https://vendure.io">
    <img alt="Vendure logo" height="60" width="auto" src="https://assets.vendure.io/brand/logo-icon-vendure-blue.svg">
  </a>
</p>

<h1 align="center">
  Vendure Design System
</h1>
<h3 align="center">
  The design system powering every Vendure surface.
</h3>
<h4 align="center">
  Design tokens and React components built on shadcn/ui, Base UI, and Tailwind CSS v4 — consumed by the Vendure dashboard, Cloud, and ecosystem portals.
</h4>
<h4 align="center">
  <a href="https://docs.vendure.io">Documentation</a> |
  <a href="https://vendure.io">Website</a>
</h4>

<p align="center">
  <a href="https://www.npmjs.com/package/@vendure-io/ui">
    <img src="https://img.shields.io/npm/v/@vendure-io/ui.svg?label=%40vendure-io%2Fui" alt="@vendure-io/ui on npm" />
  </a>
  <a href="https://www.npmjs.com/package/@vendure-io/design-tokens">
    <img src="https://img.shields.io/npm/v/@vendure-io/design-tokens.svg?label=%40vendure-io%2Fdesign-tokens" alt="@vendure-io/design-tokens on npm" />
  </a>
  <a href="./LICENSE.md">
    <img src="https://img.shields.io/badge/license-see%20LICENSE.md-blue.svg" alt="License" />
  </a>
</p>

## What's in this repo

This monorepo contains the two published packages of the Vendure design system, plus a Storybook app for component documentation.

| Package | Description |
|---------|-------------|
| [`@vendure-io/design-tokens`](./packages/design-tokens) | Design tokens and Tailwind v4 CSS theme (`@theme`, CSS variables) |
| [`@vendure-io/ui`](./packages/ui) | React components built on [shadcn/ui](https://ui.shadcn.com/) (base-vega style), [Base UI](https://base-ui.com/), and Tailwind v4 |

| App | Description |
|-----|-------------|
| [`storybook`](./apps/storybook) | Component documentation and playground (Storybook 10) |

Note that `@vendure-io/ui` ships raw `.tsx` source with no build step — consumers transpile the package themselves. The two packages version independently.

## Getting started

To consume the design system in your app, follow the [getting started guide](./docs/getting-started.md). Further guides:

- [Design tokens](./docs/design-tokens.md) — token pipeline, CSS theme, usage
- [UI components](./docs/ui-components.md) — component catalog and usage
- [Releasing](./docs/releasing.md) — how packages are versioned and published

## Development

This repo uses [Bun](https://bun.sh) and [Turborepo](https://turborepo.com).

```bash
# Install dependencies
bun install

# Run Storybook
bun run storybook

# Type-check all packages
bun run check-types

# Lint
bun run lint

# Format
bun run format

# Run tests
bun run test
```

## Releasing

Packages are released independently by creating a [GitHub Release](https://github.com/vendurehq/design/releases) with a per-package tag. The CI workflow bumps the version in `package.json`, publishes to npm with provenance, and commits the bump back to `main`.

| Package | Tag format | Example |
|---------|-----------|---------|
| `@vendure-io/design-tokens` | `design-tokens/v{version}` | `design-tokens/v1.2.0` |
| `@vendure-io/ui` | `ui/v{version}` | `ui/v1.3.0` |

See [docs/releasing.md](./docs/releasing.md) for the full workflow, including release ordering when both packages change.

## License

See [LICENSE.md](./LICENSE.md).
