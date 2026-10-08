import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Resolve as a consumer does, from outside the package. Inside the package,
// the tsconfig `paths` alias resolves `@vendure-io/ui/*` and skips the exports map.
let consumer = '';

beforeAll(() => {
  consumer = mkdtempSync(join(tmpdir(), 'vendure-ui-consumer-'));
  mkdirSync(join(consumer, 'node_modules', '@vendure-io'), { recursive: true });
  symlinkSync(join(import.meta.dir, '..'), join(consumer, 'node_modules', '@vendure-io', 'ui'));
});

afterAll(() => {
  rmSync(consumer, { recursive: true, force: true });
});

function resolve(subpath: string): string {
  return Bun.resolveSync(`@vendure-io/ui/${subpath}`, consumer);
}

describe('package exports', () => {
  test.each([
    'components/molecules/code-block/transform-command',
    'components/molecules/code-block/file-type-icons',
    'components/molecules/code-block/process-code',
    'components/molecules/data-table/data-table-helpers',
  ])('%s is internal', (subpath) => {
    expect(() => resolve(subpath)).toThrow();
  });

  test.each([
    'components/molecules/code-block',
    'components/molecules/inline-code',
    'components/molecules/data-table/data-table',
    'components/molecules/data-table/data-table-types',
    'components/molecules/illustrations/illustration-types',
    'components/atoms/button',
    'lib/state-dictionary',
    'hooks/use-copy',
  ])('%s is public', (subpath) => {
    expect(resolve(subpath)).toStartWith(join(import.meta.dir, '..', 'src'));
  });
});
