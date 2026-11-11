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
 * Checking animates: the fill closes in from the edges of the box to the
 * middle, then the check mark draws from its short stroke to its long one.
 * Unchecking plays it back, quicker: the mark undraws and the fill opens from
 * the middle out. A press shrinks the box a little. Space toggles with the same
 * motion. "All tasks" goes indeterminate while some tasks are checked, and its
 * line draws the same way; from indeterminate to checked the line undraws as
 * the check draws. Toggle fast: every step reverses from where it is. Under
 * reduced motion the fill and the mark only fade.
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
    // The hole in the fill: -1px is no fill, 50% is a full box.
    const hole = (name: string) =>
      getComputedStyle(box(name), '::before').getPropertyValue('--checkbox-fill-x').trim();
    const check = (name: string) => box(name).querySelector('path[d^="M4"]') as SVGPathElement;
    const line = (name: string) => box(name).querySelector('path[d^="M5"]') as SVGPathElement;
    const offset = (path: SVGPathElement) => getComputedStyle(path).strokeDashoffset;
    const settled = async (name: string) =>
      waitFor(() => expect(box(name).getAnimations({ subtree: true })).toHaveLength(0));

    await step('checking closes the fill in and draws the mark', async () => {
      await userEvent.click(box('Send invoice'));
      await settled('Send invoice');
      await expect(hole('Send invoice')).toBe('50%');
      await expect(offset(check('Send invoice'))).toBe('0px');
      await expect(offset(line('Send invoice'))).toBe('1px');
    });

    await step('unchecking opens the fill and undraws the mark', async () => {
      await userEvent.click(box('Send invoice'));
      await settled('Send invoice');
      await expect(hole('Send invoice')).toBe('-1px');
      await expect(offset(check('Send invoice'))).toBe('1px');
    });

    await step('Space toggles with the same motion', async () => {
      box('Send invoice').focus();
      await userEvent.keyboard(' ');
      await settled('Send invoice');
      await expect(box('Send invoice')).toHaveAttribute('data-checked');
      await expect(offset(check('Send invoice'))).toBe('0px');
      await userEvent.keyboard(' ');
      await settled('Send invoice');
    });

    await step('a partial selection draws the indeterminate line', async () => {
      await expect(box('All tasks')).toHaveAttribute('data-indeterminate');
      await settled('All tasks');
      await expect(hole('All tasks')).toBe('50%');
      await expect(offset(line('All tasks'))).toBe('0px');
      await expect(offset(check('All tasks'))).toBe('1px');
    });

    await step('a fast check, uncheck, check reverses from where it is', async () => {
      const name = 'Notify warehouse';
      await userEvent.click(box(name));
      // Hold the draw halfway, then uncheck: the undraw starts from there.
      const [draw] = check(name).getAnimations();
      if (!draw) throw new Error('the check mark has no running draw');
      draw.pause();
      draw.currentTime = 90;
      const halfway = Number.parseFloat(offset(check(name)));
      await expect(halfway).toBeGreaterThan(0.2);
      await expect(halfway).toBeLessThan(0.8);
      await userEvent.click(box(name));
      const [undraw] = check(name).getAnimations();
      const [start] = (undraw?.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
      const from = Number.parseFloat(String(start?.strokeDashoffset));
      await expect(Math.abs(from - halfway)).toBeLessThan(0.05);
      await userEvent.click(box(name));
      await settled(name);
      await expect(offset(check(name))).toBe('0px');
      await expect(hole(name)).toBe('50%');
    });
  },
};
