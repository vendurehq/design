/**
 * API reports for the published packages.
 *
 *   bun scripts/api-report.ts           write packages/<name>/api-report.md
 *   bun scripts/api-report.ts --check   fail when a report differs from the code
 *
 * A report lists every import path in the package's `exports` and, for each
 * TypeScript or JavaScript entry, its declarations as `tsc` emits them
 * (comments removed), followed by every package module those declarations
 * import types from. A CSS entry lists the custom properties, utilities,
 * variants and keyframes it defines. Any change to the public API changes the
 * report, so the change shows in review.
 *
 * The packages ship raw source (`ui`) or build from source (`design-tokens`),
 * so the report reads the source and needs no build. An export into `dist/`
 * maps to the matching file in `src/`.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(import.meta.dir, '..');
const packages = ['ui', 'design-tokens', 'design-lint'];
const reportName = 'api-report.md';

type ExportTarget = string | null | { [condition: string]: ExportTarget };

export type Entry = { subpath: string; file: string };

/** Picks the file a conditional export resolves to for a type checker. */
function pickTarget(target: ExportTarget): string | null {
  if (target === null || typeof target === 'string') return target;
  for (const condition of ['types', 'import', 'default']) {
    if (condition in target) return pickTarget(target[condition] ?? null);
  }
  return null;
}

/** Files under `dir`, as `./`-prefixed paths relative to `packageDir`. */
function listFiles(packageDir: string, dir: string): string[] {
  const abs = join(packageDir, dir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  for (const name of readdirSync(abs)) {
    const rel = `${dir}/${name}`;
    if (statSync(join(packageDir, rel)).isDirectory()) out.push(...listFiles(packageDir, rel));
    else out.push(rel);
  }
  return out;
}

/** Files the package leaves out of its tarball, and story files. */
const notPublished = /\.test\.[jt]sx?$|\.stories\.[jt]sx?$|\/test\//;

/**
 * Expands a package's `exports` into one entry per import path, the way Node
 * resolves them: `*` matches any string (slashes included), an exact key wins
 * over a pattern, and a `null` target hides the path.
 */
export function expandExports(
  exportsMap: Record<string, ExportTarget>,
  files: (dir: string) => string[],
): Entry[] {
  const entries = new Map<string, string | null>();
  for (const [key, value] of Object.entries(exportsMap)) {
    const target = pickTarget(value);
    if (!key.includes('*')) continue;
    if (target === null) continue;
    const [keyPrefix, keySuffix] = key.split('*') as [string, string];
    const [prefix, suffix] = target.split('*') as [string, string];
    for (const file of files(dirname(`${prefix}x`))) {
      if (!file.startsWith(prefix) || !file.endsWith(suffix)) continue;
      if (notPublished.test(file)) continue;
      const match = file.slice(prefix.length, file.length - suffix.length);
      entries.set(`${keyPrefix}${match}${keySuffix}`, file);
    }
  }
  // Exact keys, `null` included, win over patterns.
  for (const [key, value] of Object.entries(exportsMap)) {
    if (!key.includes('*')) entries.set(key, pickTarget(value));
  }
  return [...entries]
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([subpath, file]) => ({ subpath, file }))
    .sort((a, b) => a.subpath.localeCompare(b.subpath));
}

/** `./dist/tokens/index.d.ts` → `./src/tokens/index.ts` when that exists. */
function sourceFor(packageDir: string, file: string): string {
  if (!file.startsWith('./dist/')) return file;
  const stem = file.replace(/^\.\/dist\//, './src/').replace(/(\.d)?\.[cm]?[jt]s$/, '');
  for (const ext of ['.ts', '.tsx']) {
    if (existsSync(join(packageDir, stem + ext))) return stem + ext;
  }
  return file;
}

function compilerOptions(packageDir: string): ts.CompilerOptions {
  const configPath = join(packageDir, 'tsconfig.json');
  const base = existsSync(configPath)
    ? (ts.getParsedCommandLineOfConfigFile(
        configPath,
        {},
        {
          ...ts.sys,
          onUnRecoverableConfigFileDiagnostic: (d) => {
            throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
          },
        },
      )?.options ?? {})
    : ts.convertCompilerOptionsFromJson(
        JSON.parse(readFileSync(join(root, 'tsconfig.base.json'), 'utf8')).compilerOptions,
        root,
      ).options;
  return {
    ...base,
    allowJs: true,
    checkJs: false,
    noEmit: false,
    declaration: true,
    emitDeclarationOnly: true,
    declarationMap: false,
    sourceMap: false,
    removeComments: true,
    rootDir: packageDir,
    outDir: join(packageDir, '.api-report-out'),
  };
}

const fence = (lang: string, body: string) => `\`\`\`${lang}\n${body.trimEnd()}\n\`\`\``;

function cssSurface(text: string): string {
  const names = new Set<string>();
  for (const m of text.matchAll(/(?:^|[\s{;])(--[\w-]+)\s*:/g)) names.add(m[1] as string);
  for (const m of text.matchAll(/@(utility|custom-variant|keyframes)\s+([\w-]+)/g)) {
    names.add(`@${m[1]} ${m[2]}`);
  }
  return [...names].sort().join('\n');
}

/** Builds the report of one package. Throws when the declarations do not emit. */
export function buildReport(name: string): string {
  const packageDir = join(root, 'packages', name);
  const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  const entries = expandExports(manifest.exports, (dir) => listFiles(packageDir, dir));

  const out: string[] = [
    `# API report: ${manifest.name}`,
    '',
    '<!-- Generated by `bun run api:update`. Do not edit. CI fails when the public API differs from this file. -->',
    '',
    '## Import paths',
    '',
    ...entries.map((e) => `- \`${manifest.name}${e.subpath.slice(1)}\` → \`${e.file}\``),
  ];

  const codeEntries = entries
    .map((e) => ({ ...e, source: sourceFor(packageDir, e.file) }))
    .filter((e) => /\.[cm]?[jt]sx?$/.test(e.source) && !e.source.endsWith('.d.ts'));
  const options = compilerOptions(packageDir);
  const program = ts.createProgram(
    codeEntries.map((e) => join(packageDir, e.source)),
    options,
  );

  const declarations = new Map<string, string>();
  const emit = (fileName: string): string => {
    const cached = declarations.get(fileName);
    if (cached !== undefined) return cached;
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) throw new Error(`${name}: cannot read ${fileName}`);
    const diagnostics = program.getDeclarationDiagnostics(sourceFile);
    if (diagnostics.length > 0) {
      throw new Error(
        ts.formatDiagnostics(diagnostics, {
          getCanonicalFileName: (f) => f,
          getCurrentDirectory: () => root,
          getNewLine: () => '\n',
        }),
      );
    }
    let text = '';
    program.emit(
      sourceFile,
      (_file, data) => {
        text = data;
      },
      undefined,
      true,
    );
    declarations.set(fileName, text);
    return text;
  };

  // The declarations of each entry, then every package module they import
  // types from, so a change behind a re-export or a shared type shows too.
  const internal = new Set<string>();
  const entryFiles = new Set(codeEntries.map((e) => join(packageDir, e.source)));
  const queue = [...entryFiles];
  while (queue.length > 0) {
    const fileName = queue.shift() as string;
    const text = emit(fileName);
    for (const m of text.matchAll(/(?:from|import\()\s*["']([^"']+)["']/g)) {
      const resolved = ts.resolveModuleName(m[1] as string, fileName, options, ts.sys)
        .resolvedModule?.resolvedFileName;
      if (!resolved) continue;
      const rel = relative(packageDir, resolved);
      if (rel.startsWith('..') || rel.includes('node_modules') || resolved.endsWith('.d.ts')) {
        continue;
      }
      if (entryFiles.has(resolved) || internal.has(resolved)) continue;
      internal.add(resolved);
      queue.push(resolved);
    }
  }

  for (const entry of codeEntries) {
    out.push(
      '',
      `## \`${manifest.name}${entry.subpath.slice(1)}\``,
      '',
      fence('ts', emit(join(packageDir, entry.source)) || '// no declarations'),
    );
  }
  for (const fileName of [...internal].sort()) {
    out.push(
      '',
      `## Internal: \`${relative(packageDir, fileName)}\``,
      '',
      fence('ts', emit(fileName) || '// no declarations'),
    );
  }
  for (const entry of entries.filter((e) => e.file.endsWith('.css'))) {
    out.push(
      '',
      `## \`${manifest.name}${entry.subpath.slice(1)}\``,
      '',
      fence('css', cssSurface(readFileSync(join(packageDir, entry.file), 'utf8'))),
    );
  }
  return `${out.join('\n')}\n`;
}

function main() {
  const check = process.argv.includes('--check');
  // `ui` reads the token types from the built package; without them its types
  // turn into `any` and the report is wrong.
  if (!existsSync(join(root, 'packages/design-tokens/dist/tokens/index.d.ts'))) {
    console.error('Build @vendure-io/design-tokens first: `bun run build`.');
    process.exit(1);
  }
  let stale = 0;
  for (const name of packages) {
    const path = join(root, 'packages', name, reportName);
    const report = buildReport(name);
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    if (report === current) continue;
    if (!check) {
      writeFileSync(path, report);
      console.log(`Updated packages/${name}/${reportName}`);
      continue;
    }
    stale++;
    const tmp = join(root, 'packages', name, `.${reportName}.new`);
    writeFileSync(tmp, report);
    const diff = Bun.spawnSync(['diff', '-u', path, tmp]).stdout.toString();
    unlinkSync(tmp);
    console.error(diff.split('\n').slice(0, 80).join('\n'));
    console.error(
      `The public API of @vendure-io/${name} changed. Run \`bun run api:update\` and commit packages/${name}/${reportName}.`,
    );
  }
  if (stale > 0) process.exit(1);
  if (check) console.log('API reports are up to date.');
}

if (import.meta.main) main();
