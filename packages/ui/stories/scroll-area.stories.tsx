import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import { ScrollArea, ScrollBar } from '../src/components/atoms/scroll-area.tsx';
import { useScrolled } from '../src/hooks/use-scrolled.ts';

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

const logLines = Array.from({ length: 40 }, (_, i) => ({
  time: `12:04:${String(i).padStart(2, '0')}`,
  message: i % 9 === 4 ? 'Worker job finished in 212ms' : 'GET /shop-api 200 18ms',
}));

function ScrolledHeaderLog() {
  const scrolled = useScrolled<HTMLDivElement>();
  return (
    <div
      ref={scrolled}
      data-testid="scrolled-log"
      className="bg-card h-72 w-96 overflow-y-auto rounded-xl border text-xs"
    >
      <div className="bg-card text-muted-foreground in-data-scrolled:shadow-scrolled sticky top-0 z-10 flex gap-6 px-4 py-2 font-medium">
        <span className="w-16">Time</span>
        <span>Message</span>
      </div>
      {logLines.map((line) => (
        <div key={line.time} className="flex gap-6 px-4 py-0.5 font-mono">
          <span className="text-muted-foreground w-16">{line.time}</span>
          <span>{line.message}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * A scroll area of your own with a sticky header. `useScrolled` sets
 * `data-scrolled` on the container while rows sit under the header, and the
 * header takes `in-data-scrolled:shadow-scrolled`: a 1px rule in the `input`
 * colour. At the top the header has no rule. Scroll the log to see it.
 */
export const ScrolledHeader: Story = {
  render: () => <ScrolledHeaderLog />,
  play: async ({ canvasElement }) => {
    const log = canvasElement.querySelector<HTMLElement>('[data-testid="scrolled-log"]');
    if (!log) throw new Error('log not rendered');
    const header = log.firstElementChild as HTMLElement;
    await expect(log).not.toHaveAttribute('data-scrolled');
    await expect(getComputedStyle(header).boxShadow).toBe('none');
    log.scrollTop = 40;
    await waitFor(() => expect(log).toHaveAttribute('data-scrolled'));
    await expect(getComputedStyle(header).boxShadow).not.toBe('none');
    log.scrollTop = 0;
    await waitFor(() => expect(log).not.toHaveAttribute('data-scrolled'));
  },
};
