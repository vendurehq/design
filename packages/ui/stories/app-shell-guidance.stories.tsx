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
          and one focusable scrolling main region. Apps fill those slots with their own router
          links, organization switcher, user menu, and route outlet.
        </p>
        <div className="h-80 overflow-hidden rounded-xl border">
          <SkipLink href="#guidance-main" />
          <AppShell className="min-h-0">
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
              scroll, and responsive rules intact.
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
