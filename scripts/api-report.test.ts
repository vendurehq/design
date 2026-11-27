import { describe, expect, test } from 'bun:test';
import { expandExports } from './api-report.ts';

const files = (dir: string) =>
  ({
    './src/components/atoms': [
      './src/components/atoms/button.tsx',
      './src/components/atoms/button.test.tsx',
      './src/components/atoms/label-swap.tsx',
    ],
    './src/components/molecules': [
      './src/components/molecules/money.tsx',
      './src/components/molecules/data-table/data-table.tsx',
    ],
  })[dir] ?? [];

describe('expandExports', () => {
  test('a pattern lists every published file it matches, nested ones too', () => {
    const entries = expandExports(
      {
        './components/atoms/*': './src/components/atoms/*.tsx',
        './components/molecules/*': './src/components/molecules/*.tsx',
      },
      files,
    );
    expect(entries.map((e) => e.subpath)).toEqual([
      './components/atoms/button',
      './components/atoms/label-swap',
      './components/molecules/data-table/data-table',
      './components/molecules/money',
    ]);
  });

  test('a null export hides a path the pattern would expose', () => {
    const entries = expandExports(
      {
        './components/atoms/*': './src/components/atoms/*.tsx',
        './components/atoms/label-swap': null,
      },
      files,
    );
    expect(entries.map((e) => e.subpath)).toEqual(['./components/atoms/button']);
  });

  test('a conditional export uses its types target', () => {
    const entries = expandExports(
      { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
      files,
    );
    expect(entries).toEqual([{ subpath: '.', file: './dist/index.d.ts' }]);
  });
});
