# @vendure-io/ui

React component library for Vendure. Built on shadcn/ui (base-vega style) + Tailwind v4.

## IMPORTANT: this package is the source of truth

Components in `src/components/atoms/` were originally generated from the shadcn registry (base-vega style), but **this package owns them now**. shadcn is an upstream we cherry-pick from, not something we sync with. When a file differs from the registry, treat the difference as an intentional design decision unless git history says otherwise.

The shadcn CLI is used for exactly two things:

```sh
bunx shadcn@latest add <component>    # scaffold a NEW component into src/components/atoms/
bunx shadcn@latest diff <component>   # review what changed upstream, for cherry-picking
```

Config: `components.json` (base-vega style, lucide icons, RSC-compatible).

### Pulling upstream changes

Never run `add --overwrite` on an existing component — it discards our design decisions. Instead:

1. Run `bunx shadcn@latest diff <component>` to see what changed upstream.
2. Judge each hunk: bug fixes and a11y improvements are usually worth taking; styling that conflicts with our system is not.
3. Apply the changes you want surgically, leave the rest as is.

### Known system-wide divergences from upstream

- **Flat look**: `shadow-xs`/`shadow-2xs` classes are removed from primitives (buttons, inputs, cards, toggles, …). Overlay shadows (`shadow-md` and up) are kept. Don't reintroduce xs-tier shadows when cherry-picking.
- **Dead Radix selectors removed**: the base-vega registry still carries leftover Radix-era `data-[state=...]` selectors in places; Base UI never emits `data-state` (it emits `data-open`, `data-pressed`, etc.), so we've deleted them. Don't reintroduce.
- **Popup sizing**: select/dropdown popups size to their content instead of being pinned to the trigger width (`min-w-(--anchor-width)` / no anchor width, rather than `w-(--anchor-width)`).

Comment non-obvious decisions in component files like you would anywhere else — no special markers needed; the whole file is ours.

## Structure

The two tiers split by **provenance**, not composition depth (per an internally-tracked architectural decision on component taxonomy):

- `src/components/atoms/` — shadcn-CLI-managed primitives (button, dialog, etc.); an upstream exists to `diff` against
- `src/components/molecules/` — hand-written composed components with no shadcn upstream. Multi-file molecules get a subfolder (`molecules/data-table/*`) — wildcard exports match across `/`
- `src/lib/` — utilities (cn, pure functions)
- `src/hooks/` — shared React hooks, regardless of which tier consumes them

There is deliberately no `organisms/` — composition depth is not a boundary here. `sidebar.tsx` stays an atom despite being huge (CLI provenance); the DataTable family is molecules.

## Exports (wildcard, no wrapper barrels)

- `./components/atoms/*` → individual atoms
- `./components/molecules/*` → individual molecules
- `./components/ui/*` → **deprecated** alias for atoms, `./components/custom/*` → **deprecated** alias for molecules (same files, no shims; removed at ui v2)
- `./lib/*` → utilities
- `./hooks/*` → hooks

The "no barrels" rule applies to **wrapper components**: do not aggregate
`components/atoms/*` or `components/molecules/*` behind an index file. The single
exception is `src/lib/base-ui.ts`, which re-exports `@base-ui/react` primitive
namespaces so consumers can override wrapper subcomponents without taking a
direct dependency on `@base-ui/react`. Keep that file pure named re-exports
(no value transforms), so bundlers can tree-shake unused primitives.

## Stack

- React 19+, Tailwind v4, lucide-react icons
- Base UI (@base-ui/react), CVA, tailwind-merge, motion, vaul, sonner, recharts
- Tokens from `@vendure-io/design-tokens` (workspace dep)

## Rules

- New generic primitives → use shadcn CLI, goes in `atoms/`
- New Vendure-specific components → hand-write in `molecules/`
- **Graduation/layer rule**: a component graduates from a consumer into the DS when a second consumer needs it. The layer question is mechanical — exists in the shadcn registry upstream? → scaffold via CLI into `atoms/` (the donor informs the cherry-picking); otherwise → `molecules/`, based on the chosen donor. No composition-depth debate.
- **Formatters (JSX-or-lib rule)**: renders JSX → `molecules/` (a `<Money>` component is a molecule); pure function → `lib/` (a `formatCurrency()` helper is lib). Same test for anything ambiguous: "does it return JSX?"
- No barrel files. Wildcard exports only.
- Peer deps: react, react-dom. next/next-themes/react-hook-form are optional peers.

## Guidance pages (molecules)

Every molecule with a decision layer ships a dedicated Guidance story page alongside its regular stories. "Decision layer" means there is a real choice to rule on: this component vs a sibling (Chip vs Badge vs StatusBadge), a usage rule (one primary action per view), or semantics (relative vs absolute time). The PR template enforces this; a molecule without one needs a stated reason (e.g. FormatProvider is infrastructure, PasswordInput has no sibling choice).

Conventions (match the existing pages, e.g. `stories/status-badge-guidance.stories.tsx`):

- File: `stories/<name>-guidance.stories.tsx`, meta is title-only: `Molecules/<Name>/Guidance`.
- File doc comment starts with "Guidance, not props." — the page rules on decisions (when to use it, when not to, do/don'ts); the regular stories page documents the API.
- Content is data-driven const arrays rendered through local `Section`/`Example` (do/don't) helpers copied from an existing guidance page — duplicated per file, no shared import.
- Stories use numbered display names (`name: '1 · …'`), render live DS components in realistic commerce scenarios, and cross-reference sibling guidance pages in prose.
- One page can cover a family when the decision is shared (StateViews covers Empty/Error/Loading; DateTime covers RelativeTime).
- State words only on StatusBadge; color follows accent rationing; terminology follows `CONTEXT.md`.
