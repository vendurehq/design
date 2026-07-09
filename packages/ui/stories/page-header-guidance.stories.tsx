import type { Meta, StoryObj } from '@storybook/react';
import { ChevronLeftIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBackLink,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. The header is where the one-primary-action-per-view rule
 * is enforced, and where the title says *what this is*. This page rules on the
 * actions slot (one primary Button, the rest stepped down or in an overflow),
 * on what may sit beside the title (state and identity, never a control), and on
 * writing the title as an entity name rather than a sentence. For the component
 * API, see the PageHeader stories.
 */
const meta = {
  title: 'Molecules/PageHeader/Guidance',
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
      <div className="flex flex-col gap-4">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const REGIONS: { region: string; holds: string; rule: string }[] = [
  {
    region: 'BackLink',
    holds: 'One link, one level up.',
    rule: 'A single parent link, not a breadcrumb trail. Optional; omit at the top of a section.',
  },
  {
    region: 'Title',
    holds: "The entity's name.",
    rule: 'A noun phrase, like "Order #100234" or "Denim Jacket". No verbs, no trailing sentence.',
  },
  {
    region: 'Beside the title',
    holds: 'State and identity.',
    rule: "A StatusBadge for the entity's state, an IdChip for its id. Nothing clickable lives here.",
  },
  {
    region: 'Description',
    holds: 'A short orienting subtitle.',
    rule: 'Key facts (SKU, variant count) or one line of context. Not instructions or help text.',
  },
  {
    region: 'Actions',
    holds: "The view's verbs.",
    rule: 'At most one primary Button. Everything else is outline, ghost, or in an overflow menu.',
  },
];

// ── 1 · one primary per view ─────────────────────────────────────────────────

export const OnePrimaryAction: Story = {
  name: '1 · One primary action',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The actions slot rations the accent"
        intro="A view has exactly one most-important action. It gets the filled Button; every other action steps down to outline or ghost, or folds into an overflow menu. This is the one-primary-per-view rule (see Button / Guidance) enforced at the top of the page: a second filled Button is a decision you have not made yet."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="Fulfill is the primary; Refund steps down to outline and the rest hide behind the overflow. The intended path is unmistakable."
          >
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderTitle>Order #100234</PageHeaderTitle>
                <PageHeaderDescription>Placed 9 Jul 2026 · 3 items</PageHeaderDescription>
              </PageHeaderContent>
              <PageHeaderActions>
                <Button variant="outline">Refund</Button>
                <Button>Fulfill</Button>
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreHorizontalIcon />
                </Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
          <Example
            verdict="dont"
            caption="Three filled Buttons compete for the eye. Nothing is primary, so the user has to read all of them to find the main path."
          >
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderTitle>Order #100234</PageHeaderTitle>
                <PageHeaderDescription>Placed 9 Jul 2026 · 3 items</PageHeaderDescription>
              </PageHeaderContent>
              <PageHeaderActions>
                <Button>Refund</Button>
                <Button>Fulfill</Button>
                <Button>Cancel order</Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · what sits beside the title ───────────────────────────────────────────

export const BesideTheTitle: Story = {
  name: '2 · Beside the title',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="State and identity, not controls"
        intro="The space next to the title is for reading, not acting: a StatusBadge that reports the entity's state, an IdChip for its record id. State words (Paid, Pending, Failed) carry a tone and belong on a StatusBadge, never forced onto a neutral Badge, which has no tone vocabulary (see StatusBadge / Guidance). Anything clickable belongs in the actions slot, not beside the title."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="The order's state reads as a toned StatusBadge; its id sits in an IdChip. Both are glanceable, neither is a control."
          >
            <PageHeader>
              <PageHeaderContent>
                <div className="flex flex-wrap items-center gap-2">
                  <PageHeaderTitle>Order #100234</PageHeaderTitle>
                  <StatusBadge tone="success">Paid</StatusBadge>
                </div>
                <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />
              </PageHeaderContent>
              <PageHeaderActions>
                <Button>Fulfill</Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
          <Example
            verdict="dont"
            caption='"Paid" on a neutral Badge throws away the tone; a stray action crammed next to the title duplicates the real actions slot.'
          >
            <PageHeader>
              <PageHeaderContent>
                <div className="flex flex-wrap items-center gap-2">
                  <PageHeaderTitle>Order #100234</PageHeaderTitle>
                  <Badge variant="outline">Paid</Badge>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </PageHeaderContent>
              <PageHeaderActions>
                <Button>Fulfill</Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · the title names the entity ───────────────────────────────────────────

export const TitleNamesTheEntity: Story = {
  name: '3 · The title names the entity',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The title is a name, not a sentence"
        intro="A page title answers “what is this?”, so it reads as the entity's name: a noun phrase you could put in a breadcrumb. The verbs live in the actions slot and the explanation lives in the description. A title that gives an instruction is doing the description's job."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Example
            verdict="do"
            caption="The title names the product; the orienting facts drop to the description and the back link handles the level up."
          >
            <div className="flex flex-col gap-2">
              <PageHeaderBackLink>
                <a
                  href="#products"
                  className="hover:text-foreground inline-flex items-center gap-1"
                >
                  <ChevronLeftIcon className="size-4" />
                  Back to products
                </a>
              </PageHeaderBackLink>
              <PageHeader>
                <PageHeaderContent>
                  <PageHeaderTitle>Denim Jacket</PageHeaderTitle>
                  <PageHeaderDescription>SKU DJ-001 · 3 variants</PageHeaderDescription>
                </PageHeaderContent>
                <PageHeaderActions>
                  <Button variant="outline">Duplicate</Button>
                  <Button>
                    <PlusIcon />
                    Add variant
                  </Button>
                </PageHeaderActions>
              </PageHeader>
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="The title reads as an instruction. It buries the entity name and does the description's job, so the page loses its heading."
          >
            <PageHeader>
              <PageHeaderContent>
                <PageHeaderTitle>
                  Edit this product and manage its variants and inventory
                </PageHeaderTitle>
              </PageHeaderContent>
              <PageHeaderActions>
                <Button>Save</Button>
              </PageHeaderActions>
            </PageHeader>
          </Example>
        </div>
      </Section>

      <Section
        title="Regions at a glance"
        intro="Each region has one job. When in doubt about where a piece of UI goes, this is the contract."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Region</th>
                <th className="p-3 font-medium">Holds</th>
                <th className="p-3 font-medium">Rule</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map(({ region, holds, rule }) => (
                <tr key={region} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{region}</td>
                  <td className="p-3 text-xs">{holds}</td>
                  <td className="text-muted-foreground p-3 text-xs">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};
