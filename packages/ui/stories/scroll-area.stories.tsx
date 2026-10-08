import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { ScrollArea, ScrollBar } from '../src/components/atoms/scroll-area.tsx';

const meta = {
  title: 'Atoms/General/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Overlay-style scrollbars: invisible at rest, fading in while you hover the scroll area or actively scroll. Hover either story below to reveal the scrollbar.',
      },
    },
  },
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
 * Tab into a scroll area to see its 2px focus ring in light and dark. Pinned to
 * the light page theme.
 */
export const FocusRing: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <ScrollArea className="h-32 rounded-md border" aria-label={`Release notes, ${theme}`}>
          <div className="flex flex-col gap-2 p-4 text-sm">
            {Array.from({ length: 12 }, (_, index) => (
              <p key={index}>Release note {index + 1}</p>
            ))}
          </div>
        </ScrollArea>
      )}
    </LightAndDark>
  ),
};
