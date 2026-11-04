import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Card } from '../src/components/atoms/card.tsx';
import { CollapsibleSection } from '../src/components/molecules/collapsible-section.tsx';
import {
  ListRow,
  ListRowChevron,
  ListRowContent,
  ListRowLink,
  ListRowMeta,
  ListRowTrailing,
} from '../src/components/molecules/list-row.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When a list of rows should start closed behind a
 * CollapsibleSection, when it should start open, and when to use the attention
 * tone on its count. For the component API, see the CollapsibleSection stories.
 */
const meta = {
  title: 'Molecules/CollapsibleSection/Guidance',
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

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'CollapsibleSection',
    use: 'One secondary list of rows on a page, on its own card, with a count: returns awaiting inspection, drafts not yet published. The user can see that the rows exist without reading them.',
  },
  {
    tool: 'Accordion',
    use: 'A set of peer panels of prose or form content where the user reads one at a time: FAQ entries, grouped settings.',
  },
  {
    tool: 'Collapsible',
    use: 'The bare primitive, for a disclosure that is not a card of rows: "Show advanced options" under a form.',
  },
  {
    tool: 'A plain card',
    use: 'The rows are the reason the user came to the page, or there is only one row. Do not hide them.',
  },
];

function OrderRow({ code, state, tone }: { code: string; state: string; tone: 'critical' | 'neutral' }) {
  return (
    <ListRow>
      <ListRowContent>
        <ListRowLink onClick={() => {}}>Order {code}</ListRowLink>
        <ListRowMeta>Card declined by the issuer</ListRowMeta>
      </ListRowContent>
      <ListRowTrailing>
        <StatusBadge tone={tone}>{state}</StatusBadge>
      </ListRowTrailing>
      <ListRowChevron />
    </ListRow>
  );
}

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · CollapsibleSection vs Accordion vs Collapsible',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Collapse what can wait"
        intro="A CollapsibleSection keeps a secondary list out of the way and still says how many rows it holds. Primary content stays open and uncollapsible."
      >
        <div className="overflow-x-auto rounded-lg border">
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
      </Section>

      <Section
        title="Do not collapse a single row"
        intro="A closed section with one row costs a click to save one line. Show the row on a plain card."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="One failed capture: a plain card with its row.">
            <Card className="gap-0 py-0">
              <OrderRow code="SB-2041" state="Capture failed" tone="critical" />
            </Card>
          </Example>
          <Example verdict="dont" caption="One row behind a header and a pill that says 1.">
            <CollapsibleSection title="Failed payment captures" count={1} headingLevel={3}>
              <OrderRow code="SB-2041" state="Capture failed" tone="critical" />
            </CollapsibleSection>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · open state and tone ─────────────────────────────────────────────────

export const OpenStateAndTone: Story = {
  name: '2 · Open by default, and the attention tone',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Open by default when a row needs the user"
        intro="Start closed when the rows are routine. When one of them has failed or waits on the user, start open, so the problem is in view without a click."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A failed capture is in the list: the section opens by itself and the pill carries the attention tone."
          >
            <CollapsibleSection
              title="Payment captures"
              count={2}
              tone="attention"
              defaultOpen
              headingLevel={3}
            >
              <OrderRow code="SB-2041" state="Capture failed" tone="critical" />
              <OrderRow code="SB-2039" state="Capture pending" tone="neutral" />
            </CollapsibleSection>
          </Example>
          <Example
            verdict="dont"
            caption="The failure hides behind a closed header; only the pill hints at it."
          >
            <CollapsibleSection title="Payment captures" count={2} tone="attention" headingLevel={3}>
              <OrderRow code="SB-2041" state="Capture failed" tone="critical" />
              <OrderRow code="SB-2039" state="Capture pending" tone="neutral" />
            </CollapsibleSection>
          </Example>
        </div>
      </Section>

      <Section
        title="Attention means action, not volume"
        intro="The attention tone puts the count in the warning tone, on the pill only. Use it when rows need the user. A long list of routine rows stays neutral, however long it is (accent rationing)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="48 archived drafts: neutral. Nothing waits on the user.">
            <CollapsibleSection title="Archived drafts" count={48} headingLevel={3} />
          </Example>
          <Example verdict="dont" caption="Attention for a big number trains users to ignore the tone.">
            <CollapsibleSection
              title="Archived drafts"
              count={48}
              tone="attention"
              headingLevel={3}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};
