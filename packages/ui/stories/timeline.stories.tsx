import type { Meta, StoryObj } from '@storybook/react';
import { CircleCheck, CreditCard, MessageSquare, Package, RotateCcw, Truck } from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { Money } from '../src/components/molecules/money.tsx';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';
import {
  Timeline,
  TimelineContent,
  TimelineDetail,
  TimelineGroupHeading,
  TimelineItem,
  TimelineLink,
  TimelineMarker,
  TimelineMeta,
  TimelineTitle,
} from '../src/components/molecules/timeline.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const NOW = Date.now();
const minutesAgo = (m: number) => new Date(NOW - m * 60_000);

// The feed sits in a card panel, under the same rule and inset as the rows of
// a ListRow card: 18px in from the start, 16px from the end.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="max-w-md gap-0 py-0">
      <CardHeader className="py-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="border-t border-border ps-4.5 pe-4 pt-3.25 pb-3.5">{children}</div>
    </Card>
  );
}

const EVENTS: { id: string; message: string; tone: Tone; at: number }[] = [
  { id: 'e1', message: 'The server restarted after a crash.', tone: 'warning', at: 4 },
  { id: 'e2', message: 'The worker failed to start: the database refused the connection.', tone: 'critical', at: 38 },
  { id: 'e3', message: 'Deployment 9f3c2a1 went live.', tone: 'success', at: 95 },
  { id: 'e4', message: 'The server went to sleep after 30 minutes without requests.', tone: 'neutral', at: 220 },
];

// A plain feed, newest first: a tone dot, a sentence and a time per entry.
// The rail runs between the dots.
export const Default: Story = {
  render: () => (
    <Panel title="Activity">
      <Timeline>
        {EVENTS.map((e) => (
          <TimelineItem key={e.id}>
            <TimelineMarker tone={e.tone} />
            <TimelineContent>
              <TimelineTitle>{e.message}</TimelineTitle>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(e.at)} locale="en-US" />
              </TimelineMeta>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Panel>
  ),
  play: async ({ canvasElement }) => {
    const items = [...canvasElement.querySelectorAll<HTMLElement>('[data-slot=timeline-item]')];
    await expect(items).toHaveLength(EVENTS.length);
    // The rail runs under every entry but the last.
    await expect(getComputedStyle(items[0] as HTMLElement, '::after').width).toBe('1px');
    await expect(getComputedStyle(items.at(-1) as HTMLElement, '::after').content).toBe('none');
    const dot = canvasElement.querySelector<HTMLElement>('[data-slot=timeline-marker]') as HTMLElement;
    await expect(dot.getBoundingClientRect().width).toBe(8);
  },
};

const TONES: Tone[] = ['neutral', 'info', 'success', 'warning', 'critical', 'progress'];

// Every tone of the state dictionary, as StatusBadge draws its dot. Quiet
// normal, loud abnormal: most entries stay neutral.
export const Tones: Story = {
  render: () => (
    <Panel title="Tones">
      <Timeline>
        {TONES.map((tone, i) => (
          <TimelineItem key={tone}>
            <TimelineMarker tone={tone} />
            <TimelineContent>
              <TimelineTitle>
                A <code className="font-mono">{tone}</code> entry.
              </TimelineTitle>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(i * 12 + 1)} locale="en-US" />
              </TimelineMeta>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Panel>
  ),
};

const ORDER_HISTORY: {
  id: string;
  icon?: ReactNode;
  tone: Tone;
  title: string;
  actor: string;
  at: number;
  detail?: ReactNode;
}[] = [
  {
    id: 'h1',
    icon: <Truck />,
    tone: 'success',
    title: 'Order shipped',
    actor: 'Mara Lindqvist',
    at: 12,
    detail: 'DHL Express · tracking 4471 0263 8810',
  },
  {
    id: 'h2',
    icon: <MessageSquare />,
    tone: 'neutral',
    title: 'Note added',
    actor: 'Tobias Okafor',
    at: 80,
    detail: (
      <p className="rounded-lg bg-muted px-3 py-2">
        The customer asked us to leave the parcel with the neighbour at number 14.
      </p>
    ),
  },
  { id: 'h3', tone: 'neutral', title: 'Order state changed from Payment settled to Picking', actor: 'System', at: 140 },
  {
    id: 'h4',
    icon: <CreditCard />,
    tone: 'info',
    title: 'Payment settled',
    actor: 'Stripe',
    at: 141,
    detail: <Money value={12_850} currency="EUR" locale="en-GB" />,
  },
  { id: 'h5', icon: <RotateCcw />, tone: 'warning', title: 'Refund of one item requested', actor: 'Hayden Zieme', at: 300 },
  { id: 'h6', icon: <Package />, tone: 'neutral', title: 'Order placed', actor: 'Hayden Zieme', at: 310 },
];

// An icon takes the place of the dot, in the tone colour: it names the kind
// of entry. Entries without an icon keep the dot, so minor entries stay quiet
// beside the main ones. The meta line holds the time and who did it.
export const Icons: Story = {
  render: () => (
    <Panel title="History">
      <Timeline>
        {ORDER_HISTORY.map((h) => (
          <TimelineItem key={h.id}>
            <TimelineMarker tone={h.tone}>{h.icon}</TimelineMarker>
            <TimelineContent>
              <TimelineTitle>{h.title}</TimelineTitle>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(h.at)} locale="en-US" /> · {h.actor}
              </TimelineMeta>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Panel>
  ),
};

// TimelineDetail holds content under the meta line: a note, an amount, the
// carrier. This is the shape of an order history.
export const WithDetail: Story = {
  render: () => (
    <Panel title="History">
      <Timeline>
        {ORDER_HISTORY.map((h) => (
          <TimelineItem key={h.id}>
            <TimelineMarker tone={h.tone}>{h.icon}</TimelineMarker>
            <TimelineContent>
              <TimelineTitle className={h.icon ? 'font-medium' : undefined}>{h.title}</TimelineTitle>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(h.at)} locale="en-US" /> · {h.actor}
              </TimelineMeta>
              {h.detail ? <TimelineDetail>{h.detail}</TimelineDetail> : null}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Panel>
  ),
};

const DAYS: { day: string; events: { id: string; message: string; tone: Tone; at: number }[] }[] = [
  {
    day: 'Today',
    events: [
      { id: 'g1', message: 'The server restarted after a crash.', tone: 'warning', at: 4 },
      { id: 'g2', message: 'Deployment 9f3c2a1 went live.', tone: 'success', at: 95 },
    ],
  },
  {
    day: 'Yesterday',
    events: [
      { id: 'g3', message: 'The worker failed to start.', tone: 'critical', at: 60 * 26 },
      { id: 'g4', message: 'The worker started again after the database came back.', tone: 'neutral', at: 60 * 27 },
      { id: 'g5', message: 'Deployment e27f9a3 went live.', tone: 'success', at: 60 * 30 },
    ],
  },
];

// A TimelineGroupHeading starts each day, before the Timeline of its group.
// The rail breaks at the heading.
export const GroupedByDay: Story = {
  render: () => (
    <Panel title="Activity">
      {DAYS.map(({ day, events }) => (
        <Fragment key={day}>
          <TimelineGroupHeading>{day}</TimelineGroupHeading>
          <Timeline>
            {events.map((e) => (
              <TimelineItem key={e.id}>
                <TimelineMarker tone={e.tone} />
                <TimelineContent>
                  <TimelineTitle>{e.message}</TimelineTitle>
                  <TimelineMeta>
                    <RelativeTime value={minutesAgo(e.at)} locale="en-US" />
                  </TimelineMeta>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Fragment>
      ))}
    </Panel>
  ),
};

// An entry that opens a page: TimelineLink is the sentence and covers the
// whole entry, so a click on any point of it opens the link. A button in the
// detail keeps its own click.
const openDeployment = fn();
const redeploy = fn();

export const AsLink: Story = {
  beforeEach: () => {
    openDeployment.mockClear();
    redeploy.mockClear();
  },
  render: () => {
    return (
      <Panel title="Activity">
        <Timeline>
          <TimelineItem>
            <TimelineMarker tone="critical" />
            <TimelineContent>
              <TimelineLink onClick={openDeployment}>Deployment b3d71e6 failed to build.</TimelineLink>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(3)} locale="en-US" />
              </TimelineMeta>
              <TimelineDetail>
                <Button variant="outline" size="sm" onClick={redeploy}>
                  Redeploy
                </Button>
              </TimelineDetail>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineMarker tone="success" />
            <TimelineContent>
              <TimelineLink render={<a href="#deployment-9f3c2a1" />}>Deployment 9f3c2a1 went live.</TimelineLink>
              <TimelineMeta>
                <RelativeTime value={minutesAgo(95)} locale="en-US" />
              </TimelineMeta>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Panel>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // A click on the empty end of the meta line, outside the sentence, hits
    // the link: it covers the whole entry.
    const meta = canvasElement.querySelector('[data-slot=timeline-meta]') as HTMLElement;
    const rect = meta.getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(rect.right - 4, rect.top + rect.height / 2);
    await expect(hit).toBe(canvas.getByRole('button', { name: 'Deployment b3d71e6 failed to build.' }));
    await userEvent.click(hit as HTMLElement);
    await expect(openDeployment).toHaveBeenCalledTimes(1);
    // The button in the detail keeps its own click.
    await userEvent.click(canvas.getByRole('button', { name: 'Redeploy' }));
    await expect(redeploy).toHaveBeenCalledTimes(1);
    await expect(openDeployment).toHaveBeenCalledTimes(1);
  },
};

// A new entry enters like a new ListRow: its height opens, then its content
// fades in. The entries of the first render do not animate.
function NewEntryDemo() {
  const [events, setEvents] = useState(EVENTS.slice(1));
  const [added, setAdded] = useState(0);
  return (
    <div className="flex max-w-md flex-col gap-3">
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          setAdded(added + 1);
          setEvents([{ id: `new-${added}`, message: 'The server restarted after a crash.', tone: 'warning', at: 0 }, ...events]);
        }}
      >
        Add an entry
      </Button>
      <Panel title="Activity">
        <Timeline>
          {events.map((e) => (
            <TimelineItem key={e.id} enter={e.id.startsWith('new') ? 'new' : undefined}>
              <TimelineMarker tone={e.tone} />
              <TimelineContent>
                <TimelineTitle>{e.message}</TimelineTitle>
                <TimelineMeta>
                  <RelativeTime value={minutesAgo(e.at)} locale="en-US" />
                </TimelineMeta>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Panel>
    </div>
  );
}

export const NewEntry: Story = {
  render: () => <NewEntryDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = () => [...canvasElement.querySelectorAll<HTMLElement>('[data-slot=timeline-item]')];
    await expect(items().some((item) => item.dataset.enter)).toBe(false);
    await userEvent.click(canvas.getByRole('button', { name: 'Add an entry' }));
    await expect(items()[0]?.dataset.enter).toBe('new');
  },
};

// Right to left: the rail and the markers move to the start edge, which is
// the right.
export const RightToLeft: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Panel title="النشاط">
          <Timeline>
            <TimelineItem>
              <TimelineMarker tone="warning" />
              <TimelineContent>
                <TimelineTitle>أُعيد تشغيل الخادم بعد تعطّله.</TimelineTitle>
                <TimelineMeta>
                  <RelativeTime value={minutesAgo(4)} locale="ar" />
                </TimelineMeta>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineMarker tone="success">
                <CircleCheck />
              </TimelineMarker>
              <TimelineContent>
                <TimelineTitle>أصبح النشر 9f3c2a1 مباشرًا.</TimelineTitle>
                <TimelineMeta>
                  <RelativeTime value={minutesAgo(95)} locale="ar" />
                </TimelineMeta>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineMarker tone="neutral" />
              <TimelineContent>
                <TimelineTitle>دخل الخادم في وضع السكون.</TimelineTitle>
                <TimelineMeta>
                  <RelativeTime value={minutesAgo(220)} locale="ar" />
                </TimelineMeta>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Panel>
      </div>
    </DirectionProvider>
  ),
};
