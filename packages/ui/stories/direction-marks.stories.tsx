import type { Meta, StoryObj } from '@storybook/react';
import { HomeIcon, InboxIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import { expect } from 'storybook/test';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../src/components/atoms/accordion.tsx';
import { Avatar, AvatarBadge, AvatarFallback } from '../src/components/atoms/avatar.tsx';
import { Command, CommandGroup, CommandItem, CommandItemDetail, CommandItemLabel, CommandList, CommandShortcut } from '../src/components/atoms/command.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { NativeSelect, NativeSelectOption } from '../src/components/atoms/native-select.tsx';
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../src/components/atoms/sidebar.tsx';

type Dir = 'ltr' | 'rtl';

const meta = {
  title: 'Atoms/Layout/Direction marks',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The marks, chevrons and badges that sit at one side of an atom: a Command
 * check mark, shortcut and detail, the NativeSelect chevron, the Accordion
 * icon, the Avatar badge, and the Sidebar actions, badge and active bar.
 */
function Marks({ dir }: { dir: Dir }) {
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} className="grid w-[720px] grid-cols-2 items-start gap-8 p-8">
        <Command className="rounded-lg border" data-testid="command">
          <CommandList>
            <CommandGroup heading="Projects">
              <CommandItem value="acme" data-testid="detail-row">
                <CommandItemLabel>Acme</CommandItemLabel>
                <CommandItemDetail data-testid="detail">Production</CommandItemDetail>
              </CommandItem>
              <CommandItem value="grid" data-checked="true" data-testid="check-row">
                Show grid
              </CommandItem>
              <CommandItem value="search" data-testid="shortcut-row">
                Search
                <CommandShortcut data-testid="shortcut">Ctrl+K</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="flex flex-col gap-6">
          <NativeSelect data-testid="native-select" defaultValue="eu" aria-label="Region">
            <NativeSelectOption value="eu">Europe</NativeSelectOption>
            <NativeSelectOption value="us">United States</NativeSelectOption>
          </NativeSelect>
          <Accordion data-testid="accordion">
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>Ships in two days.</AccordionContent>
            </AccordionItem>
          </Accordion>
          <Avatar size="lg" data-testid="avatar">
            <AvatarFallback>HA</AvatarFallback>
            <AvatarBadge data-testid="avatar-badge" />
          </Avatar>
        </div>
        <SidebarProvider className="min-h-0">
          <div data-sidebar="sidebar" className="bg-sidebar text-sidebar-foreground w-64 rounded-lg border" data-testid="sidebar">
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupAction data-testid="group-action" aria-label="Add">
                <PlusIcon />
              </SidebarGroupAction>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive data-testid="active-button">
                    <HomeIcon />
                    <span>Home</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction data-testid="menu-action" aria-label="More">
                    <MoreHorizontalIcon />
                  </SidebarMenuAction>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <InboxIcon />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge data-testid="menu-badge">12</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarProvider>
      </div>
    </DirectionProvider>
  );
}

function box(root: HTMLElement, id: string) {
  const el = root.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`No element ${id}`);
  return el.getBoundingClientRect();
}

/** The gap between a mark and the end edge of its container, in px. */
function gapToEnd(mark: DOMRect, container: DOMRect, dir: Dir) {
  return dir === 'rtl' ? mark.left - container.left : container.right - mark.right;
}

/** The gap from each mark to the end edge of its row, as left to right draws it. */
const END_GAPS = {
  commandCheck: 8,
  commandShortcut: 8,
  commandDetail: 8,
  nativeSelectChevron: 10,
  accordionIcon: 13,
  avatarBadge: 0,
  sidebarGroupAction: 13,
  sidebarMenuAction: 15,
  sidebarMenuBadge: 15,
  sidebarActiveBarStart: 0,
};

/**
 * Each mark sits at the end of its row, in both directions, and the active bar
 * of a sidebar button at its start.
 */
async function expectMarks(root: HTMLElement, dir: Dir) {
  const checkRow = root.querySelector<HTMLElement>('[data-testid="check-row"]')!;
  const select = root.querySelector<HTMLElement>('[data-testid="native-select"]')!;
  const wrapper = select.closest('[data-slot=native-select-wrapper]') as HTMLElement;
  const trigger = root.querySelector<HTMLElement>('[data-testid="accordion"] [data-slot=accordion-trigger]')!;
  const sidebar = box(root, 'sidebar');
  const ends: Record<string, [DOMRect, DOMRect]> = {
    commandCheck: [checkRow.querySelector('svg')!.getBoundingClientRect(), checkRow.getBoundingClientRect()],
    commandShortcut: [box(root, 'shortcut'), box(root, 'shortcut-row')],
    commandDetail: [box(root, 'detail'), box(root, 'detail-row')],
    nativeSelectChevron: [wrapper.querySelector('svg')!.getBoundingClientRect(), wrapper.getBoundingClientRect()],
    accordionIcon: [trigger.querySelector('svg')!.getBoundingClientRect(), trigger.getBoundingClientRect()],
    avatarBadge: [box(root, 'avatar-badge'), box(root, 'avatar')],
    sidebarGroupAction: [box(root, 'group-action'), sidebar],
    sidebarMenuAction: [box(root, 'menu-action'), sidebar],
    sidebarMenuBadge: [box(root, 'menu-badge'), sidebar],
  };
  const measured: Record<string, number> = {};
  for (const [name, [mark, container]] of Object.entries(ends)) {
    measured[name] = Math.round(gapToEnd(mark, container, dir));
  }
  // The active bar is a ::before at the start edge of the button.
  const active = root.querySelector<HTMLElement>('[data-testid="active-button"]')!;
  const bar = getComputedStyle(active, '::before');
  const barLeft = parseFloat(bar.left);
  measured.sidebarActiveBarStart = Math.round(dir === 'rtl' ? active.offsetWidth - barLeft - parseFloat(bar.width) : barLeft);
  // Compared as text, so a failure prints every gap.
  await expect(JSON.stringify(measured)).toBe(JSON.stringify(END_GAPS));
}

/** Right to left: every mark sits at the left end of its row. */
export const MarksRightToLeft: Story = {
  render: () => <Marks dir="rtl" />,
  play: async ({ canvasElement }) => expectMarks(canvasElement, 'rtl'),
};

/** Left to right, the same atoms: the look this change keeps. */
export const MarksLeftToRight: Story = {
  render: () => <Marks dir="ltr" />,
  play: async ({ canvasElement }) => expectMarks(canvasElement, 'ltr'),
};
