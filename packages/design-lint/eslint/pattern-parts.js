// Shared regex building blocks for the no-raw-colors rule. The ESLint rule
// (eslint/index.js) and the Biome plugin generator (scripts/generate-grit.ts)
// both compose their patterns from these parts so the two engines stay
// behaviorally equivalent. Edit here, then run `bun run generate` to refresh
// the biome/*.grit files.

export const rampNames =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
export const rampSteps = '(?:50|100|200|300|400|500|600|700|800|900|950)';
// Longer prefixes precede their shorter stem (border-t before border,
// ring-offset before ring) so a shorter alternative cannot shadow them.
export const utilityPrefixes =
  '(?:bg|text|border-t|border-r|border-b|border-l|border-x|border-y|border-s|border-e|border|divide|outline|ring-offset|ring|inset-ring|inset-shadow|shadow|accent|caret|fill|stroke|decoration|placeholder|from|via|to)';
// Tailwind opacity modifiers: bg-blue-500/50 and arbitrary bg-blue-500/[0.06].
export const opacitySuffix = '(?:/(?:[0-9.]+|\\[[0-9.]+\\]))?';
// The paren must be adjacent: CSS never allows whitespace before it, and
// requiring adjacency keeps prose like "Background color (hex)" from matching.
export const colorFunctionNames = '(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)';

// Shared regex building blocks for the no-raw-font-sizes rule. No lookaround,
// so the Biome flavor can use them as they are.
// A utility boundary: the class starts the string or follows a space, a quote,
// a variant colon or the important `!`. A letter, digit, `_` or `-` before
// `text-` makes it part of another word.
export const classStart = '(?:^|[^a-z0-9_-])';
// An arbitrary font size: a number with or without a unit (`text-[13px]`,
// `text-[0.8rem]`, `text-[13vw]`), a length type hint (`text-[length:…]`,
// `text-(length:…)`), or a size function (`text-[clamp(…)]`, calc, min, max).
// A bare `text-[var(--x)]` or `text-(--x)` is a colour to Tailwind, so it is
// not matched.
export const arbitraryFontSize =
  'text-(?:\\[(?:length:|[0-9.]|(?:clamp|calc|min|max)\\()|\\(length:)';
// Tailwind's default steps above the Vendure scale. The scale ends at text-5xl.
export const oversizedFontSize = 'text-[6-9]xl(?:[^a-z0-9-]|$)';
