import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import cases from './cases.json';

const fixtureRoot = join(tmpdir(), `vendure-design-lint-${process.pid}`);
const pluginPath = (rule: string, severity: 'error' | 'warn' = 'error') =>
  join(import.meta.dir, '..', 'biome', `${rule}${severity === 'warn' ? '-warn' : ''}.grit`);

const messages = {
  'no-raw-colors': /Use a semantic Vendure color slot/g,
  'no-raw-font-sizes': /Use a type role or a scale step/g,
} as const;

beforeAll(async () => {
  await mkdir(fixtureRoot, { recursive: true });
});

afterAll(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

let fixtureCount = 0;

async function lint(code: string, plugin: string) {
  // One directory per call, so concurrent tests never share a fixture.
  const dir = join(fixtureRoot, String(fixtureCount++));
  await mkdir(dir, { recursive: true });
  const fixturePath = join(dir, 'fixture.tsx');
  const configPath = join(dir, 'biome.json');
  await Bun.write(fixturePath, code);
  await Bun.write(
    configPath,
    JSON.stringify({
      plugins: [plugin],
      linter: { enabled: true, rules: { recommended: false } },
    }),
  );

  const proc = Bun.spawn(['bunx', 'biome', 'lint', '--config-path', configPath, fixturePath], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { exitCode, output: `${stdout}\n${stderr}` };
}

for (const rule of Object.keys(messages) as (keyof typeof messages)[]) {
  const message = messages[rule];

  describe(`Biome ${rule}`, () => {
    for (const code of cases[rule].valid) {
      test(`accepts ${code}`, async () => {
        const result = await lint(code, pluginPath(rule));
        expect(result.exitCode, result.output).toBe(0);
      });
    }

    for (const code of cases[rule].invalid) {
      test(`rejects ${code}`, async () => {
        const result = await lint(code, pluginPath(rule));
        expect(result.exitCode, result.output).not.toBe(0);
        expect(result.output.match(message)).toHaveLength(1);
      });
    }

    test('loads the plugin and reports through it (guards against silent load failure)', async () => {
      const code = cases[rule].invalid[0] ?? '';
      const result = await lint(code, pluginPath(rule));
      expect(result.exitCode, result.output).not.toBe(0);
      expect(result.output.match(message)?.length).toBe(1);
    });

    test('offers a warning-level variant for gradual adoption', async () => {
      const code = cases[rule].invalid[0] ?? '';
      const result = await lint(code, pluginPath(rule, 'warn'));
      expect(result.exitCode, result.output).toBe(0);
      expect(result.output.match(message)).toHaveLength(1);
    });

    test('keeps the error and warning variants behaviorally identical', async () => {
      const [errorPlugin, warningPlugin] = await Promise.all([
        readFile(pluginPath(rule), 'utf8'),
        readFile(pluginPath(rule, 'warn'), 'utf8'),
      ]);
      expect(warningPlugin.replaceAll('severity="warn"', 'severity="error"')).toBe(errorPlugin);
    });
  });
}
