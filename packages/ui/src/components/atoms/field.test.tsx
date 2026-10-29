import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Checkbox } from './checkbox.tsx';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldDescribedBy,
  mergeFieldControlProps,
} from './field.tsx';
import { Input } from './input.tsx';
import { Textarea } from './textarea.tsx';

// Static rendering runs no effects, so message registration (and with it the
// rendered aria-describedby) is covered through the pure helpers; the ids,
// aria-invalid and explicit-prop precedence are covered through markup.

function attr(html: string, slot: string, name: string): string | undefined {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  return tag?.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

describe('fieldDescribedBy', () => {
  test('lists descriptions before errors, in mount order', () => {
    expect(
      fieldDescribedBy([
        { id: 'err', kind: 'error' },
        { id: 'desc-1', kind: 'description' },
        { id: 'desc-2', kind: 'description' },
      ]),
    ).toBe('desc-1 desc-2 err');
  });

  test('is undefined when nothing is rendered', () => {
    expect(fieldDescribedBy([])).toBeUndefined();
  });
});

describe('mergeFieldControlProps', () => {
  const field = { describedBy: 'desc err', invalid: true };

  test('adds the field ids and invalid state', () => {
    expect(mergeFieldControlProps({}, field)).toEqual({
      'aria-describedby': 'desc err',
      'aria-invalid': true,
    });
  });

  test('explicit aria-describedby and aria-invalid win', () => {
    expect(
      mergeFieldControlProps({ 'aria-describedby': 'own', 'aria-invalid': false }, field),
    ).toEqual({ 'aria-describedby': 'own', 'aria-invalid': false });
  });

  test('a valid field adds no aria-invalid', () => {
    expect(mergeFieldControlProps({}, { describedBy: undefined, invalid: false })).toEqual({
      'aria-describedby': undefined,
      'aria-invalid': undefined,
    });
  });

  test('outside a Field, props pass through unchanged', () => {
    const props = { 'aria-describedby': 'own' };
    expect(mergeFieldControlProps(props, null)).toBe(props);
  });
});

describe('Field markup', () => {
  test('description and error get stable ids', () => {
    const html = renderToStaticMarkup(
      <Field data-invalid="true">
        <FieldLabel htmlFor="sku">SKU</FieldLabel>
        <Input id="sku" />
        <FieldDescription>Unique per variant.</FieldDescription>
        <FieldError>Enter a SKU.</FieldError>
      </Field>,
    );
    expect(attr(html, 'field-description', 'id')).toBeTruthy();
    expect(attr(html, 'field-error', 'id')).toBeTruthy();
    expect(attr(html, 'field-description', 'id')).not.toBe(attr(html, 'field-error', 'id'));
  });

  test('a consumer id on a message is kept', () => {
    const html = renderToStaticMarkup(
      <Field>
        <FieldDescription id="sku-help">Unique per variant.</FieldDescription>
      </Field>,
    );
    expect(attr(html, 'field-description', 'id')).toBe('sku-help');
  });

  test('controls in an invalid field get aria-invalid', () => {
    for (const control of [<Input key="i" />, <Textarea key="t" />, <Checkbox key="c" />]) {
      const html = renderToStaticMarkup(<Field data-invalid="true">{control}</Field>);
      expect(html).toContain('aria-invalid="true"');
    }
  });

  test('controls in a valid field get no aria-invalid', () => {
    const html = renderToStaticMarkup(
      <Field>
        <Input />
      </Field>,
    );
    expect(attr(html, 'input', 'aria-invalid')).toBeUndefined();
  });

  test("a control's explicit aria-invalid and aria-describedby win", () => {
    const html = renderToStaticMarkup(
      <Field data-invalid="true">
        <Input aria-invalid={false} aria-describedby="own-hint" />
      </Field>,
    );
    expect(attr(html, 'input', 'aria-invalid')).toBe('false');
    expect(attr(html, 'input', 'aria-describedby')).toBe('own-hint');
  });

  test('an empty FieldError renders nothing', () => {
    const html = renderToStaticMarkup(
      <Field>
        <FieldError errors={[]} />
      </Field>,
    );
    expect(html).not.toContain('field-error');
  });
});
