import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea, ScrollBar } from '../src/components/ui/scroll-area.tsx';

const meta = {
  title: 'UI/General/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }).map((_, i) => `v1.2.0-beta.${i + 1}`);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag} className="text-sm py-1">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

const works = Array.from({ length: 20 }).map((_, i) => ({
  artist: `Artist ${i + 1}`,
  art: `Artwork ${i + 1}`,
}));

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {works.map((work) => (
          <figure key={work.art} className="shrink-0">
            <div className="overflow-hidden rounded-md">
              <div className="h-[150px] w-[200px] bg-muted flex items-center justify-center">
                <span className="text-sm text-muted-foreground">{work.art}</span>
              </div>
            </div>
            <figcaption className="pt-2 text-xs text-muted-foreground">
              Photo by{' '}
              <span className="font-semibold text-foreground">{work.artist}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  ),
};
