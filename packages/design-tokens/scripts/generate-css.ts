import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, neutral, success, warning, destructive } from '../src/tokens/colors.ts';
import { lightTheme, darkTheme } from '../src/tokens/semantic.ts';
import { fontFamily } from '../src/tokens/typography.ts';
import { radii } from '../src/tokens/radii.ts';

// Base color ranges — static across light/dark themes
const colorRanges = { brand, neutral, success, warning, destructive } as Record<
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

// Radius calc expressions matching the existing theme.css convention
const radiusLines = [
  `  --radius-sm: calc(var(--radius) - 4px);`,
  `  --radius-md: calc(var(--radius) - 2px);`,
  `  --radius-lg: var(--radius);`,
  `  --radius-xl: calc(var(--radius) + 4px);`,
  `  --radius-2xl: calc(var(--radius) + 8px);`,
  `  --radius-3xl: calc(var(--radius) + 12px);`,
  `  --radius-4xl: calc(var(--radius) + 16px);`,
];

// Font-family lines from typography tokens
const fontLines = Object.entries(fontFamily).map(
  ([key, value]) => `  --font-${key}: ${value};`,
);

const themeBlock = [...baseColorLines, ...colorLines, ...radiusLines, ...fontLines].join('\n');

const themeCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '',
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  '@import "./variables.css";',
  '',
  '@custom-variant dark (&:is(.dark *));',
  '',
  '@theme inline {',
  themeBlock,
  '}',
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
