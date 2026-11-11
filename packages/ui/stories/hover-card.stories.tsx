import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/atoms/hover-card.tsx';
import { CalendarDays } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Atoms/Overlays/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger className="cursor-pointer underline underline-offset-4">
        @vendure
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted font-semibold">
              V
            </div>
            <div>
              <p className="text-sm font-semibold">Vendure</p>
              <p className="text-xs text-muted-foreground">@vendure</p>
            </div>
          </div>
          <p className="text-sm">
            Open-source headless commerce framework built on Node.js with TypeScript.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            Joined December 2019
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

function SideCard({
  label,
  className,
  align,
}: {
  label: string;
  className: string;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        href="#"
        className={`absolute underline underline-offset-4 ${className}`}
      >
        {label}
      </HoverCardTrigger>
      <HoverCardContent align={align}>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-muted-foreground text-xs">Open-source headless commerce framework.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * A hover card opens toward the centre of the screen. A trigger in the right
 * half lines up the card's right edge with its own and the card grows left; a
 * trigger in the left half lines up the left edges. The card scales in from
 * the corner at the trigger. The side is physical, so it is the same in
 * right-to-left. Do not set `align` unless there is a reason: an explicit
 * `align` always wins, and a card that opens to the left or right of its
 * trigger keeps `start`.
 */
export const OpensTowardTheCentre: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    // Logical insets, so the row flips in right-to-left like a page does.
    <div className="relative h-96 w-full">
      <SideCard label="@left-edge" className="start-4 top-4" />
      <SideCard label="@middle" className="start-[calc(50%-4rem)] top-4" />
      <SideCard label="@right-edge" className="end-4 top-4" />
      <SideCard label="@explicit-end" className="start-[calc(50%-12rem)] top-40" align="end" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // `nudge`: an explicit align keeps its 4px offset, inward from the trigger's edge.
    const check = async (label: string, edge: 'left' | 'right', nudge = 0) => {
      const trigger = canvas.getByRole('link', { name: label });
      const findCard = () => {
        const element = document.querySelector<HTMLElement>('[data-slot="hover-card-content"][data-open]');
        expect(element, `${label} opens a card`).not.toBeNull();
        return element as HTMLElement;
      };
      // A hover that lands before the trigger has its listeners is lost, so
      // leave and enter again when no card opens.
      let card: HTMLElement | undefined;
      for (let attempt = 0; attempt < 3 && !card; attempt++) {
        await userEvent.hover(trigger);
        try {
          card = await waitFor(findCard, { timeout: 1500 });
        } catch {
          await userEvent.unhover(trigger);
        }
      }
      card ??= await waitFor(findCard, { timeout: 3000 });
      const shown = card;
      await waitFor(() => {
        const box = shown.getBoundingClientRect();
        const anchor = trigger.getBoundingClientRect();
        // The edge at the trigger lines up with the trigger's edge.
        expect(Math.abs(box[edge] - anchor[edge] - (edge === 'left' ? nudge : -nudge))).toBeLessThan(1);
        // It scales in from that corner.
        const originX = Number.parseFloat(getComputedStyle(shown).transformOrigin);
        expect(Math.abs(originX - (edge === 'left' ? 0 : box.width))).toBeLessThan(2);
      }, { timeout: 3000 });
      await userEvent.unhover(trigger);
      await waitFor(() => expect(document.querySelector('[data-slot="hover-card-content"]')).toBeNull(), { timeout: 3000 });
    };
    // Left half: the left edges line up. Right half: the right edges.
    await check('@left-edge', 'left');
    await check('@middle', 'left');
    await check('@right-edge', 'right');
    // An explicit align wins over the side of the screen: this trigger is in
    // the left half, yet its card lines up on the right.
    await check('@explicit-end', 'right', 4);
    // In a right-to-left page the row flips: the start of the row is on the right.
    const root = document.documentElement;
    const dir = root.getAttribute('dir');
    root.setAttribute('dir', 'rtl');
    try {
      await check('@left-edge', 'right');
      await check('@middle', 'right');
      await check('@right-edge', 'left');
      await check('@explicit-end', 'left', 4);
    } finally {
      if (dir === null) root.removeAttribute('dir');
      else root.setAttribute('dir', dir);
    }
  },
};
