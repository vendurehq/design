export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  // Strong ease-out: fast start, long settle. Entrances and state changes.
  out: 'cubic-bezier(0.19, 1, 0.22, 1)',
  // Deliberate alias of `default` — the default easing is ease-in-out.
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // Drawers and sheets that slide in from an edge.
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  // A gentle ease-out for the press scale of a control. Softer than `out`,
  // so a quick tap does not snap to its end value.
  press: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  // The CSS `ease` curve: a light ease for small colour, opacity and blur
  // changes, and for quick exits.
  soft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

export const duration = {
  instant: '0ms',
  fast: '100ms',
  moderate: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  // The command palette's timings. It opens often, so each step is tuned to
  // the palette alone. Use the scale above everywhere else.
  paletteDetailDelay: '40ms', // the highlighted item's detail waits for the highlight
  paletteResultDelay: '50ms', // new results wait for the old ones to start leaving
  paletteDetailExit: '90ms', // the detail leaves an item
  paletteExit: '110ms', // the palette and its scrim close
  paletteTint: '120ms', // item text and icon colour; the reduced-motion fade
  paletteResultExit: '140ms', // old results fade out
  paletteEnter: '160ms', // the palette and its scrim fade in; old results blur out
  paletteMove: '180ms', // the palette drops into place; the detail fades in
  paletteDetailMove: '220ms', // the detail slides into place
  paletteResultBlur: '240ms', // new results come out of their blur
} as const;

// Named animations — Tailwind `animate-*` utilities. Each key needs a
// matching entry in `keyframes` below.
export const animation = {
  shimmer: 'shimmer 1.75s linear infinite',
  // A calm rotation for small in-progress marks (the StatusBadge spinner).
  // Slower than Tailwind's 1s `animate-spin`.
  spinSlow: 'spin-slow 1.6s linear infinite',
} as const;

// Keyframe steps for the animations above, generated as top-level
// `@keyframes` blocks alongside the theme.
export const keyframes = {
  shimmer: {
    from: { backgroundPosition: '-200% 0' },
    to: { backgroundPosition: '200% 0' },
  },
  spinSlow: {
    to: { transform: 'rotate(360deg)' },
  },
} as const;
