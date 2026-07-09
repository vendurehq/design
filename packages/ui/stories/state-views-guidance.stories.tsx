import type { Meta, StoryObj } from '@storybook/react';
import { InboxIcon, PackageIcon, SearchIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { EmptyCollectionIllustration } from '../src/components/molecules/illustrations/empty-collection.tsx';
import { NoResultsIllustration } from '../src/components/molecules/illustrations/no-results.tsx';
import { EmptyState } from '../src/components/molecules/state-views/empty-state.tsx';
import { ErrorState } from '../src/components/molecules/state-views/error-state.tsx';
import { LoadingState } from '../src/components/molecules/state-views/loading-state.tsx';

/**
 * Guidance, not props. The three state views answer three different questions
 * about a region that has no content to show: LoadingState (still waiting),
 * EmptyState (succeeded, nothing to show), ErrorState (the system failed).
 * This page rules on which view a situation gets, and how empty and error copy
 * should read. For each component's API, see its own stories page.
 */
const meta = {
  title: 'Molecules/StateViews/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ──────────

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

type Decision = {
  view: string;
  question: string;
  meaning: string;
  responsibility: string;
};

const DECISIONS: Decision[] = [
  {
    view: 'LoadingState',
    question: 'Is the answer still in flight?',
    meaning: 'Waiting. The outcome is unknown; the query has not resolved.',
    responsibility: 'Hold the space so nothing below it jumps when data lands.',
  },
  {
    view: 'EmptyState',
    question: 'Did the query succeed but return nothing?',
    meaning: 'Working as intended. There is genuinely nothing to show yet.',
    responsibility: 'Explain why it is empty and invite the first action.',
  },
  {
    view: 'ErrorState',
    question: 'Did the system fail to produce an answer?',
    meaning: 'A failure. The request threw, timed out, or was rejected.',
    responsibility: 'Take responsibility, and offer a way forward (retry).',
  },
];

type LoadingChoice = {
  variant: 'skeleton' | 'spinner';
  use: string;
};

const LOADING_CHOICES: LoadingChoice[] = [
  {
    variant: 'skeleton',
    use: 'Known-shape regions: tables, lists, detail panes. Shimmer rows mirror the layout that is coming, so nothing reflows when data arrives. The default.',
  },
  {
    variant: 'spinner',
    use: 'Compact or unknown-height regions where a row skeleton would lie about the layout (a toolbar action, a small card, a modal body).',
  },
];

// ── 1 · one region, three views ──────────────────────────────────────────────

export const WhichView: Story = {
  name: '1 · Which view for which situation',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Three questions about an empty region"
        intro="A region with no content is in exactly one of three situations, and each has its own view. Walk the questions in order (waiting first, then success-with-nothing, then failure) and never blur the boundaries between them: an EmptyState shown while a query is still running is a lie, and a failure dressed as 'No results' hides a bug."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">View</th>
                <th className="p-3 font-medium">Ask</th>
                <th className="p-3 font-medium">Means</th>
                <th className="p-3 font-medium">Its job</th>
              </tr>
            </thead>
            <tbody>
              {DECISIONS.map(({ view, question, meaning, responsibility }) => (
                <tr key={view} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{view}</td>
                  <td className="text-muted-foreground p-3 text-xs">{question}</td>
                  <td className="text-muted-foreground p-3 text-xs">{meaning}</td>
                  <td className="text-muted-foreground p-3 text-xs">{responsibility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="The same orders table, in each situation"
        intro="One data region, rendered for each answer. The three views share EmptyState's anatomy so the region keeps the same footprint as it moves between them."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground mb-3 font-mono text-xs">LoadingState · waiting</p>
            <LoadingState rows={4} rowClassName="h-8" />
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground mb-3 font-mono text-xs">EmptyState · nothing yet</p>
            <EmptyState
              icon={<PackageIcon />}
              title="No orders yet"
              description="When customers place orders, they will appear here."
            />
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground mb-3 font-mono text-xs">ErrorState · failed</p>
            <ErrorState
              description="We couldn't load orders. This is on us; try again in a moment."
              onRetry={() => {}}
            />
          </div>
        </div>
      </Section>

      <Section
        title="LoadingState vs the raw Skeleton atom"
        intro="Reach for LoadingState, not a bare Skeleton, whenever a whole region is loading. LoadingState wraps the Skeleton atom in an aria-live output with an always-present sr-only 'Loading…' label, so screen readers announce the wait; the raw atom is silent. Drop to a bare Skeleton only for a single inline placeholder (one avatar, one value) inside otherwise-rendered content. Pick the variant by what the region's real shape will be."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">variant</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {LOADING_CHOICES.map(({ variant, use }) => (
                <tr key={variant} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{variant}</td>
                  <td className="w-40 p-3">
                    <LoadingState
                      variant={variant}
                      rows={2}
                      rowClassName="h-6"
                      label={variant === 'spinner' ? 'Loading…' : undefined}
                    />
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

// ── 2 · empty states teach ────────────────────────────────────────────────────

export const EmptyStatesTeach: Story = {
  name: '2 · Empty states teach the first action',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Empty is an opportunity, not a dead end"
        intro="An empty state is the first thing a user sees on a feature they haven't populated. It should explain what will live here and hand them the one verb that fills it. Lead the CTA with the action, like 'Create product' or 'Import customers', not a vague 'OK'. First-run empties get a primary Button; filtered or searched empties get a quieter recovery like 'Clear filters'."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Says what belongs here, then offers the verb that creates the first one."
          >
            <EmptyState
              icon={<PackageIcon />}
              title="No products yet"
              description="Add your first product to start selling."
            >
              <Button>Add product</Button>
            </EmptyState>
          </Example>
          <Example
            verdict="dont"
            caption="A bare headline with no orientation and no next step. The user is stranded on their own feature."
          >
            <EmptyState title="No products" />
          </Example>
        </div>
      </Section>

      <Section
        title="A filtered empty is a different empty"
        intro="'Nothing exists yet' and 'nothing matches your filter' are not the same state. The first invites creation; the second offers to widen the net. Match the icon and the CTA to which one it is."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Search turned up nothing, so the recovery is to relax the query, not to create a customer."
          >
            <EmptyState
              icon={<SearchIcon />}
              title="No customers match “acme”"
              description="Try a different search or clear your filters."
            >
              <Button variant="outline" size="sm">
                Clear filters
              </Button>
            </EmptyState>
          </Example>
          <Example
            verdict="dont"
            caption="A first-run 'Add customer' CTA on a filtered result: the customers exist, the filter just hid them. The action is wrong for the state."
          >
            <EmptyState
              icon={<InboxIcon />}
              title="No customers match “acme”"
              description="Add your first customer to get started."
            >
              <Button>Add customer</Button>
            </EmptyState>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · errors own the failure ────────────────────────────────────────────────

const ERROR_RULES: { rule: string; body: string }[] = [
  {
    rule: 'Own it, don’t blame the user',
    body: 'The copy takes responsibility for the system. "We couldn’t load this" reads better than "Invalid request": the user did nothing wrong when a query fails.',
  },
  {
    rule: 'Offer the way out',
    body: 'If retrying can help, pass onRetry to render the "Try again" button. If it can’t (a 404), drop onRetry and give a real alternative like "Go back" as children.',
  },
  {
    rule: 'Never dress a failure as empty',
    body: 'A caught error rendered as an EmptyState hides a bug: no red, no retry, no role="alert", and the user thinks the data is genuinely absent. A failure is always an ErrorState.',
  },
];

export const ErrorsOwnTheFailure: Story = {
  name: '3 · Errors take responsibility',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="An error takes the blame and offers a door"
        intro="ErrorState carries what no atom does (role='alert' and a destructive-tinted icon), and its copy should match that weight: own the failure and give a way forward. The two failure modes to avoid are showing an error dressed as an empty state, and showing an empty state while a query is still in flight."
      >
        <div className="mb-4 flex flex-col gap-3">
          {ERROR_RULES.map(({ rule, body }) => (
            <div key={rule} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">{rule}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Failure owns the failure: role=alert, destructive icon, and a retry the user can actually take."
          >
            <ErrorState
              description="We couldn't load this order. This is on us; try again in a moment."
              onRetry={() => {}}
            />
          </Example>
          <Example
            verdict="dont"
            caption="A caught fetch error rendered as an empty state. No retry, no alert semantics: the user reads a bug as 'no data'."
          >
            <EmptyState icon={<PackageIcon />} title="No order details" />
          </Example>
        </div>
      </Section>

      <Section
        title="When retry can’t help, give a real alternative"
        intro="Retrying a request for a payment that doesn’t exist just fails again. Drop onRetry and pass the honest next step as children: the same box, a different door."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A missing resource can’t be retried into existence, so the door is navigation, not 'Try again'."
          >
            <ErrorState
              title="Payment not found"
              description="This payment doesn’t exist or was removed."
            >
              <Button variant="outline" size="sm">
                Back to payments
              </Button>
            </ErrorState>
          </Example>
          <Example
            verdict="dont"
            caption="Showing 'No orders yet' before the query resolves flashes a false empty. While the answer is in flight, the region is LoadingState, not EmptyState."
          >
            <EmptyState
              icon={<PackageIcon />}
              title="No orders yet"
              description="When customers place orders, they will appear here."
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 4 · illustrations are for the whole view ──────────────────────────────────

export const IllustrationUsage: Story = {
  name: '4 · One illustration, once per view',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="An illustration marks the whole view's moment, not a row"
        intro="EmptyState and ErrorState default to an illustration from molecules/illustrations/*. Match it to the situation (see the Illustrations gallery for the full set and what each one is for), and use exactly one per region — it announces 'this is the moment', which stops being true the instant it repeats. Never drop an illustration into a table row, a list item, or a card inside an otherwise-populated view; those get the icon-chip fallback (`illustration={null}` with an `icon`), or no media at all."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One illustration, matched to the scenario, owning the whole empty region."
          >
            <EmptyState
              illustration={<NoResultsIllustration />}
              title="No customers match “acme”"
              description="Try a different search or clear your filters."
            >
              <Button variant="outline" size="sm">
                Clear filters
              </Button>
            </EmptyState>
          </Example>
          <Example
            verdict="dont"
            caption="An illustration crammed into a table cell reads as clutter, not identity — the icon-chip fallback (or plain text) is what belongs at row scale."
          >
            <div className="w-full overflow-hidden rounded-md border text-sm">
              <div className="text-muted-foreground border-b px-3 py-2 text-xs font-medium uppercase tracking-wide">
                Orders
              </div>
              <div className="flex items-center gap-3 border-b px-3 py-2">
                <span>#1024</span>
                <span className="text-muted-foreground">Fulfilled</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <EmptyCollectionIllustration size={40} />
                <span className="text-muted-foreground">No line items</span>
              </div>
            </div>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
