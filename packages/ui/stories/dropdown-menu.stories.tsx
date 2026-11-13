import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { checkCheckedRowLook } from './menu-checked-row.ts';
import { checkDisabledItemHasNoFill } from './menu-disabled-item.ts';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CreditCard, LogOut, Mail, MessageSquare, Plus, Server, Settings, User, UserPlus, Users } from 'lucide-react';

const meta = {
  title: 'Atoms/Menus/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        Open Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem>
            <User />
            Profile
            <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
            <DropdownMenuShortcut>Ctrl+B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
            <DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users />
            Team
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Plus />
            New Team
            <DropdownMenuShortcut>Ctrl+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Server />
          API
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut />
          Log out
          <DropdownMenuShortcut>Ctrl+Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCheckboxItems: Story = {
  render: function CheckboxStory() {
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    const [showActivityBar, setShowActivityBar] = React.useState(false);
    const [showPanel, setShowPanel] = React.useState(false);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          View Options
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
              Status Bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={setShowActivityBar}>
              Activity Bar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
              Panel
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubmenu: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        More Options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Mail />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MessageSquare />
          Message
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserPlus />
            Invite Users
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              <Mail />
              Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare />
              Message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus />
              More...
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Server />
          Services
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithRadioItems: Story = {
  render: function RadioStory() {
    const [sort, setSort] = React.useState('newest');

    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Sort orders
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
              <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="total">Order total</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  // The checked row looks as it does in BreadcrumbMenu: semibold, with a check that draws in.
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Sort orders' }));
    const menu = await within(document.body).findByRole('menu');
    await checkCheckedRowLook(menu);
    await userEvent.keyboard('{Escape}');
  },
};

function SideMenu({ label, align }: { label: string; align?: 'start' | 'end' }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>{label}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A menu opens toward the centre of the screen. A trigger in the right half
 * (the row actions at the end of a table row) lines up the menu's right edge
 * with its own and the menu grows left; a trigger in the left half lines up
 * the left edges. The menu scales in from the corner at the trigger. The
 * side is physical, so it is the same in right-to-left. An explicit `align`
 * still wins.
 */
export const OpensTowardTheCentre: Story = {
  render: () => (
    // Away from the edges, so the menu fits on either side of its trigger.
    <div className="grid w-full grid-cols-4 gap-y-40 pb-60">
      <div className="col-start-2">
        <SideMenu label="Start" />
      </div>
      <div className="col-start-3 justify-self-end">
        <SideMenu label="End" />
      </div>
      <div className="col-start-3 justify-self-end">
        <SideMenu label="Explicit start" align="start" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const check = async (label: string, edge: 'left' | 'right') => {
      const trigger = canvas.getByRole('button', { name: label });
      await userEvent.click(trigger);
      const popup = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-slot="dropdown-menu-content"]');
        expect(element).not.toBeNull();
        return element as HTMLElement;
      });
      await waitFor(() => {
        const box = popup.getBoundingClientRect();
        const anchor = trigger.getBoundingClientRect();
        // The edge at the trigger lines up with the trigger's edge.
        expect(Math.abs(box[edge] - anchor[edge])).toBeLessThan(1);
        // It scales in from that corner.
        const originX = Number.parseFloat(getComputedStyle(popup).transformOrigin);
        expect(Math.abs(originX - (edge === 'left' ? 0 : box.width))).toBeLessThan(2);
      });
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull());
    };
    await check('Start', 'left');
    await check('End', 'right');
    // An explicit align wins over the side of the screen.
    await check('Explicit start', 'left');
    // In a right-to-left page the row flips: Start sits in the right half.
    const root = document.documentElement;
    const dir = root.getAttribute('dir');
    root.setAttribute('dir', 'rtl');
    try {
      await check('Start', 'right');
      await check('End', 'left');
    } finally {
      if (dir === null) root.removeAttribute('dir');
      else root.setAttribute('dir', dir);
    }
  },
};

/**
 * A disabled item never takes the fill. The pointer passes over it without a
 * highlight. The arrow keys still stop on it, as Base UI and the WAI-ARIA menu
 * pattern expect, so a keyboard user can read why it is there; it then shows
 * only the focus ring, never the fill. Enter and Space do nothing on it.
 */
export const DisabledItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Mail />
          Send invite
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <UserPlus />
          Add member
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await checkDisabledItemHasNoFill(within(canvasElement).getByRole('button', { name: 'Actions' }));
  },
};
