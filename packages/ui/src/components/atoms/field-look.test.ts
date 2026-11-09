import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The v3 field, as Input has it: the muted fill, a 1px inset hairline in the
// border colour, the lg (6px) radius, 34px tall, and a 2px ring inside the
// field. Every field shares the recipe in lib/field-surface, so they cannot
// drift apart. These checks read the source; the story
// Atoms/Forms/Field/FieldLook checks the computed look in a browser.

const source = (file: string) => readFileSync(join(import.meta.dir, '..', file), 'utf8');
const recipe = readFileSync(join(import.meta.dir, '../../lib/field-surface.ts'), 'utf8');

const fields = [
  'atoms/input.tsx',
  'atoms/select.tsx',
  'atoms/combobox.tsx',
  'atoms/textarea.tsx',
  'atoms/native-select.tsx',
  'molecules/date-picker.tsx',
  'molecules/date-range-picker.tsx',
  'molecules/date-time-picker.tsx',
];

// The pre-v3 field: a transparent fill, a 1px input border, a 36px height and
// a translucent ring when invalid.
const retired = ['border-input', 'dark:bg-input/30', 'dark:hover:bg-input/50', 'aria-invalid:ring-3', 'data-[size=default]:h-9'];

describe('v3 field look', () => {
  test('the recipe: muted fill, inset hairline, 6px radius, inset ring, invalid hairline', () => {
    for (const token of [
      'bg-muted',
      'shadow-[inset_0_0_0_1px_var(--border)]',
      'rounded-lg',
      'focus-visible:outline-2',
      'focus-visible:-outline-offset-2',
      'focus-visible:outline-ring',
      'aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]',
      'aria-invalid:focus-visible:outline-destructive',
      'forced-colors:border',
    ]) {
      expect(recipe).toContain(token);
    }
  });

  for (const file of fields) {
    test(`${file} uses the field recipe`, () => {
      const code = source(file);
      expect(code).toContain('fieldSurface');
      for (const token of retired) expect({ file, token, found: code.includes(token) }).toEqual({ file, token, found: false });
    });
  }

  test('single-line fields are 34px', () => {
    for (const file of ['atoms/select.tsx', 'atoms/combobox.tsx']) {
      expect(source(file)).toContain('data-[size=default]:h-8.5');
    }
    for (const file of ['atoms/input.tsx', 'atoms/native-select.tsx', 'atoms/input-group.tsx']) {
      expect(source(file)).toContain('h-8.5');
    }
  });

  test('InputGroup draws the field around its control and rings it inside', () => {
    const code = source('atoms/input-group.tsx');
    expect(code).toContain('fieldSurface');
    expect(code).toContain('has-[[data-slot=input-group-control]:focus-visible]:-outline-offset-2');
    expect(code).toContain('has-[[data-slot][aria-invalid=true]]:shadow-[inset_0_0_0_1px_var(--destructive)]');
    for (const token of ['border-input', 'dark:bg-input/30', 'has-[[data-slot][aria-invalid=true]]:ring-3']) {
      expect(code).not.toContain(token);
    }
  });

  test('a native placeholder is fainter than muted text', () => {
    for (const file of ['atoms/input.tsx', 'atoms/textarea.tsx']) {
      const code = source(file);
      expect(code).toContain('placeholder:text-faint-foreground');
      expect(code).not.toContain('placeholder:text-muted-foreground');
    }
  });

  test('a label above its field is 12px muted, 6px above it; red while invalid', () => {
    const code = source('atoms/field.tsx');
    for (const token of [
      'vertical: "flex-col gap-1.5',
      '*:data-[slot=field-label]:text-xs',
      '*:data-[slot=field-label]:text-muted-foreground',
      'data-[invalid=true]:*:data-[slot=field-label]:text-destructive-subtle-foreground',
    ]) {
      expect(code).toContain(token);
    }
  });

  test('InputOTP slots sit on the muted fill with a hairline border, 34px square', () => {
    const code = source('atoms/input-otp.tsx');
    for (const token of ['bg-muted', 'border-border', 'size-8.5', 'first:rounded-l-lg', 'last:rounded-r-lg']) {
      expect(code).toContain(token);
    }
    expect(code).not.toContain('border-input');
  });
});
