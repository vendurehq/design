import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
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
    await userEvent.click(await within(canvasElement).findByRole('button', { name: 'Open options' }));
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

// With a value and `showClear`, the clear button takes the place of the open
// button. Opens the list with the keyboard, so the a11y scan runs with the
// list open, while Base UI hides everything outside the input and the list.
export const WithClear: Story = {
  render: function ComboboxWithClear() {
    return (
      <Combobox items={frameworks} defaultValue={frameworks[1]}>
        <ComboboxInput aria-label="Framework" placeholder="Search frameworks..." showClear />
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Like the open button, the clear button has a name and stays out of the
    // tab order: Backspace clears the input from the keyboard.
    const clear = canvas.getByRole('button', { name: 'Clear' });
    await expect(clear.tabIndex).toBe(-1);
    const input = canvas.getByRole('combobox', { name: 'Framework' });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(within(document.body).getAllByRole('option').length).toBeGreaterThan(0));
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

/**
 * Several values as chips inside the field. The chips field takes the field
 * look; its focus sits on the input inside, so it rings on focus-within.
 */
export const Chips: Story = {
  render: function ComboboxChipsStory() {
    const chipsAnchor = useComboboxAnchor();
    return (
      <Combobox items={countries} multiple defaultValue={['Austria', 'France']}>
        <ComboboxChips ref={chipsAnchor} className="w-80">
          <ComboboxValue>
            {(values: string[]) =>
              values.map((value) => <ComboboxChip key={value}>{value}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput aria-label="Countries" placeholder="Add a country" />
        </ComboboxChips>
        <ComboboxContent anchor={chipsAnchor}>
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
  play: async ({ canvasElement }) => {
    const chips = canvasElement.querySelector<HTMLElement>('[data-slot="combobox-chips"]') as HTMLElement;
    const probe = document.createElement('div');
    probe.className = 'bg-muted shadow-[inset_0_0_0_1px_var(--border)]';
    canvasElement.append(probe);
    const style = getComputedStyle(chips);
    await expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    await expect(style.boxShadow).toBe(getComputedStyle(probe).boxShadow);
    await expect(style.borderTopLeftRadius).toBe('6px');
    probe.remove();
    // Focus on the input inside rings the whole field, 2px inside.
    within(canvasElement).getByRole('combobox', { name: 'Countries' }).focus();
    await waitFor(() => expect(style.outlineWidth).toBe('2px'));
    await expect(style.outlineOffset).toBe('-2px');
    (document.activeElement as HTMLElement).blur();
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
