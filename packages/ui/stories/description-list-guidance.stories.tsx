import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import { DateTime } from '../src/components/molecules/date-time.tsx';
import {
  DescriptionList,
  DescriptionListItem,
} from '../src/components/molecules/description-list.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { Money } from '../src/components/molecules/money.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When a DescriptionList is the right shape versus a Table
 * or a form, what belongs in a value slot, and how to split a detail page that
 * has outgrown one list. For the component API and its orientations, see the
 * DescriptionList stories.
 */
const meta = {
  title: 'Molecules/DescriptionList/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, not imported) ───────────

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

// The three-way decision every detail view starts from.
const SHAPES: { shape: string; pick: string; because: string }[] = [
  {
    shape: 'One entity, read-only',
    pick: 'DescriptionList',
    because:
      "Labelled facts about a single thing (an order's totals, a customer's contact block). Semantic dt/dd, no row chrome.",
  },
  {
    shape: 'Many entities of one kind',
    pick: 'Table',
    because:
      'A collection you scan, sort, and compare down columns (the order list, product variants). Rows share one header.',
  },
  {
    shape: 'One entity, being edited',
    pick: 'Form (Field)',
    because:
      'The moment a value becomes editable it needs a control, a label association, and validation: that is the Field atom, not a dd.',
  },
];

// Orientation is the only layout lever the component exposes.
const ORIENTATIONS: { orientation: string; when: string }[] = [
  {
    orientation: 'vertical',
    when: 'Narrow columns and cards. Term sits above its value; nothing has to line up across a gutter. The default.',
  },
  {
    orientation: 'horizontal',
    when: 'Wide detail panels. Terms and values share one two-column grid, so the whole block reads as an aligned key/value table.',
  },
  {
    orientation: 'responsive',
    when: 'A list that lives in both. Stacks below its container width and switches to the aligned grid above it (a container query, not the viewport), so a narrow side panel on a wide page stays stacked.',
  },
];

// What a dd is for, and what it never becomes.
const VALUE_RULES: { rule: string; body: string }[] = [
  {
    rule: 'Compose molecules into the value',
    body: 'The dd is a slot. Drop a StatusBadge, Money, DateTime, IdChip, or a plain Badge straight in: the list handles the label, the molecule handles the value. Do not re-implement their formatting inline.',
  },
  {
    rule: 'State is a tone, never a plain string',
    body: 'A payment condition belongs on a StatusBadge with a dictionary tone, not typed as bare text in the dd and not stuffed onto a neutral Badge. See StatusBadge/Guidance.',
  },
  {
    rule: 'One value per term',
    body: 'If a value needs its own sub-fields, it is a nested entity: give it its own grouped list or a Table, not a comma-run inside one dd.',
  },
  {
    rule: 'Keep it read-only',
    body: 'The instant a value needs to change in place, it has left the DescriptionList. Move that field into a form; do not embed inputs in a dd.',
  },
];

// ── 1 · list, table, or form ─────────────────────────────────────────────────

export const ListTableOrForm: Story = {
  name: '1 · List, table, or form',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Match the component to the shape of the data"
        intro="DescriptionList answers one question: what are the labelled facts about this one thing? A collection you scan and sort is a Table. A thing you change is a form. Reach for the list only for the read-only detail of a single entity."
      >
        <div className="mb-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Data shape</th>
                <th className="p-3 font-medium">Reach for</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {SHAPES.map(({ shape, pick, because }) => (
                <tr key={shape} className="border-b align-top last:border-0">
                  <td className="p-3 font-medium">{shape}</td>
                  <td className="p-3 font-mono text-xs">{pick}</td>
                  <td className="text-muted-foreground p-3 text-xs">{because}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One order's facts as a DescriptionList: labelled, read-only, no row chrome to carry a single record."
          >
            <DescriptionList orientation="horizontal" className="w-full">
              <DescriptionListItem label="Order">
                <IdChip value="6f1a9c2e-04b7-4e2a-9f1d-8c7b5a2e1d3f" display="#10432" />
              </DescriptionListItem>
              <DescriptionListItem label="Placed">
                <DateTime value="2026-07-08T09:24:00Z" dateStyle="medium" timeStyle="short" />
              </DescriptionListItem>
              <DescriptionListItem label="Total">
                <Money value={12900} currency="EUR" />
              </DescriptionListItem>
            </DescriptionList>
          </Example>
          <Example
            verdict="dont"
            caption="A single record forced into a Table: a header row with no siblings to scan, and column widths fighting one entity."
          >
            <Table className="min-w-[320px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#10432</TableCell>
                  <TableCell>Jul 8, 2026</TableCell>
                  <TableCell>€129.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Example>
        </div>
      </Section>

      <Section
        title="Orientation is the only layout lever"
        intro="The component ships three orientations: pick by the width the list has to live in, not by taste. There is no density or column-count prop; if a list is too dense, that is a splitting problem (story 3), not a layout one."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">orientation</th>
                <th className="p-3 font-medium">Reach for it when</th>
              </tr>
            </thead>
            <tbody>
              {ORIENTATIONS.map(({ orientation, when }) => (
                <tr key={orientation} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{orientation}</td>
                  <td className="text-muted-foreground p-3 text-xs">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · what lives in a value slot ───────────────────────────────────────────

export const ValueSlot: Story = {
  name: '2 · What lives in a value slot',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The value is a slot, so compose into it"
        intro="A detail (dd) takes children, not a string: that is deliberate. The design system's value molecules drop straight in: StatusBadge for a condition, Money for an amount, DateTime for a timestamp, IdChip for an identifier. The list owns the label; each molecule owns its own formatting."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Each value is the right molecule: the condition carries a dictionary tone, money and time are formatted by their own components, the ID is copyable."
          >
            <DescriptionList orientation="horizontal" className="w-full">
              <DescriptionListItem label="Payment">
                <StatusBadge tone="success">Settled</StatusBadge>
              </DescriptionListItem>
              <DescriptionListItem label="Channel">
                <Badge>Europe</Badge>
              </DescriptionListItem>
              <DescriptionListItem label="Captured">
                <Money value={12900} currency="EUR" />
              </DescriptionListItem>
              <DescriptionListItem label="Transaction">
                <IdChip value="pi_3Pw2Qk2eZvKYlo2C1a2b3c4d" copyable />
              </DescriptionListItem>
            </DescriptionList>
          </Example>
          <Example
            verdict="dont"
            caption="State typed as bare text loses the tone vocabulary and the dictionary contract; money and IDs hand-formatted inline drift from every other surface."
          >
            <DescriptionList orientation="horizontal" className="w-full">
              <DescriptionListItem label="Payment">Settled</DescriptionListItem>
              <DescriptionListItem label="Channel">
                <Badge variant="destructive">Settled</Badge>
              </DescriptionListItem>
              <DescriptionListItem label="Captured">129,00 EUR</DescriptionListItem>
              <DescriptionListItem label="Transaction">
                pi_3Pw2Qk2eZvKYlo2C1a2b3c4d
              </DescriptionListItem>
            </DescriptionList>
          </Example>
        </div>
      </Section>

      <Section
        title="Four rules for the value slot"
        intro="What a dd is for, and the lines it must not cross."
      >
        <div className="flex flex-col gap-3">
          {VALUE_RULES.map(({ rule, body }) => (
            <div key={rule} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">{rule}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · when one list is too many rows ───────────────────────────────────────

export const TooManyRows: Story = {
  name: '3 · When one list is too many rows',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Split by concern, don't scroll one wall"
        intro="A detail page rarely has one flat set of facts: it has an identity block, a payment block, a fulfilment block. When a single list runs past roughly a screen, or mixes unrelated concerns, break it into several short lists under headings rather than one long one. The eye finds a labelled group faster than it scans twenty undifferentiated rows."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Grouped by concern under headings. Each list stays short and scannable, and a reader jumps straight to the block they came for."
          >
            <div className="flex w-full flex-col gap-5">
              <div>
                <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                  Order
                </h4>
                <DescriptionList orientation="horizontal">
                  <DescriptionListItem label="Reference">
                    <IdChip value="6f1a9c2e-04b7-4e2a-9f1d-8c7b5a2e1d3f" display="#10432" />
                  </DescriptionListItem>
                  <DescriptionListItem label="Placed">
                    <DateTime value="2026-07-08T09:24:00Z" dateStyle="medium" />
                  </DescriptionListItem>
                  <DescriptionListItem label="Total">
                    <Money value={12900} currency="EUR" />
                  </DescriptionListItem>
                </DescriptionList>
              </div>
              <div>
                <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                  Fulfilment
                </h4>
                <DescriptionList orientation="horizontal">
                  <DescriptionListItem label="Shipment">
                    <StatusBadge tone="info">Shipped</StatusBadge>
                  </DescriptionListItem>
                  <DescriptionListItem label="Carrier">DHL Express</DescriptionListItem>
                </DescriptionList>
              </div>
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="One list carrying every concern. Identity, money, and fulfilment run together, so the block has to be read top-to-bottom to find anything."
          >
            <DescriptionList orientation="horizontal" className="w-full">
              <DescriptionListItem label="Reference">#10432</DescriptionListItem>
              <DescriptionListItem label="Placed">
                <DateTime value="2026-07-08T09:24:00Z" dateStyle="medium" />
              </DescriptionListItem>
              <DescriptionListItem label="Total">
                <Money value={12900} currency="EUR" />
              </DescriptionListItem>
              <DescriptionListItem label="Shipment">
                <StatusBadge tone="info">Shipped</StatusBadge>
              </DescriptionListItem>
              <DescriptionListItem label="Carrier">DHL Express</DescriptionListItem>
              <DescriptionListItem label="Customer">jane@vendure.io</DescriptionListItem>
              <DescriptionListItem label="Channel">
                <Badge>Europe</Badge>
              </DescriptionListItem>
            </DescriptionList>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
