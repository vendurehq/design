// The radius scale. The names are one step smaller than Tailwind's (md is
// 4px). The theme resets Tailwind's own steps (`--radius-*: initial`), so
// rounded-xs and rounded-4xl do not exist. Roles: inner (lg, 6px), control
// (xl, 8px), surface (2xl, 12px), palette (3xl, 16px) and pill (full).
export const radii = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.375rem',
  xl: '0.5rem',
  '2xl': '0.75rem',
  '3xl': '1rem',
  full: '9999px',
} as const;
