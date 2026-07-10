# @vendure-io/design-lint

Mechanical enforcement for consumer-facing Vendure design-system rules.

## Rules

- Keep ESLint and Biome diagnostics behaviorally equivalent against `test/cases.json`.
- Rules report only mechanically provable violations; judgment remains in the agent skills.
- Do not rewrite colors automatically. Choosing the correct semantic replacement requires context.
- Theme-definition files are excluded by consumer configuration, not hidden inside rule heuristics.
- Add a shared fixture before changing either implementation.
