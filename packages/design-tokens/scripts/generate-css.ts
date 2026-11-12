import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brand, neutral, success, warning, destructive, info, viz } from '../src/tokens/colors.ts';
import { lightTheme, darkTheme } from '../src/tokens/semantic.ts';
import {
  fontFamily,
  fontFeatureSettings,
  fontSize,
  fontSizeLineHeight,
  fontWeight,
  letterSpacing,
  textStyles,
} from '../src/tokens/typography.ts';
import { easing, duration, animation, keyframes } from '../src/tokens/motion.ts';
import { radii } from '../src/tokens/radii.ts';
import { darkShadows, lightShadows, shadows } from '../src/tokens/shadows.ts';

// Base color ranges — static across light/dark themes
const colorRanges = { brand, neutral, success, warning, destructive, info, viz };

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssDir = resolve(__dirname, '../src/css');

// ---------------------------------------------------------------------------
// variables.css
// ---------------------------------------------------------------------------

// Biome's CSS line width. A declaration longer than this is wrapped the way
// Biome formats it: the value moves to the next line and its comma-separated
// layers fill each line, so `lint` passes on the generated file.
const LINE_WIDTH = 100;

function declaration(key: string, value: string): string {
  const line = `  --${key}: ${value};`;
  if (line.length <= LINE_WIDTH) return line;
  const layers = value.split(/,\s*(?![^(]*\))/);
  const rows: string[] = [];
  let row = '';
  for (const [index, layer] of layers.entries()) {
    const part = index < layers.length - 1 ? `${layer},` : `${layer};`;
    const candidate = row ? `${row} ${part}` : `    ${part}`;
    if (row && candidate.length > LINE_WIDTH) {
      rows.push(row);
      row = `    ${part}`;
    } else {
      row = candidate;
    }
  }
  rows.push(row);
  return [`  --${key}:`, ...rows].join('\n');
}

// `color-scheme` makes native UI (scrollbars, date inputs, autofill, select
// popups) follow the active theme.
function buildBlock(
  selector: string,
  colorScheme: 'light' | 'dark',
  tokens: Record<string, string>,
): string {
  const lines = Object.entries(tokens).map(([key, value]) => declaration(key, value));
  return `${selector} {\n  color-scheme: ${colorScheme};\n${lines.join('\n')}\n}`;
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

// Themed shadows — values differ per theme, so they are runtime vars in the
// :root and .dark blocks, like the semantic colors.
const toShadowVars = (themed: Record<string, string>) =>
  Object.fromEntries(Object.entries(themed).map(([key, value]) => [`shadow-${key}`, value]));

const variablesCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '',
  buildBlock(':root', 'light', {
    ...baseColorVars,
    ...radiusVars,
    ...semanticRadiusVars,
    ...lightTheme,
    ...toShadowVars(lightShadows),
  }),
  '',
  buildBlock('.dark', 'dark', { ...darkTheme, ...toShadowVars(darkShadows) }),
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
// The state variants (data-open, data-closed, data-checked, data-unchecked,
// data-active) also match the Radix `data-state` value. Base UI sets the
// data-* attribute itself, and nothing sets these `data-state` values, so the
// branch is dropped: a `group-` or `has-` rule built on it makes every change
// of `data-state` (a table row's `selected`) restyle the whole subtree.
const radixStateBranches = ['open', 'closed', 'checked', 'unchecked', 'active'];
function dropRadixStateBranches(css: string): string {
  return radixStateBranches.reduce((out, state) => {
    const branch = `  &:where([data-state="${state}"]),\n`;
    if (out.split(branch).length !== 2) {
      throw new Error(`shadcn tailwind.css: expected one data-state="${state}" branch; the vendored file changed`);
    }
    return out.replace(branch, '');
  }, css);
}

const shadcnCss = [
  '/* AUTO-GENERATED — do not edit manually. Run `bun scripts/generate-css.ts` */',
  '/*',
  ` * Vendored from shadcn@${shadcnPkg.version}'s tailwind.css, without the Radix`,
  ' * data-state branch of the data-open, data-closed, data-checked,',
  ' * data-unchecked and data-active variants. It defines',
  ' * the @custom-variant data-* selectors (data-open, data-horizontal, ...), the',
  ' * no-scrollbar utility, and Base UI-aware accordion keyframes that the',
  ' * base-vega components in @vendure-io/ui rely on. Without it, e.g.',
  ' * data-horizontal: compiles to [data-horizontal] instead of',
  ' * [data-orientation="horizontal"] and never matches. theme.css imports this',
  " * after tw-animate-css so shadcn's accordion keyframes win the cascade.",
  ' */',
  '',
  dropRadixStateBranches(await Bun.file(shadcnCssPath).text()),
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

// Themed shadow lines — reference the :root/.dark vars so the utility follows
// the active theme
const themedShadowLines = Object.keys(lightShadows).map(
  (key) => `  --shadow-${key}: var(--shadow-${key});`,
);

// Font-family lines from typography tokens
const fontLines = Object.entries(fontFamily).map(
  ([key, value]) => `  --font-${key}: ${value};`,
);

// Font feature lines — Tailwind reads `--font-<family>--font-feature-settings`
// for the `font-<family>` utility and the mono preflight defaults
const fontFeatureLines = Object.entries(fontFeatureSettings).map(
  ([key, value]) => `  --font-${key}--font-feature-settings: ${value};`,
);

// Type scale lines — Tailwind text-* utilities
const textLines = Object.entries(fontSize).map(
  ([key, value]) => `  --text-${key}: ${value};`,
);

// Line heights paired with the type scale — Tailwind applies
// --text-<step>--line-height together with the text-<step> utility
const textLineHeightLines = Object.entries(fontSizeLineHeight).map(
  ([key, value]) => `  --text-${key}--line-height: ${value};`,
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
  ([key, value]) => `  --transition-duration-${kebabCase(key)}: ${value};`,
);

// Animation lines — Tailwind animate-* utilities. Each keyframe name they run
// needs a matching @keyframes block, built below. A line longer than Biome's
// width moves its value to the next line, as Biome formats it.
const animationLines = Object.entries(animation).map(([key, value]) => {
  const line = `  --animate-${kebabCase(key)}: ${value};`;
  return line.length <= LINE_WIDTH ? line : `  --animate-${kebabCase(key)}:\n    ${value};`;
});

const themeBlock = [
  ...baseColorLines,
  ...colorLines,
  ...radiusLines,
  ...shadowLines,
  ...themedShadowLines,
  ...fontLines,
  ...fontFeatureLines,
  ...textLines,
  ...textLineHeightLines,
  ...fontWeightLines,
  ...trackingLines,
  ...easeLines,
  ...durationLines,
  ...animationLines,
].join('\n');

// A keyframe declaration longer than Biome's width puts each argument of its
// function on its own line, as Biome formats it: `color-mix(\n in oklab, …\n)`.
function wrapDeclaration(prop: string, value: string): string {
  const line = `    ${prop}: ${value};`;
  const call = value.match(/^([a-z-]+)\((.*)\)$/);
  if (line.length <= LINE_WIDTH || !call) return line;
  const args: string[] = [];
  let depth = 0;
  let start = 0;
  const inner = call[2] ?? '';
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '(') depth++;
    else if (inner[i] === ')') depth--;
    else if (inner[i] === ',' && depth === 0) {
      args.push(inner.slice(start, i).trim());
      start = i + 1;
    }
  }
  args.push(inner.slice(start).trim());
  return `    ${prop}: ${call[1]}(\n${args.map((arg) => `      ${arg}`).join(',\n')}\n    );`;
}

// @keyframes blocks for the --animate-* theme entries above.
function buildKeyframes(name: string, steps: Record<string, Record<string, string>>): string {
  const stepBlocks = Object.entries(steps).map(([stepName, props]) => {
    const lines = Object.entries(props).map(([prop, value]) => wrapDeclaration(kebabCase(prop), value));
    return `  ${stepName} {\n${lines.join('\n')}\n  }`;
  });
  return `@keyframes ${kebabCase(name)} {\n${stepBlocks.join('\n')}\n}`;
}

const keyframesCss = Object.entries(keyframes)
  .map(([name, steps]) => buildKeyframes(name, steps as Record<string, Record<string, string>>))
  .join('\n\n');

// text-style-* utilities — named type compositions (font, size, weight,
// tracking, leading, line breaking). Type only, no color.
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
  '    @apply border-border outline-ring;',
  '  }',
  '  /* One focus ring for every element a component does not style itself:',
  '     2px, solid, 2px outside, in the ring colour. A component\'s own',
  '     focus-visible classes (an inset ring on a field or a row) win. */',
  '  :focus-visible {',
  '    outline: 2px solid var(--ring);',
  '    outline-offset: 2px;',
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
const lightKeys = new Set([...Object.keys(lightTheme), ...Object.keys(toShadowVars(lightShadows))]);
const darkKeys = new Set([...Object.keys(darkTheme), ...Object.keys(toShadowVars(darkShadows))]);

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
