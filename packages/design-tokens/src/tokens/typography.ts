// Fontsource variable fonts register as "<Family> Variable"; the plain names
// stay as fallbacks for consumers loading static cuts themselves.
export const fontFamily = {
  sans: '"Inter Variable", "Inter", system-ui, sans-serif',
  heading: '"Inter Variable", "Inter", system-ui, sans-serif',
  body: '"Inter Variable", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
} as const;

// Per-family font-feature-settings. The Inter families turn on `cv11`
// (single-storey a), `ss01` (open digits) and `ss03` (round quotes and
// commas). Tailwind applies the sans value to the page through preflight and
// each value to its `font-*` utility. Geist Mono's `liga` joins a space and
// the following `--` into one glyph, which hides the space in CLI flags.
// Tailwind applies the mono value to `font-mono` and to `code`, `pre`, `kbd`,
// `samp`.
export const fontFeatureSettings = {
  sans: '"cv11", "ss01", "ss03"',
  heading: '"cv11", "ss01", "ss03"',
  body: '"cv11", "ss01", "ss03"',
  mono: '"liga" 0, "calt" 0',
} as const;

// `sm` is the body and UI text size (13px). `2xs` is micro text such as
// keyboard hints.
export const fontSize = {
  '2xs': '0.6875rem',
  xs: '0.75rem',
  sm: '0.8125rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
} as const;

// Line heights for the type steps whose size differs from Tailwind's default
// scale. Emitted as `--text-<step>--line-height`; the other steps keep
// Tailwind's defaults. `sm` keeps a 20px line so row heights do not change.
export const fontSizeLineHeight = {
  '2xs': 'calc(1 / 0.6875)',
  sm: 'calc(1.25 / 0.8125)',
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
  // 22px page title.
  'page-title': {
    fontFamily: fontFamily.heading,
    fontSize: '1.375rem',
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.018em',
    lineHeight: '1.2',
  },
  // 16px: section and dialog titles.
  'section-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em',
    lineHeight: '1.3',
  },
  // 14px: card and panel titles, one step above the 13px body.
  'card-title': {
    fontFamily: fontFamily.heading,
    fontSize: '0.875rem',
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.005em',
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
