import type { Meta, StoryObj } from '@storybook/react';
import { TagIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Chip } from '../src/components/molecules/chip.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When to reach for a Chip versus its three siblings
 * (Badge, StatusBadge, IdChip): what a Chip is actually for (removable set
 * members and applied filters, not static labels), and the rule that keeps
 * dictionary state words off it. For the component API, see the Chip stories.
 */
const meta = {
  title: 'Molecules/Chip/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ───────────

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

const SIBLINGS: { name: string; answers: string; example: ReactNode; reach: string }[] = [
  {
    name: 'Badge',
    answers: 'What kind of thing is this?',
    example: <Badge>Physical product</Badge>,
    reach:
      'A static classification, kind, or count that no one removes inline: product type, a variant count, a read-only tag.',
  },
  {
    name: 'Chip',
    answers: 'Which items are in this set, and can I take one out?',
    example: (
      <Chip onRemove={() => {}} removeLabel="Remove Footwear">
        Footwear
      </Chip>
    ),
    reach:
      'A member of an editable set or an applied filter: assigned facet values, channels, customer groups, active filters. The × is the point.',
  },
  {
    name: 'StatusBadge',
    answers: 'What condition is this thing in?',
    example: <StatusBadge tone="success">Settled</StatusBadge>,
    reach:
      'A state that can succeed, fail, or be in motion, mapped to a tone by the state dictionary. Active, Failed, Pending live here and nowhere else.',
  },
  {
    name: 'IdChip',
    answers: 'What is the exact identifier? Let me copy it.',
    example: <IdChip value="7f3a9c2e-1b4d-4e8a-9f6c-2d5e8a1b3c4d" />,
    reach: 'A raw ID or token that must be copyable in full while shown compact and monospace.',
  },
];

const RULES: { title: string; body: string }[] = [
  {
    title: 'Removability is the whole signal',
    body: 'The × says "this belongs to an editable set and you can take it out". A label with no way out, and no set to belong to, is a Badge, not a Chip.',
  },
  {
    title: 'Dictionary state words are never Chips',
    body: 'Active, Pending, Failed, Cancelled, Shipped and the rest belong to StatusBadge, which maps them to a tone through the state dictionary. A Chip carries no tone vocabulary and breaks that contract. See StatusBadge / Guidance.',
  },
  {
    title: 'removeLabel is mandatory with onRemove',
    body: 'The × button has no text of its own. Name it for screen readers (removeLabel="Remove Wholesale"), or the component warns in development.',
  },
  {
    title: 'Secondary text is composition, not a prop',
    body: 'Qualify a value inline with a muted span (Red in Color) rather than reaching for a subtitle prop that does not exist.',
  },
  {
    title: 'disabled means a pending mutation, not "off"',
    body: 'Dim and lock a Chip while its un-assign request is in flight. It is not a way to render a deactivated entity: that is a state, and it belongs on StatusBadge.',
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const Siblings: Story = {
  name: '1 · Four siblings, four jobs',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Chip vs Badge vs StatusBadge vs IdChip"
        intro="Four compact chips that look alike and mean different things. Pick by the question the label answers, not by its size. A Chip is the only one of the four that is interactive: it represents a member of an editable set that the user can remove."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Component</th>
                <th className="p-3 font-medium">Answers</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Reach for it when</th>
              </tr>
            </thead>
            <tbody>
              {SIBLINGS.map(({ name, answers, example, reach }) => (
                <tr key={name} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{name}</td>
                  <td className="text-muted-foreground p-3 text-xs">{answers}</td>
                  <td className="p-3">{example}</td>
                  <td className="text-muted-foreground p-3 text-xs">{reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const WhatAChipIsFor: Story = {
  name: '2 · What a Chip is for',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A set the user can edit, not a label to read"
        intro="Reach for a Chip when the token is part of an editable collection: the facet values applied as filters on a product list, the channels a promotion is assigned to, the groups a customer belongs to. If nothing can be added or removed, you want a Badge."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Applied product-list filters as a removable set: each × narrows or widens the result, and the icon marks them as filters."
          >
            <Chip icon={<TagIcon />} onRemove={() => {}} removeLabel="Remove Color: Red">
              Red <span className="text-muted-foreground">in Color</span>
            </Chip>
            <Chip icon={<TagIcon />} onRemove={() => {}} removeLabel="Remove Size: M">
              M <span className="text-muted-foreground">in Size</span>
            </Chip>
            <Chip icon={<TagIcon />} onRemove={() => {}} removeLabel="Remove Brand: Acme">
              Acme <span className="text-muted-foreground">in Brand</span>
            </Chip>
          </Example>
          <Example
            verdict="dont"
            caption="A single static classification has no set to belong to and no ×: that is a Badge. A Chip here promises an interaction that never comes."
          >
            <Chip>Physical product</Chip>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const NeverAState: Story = {
  name: '3 · Never a state, and the rules',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Membership is not a condition"
        intro="A Chip says an entity is in a set. It does not say the entity is Active, Failed, or Pending: those are dictionary states, and they belong to StatusBadge, which colors them by tone. Put a state word on a Chip and you throw away the tone contract that keeps the same state looking the same everywhere."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Group membership rides on removable Chips; the account condition rides on a toned StatusBadge next to them."
          >
            <Chip onRemove={() => {}} removeLabel="Remove Wholesale">
              Wholesale
            </Chip>
            <Chip onRemove={() => {}} removeLabel="Remove VIP">
              VIP
            </Chip>
            <StatusBadge tone="success">Verified</StatusBadge>
          </Example>
          <Example
            verdict="dont"
            caption="Dictionary state words forced onto Chips: no tone, no dictionary mapping, and a misleading × on a condition you cannot remove."
          >
            <Chip>Pending</Chip>
            <Chip variant="destructive">Failed</Chip>
          </Example>
        </div>
      </Section>

      <Section title="Five rules for a Chip" intro="What every reviewer checks a Chip against.">
        <div className="flex flex-col gap-3">
          {RULES.map(({ title, body }, i) => (
            <div key={title} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {i + 1} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
