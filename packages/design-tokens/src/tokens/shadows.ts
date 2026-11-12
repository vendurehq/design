import { lightTheme } from './semantic.js';

export const shadows = {
  '2xs': '0 1px 1px 0 oklch(0 0 0 / 0.05)',
  xs: '0 1px 2px 0 oklch(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 oklch(0 0 0 / 0.1), 0 1px 2px -1px oklch(0 0 0 / 0.1)',
  md: '0 4px 6px -1px oklch(0 0 0 / 0.1), 0 2px 4px -2px oklch(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px oklch(0 0 0 / 0.1), 0 4px 6px -4px oklch(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px oklch(0 0 0 / 0.1), 0 8px 10px -6px oklch(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px oklch(0 0 0 / 0.25)',
  none: 'none',
} as const;

// Themed shadows: values differ between light and dark, so they are emitted as
// runtime CSS variables in the :root and .dark blocks (`--shadow-<key>`) and
// exposed as Tailwind `shadow-<key>` utilities.
// `overlay` is for floating content (menus, popovers, dialogs): a clear 1px
// edge, then the drops. A box-shadow edge keeps the popup's size. The edge
// keeps a popup apart from a white table or card. Dark mode swaps the edge to
// white so it reads on the dark overlay tier.
// `control` lifts a resting control or a card off its surface (default, brand,
// destructive and outline buttons, button groups, Card): a 1px bottom edge and
// a faint 2px blur. Dark mode keeps only the
// edge, darker, because a blur does not read on the dark tiers.
// `scrolled` marks a sticky header while content sits scrolled under it: a 1px
// line below the header in the `input` colour, no blur, so it reads as a rule
// in both themes. It references `--input`, so it follows the theme on its own.
// Light shadows are tinted with the light `foreground`, so they follow it.
const ink = (alpha: number) => lightTheme.foreground.replace(/\)$/, ` / ${alpha})`);

export const lightShadows = {
  overlay: `0 0 0 1px ${ink(0.1)}, 0 12px 32px -8px ${ink(0.18)}, 0 4px 8px -4px ${ink(0.08)}`,
  control: `0 1px 0 ${ink(0.04)}, 0 1px 2px ${ink(0.04)}`,
  scrolled: '0 1px 0 var(--input)',
} as const;

export const darkShadows = {
  overlay: '0 0 0 1px oklch(1 0 0 / 0.12), 0 16px 40px -8px oklch(0 0 0 / 0.6)',
  control: '0 1px 0 oklch(0 0 0 / 0.2)',
  scrolled: '0 1px 0 var(--input)',
} as const;
