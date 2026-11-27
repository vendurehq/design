import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// A Sheet renders in a portal, which server markup does not draw. These
// checks read the source; the Storybook play tests measure the real
// position in left-to-right and right-to-left pages.
const code = readFileSync(join(import.meta.dir, 'sheet.tsx'), 'utf8');

describe('SheetContent side', () => {
  test('the sides are top, bottom, start and end, and the default is end', () => {
    expect(code).toContain('side: sideProp = "end"');
    expect(code).toContain('side?: "top" | "bottom" | "start" | "end"');
  });

  test('the start and end sheets sit on the logical edge', () => {
    expect(code).toContain('data-[side=start]:start-0');
    expect(code).toContain('data-[side=end]:end-0');
  });

  test('the slide flips in right-to-left', () => {
    expect(code).toContain('motion-safe:data-[side=end]:data-starting-style:translate-x-10');
    expect(code).toContain('motion-safe:rtl:data-[side=end]:data-starting-style:-translate-x-10');
    expect(code).toContain('motion-safe:data-[side=start]:data-starting-style:-translate-x-10');
    expect(code).toContain('motion-safe:rtl:data-[side=start]:data-starting-style:translate-x-10');
  });

  test('the sheet has no physical side in its classes', () => {
    expect(code).not.toMatch(/data-\[side=(left|right)\]|["'](left|right)["']/);
    expect(code).not.toMatch(/[\s"'[:]-?(left|right)-0/);
  });
});
