import type { Meta, StoryObj } from '@storybook/react';
import { flushSync } from 'react-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { expect, waitFor } from 'storybook/test';
import { ElapsedTime } from '../src/components/molecules/elapsed-time.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';

const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const meta = {
  title: 'Molecules/RelativeTime',
  component: RelativeTime,
  tags: ['autodocs'],
  args: {
    value: minutesAgo(3),
    locale: 'en-US',
  },
} satisfies Meta<typeof RelativeTime>;

export default meta;
type Story = StoryObj<typeof meta>;

// Self-refreshes every `updateInterval` ms (default 60_000) so a long-open view
// ages on its own. Hover any value for the absolute time in the DS Tooltip; it
// is also the accessible description.
export const Playground: Story = {};

export const PastAndFuture: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <RelativeTime value={minutesAgo(0.2)} locale="en-US" />
      <RelativeTime value={minutesAgo(3)} locale="en-US" />
      <RelativeTime value={minutesAgo(90)} locale="en-US" />
      <RelativeTime value={minutesAgo(60 * 26)} locale="en-US" />
      <RelativeTime value={daysFromNow(3)} locale="en-US" />
    </div>
  ),
};

// `unitStyle="narrow"` for dense tables; `numeric="always"` forces a quantified
// phrase instead of "yesterday"/"tomorrow".
export const Styles: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <RelativeTime value={minutesAgo(60 * 26)} locale="en-US" unitStyle="narrow" />
      <RelativeTime value={minutesAgo(60 * 24)} locale="en-US" numeric="always" />
    </div>
  ),
};

// `display="duration"` says how long a state that continues has lasted, with
// the same unit steps as the relative text. The words around it are the
// caller's. `start` turns the default tooltip into the range and how long it
// took. `tooltip` also takes content of your own.
export const DurationAndRange: Story = {
  render: () => (
    <div className="flex flex-col gap-1 tabular-nums">
      <span>
        Degraded for <RelativeTime value={minutesAgo(60 * 24 * 13)} locale="en-US" display="duration" />
      </span>
      <span>
        Ready <RelativeTime value={minutesAgo(2)} start={minutesAgo(2.7)} locale="en-US" focusable />
      </span>
      <span>
        Paused <RelativeTime value={minutesAgo(40)} locale="en-US" tooltip="Paused by the nightly job" focusable />
      </span>
    </div>
  ),
};

// Pass `updateInterval={false}` when something else already re-renders (e.g. a
// polling query) so the component stays render-driven.
export const RenderDriven: Story = {
  args: { value: minutesAgo(5), updateInterval: false },
};

// Nullish/invalid input renders the fallback (default em dash).
export const Fallback: Story = {
  render: () => <RelativeTime value={null} />,
};

/**
 * `focusable` makes the time a tab stop, so keyboard users can open the
 * tooltip. Opt in where the exact time matters to keyboard users, never inside
 * a link or a button.
 */
export const Focusable: Story = {
  args: { focusable: true },
};

/**
 * `tooltip={false}` renders a plain `<time>` for a time inside another tooltip
 * trigger, so the outer tooltip keeps its content. The absolute time stays the
 * accessible description.
 */
export const WithoutTooltip: Story = {
  args: { tooltip: false },
};

// Fixed instants for the server-and-browser story, taken once at load.
const NOW = Date.now();
const STARTED = NOW - 2 * 60_000 - 42_000;
const FINISHED = NOW - 2 * 60_000;

function Times({ locale }: { locale: string }) {
  return (
    <FormatProvider locale={locale}>
      <div className="flex flex-col gap-1 tabular-nums">
        <RelativeTime data-testid="relative" value={FINISHED} />
        <RelativeTime data-testid="duration" value={NOW - 13 * 86_400_000} display="duration" />
        <RelativeTime data-testid="range" value={FINISHED} start={STARTED} />
        <RelativeTime data-testid="custom" value={FINISHED} tooltip="Deployed by Ana" />
        <ElapsedTime data-testid="fixed" since={STARTED} until={FINISHED} />
        <ElapsedTime
          data-testid="format"
          since={STARTED}
          until={STARTED + 5_000}
          format={(ms) => `${ms / 1000} sec`}
        />
        <ElapsedTime data-testid="started" since={STARTED} tooltip />
        <ElapsedTime data-testid="elapsed-range" since={STARTED} until={FINISHED} tooltip />
        <ElapsedTime data-testid="elapsed-custom" since={STARTED} until={FINISHED} tooltip="Queued by CI" />
        <ElapsedTime data-testid="arabic" since={STARTED} until={FINISHED} locale="ar-EG" />
      </div>
    </FormatProvider>
  );
}

// The visible text of a time, without its hidden description.
function textOf(root: ParentNode, id: string): string {
  return (root.querySelector(`[data-testid=${id}]`) as HTMLElement).innerText;
}

// The hidden description a time links with aria-describedby.
function descriptionOf(root: ParentNode, id: string): string {
  const time = root.querySelector(`[data-testid=${id}]`) as HTMLElement;
  const ids = (time.getAttribute('aria-describedby') ?? '').split(' ');
  return document.getElementById(ids[ids.length - 1] as string)?.textContent ?? '';
}

/**
 * The text of a time depends on the reader's clock, locale and time zone. The
 * server renders the fallback, and so does the first client render during
 * hydration, so they match. A page that renders only in the browser shows the
 * text from its first paint, with no fallback before it.
 */
export const ServerAndBrowser: Story = {
  render: () => <Times locale="en-US" />,
  play: async ({ canvasElement, step }) => {
    await step('a browser-only render shows the text in its first commit', async () => {
      const host = document.createElement('div');
      canvasElement.append(host);
      const root = createRoot(host);
      flushSync(() => root.render(<Times locale="en-US" />));
      // Read in the same task as the commit, before any effect or repaint.
      await expect(textOf(host, 'relative')).toBe('2 minutes ago');
      await expect(textOf(host, 'fixed')).toBe('42s');
      root.unmount();
      host.remove();
    });

    await step('every time renders its text and description in the browser', async () => {
      await expect(textOf(canvasElement, 'duration')).toBe('13 days');
      await expect(descriptionOf(canvasElement, 'relative')).toContain(
        String(new Date(FINISHED).getFullYear()),
      );
      await expect(descriptionOf(canvasElement, 'range')).toContain('–');
      await expect(descriptionOf(canvasElement, 'range')).toContain('42s');
      await expect(descriptionOf(canvasElement, 'custom')).toBe('Deployed by Ana');
      await expect(textOf(canvasElement, 'fixed')).toBe('42s');
      await expect(textOf(canvasElement, 'format')).toBe('5 sec');
      await expect(descriptionOf(canvasElement, 'started')).toContain(
        String(new Date(STARTED).getFullYear()),
      );
      await expect(descriptionOf(canvasElement, 'elapsed-range')).toContain('–');
      await expect(descriptionOf(canvasElement, 'elapsed-custom')).toBe('Queued by CI');
      // ICU data differs between browsers ("٤٢ث", "٤٢ ث"): check the digits.
      await expect(textOf(canvasElement, 'arabic')).toContain('٤٢');
    });

    await step('hydrating with another clock and locale raises no warning', async () => {
      // The server: English, three hours earlier.
      const realNow = Date.now;
      Date.now = () => realNow() - 3 * 3_600_000;
      const html = renderToString(<Times locale="en-US" />);
      Date.now = realNow;
      await expect(html).not.toContain('ago');

      const host = document.createElement('div');
      host.innerHTML = html;
      canvasElement.append(host);
      const errors: string[] = [];
      const consoleError = console.error;
      console.error = (...args: unknown[]) => {
        errors.push(args.map(String).join(' '));
        consoleError(...args);
      };
      try {
        // The browser: German, the real clock.
        const root = hydrateRoot(host, <Times locale="de-DE" />, {
          onRecoverableError: (error) => errors.push(String(error)),
        });
        await waitFor(() => expect(textOf(host, 'relative')).toBe('vor 2 Minuten'));
        await expect(errors).toEqual([]);
        root.unmount();
      } finally {
        console.error = consoleError;
        host.remove();
      }
    });
  },
};
