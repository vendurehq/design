import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDashboardIcon, MenuIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AppShell,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  AppShellSidebar,
} from '../src/components/molecules/app-shell.tsx';
import { SkipLink } from '../src/components/molecules/skip-link.tsx';

/**
 * Guidance, not props. AppShell owns the application surface anatomy and focus
 * destination; consumers still own routing, navigation data, auth, and context
 * switching. The regular AppShell stories document the compound API.
 */
const meta = { title: 'Molecules/AppShell/Guidance' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export const Ownership: Story = {
  name: '1 · One shell anatomy, app-owned integrations',
  render: () => (
    <div className="max-w-4xl space-y-10">
      <Section title="The invariant anatomy">
        <p className="text-muted-foreground max-w-2xl text-sm">
          Every authenticated surface gets one skip link, one navigation region, one compact header,
          and one focusable main region. Prefer AppShellMain as the scroll owner so the
          viewport-bound shell keeps its header and canvas inset visible. When integrating with an
          established shell that already owns scrolling, set scrollOwner=&quot;container&quot;. Apps
          fill the slots with their own router links, organization switcher, user menu, and route
          outlet.
        </p>
        <div className="h-80 overflow-hidden rounded-xl border">
          <SkipLink href="#guidance-main" />
          <AppShell className="h-full">
            <AppShellSidebar className="w-44">
              <div className="flex items-center gap-2 px-2 text-sm font-medium">
                <LayoutDashboardIcon className="size-4" /> Vendure
              </div>
            </AppShellSidebar>
            <AppShellContent>
              <AppShellHeader>
                <MenuIcon className="size-4" />
                <span className="text-sm">Products</span>
              </AppShellHeader>
              <AppShellMain id="guidance-main" className="p-6">
                <h1 className="text-style-page-title">Products</h1>
              </AppShellMain>
            </AppShellContent>
          </AppShell>
        </div>
      </Section>
      <Section title="Do not fork the chrome">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-success-subtle-foreground font-semibold">Do</p>
            <p className="text-muted-foreground mt-2">
              Compose router-specific links inside the shared slots and keep the surface, focus,
              scroll, and responsive rules intact. With the Sidebar atom, render SidebarInset as a
              div so AppShellMain remains the only main landmark.
            </p>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-destructive-subtle-foreground font-semibold">Don&apos;t</p>
            <p className="text-muted-foreground mt-2">
              Copy the full shell to change a logo or user-menu action. Those are slot content, not
              reasons for a new layout contract.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const Header: Story = {
  name: '2 · One sticky header row',
  render: () => (
    <div className="max-w-4xl space-y-10">
      <Section title="The header">
        <p className="text-muted-foreground max-w-2xl text-sm">
          AppShellHeader is one 52px row: the sidebar trigger, the breadcrumb, then page-level
          tools at the end. It sticks to the top of the scrolling element. With
          scrollOwner=&quot;container&quot; the page passes under it. The header is opaque in the
          pane&apos;s colour with a hairline below, so a log or a long table never shows through.
          Scroll the example.
        </p>
        <div className="h-72 overflow-hidden rounded-xl border">
          <AppShell className="h-full">
            {/* The pane scrolls here, so it takes focus for keyboard scrolling. */}
            <AppShellContent
              className="overflow-auto"
              tabIndex={0}
              role="region"
              aria-label="Scrolling example"
            >
              <AppShellHeader>
                <MenuIcon className="size-4" />
                <span className="text-sm font-medium">Products</span>
              </AppShellHeader>
              <AppShellMain scrollOwner="container" className="space-y-3 p-6">
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className="bg-card rounded-lg border p-4 text-sm">
                    Product {index + 1}
                  </div>
                ))}
              </AppShellMain>
            </AppShellContent>
          </AppShell>
        </div>
      </Section>
      <Section title="Keep the header one row">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-success-subtle-foreground font-semibold">Do</p>
            <p className="text-muted-foreground mt-2">
              Put the page title and primary action in the page body. Keep the header for
              navigation context and global tools such as search.
            </p>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <p className="text-destructive-subtle-foreground font-semibold">Don&apos;t</p>
            <p className="text-muted-foreground mt-2">
              Give the header its own background, border or height. Its opaque fill follows the
              surface it sits on, and its hairline is built in.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};
