import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// `css/shadcn` is the entry a consumer imports when it builds its own theme
// (the Dashboard does this), so it is the only design-tokens CSS that such a
// consumer loads. Every theme-independent variable that @vendure-io/ui reads,
// that is a colour ramp step or a radius, must be declared there. Otherwise
// the declaration that reads it is invalid and the browser drops it. The
// destructive Button hover reads `--destructive-900`, for example.

const cssDir = resolve(import.meta.dir, 'css');
const uiSrc = resolve(import.meta.dir, '../../ui/src');

const blockDeclarations = (css: string, selector: string): Map<string, string> => {
  const declared = new Map<string, string>();
  const blocks = css.matchAll(
    new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')} \\{([^}]*)\\}`, 'g'),
  );
  for (const [, body] of blocks) {
    for (const [, name, value] of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
      declared.set(name, value.trim());
    }
  }
  return declared;
};

const variablesCss = readFileSync(resolve(cssDir, 'variables.css'), 'utf8');
const rootVars = blockDeclarations(variablesCss, ':root');
const darkVars = blockDeclarations(variablesCss, '.dark');
// Theme-independent: declared in :root and not changed by .dark.
const staticVars = new Map([...rootVars].filter(([name]) => !darkVars.has(name)));

const shadcnVars = blockDeclarations(readFileSync(resolve(cssDir, 'shadcn.css'), 'utf8'), ':root');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    if (!/\.(tsx?|css)$/.test(entry) || /\.(test|stories)\.tsx?$/.test(entry)) return [];
    return [path];
  });

// `var(--x)` in arbitrary values and the Tailwind shorthand `-(--x)`.
const uiReads = new Set<string>();
for (const file of sourceFiles(uiSrc)) {
  for (const [, name] of readFileSync(file, 'utf8').matchAll(/(?:var\(|-\()--([a-z0-9-]+)/g)) {
    uiReads.add(name);
  }
}

describe('css/shadcn static variables', () => {
  test('the scan finds the ramp steps the components read', () => {
    expect(uiReads.has('destructive-900')).toBe(true);
    expect(uiReads.has('brand-500')).toBe(true);
  });

  test('declares every theme-independent variable that @vendure-io/ui reads', () => {
    const missing = [...uiReads]
      .filter((name) => staticVars.has(name) && !shadcnVars.has(name))
      .sort();
    expect(missing).toEqual([]);
  });

  test('declares the full colour ramps, radius scale and --radius with the variables.css values', () => {
    expect(Object.fromEntries(shadcnVars)).toEqual(Object.fromEntries(staticVars));
  });

  test('declares nothing that changes between light and dark', () => {
    expect([...shadcnVars.keys()].filter((name) => darkVars.has(name))).toEqual([]);
  });
});
