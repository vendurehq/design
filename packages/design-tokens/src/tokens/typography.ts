// Fontsource variable fonts register as "<Family> Variable"; the plain names
// stay as fallbacks for consumers loading static cuts themselves.
export const fontFamily = {
  sans: '"Inter Variable", "Inter", system-ui, sans-serif',
  heading: '"Inter Variable", "Inter", system-ui, sans-serif',
  body: '"Inter Variable", "Inter", system-ui, sans-serif',
  mono: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
  // Website headings only (the `text-style-display-*` styles). Product
  // screens keep `heading`. `css/fonts` loads Public Sans.
  display: '"Public Sans Variable", "Public Sans", system-ui, sans-serif',
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
  // The Inter features above pick Inter glyph variants. Public Sans keeps
  // its own defaults.
  display: 'normal',
} as const;

// `sm` is the body and UI text size (14px). `2xs` is micro text; no
// component uses it. Keyboard hints (Kbd) use `xs`.
export const fontSize = {
  '2xs': '0.6875rem',
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

// Line heights for the type steps whose size differs from Tailwind's default
// scale. Emitted as `--text-<step>--line-height`; the other steps keep
// Tailwind's defaults. `sm` keeps a 20px line so row heights do not change.
export const fontSizeLineHeight = {
  '2xs': 'calc(1 / 0.6875)',
  sm: 'calc(1.25 / 0.875)',
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

// Display steps for website hero and section headings, above the product
// scale. Public Sans, semibold, balanced lines. The sizes come from the
// website's headings: flagship hero 60px, page hero 48px, small-screen hero
// 36px, section heading 30px. Tracking is the website's -1.5px written in em
// per step. Leading is tight and lands on whole pixels.
const displayStyle = (fontSize: string, lineHeight: string, letterSpacing: string) => ({
  fontFamily: fontFamily.display,
  fontFeatureSettings: fontFeatureSettings.display,
  fontSize,
  fontWeight: fontWeight.semibold,
  letterSpacing,
  lineHeight,
  textWrapStyle: 'balance',
});

// Named type compositions — font, size, weight, tracking, leading, and how
// the lines break. Type only, no color. Titles balance their lines; body
// text avoids a single word on its last line. The text-wrap-style longhand
// leaves the wrap mode alone, so `truncate` and `whitespace-nowrap` still win.
// Consumed as Tailwind utilities, e.g. `text-style-body`.
export const textStyles = {
  // 22px page title on a 26px line, so content under it lands on whole pixels.
  'page-title': {
    fontFamily: fontFamily.heading,
    fontSize: '1.375rem',
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.018em',
    lineHeight: '1.625rem',
    textWrapStyle: 'balance',
  },
  // 16px: section, sheet and empty-state titles.
  'section-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em',
    lineHeight: '1.3',
    textWrapStyle: 'balance',
  },
  // 16px dialog title on a 24px line: the section title with more room
  // above the description.
  'dialog-title': {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.01em',
    lineHeight: '1.5rem',
    textWrapStyle: 'balance',
  },
  // 14px: card and panel titles, the body size in the semibold heading font.
  'card-title': {
    fontFamily: fontFamily.heading,
    fontSize: '0.875rem',
    fontWeight: fontWeight.semibold,
    letterSpacing: '-0.005em',
    lineHeight: '1.4',
    textWrapStyle: 'balance',
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: '1.5',
    textWrapStyle: 'pretty',
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
  // Website headings only, never in product screens.
  // 60px on a 60px line: the flagship hero.
  'display-xl': displayStyle('3.75rem', '3.75rem', '-0.025em'),
  // 48px on a 50px line: every other page hero.
  'display-lg': displayStyle('3rem', '3.125rem', '-0.031em'),
  // 36px on a 38px line: a hero on a small screen, a large stat or price.
  'display-md': displayStyle('2.25rem', '2.375rem', '-0.042em'),
  // 30px on a 36px line: a section heading.
  'display-sm': displayStyle('1.875rem', '2.25rem', '-0.05em'),
} as const;
