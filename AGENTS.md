# Vendure Design System

Monorepo for `@vendure-io/design-tokens` and `@vendure-io/ui` — the design system consumed by all Vendure surfaces (OSS/Platform dashboard, Cloud, ecosystem portals).

## Context

- [CONTEXT.md](./CONTEXT.md) — the project's ubiquitous language (glossary). Use these terms; challenge changes against it.
- Architectural decisions are tracked internally by the Vendure team, not in-repo.
- [packages/ui/AGENTS.md](./packages/ui/AGENTS.md) — shadcn CLI workflow, component placement (`ui/` vs `custom/`), export rules.
- [packages/design-tokens/AGENTS.md](./packages/design-tokens/AGENTS.md) — token pipeline rules.
- `docs/` — consumer-facing guides (getting started, components, tokens, releasing).

## Conventions

- Bun everywhere: `bun install`, `bun test`, `bun run <script>`, `bunx` — never npm, pnpm, node, or npx.
- Tailwind v4, CSS-first — there is no `tailwind.config.js` anywhere; theming lives in the tokens package's `@theme` CSS.

## Gotchas

- `@vendure-io/ui` ships raw `.tsx` source with no build step. Every merged change is consumer-facing on the next publish, and consumers must transpile the package — breaking changes need coordinated version bumps in the consuming repos.
- The two packages version independently; `workspace:*` deps resolve to real versions on publish.

## Releasing Packages

Create releases via GitHub Releases using `gh release create`, not by pushing tags directly. The release workflows trigger on tags matching `<package>/v*`.

```sh
# Release @vendure-io/ui
gh release create ui/v1.2.3 --title "@vendure-io/ui v1.2.3" --generate-notes

# Release @vendure-io/design-tokens
gh release create design-tokens/v1.2.3 --title "@vendure-io/design-tokens v1.2.3" --generate-notes
```

The CI workflow handles version bumping in `package.json`, publishing to npm, and committing the version bump back to `main`.
