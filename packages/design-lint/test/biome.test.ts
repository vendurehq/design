import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import cases from './cases.json';

const fixtureRoot = join(tmpdir(), `vendure-design-lint-${process.pid}`);
const pluginPath = join(import.meta.dir, '..', 'biome', 'no-raw-colors.grit');

beforeAll(async () => {
  await mkdir(fixtureRoot, { recursive: true });
});

afterAll(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

async function lint(code: string) {
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

  const process = Bun.spawn(['bunx', 'biome', 'lint', '--config-path', configPath, fixturePath], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    process.exited,
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
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
      expect(result.output).toContain('Use a semantic Vendure color slot');
    });
  }
});
