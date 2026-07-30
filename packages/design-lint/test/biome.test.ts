import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import cases from './cases.json';

const fixtureRoot = join(tmpdir(), `vendure-design-lint-${process.pid}`);
const errorPluginPath = join(import.meta.dir, '..', 'biome', 'no-raw-colors.grit');
const warningPluginPath = join(import.meta.dir, '..', 'biome', 'no-raw-colors-warn.grit');

beforeAll(async () => {
  await mkdir(fixtureRoot, { recursive: true });
});

afterAll(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

async function lint(code: string, pluginPath = errorPluginPath) {
  const fixturePath = join(fixtureRoot, 'fixture.tsx');
  const configPath = join(fixtureRoot, 'biome.json');
  await Bun.write(fixturePath, code);
  await Bun.write(
    configPath,
    JSON.stringify({
      plugins: [pluginPath],
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

describe('Biome no-raw-colors', () => {
  for (const code of cases.valid) {
    test(`accepts ${code}`, async () => {
      const result = await lint(code);
      expect(result.exitCode, result.output).toBe(0);
    });
  }

  for (const code of cases.invalid) {
    test(`rejects ${code}`, async () => {
      const result = await lint(code);
      expect(result.exitCode, result.output).not.toBe(0);
      expect(result.output.match(/Use a semantic Vendure color slot/g)).toHaveLength(1);
    });
  }

  test('loads the plugin and reports through it (guards against silent load failure)', async () => {
    const result = await lint("const color = '#ff0000';");
    expect(result.exitCode, result.output).not.toBe(0);
    expect(result.output).toContain('Use a semantic Vendure color slot');
  });

  test('offers a warning-level variant for gradual adoption', async () => {
    const result = await lint("const color = '#fff';", warningPluginPath);
    expect(result.exitCode, result.output).toBe(0);
    expect(result.output.match(/Use a semantic Vendure color slot/g)).toHaveLength(1);
  });

  test('keeps the error and warning variants behaviorally identical', async () => {
    const [errorPlugin, warningPlugin] = await Promise.all([
      readFile(errorPluginPath, 'utf8'),
      readFile(warningPluginPath, 'utf8'),
    ]);
    expect(warningPlugin.replaceAll('severity="warn"', 'severity="error"')).toBe(errorPlugin);
  });
});
