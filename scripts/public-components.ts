/**
 * The public components of `@vendure-io/ui`: every PascalCase value exported
 * from an import path under `components/` in the package `exports`.
 * `skills:check` compares them with the guidance catalog.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'typescript';
import { expandExports } from './api-report.ts';

const packageDir = resolve(import.meta.dir, '../packages/ui');

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(join(packageDir, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(packageDir, rel)).isDirectory()) out.push(...listFiles(rel));
    else out.push(rel);
  }
  return out;
}

/** Component name → the import path that exports it. */
export function publicComponents(): Map<string, string> {
  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  // `expandExports` lets `./components/molecules/*` reach paths that a more
  // specific `null` pattern such as `./components/molecules/code-block/*` hides.
  const hidden = Object.entries(manifest.exports as Record<string, unknown>)
    .filter(([key, value]) => value === null && key.endsWith('/*'))
    .map(([key]) => key.slice(0, -1));
  const entries = expandExports(manifest.exports, listFiles).filter(
    (entry) =>
      entry.subpath.startsWith('./components/') &&
      !hidden.some((prefix) => entry.subpath.startsWith(prefix)),
  );
  const program = ts.createProgram(
    entries.map((entry) => join(packageDir, entry.file)),
    { jsx: ts.JsxEmit.ReactJSX, allowJs: false, noEmit: true, skipLibCheck: true },
  );
  const checker = program.getTypeChecker();
  const components = new Map<string, string>();
  for (const entry of entries) {
    const sourceFile = program.getSourceFile(join(packageDir, entry.file));
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) throw new Error(`Cannot read ${entry.file}`);
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      const target =
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      if (!(target.flags & ts.SymbolFlags.Value)) continue;
      if (!/^[A-Z][A-Za-z0-9]*$/.test(symbol.name) || /^[A-Z0-9_]+$/.test(symbol.name)) continue;
      if (!components.has(symbol.name)) components.set(symbol.name, entry.subpath);
    }
  }
  return components;
}

if (import.meta.main) {
  for (const [name, subpath] of publicComponents()) console.log(`${name}\t${subpath}`);
}
