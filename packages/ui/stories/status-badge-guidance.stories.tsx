import type { Meta, StoryObj } from '@storybook/react';
import { Fragment, type ReactNode } from 'react';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

/**
 * Guidance, not props. This page documents the *decisions* behind the state
 * dictionary — the six tones, the principles and rulings that decide every
 * mapping, and the full state→tone reference table that consumer-side domain
 * maps are reviewed against. For the component API and its variants, see the
 * StatusBadge stories.
 */
const meta = {
  title: 'Molecules/StatusBadge/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives ───────────────────────────────────────────────────────

function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <StatusBadge tone={tone} dot>
      {children}
    </StatusBadge>
  );
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

// ── data ─────────────────────────────────────────────────────────────────────

const TONES: { tone: Tone; sample: string; def: string; examples: string }[] = [
  {
    tone: 'neutral',
    sample: 'Cancelled',
    def: 'Inert. Nothing needs anyone; nothing is moving.',
    examples:
      'Draft, created, not started, cancelled, expired (no consequence), disabled, hidden, unknown.',
  },
  {
    tone: 'info',
    sample: 'Shipped',
    def: 'Noteworthy, no valence. A fact worth seeing, not a judgment.',
    examples: 'Shipped, authorized, quoted, in review, invited, delegated, registered.',
  },
  {
    tone: 'success',
    sample: 'Active',
    def: 'Positive terminal, or healthy and operating.',
    examples:
      'Completed, approved, settled, delivered, valid, enabled, active, healthy, running (a service).',
  },
  {
    tone: 'warning',
    sample: 'Awaiting approval',
    def: 'Needs a human, or signals risk. Attention, not failure.',
    examples:
      'Awaiting approval, changes requested, degraded, low stock, stale, suspended, retrying.',
  },
  {
    tone: 'critical',
    sample: 'Failed',
    def: 'Failed, blocked, or service-affecting. Intervene.',
    examples: 'Failed, error, rejected, declined, revoked, invalid, out of stock, disconnected.',
  },
  {
    tone: 'progress',
    sample: 'Deploying',
    def: 'The system is working right now. Transient; will resolve itself.',
    examples:
      'Running (a job), building, deploying, queued in a live pipeline, validating. Always shows a pulsing dot.',
  },
];

const PRINCIPLES: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'Tone encodes consequence for the viewer, not the verb',
    body: 'The same word maps differently by domain when the consequence differs. A RUNNING job is progress (transient, will finish); a RUNNING deployment is success (the service is up). An expired quote is neutral (it is just over); an expired license is critical (the product stops working). This is why the dictionary is keyed by domain, not by bare string.',
  },
  {
    n: 2,
    title: 'Red is rationed: cancelled is not a failure',
    body: 'Critical means "intervene." A user-initiated terminal state — cancelled, revoked invitation, churned — is neutral. Reserving red keeps failure scannable in a 200-row table.',
  },
  {
    n: 3,
    title: 'Pending splits by who resolves it',
    body: 'Waits on a human decision (approval queue, review, customer payment) → warning. Waits on the system or on time (queued job, pending deployment, async settlement) → neutral. Actively executing right now → progress. "Pending" as a word gets no single color; pending as a situation does.',
  },
  {
    n: 4,
    title: 'Good news is green, not brand blue and not grey',
    body: 'Active, approved, completed, healthy → success. Brand blue on a state was always an accident of the default variant; grey "completed" hid finished work. Brand stays reserved for identity moments per accent rationing.',
  },
];

const RULINGS: { conflict: string; today: string; ruling: Tone[]; note: string }[] = [
  {
    conflict: 'Cancelled',
    today:
      'Red in OSS dashboard; grey in EE, Cloud, portals; outline in ops-admin & workflow-engine',
    ruling: ['neutral'],
    note: 'User-initiated terminal, not failure (principle 2).',
  },
  {
    conflict: 'Pending',
    today:
      '5-way: amber (OSS, partner-portal), grey (Cloud, ops-admin), outline (EE), blue (tax-id)',
    ruling: ['warning', 'neutral'],
    note: 'Split by resolver (principle 3): human-blocking → warning; system/time → neutral.',
  },
  {
    conflict: 'In progress',
    today: 'Blue raw-Tailwind (Cloud), spinner + grey (OSS job queue), brand default (EE)',
    ruling: ['progress'],
    note: 'Info hue + always-on pulsing dot. Both info and animated, as its own tone.',
  },
  {
    conflict: 'Active / Completed',
    today: 'Green in portals & 3 EE plugins; brand blue in ops-admin; grey in workflow-engine',
    ruling: ['success'],
    note: 'Good news is green (principle 4).',
  },
  {
    conflict: 'Expired',
    today: 'Grey in EE quote/approval/tax-id; red for licenses in enterprise-portal',
    ruling: ['neutral', 'critical', 'warning'],
    note: 'Neutral by default; critical when service-affecting (license); warning when it demands re-action (tax ID) — principle 1.',
  },
  {
    conflict: 'Suspended',
    today: 'Grey (ops-admin customers), red (ops-admin plugins), raw orange (partner-portal)',
    ruling: ['warning'],
    note: 'Imposed, abnormal, reversible; not a failure.',
  },
  {
    conflict: 'Refund Failed',
    today: 'Falls through OSS getTypeForState to untoned grey',
    ruling: ['critical'],
    note: 'A failure that was invisible.',
  },
  {
    conflict: 'Break-glass active',
    today: 'Deliberate amber in enterprise-portal, brand blue in ops-admin',
    ruling: ['warning'],
    note: '"Active" that means elevated privilege is risk, not success. The portal had it right.',
  },
];

type Row = { states: string; tone: Tone; note?: string };
type Domain = { domain: string; source: string; rows: Row[] };
type Codebase = { codebase: string; repo: string; domains: Domain[] };

const REFERENCE: Codebase[] = [
  {
    codebase: 'Commerce core — OSS / Platform dashboard',
    repo: 'vendure',
    domains: [
      {
        domain: 'Order',
        source: 'order-state.ts',
        rows: [
          { states: 'Created · Draft · AddingItems', tone: 'neutral' },
          {
            states: 'ArrangingPayment · ArrangingAdditionalPayment',
            tone: 'warning',
            note: 'Blocked on the customer paying',
          },
          { states: 'Modifying', tone: 'warning', note: 'Open until an admin completes it' },
          { states: 'PaymentAuthorized', tone: 'info', note: 'Money reserved is worth seeing' },
          { states: 'PaymentSettled', tone: 'success' },
          {
            states: 'PartiallyShipped · Shipped · PartiallyDelivered',
            tone: 'info',
            note: 'Healthy mid-fulfillment, not inert',
          },
          { states: 'Delivered', tone: 'success' },
          { states: 'Cancelled', tone: 'neutral', note: 'Was red (ruling 1)' },
        ],
      },
      {
        domain: 'Payment',
        source: 'payment-state.ts',
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
        source: 'fulfillment-state.ts',
        rows: [
          {
            states: 'Created · Pending',
            tone: 'neutral',
            note: 'Pending is system-resolved, not human-blocked (ruling 2)',
          },
          { states: 'Shipped', tone: 'info' },
          { states: 'Delivered', tone: 'success' },
          { states: 'Cancelled', tone: 'neutral' },
        ],
      },
      {
        domain: 'Refund',
        source: 'refund-state.ts',
        rows: [
          { states: 'Pending', tone: 'warning', note: 'May need admin/gateway action to settle' },
          { states: 'Settled', tone: 'success' },
          { states: 'Failed', tone: 'critical', note: 'Was invisible grey (ruling 7)' },
        ],
      },
      {
        domain: 'Job queue',
        source: 'JobState enum',
        rows: [
          { states: 'PENDING', tone: 'neutral', note: 'Queued, system-resolved' },
          { states: 'RUNNING', tone: 'progress', note: 'The dot is the spinner now' },
          { states: 'RETRYING', tone: 'warning', note: 'Something went wrong; recovering' },
          { states: 'COMPLETED', tone: 'success' },
          { states: 'FAILED', tone: 'critical' },
          { states: 'CANCELLED', tone: 'neutral' },
        ],
      },
      {
        domain: 'Customer account',
        source: 'customer-status-badge.tsx',
        rows: [
          { states: 'guest', tone: 'neutral' },
          { states: 'registered', tone: 'info' },
          { states: 'verified', tone: 'success' },
        ],
      },
      {
        domain: 'Boolean enabled/disabled',
        source: 'boolean.tsx + 12 more sites',
        rows: [
          {
            states: 'enabled / true',
            tone: 'success',
            note: 'Also isActive, isPublic, published, visible',
          },
          { states: 'disabled / false', tone: 'neutral', note: 'Also inactive, private, hidden' },
        ],
      },
    ],
  },
  {
    codebase: 'Enterprise plugins',
    repo: 'vendure-ee-plugins',
    domains: [
      {
        domain: 'Workflow engine',
        source: 'status-badge-variant.ts',
        rows: [
          { states: 'PENDING / pending', tone: 'neutral' },
          { states: 'RUNNING / running', tone: 'progress' },
          {
            states: 'COMPLETED / completed',
            tone: 'success',
            note: 'Was grey — the headline EE conflict (ruling 4)',
          },
          { states: 'FAILED / failed', tone: 'critical' },
          { states: 'CANCELLED', tone: 'neutral' },
        ],
      },
      {
        domain: 'Approval requests',
        source: 'approval-status-badge.tsx',
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
        source: 'quote-status-badge.tsx',
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
        source: 'tax-id-status-badge.tsx',
        rows: [
          { states: 'Pending', tone: 'progress', note: 'The system is validating right now' },
          { states: 'Valid', tone: 'success' },
          { states: 'Invalid · Error', tone: 'critical' },
          { states: 'Expired', tone: 'warning', note: 'Customer must supply a new ID (ruling 5)' },
        ],
      },
      {
        domain: 'Org hierarchy',
        source: 'company + company-user state machines',
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
        source: 'shared-detail-columns.tsx',
        rows: [
          { states: 'Pending', tone: 'neutral', note: 'Settles asynchronously — system-resolved' },
          { states: 'Settled', tone: 'success' },
          { states: 'Cancelled', tone: 'neutral' },
        ],
      },
      {
        domain: 'Stock',
        source: 'stock-badge.tsx',
        rows: [
          { states: 'IN_STOCK', tone: 'success' },
          { states: 'LOW_STOCK', tone: 'warning' },
          { states: 'OUT_OF_STOCK', tone: 'critical' },
        ],
      },
      {
        domain: 'Price-rule schedules',
        source: 'schedule-status.ts',
        rows: [
          { states: 'active', tone: 'success' },
          { states: 'upcoming', tone: 'info' },
          { states: 'always · expired', tone: 'neutral' },
        ],
      },
      {
        domain: 'Punchout',
        source: 'labels.tsx',
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
        source: 'version-list.tsx',
        rows: [
          { states: 'active ("Current")', tone: 'success' },
          { states: 'draft', tone: 'neutral' },
        ],
      },
      {
        domain: 'Configurator',
        source: 'constants.ts',
        rows: [{ states: 'ORDERED', tone: 'success' }],
      },
    ],
  },
  {
    codebase: 'Cloud',
    repo: 'vendure-cloud',
    domains: [
      {
        domain: 'Deployment',
        source: 'DeploymentStatus',
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
        domain: 'Runtime health / project rollup',
        source: 'EnvironmentRuntimeHealth · project-status.ts',
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
        source: 'TeardownStatus',
        rows: [
          { states: 'QUEUED · RUNNING', tone: 'progress' },
          { states: 'SUCCEEDED', tone: 'success' },
        ],
      },
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
        intro="Tone is the semantic meaning a color expresses about a state. Six tones are the entire visual vocabulary. Tone ≠ token name: critical renders with the destructive slots, and progress shares the info slots (distinguished by motion, not hue)."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {TONES.map(({ tone, sample, def, examples }) => (
            <div key={tone} className="rounded-lg border p-4">
              <Chip tone={tone}>{sample}</Chip>
              <p className="mt-3 text-sm font-medium">
                <span className="font-mono text-xs">{tone}</span> — {def}
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
        intro="Each was rendered inconsistently across the estate. The dictionary rules on each one explicitly."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Conflict</th>
                <th className="p-3 font-medium">Today</th>
                <th className="p-3 font-medium">Ruling</th>
              </tr>
            </thead>
            <tbody>
              {RULINGS.map(({ conflict, today, ruling, note }) => (
                <tr key={conflict} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{conflict}</td>
                  <td className="text-muted-foreground p-3 text-xs">{today}</td>
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
        intro="The reference contract. Each domain map lives in its owning repo, declared with defineStateEntries and reviewed against this table. The design system does not ship app-domain state strings — only commonStates (the universal map) and the mechanism."
      >
        {REFERENCE.map(({ codebase, repo, domains }) => (
          <div key={repo} className="mb-8">
            <h3 className="text-sm font-semibold">
              {codebase} <span className="text-muted-foreground font-mono text-xs">({repo})</span>
            </h3>
            <div className="mt-2 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                    <th className="p-3 font-medium">State</th>
                    <th className="p-3 font-medium">Tone</th>
                    <th className="p-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map(({ domain, source, rows }) => (
                    <Fragment key={domain}>
                      <tr className="bg-muted/40 border-b">
                        <td colSpan={3} className="p-2 px-3 text-xs font-semibold">
                          {domain}{' '}
                          <span className="text-muted-foreground font-normal">{source}</span>
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
          </div>
        ))}
      </Section>
    </div>
  ),
};
