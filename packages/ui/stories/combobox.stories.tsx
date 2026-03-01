import type { Meta, StoryObj } from '@storybook/react';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from '../src/components/ui/combobox.tsx';

const meta = {
  title: 'UI/Forms/Combobox',
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
