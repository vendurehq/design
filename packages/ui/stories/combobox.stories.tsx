import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
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
      <Combobox items={frameworks}>
        <ComboboxInput aria-label="Framework" placeholder="Search frameworks..." />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList>
            {(framework: (typeof frameworks)[number]) => (
              <ComboboxItem key={framework.value} value={framework}>
                {framework.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
  // Records console errors from the first render on, so the play can check
  // that Base UI logs no warning about the icon button.
  beforeEach: () => {
    const spy = spyOn(console, 'error');
    return () => spy.mockRestore();
  },
  // Opens the list from the icon button. The a11y scan then runs with the list
  // open, while Base UI hides everything outside the input and the list.
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Open options' }));
    const body = within(document.body);
    await waitFor(() => expect(body.getAllByRole('option')).toHaveLength(5));
    // The empty message renders only when no item matches.
    await expect(body.queryByText('No framework found.')).toBeNull();
    const option = body.getByRole('option', { name: 'Remix' });
    await userEvent.hover(option);
    // The menu item radius, as in DropdownMenu.
    await expect(getComputedStyle(option).borderTopLeftRadius).toBe('6px');
    // The icon button is a native <button>, and Base UI is told so.
    await expect(console.error).not.toHaveBeenCalledWith(expect.stringContaining('nativeButton'));
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
