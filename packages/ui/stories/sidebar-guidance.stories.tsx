import type { Meta, StoryObj } from '@storybook/react';
import { FolderTreeIcon, HomeIcon, PackageIcon, ShoppingCartIcon, TagIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from '../src/components/atoms/sidebar.tsx';

/**
 * Guidance, not props. Which icon shows the current page. For the component
 * API, see the Sidebar stories, and OneActiveIcon for the three cases with their
 * icon-only form, light and dark.
 */
const meta = {
  title: 'Atoms/Layout/Sidebar/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({ verdict, caption, children }: { verdict: 'do' | 'dont'; caption: string; children?: ReactNode }) {
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
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

function Menu({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="min-h-0 w-auto">
      <div className="bg-sidebar text-sidebar-foreground w-52 rounded-lg border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <HomeIcon />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {children}
        </SidebarMenu>
      </div>
    </SidebarProvider>
  );
}

export const OneIconForTheCurrentPage: Story = {
  name: '1 · One icon for the current page',
  render: () => (
    <Section
      title="One icon takes the active colour"
      intro="The current item's own icon, when it has one. Otherwise its group's icon. In the icon rail the nested items are hidden, so the group's icon. Set hasActiveChild on the group in every case: the Sidebar decides which icon lights up."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Example verdict="do" caption="The current item has an icon: only that icon is lit. Catalog stays neutral.">
          <Menu>
            <SidebarMenuItem>
              <SidebarMenuButton hasActiveChild>
                <PackageIcon />
                <span>Catalog</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton render={<a href="#" />} isActive>
                    <TagIcon />
                    <span>Products</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton render={<a href="#" />}>
                    <FolderTreeIcon />
                    <span>Collections</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </Menu>
        </Example>
        <Example verdict="do" caption="The current item has no icon: its group's icon is lit.">
          <Menu>
            <SidebarMenuItem>
              <SidebarMenuButton hasActiveChild>
                <ShoppingCartIcon />
                <span>Sales</span>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton render={<a href="#" />} isActive>
                    <span>Orders</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton render={<a href="#" />}>
                    <span>Customers</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </Menu>
        </Example>
        <Example
          verdict="dont"
          caption="Do not check in the consumer whether the current item has an icon, and do not set hasActiveChild only when it has none. Set it for every group that holds the current page."
        />
        <Example
          verdict="dont"
          caption="Do not set isActive and hasActiveChild on one button. isActive is for the item that is itself the current page. It also gets the fill and the bar."
        />
      </div>
    </Section>
  ),
};
