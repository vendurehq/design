// Fontsource variable fonts register as "<Family> Variable"; the plain names
// stay as fallbacks for consumers loading static cuts themselves.
export const fontFamily = {
  sans: '"Inter Variable", "Inter", system-ui, sans-serif',
  heading: '"Public Sans Variable", "Public Sans", system-ui, sans-serif',
  body: '"Inter Variable", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
} as const;

// Named type compositions — font, size, weight, tracking, leading. Type
// only, no color. Consumed as Tailwind utilities, e.g. `text-style-body`.
export const textStyles = {
  'page-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    lineHeight: '1.2',
  },
  'section-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    lineHeight: '1.3',
  },
  'card-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: '1.4',
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: '1.5',
  },
  caption: {
    // No fontFamily on purpose — captions inherit the ambient font so they
    // match whatever context they annotate (body copy or code).
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: '1.4',
  },
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: '1.5',
  },
} as const;
