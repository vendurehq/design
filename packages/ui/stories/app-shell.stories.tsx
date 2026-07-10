import type { Meta, StoryObj } from '@storybook/react';
import { BarChart3, Package, Settings, ShoppingCart, Users } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../src/components/atoms/sidebar.tsx';
import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
} from '../src/components/molecules/app-shell.tsx';
import { SkipLink } from '../src/components/molecules/skip-link.tsx';

const meta = {
  title: 'Molecules/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const nav = [
  { icon: ShoppingCart, label: 'Orders', active: true },
  { icon: Package, label: 'Products', active: false },
  { icon: Users, label: 'Customers', active: false },
  { icon: BarChart3, label: 'Analytics', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const orders = [
  {
    id: '#10432',
    customer: 'Nordic Supply Co',
    total: '€1,240.00',
    status: 'Paid',
    tone: 'success',
  },
  { id: '#10431', customer: 'Lumen Studio', total: '€320.50', status: 'Fulfilled', tone: 'info' },
  {
    id: '#10430',
    customer: 'Atlas Freight',
    total: '€8,900.00',
    status: 'Pending',
    tone: 'warning',
  },
  { id: '#10429', customer: 'Verde Market', total: '€76.20', status: 'Refunded', tone: 'muted' },
];

const toneDot: Record<string, string> = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  muted: 'bg-muted-foreground',
};

function Nav() {
  return (
    <AppShellSidebar>
      <div className="mb-3 flex items-center gap-2 px-2 py-1">
        <div className="bg-brand size-5 rounded-md" />
        <span className="text-sm font-semibold">Vendure</span>
      </div>
      {nav.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          data-active={active}
          className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm data-[active=true]:font-medium"
        >
          <Icon className="size-4" />
          {label}
        </div>
      ))}
    </AppShellSidebar>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-1 flex-col gap-5 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">Everything sold across your channels.</p>
        </div>
        <Button size="sm">New order</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Revenue (30d)', value: '€48,210' },
          { label: 'Orders', value: '1,204' },
          { label: 'Refund rate', value: '1.8%' },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent>
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="text-sm">
            {orders.map((o, i) => (
              <div
                key={o.id}
                className="flex items-center gap-3 px-6 py-2.5"
                style={{ borderTop: i === 0 ? undefined : '1px solid var(--border)' }}
              >
                <span className="w-16 font-medium tabular-nums">{o.id}</span>
                <span className="flex-1 truncate">{o.customer}</span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full ${toneDot[o.tone]}`} />
                  {o.status}
                </span>
                <span className="w-24 text-right font-medium tabular-nums">{o.total}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// The recessed shell: canvas rail, surface pane, raised cards. Toggle the theme
// toolbar to see depth carried by lightness (dark) vs border + shadow (light).
export const Default: Story = {
  render: () => (
    <div className="p-6">
      <SkipLink href="#storybook-shell-main" />
      <AppShell className="h-[620px] min-h-0 overflow-hidden rounded-xl border border-border/60">
        <Nav />
        <AppShellContent>
          <AppShellHeader>
            <span className="text-muted-foreground text-sm">Marketing / Orders</span>
          </AppShellHeader>
          <AppShellMain id="storybook-shell-main">
            <Dashboard />
          </AppShellMain>
        </AppShellContent>
      </AppShell>
    </div>
  ),
};

// Same layout, with each tier labelled so the three steps of the ramp are legible.
export const Anatomy: Story = {
  render: () => (
    <div className="p-6">
      <AppShell className="h-[620px] min-h-0 overflow-hidden rounded-xl border border-border/60">
        <div className="relative">
          <Nav />
          <span className="text-muted-foreground pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] tracking-wide">
            shell · --background
          </span>
        </div>
        <AppShellContent className="relative">
          <span className="text-muted-foreground pointer-events-none absolute right-4 top-3 z-10 font-mono text-[10px] tracking-wide">
            pane · --surface
          </span>
          <AppShellHeader>
            <span className="text-muted-foreground text-sm">Marketing / Orders</span>
          </AppShellHeader>
          <AppShellMain>
            <Dashboard />
          </AppShellMain>
        </AppShellContent>
      </AppShell>
    </div>
  ),
};

// How a real app wires the same three tiers, using the production Sidebar atom
// (collapsible, keyboard toggle, mobile sheet) with variant="inset". The wrapper
// paints the canvas, SidebarInset is the --surface pane, cards are --surface-raised.
export const WithSidebarAtom: Story = {
  name: 'With the Sidebar atom (production shell)',
  render: () => (
    <>
      <SkipLink />
      <AppShell className="h-[620px] min-h-0 overflow-hidden">
        <SidebarProvider className="min-h-0">
          <Sidebar variant="inset">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="bg-brand size-6 rounded-md" />
                <span className="text-sm font-semibold">Vendure</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {nav.map(({ icon: Icon, label, active }) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton isActive={active}>
                          <Icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset render={<div />}>
            <AppShellHeader>
              <SidebarTrigger />
              <span className="text-muted-foreground text-sm">Marketing / Orders</span>
            </AppShellHeader>
            <AppShellMain>
              <Dashboard />
            </AppShellMain>
          </SidebarInset>
        </SidebarProvider>
      </AppShell>
    </>
  ),
};
