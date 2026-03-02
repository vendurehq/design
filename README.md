# Vendure Design System

Monorepo for the Vendure design system — tokens, UI components, and documentation.

Built on [shadcn/ui](https://ui.shadcn.com/) (base-vega style), [Tailwind CSS v4](https://tailwindcss.com/), and [Base UI](https://base-ui.com/).

## Packages

| Package | Description |
|---------|-------------|
| [`@vendure-io/design-tokens`](./packages/design-tokens) | shadcn-based design tokens and Tailwind v4 CSS theme |
| [`@vendure-io/ui`](./packages/ui) | React components built on shadcn/ui, Base UI, and Tailwind v4 |

## Apps

| App | Description |
|-----|-------------|
| [`storybook`](./apps/storybook) | Component documentation and playground (Storybook 10) |

## Development

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
```

## Releasing

Releases are triggered by creating a [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github). Tag your release with a version (e.g. `v1.0.0`) and the CI pipeline will update package versions and publish to npm via OIDC provenance.
