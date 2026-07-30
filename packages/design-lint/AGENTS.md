# @vendure-io/design-lint

Mechanical enforcement for consumer-facing Vendure design-system rules.

## Rules

- Keep ESLint and Biome diagnostics behaviorally equivalent against `test/cases.json`.
- The `biome/*.grit` files are generated — never hand-edit them. Edit the shared parts in `eslint/pattern-parts.js` (or `scripts/generate-grit.ts`) and run `bun run generate`; `bun run check-freshness` fails CI when the `.grit` files drift.
- Rules report only mechanically provable violations; judgment remains in the agent skills.
- Do not rewrite colors automatically. Choosing the correct semantic replacement requires context.
- Theme-definition files are excluded by consumer configuration, not hidden inside rule heuristics.
- Add a shared fixture before changing either implementation.
