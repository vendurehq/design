# @vendure-io/ui

React component library for Vendure. Built on shadcn/ui (base-vega style) + Tailwind v4.

## IMPORTANT: this package is the source of truth

Components in `src/components/ui/` were originally generated from the shadcn registry (base-vega style), but **this package owns them now**. shadcn is an upstream we cherry-pick from, not something we sync with. When a file differs from the registry, treat the difference as an intentional design decision unless git history says otherwise.

The shadcn CLI is used for exactly two things:

```sh
bunx shadcn@latest add <component>    # scaffold a NEW component into src/components/ui/
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

- `src/components/ui/` — shadcn-derived primitives (button, dialog, etc.)
- `src/components/custom/` — hand-built Vendure-specific components (no shadcn counterpart)
- `src/lib/` — utilities (cn, etc.)
- `src/hooks/` — shared React hooks

## Exports (wildcard, no wrapper barrels)

- `./components/ui/*` → individual ui components
- `./components/custom/*` → individual custom components
- `./lib/*` → utilities
- `./hooks/*` → hooks

The "no barrels" rule applies to **wrapper components**: do not aggregate
`components/ui/*` or `components/custom/*` behind an index file. The single
exception is `src/lib/base-ui.ts`, which re-exports `@base-ui/react` primitive
namespaces so consumers can override wrapper subcomponents without taking a
direct dependency on `@base-ui/react`. Keep that file pure named re-exports
(no value transforms), so bundlers can tree-shake unused primitives.

## Stack

- React 19+, Tailwind v4, lucide-react icons
- Base UI (@base-ui/react), CVA, tailwind-merge, motion, vaul, sonner, recharts
- Tokens from `@vendure-io/design-tokens` (workspace dep)

## Rules

- New generic primitives → use shadcn CLI, goes in `ui/`
- New Vendure-specific components → hand-write in `custom/`
- No barrel files. Wildcard exports only.
- Peer deps: react, react-dom. next/next-themes/react-hook-form are optional peers.
