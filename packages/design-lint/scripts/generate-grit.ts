import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  arbitraryFontSize,
  classStart,
  colorFunctionNames,
  opacitySuffix,
  oversizedFontSize,
  rampNames,
  rampSteps,
  utilityPrefixes,
} from '../eslint/pattern-parts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const biomeDir = resolve(__dirname, '../biome');

// This regex flavor has no lookaround, so boundaries are spelled as negated
// character classes and the hex alternatives that need an a-f letter enumerate
// the position of the first letter. Mirrors eslint/index.js.
const hexWithLetter = (length: number) =>
  Array.from(
    { length },
    (_, digits) => `[0-9]{${digits}}[a-fA-F][0-9a-fA-F]{${length - digits - 1}}`,
  ).join('|');
const rampUtility = `(?:^|[^a-z0-9_-])(?:${utilityPrefixes}-${rampNames}-${rampSteps}${opacitySuffix}!?|${utilityPrefixes}-(?:black|white)${opacitySuffix}!?)`;
const rampVariable = `(?:^|[^a-z0-9])var\\(\\s*--(?:color-)?${rampNames}-${rampSteps}\\s*\\)`;
// `_` is a boundary because Tailwind arbitrary values use it for spaces.
const hexBoundary = '(?:^|[^&a-z0-9-])';
const hexEnd = '(?:[^0-9a-fA-F]|$)';
const hexWithLetters = [3, 4, 6, 8].map(hexWithLetter).join('|');
const hexAlpha = `${hexBoundary}#(?:${hexWithLetters})${hexEnd}`;
// A pure-decimal 6/8-digit run after a letter and a space is a reference such
// as `Order #100234`, not a color.
const hexLongDecimal = `(?:^|[^&a-z0-9 -]|(?:^|[^a-z]) )#(?:[0-9]{6}|[0-9]{8})${hexEnd}`;
const colorFunction = `(?:^|[^a-z0-9])${colorFunctionNames}\\(`;

const forbiddenColor = `(?i).*(?:${rampUtility}|${rampVariable}|${hexAlpha}|${hexLongDecimal}|${colorFunction}).*`;

const colorMessage =
  'Use a semantic Vendure color slot. Raw colors belong only in theme definitions.';

const colorHeader = `// The hex alternatives with an a-f letter enumerate the position of the first
// letter because this regex flavor has no lookaround. A purely decimal 3/4-digit
// run (e.g. a GitHub issue ref like \`(#2608)\`) is not treated as a #RGB(A)
// color. A purely decimal 6/8-digit run is a color, except after a letter and a
// space (e.g. \`Order #100234\`). Mirrors eslint/index.js.`;

const forbiddenFontSize = `.*${classStart}(?:${arbitraryFontSize}|${oversizedFontSize}).*`;

const fontSizeMessage =
  'Use a type role or a scale step (text-2xs to text-5xl). Arbitrary font sizes and text-6xl to text-9xl are not design-system sizes.';

const fontSizeHeader = `// Flags an arbitrary font size (text-[13px], text-[length:…], text-[clamp(…)])
// and Tailwind's text-6xl to text-9xl. A bare text-[var(--x)] is a colour to
// Tailwind and is not flagged. Mirrors eslint/index.js.`;

function gritFile(
  pattern: string,
  message: string,
  header: string,
  severity: 'error' | 'warn',
): string {
  const diagnostic = (span: string) =>
    `register_diagnostic(span=${span}, message="${message}", severity="${severity}")`;
  return `engine biome(1.0)
language js(typescript, jsx)

// AUTO-GENERATED — do not edit manually. Run \`bun scripts/generate-grit.ts\`;
// the pattern is composed from eslint/pattern-parts.js so both engines stay
// behaviorally equivalent.
//
${header}
or {
  JsxAttribute() as $attribute where {
    $attribute <: r"(?i)(?:className|style|fill|stroke|stopColor)=(?:\\"[^\\"]*\\"|'[^']*')",
    $attribute <: r"${pattern}",
    ${diagnostic('$attribute')}
  },
  string() as $literal where {
    $literal <: r"${pattern}",
    ${diagnostic('$literal')}
  },
  JsTemplateChunkElement() as $literal where {
    $literal <: r"${pattern}",
    ${diagnostic('$literal')}
  }
}
`;
}

for (const severity of ['error', 'warn'] as const) {
  const suffix = severity === 'warn' ? '-warn' : '';
  await Bun.write(
    resolve(biomeDir, `no-raw-colors${suffix}.grit`),
    gritFile(forbiddenColor, colorMessage, colorHeader, severity),
  );
  await Bun.write(
    resolve(biomeDir, `no-raw-font-sizes${suffix}.grit`),
    gritFile(forbiddenFontSize, fontSizeMessage, fontSizeHeader, severity),
  );
}
