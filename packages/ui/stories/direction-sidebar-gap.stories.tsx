import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../src/components/atoms/sidebar.tsx';

/**
 * A Sidebar's `side` is physical. The placeholder that keeps its width in the
 * layout (`sidebar-gap`) sits on the same side as the sidebar, whatever the
 * page direction and wherever the Sidebar sits in the markup. The content pane
 * then starts where the sidebar ends.
 */
const meta = {
  title: 'Atoms/Layout/Direction sidebar gap',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Side = 'left' | 'right';
type Dir = 'ltr' | 'rtl';

function GapLayout({ dir, side, variant }: { dir: Dir; side: Side; variant: 'sidebar' | 'inset' }) {
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir}>
        <SidebarProvider>
          <Sidebar side={side} variant={variant}>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>Orders</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Products</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="p-5 text-sm">
              {dir === 'rtl' ? 'אזור התוכן הראשי' : 'Main content area'} · side={side} · {variant}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </DirectionProvider>
  );
}

/** The gap and the fixed sidebar cover the same columns, and the pane does not overlap them. */
async function expectGapOnSide(canvasElement: HTMLElement, side: Side) {
  const box = (slot: string) =>
    (canvasElement.querySelector(`[data-slot=${slot}]`) as HTMLElement).getBoundingClientRect();
  const gap = box('sidebar-gap');
  const container = box('sidebar-container');
  const inset = box('sidebar-inset');
  await expect(Math.round(gap.left)).toBe(Math.round(container.left));
  await expect(Math.round(gap.right)).toBe(Math.round(container.right));
  if (side === 'left') await expect(inset.left).toBeGreaterThanOrEqual(Math.round(container.right));
  else await expect(inset.right).toBeLessThanOrEqual(Math.round(container.left));
}

function story(dir: Dir, side: Side, variant: 'sidebar' | 'inset'): Story {
  return {
    render: () => <GapLayout dir={dir} side={side} variant={variant} />,
    play: async ({ canvasElement }) => expectGapOnSide(canvasElement, side),
  };
}

export const RightLeftToRight = story('ltr', 'right', 'sidebar');
export const RightLeftToRightInset = story('ltr', 'right', 'inset');
export const LeftRightToLeft = story('rtl', 'left', 'sidebar');
export const LeftRightToLeftInset = story('rtl', 'left', 'inset');
export const LeftLeftToRight = story('ltr', 'left', 'sidebar');
export const RightRightToLeft = story('rtl', 'right', 'inset');
