import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

/**
 * Guidance, not props. Which values earn a copy button (things a user
 * transports elsewhere) and which do not, when to reach for CopyableText versus
 * its opaque-identifier sibling IdChip, and why secret-like values use
 * AnonymizedToken instead of rendering in full.
 */
const meta = {
  title: 'Molecules/CopyableText/Guidance',
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

// The test for a copy button: does the user carry this value into another tool?
const EARNS_COPY: { value: string; kind: string; why: string }[] = [
  {
    value: 'stripe_pi_3QZkL42eZvKYlo2C0j9x',
    kind: 'Payment reference',
    why: 'Pasted into a payment-provider search or support ticket.',
  },
  {
    value: 'ORD-100234',
    kind: 'Order code',
    why: 'Quoted into a support ticket, searched in the warehouse tool, sent to the customer.',
  },
  {
    value: 'aria.chen@example.com',
    kind: 'Customer email',
    why: 'Dropped into a mail client or CRM to reach the person.',
  },
  {
    value: 'https://api.acme-store.com/vendure/webhooks',
    kind: 'Webhook URL',
    why: 'Registered verbatim in a payment provider dashboard.',
  },
  {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    kind: 'Entity ID / token',
    why: 'Passed to the API, a GraphQL query, or a log search.',
  },
];

// Values a user reads in place. A copy button here is pure noise.
const NO_COPY: { value: string; kind: string; why: string }[] = [
  {
    value: '$49.00',
    kind: 'Money',
    why: 'Read, not transported. Nobody pastes a price elsewhere.',
  },
  { value: '128', kind: 'Quantity', why: 'A number you scan, not a value you move.' },
  {
    value: 'Aria Chen',
    kind: 'Display name',
    why: 'A human label you search by, not an identifier you clone.',
  },
  {
    value: 'Ships in 2 to 3 days',
    kind: 'Descriptive copy',
    why: 'Prose, not something anyone reuses byte-for-byte.',
  },
];

// CopyableText vs IdChip: same copy mechanism, opposite presentation contracts.
const SIBLINGS: { aspect: string; copyable: string; idChip: string }[] = [
  {
    aspect: 'Value shape',
    copyable: 'Human-meaningful: order codes, emails, URLs, prices you happen to copy.',
    idChip: 'Opaque and non-secret: UUIDs, database IDs, gateway references.',
  },
  {
    aspect: 'Presentation',
    copyable: 'None. It styles only the layout; children are entirely yours.',
    idChip: 'Opinionated: bordered, monospace, muted chip tuned for ID density.',
  },
  {
    aspect: 'The value shown',
    copyable: 'Shown in full: the point is that a human can read it.',
    idChip: 'Truncated (middle by default); the full value is copied and shown on hover.',
  },
  {
    aspect: 'Reach for it when',
    copyable: 'You already have styled content and just need to make it copyable.',
    idChip: 'You have a raw identifier and want the standard chip for free.',
  },
];

// truncate modes are IdChip's, not CopyableText's: CopyableText never truncates.
const TRUNCATE: { mode: 'middle' | 'start' | 'none'; use: string }[] = [
  {
    mode: 'middle',
    use: 'Default. Keeps a recognizable head and tail for UUIDs and long tokens.',
  },
  {
    mode: 'start',
    use: 'Drops a constant prefix and keeps the distinguishing tail (e.g. a keyed slug).',
  },
  {
    mode: 'none',
    use: 'Short or human-facing IDs that must stay whole (an order code, a short SKU).',
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const WhatEarnsCopy: Story = {
  name: '1 · What earns a copy button',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Copy is for values you transport, not values you read"
        intro="A copy button is an affordance with a cost: it adds a control, a hit target, and a hover surface to every row it lands on. Spend it only where the user carries the value into another tool: an API key into a terminal, an order code into a support ticket, an email into a CRM. If the value is read in place, leave it as plain text."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Only the transportable identifier carries a button; the total is plain text."
          >
            <CopyableText value="ORD-100234">
              <span className="font-mono text-sm">ORD-100234</span>
            </CopyableText>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-sm">$49.00</span>
          </Example>
          <Example
            verdict="dont"
            caption="A button on the name, the price, and the quantity. Three controls, nothing worth copying."
          >
            <CopyableText value="Aria Chen">
              <span className="text-sm">Aria Chen</span>
            </CopyableText>
            <CopyableText value="$49.00">
              <span className="text-sm">$49.00</span>
            </CopyableText>
            <CopyableText value="128">
              <span className="text-sm">128</span>
            </CopyableText>
          </Example>
        </div>
      </Section>

      <Section
        title="The transport test"
        intro="Ask one question of every value: does the user paste this somewhere else? Yes on the left, no on the right."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-success-subtle-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Earns a copy button
            </p>
            <ul className="flex flex-col gap-3">
              {EARNS_COPY.map(({ value, kind, why }) => (
                <li key={kind}>
                  <CopyableText value={value}>
                    <span className="font-mono text-xs">{value}</span>
                  </CopyableText>
                  <p className="mt-1 text-sm font-medium">{kind}</p>
                  <p className="text-muted-foreground text-xs">{why}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-destructive-subtle-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
              Stays plain text
            </p>
            <ul className="flex flex-col gap-3">
              {NO_COPY.map(({ value, kind, why }) => (
                <li key={kind}>
                  <span className="text-sm">{value}</span>
                  <p className="mt-1 text-sm font-medium">{kind}</p>
                  <p className="text-muted-foreground text-xs">{why}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const CopyableTextVsIdChip: Story = {
  name: '2 · CopyableText vs IdChip',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Meaningful value? CopyableText. Opaque identifier? IdChip"
        intro="Both share the same copy button under the hood, so the choice is entirely about presentation. CopyableText styles nothing: it wraps content you have already styled and adds the button. IdChip owns the look: a bordered, monospace chip built for raw identifiers, truncating the display while copying the full value. Use CopyableText for values a human reads (an order code, an email); use IdChip for values a machine reads (a UUID, a token)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The opaque UUID gets the IdChip (truncated, hover for the rest); the human order code stays whole in CopyableText."
          >
            <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />
            <CopyableText value="ORD-100234">
              <Badge variant="outline">ORD-100234</Badge>
            </CopyableText>
          </Example>
          <Example
            verdict="dont"
            caption="A raw UUID shown in full blows out the row, and a short code jammed into an ID chip borrows density it does not need."
          >
            <CopyableText value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f">
              <span className="font-mono text-sm">5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f</span>
            </CopyableText>
          </Example>
        </div>
      </Section>

      <Section
        title="Side by side"
        intro="If you catch yourself re-implementing the IdChip look on top of CopyableText, use IdChip. If you need any other presentation, use CopyableText and own the markup."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Aspect</th>
                <th className="p-3 font-medium">CopyableText</th>
                <th className="p-3 font-medium">IdChip</th>
              </tr>
            </thead>
            <tbody>
              {SIBLINGS.map(({ aspect, copyable, idChip }) => (
                <tr key={aspect} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{aspect}</td>
                  <td className="text-muted-foreground p-3 text-xs">{copyable}</td>
                  <td className="text-muted-foreground p-3 text-xs">{idChip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const RevealAndTruncate: Story = {
  name: '3 · Reveal the value, never the button',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The button is always visible; only the value hides"
        intro="The copy button never lives behind hover. A copy affordance a user cannot see is a copy affordance they will not find, so it renders at all times as a quiet ghost icon that darkens on hover. What hover reveals is the full value: IdChip shows a truncated identifier for density and surfaces the complete string in the native tooltip (and always copies it in full). CopyableText does the opposite: it shows the value in full because a human is meant to read it, so there is nothing to reveal."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Truncated for density; hover the chip for the full token, and the button is always in reach."
          >
            <IdChip value="whsec_9c1f8b7e2f3a4c9d9e218a7b6c5d4e3f" />
          </Example>
          <Example
            verdict="dont"
            caption="Truncating a human-facing order code strips the recognizable value it exists to show. Keep it whole."
          >
            <IdChip value="ORDER-2026-100234-EU" truncate="middle" />
          </Example>
        </div>
      </Section>

      <Section
        title="IdChip truncate modes"
        intro="Truncation belongs to IdChip alone; CopyableText never shortens its children. Pick the mode by which part of the identifier a person needs to recognize."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Mode</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {TRUNCATE.map(({ mode, use }) => (
                <tr key={mode} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{mode}</td>
                  <td className="p-3">
                    <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate={mode} />
                  </td>
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
