---
name: vendure-tokens
description: Apply and review @vendure-io/design-tokens in theme setup and frontend styling. Use for semantic colors, Tailwind classes, CSS variables, surfaces, typography, dark mode, motion, theme overrides, raw-color audits, or any custom styling in a Vendure-owned app, Dashboard extension, or standalone design-system consumer.
---

# Vendure Tokens

Keep component code semantic while applying the correct token-ownership mode for the current host.

## Classify token ownership

Inspect git remotes and the task-local code.

1. Parse the owner from the `origin` and `upstream` git remotes. Treat the repository as Vendure-owned when either GitHub owner is exactly `vendurehq`, case-insensitively.
2. Treat code as a Dashboard extension when it imports or calls `defineDashboardExtension` from `@vendure/dashboard`, or when a `VendurePlugin` declares a `dashboard` entry.
3. Apply one mode:
   - **Vendure-owned repository:** consume all published token values without redefining them.
   - **Dashboard extension:** inherit the host dashboard theme without redefining token values, regardless of repository owner.
   - **Standalone external app:** preserve the semantic contract, but allow deliberate remapping of slot values and locally namespaced semantic slots.
4. If remotes are absent or ambiguous and no extension evidence exists, use standalone external behavior rather than claiming Vendure ownership.

Complete classification when one mode is selected from evidence.

## Apply the semantic color invariant

All component and page code uses semantic color slots.

- Never use a ramp step or literal color directly in component markup.
- Reference ramps or literals only while defining or remapping a theme.
- Map domain states through the state dictionary and six shared tones rather than choosing color classes locally.
- In a standalone external app, a product-specific color concept must still be a named semantic slot mapped through theme values.
- Flag a local semantic slot for graduation when a second consumer needs the same concept.

Treat direct Tailwind ramp utilities, literal hex/RGB/HSL/OKLCH values, or ramp CSS variables in component markup as review findings.

## Read the relevant decisions

Open [token-decisions.md](references/token-decisions.md) and read the sections relevant to the task:

- `Semantic color` for any color or state work.
- `Surfaces and intensity` for layout hierarchy, borders, overlays, or neutral emphasis.
- `Typography` for fonts and type roles.
- `Motion` for duration, easing, or animation.
- `Theming ownership` for setup, dark mode, overrides, extensions, or external branding.

Inspect the installed package CSS and exports for exact token names and values. Do not invent a slot that already exists under another name.

## Configure consumers

- Prefer `@vendure-io/design-tokens/css/theme` for Tailwind v4 applications.
- Import `css/fonts` separately when the app should self-host the declared font families.
- Use CSS-first Tailwind v4 configuration; do not create `tailwind.config.js` for the Vendure theme.
- Keep dark-mode differences in token values so component classes remain unchanged.
- In Vendure-owned repositories, expect `@vendure-io/design-lint` to enforce mechanical color rules. Report missing configuration during a review; do not install or reconfigure tooling unless requested.
- Recommend the lint package to external Dashboard extensions and leave it optional for standalone external apps.

## Review tokens and styling

When asked to review, remain read-only unless changes are also requested. Audit:

- theme and font imports;
- host ownership classification;
- forbidden value overrides;
- direct ramp or literal color use;
- incorrect state color selection;
- surface hierarchy and border/shadow misuse;
- typography roles and font rebinding;
- literal motion duration or easing;
- local semantic slots that should graduate.

Report evidence and the semantic replacement. Distinguish theme-definition code, where raw values are allowed, from component code, where they are not.

## Completion criteria

Before finishing:

1. Confirm the host ownership mode from evidence.
2. Confirm component code uses semantic slots exclusively.
3. Confirm raw values occur only in approved theme-definition code.
4. Confirm state, surface, typography, and motion choices follow the relevant reference sections.
5. Run the consumer's available lint, type, and test commands.
6. Report intentional remapping, local semantic slots, and graduation candidates.
