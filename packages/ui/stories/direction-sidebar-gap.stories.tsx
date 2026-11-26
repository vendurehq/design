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
  SidebarRail,
} from '../src/components/atoms/sidebar.tsx';

/**
 * A Sidebar's `side` is logical: `start` is the left edge in a left-to-right page and the right edge in a right-to-left page. The placeholder that keeps its width in the
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

type Side = 'start' | 'end';
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
                    <SidebarMenuButton active>Orders</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Products</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
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
async function expectGapOnSide(canvasElement: HTMLElement, side: Side, dir: Dir) {
  const box = (slot: string) =>
    (canvasElement.querySelector(`[data-slot=${slot}]`) as HTMLElement).getBoundingClientRect();
  const gap = box('sidebar-gap');
  const container = box('sidebar-container');
  const inset = box('sidebar-inset');
  await expect(Math.round(gap.left)).toBe(Math.round(container.left));
  await expect(Math.round(gap.right)).toBe(Math.round(container.right));
  // `start` is the left edge in left-to-right and the right edge in right-to-left.
  const onLeft = (side === 'start') === (dir === 'ltr');
  if (onLeft) await expect(inset.left).toBeGreaterThanOrEqual(Math.round(container.right));
  else await expect(inset.right).toBeLessThanOrEqual(Math.round(container.left));
  // The rail is centred on the edge that faces the content.
  const rail = box('sidebar-rail');
  const edge = onLeft ? container.right : container.left;
  await expect(Math.abs((rail.left + rail.right) / 2 - edge)).toBeLessThanOrEqual(1);
}

function story(dir: Dir, side: Side, variant: 'sidebar' | 'inset'): Story {
  return {
    render: () => <GapLayout dir={dir} side={side} variant={variant} />,
    play: async ({ canvasElement }) => expectGapOnSide(canvasElement, side, dir),
  };
}

export const EndLeftToRight = story('ltr', 'end', 'sidebar');
export const EndLeftToRightInset = story('ltr', 'end', 'inset');
export const EndRightToLeft = story('rtl', 'end', 'sidebar');
export const EndRightToLeftInset = story('rtl', 'end', 'inset');
export const StartLeftToRight = story('ltr', 'start', 'sidebar');
export const StartRightToLeft = story('rtl', 'start', 'inset');
