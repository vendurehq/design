import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, neutral, success, warning, destructive, info, viz } from '../src/tokens/colors.ts';
import { lightTheme, darkTheme } from '../src/tokens/semantic.ts';
import { fontFamily, fontSize, fontWeight, letterSpacing, textStyles } from '../src/tokens/typography.ts';
import { easing, duration, animation, keyframes } from '../src/tokens/motion.ts';
import { radii } from '../src/tokens/radii.ts';
import { shadows } from '../src/tokens/shadows.ts';

// Base color ranges — static across light/dark themes
const colorRanges = { brand, neutral, success, warning, destructive, info, viz } as Record<
  string,
  Record<string, string>
>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssDir = resolve(__dirname, '../src/css');

// ---------------------------------------------------------------------------
// variables.css
// ---------------------------------------------------------------------------

function buildBlock(selector: string, tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([key, value]) => `  --${key}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}

// Flatten color ranges into { 'brand-50': 'oklch(...)', 'brand-100': '...' , ... }
function flattenColorRanges(ranges: Record<string, Record<string, string>>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const [name, scale] of Object.entries(ranges)) {
    for (const [step, value] of Object.entries(scale)) {
      flat[`${name}-${step}`] = value;
    }
  }
  return flat;
}

const baseColorVars = flattenColorRanges(colorRanges);

const variablesCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '',
  buildBlock(':root', { ...baseColorVars, ...lightTheme }),
  '',
  buildBlock('.dark', darkTheme),
  '',
].join('\n');

await Bun.write(resolve(cssDir, 'variables.css'), variablesCss);

// ---------------------------------------------------------------------------
// theme.css
// ---------------------------------------------------------------------------

// Base color range mappings — e.g. --color-brand-50: var(--brand-50)
const baseColorLines = Object.keys(baseColorVars).map(
  (key) => `  --color-${key}: var(--${key});`,
);

// Semantic color mappings — every semantic key except "radius" gets a --color-* alias
const colorKeys = Object.keys(lightTheme).filter((k) => k !== 'radius');

const colorLines = colorKeys.map((key) => `  --color-${key}: var(--${key});`);

// Radius lines — driven directly from radii tokens
const radiusLines = Object.entries(radii).map(
  ([key, value]) => `  --radius-${key}: ${value};`,
);

// Shadow lines — override Tailwind defaults with our tokens
const shadowLines = Object.entries(shadows).map(
  ([key, value]) => `  --shadow-${key}: ${value};`,
);

// Font-family lines from typography tokens
const fontLines = Object.entries(fontFamily).map(
  ([key, value]) => `  --font-${key}: ${value};`,
);

// Type scale lines — Tailwind text-* utilities
const textLines = Object.entries(fontSize).map(
  ([key, value]) => `  --text-${key}: ${value};`,
);

// Font-weight lines — Tailwind font-* utilities
const fontWeightLines = Object.entries(fontWeight).map(
  ([key, value]) => `  --font-weight-${key}: ${value};`,
);

// Letter-spacing lines — Tailwind tracking-* utilities
const trackingLines = Object.entries(letterSpacing).map(
  ([key, value]) => `  --tracking-${key}: ${value};`,
);

const kebabCase = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

// Easing lines — Tailwind ease-* utilities
const easeLines = Object.entries(easing).map(
  ([key, value]) => `  --ease-${kebabCase(key)}: ${value};`,
);

// Duration lines — Tailwind duration-* utilities resolve named values from the
// --transition-duration-* theme namespace
const durationLines = Object.entries(duration).map(
  ([key, value]) => `  --transition-duration-${key}: ${value};`,
);

// Animation lines — Tailwind animate-* utilities. Each needs a matching
// @keyframes block, built below.
const animationLines = Object.entries(animation).map(
  ([key, value]) => `  --animate-${kebabCase(key)}: ${value};`,
);

const themeBlock = [
  ...baseColorLines,
  ...colorLines,
  ...radiusLines,
  ...shadowLines,
  ...fontLines,
  ...textLines,
  ...fontWeightLines,
  ...trackingLines,
  ...easeLines,
  ...durationLines,
  ...animationLines,
].join('\n');

// @keyframes blocks for the --animate-* theme entries above.
function buildKeyframes(name: string, steps: Record<string, Record<string, string>>): string {
  const stepBlocks = Object.entries(steps).map(([stepName, props]) => {
    const lines = Object.entries(props).map(([prop, value]) => `    ${kebabCase(prop)}: ${value};`);
    return `  ${stepName} {\n${lines.join('\n')}\n  }`;
  });
  return `@keyframes ${kebabCase(name)} {\n${stepBlocks.join('\n')}\n}`;
}

const keyframesCss = Object.entries(keyframes)
  .map(([name, steps]) => buildKeyframes(name, steps as Record<string, Record<string, string>>))
  .join('\n\n');

// text-style-* utilities — named type compositions (font, size, weight,
// tracking, leading). Type only, no color.
function buildTextStyleUtility(name: string, props: Record<string, string>): string {
  const lines = Object.entries(props).map(([prop, value]) => `  ${kebabCase(prop)}: ${value};`);
  return `@utility text-style-${name} {\n${lines.join('\n')}\n}`;
}

const textStyleCss = Object.entries(textStyles)
  .map(([name, props]) => buildTextStyleUtility(name, props as Record<string, string>))
  .join('\n\n');

const themeCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '',
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  // shadcn/tailwind.css defines the @custom-variant data-* selectors (data-open,
  // data-horizontal, ...), the no-scrollbar utility, and Base UI-aware accordion
  // keyframes that the base-vega components in @vendure-io/ui rely on. Without it,
  // e.g. data-horizontal: compiles to [data-horizontal] instead of
  // [data-orientation="horizontal"] and never matches. Must come after
  // tw-animate-css so shadcn's accordion keyframes win the cascade.
  '@import "shadcn/tailwind.css";',
  '@import "./variables.css";',
  '',
  '@custom-variant dark (&:is(.dark *));',
  '',
  '@theme inline {',
  themeBlock,
  '}',
  '',
  keyframesCss,
  '',
  textStyleCss,
  '',
  '@layer base {',
  '  * {',
  '    @apply border-border outline-ring/50;',
  '  }',
  '  body {',
  '    background-color: var(--background);',
  '    color: var(--foreground);',
  '    font-family: var(--font-body);',
  '  }',
  '}',
  '',
].join('\n');

await Bun.write(resolve(cssDir, 'theme.css'), themeCss);

// ---------------------------------------------------------------------------
// Validation — warn if semantic keys changed unexpectedly
// ---------------------------------------------------------------------------
const sharedKeys = new Set(['radius']);
const lightKeys = new Set(Object.keys(lightTheme));
const darkKeys = new Set(Object.keys(darkTheme));

const missingInDark = [...lightKeys].filter((k) => !darkKeys.has(k) && !sharedKeys.has(k));
const missingInLight = [...darkKeys].filter((k) => !lightKeys.has(k));

if (missingInDark.length > 0) {
  console.warn(`⚠ Keys in lightTheme missing from darkTheme: ${missingInDark.join(', ')}`);
}
if (missingInLight.length > 0) {
  console.warn(`⚠ Keys in darkTheme missing from lightTheme: ${missingInLight.join(', ')}`);
}

console.log('✓ Generated src/css/variables.css');
console.log('✓ Generated src/css/theme.css');
