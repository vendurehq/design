# @vendure-io/ui

React component library for Vendure. Built on shadcn/ui (base-vega style) + Tailwind v4.

## IMPORTANT: shadcn CLI manages components

Files in `src/components/ui/` are **generated/updated by the shadcn CLI**. Do NOT manually create or heavily restructure these files — use the CLI:

```sh
bunx shadcn@latest add <component>    # add new component
bunx shadcn@latest diff <component>   # check for upstream changes
```

Config: `components.json` (base-vega style, lucide icons, RSC-compatible).

Manual edits to `src/components/ui/` are fine for customization, but structure and base patterns come from shadcn.

## Structure

- `src/components/ui/` — shadcn-managed primitives (button, dialog, etc.)
- `src/components/custom/` — hand-built Vendure-specific components (NOT shadcn-managed)
- `src/lib/` — utilities (cn, etc.)
- `src/hooks/` — shared React hooks

## Exports (wildcard, no barrel files)

- `./components/ui/*` → individual ui components
- `./components/custom/*` → individual custom components
- `./lib/*` → utilities
- `./hooks/*` → hooks

## Stack

- React 19+, Tailwind v4, lucide-react icons
- Base UI (@base-ui/react), CVA, tailwind-merge, motion, vaul, sonner, recharts
- Tokens from `@vendure-io/design-tokens` (workspace dep)

## Rules

- New generic primitives → use shadcn CLI, goes in `ui/`
- New Vendure-specific components → hand-write in `custom/`
- No barrel files. Wildcard exports only.
- Peer deps: react, react-dom. next/next-themes/react-hook-form are optional peers.
