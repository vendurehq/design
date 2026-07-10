# Vendure Design System

Monorepo for `@vendure-io/design-tokens`, `@vendure-io/ui`, and `@vendure-io/design-lint` — the design system consumed by all Vendure surfaces (OSS/Platform dashboard, Cloud, ecosystem portals).

## Context

- [CONTEXT.md](./CONTEXT.md) — the project's ubiquitous language (glossary). Use these terms; challenge changes against it.
- Architectural decisions are tracked internally by the Vendure team, not in-repo.
- [packages/ui/AGENTS.md](./packages/ui/AGENTS.md) — shadcn CLI workflow, component placement (`ui/` vs `custom/`), export rules.
- [packages/design-tokens/AGENTS.md](./packages/design-tokens/AGENTS.md) — token pipeline rules.
- [packages/design-lint/AGENTS.md](./packages/design-lint/AGENTS.md) — equivalent ESLint/Biome enforcement rules.
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

# Release @vendure-io/design-lint
gh release create design-lint/v1.2.3 --title "@vendure-io/design-lint v1.2.3" --generate-notes

# Prerelease @vendure-io/ui to the beta npm dist-tag
gh release create ui/v1.3.0-beta.0 --title "@vendure-io/ui v1.3.0-beta.0" --generate-notes --prerelease

# Prerelease @vendure-io/design-tokens to the beta npm dist-tag
gh release create design-tokens/v1.3.0-beta.0 --title "@vendure-io/design-tokens v1.3.0-beta.0" --generate-notes --prerelease

# Prerelease @vendure-io/design-lint to the beta npm dist-tag
gh release create design-lint/v1.3.0-beta.0 --title "@vendure-io/design-lint v1.3.0-beta.0" --generate-notes --prerelease
```

The CI workflow handles version bumping in `package.json`, publishing to npm, and committing the version bump back to `main`. Stable releases publish to npm's `latest` dist-tag; prereleases publish to the first semver prerelease identifier (`beta` for `1.3.0-beta.0`, `rc` for `1.3.0-rc.0`).
