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
// `overlay` is for floating content (menus, popovers, dialogs): a 1px contact
// ring plus a soft drop. Dark mode swaps the ring to white so the edge reads on
// the dark overlay tier.
// `control` lifts a resting control or a card off its surface (default, brand,
// destructive and outline buttons, button groups, Card): a 1px bottom edge and
// a faint 2px blur. Dark mode keeps only the
// edge, darker, because a blur does not read on the dark tiers.
export const lightShadows = {
  overlay:
    '0 0 0 1px oklch(0.173 0.011 231 / 0.06), 0 12px 32px -8px oklch(0.173 0.011 231 / 0.18), 0 4px 8px -4px oklch(0.173 0.011 231 / 0.08)',
  control: '0 1px 0 oklch(0.173 0.011 231 / 0.04), 0 1px 2px oklch(0.173 0.011 231 / 0.04)',
} as const;

export const darkShadows = {
  overlay: '0 0 0 1px oklch(1 0 0 / 0.08), 0 16px 40px -8px oklch(0 0 0 / 0.6)',
  control: '0 1px 0 oklch(0 0 0 / 0.2)',
} as const;
