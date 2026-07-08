import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { MultiSelect } from '../src/components/custom/multi-select.tsx';

const meta = {
  title: 'UI/Forms/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
  // baseline args to satisfy required props; all stories use render()
  args: { items: [] },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];

type User = {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
};

const users: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@vendure.io', role: 'Admin' },
  { id: 2, name: 'Alan Turing', email: 'alan@vendure.io', role: 'Editor' },
  { id: 3, name: 'Grace Hopper', email: 'grace@vendure.io', role: 'Admin' },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@vendure.io', role: 'Viewer' },
];

/** Simplest case: an array of strings. The item is both the label and the value. */
export const Default: Story = {
  render: function MultiSelectDefault() {
    return (
      <MultiSelect
        className="w-[260px]"
        items={fruits}
        defaultValue={['Banana']}
        placeholder="Select fruits"
      />
    );
  },
};

/**
 * Fixed width. Pass any `w-*` class to pin the trigger — it stays put and the
 * summary truncates instead of growing, even with every option selected.
 */
export const FixedWidth: Story = {
  render: function MultiSelectFixedWidth() {
    return (
      <MultiSelect
        className="w-[200px]"
        items={fruits}
        defaultValue={fruits}
        placeholder="Select fruits"
      />
    );
  },
};

/**
 * Object items. Point `itemToLabel` at the property to display and
 * `itemToValue` at the property to store — no render code needed.
 */
export const ObjectItems: Story = {
  render: function MultiSelectObjectItems() {
    return (
      <MultiSelect
        className="w-[260px]"
        items={users}
        itemToLabel="name"
        itemToValue="id"
        defaultValue={[1, 3]}
        placeholder="Assign users"
      />
    );
  },
};

/**
 * Full control over the rendered label via a function — here a two-line
 * option with a secondary description.
 */
export const CustomLabel: Story = {
  render: function MultiSelectCustomLabel() {
    return (
      <MultiSelect
        className="w-[280px]"
        items={users}
        itemToValue="id"
        itemToLabel={(user) => (
          <span className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </span>
        )}
        // Keep the trigger compact even though options are two lines.
        renderValue={(selected) => selected.map((u) => u.name).join(', ')}
        defaultValue={[2]}
        placeholder="Assign users"
      />
    );
  },
};

/** Controlled usage: the parent owns the array of selected values. */
export const Controlled: Story = {
  render: function MultiSelectControlled() {
    const [value, setValue] = React.useState<(string | number)[]>(['Apple', 'Grapes']);
    return (
      <div className="flex w-[260px] flex-col gap-2">
        <MultiSelect
          items={fruits}
          value={value}
          onValueChange={setValue}
          placeholder="Select fruits"
        />
        <p className="text-muted-foreground text-sm">
          {value.length > 0 ? `Selected: ${value.join(', ')}` : 'Nothing selected'}
        </p>
      </div>
    );
  },
};

/** Summarise the selection with a count instead of listing every label. */
export const CountSummary: Story = {
  render: function MultiSelectCountSummary() {
    return (
      <MultiSelect
        className="w-[260px]"
        items={users}
        itemToLabel="name"
        itemToValue="id"
        defaultValue={[1, 2, 3]}
        renderValue={(selected) =>
          selected.length === 1 ? selected[0]?.name : `${selected.length} users selected`
        }
        placeholder="Assign users"
      />
    );
  },
};

/** Disabled state. */
export const Disabled: Story = {
  render: function MultiSelectDisabled() {
    return (
      <MultiSelect
        className="w-[260px]"
        items={fruits}
        defaultValue={['Apple']}
        placeholder="Select fruits"
        disabled
      />
    );
  },
};

/** Error state — wires `aria-invalid` onto the trigger. */
export const Invalid: Story = {
  render: function MultiSelectInvalid() {
    return <MultiSelect className="w-[260px]" items={fruits} placeholder="Select fruits" invalid />;
  },
};
