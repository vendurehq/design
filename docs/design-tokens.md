# Design Tokens

`@vendure-io/design-tokens` is the single source of truth for the Vendure design system's visual language: colors, typography, spacing, shadows, and motion.

## Exports

The package provides three entry points:

### `@vendure-io/design-tokens/css/theme` (recommended)

The full Tailwind v4 theme. This is what you should import in your app's CSS. It includes:

- Tailwind CSS v4
- `tw-animate-css` animations
- `shadcn/tailwind.css` base styles
- All CSS custom properties (variables)
- Tailwind theme mapping (`@theme inline`)
- The `@tailwindcss/typography` plugin

```css
@import "@vendure-io/design-tokens/css/theme";
```

### `@vendure-io/design-tokens/css/variables`

Raw CSS custom properties only, without Tailwind or any theme config. Use this if you need the design tokens in a non-Tailwind context.

```css
@import "@vendure-io/design-tokens/css/variables";
```

### `@vendure-io/design-tokens` (TypeScript)

Token values as TypeScript objects for programmatic access:

```ts
import { colors, typography, radii, shadows, motion } from "@vendure-io/design-tokens";
```

## Available Tokens

### Colors

All colors use the OKLCH color space for perceptual uniformity.

**Semantic colors** (light/dark mode aware via CSS variables):

- `background`, `foreground` — Page background and text
- `card`, `card-foreground` — Card surfaces
- `popover`, `popover-foreground` — Popover/dropdown surfaces
- `primary`, `primary-foreground` — Primary actions
- `secondary`, `secondary-foreground` — Secondary actions
- `muted`, `muted-foreground` — Muted/disabled elements
- `accent`, `accent-foreground` — Accent highlights
- `destructive`, `destructive-foreground` — Destructive/error states
- `success`, `success-foreground` — Success states
- `border`, `input`, `ring` — Borders, inputs, focus rings
- `chart-1` through `chart-5` — Data visualization
- `sidebar-*` — Sidebar-specific variants

### Typography

- **Font families**: `--font-sans` (Inter), `--font-heading` (Public Sans), `--font-body` (Inter), `--font-mono` (Geist Mono)

### Radii

- `--radius` — Base radius value
- Scaled variants: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

### Shadows & Motion

Available via the TypeScript export (`shadows`, `motion`) for programmatic use, including easing curves and duration values.

## Dark Mode

The design tokens use CSS custom properties with two scopes:

- `:root` — Light mode values (default)
- `.dark` — Dark mode overrides

When the `dark` class is present on an ancestor element (typically `<html>`), all token values automatically switch to their dark variants. No additional configuration needed — just toggle the class.

The theme uses `@custom-variant dark (&:is(.dark *))` so Tailwind's `dark:` modifier works with class-based dark mode.

## Using Tokens in Tailwind

Once you import the theme CSS, all tokens are available as Tailwind utilities:

```html
<div class="bg-background text-foreground">
  <button class="bg-primary text-primary-foreground rounded-lg">
    Click me
  </button>
</div>
```

## Using Tokens in TypeScript

```ts
import { colors, motion } from "@vendure-io/design-tokens";

// Access token values programmatically
const primaryColor = colors.light.primary;
const easing = motion.easeOut;
```
