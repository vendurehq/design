import type { Meta, StoryObj } from '@storybook/react';
import { ChevronsUpDownIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../src/components/atoms/collapsible.tsx';

const meta = {
  title: 'Atoms/Layout/Collapsible',
  component: Collapsible,
  tags: ['autodocs'],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

function Rows() {
  return (
    <>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">WH-02 · Rotterdam</div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">WH-03 · Leipzig</div>
    </>
  );
}

/**
 * The panel eases its height open and shut on the height curve. A second click
 * mid-way reverses from where the panel is. Under reduced motion the height
 * snaps and only a short fade remains.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Toggle warehouses' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText('WH-02 · Rotterdam')).toBeNull();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(await canvas.findByText('WH-02 · Rotterdam')).toBeVisible();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByText('WH-02 · Rotterdam')).toBeNull());
  },
  render: () => (
    <Collapsible className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">3 warehouses</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
          <ChevronsUpDownIcon className="size-4" />
          <span className="sr-only">Toggle warehouses</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">WH-01 · Amsterdam</div>
      <CollapsibleContent className="space-y-2">
        <Rows />
      </CollapsibleContent>
    </Collapsible>
  ),
};

/**
 * A Collapsible that starts open just shows: nothing animates on first render.
 * The panel clips its content only while the height runs, so the focus ring of
 * a button at the edge is not cut off once it is open.
 */
export const StartsOpen: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Toggle warehouses' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const panel = canvasElement.querySelector<HTMLElement>('[data-slot="collapsible-content"]');
    await expect(panel).not.toBeNull();
    await expect(panel).not.toHaveAttribute('data-starting-style');
    await expect(getComputedStyle(panel as HTMLElement).overflow).toBe('visible');
  },
  render: () => (
    <Collapsible defaultOpen className="w-[350px] space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">3 warehouses</h4>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
          <ChevronsUpDownIcon className="size-4" />
          <span className="sr-only">Toggle warehouses</span>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-md border px-4 py-3 font-mono text-sm">WH-01 · Amsterdam</div>
      <CollapsibleContent className="space-y-2 p-1">
        <Rows />
        <Button variant="outline" size="sm">
          Add warehouse
        </Button>
      </CollapsibleContent>
    </Collapsible>
  ),
};
