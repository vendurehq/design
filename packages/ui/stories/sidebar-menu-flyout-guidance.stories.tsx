import type { Meta, StoryObj } from '@storybook/react';
import { HomeIcon, PackageIcon, ShoppingCartIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuFlyout,
  SidebarMenuFlyoutContent,
  SidebarMenuFlyoutItem,
  SidebarMenuFlyoutTrigger,
  SidebarMenuItem,
  SidebarProvider,
} from '../src/components/atoms/sidebar.tsx';

/**
 * Guidance, not props. In the icon rail, a group's items open in a
 * SidebarMenuFlyout beside its icon. For the component API and the placement
 * checks, see Atoms/Layout/Sidebar, IconRailFlyout.
 */
const meta = {
  title: 'Atoms/Layout/Sidebar/Flyout Guidance',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ───────────

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div>{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

const groups = [
  { title: 'Sales', icon: ShoppingCartIcon, items: ['Orders', 'Draft orders'] },
  { title: 'Catalog', icon: PackageIcon, items: ['Products', 'Collections', 'Facets'] },
];

export const GroupInTheRail: Story = {
  name: '1 · A group in the icon rail is a flyout',
  render: () => (
    <div className="p-6">
      <Section
        title="Hover or focus a group's icon to see its pages"
        intro="The flyout's title row lines up with the icon, so it reads as the icon's label: add no Tooltip. Pass hasActiveChild to the trigger and active to the current item. A single page with no items stays a SidebarMenuButton."
      >
        <Example verdict="do" caption="Sales holds the current page (Orders), so its icon takes the active colour. Home is one page, so it is a plain button.">
          <SidebarProvider defaultOpen={false} className="min-h-80 rounded-lg border">
            <Sidebar collapsible="icon" className="absolute h-full">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Home">
                          <HomeIcon />
                          <span>Home</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {groups.map((group) => (
                        <SidebarMenuItem key={group.title}>
                          <SidebarMenuFlyout>
                            <SidebarMenuFlyoutTrigger hasActiveChild={group.title === 'Sales'}>
                              <group.icon />
                              <span>{group.title}</span>
                            </SidebarMenuFlyoutTrigger>
                            <SidebarMenuFlyoutContent label={group.title}>
                              {group.items.map((item) => (
                                <SidebarMenuFlyoutItem key={item} href="#" active={item === 'Orders'}>
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
            </Sidebar>
            <SidebarInset render={<div />} className="p-4 text-sm">
              Hover Sales or Catalog.
            </SidebarInset>
          </SidebarProvider>
        </Example>
      </Section>
    </div>
  ),
};
