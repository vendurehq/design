// Test helper, not shipped: the package `files` list leaves out src/test.
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxValue } from '@vendure-io/ui/components/atoms/combobox';
import { Input } from '@vendure-io/ui/components/atoms/input';
import { InputGroup, InputGroupInput } from '@vendure-io/ui/components/atoms/input-group';
import { NativeSelect, NativeSelectOption } from '@vendure-io/ui/components/atoms/native-select';
import { Select, SelectTrigger, SelectValue } from '@vendure-io/ui/components/atoms/select';
import { Textarea } from '@vendure-io/ui/components/atoms/textarea';
import { DatePicker } from '@vendure-io/ui/components/molecules/date-picker';
import { DateRangePicker } from '@vendure-io/ui/components/molecules/date-range-picker';
import { DateTimePicker } from '@vendure-io/ui/components/molecules/date-time-picker';
import type * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTokens } from './slot-tokens';

/**
 * Every field that takes the v3 field look, rendered, with the data-slot of
 * the element that draws the field. Tests read the classes that element
 * renders, after the component's own classes and tailwind-merge.
 */
const fields = {
  Input: { slot: 'input', element: <Input /> },
  Textarea: { slot: 'textarea', element: <Textarea /> },
  Select: {
    slot: 'select-trigger',
    element: (
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    ),
  },
  NativeSelect: {
    slot: 'native-select',
    element: (
      <NativeSelect>
        <NativeSelectOption value="a">A</NativeSelectOption>
      </NativeSelect>
    ),
  },
  ComboboxTrigger: {
    slot: 'combobox-trigger',
    element: (
      <Combobox items={['a']}>
        <ComboboxTrigger>
          <ComboboxValue />
        </ComboboxTrigger>
      </Combobox>
    ),
  },
  ComboboxInput: {
    slot: 'input-group',
    element: (
      <Combobox items={['a']}>
        <ComboboxInput />
      </Combobox>
    ),
  },
  InputGroup: {
    slot: 'input-group',
    element: (
      <InputGroup>
        <InputGroupInput />
      </InputGroup>
    ),
  },
  DatePicker: { slot: 'popover-trigger', element: <DatePicker /> },
  DateRangePicker: { slot: 'popover-trigger', element: <DateRangePicker /> },
  DateTimePicker: { slot: 'popover-trigger', element: <DateTimePicker /> },
} satisfies Record<string, { slot: string; element: React.ReactElement }>;

export type FieldName = keyof typeof fields;
export const fieldNames = Object.keys(fields) as FieldName[];

/** The class tokens the element that draws the named field renders. */
export function fieldTokens(name: FieldName): string[] {
  const { slot, element } = fields[name];
  return slotTokens(renderToStaticMarkup(element), slot);
}
