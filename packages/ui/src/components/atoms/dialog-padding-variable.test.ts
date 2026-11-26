import { expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

// Only `--dialog-padding` sets the dialog padding. The 2.x path, which read a
// `p-*` or `px-*` class into the variable through an inline style, is gone, so
// the popups pass the caller's `style` through untouched.
test.each(['dialog.tsx', 'alert-dialog.tsx'])('%s sets no padding from a class', (file) => {
  const code = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
  expect(code).not.toContain('dialogPaddingStyle');
  expect(code).not.toContain('dialog-padding.ts');
  expect(code).toContain('[--dialog-padding:--spacing(5)] p-(--dialog-padding)');
});

test('the class parser is gone', () => {
  expect(existsSync(new URL('../../lib/dialog-padding.ts', import.meta.url))).toBe(false);
});
