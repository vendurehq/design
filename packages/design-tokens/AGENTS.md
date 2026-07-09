# @vendure-io/design-tokens

Design tokens for the Vendure design system. Consumed by `@vendure-io/ui` and downstream apps.

## Structure

- `src/tokens/` — TS token definitions (colors, typography, radii, shadows, motion)
- `src/css/variables.css` — CSS custom properties generated from tokens
- `src/css/theme.css` — Tailwind v4 theme config, imports variables.css + tw-animate-css

## Exports

- `.` → TS tokens (`src/tokens/index.ts`)
- `./css/variables` → raw CSS variables
- `./css/theme` → full theme CSS (use this in apps)
- `./css/fonts` → self-hosted `@font-face` rules (Fontsource) for the three font families; theme.css only declares the `--font-*` tokens, it doesn't load font files — import this alongside it

## Rules

- Tokens are the single source of truth. CSS variables must stay in sync with TS values.
- Tailwind v4 — no `tailwind.config.js`. Theme configured via `@theme` in CSS.
- Don't add component-level styles here. Tokens only.
