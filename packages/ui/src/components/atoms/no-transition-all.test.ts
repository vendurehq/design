import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';

const dir = new URL('./', import.meta.url);
const sources = readdirSync(dir)
  .filter((file) => file.endsWith('.tsx') && !file.includes('.test.'))
  .map((file) => [file, readFileSync(new URL(file, dir), 'utf8')] as const);

describe('transition properties', () => {
  test('no atom uses transition-all', () => {
    expect(sources.filter(([, source]) => /(^|[\s"'`])transition-all([\s"'`]|$)/.test(source)).map(([file]) => file)).toEqual([]);
  });

  test.each([
    ['tabs.tsx', 'transition-[color,background-color,border-color,box-shadow,opacity]'],
    ['tabs.tsx', 'transition-[color,opacity]'],
    ['navigation-menu.tsx', 'transition-[background-color,opacity]'],
    ['navigation-menu.tsx', 'transition-[color,background-color]'],
    ['switch.tsx', 'transition-[background-color,border-color,box-shadow,opacity]'],
    ['badge.tsx', 'transition-[color,background-color,border-color]'],
    ['sidebar.tsx', 'transition-[left,right,translate,background-color] ease-drawer'],
  ])('%s lists %s', (file, classes) => {
    expect(sources.find(([name]) => name === file)?.[1]).toContain(classes);
  });
});
