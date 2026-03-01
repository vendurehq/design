# Vendure Design System

Monorepo for the Vendure design system — tokens, components, and documentation.

## Packages

| Package | Description |
|---------|-------------|
| [`@vendure-io/design-tokens`](./packages/design-tokens) | Design tokens (colors, typography, spacing) and CSS theme |
| [`@vendure-io/ui`](./packages/ui) | React components built on Base UI + Tailwind v4 |

## Apps

| App | Description |
|-----|-------------|
| [`storybook`](./apps/storybook) | Component documentation and playground |

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

# Run tests
bun run test
```

## Releasing

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

```bash
# Add a changeset
bun run changeset

# Version packages
bun run version-packages

# Publish
bun run release
```
