import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Field, FieldLabel } from '../src/components/atoms/field.tsx';
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
 * Checking animates: the fill closes in around a shrinking circle, corners
 * first, to the middle, and reveals the check mark as it goes: the mark shows
 * only where the fill already is. Unchecking plays it back, quicker: the fill
 * opens from the middle out and takes the mark with it. A press shrinks the
 * box a little. Space toggles with the same motion. "All tasks" goes
 * indeterminate while some tasks are checked, and the fill reveals its line
 * the same way. Toggle fast: every step reverses from where it is. Under
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
    // How far open the hole in the fill is: 1 is no fill, 0 a full box.
    const hole = (name: string) =>
      getComputedStyle(box(name), '::before').getPropertyValue('--checkbox-hole').trim();
    const clip = (name: string) => getComputedStyle(box(name), '::before').clipPath;
    const indicator = (name: string) =>
      box(name).querySelector('[data-slot="checkbox-indicator"]') as HTMLElement;
    const check = (name: string) => box(name).querySelector('path[d^="M4"]') as SVGPathElement;
    const line = (name: string) => box(name).querySelector('path[d^="M5"]') as SVGPathElement;
    const shown = (path: SVGPathElement) => getComputedStyle(path).opacity;
    const settled = async (name: string) =>
      waitFor(() => expect(box(name).getAnimations({ subtree: true })).toHaveLength(0));

    await step('the hole is a circle where shape() is supported', async () => {
      if (!CSS.supports('clip-path', 'shape(from 0 0, line to 1px 1px)')) return;
      await expect(clip('Send invoice')).toMatch(/^shape\(evenodd .* arc to /);
    });

    await step('the mark is clipped to the fill at every point of the motion', async () => {
      await userEvent.click(box('Send invoice'));
      const running = box('Send invoice').getAnimations({ subtree: true });
      await expect(running.length).toBeGreaterThan(0);
      for (const at of [0, 30, 60, 90]) {
        for (const animation of running) {
          animation.pause();
          animation.currentTime = at;
        }
        await expect(getComputedStyle(indicator('Send invoice')).clipPath).toBe(
          clip('Send invoice'),
        );
      }
      for (const animation of running) animation.finish();
      await settled('Send invoice');
    });

    await step('checking closes the fill in and shows the check', async () => {
      await expect(hole('Send invoice')).toBe('0');
      await expect(shown(check('Send invoice'))).toBe('1');
      await expect(shown(line('Send invoice'))).toBe('0');
    });

    await step('unchecking opens the fill and hides the mark with it', async () => {
      await userEvent.click(box('Send invoice'));
      await settled('Send invoice');
      await expect(hole('Send invoice')).toBe('1');
      await expect(getComputedStyle(indicator('Send invoice')).clipPath).toBe(
        clip('Send invoice'),
      );
    });

    await step('Space toggles with the same motion', async () => {
      box('Send invoice').focus();
      await userEvent.keyboard(' ');
      await settled('Send invoice');
      await expect(box('Send invoice')).toHaveAttribute('data-checked');
      await expect(hole('Send invoice')).toBe('0');
      await userEvent.keyboard(' ');
      await settled('Send invoice');
    });

    await step('a partial selection shows the indeterminate line', async () => {
      await expect(box('All tasks')).toHaveAttribute('data-indeterminate');
      await settled('All tasks');
      await expect(hole('All tasks')).toBe('0');
      await expect(shown(line('All tasks'))).toBe('1');
      await expect(shown(check('All tasks'))).toBe('0');
    });

    await step('a fast check, uncheck reverses from where it is', async () => {
      const name = 'Notify warehouse';
      await userEvent.click(box(name));
      // Hold the reveal partway, then uncheck: the reverse is shortened to
      // the part already played, so it starts from there.
      const [reveal] = indicator(name).getAnimations();
      if (!reveal) throw new Error('the mark has no running reveal');
      reveal.pause();
      reveal.currentTime = 60;
      await userEvent.click(box(name));
      const [back] = indicator(name).getAnimations();
      const duration = Number(back?.effect?.getTiming().duration);
      await expect(duration).toBeGreaterThan(0);
      await expect(duration).toBeLessThan(100);
      await userEvent.click(box(name));
      await settled(name);
      await expect(hole(name)).toBe('0');
      await expect(shown(check(name))).toBe('1');
    });
  },
};

/** The opacity an element shows with: its own times every ancestor's. */
function shownOpacity(element: Element) {
  let opacity = 1;
  for (let node: Element | null = element; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity);
  }
  return opacity;
}

/**
 * Disabled, unchecked, checked and indeterminate, on their own and inside a
 * disabled `Field`, light and dark. Each is dimmed to half and shows the
 * not-allowed cursor, once: the `Field` does not dim it a second time. A
 * `Label` next to a disabled checkbox dims with it.
 */
export const DisabledEverywhere: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <Checkbox aria-label={`Alone unchecked, ${theme}`} disabled />
            <Checkbox aria-label={`Alone checked, ${theme}`} disabled defaultChecked />
            <Checkbox aria-label={`Alone indeterminate, ${theme}`} disabled indeterminate />
          </div>
          <div className="flex items-center gap-6">
            {(['unchecked', 'checked', 'indeterminate'] as const).map((state) => (
              <Field key={state} orientation="horizontal" data-disabled="true">
                <Checkbox
                  id={`field-${state}-${theme}`}
                  aria-label={`In a field ${state}, ${theme}`}
                  disabled
                  defaultChecked={state === 'checked'}
                  indeterminate={state === 'indeterminate'}
                />
                <FieldLabel htmlFor={`field-${state}-${theme}`}>Field</FieldLabel>
              </Field>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`with-label-${theme}`} disabled />
            <Label htmlFor={`with-label-${theme}`}>With a label, {theme}</Label>
          </div>
        </div>
      )}
    </LightAndDark>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = canvas.getAllByRole('checkbox');
    await expect(boxes).toHaveLength(14);
    for (const box of boxes) {
      await expect(shownOpacity(box)).toBeCloseTo(0.5, 2);
      await expect(getComputedStyle(box).cursor).toBe('not-allowed');
    }
    for (const theme of ['light', 'dark']) {
      await expect(shownOpacity(canvas.getByText(`With a label, ${theme}`))).toBeCloseTo(0.5, 2);
    }
  },
};
