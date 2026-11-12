import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { VisibilityIcon } from '../src/components/molecules/visibility-icon.tsx';

/**
 * An eye for show/hide toggles. When the state turns hidden, a line draws
 * across the eye and cuts it; when it turns visible, the line draws back out.
 * It mounts in its state without motion, and a fast toggle reverses from
 * wherever the line is. With reduced motion the change is instant. The icon is
 * decorative: label the control that holds it.
 */
const meta = {
  title: 'Molecules/VisibilityIcon',
  component: VisibilityIcon,
  tags: ['autodocs'],
  args: { visible: true },
} satisfies Meta<typeof VisibilityIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hidden: Story = { args: { visible: false } };

/** Both states at the sizes the icon takes inside controls and menus. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-foreground">
      {[
        ['size-3.5', '14px'],
        ['size-4', '16px'],
        ['size-5', '20px'],
        ['size-6', '24px'],
      ].map(([size, label]) => (
        <div key={size} className="flex items-center gap-4">
          <span className="text-muted-foreground w-10 text-xs">{label}</span>
          <VisibilityIcon visible className={size} />
          <VisibilityIcon visible={false} className={size} />
        </div>
      ))}
    </div>
  ),
};

/**
 * A toggle button. Click it: the line draws across and cuts the eye; click
 * again and it draws back out. Click twice fast and the line turns back from
 * where it is.
 */
export const Toggle: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={visible ? 'Hide' : 'Show'}
        onClick={() => setVisible((current) => !current)}
      >
        <VisibilityIcon visible={visible} />
      </Button>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const icon = () => canvasElement.querySelector('[data-slot=visibility-icon]') as SVGSVGElement;
    const lines = () => [...icon().querySelectorAll('path[d^="M2 2"]')] as SVGPathElement[];
    const offsets = () => lines().map((path) => getComputedStyle(path).strokeDashoffset);
    const running = () => icon().getAnimations({ subtree: true });
    const settled = () => waitFor(() => expect(running()).toHaveLength(0));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    await step('the first render does not animate', async () => {
      await expect(running()).toHaveLength(0);
      await expect(icon()).toHaveAttribute('data-visibility', 'visible');
      // The line and the cut in the eye are both drawn out.
      await expect(offsets()).toEqual(['1px', '1px']);
    });

    await step('hiding draws the line and the cut across the eye', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Hide' }));
      await expect(icon()).toHaveAttribute('data-visibility', 'hidden');
      if (!reduced) {
        const transitions = running();
        await expect(transitions.length).toBe(2);
        for (const transition of transitions) {
          await expect((transition as CSSTransition).transitionProperty).toBe('stroke-dashoffset');
        }
      }
      await settled();
      await expect(offsets()).toEqual(['0px', '0px']);
    });

    await step('showing draws the line back out', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
      await settled();
      await expect(icon()).toHaveAttribute('data-visibility', 'visible');
      await expect(offsets()).toEqual(['1px', '1px']);
    });

    await step('a second click mid-way turns the line back from where it is', async () => {
      if (reduced) return;
      await userEvent.click(canvas.getByRole('button', { name: 'Hide' }));
      // Freeze the line halfway, then reverse it.
      for (const transition of running()) {
        transition.pause();
        transition.currentTime = 100;
      }
      const halfway = Number.parseFloat(offsets()[0] ?? '');
      await expect(halfway).toBeGreaterThan(0);
      await expect(halfway).toBeLessThan(1);
      await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
      // The reversing transition starts from the halfway offset, not from 0.
      const reversing = running()[0] as CSSTransition | undefined;
      const from = (reversing?.effect as KeyframeEffect | null)?.getKeyframes()[0]?.strokeDashoffset;
      await expect(Number.parseFloat(String(from))).toBeCloseTo(halfway, 2);
      await settled();
      await expect(offsets()).toEqual(['1px', '1px']);
    });
  },
};

const COLUMNS = ['Name', 'SKU', 'Price', 'Stock', 'Updated'] as const;

/**
 * A column menu: each row shows its column's visibility with the icon at the
 * end. A hidden column's icon also dims; the dim takes the line's timing.
 */
export const ColumnMenu: Story = {
  render: () => {
    const [hidden, setHidden] = useState<string[]>(['SKU', 'Updated']);
    return (
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Columns</DropdownMenuTrigger>
        <DropdownMenuContent className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Columns</DropdownMenuLabel>
            {COLUMNS.map((column) => {
              const visible = !hidden.includes(column);
              return (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visible}
                  closeOnClick={false}
                  onCheckedChange={(next) =>
                    setHidden((current) =>
                      next ? current.filter((value) => value !== column) : [...current, column],
                    )
                  }
                  className="pe-2 [&_[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden"
                >
                  {column}
                  <span className="text-muted-foreground ms-auto flex">
                    <VisibilityIcon visible={visible} className={visible ? undefined : 'opacity-50'} />
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};
