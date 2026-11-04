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
} as const;

export const duration = {
  instant: '0ms',
  fast: '100ms',
  moderate: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
} as const;

// Named animations — Tailwind `animate-*` utilities. Each key needs a
// matching entry in `keyframes` below.
export const animation = {
  shimmer: 'shimmer 1.75s linear infinite',
} as const;

// Keyframe steps for the animations above, generated as top-level
// `@keyframes` blocks alongside the theme.
export const keyframes = {
  shimmer: {
    from: { backgroundPosition: '-200% 0' },
    to: { backgroundPosition: '200% 0' },
  },
} as const;
