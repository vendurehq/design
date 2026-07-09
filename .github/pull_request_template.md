<!-- Keep this concise. Delete sections that do not apply. -->

## What

<!-- What changes, and why. Link the Linear issue (e.g. OSS-000). -->

## Checklist

- [ ] `bun run lint`, `bun run check-types`, and `bun test` pass
- [ ] Consumer-facing changes note the required version bump (this package ships raw source)

## Usage guidance (molecules)

Adding or changing a molecule? A component is not done until Storybook says when to reach for it.

- [ ] The molecule has a dedicated Guidance page (`stories/<name>-guidance.stories.tsx`, `Molecules/<Name>/Guidance`): when to use it, when not to, and how to choose against its siblings (decisions, not a prop table), or the PR states why there is no decision layer (see `packages/ui/AGENTS.md` → Guidance pages)
- [ ] Any state semantics follow the state dictionary (Molecules / StatusBadge / Guidance)
- [ ] Color follows accent rationing (Foundations / Accent Rationing): neutral by default, tone for state, brand only for an identity moment

<!-- Not touching a molecule? Delete this section. -->
