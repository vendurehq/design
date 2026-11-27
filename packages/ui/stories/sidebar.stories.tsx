import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  ChartLineIcon,
  CloudIcon,
  CreditCardIcon,
  DatabaseIcon,
  FolderIcon,
  GaugeIcon,
  GitBranchIcon,
  RocketIcon,
  ScrollTextIcon,
  VariableIcon,
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
  SidebarIdentityButton,
  SidebarIdentityText,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuFlyout,
  SidebarMenuFlyoutContent,
  SidebarMenuFlyoutItem,
  SidebarMenuFlyoutTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
  SidebarInset,
  SidebarLevels,
  SidebarLevel,
  SidebarLevelBack,
} from '../src/components/atoms/sidebar.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../src/components/atoms/collapsible.tsx';
import { Avatar, AvatarFallback } from '../src/components/atoms/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';

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
              <SlidingMenu />
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
 * With `slidingIndicator={false}` the menu draws no pill: the active item gets
 * the sidebar-accent fill and a sidebar-primary bar on its leading edge, so it
 * differs from hover (same fill), and its icon takes brand-indicator. The
 * outline variant draws its border again. Hover an item to compare. Pinned to
 * the light page theme.
 */
export const ActiveItem: Story = {
  name: 'Active item without the pill',
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <SidebarProvider className="min-h-0">
          <div className="bg-sidebar text-sidebar-foreground w-56 rounded-lg border p-2">
            <SidebarMenu slidingIndicator={false}>
              {menuItems.slice(0, 3).map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton active={index === 0}>
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
                <SidebarMenuButton active>
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
                      <ChevronRightIcon className="ms-auto transition-transform group-data-[open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item}>
                            <SidebarMenuSubButton render={<a href="#" />} active={item === group.activeChild}>
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
                  <SidebarMenuButton active tooltip="Insights">
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

const flyoutGroups = [
  { title: 'Insights', icon: ChartLineIcon, items: ['Overview'] },
  { title: 'Catalog', icon: PackageIcon, items: ['Products', 'Facets', 'Collections', 'Assets'] },
  { title: 'Sales', icon: ShoppingCartIcon, items: ['Orders', 'Promotions'] },
  { title: 'Customers', icon: UsersIcon, items: ['Customers', 'Customer groups'] },
];

/**
 * In the icon rail a group's items sit in a flyout: hover or focus the group's
 * icon. The title row lines up with the icon, so the title reads as its label.
 * Near the bottom of the screen the card shifts up to stay on screen (hover
 * Settings).
 */
export const IconRailFlyout: Story = {
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const centre = (box: DOMRect) => box.top + box.height / 2;
    for (const name of ['Sales', 'Catalog']) {
      const trigger = canvas.getByRole('button', { name });
      await userEvent.hover(trigger);
      const label = await waitFor(() => {
        const found = [...document.querySelectorAll('[data-slot=sidebar-menu-flyout-label]')].find(
          (element) => element.textContent === name,
        );
        expect(found).toBeTruthy();
        return found as HTMLElement;
      });
      const icon = trigger.querySelector('svg') as SVGElement;
      await waitFor(() =>
        expect(
          Math.abs(centre(label.getBoundingClientRect()) - centre(icon.getBoundingClientRect())),
        ).toBeLessThanOrEqual(1),
      );
      await userEvent.unhover(trigger);
    }
    // At the bottom of the screen the card shifts up instead of leaving it.
    const settings = canvas.getByRole('button', { name: 'Settings' });
    await userEvent.hover(settings);
    await waitFor(() => {
      const card = [...document.querySelectorAll('[data-slot=hover-card-content]')].find((element) =>
        element.textContent?.startsWith('Settings'),
      );
      expect(card).toBeTruthy();
      expect((card as HTMLElement).getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    });
    await userEvent.unhover(settings);
  },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {flyoutGroups.map((group) => (
                  <SidebarMenuItem key={group.title}>
                    <SidebarMenuFlyout>
                      <SidebarMenuFlyoutTrigger hasActiveChild={group.title === 'Sales'}>
                        <group.icon />
                        <span>{group.title}</span>
                      </SidebarMenuFlyoutTrigger>
                      <SidebarMenuFlyoutContent label={group.title}>
                        {group.items.map((item) => (
                          <SidebarMenuFlyoutItem
                            key={item}
                            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                            active={item === 'Orders'}
                          >
                            {item}
                          </SidebarMenuFlyoutItem>
                        ))}
                      </SidebarMenuFlyoutContent>
                    </SidebarMenuFlyout>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuFlyout>
                <SidebarMenuFlyoutTrigger>
                  <SettingsIcon />
                  <span>Settings</span>
                </SidebarMenuFlyoutTrigger>
                <SidebarMenuFlyoutContent label="Settings">
                  {['Sellers', 'Channels', 'Stock locations', 'Zones', 'Countries', 'Tax rates'].map(
                    (item) => (
                      <SidebarMenuFlyoutItem key={item} href="#">
                        {item}
                      </SidebarMenuFlyoutItem>
                    ),
                  )}
                </SidebarMenuFlyoutContent>
              </SidebarMenuFlyout>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 p-5">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};

type RuleItem = { title: string; icon?: typeof TagIcon; active?: boolean };
type RuleCase = {
  key: string;
  caption: string;
  group: { title: string; icon: typeof TagIcon; open: boolean; items: RuleItem[] };
  /** The one icon that must show the active colour, per mode. */
  lit: { expanded: string; rail: string };
};

const ruleCases: RuleCase[] = [
  {
    key: 'own-icon',
    caption: 'The current item has its own icon',
    group: {
      title: 'Catalog',
      icon: PackageIcon,
      open: true,
      items: [{ title: 'Products', icon: TagIcon, active: true }, { title: 'Facets', icon: FolderTreeIcon }],
    },
    lit: { expanded: 'Products', rail: 'Catalog' },
  },
  {
    key: 'no-icon',
    caption: 'The current item has no icon',
    group: {
      title: 'Sales',
      icon: ShoppingCartIcon,
      open: true,
      items: [{ title: 'Orders', active: true }, { title: 'Customers' }],
    },
    lit: { expanded: 'Sales', rail: 'Sales' },
  },
  {
    key: 'closed',
    caption: 'The group is closed, so its items are not mounted',
    group: {
      title: 'Settings',
      icon: SettingsIcon,
      open: false,
      items: [{ title: 'Channels', icon: SettingsIcon, active: true }, { title: 'Zones' }],
    },
    lit: { expanded: 'Settings', rail: 'Settings' },
  },
];

/**
 * One menu for one case. The consumer passes `hasActiveChild` on the group for
 * every case, as it would not know whether the current item shows an icon. The
 * Sidebar decides which icon lights up.
 */
function ActiveIconMenu({ rule, mode, testId }: { rule: RuleCase; mode: 'expanded' | 'rail'; testId: string }) {
  const { group } = rule;
  return (
    <div
      data-testid={testId}
      data-collapsible={mode === 'rail' ? 'icon' : ''}
      className={`bg-sidebar text-sidebar-foreground group rounded-lg border p-2 ${mode === 'rail' ? 'w-15' : 'w-52'}`}
    >
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <HomeIcon />
            <span>Home</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <Collapsible defaultOpen={group.open} render={<SidebarMenuItem className="group/collapsible" />}>
          <CollapsibleTrigger render={<SidebarMenuButton hasActiveChild />}>
            <group.icon />
            <span>{group.title}</span>
            <ChevronRightIcon className="ms-auto transition-transform group-data-[open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {group.items.map((item) => (
                <SidebarMenuSubItem key={item.title}>
                  <SidebarMenuSubButton render={<a href="#" />} active={item.active}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenu>
    </div>
  );
}

/**
 * For the current page, exactly one icon in the sidebar takes the active colour.
 * The current item's own icon when it has one. Its group's icon when the item
 * has no icon, when the group is closed (its items are not mounted), and in the
 * icon rail (its items are hidden). The group's icon is never lit together with
 * the icon of its current item. Each row is one case, expanded and as an icon
 * rail. In every menu the group button has `hasActiveChild`.
 */
export const OneActiveIcon: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const theme of ['light', 'dark']) {
      for (const rule of ruleCases) {
        for (const mode of ['expanded', 'rail'] as const) {
          const scope = canvas.getByTestId(`one-icon-${theme}-${rule.key}-${mode}`);
          const probe = document.createElement('span');
          probe.className = 'text-brand-indicator';
          scope.append(probe);
          const brand = getComputedStyle(probe).color;
          probe.remove();
          const lit = () =>
            Array.from(scope.querySelectorAll<SVGElement>('button > svg:first-child, a > svg:first-child'))
              .filter((icon) => icon.getClientRects().length > 0)
              .filter((icon) => getComputedStyle(icon).color === brand && getComputedStyle(icon).opacity === '1')
              .map((icon) => icon.parentElement?.textContent?.trim());
          await waitFor(() => expect(lit()).toEqual([rule.lit[mode]]));
          // The label of the group button, which has a chevron after it, fades
          // in the rail like the label of a plain button.
          for (const title of ['Home', rule.group.title]) {
            await waitFor(() =>
              expect(getComputedStyle(within(scope).getByText(title)).opacity).toBe(mode === 'rail' ? '0' : '1'),
            );
          }
        }
      }
    }
  },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <SidebarProvider className="min-h-0">
          <div className="flex flex-col gap-5">
            {ruleCases.map((rule) => (
              <div key={rule.key} className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">{rule.caption}</p>
                <div className="flex items-start gap-4">
                  {(['expanded', 'rail'] as const).map((mode) => (
                    <ActiveIconMenu
                      key={mode}
                      rule={rule}
                      mode={mode}
                      testId={`one-icon-${theme}-${rule.key}-${mode}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SidebarProvider>
      )}
    </LightAndDark>
  ),
};

/** A clickable menu that keeps its own active item. */
function SlidingMenu({ tooltips = false }: { tooltips?: boolean }) {
  const [active, setActive] = useState(0);
  return (
    <SidebarMenu>
      {menuItems.map((item, index) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            active={index === active}
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
 * By default SidebarMenu marks the active item with one raised pill (surface
 * fill, border, control shadow, no bar) that slides to the next active item on
 * the drawer curve. Click an item to move it. Under reduced motion the pill
 * moves without sliding. Follows the theme toggle.
 */
export const SlidingIndicator: Story = {
  render: () => (
    <SidebarProvider className="min-h-0">
      <div className="bg-sidebar text-sidebar-foreground w-58 rounded-lg border p-2">
        <SlidingMenu />
      </div>
    </SidebarProvider>
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
                          active={item.title === current}
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

const dashboardTop = [
  { title: 'Dashboard', icon: HomeIcon },
  { title: 'Catalog', icon: PackageIcon, items: ['Products', 'Facets', 'Collections'] },
  { title: 'Sales', icon: ShoppingCartIcon, items: ['Orders'] },
  { title: 'Customers', icon: UsersIcon, items: ['Customer list', 'Customer groups'] },
  { title: 'Marketing', icon: TagIcon, items: ['Promotions'] },
];
const dashboardBottom = [
  { title: 'Settings', icon: SettingsIcon, items: ['Channels', 'Zones', 'Tax rates'] },
  { title: 'System', icon: ChartLineIcon, items: ['Job queue', 'Healthchecks'] },
];
type DashboardEntry = (typeof dashboardTop)[number] | (typeof dashboardBottom)[number];

/** One SidebarMenu of the Dashboard nav: links and collapsible sections. */
function DashboardMenu({
  entries,
  current,
  open,
  go,
  toggle,
}: {
  entries: DashboardEntry[];
  current: string;
  open: string | null;
  go: (page: string) => void;
  toggle: (section: string) => void;
}) {
  return (
    <SidebarMenu>
      {entries.map((entry) =>
        'items' in entry && entry.items ? (
          <Collapsible
            key={entry.title}
            open={open === entry.title}
            onOpenChange={() => toggle(entry.title)}
            render={<SidebarMenuItem className="group/collapsible" />}
          >
            <CollapsibleTrigger
              render={
                <SidebarMenuButton
                  tooltip={entry.title}
                  hasActiveChild={entry.items.includes(current)}
                />
              }
            >
              <entry.icon />
              <span>{entry.title}</span>
              <ChevronRightIcon className="ms-auto transition-transform rtl:rotate-180 group-data-[open]/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {entry.items.map((item) => (
                  <SidebarMenuSubItem key={item}>
                    <SidebarMenuSubButton
                      render={<a href="#" />}
                      active={item === current}
                      onClick={(event) => {
                        event.preventDefault();
                        go(item);
                      }}
                    >
                      <span>{item}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuItem key={entry.title}>
            <SidebarMenuButton
              tooltip={entry.title}
              active={entry.title === current}
              onClick={() => go(entry.title)}
            >
              <entry.icon />
              <span>{entry.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ),
      )}
    </SidebarMenu>
  );
}

/**
 * The Dashboard's navigation, with the default pill: a top menu of links and
 * collapsible sections, and an Administration menu at the bottom. Only a
 * top-level item gets the pill. A nested item keeps its fill, with no pill and
 * no bar, and its section's icon is the one icon in the active colour. Open a
 * section above the current page and the pill follows the item down. Press
 * the trigger (or Ctrl/Cmd+B) for the icon rail.
 */
export const DashboardNavigation: Story = {
  name: 'Dashboard navigation (groups and nested items)',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pills = () =>
      Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-indicator"]'));
    const brand = () => getComputedStyle(canvas.getByRole('button', { name: 'Dashboard' }).querySelector('svg')!).color;
    const litIcons = (color: string) =>
      Array.from(
        canvasElement.querySelectorAll<SVGElement>(
          '[data-slot="sidebar-menu-button"] > svg:first-child, [data-slot="sidebar-menu-sub-button"] > svg:first-child',
        ),
      ).filter((svg) => getComputedStyle(svg).color === color && getComputedStyle(svg).opacity === '1');

    // A top-level page: one pill, in the top menu, on the item; no bar.
    await waitFor(() => expect(pills().filter((pill) => 'shown' in pill.dataset)).toHaveLength(1));
    const dashboard = canvas.getByRole('button', { name: 'Dashboard' });
    expect(getComputedStyle(dashboard, '::before').display).toBe('none');
    await waitFor(() => expect(getComputedStyle(dashboard.querySelector('svg')!).opacity).toBe('1'));
    const color = brand();
    expect(litIcons(color)).toHaveLength(1);

    // A nested page: no pill anywhere, the sub-item has its fill and no bar,
    // and the section's icon is the only one in the active colour.
    await userEvent.click(canvas.getByRole('button', { name: 'Sales' }));
    const orders = await canvas.findByRole('link', { name: 'Orders' });
    await userEvent.click(orders);
    await waitFor(() => expect(pills().filter((pill) => 'shown' in pill.dataset)).toHaveLength(0));
    const quietSub = canvas.getByRole('button', { name: 'Dashboard' });
    expect(getComputedStyle(orders).backgroundColor).not.toBe(getComputedStyle(quietSub).backgroundColor);
    expect(getComputedStyle(orders, '::before').content).toBe('none');
    const sales = canvas.getByRole('button', { name: 'Sales' }).querySelector('svg')!;
    await waitFor(() => expect(getComputedStyle(sales).color).toBe(color));
    await waitFor(() => expect(litIcons(color)).toHaveLength(1));

    // Back to a top-level page: the pill comes back on it.
    await userEvent.click(dashboard);
    await waitFor(() => expect(pills().filter((pill) => 'shown' in pill.dataset)).toHaveLength(1));
  },
  render: function Render() {
    const [current, setCurrent] = useState('Dashboard');
    const sectionOf = (page: string) =>
      [...dashboardTop, ...dashboardBottom].find((entry) => 'items' in entry && entry.items?.includes(page))?.title ?? null;
    const [openTop, setOpenTop] = useState<string | null>(null);
    const [openBottom, setOpenBottom] = useState<string | null>(null);
    const go = (page: string) => {
      setCurrent(page);
      const section = sectionOf(page);
      if (dashboardTop.some((entry) => entry.title === section)) setOpenTop(section);
      if (dashboardBottom.some((entry) => entry.title === section)) setOpenBottom(section);
    };
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
            <SidebarGroup>
              <DashboardMenu
                entries={dashboardTop}
                current={current}
                open={openTop}
                go={go}
                toggle={(section) => setOpenTop((open) => (open === section ? null : section))}
              />
            </SidebarGroup>
            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <DashboardMenu
                entries={dashboardBottom}
                current={current}
                open={openBottom}
                go={go}
                toggle={(section) => setOpenBottom((open) => (open === section ? null : section))}
              />
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-13 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <span className="text-sm font-medium">{current}</span>
          </header>
          <div className="flex-1 p-5">
            <p className="text-muted-foreground text-sm">Main content area</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};

/** A header switcher with a wrapped icon and a footer account with an Avatar. */
function SwitcherAndAccount() {
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Default channel" data-testid="switcher">
                <span
                  data-testid="switcher-icon"
                  className="bg-background flex size-8 shrink-0 items-center justify-center rounded-lg border"
                >
                  <PackageIcon />
                </span>
                <span data-testid="switcher-label">Default channel</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SlidingMenu tooltips />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip="Ada Lovelace" data-testid="account">
                <Avatar data-testid="account-avatar">
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <span data-testid="account-label">Ada Lovelace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-13 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <span className="text-sm font-medium">Home</span>
        </header>
        <div className="flex-1 p-5">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </SidebarInset>
    </>
  );
}

/**
 * The icon rail hides the label of a menu button, not its media. A header
 * switcher whose icon sits in a wrapping span, and a footer account with an
 * Avatar, keep the icon and the avatar in the rail; only the label text fades.
 * Starts collapsed. Press the trigger (or Ctrl/Cmd+B) to expand.
 */
export const IconRailWithAvatarAndWrappedIcon: Story = {
  name: 'Icon rail with a wrapped icon and an avatar',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opacity = (id: string) => getComputedStyle(canvas.getByTestId(id)).opacity;
    await waitFor(() => expect(opacity('switcher-label')).toBe('0'));
    await waitFor(() => expect(opacity('account-label')).toBe('0'));
    expect(opacity('switcher-icon')).toBe('1');
    expect(opacity('account-avatar')).toBe('1');
  },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <SwitcherAndAccount />
    </SidebarProvider>
  ),
};

/**
 * The account switch in the header and the user menu in the footer, each a
 * SidebarIdentityButton that opens a menu. The account takes a square avatar,
 * the person a round one.
 */
function IdentitySidebar({ dir = 'ltr' }: { dir?: 'ltr' | 'rtl' }) {
  return (
    <>
      <Sidebar collapsible="icon" dir={dir}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<SidebarIdentityButton tooltip="Acme Corporation" data-testid="account-switch" />}
                >
                  <Avatar shape="square" data-testid="account-switch-avatar">
                    {/* A fallback with its own colour, like a Console account avatar. */}
                    <AvatarFallback className="bg-primary text-primary-foreground">AC</AvatarFallback>
                  </Avatar>
                  <SidebarIdentityText title="Acme Corporation" caption="Customer account" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Customer accounts</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Avatar shape="square" size="sm">
                        <AvatarFallback>AC</AvatarFallback>
                      </Avatar>
                      Acme Corporation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Avatar shape="square" size="sm">
                        <AvatarFallback>GL</AvatarFallback>
                      </Avatar>
                      Globex
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SlidingMenu tooltips />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<SidebarIdentityButton tooltip="Ada Lovelace" data-testid="user-menu" />}
                >
                  <Avatar data-testid="user-menu-avatar">
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <SidebarIdentityText
                    title="Ada Lovelace"
                    caption="ada@example.com"
                    data-testid="user-menu-text"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="right" className="min-w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                      <Avatar>
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <SidebarIdentityText title="Ada Lovelace" caption="ada@example.com" />
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-13 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <span className="text-sm font-medium">Home</span>
        </header>
        <div className="flex-1 p-5">
          <p className="text-muted-foreground text-sm">Main content area</p>
        </div>
      </SidebarInset>
    </>
  );
}

const chevronOf = (button: HTMLElement) =>
  button.querySelector('[data-slot=sidebar-identity-chevron]') as HTMLElement;
const textOf = (button: HTMLElement) =>
  button.querySelector('[data-slot=sidebar-identity-text]') as HTMLElement;

/**
 * The account or user switch: SidebarIdentityButton, an Avatar and a
 * SidebarIdentityText, rendered as the trigger of its menu. It takes the fill
 * while the menu is open.
 */
export const IdentitySwitch: Story = {
  name: 'Identity switch in the header and the footer',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const userMenu = canvas.getByTestId('user-menu');
    const account = canvas.getByTestId('account-switch');

    // One chevron each, a title over a caption, all visible.
    await expect(account.querySelectorAll('[data-slot=sidebar-identity-chevron]')).toHaveLength(1);
    await expect(getComputedStyle(chevronOf(userMenu)).opacity).toBe('1');
    await expect(getComputedStyle(textOf(userMenu)).opacity).toBe('1');
    await expect(account).toHaveAccessibleName(/Acme Corporation/);

    // The person is round, the account square.
    const radius = (id: string) => parseFloat(getComputedStyle(canvas.getByTestId(id)).borderTopLeftRadius);
    await expect(radius('user-menu-avatar')).toBeGreaterThan(radius('account-switch-avatar'));

    // A fallback with its own colour keeps it; a default one takes the sidebar text colour.
    const fallbackColor = (id: string) =>
      getComputedStyle(canvas.getByTestId(id).querySelector('[data-slot=avatar-fallback]') as HTMLElement).color;
    const probe = document.createElement('span');
    probe.className = 'text-primary-foreground';
    canvasElement.append(probe);
    await expect(fallbackColor('account-switch-avatar')).toBe(getComputedStyle(probe).color);
    probe.className = 'text-sidebar-foreground';
    await expect(fallbackColor('user-menu-avatar')).toBe(getComputedStyle(probe).color);
    probe.remove();

    // Open: the trigger takes the fill, with the pointer moved away so the
    // hover fill cannot stand in for it.
    const idleFill = getComputedStyle(userMenu).backgroundColor;
    await userEvent.click(userMenu);
    await userEvent.unhover(userMenu);
    await page.findByRole('menuitem', { name: 'Sign out' });
    await waitFor(() => expect(userMenu).toHaveAttribute('data-popup-open'));
    await waitFor(() => expect(getComputedStyle(userMenu).backgroundColor).not.toBe(idleFill));
    await userEvent.keyboard('{Escape}');
  },
  render: () => (
    <SidebarProvider>
      <IdentitySidebar />
    </SidebarProvider>
  ),
};

/**
 * In the icon rail the text and the chevron fade and the avatar stays. The
 * text stays mounted, so the button keeps its accessible name.
 */
export const IdentitySwitchIconRail: Story = {
  name: 'Identity switch on the icon rail',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const id of ['account-switch', 'user-menu']) {
      const button = canvas.getByTestId(id);
      await waitFor(() => expect(getComputedStyle(textOf(button)).opacity).toBe('0'));
      await waitFor(() => expect(getComputedStyle(chevronOf(button)).opacity).toBe('0'));
      await expect(getComputedStyle(canvas.getByTestId(`${id}-avatar`)).opacity).toBe('1');
    }
    await expect(canvas.getByTestId('user-menu')).toHaveAccessibleName(/Ada Lovelace/);
  },
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <IdentitySidebar />
    </SidebarProvider>
  ),
};

/** Right to left: the chevron sits at the start edge, the text aligns right. */
export const IdentitySwitchRightToLeft: Story = {
  name: 'Identity switch, right to left',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByTestId('user-menu');
    const chevron = chevronOf(button).getBoundingClientRect();
    const text = textOf(button).getBoundingClientRect();
    await expect(chevron.right).toBeLessThanOrEqual(text.left);
  },
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <SidebarProvider>
          <IdentitySidebar dir="rtl" />
        </SidebarProvider>
      </div>
    </DirectionProvider>
  ),
};

const rootNav = [
  { title: 'Projects', icon: FolderIcon },
  { title: 'Team', icon: UsersIcon },
  { title: 'Billing', icon: CreditCardIcon },
];
const cloudNav = [
  { title: 'Overview', icon: GaugeIcon },
  { title: 'Deployments', icon: RocketIcon },
  { title: 'Logs', icon: ScrollTextIcon },
  { title: 'Variables', icon: VariableIcon },
  { title: 'Database', icon: DatabaseIcon },
];

/** A menu of pages with the default pill. */
function PageMenu({
  pages,
  current,
  go,
}: {
  pages: { title: string; icon: typeof HomeIcon }[];
  current: string;
  go: (page: string) => void;
}) {
  return (
    <SidebarMenu>
      {pages.map((page) => (
        <SidebarMenuItem key={page.title}>
          <SidebarMenuButton active={page.title === current} onClick={() => go(page.title)} tooltip={page.title}>
            <page.icon />
            <span>{page.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

/** A Console-like sidebar whose Cloud item opens a second level. */
function TwoLevelSidebar({
  defaultOpen = true,
  dir = 'ltr',
  variant,
}: { defaultOpen?: boolean; dir?: 'ltr' | 'rtl'; variant?: 'sidebar' | 'inset' }) {
  // The level follows the page, as it would follow the route.
  const [current, setCurrent] = useState('Projects');
  const level = cloudNav.some((page) => page.title === current) || current === 'Source' ? 'cloud' : 'root';
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <Sidebar collapsible="icon" dir={dir} variant={variant}>
            <SidebarHeader>
              <div className="flex h-8 items-center gap-2.5 overflow-hidden px-3">
                <div className="bg-primary text-primary-foreground flex size-4.5 shrink-0 items-center justify-center rounded-md text-2xs font-bold">
                  V
                </div>
                <span className="truncate text-sm font-semibold">Vendure Console</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarLevels level={level}>
                <SidebarLevel value="root" aria-label="Console">
                  <SidebarGroup>
                    <PageMenu pages={rootNav} current={current} go={setCurrent} />
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setCurrent('Overview')} tooltip="Cloud">
                          <CloudIcon />
                          <span>Cloud</span>
                          <ChevronRightIcon className="ms-auto rtl:rotate-180" />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarLevel>
                <SidebarLevel value="cloud" aria-label="Cloud">
                  <SidebarGroup>
                    <SidebarLevelBack onClick={() => setCurrent('Projects')} tooltip="Back to Console">
                      Cloud
                    </SidebarLevelBack>
                    <PageMenu pages={cloudNav} current={current} go={setCurrent} />
                  </SidebarGroup>
                  <SidebarGroup>
                    <SidebarGroupLabel>Project</SidebarGroupLabel>
                    <PageMenu pages={[{ title: 'Source', icon: GitBranchIcon }]} current={current} go={setCurrent} />
                  </SidebarGroup>
                </SidebarLevel>
              </SidebarLevels>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-13 items-center gap-2 border-b px-3">
              <SidebarTrigger />
              <span className="text-sm font-medium">{current}</span>
            </header>
            <div className="flex-1 p-5">
              <p className="text-muted-foreground text-sm">Main content area</p>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </DirectionProvider>
  );
}

/**
 * A sidebar with two levels. Cloud opens its own level: the new level slides
 * in from the end side and starts with a back row, a chevron and the area's
 * name. The back row slides the first level back in from the start side. Each
 * level has its own pill, which never slides from one level to the other.
 * Focus moves to the new level's first item, and back to Cloud on the way
 * back. The consumer controls the level; here it follows the current page.
 */
export const TwoLevels: Story = {
  name: 'Two levels',
  parameters: { layout: 'fullscreen' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const level = (value: string) =>
      canvasElement.querySelector<HTMLElement>(`[data-slot="sidebar-level"][data-value="${value}"]`)!;
    expect(level('root')).toHaveAttribute('data-state', 'active');
    expect(level('cloud')).toHaveAttribute('data-state', 'after');
    expect(level('cloud')).toHaveAttribute('inert');

    const cloud = canvas.getByRole('button', { name: 'Cloud' });
    await userEvent.click(cloud);
    await waitFor(() => expect(level('cloud')).toHaveAttribute('data-state', 'active'));
    expect(level('root')).toHaveAttribute('data-state', 'before');
    expect(level('root')).toHaveAttribute('inert');
    const back = within(level('cloud')).getByRole('button', { name: 'Cloud' });
    await waitFor(() => expect(back).toHaveFocus());

    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(level('root')).toHaveAttribute('data-state', 'active'));
    await waitFor(() => expect(cloud).toHaveFocus());
  },
  render: () => <TwoLevelSidebar />,
};

/**
 * The two levels on the icon rail. The back row shows only its chevron;
 * hover it for its label. Press the trigger (or Ctrl/Cmd+B) to expand.
 */
export const TwoLevelsIconRail: Story = {
  name: 'Two levels on the icon rail',
  parameters: { layout: 'fullscreen' },
  render: () => <TwoLevelSidebar defaultOpen={false} />,
};

/** Right to left: going deeper slides in from the left, the back chevron points right. */
export const TwoLevelsRightToLeft: Story = {
  name: 'Two levels, right to left',
  parameters: { layout: 'fullscreen' },
  render: () => <TwoLevelSidebar dir="rtl" />,
};

/**
 * The inset pane sits 8px from every edge except the sidebar's: there it
 * meets the sidebar with no margin. `side` is logical, so the start sidebar
 * of a right-to-left page is on the right and drops the right margin.
 */
async function checkInsetMargins(canvasElement: HTMLElement, side: 'left' | 'right') {
  const inset = canvasElement.querySelector('[data-slot=sidebar-inset]') as HTMLElement;
  const style = getComputedStyle(inset);
  const [near, far] = side === 'left' ? ['marginLeft', 'marginRight'] : ['marginRight', 'marginLeft'];
  await expect(style[near as 'marginLeft']).toBe('0px');
  await expect(style[far as 'marginLeft']).toBe('8px');
  await expect(style.marginTop).toBe('8px');
}

/** The inset variant: the content is a recessed pane next to the sidebar. */
export const Inset: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <TwoLevelSidebar variant="inset" />,
  play: async ({ canvasElement }) => checkInsetMargins(canvasElement, 'left'),
};

/** The inset variant right to left, with the sidebar on the right. */
export const InsetRightToLeft: Story = {
  name: 'Inset, right to left',
  parameters: { layout: 'fullscreen' },
  render: () => <TwoLevelSidebar dir="rtl" variant="inset" />,
  play: async ({ canvasElement }) => checkInsetMargins(canvasElement, 'right'),
};

// The sidebar opens in a sheet below 768px. useIsMobile reads
// `window.innerWidth`, so the story narrows it while it is mounted.
function narrowWindow() {
  const own = Object.getOwnPropertyDescriptor(window, 'innerWidth');
  Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => 500 });
  return () => {
    if (own) Object.defineProperty(window, 'innerWidth', own);
    else delete (window as { innerWidth?: number }).innerWidth;
  };
}

/**
 * On a small screen the sidebar opens in a sheet with a screen-reader title
 * and description. `mobileLabels` sets them; `messages.sidebar`
 * (`mobileTitle`, `mobileDescription`) sets them once for the app, and
 * `mobileLabels` wins.
 */
export const MobileLabels: Story = {
  tags: ['!autodocs'],
  beforeEach: narrowWindow,
  render: () => (
    <FormatProvider messages={{ sidebar: { mobileTitle: 'Seitenleiste', mobileDescription: 'Die Navigation der App.' } }}>
      <SidebarProvider>
        <Sidebar mobileLabels={{ title: 'Navigation' }}>
          <SidebarContent>
            <SidebarGroup>
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
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
        </SidebarInset>
      </SidebarProvider>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    // The desktop sidebar leaves the page once useIsMobile has read the width.
    await waitFor(() => expect(canvasElement.querySelector('[data-slot="sidebar-gap"]')).toBeNull());
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Toggle Sidebar' }));
    const sheet = await within(document.body).findByRole('dialog', { name: 'Navigation' });
    await expect(sheet).toHaveAccessibleDescription('Die Navigation der App.');
    await userEvent.keyboard('{Escape}');
  },
};
