import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../src/components/ui/hover-card.tsx';
import { CalendarDays } from 'lucide-react';

const meta = {
  title: 'UI/Overlays/HoverCard',
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
