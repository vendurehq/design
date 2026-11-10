import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Accept terms' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Accept terms', defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Accept terms', disabled: true },
};

export const DisabledChecked: Story = {
  args: { 'aria-label': 'Accept terms', disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" aria-label="Accept terms and conditions" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
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
 * Unchecked, checked and invalid, in light and dark. The unchecked border uses
 * the control-border slot (3:1 against every surface). Pinned to the light page
 * theme so the left panel stays light.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex items-center gap-6">
          <Checkbox aria-label={`Unchecked, ${theme}`} />
          <Checkbox aria-label={`Checked, ${theme}`} defaultChecked />
          <Checkbox aria-label={`Invalid, ${theme}`} aria-invalid />
          <Checkbox aria-label={`Disabled, ${theme}`} disabled />
        </div>
      )}
    </LightAndDark>
  ),
};

const ITEMS = ['Ship to customer', 'Send invoice', 'Notify warehouse'] as const;

/**
 * Checking animates: the fill fades in as it grows from 70%, then the check
 * mark draws from its short stroke to its long one. Unchecking plays it back,
 * quicker: the mark undraws and the fill shrinks as it fades. A press shrinks
 * the box a little. "All tasks" goes indeterminate
 * while some tasks are checked, and its line draws the same way. Toggle fast:
 * every step reverses from where it is. Under reduced motion only the fades
 * remain.
 */
export const Toggle: Story = {
  render: () => {
    const [checked, setChecked] = useState<string[]>([ITEMS[0]]);
    const all = checked.length === ITEMS.length;
    const some = checked.length > 0 && !all;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="all-tasks"
            checked={all}
            indeterminate={some}
            onCheckedChange={(next) => setChecked(next ? [...ITEMS] : [])}
          />
          <Label htmlFor="all-tasks">All tasks</Label>
        </div>
        {ITEMS.map((item) => (
          <div key={item} className="flex items-center gap-2 ps-6">
            <Checkbox
              id={item.toLowerCase().replaceAll(' ', '-')}
              checked={checked.includes(item)}
              onCheckedChange={(next) =>
                setChecked((current) =>
                  next ? [...current, item] : current.filter((value) => value !== item),
                )
              }
            />
            <Label htmlFor={item.toLowerCase().replaceAll(' ', '-')}>{item}</Label>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const box = (name: string) => canvas.getByRole('checkbox', { name });
    const fillOpacity = (name: string) => getComputedStyle(box(name), '::before').opacity;
    const mark = (name: string) => box(name).querySelector('path') as SVGPathElement;

    await step('checking grows the fill in and draws the mark', async () => {
      await userEvent.click(box('Send invoice'));
      await waitFor(() => {
        expect(fillOpacity('Send invoice')).toBe('1');
        expect(getComputedStyle(mark('Send invoice')).strokeDashoffset).toBe('0px');
      });
    });

    await step('unchecking fades the fill out and undraws the mark', async () => {
      await userEvent.click(box('Send invoice'));
      await waitFor(() => {
        expect(fillOpacity('Send invoice')).toBe('0');
        expect(getComputedStyle(mark('Send invoice')).strokeDashoffset).toBe('1px');
      });
    });

    await step('a partial selection draws the indeterminate line', async () => {
      await expect(box('All tasks')).toHaveAttribute('data-indeterminate');
      await expect(mark('All tasks')).toHaveAttribute('d', 'M5 12h14');
      await waitFor(() =>
        expect(getComputedStyle(mark('All tasks')).strokeDashoffset).toBe('0px'),
      );
    });
  },
};
