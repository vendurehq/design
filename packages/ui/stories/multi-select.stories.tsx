import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import * as React from 'react';
import { Label } from '../src/components/atoms/label.tsx';
import { MultiSelect } from '../src/components/molecules/multi-select.tsx';

const meta = {
  title: 'Molecules/MultiSelect',
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

/** A visible label wired to the trigger, so every story control has a name. */
function LabelledField({
  label,
  children,
}: {
  label: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
    </div>
  );
}

/** Simplest case: an array of strings. The item is both the label and the value. */
export const Default: Story = {
  render: function MultiSelectDefault() {
    return (
      <LabelledField label="Fruits">
        {(id) => (
          <MultiSelect
            id={id}
            className="w-[260px]"
            items={fruits}
            defaultValue={['Banana']}
            placeholder="Select fruits"
          />
        )}
      </LabelledField>
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
      <LabelledField label="Fruits">
        {(id) => (
          <MultiSelect
            id={id}
            className="w-[200px]"
            items={fruits}
            defaultValue={fruits}
            placeholder="Select fruits"
          />
        )}
      </LabelledField>
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
      <LabelledField label="Users">
        {(id) => (
          <MultiSelect
            id={id}
            className="w-[260px]"
            items={users}
            itemToLabel="name"
            itemToValue="id"
            defaultValue={[1, 3]}
            placeholder="Assign users"
          />
        )}
      </LabelledField>
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
      <LabelledField label="Users">
        {(id) => (
          <MultiSelect
            id={id}
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
        )}
      </LabelledField>
    );
  },
};

/** Controlled usage: the parent owns the array of selected values. */
export const Controlled: Story = {
  render: function MultiSelectControlled() {
    const [value, setValue] = React.useState<(string | number)[]>(['Apple', 'Grapes']);
    return (
      <div className="flex w-[260px] flex-col gap-2">
        <LabelledField label="Fruits">
          {(id) => (
            <MultiSelect
              id={id}
              items={fruits}
              value={value}
              onValueChange={setValue}
              placeholder="Select fruits"
            />
          )}
        </LabelledField>
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
      <LabelledField label="Users">
        {(id) => (
          <MultiSelect
            id={id}
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
        )}
      </LabelledField>
    );
  },
};

/** Disabled state. */
export const Disabled: Story = {
  render: function MultiSelectDisabled() {
    return (
      <LabelledField label="Fruits">
        {(id) => (
          <MultiSelect
            id={id}
            className="w-[260px]"
            items={fruits}
            defaultValue={['Apple']}
            placeholder="Select fruits"
            disabled
          />
        )}
      </LabelledField>
    );
  },
};

/** Error state — wires `aria-invalid` onto the trigger. */
export const Invalid: Story = {
  render: function MultiSelectInvalid() {
    return (
      <LabelledField label="Fruits">
        {(id) => (
          <MultiSelect
            id={id}
            className="w-[260px]"
            items={fruits}
            placeholder="Select fruits"
            invalid
          />
        )}
      </LabelledField>
    );
  },
};

/**
 * The options are still loading: `items` is `undefined`. The selected values
 * show as a skeleton (their labels come with the options), and the open list
 * shows a loading row, one option tall. Here the options arrive 800 ms after
 * the trigger is focused. The trigger keeps its height.
 */
export const FirstLoad: Story = {
  render: function MultiSelectFirstLoad() {
    const [items, setItems] = React.useState<User[] | undefined>(undefined);
    const started = React.useRef(false);
    return (
      <LabelledField label="Reviewers">
        {(id) => (
          // Starts the fake fetch on the first focus of the trigger.
          <div
            className="w-[280px]"
            onFocus={() => {
              if (started.current) return;
              started.current = true;
              setTimeout(() => setItems(users), 800);
            }}
          >
            <MultiSelect<User>
              id={id}
              items={items}
              itemToValue="id"
              itemToLabel="name"
              defaultValue={[2, 3]}
            />
          </div>
        )}
      </LabelledField>
    );
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Reviewers' });
    const skeleton = trigger.querySelector('[data-slot=multi-select-value-skeleton]');
    await expect(skeleton).not.toBeNull();
    await expect(trigger).toHaveAttribute('aria-busy', 'true');
    const triggerHeight = trigger.offsetHeight;
    await userEvent.click(trigger);
    const loadingRow = await waitFor(() => {
      const row = document.querySelector<HTMLElement>('[data-slot=multi-select-loading]');
      if (!row) throw new Error('no loading row yet');
      return row;
    });
    const loadingRowHeight = loadingRow.offsetHeight;
    const option = await within(document.body).findByRole('option', { name: 'Alan Turing' }, { timeout: 3000 });
    // The loading row is one option tall, and the trigger keeps its height
    // when the labels replace the skeleton.
    await expect(option.offsetHeight).toBe(loadingRowHeight);
    await expect(trigger).toHaveTextContent('Alan Turing, Grace Hopper');
    await expect(trigger).not.toHaveAttribute('aria-busy');
    await expect(trigger.offsetHeight).toBe(triggerHeight);
  },
};

/** The options never arrive, held open: the trigger skeleton and the list's loading row. */
export const FirstLoadHeld: Story = {
  tags: ['!autodocs'],
  render: () => (
    <LabelledField label="Reviewers">
      {(id) => (
        <div className="w-[280px]">
          <MultiSelect<User> id={id} items={undefined} itemToValue="id" itemToLabel="name" defaultValue={[2, 3]} />
        </div>
      )}
    </LabelledField>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Reviewers' });
    await expect(trigger).toHaveTextContent('Loading…');
    await userEvent.click(trigger);
    await waitFor(() => expect(document.querySelector('[data-slot=multi-select-loading]')).not.toBeNull());
  },
};

/** Ends with the list open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Fruits' }));
    await waitFor(() => expect(within(document.body).getByRole('listbox', { name: 'Fruits' })).toBeVisible());
  },
};
