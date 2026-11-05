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
} as const;

export const duration = {
  instant: '0ms',
  fast: '100ms',
  // Colour changes on controls: fill, border and text of a button or link.
  quick: '120ms',
  moderate: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
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
