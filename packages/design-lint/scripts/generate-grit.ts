import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  colorFunctionNames,
  opacitySuffix,
  rampNames,
  rampSteps,
  utilityPrefixes,
} from '../eslint/pattern-parts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const biomeDir = resolve(__dirname, '../biome');

// This regex flavor has no lookahead, so boundaries are spelled as negated
// character classes and the 3/4-digit hex alternatives enumerate the position
// of the first a-f letter. Mirrors eslint/index.js.
const rampUtility = `(?:^|[^a-z0-9_-])(?:${utilityPrefixes}-${rampNames}-${rampSteps}${opacitySuffix}!?|${utilityPrefixes}-(?:black|white)${opacitySuffix}!?)`;
const rampVariable = `(?:^|[^a-z0-9_])var\\(\\s*--(?:color-)?${rampNames}-${rampSteps}\\s*\\)`;
const hexShort =
  '(?:^|[^&a-z0-9_-])#(?:[a-fA-F][0-9a-fA-F]{2,3}|[0-9][a-fA-F][0-9a-fA-F]{1,2}|[0-9]{2}[a-fA-F][0-9a-fA-F]?|[0-9]{3}[a-fA-F])(?:[^0-9a-fA-F]|$)';
const hexSix = '(?:^|[^&a-z0-9_-])#[0-9a-fA-F]{6}(?:[^0-9a-fA-F]|$)';
const hexEight = '(?:^|[^&a-z0-9_-])#[0-9a-fA-F]{8}(?:[^0-9a-fA-F]|$)';
const colorFunction = `(?:^|[^a-z0-9_])${colorFunctionNames}\\(`;

const forbiddenColor = `(?i).*(?:${rampUtility}|${rampVariable}|${hexShort}|${hexSix}|${hexEight}|${colorFunction}).*`;

const message = 'Use a semantic Vendure color slot. Raw colors belong only in theme definitions.';

function gritFile(severity: 'error' | 'warn'): string {
  const diagnostic = (span: string) =>
    `register_diagnostic(span=${span}, message="${message}", severity="${severity}")`;
  return `engine biome(1.0)
language js(typescript, jsx)

// AUTO-GENERATED — do not edit manually. Run \`bun scripts/generate-grit.ts\`;
// the pattern is composed from eslint/pattern-parts.js so both engines stay
// behaviorally equivalent.
//
// The 3/4-digit hex alternatives enumerate the position of the first a-f
// letter because this regex flavor has no lookahead. A purely decimal 3/4-digit
// run (e.g. a GitHub issue ref like \`(#2608)\`) is not treated as a #RGB(A)
// color; the 6/8-digit branches stay permissive. Mirrors eslint/index.js.
or {
  JsxAttribute() as $attribute where {
    $attribute <: r"(?i)(?:className|style)=(?:\\"[^\\"]*\\"|'[^']*')",
    $attribute <: r"${forbiddenColor}",
    ${diagnostic('$attribute')}
  },
  string() as $literal where {
    $literal <: r"${forbiddenColor}",
    ${diagnostic('$literal')}
  },
  JsTemplateChunkElement() as $literal where {
    $literal <: r"${forbiddenColor}",
    ${diagnostic('$literal')}
  }
}
`;
}

await Bun.write(resolve(biomeDir, 'no-raw-colors.grit'), gritFile('error'));
await Bun.write(resolve(biomeDir, 'no-raw-colors-warn.grit'), gritFile('warn'));
