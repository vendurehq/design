import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, neutral, success, warning, destructive, info, viz } from '../src/tokens/colors.ts';
import { lightTheme, darkTheme } from '../src/tokens/semantic.ts';
import { fontFamily, fontSize, fontWeight, letterSpacing, textStyles } from '../src/tokens/typography.ts';
import { easing, duration, animation, keyframes } from '../src/tokens/motion.ts';
import { radii } from '../src/tokens/radii.ts';
import { shadows } from '../src/tokens/shadows.ts';

// Base color ranges — static across light/dark themes
const colorRanges = { brand, neutral, success, warning, destructive, info, viz };

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

// Radius scale as runtime :root vars — @theme inline never emits its variables,
// so consumers reading var(--radius-*) at runtime need these declared here.
const radiusVars = Object.fromEntries(
  Object.entries(radii).map(([key, value]) => [`radius-${key}`, value]),
);

// Semantic default radius — shared across light/dark, so it lives outside the
// theme maps and gets its own emission path like the radius scale above.
const semanticRadiusVars = { radius: radii.md };

const variablesCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '',
  buildBlock(':root', { ...baseColorVars, ...radiusVars, ...semanticRadiusVars, ...lightTheme }),
  '',
  buildBlock('.dark', darkTheme),
  '',
].join('\n');

await Bun.write(resolve(cssDir, 'variables.css'), variablesCss);

// ---------------------------------------------------------------------------
// shadcn.css — vendored from the shadcn package
// ---------------------------------------------------------------------------

// Vendored so `shadcn` (the whole CLI) stays a dev-only dependency and the
// file ships in the tarball. Regenerating embeds the installed version and
// content, so `check-freshness` fails when a shadcn upgrade changes the file
// instead of letting it drift silently.
// `shadcn` exposes ./tailwind.css only under the "style" export condition, so
// resolve the package's main entry and take the sibling file from dist/.
const shadcnDistDir = dirname(Bun.resolveSync('shadcn', __dirname));
const shadcnCssPath = resolve(shadcnDistDir, 'tailwind.css');
const shadcnPkg = await Bun.file(resolve(shadcnDistDir, '../package.json')).json();
const shadcnCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '/*',
  ` * Vendored verbatim from shadcn@${shadcnPkg.version}'s tailwind.css. It defines`,
  ' * the @custom-variant data-* selectors (data-open, data-horizontal, ...), the',
  ' * no-scrollbar utility, and Base UI-aware accordion keyframes that the',
  ' * base-vega components in @vendure-io/ui rely on. Without it, e.g.',
  ' * data-horizontal: compiles to [data-horizontal] instead of',
  ' * [data-orientation="horizontal"] and never matches. theme.css imports this',
  " * after tw-animate-css so shadcn's accordion keyframes win the cascade.",
  ' */',
  '',
  await Bun.file(shadcnCssPath).text(),
].join('\n');

await Bun.write(resolve(cssDir, 'shadcn.css'), shadcnCss);

// ---------------------------------------------------------------------------
// theme.css
// ---------------------------------------------------------------------------

// Base color range mappings — e.g. --color-brand-50: var(--brand-50)
const baseColorLines = Object.keys(baseColorVars).map(
  (key) => `  --color-${key}: var(--${key});`,
);

// Semantic color mappings — every semantic key gets a --color-* alias
const colorLines = Object.keys(lightTheme).map((key) => `  --color-${key}: var(--${key});`);

// Radius lines — reference the :root vars from variables.css so utilities
// track runtime overrides of --radius-*
const radiusLines = Object.keys(radii).map(
  (key) => `  --radius-${key}: var(--radius-${key});`,
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
  // Vendored shadcn/tailwind.css — see the header in shadcn.css for why. Must
  // come after tw-animate-css so shadcn's accordion keyframes win the cascade.
  '@import "./shadcn.css";',
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
// Validation — fail if semantic keys diverge between themes
// ---------------------------------------------------------------------------
const lightKeys = new Set(Object.keys(lightTheme));
const darkKeys = new Set(Object.keys(darkTheme));

const missingInDark = [...lightKeys].filter((k) => !darkKeys.has(k));
const missingInLight = [...darkKeys].filter((k) => !lightKeys.has(k));

if (missingInDark.length > 0) {
  console.error(`✗ Keys in lightTheme missing from darkTheme: ${missingInDark.join(', ')}`);
}
if (missingInLight.length > 0) {
  console.error(`✗ Keys in darkTheme missing from lightTheme: ${missingInLight.join(', ')}`);
}
if (missingInDark.length > 0 || missingInLight.length > 0) {
  process.exit(1);
}

console.log('✓ Generated src/css/variables.css');
console.log('✓ Generated src/css/shadcn.css');
console.log('✓ Generated src/css/theme.css');
