import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../src/components/atoms/menubar.tsx';
import { checkDisabledItemHasNoFill } from './menu-disabled-item.ts';

const meta = {
  title: 'Atoms/Menus/Menubar',
  component: Menubar,
  tags: ['autodocs'],
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab
            <MenubarShortcut>Ctrl+T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window
            <MenubarShortcut>Ctrl+N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print...
            <MenubarShortcut>Ctrl+P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Undo
            <MenubarShortcut>Ctrl+Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Redo
            <MenubarShortcut>Ctrl+Y</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Cut
            <MenubarShortcut>Ctrl+X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Copy
            <MenubarShortcut>Ctrl+C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Paste
            <MenubarShortcut>Ctrl+V</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Select All
            <MenubarShortcut>Ctrl+A</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem>Always Show Full URLs</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem>
            Reload
            <MenubarShortcut>Ctrl+R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Force Reload
            <MenubarShortcut>Ctrl+Shift+R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

/** Ends with the File menu open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('menuitem', { name: 'File' }));
    await waitFor(() => expect(within(document.body).getByRole('menuitem', { name: /New Tab/ })).toBeVisible());
  },
};

function SideMenubar({ label, className, align }: { label: string; className: string; align?: 'start' | 'end' }) {
  return (
    <Menubar className={`absolute ${className}`}>
      <MenubarMenu>
        <MenubarTrigger>{label}</MenubarTrigger>
        <MenubarContent align={align}>
          <MenubarItem>New Tab</MenubarItem>
          <MenubarItem>New Window</MenubarItem>
          <MenubarItem>Print...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

/**
 * A menu opens toward the centre of the screen. A trigger in the left half
 * lines up the left edges and the menu grows right; a trigger in the right
 * half lines up the right edges and the menu grows left. Either way the menu
 * sits 5px outward of the trigger's edge, so its items line up with the
 * trigger's text. It scales in from the corner at the trigger. An explicit
 * `align` wins. Right to left mirrors it.
 */
export const OpensTowardTheCentre: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: () => (
    // Logical insets, so the row flips in right-to-left like a page does.
    // A quarter in from the edges: a popup that would leave the screen is
    // flipped by Base UI anyway, so the side of the screen shows here.
    <div className="relative h-96 w-full">
      <SideMenubar label="Left" className="start-[25%] top-4" />
      <SideMenubar label="Right" className="end-[25%] top-4" />
      <SideMenubar label="Explicit start" className="end-[calc(50%-12rem)] top-48" align="start" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const check = async (label: string, edge: 'left' | 'right') => {
      const trigger = canvas.getByRole('menuitem', { name: label });
      await userEvent.click(trigger);
      const popup = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-slot=menubar-content][data-open]');
        expect(element, `${label} opens a menu`).not.toBeNull();
        return element as HTMLElement;
      });
      await waitFor(() => {
        const box = popup.getBoundingClientRect();
        const anchor = trigger.getBoundingClientRect();
        // The edge at the trigger sits 5px outward of the trigger's edge.
        const outward = edge === 'left' ? -5 : 5;
        expect(Math.abs(box[edge] - anchor[edge] - outward), `${label}: ${edge} edges`).toBeLessThan(1);
        // It scales in from that corner.
        const originX = Number.parseFloat(getComputedStyle(popup).transformOrigin);
        expect(Math.abs(originX - (edge === 'left' ? 0 : box.width)), `${label}: origin`).toBeLessThan(2);
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector('[data-slot=menubar-content]')).toBeNull(), { timeout: 3000 });
    };
    await check('Left', 'left');
    await check('Right', 'right');
    // In the right half, yet an explicit start lines up the left edges.
    await check('Explicit start', 'left');
    const root = document.documentElement;
    const dir = root.getAttribute('dir');
    root.setAttribute('dir', 'rtl');
    try {
      await check('Left', 'right');
      await check('Right', 'left');
      await check('Explicit start', 'right');
    } finally {
      if (dir === null) root.removeAttribute('dir');
      else root.setAttribute('dir', dir);
    }
  },
};

/**
 * A disabled item never takes the fill: not under the pointer, not under the
 * arrow keys. The arrow keys still stop on it and show only the focus ring.
 * Here the disabled item is a checkbox item.
 */
export const DisabledItem: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Send invite</MenubarItem>
          <MenubarCheckboxItem disabled>Add member</MenubarCheckboxItem>
          <MenubarItem>Settings</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
  play: async ({ canvasElement }) => {
    await checkDisabledItemHasNoFill(within(canvasElement).getByRole('menuitem', { name: 'Edit' }));
  },
};
