import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { DateTime } from '../src/components/molecules/date-time.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
import { RelativeTime } from '../src/components/molecules/relative-time.tsx';

/**
 * Guidance, not props. The one page for the relative-vs-absolute decision: when
 * a timestamp should read "2 hours ago" (RelativeTime) and when it must read as
 * a fixed instant (DateTime), plus the rule that locale and time zone always
 * come from FormatProvider, never a hand-formatted string. RelativeTime has no
 * separate guidance page; it is ruled on here.
 */
const meta = {
  title: 'Molecules/DateTime/Guidance',
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
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

// A record-keeping instant, deliberately months in the past so the "don't"
// examples render a stale relative phrase that proves the point.
const PLACED_AT = '2026-03-14T15:09:26.000Z';
const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

const DECISION: { surface: string; use: 'RelativeTime' | 'DateTime'; why: string }[] = [
  {
    surface: 'Order history / activity feed line',
    use: 'RelativeTime',
    why: 'Recency is the message. "8 minutes ago" is scanned faster than a full timestamp.',
  },
  {
    surface: '"Last updated" / "Last seen" labels',
    use: 'RelativeTime',
    why: 'The reader wants freshness, not the exact instant.',
  },
  {
    surface: 'Live job / import status while a view stays open',
    use: 'RelativeTime',
    why: 'It self-refreshes on its own timer, so the age keeps ticking without a re-fetch.',
  },
  {
    surface: 'Order / invoice placed-at, paid-at',
    use: 'DateTime',
    why: 'A record-keeping fact that must read identically today and in an audit next year.',
  },
  {
    surface: 'Payment, refund, fulfillment timestamps',
    use: 'DateTime',
    why: 'Financial events are reconciled against exact dates, never "a while ago".',
  },
  {
    surface: 'Scheduled promotion start / end, export ranges',
    use: 'DateTime',
    why: 'A precise instant a human sets and verifies; approximation would be wrong.',
  },
  {
    surface: 'Audit log entries',
    use: 'DateTime',
    why: 'Forensic reads demand the absolute instant, never a relative phrase.',
  },
];

const RULES: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'Recency-dominated surfaces get relative; record-keeping gets absolute',
    body: 'If the reader is asking "how fresh is this?", reach for RelativeTime. If they are asking "on exactly what date did this happen?" (an order, an invoice, an audit row), reach for DateTime. When in doubt about a financial or legal record, it is absolute.',
  },
  {
    n: 2,
    title: 'Never hand-format a date',
    body: 'No toLocaleString, no template strings, no dayjs sprinkled at the call site. DateTime and RelativeTime own the semantic <time> element and its machine-readable ISO dateTime attribute; a raw string throws both away and drifts with the browser.',
  },
  {
    n: 3,
    title: 'Locale and time zone come from FormatProvider',
    body: "Mount FormatProvider once from the app's locale and server config; every DateTime and Money below it renders consistently with no prop threading. The resolution order is fixed: explicit prop → provider context → the runtime default. Pass locale/timeZone per call only for a genuine one-off.",
  },
  {
    n: 4,
    title: 'Relative already carries the absolute',
    body: 'RelativeTime puts the exact instant in the hover title, so you seldom need both on screen. Reach for a paired absolute rendering only when the surface is a record that must show its precise date even without a hover.',
  },
  {
    n: 5,
    title: 'Pin locale and time zone under SSR',
    body: 'Both molecules format against the runtime locale/zone, so a server render and the first client render can disagree. SSR consumers pin both via FormatProvider (or props) so hydration matches.',
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const RelativeOrAbsolute: Story = {
  name: '1 · Relative or absolute?',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Recency reads relative; records read absolute"
        intro="This is the whole decision. A surface where the reader is scanning for freshness (an activity feed, a 'last updated' label) wants RelativeTime. A surface that is a record of fact (an order, an invoice, an audit entry) wants DateTime, so it reads the same on the day it happened and in a reconciliation a year later."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Order activity feed: RelativeTime. Each line's age is legible at a glance and keeps ticking as the view stays open."
          >
            <div className="flex flex-col gap-1 text-sm">
              <span>
                Payment settled · <RelativeTime value={minutesAgo(8)} locale="en-US" />
              </span>
              <span>
                Fulfillment created · <RelativeTime value={minutesAgo(42)} locale="en-US" />
              </span>
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="Absolute timestamps in a feed force the reader to subtract from 'now' on every row to judge recency."
          >
            <div className="flex flex-col gap-1 text-sm">
              <span>
                Payment settled ·{' '}
                <DateTime
                  value={minutesAgo(8)}
                  locale="en-US"
                  dateStyle="medium"
                  timeStyle="short"
                />
              </span>
              <span>
                Fulfillment created ·{' '}
                <DateTime
                  value={minutesAgo(42)}
                  locale="en-US"
                  dateStyle="medium"
                  timeStyle="short"
                />
              </span>
            </div>
          </Example>
          <Example
            verdict="do"
            caption="Order detail 'Placed': DateTime. A record-keeping fact, fixed and reconcilable."
          >
            <span className="text-sm">
              Order #10318 placed ·{' '}
              <DateTime value={PLACED_AT} locale="en-US" dateStyle="medium" timeStyle="short" />
            </span>
          </Example>
          <Example
            verdict="dont"
            caption="A relative phrase on an invoice date decays into uselessness: 'months ago' cannot be reconciled against a ledger."
          >
            <span className="text-sm">
              Order #10318 placed · <RelativeTime value={PLACED_AT} locale="en-US" />
            </span>
          </Example>
        </div>
      </Section>

      <Section
        title="Which one, by surface"
        intro="The same rule applied across the surfaces it comes up on. RelativeTime has no guidance page of its own; it is ruled on here."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Surface</th>
                <th className="p-3 font-medium">Use</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {DECISION.map(({ surface, use, why }) => (
                <tr key={surface} className="border-b align-top last:border-0">
                  <td className="p-3">{surface}</td>
                  <td className="p-3 font-mono text-xs">{use}</td>
                  <td className="text-muted-foreground p-3 text-xs">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const FormattingComesFromTheProvider: Story = {
  name: '2 · Formatting comes from FormatProvider',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One provider, no hand-formatting"
        intro="Locale and time zone are app-wide facts, not call-site decisions. Mount FormatProvider once and every DateTime, RelativeTime and Money below it agrees. A raw toLocaleString at the call site bypasses that contract: it renders in the browser's zone, drifts between users, and drops the semantic <time> element."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="de-DE / Europe/Berlin from the provider. The same value renders consistently everywhere below it, with zero props threaded."
          >
            <FormatProvider locale="de-DE" timeZone="Europe/Berlin">
              <DateTime value={PLACED_AT} dateStyle="long" timeStyle="short" />
            </FormatProvider>
          </Example>
          <Example
            verdict="dont"
            caption="A hand-formatted string renders in whatever zone the browser happens to be in and carries no machine-readable dateTime, so audit consistency is gone."
          >
            <span className="text-sm">{new Date(PLACED_AT).toLocaleString()}</span>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const Rules: Story = {
  name: '3 · Rules',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The rules that govern both molecules"
        intro="DateTime and RelativeTime are two renderings of the same underlying decision. These rules decide which one, and how it is fed."
      >
        <div className="flex flex-col gap-3">
          {RULES.map(({ n, title, body }) => (
            <div key={n} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {n} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
