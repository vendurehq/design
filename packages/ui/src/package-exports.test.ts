import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
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

const internal = [
  'components/molecules/code-block/transform-command',
  'components/molecules/code-block/file-type-icons',
  'components/molecules/code-block/process-code',
  'components/molecules/data-table/data-table-bulk-actions',
  'components/molecules/data-table/data-table-helpers',
  'components/molecules/id-chip-chrome',
  'components/atoms/label-swap',
  'components/molecules/direction-link',
  'components/molecules/time-tooltip',
  'lib/clipboard',
  'lib/content-inset',
  'lib/control-name',
  'lib/dialog-padding',
  'lib/env',
  'lib/field-surface',
  'lib/format-elapsed',
  'lib/format-messages',
  'lib/format-relative',
  'lib/highlight',
  'lib/menu-item',
  'lib/popup-align',
  'lib/popup-direction',
  'lib/popup-motion',
  'lib/outline-edge',
  'lib/syntax-colors',
  'lib/tint-recipes',
  'lib/trigger-slot',
  'hooks/use-active-label-size',
  'hooks/use-pinned-height',
  'hooks/use-user-toggle-motion',
];

// `lib/` is an allow-list: a new helper there stays internal until it is
// added to `exports` and documented in docs/ui-components.md.
const publicLib = [
  'lib/base-ui',
  'lib/date-value',
  'lib/state-dictionary',
  'lib/tone-icons',
  'lib/utils',
];

describe('package exports', () => {
  test('only the documented lib modules are exported', () => {
    const { exports } = JSON.parse(
      readFileSync(join(import.meta.dir, '..', 'package.json'), 'utf8'),
    );
    const libKeys = Object.keys(exports)
      .filter((key) => key.startsWith('./lib/'))
      .map((key) => key.slice(2));
    expect(libKeys.sort()).toEqual(publicLib);
  });

  test.each(publicLib)('%s is public', (subpath) => {
    expect(resolve(subpath)).toStartWith(join(import.meta.dir, '..', 'src'));
  });

  test.each(internal)('%s is internal', (subpath) => {
    expect(() => resolve(subpath)).toThrow();
  });

  // A consumer transpiles this source, so a package-path import resolves
  // through the exports map there: an internal module must be imported by a
  // relative path.
  test('no source file imports an internal module by its package path', () => {
    const offenders = [...new Bun.Glob('**/*.{ts,tsx}').scanSync(import.meta.dir)].filter(
      (file) => {
        const code = readFileSync(join(import.meta.dir, file), 'utf8');
        return internal.some(
          (subpath) =>
            code.includes(`'@vendure-io/ui/${subpath}'`) ||
            code.includes(`"@vendure-io/ui/${subpath}"`),
        );
      },
    );
    expect(offenders).toEqual([]);
  });

  test.each([
    'components/molecules/code-block',
    'components/molecules/inline-code',
    'components/molecules/data-table/data-table',
    'components/molecules/data-table/data-table-types',
    'components/molecules/illustrations/illustration-types',
    'components/atoms/button',
    'hooks/use-apple-platform',
    'hooks/use-copy',
  ])('%s is public', (subpath) => {
    expect(resolve(subpath)).toStartWith(join(import.meta.dir, '..', 'src'));
  });
});
