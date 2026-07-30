export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  // Deliberate alias of `default` — the default easing is ease-in-out.
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const duration = {
  instant: '0ms',
  fast: '100ms',
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
