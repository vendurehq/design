import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  EntityCombobox,
  type EntityComboboxItem,
  MultiEntityCombobox,
} from '../src/components/molecules/entity-combobox.tsx';

const ORGANIZATIONS = [
  {
    value: 'org_nordic',
    label: 'Nordic Supply Co',
    description: 'nordic-supply',
    keywords: ['Vienna'],
  },
  {
    value: 'org_lumen',
    label: 'Lumen Studio',
    description: 'lumen-studio',
    keywords: ['Berlin'],
  },
  {
    value: 'org_atlas',
    label: 'Atlas Freight',
    description: 'atlas-freight',
    keywords: ['Rotterdam'],
  },
] satisfies EntityComboboxItem[];

const meta = {
  title: 'Molecules/EntityCombobox',
  component: EntityCombobox,
} satisfies Meta<typeof EntityCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div className="w-80 space-y-2">
        <EntityCombobox
          items={ORGANIZATIONS}
          value={value}
          onValueChange={setValue}
          placeholder="Search organizations…"
        />
        <p className="text-muted-foreground font-mono text-xs">{value ?? 'No selection'}</p>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-96 space-y-2">
        <MultiEntityCombobox
          items={ORGANIZATIONS}
          value={value}
          onValueChange={setValue}
          placeholder="Assign organizations…"
        />
        <p className="text-muted-foreground font-mono text-xs">
          {value.length > 0 ? value.join(', ') : 'No selections'}
        </p>
      </div>
    );
  },
};

export const ServerFiltered: Story = {
  render: () => {
    const [query, setQuery] = useState('');
    const [value, setValue] = useState<string | null>(null);
    const results = query
      ? ORGANIZATIONS.filter((item) =>
          `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
        )
      : ORGANIZATIONS;
    return (
      <div className="w-80">
        <EntityCombobox
          items={results}
          selectedItems={ORGANIZATIONS.filter((item) => item.value === value)}
          value={value}
          onValueChange={setValue}
          onInputValueChange={setQuery}
          placeholder="Search the server…"
        />
      </div>
    );
  },
};
