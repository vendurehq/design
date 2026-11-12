import type { Meta, StoryObj } from '@storybook/react';
import { Fragment, type ReactNode } from 'react';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';
import { type OrderState, orderStates } from './order-states.tsx';

/**
 * Guidance, not props. This page documents the decisions behind the state
 * dictionary: the six tones, the principles and rulings that decide every
 * mapping, and the state→tone reference table that domain maps are reviewed
 * against. For the component API and its variants, see the StatusBadge
 * stories.
 */
const meta = {
  title: 'Molecules/StatusBadge/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives ───────────────────────────────────────────────────────

function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <StatusBadge tone={tone}>{children}</StatusBadge>;
}

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

const TONES: { tone: Tone; sample: string; def: string; examples: string }[] = [
  {
    tone: 'neutral',
    sample: 'Cancelled',
    def: 'Inert. Nothing needs anyone; nothing is moving.',
    examples: 'Draft, created, cancelled, expired, disabled, hidden, unknown.',
  },
  {
    tone: 'info',
    sample: 'Shipped',
    def: 'Noteworthy, no valence. A fact worth seeing, not a judgment.',
    examples: 'Shipped, authorized, quoted, in review, invited, registered.',
  },
  {
    tone: 'success',
    sample: 'Active',
    def: 'Positive terminal, or healthy and operating.',
    examples: 'Completed, approved, settled, delivered, enabled, active, healthy.',
  },
  {
    tone: 'warning',
    sample: 'Awaiting approval',
    def: 'Needs a human, or signals risk. Attention, not failure.',
    examples: 'Awaiting approval, changes requested, degraded, low stock, suspended.',
  },
  {
    tone: 'critical',
    sample: 'Failed',
    def: 'Failed, blocked, or service-affecting. Intervene.',
    examples: 'Failed, error, rejected, declined, revoked, invalid, out of stock.',
  },
  {
    tone: 'progress',
    sample: 'Deploying',
    def: 'The system is working right now. Transient; resolves itself.',
    examples: 'Running (a job), building, deploying, validating. Always shows a spinner.',
  },
];

const PRINCIPLES: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'Tone encodes consequence for the viewer, not the verb',
    body: 'The same word maps differently when the consequence differs. A RUNNING job is progress (it will finish); a RUNNING service is success (it is up). An expired quote is neutral; an expired license is critical. Maps are keyed by domain, not by bare string.',
  },
  {
    n: 2,
    title: 'Red is rationed: cancelled is not a failure',
    body: 'Critical means "intervene". A user-initiated terminal state is neutral. Reserving red keeps failure scannable in a 200-row table.',
  },
  {
    n: 3,
    title: 'Pending splits by who resolves it',
    body: 'Waits on a human decision: warning. Waits on the system or on time: neutral. Actively executing right now: progress. The word gets no single color; the situation does.',
  },
  {
    n: 4,
    title: 'Good news is green, not brand blue and not grey',
    body: 'Active, approved, completed, healthy: success. Brand color stays reserved for identity moments per accent rationing; grey "completed" hides finished work.',
  },
];

const RULINGS: { conflict: string; ruling: Tone[]; note: string }[] = [
  {
    conflict: 'Cancelled',
    ruling: ['neutral'],
    note: 'User-initiated terminal, not failure (principle 2).',
  },
  {
    conflict: 'Pending',
    ruling: ['warning', 'neutral'],
    note: 'Split by resolver (principle 3): human-blocking is warning; system or time is neutral.',
  },
  {
    conflict: 'In progress',
    ruling: ['progress'],
    note: 'Info-colored chip plus an always-on spinner, as its own tone.',
  },
  {
    conflict: 'Active / Completed',
    ruling: ['success'],
    note: 'Good news is green (principle 4).',
  },
  {
    conflict: 'Expired',
    ruling: ['neutral', 'critical', 'warning'],
    note: 'Neutral by default; critical when service-affecting; warning when it demands re-action (principle 1).',
  },
  {
    conflict: 'Suspended',
    ruling: ['warning'],
    note: 'Imposed, abnormal, reversible; not a failure.',
  },
  {
    conflict: 'Refund Failed',
    ruling: ['critical'],
    note: 'A failure that used to fall through to untoned grey.',
  },
  {
    conflict: 'Break-glass active',
    ruling: ['warning'],
    note: '"Active" that means elevated privilege is risk, not success.',
  },
];

type Row = { states: string; tone: Tone; note?: string };
type Domain = { domain: string; rows: Row[] };

const REFERENCE: Domain[] = [
  {
    domain: 'Order',
    rows: [
      {
        states: 'Created · Draft · AddingItems · ArrangingPayment',
        tone: 'neutral',
        note: 'Not started; the customer is still checking out',
      },
      {
        states: 'ArrangingAdditionalPayment',
        tone: 'warning',
        note: 'Blocked on the customer paying',
      },
      { states: 'Modifying', tone: 'warning', note: 'Open until an admin completes it' },
      {
        states: 'PaymentAuthorized · PaymentSettled',
        tone: 'info',
        note: 'Paid, waiting for fulfilment: the orders to act on',
      },
      {
        states: 'PartiallyShipped · Shipped · PartiallyDelivered',
        tone: 'neutral',
        note: 'On its way: a still truck icon, never a spinner',
      },
      { states: 'Delivered', tone: 'success' },
      { states: 'Cancelled', tone: 'neutral', note: 'Was red (ruling 1)' },
    ],
  },
  {
    domain: 'Payment',
    rows: [
      { states: 'Created', tone: 'neutral' },
      { states: 'Authorized', tone: 'info' },
      { states: 'Settled', tone: 'success' },
      { states: 'Declined · Error', tone: 'critical' },
      { states: 'Cancelled', tone: 'neutral' },
    ],
  },
  {
    domain: 'Fulfillment',
    rows: [
      {
        states: 'Created · Pending',
        tone: 'neutral',
        note: 'Pending is system-resolved, not human-blocked (ruling 2)',
      },
      { states: 'Shipped', tone: 'neutral', note: 'On its way: a still truck icon' },
      { states: 'Delivered', tone: 'success' },
      { states: 'Cancelled', tone: 'neutral' },
    ],
  },
  {
    domain: 'Refund',
    rows: [
      { states: 'Pending', tone: 'warning', note: 'May need admin/gateway action to settle' },
      { states: 'Settled', tone: 'success' },
      { states: 'Failed', tone: 'critical', note: 'Was invisible grey (ruling 7)' },
    ],
  },
  {
    domain: 'Job queue',
    rows: [
      { states: 'PENDING', tone: 'neutral', note: 'Queued, system-resolved' },
      { states: 'RUNNING', tone: 'progress', note: 'The badge brings its own spinner' },
      { states: 'RETRYING', tone: 'warning', note: 'Something went wrong; recovering' },
      { states: 'COMPLETED', tone: 'success' },
      { states: 'FAILED', tone: 'critical' },
      { states: 'CANCELLED', tone: 'neutral' },
    ],
  },
  {
    domain: 'Customer account',
    rows: [
      { states: 'guest', tone: 'neutral' },
      { states: 'registered', tone: 'info' },
      { states: 'verified', tone: 'success' },
    ],
  },
  {
    domain: 'Boolean enabled/disabled',
    rows: [
      {
        states: 'enabled / true',
        tone: 'success',
        note: 'Also isActive, isPublic, published, visible',
      },
      { states: 'disabled / false', tone: 'neutral', note: 'Also inactive, private, hidden' },
    ],
  },
  {
    domain: 'Workflows',
    rows: [
      { states: 'PENDING / pending', tone: 'neutral' },
      { states: 'RUNNING / running', tone: 'progress' },
      {
        states: 'COMPLETED / completed',
        tone: 'success',
        note: 'Was grey in the old map (ruling 4)',
      },
      { states: 'FAILED / failed', tone: 'critical' },
      { states: 'CANCELLED', tone: 'neutral' },
    ],
  },
  {
    domain: 'Approval requests',
    rows: [
      {
        states: 'PENDING',
        tone: 'warning',
        note: 'Human-blocking: a reviewer must decide (ruling 2)',
      },
      { states: 'IN_PROGRESS', tone: 'progress' },
      { states: 'APPROVED · AUTO_APPROVED', tone: 'success' },
      { states: 'REJECTED · AUTO_REJECTED', tone: 'critical' },
      {
        states: 'CHANGES_REQUESTED',
        tone: 'warning',
        note: "Ball is back in the requester's court",
      },
      { states: 'DELEGATED', tone: 'info' },
      { states: 'CANCELLED · EXPIRED', tone: 'neutral' },
    ],
  },
  {
    domain: 'Quotes',
    rows: [
      { states: 'DRAFT', tone: 'neutral' },
      { states: 'IN_REVIEW · QUOTED', tone: 'info', note: 'QUOTED = sent, awaiting the buyer' },
      {
        states: 'AWAITING_APPROVAL · CHANGES_REQUESTED',
        tone: 'warning',
        note: 'Blocked on an internal decision',
      },
      { states: 'ACCEPTED', tone: 'success' },
      { states: 'REJECTED', tone: 'critical' },
      {
        states: 'CANCELLED · EXPIRED',
        tone: 'neutral',
        note: 'Expired quote has no consequence (ruling 5)',
      },
    ],
  },
  {
    domain: 'Tax ID validation',
    rows: [
      { states: 'Pending', tone: 'progress', note: 'The system is validating right now' },
      { states: 'Valid', tone: 'success' },
      { states: 'Invalid · Error', tone: 'critical' },
      { states: 'Expired', tone: 'warning', note: 'Customer must supply a new ID (ruling 5)' },
    ],
  },
  {
    domain: 'Org hierarchy',
    rows: [
      { states: 'Pending (company)', tone: 'warning', note: 'Awaiting approval by an admin' },
      { states: 'Active', tone: 'success' },
      { states: 'Invited', tone: 'info' },
      { states: 'Suspended', tone: 'warning', note: 'Ruling 6' },
      { states: 'Denied', tone: 'critical' },
      { states: 'Closed · Removed', tone: 'neutral' },
    ],
  },
  {
    domain: 'Store credit',
    rows: [
      { states: 'Pending', tone: 'neutral', note: 'Settles asynchronously; system-resolved' },
      { states: 'Settled', tone: 'success' },
      { states: 'Cancelled', tone: 'neutral' },
    ],
  },
  {
    domain: 'Stock',
    rows: [
      { states: 'IN_STOCK', tone: 'success' },
      { states: 'LOW_STOCK', tone: 'warning' },
      { states: 'OUT_OF_STOCK', tone: 'critical' },
    ],
  },
  {
    domain: 'Price-rule schedules',
    rows: [
      { states: 'active', tone: 'success' },
      { states: 'upcoming', tone: 'info' },
      { states: 'always · expired', tone: 'neutral' },
    ],
  },
  {
    domain: 'Punchout',
    rows: [
      { states: 'active · completed · success', tone: 'success' },
      { states: 'transferred', tone: 'info' },
      { states: 'expired', tone: 'neutral' },
      { states: 'duplicate', tone: 'warning' },
      { states: 'error · auth_failed', tone: 'critical' },
    ],
  },
  {
    domain: 'Content versioning',
    rows: [
      { states: 'active ("Current")', tone: 'success' },
      { states: 'draft', tone: 'neutral' },
    ],
  },
  {
    domain: 'Configurator',
    rows: [{ states: 'ORDERED', tone: 'success' }],
  },
  {
    domain: 'Deployment',
    rows: [
      { states: 'PENDING', tone: 'neutral' },
      {
        states: 'QUEUED · BUILDING · BUILT · DEPLOYING',
        tone: 'progress',
        note: 'Same states drive polling',
      },
      {
        states: 'RUNNING · SUCCEEDED',
        tone: 'success',
        note: 'RUNNING = the service is up (principle 1)',
      },
      { states: 'DEGRADED', tone: 'warning' },
      { states: 'FAILED', tone: 'critical' },
      { states: 'CANCELLED', tone: 'neutral' },
    ],
  },
  {
    domain: 'Runtime health / status rollup',
    rows: [
      { states: 'HEALTHY / healthy', tone: 'success' },
      { states: 'deploying', tone: 'progress' },
      { states: 'DEGRADED / degraded', tone: 'warning' },
      { states: 'failed', tone: 'critical' },
      { states: 'UNKNOWN / unknown', tone: 'neutral', note: '"Not deployed"' },
    ],
  },
  {
    domain: 'Teardown',
    rows: [
      { states: 'QUEUED · RUNNING', tone: 'progress' },
      { states: 'SUCCEEDED', tone: 'success' },
    ],
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const Tones: Story = {
  name: '1 · The six tones',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The six tones"
        intro="Tone is the semantic meaning a color expresses about a state. Six tones are the entire visual vocabulary. Tone ≠ token name: critical renders with the destructive slots, and progress renders with the info slots plus a spinner (the spinner says in motion; a still info chip has no spinner)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {TONES.map(({ tone, sample, def, examples }) => (
            <div key={tone} className="rounded-lg border p-4">
              <Chip tone={tone}>{sample}</Chip>
              <p className="mt-3 text-sm font-medium">
                <span className="font-mono text-xs">{tone}</span>: {def}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{examples}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Principles: Story = {
  name: '2 · Principles & rulings',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Four rules that decide every mapping"
        intro="When a domain map is reviewed, these are the questions asked of every state."
      >
        <div className="flex flex-col gap-3">
          {PRINCIPLES.map(({ n, title, body }) => (
            <div key={n} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {n} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="The eight named conflicts, resolved"
        intro="Each of these states was rendered inconsistently before the dictionary. The dictionary rules on each one explicitly."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Conflict</th>
                <th className="p-3 font-medium">Ruling</th>
              </tr>
            </thead>
            <tbody>
              {/* Numbered: the reference table's notes cite "ruling N" by this index. */}
              {RULINGS.map(({ conflict, ruling, note }, i) => (
                <tr key={conflict} className="border-b align-top last:border-0">
                  <td className="text-muted-foreground p-3 text-xs">{i + 1}</td>
                  <td className="p-3 font-mono text-xs">{conflict}</td>
                  <td className="p-3">
                    <div className="mb-1 flex flex-wrap gap-1">
                      {ruling.map((tone) => (
                        <Chip key={tone} tone={tone}>
                          {tone}
                        </Chip>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs">{note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const ReferenceTable: Story = {
  name: '3 · State → tone reference',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Every state, every domain"
        intro="The reference contract. Each domain map lives in its owning repo, declared with defineStateEntries and reviewed against this table. The design system ships only the mechanism and commonStates (the universal map), never these domain strings."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">State</th>
                <th className="p-3 font-medium">Tone</th>
                <th className="p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {REFERENCE.map(({ domain, rows }) => (
                <Fragment key={domain}>
                  <tr className="bg-muted/40 border-b">
                    <td colSpan={3} className="p-2 px-3 text-xs font-semibold">
                      {domain}
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <tr
                      key={`${domain}-${row.states}`}
                      className="border-b align-top last:border-0"
                    >
                      <td className="p-3 font-mono text-xs">{row.states}</td>
                      <td className="p-3">
                        <Chip tone={row.tone}>{row.tone}</Chip>
                      </td>
                      <td className="text-muted-foreground p-3 text-xs">{row.note ?? ''}</td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

// ── 4 · appearance ──────────────────────────────────────────────────────────

const APPEARANCES: {
  appearance: 'chip' | 'bare' | 'icon' | 'text' | 'dot';
  sample: ReactNode;
  use: string;
}[] = [
  {
    appearance: 'chip',
    sample: (
      <StatusBadge tone="success">Live</StatusBadge>
    ),
    use: 'Default. A status that stands alone: beside a page title (size="lg"), in a card header, in a description list. The tone icon comes with it, so never put an icon in children. Pass icon={<Icon />} for a more exact shape, dot for a group of chips that is not a column, or icon={false} inline where the label already names the tone.',
  },
  {
    appearance: 'bare',
    sample: (
      <StatusBadge tone="progress" appearance="bare">
        Building
      </StatusBadge>
    ),
    use: 'A state inside a surface that is already tinted, such as an accent card for the running deployment. The chip\'s icon and tinted label without the box, so there is no box inside a box.',
  },
  {
    appearance: 'icon',
    sample: (
      <StatusBadge tone="progress" appearance="icon" detail="1m 15s">
        Building
      </StatusBadge>
    ),
    use: 'A status every row of a table has, such as a deployments table. The tone icon without a box, the label in neutral text, and an optional second line (detail) with the one time that matters for the state.',
  },
  {
    appearance: 'text',
    sample: (
      <StatusBadge tone="progress" appearance="text">
        Building
      </StatusBadge>
    ),
    use: 'The word in its tone colour, nothing around it. Not for a table column: colour alone does not read as a status there. A column uses icon.',
  },
  {
    appearance: 'dot',
    sample: (
      <StatusBadge tone="critical" appearance="dot">
        Failed
      </StatusBadge>
    ),
    use: 'No room for a word: a breadcrumb, a menu item, a timeline marker. The label stays in the DOM as screen-reader text, so always pass it.',
  },
];

const ROWS: { name: string; tone: Tone; state: string; time: string }[] = [
  { name: 'checkout-api', tone: 'success', state: 'Ready', time: '2 minutes ago' },
  { name: 'search-worker', tone: 'progress', state: 'Deploying', time: '31s' },
  { name: 'legacy-import', tone: 'critical', state: 'Failed', time: '1 hour ago' },
];

// An orders list: every order has a state. The do side reads the tone, the
// label and the icon from the order state dictionary, so each group has its own
// shape and only the orders that ask for the reader get a colour; the don't
// side is a chip in every row, with the code word and a spinner on Shipped.
const ORDERS: { code: string; state: OrderState; chipTone: Tone }[] = [
  { code: 'ORD-1024', state: 'PaymentSettled', chipTone: 'success' },
  { code: 'ORD-1025', state: 'Shipped', chipTone: 'progress' },
  { code: 'ORD-1026', state: 'Delivered', chipTone: 'neutral' },
  { code: 'ORD-1027', state: 'Cancelled', chipTone: 'critical' },
  { code: 'ORD-1028', state: 'PaymentDeclined', chipTone: 'critical' },
];

const PRODUCTS: { name: string; enabled: boolean; stock: number }[] = [
  { name: 'Laptop 15"', enabled: true, stock: 24 },
  { name: 'USB-C dock', enabled: false, stock: 0 },
  { name: 'Wireless mouse', enabled: true, stock: 180 },
];

export const Appearance: Story = {
  name: '4 · Chip, bare, icon, word or dot',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One state, five weights"
        intro="The tone decides the colour; the appearance decides how much room the state takes. All five read the same state dictionary, so a deployment that fails is red as a chip on its page, bare in a tinted card, as an icon in the deployments table, and as a dot in the breadcrumb."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Appearance</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {APPEARANCES.map(({ appearance, sample, use }) => (
                <tr key={appearance} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{appearance}</td>
                  <td className="p-3">{sample}</td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Icon and label in a table, a chip for the exception"
        intro="A status that every row has is the tone icon and a neutral label: the icon keeps its tone colour for every state, the label stays as quiet as the rest of the row. A chip signals importance: use it only where the normal state is far more common and shows nothing, so only the exception gets a chip. No chip in the first or the last column."
      >
        <h3 className="mb-2 text-sm font-semibold">A status on every row: icon and label</h3>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A deployments table: appearance=&quot;icon&quot; on every row. The icon keeps its tone colour for every state, green for success included. The label stays neutral. The second line holds one time, the one that matters for the state."
          >
            <div className="flex w-full flex-col gap-3 text-sm">
              {ROWS.map(({ name, tone, state, time }) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs">{name}</span>
                  <span className="w-32">
                    <StatusBadge tone={tone} appearance="icon" detail={time}>
                      {state}
                    </StatusBadge>
                  </span>
                </div>
              ))}
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="Plain coloured text in a status column. Colour alone does not read as a status, and it fails without colour vision. Do not grey out the icon of a finished success either."
          >
            <div className="flex w-full flex-col gap-3 text-sm">
              {ROWS.map(({ name, tone, state }) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs">{name}</span>
                  <span className="w-32">
                    <StatusBadge tone={tone} appearance="text">
                      {state}
                    </StatusBadge>
                  </span>
                </div>
              ))}
            </div>
          </Example>
        </div>
        <h3 className="mb-2 text-sm font-semibold">An order state: one line, a still icon</h3>
        <p className="text-muted-foreground mb-3 text-xs">
          A spinner is only for work that runs right now and ends in seconds or minutes, such as a
          build or a deploy. A state that lasts hours or days, such as Shipped, gets a still icon.
        </p>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="An orders list: appearance=&quot;icon&quot; on every row, one line, no time under it (the list has its own date column). Colour only where the state asks for the reader: blue for an order to fulfil, green for delivered, red for a declined payment. Shipped and Cancelled stay grey, and each group has its own shape."
          >
            <div className="flex w-full flex-col gap-3 text-sm">
              {ORDERS.map(({ code, state }) => (
                <div key={code} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs">{code}</span>
                  <span className="w-36">
                    <StatusBadge
                      tone={orderStates.toneFor(state)}
                      appearance="icon"
                      icon={orderStates.iconFor(state)}
                    >
                      {orderStates.labelFor(state)}
                    </StatusBadge>
                  </span>
                </div>
              ))}
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A chip in every row, with the state name as a code word. Five colours give every row the same weight, so the declined payment does not stand out. Shipped spins as if work runs right now."
          >
            <div className="flex w-full flex-col gap-3 text-sm">
              {ORDERS.map(({ code, state, chipTone }) => (
                <div key={code} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs">{code}</span>
                  <span className="w-36">
                    <StatusBadge tone={chipTone}>{state}</StatusBadge>
                  </span>
                </div>
              ))}
            </div>
          </Example>
        </div>
        <h3 className="mb-2 text-sm font-semibold">A chip only on the exception</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A products list: no mark on an enabled product, a chip on a disabled one. A chip signals importance, so its colour goes only to the exception that needs attention."
          >
            <div className="flex w-full flex-col gap-2 text-sm">
              {PRODUCTS.map(({ name, enabled, stock }) => (
                <div key={name} className="flex h-6 items-center gap-3">
                  <span className="flex-1">{name}</span>
                  <span className="w-20">
                    {enabled ? null : <StatusBadge tone="neutral">Disabled</StatusBadge>}
                  </span>
                  <span className="text-muted-foreground w-24 whitespace-nowrap text-right tabular-nums">
                    {stock} in stock
                  </span>
                </div>
              ))}
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A chip on every row, the normal state included. Each box competes with the row it labels, and the one disabled product no longer stands out."
          >
            <div className="flex w-full flex-col gap-2 text-sm">
              {PRODUCTS.map(({ name, enabled, stock }) => (
                <div key={name} className="flex h-6 items-center gap-3">
                  <span className="flex-1">{name}</span>
                  <span className="w-20">
                    <StatusBadge tone={enabled ? 'success' : 'neutral'}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </StatusBadge>
                  </span>
                  <span className="text-muted-foreground w-24 whitespace-nowrap text-right tabular-nums">
                    {stock} in stock
                  </span>
                </div>
              ))}
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
