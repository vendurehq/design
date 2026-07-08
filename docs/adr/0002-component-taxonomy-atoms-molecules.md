# ADR 0002: Component taxonomy — atoms & molecules, split by provenance

- **Status**: Accepted (spike output, [OSS-621](https://linear.app/vendure/issue/OSS-621/spike-atomic-design-structure-for-vendure-ioui); implemented in [OSS-628](https://linear.app/vendure/issue/OSS-628/restructure-vendure-ioui-to-atoms-molecules-per-adr-0002))
- **Date**: 2026-07-08

## Context

`@vendure-io/ui` today is plain shadcn: `components/ui/*` (58 CLI-managed files) + `components/custom/*` (2 hand-written components). With the molecule tier about to ship (StatusBadge, EmptyState family, PageHeader, Chip, StatCard, DescriptionList, ConfirmDialog, the DataTable primitives), "custom" stops describing anything — every new component needs an obvious home and consumers an obvious import path.

Two constraints dominate:

1. **Import paths are public API.** The package ships raw `.tsx` source; ~7,850 imports exist across the three consumers (vendure 63, vendure-cloud 39, vendure-io ~7,790), and **98.7% of them hit `components/ui/*`** — any layout change must keep that specifier resolving until the next major.
2. **The shadcn CLI needs a stable target.** `components.json#aliases.ui` decides where `add`/`diff` write; it resolves through the tsconfig path mapping (`@vendure-io/ui/*` → `./src/*`), so the target directory is configurable.

### What the research says

- Brad Frost has explicitly deprecated the labels, not the model: *"The specific labels (atoms, molecules, organisms, templates, and pages) have never been the point, and we don't really use them in our work"* ([qt.io](https://www.qt.io/software-insights/atomic-design-systems-why-the-labels-dont-matter); the book itself says the taxonomy is negotiable, [ch. 2](https://atomicdesign.bradfrost.com/chapter-2/)).
- **Major production design systems don't encode composition tiers in import paths** — Carbon, Polaris, Atlaskit, Primer, SLDS, Chakra, Mantine all export flat; tiers survive only as docs navigation. The splits that do make it into package structure are objective ones: styled/unstyled (Radix, Twilio Paste) and stable/experimental (Primer).
- The documented failure mode of literal tiers is the molecule-vs-organism debate (Nathan Curtis: *"It's subjective. It's annoying to constantly debate. It creates confusion in finding things"*, [eightshapes](https://eightshapes.com/articles/on-classification-in-design-systems/)) and taxonomy churn: a component's composition depth changes over its life, and in a source-shipping package reclassification is a breaking import-path change.
- The shadcn ecosystem's native split is **provenance, not composition**: CLI-managed vs hand-written (OpenStatus's `ui`/`blocks`/`custom` is the closest precedent). The tier boundary that pays for itself is the "the CLI may overwrite this" boundary.

We take the warning seriously but differently: the failure modes attach to *composition-depth* tiers, not to tier directories per se. Our glossary (CONTEXT.md) already defines Atom and Molecule **behaviorally** — Atom = "a shadcn-CLI-managed primitive, kept updatable from upstream", Molecule = "a hand-written composed component the design system ships" — which makes tier assignment mechanical. With that fixed, putting the ubiquitous language literally into the directory names costs only a rename, and the planned ui v2 absorbs the breaking part.

## Decision 1: two tiers, split by provenance, named literally

| Tier | Directory | Definition (mechanical, no judgment call) |
| --- | --- | --- |
| Atom | `src/components/atoms/` | Scaffolded from the shadcn registry via the CLI; upstream exists to `diff` against |
| Molecule | `src/components/molecules/` | Hand-written; no shadcn upstream. Everything from Chip to the DataTable primitives |

- `components/ui/` → `components/atoms/`, `components/custom/` → `components/molecules/`. Code now speaks the glossary.
- **There is deliberately no `organisms/`.** Composition depth is not a boundary in this system; `sidebar.tsx` stays an atom despite being huge (CLI provenance), and the DataTable family is molecules despite being an "organism" in Frost's terms. Multi-file molecules get a subfolder (`molecules/data-table/*`) — wildcard exports match across `/`.
- Templates/pages tiers stay out of the package entirely; page-level guidance belongs in Storybook docs (the Carbon/Polaris/Paste pattern).

## Decision 2: directory & exports layout

```
src/
  components/
    atoms/       → "./components/atoms/*"       (canonical)
    molecules/   → "./components/molecules/*"   (canonical)
  lib/           → "./lib/*"                    (unchanged — cn, base-ui re-exports, pure functions)
  hooks/         → "./hooks/*"                  (unchanged)
```

- **Formatters (Money, RelativeTime, date/money from OSS-617): render JSX → `molecules/`; pure function → `lib/`.** A `<Money>` component is a molecule; a `formatCurrency()` helper is lib. Same rule for anything ambiguous: "does it return JSX?"
- Hooks stay in `hooks/` regardless of which tier consumes them.
- **The no-barrels rule stands** and gets stronger with more files: consumers transpile this package, so a barrel makes their bundlers parse everything it reaches (the Vercel/Atlassian barrel-file findings apply doubly to raw-source packages). Wildcard exports only, per tier.
- The shadcn registry (publishing our own `registry.json`) is out of scope: it changes distribution, not structure, and contradicts the single-source-of-truth versioned-package model. Revisit only if out-of-monorepo teams want copy-paste installs.

## Decision 3: migration — compatibility aliases now, clean break at v2

Node's wildcard `exports` semantics allow left/right patterns to differ, and resolution picks the longest literal prefix (not key order). So the rename ships as a **minor** with zero consumer churn:

```jsonc
"exports": {
  "./components/atoms/*":     "./src/components/atoms/*.tsx",
  "./components/molecules/*": "./src/components/molecules/*.tsx",
  // deprecated aliases — same files, no shims; removed in v2
  "./components/ui/*":        "./src/components/atoms/*.tsx",
  "./components/custom/*":    "./src/components/molecules/*.tsx",
  "./lib/*":   "./src/lib/*.ts",
  "./hooks/*": "./src/hooks/*.ts"
}
```

1. `git mv src/components/ui src/components/atoms` and `git mv src/components/custom src/components/molecules`.
2. Update the 29 intra-package `@vendure-io/ui/components/ui/*` imports (mechanical find-replace; the tsconfig `paths` mapping needs no change).
3. Ship the exports above as a minor — old and new specifiers resolve to the same file (no duplicate modules).
4. At **ui v2** (already planned, OSS-610): delete the two alias keys. Consumers codemod with a one-line find-replace (`@vendure-io/ui/components/ui/` → `@vendure-io/ui/components/atoms/`, same for custom→molecules) as part of the coordinated major bump the raw-source publishing model requires anyway.

## Decision 4: graduation rule

A component graduates from a consumer into the DS when a **second consumer needs it** (existing glossary rule; donor selection per OSS-604). The layer question is mechanical:

- Exists in the shadcn registry upstream? → scaffold via CLI into `atoms/` (it's an atom; the donor informs the cherry-picking).
- Otherwise → `molecules/`, based on the chosen donor.

No committee, no composition-depth debate.

## Decision 5: shadcn CLI coexistence

One config line: `components.json#aliases.ui` becomes `@vendure-io/ui/components/atoms`. The CLI resolves it through the tsconfig path mapping to `src/components/atoms/` and keeps scaffolding/diffing there; it never touches unaliased directories, so `molecules/` is invisible to it. The add-new/diff-cherry-pick policy in `packages/ui/AGENTS.md` stands, and the tier boundary now *is* the update-policy boundary: everything under `atoms/` has an upstream to diff; nothing under `molecules/` does.

## Decision 6: Storybook mirrors the taxonomy at the top level only

Story titles become `Atoms/<Functional group>/<Component>` and `Molecules/<Component>` (today: `UI/<Functional group>/<Component>`). Tier assignment is mechanical (mirrors the directory), and the functional groups (Forms, Overlays, Menus…) keep doing the findability work — the Polaris pattern. Molecules get functional subgroups only when the section grows past ~10 entries.

## Consequences

- `packages/ui`: two directory renames, 29 intra-package import updates, exports block above, `aliases.ui` update, story title updates. No component code changes.
- Consumers: nothing breaks at the minor; at v2 all three repos run the two find-replaces as part of the coordinated major bump. The 26 `components/custom/*` imports can migrate opportunistically before that.
- `packages/ui/AGENTS.md` + root docs: replace `ui/`/`custom/` references with `atoms/`/`molecules/`, document the graduation/layer rule and the JSX-or-lib formatter rule.
- CONTEXT.md: no new terms — the code now matches the language. Add `custom component` to the *Avoid* list under **Molecule** (already implied).
- Molecule-tier issues written before this ADR (e.g. OSS-611 says `components/custom`) target `molecules/` instead.
- TS caveat worth documenting once: wildcard `exports` require consumers on `moduleResolution: bundler | node16 | nodenext` (all three consumers already comply).

## Deliverables

- This ADR.
- Implementation is a small standalone change (renames + exports + `aliases.ui` + stories) that should land **before** the first molecule (OSS-627/OSS-611) so components land in the right place the first time.
