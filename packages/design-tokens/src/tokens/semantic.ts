import { brand, destructive, info, neutral, success, viz, warning } from './colors.js';

export const lightTheme = {
  background: 'oklch(0.972 0.003 231)',
  foreground: 'oklch(0.173 0.011 231)',
  // Secondary text: descriptions, table values, inactive navigation. Sits
  // between `foreground` and `muted-foreground`. Not the text on a
  // `secondary` fill; that is `secondary-foreground`.
  'foreground-secondary': 'oklch(0.38 0.014 231)',
  // Surface ramp. Light mode holds an even near-white ramp (canvas to surface
  // to pure white) so nested tiers stay distinct: a light-gray canvas, an
  // off-white content pane, and white raised cards. Overlays are white too
  // and separate by the overlay shadow, not lightness.
  surface: 'oklch(0.986 0.002 231)',
  'surface-raised': 'oklch(1 0 0)',
  overlay: 'oklch(1 0 0)',
  inset: 'color-mix(in oklab, black 5%, transparent)',
  // Backdrop behind modal overlays (dialog, alert dialog, sheet, drawer).
  scrim: 'color-mix(in oklab, black 45%, transparent)',
  card: 'var(--surface-raised)', // raised tier: lifts cards off a --surface content pane
  'card-foreground': 'oklch(0.173 0.011 231)',
  popover: 'var(--overlay)',
  'popover-foreground': 'oklch(0.173 0.011 231)',
  primary: neutral[900],
  'primary-foreground': neutral[50],
  brand: brand[500],
  'brand-foreground': neutral[950],
  // Brand as a non-text accent: active navigation icons, the selected-item
  // marker, link underlines. Holds 3:1 (WCAG 1.4.11) on every surface tier.
  // Not for body text and not a fill for text.
  'brand-indicator': 'oklch(0.63 0.128 231)',
  // Intensity slots are foreground mixes so they hold on any ramp tier; the
  // percentages reproduce the previous absolute values on the default surface.
  secondary: 'color-mix(in oklab, var(--foreground) 7%, transparent)',
  'secondary-foreground': neutral[900],
  muted: 'color-mix(in oklab, var(--foreground) 5%, transparent)',
  'muted-foreground': 'oklch(0.543 0.013 231)',
  accent: 'color-mix(in oklab, var(--foreground) 8%, transparent)',
  'accent-foreground': neutral[900],
  destructive: destructive[500],
  'destructive-foreground': 'oklch(0.98 0.01 25)',
  'destructive-subtle': destructive[100],
  'destructive-subtle-foreground': destructive[900],
  'destructive-border': destructive[200],
  success: success[600],
  'success-foreground': 'oklch(0.98 0.01 145)',
  'success-subtle': success[100],
  'success-subtle-foreground': success[900],
  'success-border': success[200],
  warning: warning[500],
  'warning-foreground': warning[950],
  'warning-subtle': warning[100],
  'warning-subtle-foreground': warning[900],
  'warning-border': warning[200],
  info: info[600],
  'info-foreground': 'oklch(0.98 0.01 250)',
  'info-subtle': info[100],
  'info-subtle-foreground': info[900],
  'info-border': info[200],
  'neutral-subtle': neutral[100],
  'neutral-subtle-foreground': neutral[900],
  'neutral-border': neutral[200],
  // Tone text: the text-safe tone colours for status words, deltas and field
  // errors set directly on a surface tier. Each is the ramp step nearest the
  // solid tone that holds 4.5:1 on every surface tier. Brighter than the
  // `{tone}-subtle-foreground` slots, which are tuned for the subtle fills.
  'success-text': success[600],
  'warning-text': warning[600],
  'destructive-text': destructive[500],
  'info-text': info[600],
  // Code annotation slots (Shiki notation: line/word highlight, diff add/remove).
  // Backgrounds are 10% alpha mixes so they read on any surface tier and keep
  // the syntax-highlighted text legible; accents draw the solid gutter bar.
  'code-highlight': `color-mix(in oklab, ${info[500]} 10%, transparent)`,
  'code-highlight-accent': info[500],
  'code-diff-add': `color-mix(in oklab, ${success[500]} 10%, transparent)`,
  'code-diff-add-accent': success[500],
  'code-diff-remove': `color-mix(in oklab, ${destructive[500]} 10%, transparent)`,
  'code-diff-remove-accent': destructive[500],
  // Inline code chip: the secondary intensity fill with the standard border.
  'code-inline': 'var(--secondary)',
  'code-inline-border': 'var(--border)',
  // Hairline divider between peers. `input` is the stronger edge of text
  // inputs and other controls that need a visible outline.
  border: 'oklch(0.929 0.006 231)',
  input: 'oklch(0.882 0.009 231)',
  // Boundary of controls that have no other visible edge: unchecked
  // checkbox, radio and switch track, slider and progress tracks. Holds 3:1
  // (WCAG 1.4.11) on every surface tier. Text inputs keep `input`.
  'control-border': 'oklch(0.62 0.005 231)',
  // Brand focus ring. brand-700 holds 3:1 on every light surface tier;
  // brand-500 and brand-600 do not.
  ring: brand[700],
  'chart-1': viz[1],
  'chart-2': viz[2],
  'chart-3': viz[3],
  'chart-4': viz[4],
  'chart-5': viz[5],
  sidebar: 'var(--background)',
  'sidebar-foreground': 'oklch(0.3 0.007 231)',
  'sidebar-primary': neutral[900],
  'sidebar-primary-foreground': neutral[50],
  'sidebar-accent': 'oklch(0.935 0.004 231)',
  'sidebar-accent-foreground': neutral[900],
  'sidebar-border': 'var(--border)',
  'sidebar-ring': brand[700],
} as const;

export const darkTheme = {
  // The canvas is lifted off black so the raised and overlay tiers can step
  // up in even increments above it.
  background: 'oklch(0.205 0.01 231)',
  foreground: 'oklch(0.956 0.005 231)',
  'foreground-secondary': 'oklch(0.838 0.01 231)',
  // Dark mode expresses all four tiers through lightness. `surface` sits
  // halfway between the canvas and the raised tier; `overlay` takes one more
  // step of the same size above `surface-raised`.
  surface: 'oklch(0.222 0.012 231)',
  'surface-raised': 'oklch(0.238 0.013 231)',
  overlay: 'oklch(0.271 0.015 231)',
  inset: 'color-mix(in oklab, black 40%, transparent)',
  scrim: 'color-mix(in oklab, black 45%, transparent)',
  card: 'var(--surface-raised)', // raised tier: lifts cards off a --surface content pane
  'card-foreground': 'oklch(0.956 0.005 231)',
  popover: 'var(--overlay)',
  'popover-foreground': 'oklch(0.956 0.005 231)',
  primary: neutral[100],
  'primary-foreground': neutral[900],
  brand: brand[500],
  'brand-foreground': neutral[950],
  'brand-indicator': brand[400],
  secondary: 'color-mix(in oklab, var(--foreground) 7%, transparent)',
  'secondary-foreground': 'oklch(0.95 0.004 231)',
  muted: 'color-mix(in oklab, var(--foreground) 4%, transparent)',
  'muted-foreground': 'oklch(0.668 0.014 231)',
  accent: 'color-mix(in oklab, var(--foreground) 9%, transparent)',
  'accent-foreground': 'oklch(0.95 0.004 231)',
  // Between destructive-500 and destructive-400 on the destructive hue.
  // destructive-500 drops to 2.8:1 on the overlay tier; 400 fails 4.5:1 for
  // white text on the fill. This lightness holds both.
  destructive: 'oklch(0.575 0.2 25)',
  'destructive-foreground': 'oklch(0.98 0.01 25)',
  // Subtle backgrounds are 40% alpha so they sit on any surface tier instead
  // of only matching the canvas.
  'destructive-subtle': `color-mix(in oklab, ${destructive[900]} 40%, transparent)`,
  'destructive-subtle-foreground': destructive[300],
  'destructive-border': destructive[800],
  success: success[600],
  'success-foreground': 'oklch(0.98 0.01 145)',
  'success-subtle': `color-mix(in oklab, ${success[900]} 40%, transparent)`,
  'success-subtle-foreground': success[300],
  'success-border': success[800],
  warning: warning[500],
  'warning-foreground': warning[950],
  'warning-subtle': `color-mix(in oklab, ${warning[900]} 40%, transparent)`,
  'warning-subtle-foreground': warning[300],
  'warning-border': warning[800],
  info: info[600],
  'info-foreground': 'oklch(0.98 0.01 250)',
  'info-subtle': `color-mix(in oklab, ${info[900]} 40%, transparent)`,
  'info-subtle-foreground': info[300],
  'info-border': info[800],
  'neutral-subtle': `color-mix(in oklab, ${neutral[900]} 40%, transparent)`,
  'neutral-subtle-foreground': neutral[300],
  'neutral-border': neutral[800],
  'success-text': success[300],
  'warning-text': warning[500],
  'destructive-text': destructive[400],
  'info-text': info[400],
  // Same 10% alpha recipe as light mode: the 500-step hues carry enough chroma
  // to read as tint on the dark surface ramp without drowning the token colors.
  'code-highlight': `color-mix(in oklab, ${info[500]} 10%, transparent)`,
  'code-highlight-accent': info[500],
  'code-diff-add': `color-mix(in oklab, ${success[500]} 10%, transparent)`,
  'code-diff-add-accent': success[500],
  'code-diff-remove': `color-mix(in oklab, ${destructive[500]} 10%, transparent)`,
  'code-diff-remove-accent': destructive[500],
  // Inline code chip: the secondary intensity fill with the standard border.
  'code-inline': 'var(--secondary)',
  'code-inline-border': 'var(--border)',
  // White mixes, so the edge keeps the same strength on every surface tier
  // instead of fading out on the lighter ones.
  border: 'color-mix(in oklab, white 7.5%, transparent)',
  input: 'color-mix(in oklab, white 13%, transparent)',
  // Foreground mix like `border`, strong enough for 3:1 on every tier.
  'control-border': 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  // Brand focus ring. brand-500 holds 3:1 on every dark surface tier.
  ring: brand[500],
  'chart-1': viz[1],
  'chart-2': viz[2],
  'chart-3': viz[3],
  'chart-4': viz[4],
  'chart-5': viz[5],
  sidebar: 'var(--background)',
  'sidebar-foreground': 'oklch(0.85 0.004 231)',
  'sidebar-primary': neutral[100],
  'sidebar-primary-foreground': neutral[900],
  'sidebar-accent': 'oklch(0.27 0.014 231)',
  'sidebar-accent-foreground': 'oklch(0.95 0.004 231)',
  'sidebar-border': 'var(--border)',
  'sidebar-ring': brand[500],
} as const;
