import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fieldSurface } from '@vendure-io/ui/lib/field-surface';
import { renderToStaticMarkup } from 'react-dom/server';
import { Combobox, ComboboxChips, ComboboxChipsInput } from '@vendure-io/ui/components/atoms/combobox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@vendure-io/ui/components/atoms/input-otp';
import { fieldNames, fieldTokens } from '../../test/fields';
import { slotTokens } from '../../test/slot-tokens';

// The v3 field, as Input has it: the muted fill, a 1px inset hairline in the
// border colour, the lg (6px) radius, 34px tall, a 2px ring inside the field,
// and the text 10px in. Every field shares the recipe in lib/field-surface, so
// they cannot drift apart. The per-field checks render each field and read the
// classes it ends up with, so a class that overrides the recipe fails them;
// the story Atoms/Forms/Field/FieldLook checks the computed look in a browser.

const source = (file: string) => readFileSync(join(import.meta.dir, '..', file), 'utf8');
const recipe = readFileSync(join(import.meta.dir, '../../lib/field-surface.ts'), 'utf8');

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

  for (const name of fieldNames) {
    test(`${name} renders the whole field recipe`, () => {
      const tokens = fieldTokens(name);
      for (const token of fieldSurface.split(' ')) expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: true });
      for (const token of retired) expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: false });
    });

    test(`${name} has no border: the fill reaches the edge`, () => {
      const tokens = fieldTokens(name);
      for (const token of ['border', 'bg-clip-padding']) expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: false });
    });

    if (name !== 'Textarea') {
      test(`${name} is 34px`, () => {
        const tokens = fieldTokens(name);
        expect(tokens.includes('h-8.5') || tokens.includes('data-[size=default]:h-8.5')).toBe(true);
      });
    }

    // An InputGroup and the Combobox input start with their addon or input.
    if (!['InputGroup', 'ComboboxInput'].includes(name)) {
      test(`${name} starts its text 10px in`, () => {
        const tokens = fieldTokens(name);
        expect(tokens.includes('px-2.5') || tokens.includes('ps-2.5')).toBe(true);
      });
    }
  }

  test('InputGroup draws the field around its control and rings it inside', () => {
    const tokens = fieldTokens('InputGroup');
    expect(tokens).toContain('has-[[data-slot=input-group-control]:focus-visible]:-outline-offset-2');
    expect(tokens).toContain('has-[[data-slot][aria-invalid=true]]:shadow-[inset_0_0_0_1px_var(--destructive)]');
    for (const token of ['border-input', 'dark:bg-input/30', 'has-[[data-slot][aria-invalid=true]]:ring-3']) {
      expect(tokens).not.toContain(token);
    }
  });

  test('a native placeholder is fainter than muted text', () => {
    for (const file of ['atoms/input.tsx', 'atoms/textarea.tsx']) {
      const code = source(file);
      expect(code).toContain('placeholder:text-faint-foreground');
      expect(code).not.toContain('placeholder:text-muted-foreground');
    }
  });

  test('a placeholder shown as text is as faint as a native one', () => {
    for (const file of ['atoms/select.tsx', 'atoms/combobox.tsx']) {
      const code = source(file);
      expect(code).toContain('data-placeholder:text-faint-foreground');
      expect(code).not.toContain('data-placeholder:text-muted-foreground');
    }
    // The pickers mark their placeholder, so the a11y scan can tell it apart.
    for (const file of ['molecules/date-picker.tsx', 'molecules/date-range-picker.tsx', 'molecules/date-time-picker.tsx']) {
      const code = source(file);
      expect(code).toContain("'text-faint-foreground'");
      expect(code).toContain('data-placeholder={');
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

  // A field whose focus sits on an element inside it rings on focus-within and
  // turns red when a control inside is invalid. Rendered, so an override fails.
  const within = [
    'bg-muted',
    'shadow-[inset_0_0_0_1px_var(--border)]',
    'rounded-lg',
    'forced-colors:border',
    'focus-within:outline-solid',
    'focus-within:outline-2',
    'focus-within:-outline-offset-2',
    'focus-within:outline-ring',
    'has-aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]',
    'has-aria-invalid:focus-within:outline-destructive',
  ];
  const chipsHtml = renderToStaticMarkup(
    <Combobox items={['a']} multiple>
      <ComboboxChips>
        <ComboboxChipsInput />
      </ComboboxChips>
    </Combobox>,
  );
  const otpHtml = renderToStaticMarkup(
    <InputOTP maxLength={2}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
    </InputOTP>,
  );

  for (const [name, html, slot] of [
    ['ComboboxChips', chipsHtml, 'combobox-chips'],
    ['InputOTPGroup', otpHtml, 'input-otp-group'],
  ] as const) {
    test(`${name} takes the focus-within field look`, () => {
      const tokens = slotTokens(html, slot);
      for (const token of within) expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: true });
      for (const token of ['rounded-md', 'has-aria-invalid:ring-3', 'has-aria-invalid:border-destructive']) {
        expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: false });
      }
    });
  }

  test('InputOTP slots sit on the group fill, 34px square, split by a hairline, ringed inside when active', () => {
    const tokens = slotTokens(otpHtml, 'input-otp-slot');
    for (const token of ['size-8.5', 'border-l', 'border-border', 'first:border-l-0', 'data-[active=true]:-outline-offset-2', 'data-[active=true]:outline-ring']) {
      expect(tokens).toContain(token);
    }
    // No fill or outer border of its own: the group draws the field.
    for (const token of ['bg-muted', 'border-y', 'border-r', 'first:border-l', 'aria-invalid:border-destructive']) {
      expect(tokens).not.toContain(token);
    }
  });
});
