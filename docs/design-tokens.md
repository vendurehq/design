# Design Tokens

`@vendure-io/design-tokens` is the single source of truth for the Vendure design system's visual language: colors, typography, spacing, shadows, and motion.

## Exports

The package provides three entry points:

### `@vendure-io/design-tokens/css/theme` (recommended)

The full Tailwind v4 theme. This is what you should import in your app's CSS. It includes:

- Tailwind CSS v4
- `tw-animate-css` animations
- All CSS custom properties (variables)
- Tailwind theme mapping (`@theme inline`)

```css
@import "@vendure-io/design-tokens/css/theme";
```

If you're using **shadcn/ui** components, add the shadcn Tailwind import after the theme:

```css
@import "@vendure-io/design-tokens/css/theme";
@import "shadcn/tailwind.css";
```

If you need the **typography plugin** (`prose` classes), add it separately:

```css
@import "@vendure-io/design-tokens/css/theme";
@plugin "@tailwindcss/typography";
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
- `surface`, `surface-raised`, `overlay` — The elevation ramp: content plane, lifted elements, floating layer. Contrast between tiers separates content; borders divide siblings within a tier
- `inset` — Sunken wells (tab tracks, skeletons) that read below their host surface
- `card`, `card-foreground` — Card surfaces (alias of `surface`)
- `popover`, `popover-foreground` — Popover/dropdown surfaces (alias of `overlay`)
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
- **Type scale**: `--text-xs` through `--text-5xl` — Tailwind `text-*` utilities
- **Font weights**: `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold` — Tailwind `font-*` utilities
- **Letter spacing**: `--tracking-tighter`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide` — Tailwind `tracking-*` utilities

The theme deliberately does not restyle raw `h1`–`h6` elements. Apply the heading font with the `font-heading` utility (Public Sans) — don't rebind `--font-heading` in app CSS. The `@vendure-io/ui` title components (`DialogTitle`, `AlertDialogTitle`, `SheetTitle`, `DrawerTitle`, `PopoverTitle`) apply it out of the box.

### Radii

- `--radius` — Base radius value
- Scaled variants: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

### Shadows

- `--shadow-2xs` through `--shadow-2xl` — Tailwind `shadow-*` utilities

### Motion

- **Easing**: `--ease-default`, `--ease-in`, `--ease-out`, `--ease-in-out`, `--ease-spring` — Tailwind `ease-*` utilities
- **Duration**: `--transition-duration-instant`, `-fast`, `-normal`, `-slow`, `-slower` — Tailwind `duration-*` utilities (`duration-fast`, `duration-slow`, …)

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
