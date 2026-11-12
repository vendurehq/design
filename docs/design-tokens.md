# Design Tokens

`@vendure-io/design-tokens` is the single source of truth for the Vendure design system's visual language: colors, typography, radii, shadows, and motion. It has no spacing tokens; use Tailwind's default spacing scale.

## Exports

The package provides four entry points:

### `@vendure-io/design-tokens/css/theme` (recommended)

The full Tailwind v4 theme. This is what you should import in your app's CSS. It includes:

- Tailwind CSS v4
- `tw-animate-css` animations
- All CSS custom properties (variables)
- shadcn Tailwind integration required by `@vendure-io/ui`
- Tailwind theme mapping (`@theme inline`)

```css
@import "@vendure-io/design-tokens/css/theme";
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

### `@vendure-io/design-tokens/css/fonts`

Self-hosted `@font-face` rules (via [Fontsource](https://fontsource.org/)) for Inter, Public Sans, and Geist Mono. The theme uses Inter and Geist Mono; Public Sans stays loaded for apps that set it themselves. `css/theme` only declares the `--font-*` family tokens — it doesn't load the font files, so import this alongside it (or `css/variables`) or the theme falls back to system fonts:

```css
@import "@vendure-io/design-tokens/css/theme";
@import "@vendure-io/design-tokens/css/fonts";
```

It also sets grayscale font smoothing on `html` and `body` (`-webkit-font-smoothing: antialiased`, `-moz-osx-font-smoothing: grayscale`), as the v3 look renders all text. The rule is in the `base` layer, so the `subpixel-antialiased` utility still overrides it. An app that loads the fonts another way sets the rule itself.

### `@vendure-io/design-tokens` (TypeScript)

Token values as TypeScript objects for programmatic access:

```ts
import { brand, fontFamily, radii, shadows, duration } from "@vendure-io/design-tokens";
```

## Available Tokens

### Colors

All colors use the OKLCH color space for perceptual uniformity.

**Ramps** (raw material, the same in both modes): `brand-*`, `neutral-*`, `success-*`, `warning-*`, `destructive-*`, `info-*` (50 to 950), and `viz-1` to `viz-5`. Theme mapping uses ramps. Components use slots.

**Surface steps.** The surface tiers sit between neutral steps (light above `neutral-50`, dark between `neutral-900` and `neutral-800`), so they have a small scale of their own, `surfaces` in `colors.ts`, keyed by lightness × 1000: 1000 (white), 986 and 972 in light mode, 238 and 222 in dark mode. `background`, `surface` and `surface-raised` reference it. It is not emitted as CSS; components use the slots.

**Neutral chroma.** Every semantic neutral, surfaces and text, takes the chroma of the `neutral` step nearest in lightness: 0.004 from `neutral-300` up, 0.005 for `neutral-400` to `neutral-600`, 0.007 from `neutral-700` down. Pure white has no chroma. The neutrals keep their own lightness where no step fits; only the chroma is shared, so text and surfaces carry the same faint cool bias as the ramp. `semantic-sources.test.ts` checks the rule.

**Hand-typed values.** A semantic colour is a token reference, a ramp step or a mix of those. The exceptions are listed in `semantic-sources.test.ts`, each with its reason. Most are contrast-tuned: the nearest step fails a named test in `contrast.test.ts` (light `muted-foreground`, `destructive-text`, `info-text` and `control-border`; dark `muted-foreground` and `destructive-text`). Light `warning-text` and `warning-indicator` sit on hues with no ramp. Dark `success-text` and `warning-text` pass at their nearest step but read visibly duller there. Light `foreground-secondary` and dark `foreground` sit close to a step and have not moved yet.

**Semantic colors** (slots, light/dark mode aware via CSS variables):

- `background`, `foreground` — Page background and primary text
- `foreground-secondary` — Secondary text on any surface tier: descriptions, table values, inactive navigation (`text-foreground-secondary`). It sits between `foreground` and `muted-foreground`. It is not the text on a `secondary` fill; that is `secondary-foreground`
- `surface`, `surface-raised`, `overlay` — The surface ramp: content plane, lifted elements, floating layer. Contrast between tiers separates content; borders divide siblings within a tier. `overlay` points at `surface-raised` in both themes; the `shadow-overlay` edge and drop separate floating content
- `inset` — Sunken wells (tab tracks, skeletons) that read below their host surface
- `scrim` — Backdrop behind modal overlays (dialog, alert dialog, sheet, drawer): `bg-scrim`
- `scrim-subtle` — Lighter backdrop for a transient overlay that keeps the page in view, such as the command palette: `bg-scrim-subtle`
- `card`, `card-foreground` — Card surfaces (alias of `surface-raised`)
- `popover`, `popover-foreground` — Popover/dropdown surfaces (alias of `overlay`)
- `primary`, `primary-foreground` — Primary actions. Neutral, not Vendure blue
- `brand`, `brand-foreground` — Vendure blue, for deliberate identity moments only (`bg-brand text-brand-foreground`). Components opt in; nothing uses it by default
- `brand-indicator` — Vendure blue as a non-text mark: the active navigation icon, the selected-item marker, a link underline (`text-brand-indicator` on an icon, `bg-brand-indicator`). It is a brand scale step: `brand-600` in light mode, `brand-500` in dark mode. In light mode it measures about 2.8:1 on `background` and 2.9:1 on `surface`, and 3:1 on the raised tiers. Do not use it for body text or as a fill behind text
- `brand-text` — Vendure blue as text: a link name on hover or focus (`text-brand-text`). It is a brand scale step: `brand-800` in light mode, the lightest step that reads at 4.5:1 on `background`, a card, a hovered row and a selected row (`brand-700` is 4.1:1 on a selected row), and `brand-500` in dark mode. Use `brand-indicator` for marks and `brand-text` for text; `info-text` is for information status only
- `secondary`, `secondary-foreground` — Secondary actions
- `muted`, `muted-foreground` — Muted/disabled elements
- `faint-foreground` — Placeholder text in a field: a native `::placeholder` (`placeholder:text-faint-foreground`), and the placeholder that Select, Combobox and the date pickers show as text. It is fainter than `muted-foreground` and below 4.5:1, so never use it for text a user must read. Mark placeholder text with `data-placeholder`; the Storybook a11y scan skips it for contrast
- `accent`, `accent-foreground` — The hover step for a control that already rests on `muted`, such as an IdChip
- `destructive`, `destructive-foreground` — Destructive/error states
- `success`, `success-foreground` — Success states
- `warning`, `warning-foreground` — Warning states
- `info`, `info-foreground` — Informational states
- `{tone}-text` — Text-safe tone colour on a surface tier (`success`, `warning`, `destructive`, `info`): status words, deltas, field errors (`text-success-text`)
- `warning-indicator` — Warning as a mark beside a label: the StatusBadge outline and fill, the warning Alert tint, a highlight (`border-warning-indicator`, `bg-warning-indicator`). Lighter than `warning-text` in light mode, so a mix of it does not read beige. The StatusBadge status dot fills with it too (its label stays as screen-reader text). Not for text. It is about 2:1 on light surfaces. In dark mode it is `warning-text`
- `neutral-text` — The neutral tone of a state (Stopped, Asleep): the StatusBadge outline, fill, icon and dot (`text-neutral-text`). The same grey as `muted-foreground` in light mode, and brighter in dark mode, so a neutral chip does not read dim beside the other tones. Holds 4.5:1 on every surface tier
- `{tone}-subtle`, `{tone}-subtle-foreground`, `{tone}-border` — The subtle tier for each tone (`success`, `warning`, `destructive`, `info`, `neutral`): tinted background, readable foreground, and matching border for soft status treatments in consumers (e.g. `bg-success-subtle text-success-subtle-foreground border-success-border`). Alert and StatusBadge are not subtle: they mix the tone into the surface. No ui component draws a status surface from this tier; ui uses only the subtle fills as Progress tracks, the neutral set in Badge, and `destructive-subtle-foreground` for field errors
- `border`, `input`, `ring` — The hairline divider between peers (also the edge of text fields and of outline buttons, toggles and button groups), the stronger hover edge of those outline controls, and the brand focus ring. `border` and `input` are translucent in both modes (a foreground mix in light, a white mix in dark), so an edge stays one step darker than whatever surface it sits on. Two of them stacked read darker, and a `color-mix` with them yields a translucent colour
- `control-border` — The boundary of controls that have no other visible edge: unchecked checkbox, radio, switch track, slider and progress tracks (`border-control-border`, `bg-control-border`). Text fields keep `border`
- `code-highlight`, `code-diff-add`, `code-diff-remove` and their `-accent` slots — Code annotations (line/word highlight, diff add/remove)
- `code-inline`, `code-inline-border` — Inline code chip: `bg-code-inline border-code-inline-border text-foreground`
- `chart-1` through `chart-5` — Data visualization (map to `viz-1` to `viz-5`)
- `sidebar-*` — Sidebar-specific variants

**Intensity.** `muted`, `secondary` and `accent` are translucent foreground mixes, ordered by strength: `muted` < `secondary` < `accent`. Use a lower intensity to de-emphasize. Hover and selected fills on rows, items and ghost controls use `muted`. A control that already rests on `muted` steps up to `accent` on hover.

**Tones.** The tone vocabulary is `neutral`, `info`, `success`, `warning`, `critical` and `progress`. Two tones have no slots of their own:

- `critical` renders with the `destructive-*` slots.
- `progress` renders with the `info` slots plus a spinner.

**Tone text.** Use `{tone}-text` for tone-colored text set directly on a surface, for example a status word, a delta, a field error or a destructive menu item (`text-destructive-text`). The `{tone}-text` slots are saturated values chosen to sit beside the brand blue, not steps of the tone ramps. `info-text` is on the brand hue. Each passes 4.5:1 on `background`, `surface`, `surface-raised` and `overlay`, and on the `muted`, `secondary` and `accent` fills over each tier. Use `{tone}-subtle-foreground` for text on the matching `{tone}-subtle` fill; it also passes 4.5:1 on every surface tier, but it is darker in light mode. The solid slots (`destructive`, `success`, `warning`, `info`) are fills for `{tone}-foreground` text and are not safe as text: dark `destructive` is 3.07:1 on `overlay`, dark `success` is 2.69:1 on a card, and light `warning` is 3.25:1 on white.

**Contrast contract.** `src/contrast.test.ts` holds these minimums in both modes:

- 4.5:1 for every foreground on its fill; for `foreground`, `foreground-secondary`, `muted-foreground`, `brand-text`, `{tone}-text` and `{tone}-subtle-foreground` on every surface tier; for `brand-text` on a hovered row (half `muted`) and a selected row (`muted`) over a card; for `muted-foreground`, `brand-text` and `{tone}-text` on the `muted` and `secondary` fills and the `accent` hover fill over every surface tier; for the subtle tier over `surface`, `surface-raised` and `overlay`; for the StatusBadge label on its chip fill, for all six tones on every surface tier; and for the Alert title (`foreground`) and description (`foreground-secondary`) on the `destructive`, `warning` and `info` Alert tint over every surface tier. The StatusBadge and Alert recipes are copied into `contrast.test.ts`: change the component and the test together.
- 3:1 (WCAG 1.4.11 non-text) for `primary`, `ring`, `sidebar-ring`, `destructive`, `control-border` and `brand-indicator` on every surface tier, except light `brand-indicator`, `ring` and `sidebar-ring` on `background` (2.8:1) and `surface` (2.91:1), where the test floor is the chosen brand step's measured ratio, and for the StatusBadge icon on its chip fill and the Alert icon on its tint. `border` and `input` are exempt. `warning-indicator` is exempt in light mode (about 2:1; never the only cue) and holds 3:1 in dark mode.

### Typography

- **Font families**: `--font-sans` (Inter), `--font-heading` (Inter), `--font-body` (Inter), `--font-mono` (Geist Mono)
- **Inter features**: `--font-sans--font-feature-settings`, `--font-heading--font-feature-settings` and `--font-body--font-feature-settings` turn on `cv11`, `ss01` and `ss03`. Tailwind applies the sans value to the page and each value to its `font-*` utility
- **Mono features**: `--font-mono--font-feature-settings` turns off the `liga` and `calt` ligatures. Tailwind applies it to `font-mono` and to `code`, `pre`, `kbd` and `samp`, so a space before `--` stays visible
- **Type scale**: `--text-2xs` through `--text-5xl` — Tailwind `text-*` utilities. `text-sm` (13px, 20px line) is the body and UI size; `text-xs` (12px) is small text and keyboard hints; `text-2xs` (11px) is micro text
- **Font weights**: `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold` — Tailwind `font-*` utilities
- **Letter spacing**: `--tracking-tighter`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide` — Tailwind `tracking-*` utilities
- **Text styles**: named type compositions (font, size, weight, tracking, leading, line breaking — no color), applied as a single utility class:
  - `text-style-page-title` (22px), `text-style-section-title` (16px, section and dialog titles), `text-style-card-title` (14px, popover and compact state titles; `CardTitle` sets its title at 13px in `foreground-secondary`) — heading font
  - `text-style-body` — body font
  - `text-style-caption` — small print
  - `text-style-code` — mono font

The theme deliberately does not restyle raw `h1`–`h6` elements. Apply the heading font with the `font-heading` utility (Inter) — don't rebind `--font-heading` in app CSS. The `@vendure-io/ui` title components (`DialogTitle`, `AlertDialogTitle`, `SheetTitle`, `DrawerTitle`, `PopoverTitle`, `CardTitle`, `EmptyTitle`) apply it out of the box.

### Radii

- `--radius` — Base radius value
- Scaled variants: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

### Shadows

- `--shadow-2xs` through `--shadow-2xl` — Tailwind `shadow-*` utilities. The same values in both modes
- `--shadow-overlay` — The themed shadow for floating content (menus, popovers, dialogs): a clear 1px edge and a soft drop. It is the popup's border, so a popup takes no border or ring class. Light and dark have different values. Use `shadow-overlay`
- `--shadow-control` — The themed shadow for a resting control on a surface (default, brand, destructive and outline buttons, button groups, cards, the sidebar's sliding pill): a 1px bottom edge. Light and dark have different values. Use `shadow-control`

### Motion

- **Easing**: `--ease-default`, `--ease-in`, `--ease-out` (a strong ease-out for entrances), `--ease-in-out`, `--ease-spring`, `--ease-drawer` (drawers and sheets that slide in from an edge), `--ease-height` (a height that opens or closes: an accordion panel, a collapsible section, a new list row), `--ease-press` (the press scale of a control), `--ease-soft` (the CSS `ease` curve, for small colour, opacity and blur changes and quick exits) — Tailwind `ease-*` utilities
- **Duration**: `--transition-duration-instant` (0ms), `-fast` (100ms), `-quick` (120ms, colour changes on controls), `-moderate` (150ms), `-normal` (200ms), `-slow` (300ms), `-slower` (500ms) — Tailwind `duration-*` utilities (`duration-fast`, `duration-moderate`, …)
- **Palette durations**: `--transition-duration-palette-*` — the command palette's own timings (`palette-enter` 160ms, `palette-move` 180ms, `palette-exit` 110ms, `palette-tint` 120ms, and the result and detail steps). Only `CommandDialog` and its parts use them; use the scale above everywhere else
- **Tooltip duration**: `--transition-duration-tooltip-enter` (125ms) — the tooltip's entrance, with the fade on `ease-soft` and the scale on `ease-out`; its exit uses the same pair. Only `TooltipContent` uses it; it leaves in `fast`. `tooltip-label-fade` (180ms), `tooltip-label-move` (260ms) and `tooltip-resize` (320ms) time `TooltipLabelSwap`, a label that changes in place. `tooltip-delay` (600ms) is the open delay of `TooltipProvider`: the first tooltip waits for it, the next ones open at once with no animation
- **Progress fill duration**: `--transition-duration-progress-fill` (240ms) — a Progress fill that grows from 0 or eases to a new value, on `ease-out`. Only `Progress` uses it
- **Popup durations**: `--transition-duration-popup-fade` (160ms) — a popup's fade in; `--transition-duration-popup-resize` (350ms) — an open `NavigationMenu` moving and resizing to the next item, on `ease-out`
- **Sidebar pill duration**: `--transition-duration-sidebar-pill` (280ms) — the sliding pill of the sidebar, on `ease-drawer`. Only the Sidebar menu indicator uses it
- **Toast durations**: `--transition-duration-toast-move` (320ms), `-toast-fade` (220ms), `-toast-exit-move` (180ms), `-toast-exit-fade` (160ms) — the Toaster's stack. Only the Toaster uses them
- **Check mark delay**: `--transition-duration-check-mark-delay` (15ms) — how long a `Checkbox` check mark waits after the fill starts to grow before it draws. Only `Checkbox` uses it
- **Dialog durations**: `--transition-duration-dialog-scrim` (180ms) — the scrim of a `Dialog` or `AlertDialog` fading in; `-dialog-enter` (240ms) — the popup's scale and move in, on `ease-out` (its opacity uses `normal`); `-dialog-exit` (140ms) — the scrim fading out on `ease-soft`, and the popup's scale out on `ease-out` (its opacity uses `quick` on `ease-soft`). Only `Dialog` and `AlertDialog` use them
- **Drawer durations**: `--transition-duration-drawer-slide` (450ms) — a `Drawer` sliding and its scrim fading, on `ease-drawer`; `-drawer-swipe` (400ms) — a released swipe at full strength, which the `Drawer` scales by the swipe strength. `--ease-drawer-content` is the curve of the content's fade while a nested drawer opens. Only `Drawer` uses them
- **Alert duration**: `--transition-duration-alert-enter` (240ms) — an `Alert` that appears, on `ease-out`. Only `Alert` uses it
- **Button icon duration**: `--transition-duration-button-icon-turn` (220ms) — the icon of a `Button` turning (a chevron on an expanded trigger), on `ease-out`. Only `Button` uses it
- **The rule**: every duration and easing is a token, written in the short class form (`duration-quick`, `ease-soft`). When the scale lacks a value, add a token named for its owner instead of a literal
- **Row entrance duration**: `--transition-duration-row-enter` (340ms) — a new `ListRow` that opens its height, on `ease-height`. Only `ListRow` uses it
- **Animations**: `--animate-shimmer` — the `animate-shimmer` utility, for loading-state gradient sweeps (e.g. `Skeleton`); `--animate-spin-slow` — the `animate-spin-slow` utility, a 1.6s linear rotation for small in-progress marks (e.g. the `StatusBadge` spinner); `--animate-progress-sweep` — the `animate-progress-sweep` utility, a 2.2s linear band across an indeterminate `Progress` bar

## Dark Mode

The design tokens use CSS custom properties with two scopes:

- `:root` — Light mode values (default)
- `.dark` — Dark mode overrides

When the `dark` class is present on an ancestor element (typically `<html>`), all token values automatically switch to their dark variants. No additional configuration needed — just toggle the class.

`:root` sets `color-scheme: light` and `.dark` sets `color-scheme: dark`, so native scrollbars, date inputs, autofill and `<select>` popups follow the theme.

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
import { brand, duration, lightTheme } from "@vendure-io/design-tokens";

// Access token values programmatically
const brandColor = brand[500];
const primaryColor = lightTheme.primary;
const fastDuration = duration.fast;
```
