import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

/**
 * Guidance, not props. When a raw non-secret identifier earns screen space at all, how to
 * choose between IdChip, CopyableText, and plain text, and where IdChips belong
 * (detail and support surfaces) versus where they are noise (dense tables where
 * the row already is the entity). For the component API, see the IdChip stories.
 */
const meta = {
  title: 'Molecules/IdChip/Guidance',
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

const ORDER_UUID = '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f';
const ULID = '01J9ZQKX7Y8N3F4G5H6J7K8M9A';

const TOOLS: { tool: string; sample: ReactNode; use: string }[] = [
  {
    tool: 'IdChip',
    sample: <IdChip value={ORDER_UUID} />,
    use: 'An opaque machine identifier the human reads by shape, not meaning (a UUID, a database ID, a gateway reference). Monospace and bordered so it reads as data, truncated for density, copied in full.',
  },
  {
    tool: 'CopyableText',
    sample: <CopyableText value="operations@acme.test">operations@acme.test</CopyableText>,
    use: 'A human-readable value that must be copyable but reads as prose (an email, a webhook URL, an API endpoint). No chip chrome, no forced monospace, no truncation; presentation stays yours.',
  },
  {
    tool: 'Plain text',
    sample: <span className="text-sm">SB-2043</span>,
    use: 'A human-facing code that identifies the entity and is rarely lifted out of context (an order code in a heading, a SKU in its own column). No affordance at all.',
  },
];

const TRUNCATION: { mode: 'middle' | 'start' | 'none'; value: string; when: string }[] = [
  {
    mode: 'middle',
    value: ORDER_UUID,
    when: 'Default. Opaque IDs where both ends aid recognition (UUIDs, hashes). Keeps an 8-character head and a 4-character tail.',
  },
  {
    mode: 'start',
    value: ULID,
    when: 'IDs with a shared, uninformative prefix: ULIDs share a timestamp head; namespaced keys share a prefix. Drops the boilerplate and keeps the distinguishing 8-character tail.',
  },
  {
    mode: 'none',
    value: 'SB-2043',
    when: 'Short identifiers, or anywhere every character must stay visible. Values of 13 characters or fewer never truncate, whatever the mode.',
  },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · IdChip vs CopyableText vs plain text',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Match the value to the lightest tool that fits"
        intro="A raw identifier is chrome for the machine, not the human. First ask whether the value belongs on screen at all (see story 2). If it does, match it to the lightest tool: reserve IdChip for opaque machine identifiers, reach for CopyableText when a human-readable value merely needs copying, and leave a self-explanatory code as plain text."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Tool</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map(({ tool, sample, use }) => (
                <tr key={tool} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{tool}</td>
                  <td className="p-3">{sample}</td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Chip the machine ID, not the human code"
        intro="The order reads by its code; the internal primary key is a fallback for whoever needs to paste it into a log search or a support ticket."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The human code leads; the machine ID sits quietly beside it in a monospace chip, ready to copy."
          >
            <span className="text-sm font-medium">Order SB-2043</span>
            <IdChip value={ORDER_UUID} />
          </Example>
          <Example
            verdict="dont"
            caption="SB-2043 is already short and readable: the monospace chrome and copy button are noise around a value people just read. Plain text, or CopyableText if it must be copyable."
          >
            <IdChip value="SB-2043" truncate="none" />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · where IdChips belong ─────────────────────────────────────────────────

export const WhereTheyBelong: Story = {
  name: '2 · Where IdChips belong',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Detail and support surfaces, not dense rows"
        intro="An IdChip earns its place where someone will genuinely lift the value out: a detail page's technical section, a support or debug view, an audit log. In a dense list the row already is the entity (its code, customer, and total identify it), so a column of internal UUIDs steals scan space to show a value nobody reads down the page."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="On the order detail page, the technical block exposes the internal ID and the payment-intent reference: the values a support engineer pastes into logs."
          >
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-28 text-xs">Order ID</span>
                <IdChip value={ORDER_UUID} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-28 text-xs">Payment intent</span>
                <IdChip value="pi_3QXy7K2eZvKYlo2C1AbCdEfG" truncate="start" />
              </div>
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="One IdChip per row in the orders list. The row is already the order; the primary key is noise that crowds out the code, customer, and total that people actually scan."
          >
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-3">
                <IdChip value={ORDER_UUID} />
                <span>SB-2043</span>
              </div>
              <div className="flex items-center gap-3">
                <IdChip value="9a3d21b4-7c6e-4f18-b0a2-1d5e8c7f6a3b" />
                <span>SB-2044</span>
              </div>
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · truncation ───────────────────────────────────────────────────────────

export const Truncation: Story = {
  name: '3 · Truncation',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Truncate for density; the full value is always copied"
        intro="Truncation only shortens the rendered text: the full value is copied in full and revealed on hover via the chip's title. Pick the mode by which part of the ID distinguishes it: keep both ends for a UUID, keep the tail for a prefixed key, keep everything for a short one."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 font-medium">Renders</th>
                <th className="p-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {TRUNCATION.map(({ mode, value, when }) => (
                <tr key={mode} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{mode}</td>
                  <td className="p-3">
                    <IdChip value={value} truncate={mode} />
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Keep the part that tells IDs apart"
        intro="When a prefix is shared across a whole set of IDs, middle truncation spends the visible characters on the part they have in common."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="start drops the shared ULID timestamp head and keeps the random tail: the only part that distinguishes one row from the next."
          >
            <IdChip value={ULID} truncate="start" />
            <IdChip value="01J9ZQKX7Y8N3F4G5H6J7QRST" truncate="start" />
          </Example>
          <Example
            verdict="dont"
            caption="middle spends its 8-character head on the identical timestamp and leaves only 4 tail characters to tell the two apart; start would have shown 8."
          >
            <IdChip value={ULID} truncate="middle" />
            <IdChip value="01J9ZQKX7Y8N3F4G5H6J7QRST" truncate="middle" />
          </Example>
        </div>
      </Section>
    </div>
  ),
};
