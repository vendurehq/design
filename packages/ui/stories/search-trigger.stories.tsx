import type { Meta, StoryObj } from '@storybook/react';
import { PanelLeftIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../src/components/atoms/command.tsx';
import { SearchTrigger } from '../src/components/molecules/search-trigger.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Molecules/SearchTrigger',
  component: SearchTrigger,
  tags: ['autodocs'],
  args: { label: 'Search', shortcutKey: 'K', collapse: 'never' },
  argTypes: {
    collapse: { control: 'inline-radio', options: ['md', 'never', 'always'] },
    shortcutKey: { control: 'text' },
  },
} satisfies Meta<typeof SearchTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

// The consumer binds the shortcut and opens the palette; the trigger only
// shows the shortcut and calls `onClick`.
function usePaletteShortcut(open: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
}

function Palette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem>Overview</CommandItem>
            <CommandItem>Deployments</CommandItem>
            <CommandItem>Logs</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

// The field alone: a button with the word, the shortcut at the end, and the
// palette on click or on the shortcut.
export const Default: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    usePaletteShortcut(() => setOpen(true));
    return (
      <>
        <SearchTrigger {...args} onClick={() => setOpen(true)} />
        <Palette open={open} onOpenChange={setOpen} />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Search (command palette)' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    const apple = /mac|iphone|ipad/i.test(navigator.platform);
    await expect(trigger).toHaveTextContent(apple ? '⌘K' : 'Ctrl K');
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull());
  },
};

// `collapse="always"`: the 28px icon button of a narrow top bar. The default
// `collapse="md"` turns into it below 768px.
/**
 * The 28px icon button. Plays: the 14px icon sits 7px from each side, in
 * left to right and in right to left.
 */
export const Collapsed: Story = {
  args: { collapse: 'always' },
  render: (args) => (
    <div className="flex gap-4">
      <SearchTrigger {...args} />
      <div dir="rtl">
        <SearchTrigger {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = within(canvasElement).getAllByRole('button', { name: 'Search (command palette)' });
    for (const trigger of triggers) {
      const box = trigger.getBoundingClientRect();
      const icon = trigger.querySelector('svg')?.getBoundingClientRect();
      await expectPx(box.width, 28);
      await expectPx(icon && icon.left - box.left, 7, 'icon to the left edge');
      await expectPx(icon && box.right - icon.right, 7, 'icon to the right edge');
    }
  },
};

// In a top bar, at the end, next to a ghost button. Narrow the canvas below
// 768px to see it shrink to the icon button.
export const InTopBar: Story = {
  parameters: { layout: 'fullscreen' },
  args: { collapse: 'md' },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    usePaletteShortcut(() => setOpen(true));
    return (
      <header className="flex h-13 items-center gap-1.5 bg-background pr-5 pl-3 shadow-[inset_0_-1px_0_var(--border)]">
        <Button variant="ghost" size="icon-sm" aria-label="Toggle sidebar">
          <PanelLeftIcon />
        </Button>
        <span className="text-sm font-medium">Deployments</span>
        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger {...args} onClick={() => setOpen(true)} />
        </div>
        <Palette open={open} onOpenChange={setOpen} />
      </header>
    );
  },
};

/**
 * Right to left: the icon sits at the start edge, now the right one, and the
 * shortcut at the end edge, the left one. Plays: the shortcut is 6px from the
 * left edge and the icon 10px from the right edge, the mirror of left to right.
 */
export const RightToLeft: Story = {
  render: (args) => (
    <div dir="rtl">
      <SearchTrigger {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Search (command palette)' });
    const box = trigger.getBoundingClientRect();
    const icon = trigger.querySelector('svg')?.getBoundingClientRect();
    const kbd = trigger.querySelector('[data-slot="kbd"]')?.getBoundingClientRect();
    await expect(icon && Math.round(box.right - icon.right)).toBe(10);
    await expect(kbd && Math.round(kbd.left - box.left)).toBe(6);
  },
};
