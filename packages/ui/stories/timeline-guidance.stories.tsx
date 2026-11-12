import type { Meta, StoryObj } from '@storybook/react';
import { CreditCard, Package, Truck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '../src/components/atoms/card.tsx';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';
import {
  Timeline,
  TimelineContent,
  TimelineDetail,
  TimelineItem,
  TimelineMarker,
  TimelineMeta,
  TimelineTitle,
} from '../src/components/molecules/timeline.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

/**
 * Guidance, not props. When a feed of events belongs in a Timeline rather
 * than a ListRow, when an entry takes a tone, and what goes in each slot. For
 * the component API, see the Timeline stories.
 */
const meta = {
  title: 'Molecules/Timeline/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives ───────────────────────────────────────────────────────

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

function FeedCard({ children }: { children: ReactNode }) {
  return <Card className="gap-0 px-4.5 py-3.5">{children}</Card>;
}

const NOW = Date.now();
const minutesAgo = (m: number) => new Date(NOW - m * 60_000);

function Feed({ entries }: { entries: { text: string; tone: Tone; at: number; icon?: ReactNode; detail?: ReactNode; who?: string }[] }) {
  return (
    <Timeline>
      {entries.map((e) => (
        <TimelineItem key={e.text}>
          <TimelineMarker tone={e.tone}>{e.icon}</TimelineMarker>
          <TimelineContent>
            <TimelineTitle>{e.text}</TimelineTitle>
            <TimelineMeta>
              <RelativeTime value={minutesAgo(e.at)} locale="en-US" />
              {e.who ? ` · ${e.who}` : null}
            </TimelineMeta>
            {e.detail ? <TimelineDetail>{e.detail}</TimelineDetail> : null}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'Timeline',
    use: 'What happened to one thing, newest first: the crashes and restarts of a server, the history of an order or a customer. Each entry is an event; the user reads the feed, and opens an entry only now and then.',
  },
  {
    tool: 'ListRow',
    use: 'A short list of entities the user opens: deployments, backups, recent orders. Each row is a thing with its own page, not an event.',
  },
  {
    tool: 'DataTable',
    use: 'A full log the user filters, sorts or pages through, such as an audit log with hundreds of entries.',
  },
];

const SLOTS: { slot: string; holds: string }[] = [
  { slot: 'TimelineMarker', holds: 'The tone of the entry as an 8px dot, or an icon that names the kind of entry. A live indicator can take the place of the dot.' },
  { slot: 'TimelineTitle / TimelineLink', holds: 'One sentence of what happened. TimelineLink when the entry opens a page; it covers the whole entry.' },
  { slot: 'TimelineMeta', holds: 'A RelativeTime and, when it matters, who did it: "5 min ago · Mara Lindqvist".' },
  { slot: 'TimelineDetail', holds: 'Optional content under the meta line: a note, an amount, a state change, a button.' },
  { slot: 'TimelineGroupHeading', holds: 'A day ("Today", "Yesterday") before that day\'s own Timeline.' },
  { slot: 'enter (on TimelineItem)', holds: '"new" for an entry that arrives while the page is open. Never on the entries of the first render.' },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · Timeline vs ListRow vs DataTable',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Events to read, entities to open"
        intro="A Timeline tells what happened to one thing. When each line is a thing the user opens, use a ListRow."
      >
        <div className="mb-6 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Tool</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {CHOICES.map(({ tool, use }) => (
                <tr key={tool} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{tool}</td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Example verdict="do" caption="Server events read as a feed of sentences on one rail.">
            <FeedCard>
              <Feed
                entries={[
                  { text: 'The server restarted after a crash.', tone: 'warning', at: 4 },
                  { text: 'Deployment 9f3c2a1 went live.', tone: 'success', at: 95 },
                ]}
              />
            </FeedCard>
          </Example>
          <Example verdict="dont" caption="Deployments are things with their own page: list them as rows, not as events.">
            <FeedCard>
              <Feed
                entries={[
                  { text: 'Add Klarna payment handler to checkout', tone: 'neutral', at: 42 },
                  { text: 'Bump @vendure/core to 3.6.2', tone: 'neutral', at: 1500 },
                ]}
              />
            </FeedCard>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · tone ─────────────────────────────────────────────────────────────────

export const QuietNormal: Story = {
  name: '2 · Quiet normal, loud abnormal',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Tone marks a consequence"
        intro="Most entries stay neutral. A tone marks an entry the user must notice. When a banner on the page already names the problem, the entries under it go neutral, so the banner stays the one loud thing."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Example verdict="do" caption="Only the restart and the failure take a tone.">
            <FeedCard>
              <Feed
                entries={[
                  { text: 'The worker failed to start.', tone: 'critical', at: 6 },
                  { text: 'The server restarted after a crash.', tone: 'warning', at: 18 },
                  { text: 'The server went to sleep.', tone: 'neutral', at: 220 },
                ]}
              />
            </FeedCard>
          </Example>
          <Example verdict="dont" caption="A tone on every routine entry: nothing stands out any more.">
            <FeedCard>
              <Feed
                entries={[
                  { text: 'The server started.', tone: 'success', at: 6 },
                  { text: 'A request took 2 s.', tone: 'info', at: 18 },
                  { text: 'The server went to sleep.', tone: 'progress', at: 220 },
                ]}
              />
            </FeedCard>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · slots ────────────────────────────────────────────────────────────────

export const Slots: Story = {
  name: '3 · What goes in each slot',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A sentence, then the time, then the detail"
        intro="The sentence says what happened. The meta line says when and who. Anything else goes in the detail, never in the sentence."
      >
        <div className="mb-6 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Slot</th>
                <th className="p-3 font-medium">Holds</th>
              </tr>
            </thead>
            <tbody>
              {SLOTS.map(({ slot, holds }) => (
                <tr key={slot} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{slot}</td>
                  <td className="text-muted-foreground p-3 text-xs">{holds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Example verdict="do" caption="Icons name the main kinds of entry; the minor state change keeps the dot.">
            <FeedCard>
              <Feed
                entries={[
                  { text: 'Order shipped', tone: 'success', at: 12, icon: <Truck />, who: 'Mara Lindqvist', detail: 'DHL Express · tracking 4471 0263 8810' },
                  { text: 'Order state changed to Picking', tone: 'neutral', at: 140, who: 'System' },
                  { text: 'Payment settled', tone: 'info', at: 141, icon: <CreditCard />, who: 'Stripe' },
                  { text: 'Order placed', tone: 'neutral', at: 310, icon: <Package />, who: 'Hayden Zieme' },
                ]}
              />
            </FeedCard>
          </Example>
          <Example verdict="dont" caption="The time and the actor inside the sentence: the feed no longer scans.">
            <FeedCard>
              <Timeline>
                <TimelineItem>
                  <TimelineMarker tone="success" />
                  <TimelineContent>
                    <TimelineTitle>
                      Mara Lindqvist shipped the order with DHL Express (tracking 4471 0263 8810) 12 minutes ago.
                    </TimelineTitle>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </FeedCard>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
