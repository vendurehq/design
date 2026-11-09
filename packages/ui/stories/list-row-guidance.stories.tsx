import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { Card } from '../src/components/atoms/card.tsx';
import {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowLink,
  ListRowMeta,
  ListRowTitle,
  ListRowTrailing,
} from '../src/components/molecules/list-row.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When a short list of entities belongs in ListRow rather
 * than a DataTable or an Item, why a row has exactly one link that covers the
 * whole row, and what goes in each slot. For the component API, see the
 * ListRow stories.
 */
const meta = {
  title: 'Molecules/ListRow/Guidance',
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

function RowCard({ children }: { children: ReactNode }) {
  return <Card className="gap-0 py-0">{children}</Card>;
}

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'ListRow',
    use: 'A short list of entities on a card or overview, where each row opens one detail page: recent orders, the latest imports, pending returns. Few columns, read top to bottom.',
  },
  {
    tool: 'DataTable',
    use: 'The full collection of an entity: sorting, filtering, paging, column choice or bulk selection. Users compare values across rows, so the values need columns.',
  },
  {
    tool: 'Item',
    use: 'A standalone block of content, often outlined or muted, that is not one entry of a list of the same entity: a settings entry, a linked resource, a media card.',
  },
];

const SLOTS: { slot: string; holds: string }[] = [
  { slot: 'ListRowLeading', holds: 'An icon or a status mark that identifies the kind of row. Optional; leave it out when every row would show the same icon.' },
  { slot: 'ListRowLink / ListRowTitle', holds: 'What the row is: the order code, the job name. It is the accessible name of the row, so it holds the title only.' },
  { slot: 'ListRowMeta', holds: 'One line of secondary facts: who, how many, how long. It truncates; never put information there that the user must read in full.' },
  { slot: 'ListRowTrailing', holds: 'Always-visible columns: a StatusBadge, a time, an amount. Give a time a fixed width so the rows align.' },
  { slot: 'ListRowActions', holds: 'Secondary actions on the row, hidden until hover or focus. Never the only way to an action the user needs: the detail page has it too.' },
  { slot: 'ListRowChevron', holds: 'Shows that the row opens a page. Only on a row with a ListRowLink.' },
  { slot: 'data-new (on ListRow)', holds: 'Marks a row the user just added, such as a new backup, so it enters once. Only rows added while the page is open; never the rows of the first render.' },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · ListRow vs DataTable vs Item',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Rows to open, columns to compare"
        intro="A ListRow is an entry point: the user scans it and opens one row. When the user compares values across rows, or needs to find a row by filter, use a DataTable."
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
    </div>
  ),
};

// ── 2 · one link per row ─────────────────────────────────────────────────────

export const OneLinkPerRow: Story = {
  name: '2 · One link per row, over the whole row',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The whole row opens the page"
        intro="A row that opens a detail page opens it from any point of the row. The title is the one real link; it stretches over the row, so the row has one tab stop and one name. Controls in the row stay above it and keep their own click."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One ListRowLink per row. A click on the time, the badge or the empty space opens the order; the menu opens the menu."
          >
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowLink onClick={() => {}}>Order SB-2043</ListRowLink>
                  <ListRowMeta>Placed by Hayden Zieme</ListRowMeta>
                </ListRowContent>
                <ListRowTrailing>
                  <StatusBadge tone="success">Payment settled</StatusBadge>
                </ListRowTrailing>
                <ListRowActions>
                  <Button variant="ghost" size="icon-sm" aria-label="More for order SB-2043">
                    <MoreHorizontal />
                  </Button>
                </ListRowActions>
                <ListRowChevron />
              </ListRow>
            </RowCard>
          </Example>
          <Example
            verdict="dont"
            caption="One cell as the only link. Users click the row, nothing happens, and a second link to the same page doubles the tab stops."
          >
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowTitle>
                    <a href="#order" className="underline underline-offset-4">
                      SB-2043
                    </a>
                  </ListRowTitle>
                  <ListRowMeta>Placed by Hayden Zieme</ListRowMeta>
                </ListRowContent>
                <ListRowTrailing>
                  <a href="#order" className="text-sm underline underline-offset-4">
                    View
                  </a>
                </ListRowTrailing>
              </ListRow>
            </RowCard>
          </Example>
        </div>
      </Section>

      <Section
        title="A row without a page gets no link"
        intro="When there is nothing to open, use ListRowTitle: no chevron, no hover fill, no pointer. A row that looks clickable and does nothing is worse than a plain row."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="A backup schedule entry has no detail page: a static row.">
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowTitle>Nightly backup</ListRowTitle>
                  <ListRowMeta>Kept for 14 days</ListRowMeta>
                </ListRowContent>
                <ListRowTrailing>02:00</ListRowTrailing>
              </ListRow>
            </RowCard>
          </Example>
          <Example
            verdict="dont"
            caption="A chevron on a row that opens nothing promises a page that does not exist."
          >
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowTitle>Nightly backup</ListRowTitle>
                  <ListRowMeta>Kept for 14 days</ListRowMeta>
                </ListRowContent>
                <ListRowTrailing>02:00</ListRowTrailing>
                <ListRowChevron className="opacity-100 motion-safe:translate-x-0" />
              </ListRow>
            </RowCard>
          </Example>
        </div>
      </Section>

      <Section
        title="Text under the link cannot be selected"
        intro="The stretched link covers the row text, so a drag over it opens the row instead of selecting text. A value the user copies goes in a control in the row, or on the detail page."
      >
        <Example
          verdict="do"
          caption="The payment reference is an IdChip: a control above the link, copied with one click."
        >
          <RowCard>
            <ListRow>
              <ListRowContent>
                <ListRowLink onClick={() => {}}>Refund for order SB-2038</ListRowLink>
                <ListRowMeta>Issued by Liam Becker</ListRowMeta>
              </ListRowContent>
              <ListRowTrailing>
                <IdChip value="re_3PZk8f2eZvKYlo2C1x9QmT4a" />
              </ListRowTrailing>
              <ListRowChevron />
            </ListRow>
          </RowCard>
        </Example>
      </Section>
    </div>
  ),
};

// ── 3 · what goes where ──────────────────────────────────────────────────────

export const Slots: Story = {
  name: '3 · What goes in each slot',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One fact per slot"
        intro="Keep the title short and let the trailing columns carry state and time. State words go in a StatusBadge, toned through the state dictionary."
      >
        <div className="overflow-x-auto rounded-lg border">
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
      </Section>

      <Section title="Keep the name short">
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The title names the order; the customer and item count sit in the meta line."
          >
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowLink onClick={() => {}}>Order SB-2042</ListRowLink>
                  <ListRowMeta>Placed by Mara Okafor · 3 items</ListRowMeta>
                </ListRowContent>
                <ListRowTrailing>
                  <StatusBadge tone="info">Payment authorized</StatusBadge>
                </ListRowTrailing>
                <ListRowChevron />
              </ListRow>
            </RowCard>
          </Example>
          <Example
            verdict="dont"
            caption="Everything in the link: a screen reader reads the whole sentence as the name of the row, and the state loses its badge."
          >
            <RowCard>
              <ListRow>
                <ListRowContent>
                  <ListRowLink onClick={() => {}}>
                    Order SB-2042 placed by Mara Okafor, 3 items, payment authorized
                  </ListRowLink>
                </ListRowContent>
                <ListRowChevron />
              </ListRow>
            </RowCard>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
