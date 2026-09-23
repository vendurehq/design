import type { Meta, StoryObj } from '@storybook/react';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '../src/components/atoms/combobox.tsx';

const meta = {
  title: 'Atoms/Forms/Combobox',
  component: ComboboxInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ComboboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte', label: 'SvelteKit' },
];

export const Default: Story = {
  render: function ComboboxDefault() {
    return (
      <Combobox>
        <ComboboxInput placeholder="Search frameworks..." />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>No framework found.</ComboboxEmpty>
            <ComboboxGroup>
              <ComboboxLabel>Frameworks</ComboboxLabel>
              {frameworks.map((framework) => (
                <ComboboxItem key={framework.value} value={framework.value}>
                  {framework.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

const countries = ['Austria', 'France', 'Germany', 'Netherlands', 'Switzerland'];

// A select-like combobox: the trigger shows the value and has field styling
// (the same as SelectTrigger), and the search input sits in the popup.
export const FieldTrigger: Story = {
  render: function ComboboxFieldTrigger() {
    return (
      <Combobox items={countries}>
        <ComboboxTrigger aria-label="Country" className="w-64">
          <ComboboxValue placeholder="Select a country" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput aria-label="Search countries" placeholder="Search" showTrigger={false} />
          <ComboboxEmpty>No country matches.</ComboboxEmpty>
          <ComboboxList>
            {(country: string) => (
              <ComboboxItem key={country} value={country}>
                {country}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};
