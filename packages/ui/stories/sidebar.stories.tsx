import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { expect, waitFor, within } from 'storybook/test';
import {
  ChartLineIcon,
  ChevronRightIcon,
  FolderTreeIcon,
  HomeIcon,
  InboxIcon,
  PackageIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  SidebarInset,
} from '../src/components/atoms/sidebar.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../src/components/atoms/collapsible.tsx';

const meta = {
  title: 'Atoms/Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const menuItems = [
  { title: 'Home', icon: HomeIcon },
  { title: 'Inbox', icon: InboxIcon },
  { title: 'Search', icon: SearchIcon },
  { title: 'Team', icon: UsersIcon },
  { title: 'Settings', icon: SettingsIcon },
];

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              V
            </div>
            <span className="text-sm font-semibold">Vendure</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-1 text-xs text-muted-foreground">v2.0.0</div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <div className="flex-1 p-4">
          <p className="text-muted-foreground">Main content area</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
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
 * The active item gets a sidebar-primary bar on its leading edge, so it differs
 * from hover (both use the sidebar-accent fill), and its icon takes
 * brand-indicator. The outline variant draws its border again. Hover an item to
 * compare. Pinned to the light page theme.
 */
export const ActiveItem: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <SidebarProvider className="min-h-0">
          <div className="bg-sidebar text-sidebar-foreground w-56 rounded-lg border p-2">
            <SidebarMenu>
              {menuItems.slice(0, 3).map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={index === 0}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton variant="outline">
                  <SettingsIcon />
                  <span>Outline variant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarProvider>
      )}
    </LightAndDark>
  ),
};

const nestedGroups = [
  { title: 'Catalog', icon: PackageIcon, open: true, activeChild: 'Product Variants', items: ['Products', 'Product Variants', 'Facets'] },
  { title: 'Sales', icon: ShoppingCartIcon, open: false, activeChild: 'Orders', items: ['Orders', 'Customers'] },
  { title: 'Settings', icon: SettingsIcon, open: false, activeChild: undefined, items: ['Channels', 'Zones'] },
];

/**
 * A group whose nested item is the current page shows it on its icon: the icon
 * takes the same brand-indicator colour and full opacity as the icon of an
 * active top-level item (Insights). The group gets no fill and no bar, since the
 * nested item carries those, and its label keeps its normal colour. The consumer
 * sets `hasActiveChild` on the group's button, so it holds while the group is
 * closed and its nested items are not mounted. Catalog is open, Sales is closed,
 * Settings has no active item and stays quiet.
 */
export const NestedItemActive: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = (scope: HTMLElement, name: string) =>
      within(scope).getByRole('button', { name }).querySelector('svg') as SVGElement;
    for (const theme of ['light', 'dark']) {
      const scope = canvas.getByTestId(`nested-${theme}`);
      const reference = icon(scope, 'Insights');
      await waitFor(() => expect(getComputedStyle(reference).opacity).toBe('1'));
      const brand = getComputedStyle(reference).color;
      for (const name of ['Catalog', 'Sales']) {
        const target = icon(scope, name);
        await waitFor(() => expect(getComputedStyle(target).color).toBe(brand));
        expect(getComputedStyle(target).opacity).toBe('1');
        const button = within(scope).getByRole('button', { name });
        expect(button).not.toHaveAttribute('data-active');
        expect(getComputedStyle(button, '::before').opacity).toBe('0');
      }
      const quiet = icon(scope, 'Settings');
      expect(getComputedStyle(quiet).color).not.toBe(brand);
      expect(getComputedStyle(quiet).opacity).not.toBe('1');
    }
  },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <SidebarProvider className="min-h-0" data-testid={`nested-${theme}`}>
          <div className="bg-sidebar text-sidebar-foreground w-56 rounded-lg border p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <ChartLineIcon />
                  <span>Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {nestedGroups.map((group) => (
                <Collapsible
                  key={group.title}
                  defaultOpen={group.open}
                  render={<SidebarMenuItem className="group/collapsible" />}
                >
                    <CollapsibleTrigger
                      render={<SidebarMenuButton hasActiveChild={Boolean(group.activeChild)} />}
                    >
                      <group.icon />
                      <span>{group.title}</span>
                      <ChevronRightIcon className="ms-auto transition-transform group-data-open/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item}>
                            <SidebarMenuSubButton render={<a href="#" />} isActive={item === group.activeChild}>
                              <span>{item}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
              ))}
            </SidebarMenu>
          </div>
        </SidebarProvider>
      )}
    </LightAndDark>
  ),
};

/**
 * The same on the icon rail, where a group's nested items sit in a hover card
 * and the rail shows only icons: the icon of the group that holds the current
 * page takes the active colour, with no fill and no bar.
 */
export const NestedItemActiveIconRail: Story = {
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = (name: string) =>
      canvas.getByRole('button', { name }).querySelector('svg') as SVGElement;
    const reference = icon('Insights');
    await waitFor(() => expect(getComputedStyle(reference).opacity).toBe('1'));
    const target = icon('Catalog');
    await waitFor(() => expect(getComputedStyle(target).color).toBe(getComputedStyle(reference).color));
    expect(getComputedStyle(target).opacity).toBe('1');
    expect(canvas.getByRole('button', { name: 'Catalog' })).not.toHaveAttribute('data-active');
    expect(getComputedStyle(icon('Sales')).opacity).not.toBe('1');
  },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Insights">
                    <ChartLineIcon />
                    <span>Insights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton hasActiveChild tooltip="Catalog">
                    <PackageIcon />
                    <span>Catalog</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Sales">
                    <ShoppingCartIcon />
                    <span>Sales</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 p-5">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

/** A clickable menu that keeps its own active item. */
function SlidingMenu({ tooltips = false }: { tooltips?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <SidebarMenu slidingIndicator>
      {menuItems.map((item, index) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            isActive={index === active}
            onClick={() => setActive(index)}
            tooltip={tooltips ? item.title : undefined}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/**
 * With slidingIndicator, SidebarMenu draws one pill that slides to the active
 * item on the drawer curve. Click an item to move it. Under reduced motion the
 * pill moves without sliding. Pinned to the light page theme.
 */
export const SlidingIndicator: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <SidebarProvider className="min-h-0">
          <div className="bg-sidebar text-sidebar-foreground w-58 rounded-lg border p-2">
            <SlidingMenu />
          </div>
        </SidebarProvider>
      )}
    </LightAndDark>
  ),
};

/**
 * The full sidebar with collapsible="icon": 232px expanded, a 60px icon rail
 * collapsed. Press the trigger (or Ctrl/Cmd+B) to toggle. The width eases on the
 * drawer curve, labels fade in place and the icons do not move. Hover a rail
 * icon for its label, shown to the right of the rail.
 */
export const IconRail: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-8 items-center gap-2.5 overflow-hidden px-3">
            <div className="bg-primary text-primary-foreground flex size-4.5 shrink-0 items-center justify-center rounded-md text-2xs font-bold">
              V
            </div>
            <span className="truncate text-sm font-semibold">Vendure</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SlidingMenu tooltips />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-13 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <span className="text-sm font-medium">Dashboard</span>
        </header>
        <div className="flex-1 p-5">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

const navGroups = [
  { label: 'Catalog', items: [{ title: 'Products', icon: PackageIcon }, { title: 'Collections', icon: FolderTreeIcon }, { title: 'Facets', icon: TagIcon }] },
  { label: 'Sales', items: [{ title: 'Orders', icon: ShoppingCartIcon }, { title: 'Customers', icon: UsersIcon }] },
  { label: 'Settings', items: [{ title: 'Channels', icon: SettingsIcon }] },
];

/**
 * A navigation in labelled groups, like the Dashboard's, on the icon rail.
 * Press the trigger (or Ctrl/Cmd+B) to toggle. Collapsing folds each group
 * label's height on the height curve while it fades, so the rail has no empty
 * row where a label was and the icons glide up as the width changes. Under
 * reduced motion the label only fades. Inactive icons are dimmed; the active
 * icon is the brand indicator.
 */
export const IconRailWithGroups: Story = {
  name: 'Icon rail with group labels',
  parameters: { layout: 'fullscreen' },
  render: function Render() {
    const [current, setCurrent] = useState('Orders');
    return (
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex h-8 items-center gap-2.5 overflow-hidden px-3">
              <div className="bg-primary text-primary-foreground flex size-4.5 shrink-0 items-center justify-center rounded-md text-2xs font-bold">
                V
              </div>
              <span className="truncate text-sm font-semibold">Vendure</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {navGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={item.title === current}
                          onClick={() => setCurrent(item.title)}
                          tooltip={item.title}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-13 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <span className="text-sm font-medium">Orders</span>
          </header>
          <div className="flex-1 p-5">
            <p className="text-muted-foreground text-sm">Main content area</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};
