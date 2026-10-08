import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import {
  HomeIcon,
  InboxIcon,
  SearchIcon,
  SettingsIcon,
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
  SidebarTrigger,
  SidebarInset,
} from '../src/components/atoms/sidebar.tsx';

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
 * from hover (both use the sidebar-accent fill). The outline variant draws its
 * border again. Hover an item to compare. Pinned to the light page theme.
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
