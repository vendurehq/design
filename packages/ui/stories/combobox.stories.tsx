import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { Field, FieldLabel } from '../src/components/atoms/field.tsx';
import { checkCheckMark } from './menu-checked-row.ts';
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
    // The list takes the input's name.
    await expect(body.getByRole('listbox')).toHaveAccessibleName('Framework');
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
    // The selected option shows the check of a checked menu row.
    const options = within(document.body).getAllByRole('option');
    const selected = options.find((option) => option.getAttribute('aria-selected') === 'true');
    await checkCheckMark(selected as HTMLElement, options.find((option) => option !== selected));
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
  // With the search input inside it, the popup is a dialog. The dialog and the
  // list take the trigger's name. The story ends open, so the check scans them.
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Country' }));
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole('dialog')).toHaveAccessibleName('Country'));
    await expect(body.getByRole('listbox')).toHaveAccessibleName('Country');
  },
};

/** A field label names the input, and the open list takes the same name. */
export const FieldLabelled: Story = {
  render: () => (
    <Field className="w-64">
      <FieldLabel htmlFor="combobox-framework">Framework</FieldLabel>
      <Combobox items={frameworks}>
        <ComboboxInput id="combobox-framework" placeholder="Search frameworks..." />
        <ComboboxContent>
          <ComboboxList>
            {(framework: (typeof frameworks)[number]) => (
              <ComboboxItem key={framework.value} value={framework}>
                {framework.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole('button', { name: 'Open options' }));
    await waitFor(() => expect(within(document.body).getByRole('listbox')).toHaveAccessibleName('Framework'));
  },
};

/** A name set on ComboboxContent wins over the trigger's. */
export const OwnPopupName: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Combobox items={countries}>
      <ComboboxTrigger aria-label="Country" className="w-64">
        <ComboboxValue placeholder="Select a country" />
      </ComboboxTrigger>
      <ComboboxContent aria-label="Shipping country">
        <ComboboxInput aria-label="Search countries" placeholder="Search" showTrigger={false} />
        <ComboboxList>
          {(country: string) => (
            <ComboboxItem key={country} value={country}>
              {country}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Country' }));
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toHaveAccessibleName('Shipping country'));
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
    // A chip stands out from the field: its own fill and a grey outline, the
    // v3 look's grey chip.
    const chip = canvasElement.querySelector<HTMLElement>('[data-slot="combobox-chip"]') as HTMLElement;
    await expect(getComputedStyle(chip).backgroundColor).not.toBe(style.backgroundColor);
    await expect(getComputedStyle(chip).boxShadow).not.toBe('none');
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

/**
 * A list that is closing is hidden from assistive technology at once: the
 * input no longer points at it. The play function holds the list in its
 * closing state with a paused script animation, so the accessibility check
 * scans it while it closes. (Storybook switches CSS transitions off when a play
 * function ends in the test runner.)
 */
export const ClosingList: Story = {
  render: () => (
    <Combobox items={frameworks}>
      <ComboboxInput aria-label="Framework" placeholder="Search frameworks..." />
      <ComboboxContent>
        <ComboboxList>
          {(framework: (typeof frameworks)[number]) => (
            <ComboboxItem key={framework.value} value={framework}>
              {framework.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(await within(canvasElement).findByRole('button', { name: 'Open options' }));
    const popup = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-slot=combobox-content][data-open]');
      expect(element).not.toBeNull();
      expect(element?.hasAttribute('data-starting-style')).toBe(false);
      return element as HTMLElement;
    });
    await Promise.all(popup.getAnimations().map((animation) => animation.finished));
    popup.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 100_000 }).pause();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).toHaveAttribute('data-ending-style'));
    await expect(popup).toHaveAttribute('aria-hidden', 'true');
  },
};

/**
 * Two layouts, each with its field in the left half and in the right half.
 * With the input as the field, the list lines up with the input; with a field
 * trigger, it lines up with the trigger. A field in the left half lines up the
 * left edges and the list grows right; a field in the right half lines up the
 * right edges and the list grows left. The list scales in from the corner at
 * the field. An explicit `align` wins. Right to left mirrors it.
 */
function SideCombobox({ label, layout, className, align }: {
  label: string;
  layout: 'input' | 'trigger';
  className: string;
  align?: 'start' | 'end';
}) {
  return (
    <div className={`absolute ${className}`}>
      <Combobox items={countries}>
        {layout === 'input' ? (
          <ComboboxInput aria-label={label} placeholder="Search" triggerLabel={`Open ${label}`} className="w-48" />
        ) : (
          <ComboboxTrigger aria-label={label} className="w-48">
            <ComboboxValue placeholder="Select a country" />
          </ComboboxTrigger>
        )}
        {/* Wider than the field: a list as wide as its field has no side to pick. */}
        <ComboboxContent align={align} className="w-72">
          {layout === 'trigger' && (
            <ComboboxInput aria-label={`Search ${label}`} placeholder="Search" showTrigger={false} />
          )}
          <ComboboxList>
            {(country: string) => (
              <ComboboxItem key={country} value={country}>
                {country}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export const OpensTowardTheCentre: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    // Logical insets, so the row flips in right-to-left like a page does.
    // A quarter in from the edges: a popup that would leave the screen is
    // flipped by Base UI anyway, so the side of the screen shows here.
    <div className="relative h-[40rem] w-full">
      <SideCombobox label="Input left" layout="input" className="start-[25%] top-4" />
      <SideCombobox label="Input right" layout="input" className="end-[25%] top-4" />
      <SideCombobox label="Trigger left" layout="trigger" className="start-[25%] top-80" />
      <SideCombobox label="Trigger right" layout="trigger" className="end-[25%] top-80" />
      <SideCombobox label="Explicit start" layout="trigger" className="end-[calc(50%-14rem)] top-[30rem]" align="start" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const check = async (label: string, edge: 'left' | 'right') => {
      const opener = label.startsWith('Input')
        ? canvas.getByRole('button', { name: `Open ${label}` })
        : canvas.getByRole('combobox', { name: label });
      // The list lines up with the input group, or with the field trigger.
      const field = label.startsWith('Input')
        ? (canvas.getByRole('combobox', { name: label }).closest('[data-slot=input-group]') as HTMLElement)
        : opener;
      await userEvent.click(opener);
      const popup = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-slot=combobox-content][data-open]');
        expect(element, `${label} opens a list`).not.toBeNull();
        return element as HTMLElement;
      });
      await waitFor(() => {
        const box = popup.getBoundingClientRect();
        const anchor = field.getBoundingClientRect();
        // The list is wider than its field, so only one edge can line up.
        expect(box.width).toBeGreaterThan(anchor.width + 8);
        // The edge at the field lines up with the field's edge.
        expect(Math.abs(box[edge] - anchor[edge]), `${label}: ${edge} edges`).toBeLessThan(1);
        // It scales in from that corner.
        const originX = Number.parseFloat(getComputedStyle(popup).transformOrigin);
        expect(Math.abs(originX - (edge === 'left' ? 0 : box.width)), `${label}: origin`).toBeLessThan(2);
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector('[data-slot=combobox-content]')).toBeNull(), { timeout: 3000 });
      // An open list hides the other fields from assistive technology; wait
      // until they are back.
      await waitFor(() => expect(canvasElement.querySelector('div[aria-hidden=true]')).toBeNull());
    };
    await check('Input left', 'left');
    await check('Input right', 'right');
    await check('Trigger left', 'left');
    await check('Trigger right', 'right');
    // In the right half, yet an explicit start lines up the left edges.
    await check('Explicit start', 'left');
    const root = document.documentElement;
    const dir = root.getAttribute('dir');
    root.setAttribute('dir', 'rtl');
    try {
      await check('Input left', 'right');
      await check('Input right', 'left');
      await check('Trigger left', 'right');
      await check('Trigger right', 'left');
      await check('Explicit start', 'right');
    } finally {
      if (dir === null) root.removeAttribute('dir');
      else root.setAttribute('dir', dir);
    }
  },
};
