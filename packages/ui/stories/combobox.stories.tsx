import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
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
        <ComboboxInput aria-label="Framework" placeholder="Search frameworks..." />
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

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Rest and invalid (`aria-invalid`), in light and dark. Dark mode uses the full
 * destructive border, not a 50% one that was weaker than the rest border.
 * Pinned to the light page theme so the left panel stays light.
 */
export const Invalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <>
          <Combobox items={countries}>
            <ComboboxTrigger aria-label={`Country, ${theme}`} className="w-64">
              <ComboboxValue placeholder="Select a country" />
            </ComboboxTrigger>
          </Combobox>
          <Combobox items={countries}>
            <ComboboxTrigger aria-label={`Country, invalid, ${theme}`} aria-invalid className="w-64">
              <ComboboxValue placeholder="Select a country" />
            </ComboboxTrigger>
          </Combobox>
          <Combobox items={countries}>
            <ComboboxInput aria-label={`Search, invalid, ${theme}`} aria-invalid placeholder="Search" />
          </Combobox>
        </>
      )}
    </LightAndDark>
  ),
};
