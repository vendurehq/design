import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardLink,
  CardTitle,
} from '../src/components/atoms/card.tsx';
import {
  ChoiceCard,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardGroup,
  ChoiceCardTitle,
} from '../src/components/molecules/choice-card.tsx';
import {
  ListRow,
  ListRowChevron,
  ListRowContent,
  ListRowLink,
  ListRowMeta,
} from '../src/components/molecules/list-row.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When a whole card opens a page or a dialog (CardLink),
 * when a card is a choice instead (ChoiceCard), and when the list is rows
 * (ListRowLink). For the component API, see the CardLink stories.
 */
const meta = {
  title: 'Atoms/Data Display/CardLink/Guidance',
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
      <div>{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

const noop = (event: { preventDefault: () => void }) => event.preventDefault();

function ProjectCard({ name, region, menu = true }: { name: string; region: string; menu?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardLink render={<a href="#project" onClick={noop} />}>{name}</CardLink>
        </CardTitle>
        <CardDescription>{region}</CardDescription>
        {menu ? (
          <CardAction>
            <Button variant="ghost" size="icon-sm" aria-label={`More for ${name}`}>
              <MoreHorizontal />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <StatusBadge tone="success">Live</StatusBadge>
      </CardContent>
    </Card>
  );
}

export const WhichCard: Story = {
  name: '1 · CardLink, ChoiceCard or ListRowLink',
  render: () => (
    <Section
      title="Pick by what a click does and how the items are laid out"
      intro="A CardLink card opens one page or one dialog: navigation. A ChoiceCard is picked from a set and holds a value: a form control. A list of rows that each open a page is a ListRow with a ListRowLink; a card grid is for a few items the user recognises at a glance."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Example verdict="do" caption="CardLink: each project card opens its project.">
          <ProjectCard name="Storefront" region="Production · eu-west-1" />
        </Example>
        <Example verdict="do" caption="ChoiceCard: the user picks one plan, then saves.">
          <ChoiceCardGroup aria-label="Plan" defaultValue="growth">
            <ChoiceCard value="growth" size="sm">
              <ChoiceCardContent>
                <ChoiceCardTitle>Growth</ChoiceCardTitle>
                <ChoiceCardDescription>Up to 5 projects</ChoiceCardDescription>
              </ChoiceCardContent>
            </ChoiceCard>
          </ChoiceCardGroup>
        </Example>
        <Example verdict="do" caption="ListRowLink: many items to scan, one row each.">
          <Card className="py-0">
            <ListRow>
              <ListRowContent>
                <ListRowLink render={<a href="#order" onClick={noop} />}>SB-2043</ListRowLink>
                <ListRowMeta>Ana Torres · €128.00</ListRowMeta>
              </ListRowContent>
              <ListRowChevron />
            </ListRow>
          </Card>
        </Example>
      </div>
    </Section>
  ),
};

export const OneLinkNamedByTitle: Story = {
  name: '2 · One link, named by the title',
  render: () => (
    <Section
      title="Wrap the title text, not the card"
      intro="Put one CardLink inside CardTitle, around the title text. It stretches over the card, so the card has one tab stop and a short name. A link around the whole card reads every line of it as the name, and cannot hold a menu."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="The link holds the title. Screen readers hear “Storefront, link”.">
          <ProjectCard name="Storefront" region="Production · eu-west-1" menu={false} />
        </Example>
        <Example verdict="dont" caption="A link around the card: the name is every line, and no control fits inside.">
          <a href="#project" onClick={noop} className="block rounded-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Storefront</CardTitle>
                <CardDescription>Production · eu-west-1</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusBadge tone="success">Live</StatusBadge>
              </CardContent>
            </Card>
          </a>
        </Example>
      </div>
    </Section>
  ),
};

export const ControlsAboveTheLink: Story = {
  name: '3 · Controls stay above the link',
  render: () => (
    <Section
      title="A menu or copy button inside the card keeps its own click"
      intro="Buttons, menus, links, Tooltip triggers, IdChip and CopyableText inside a linked card are lifted above the stretched link: they keep their own click and their own tab stop, after the link. Give any other element that must stay hoverable `data-card-control`. Every action in the card's menu is also on the page the card opens."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="The “…” menu sits in CardAction. Tab reaches the link, then the menu.">
          <ProjectCard name="Wholesale portal" region="Staging · us-east-1" />
        </Example>
        <Example verdict="do" caption="A card that opens nothing has no CardLink, so it shows no hover and no pointer.">
          <Card>
            <CardHeader>
              <CardTitle>Usage this month</CardTitle>
              <CardDescription>12,480 orders</CardDescription>
            </CardHeader>
          </Card>
        </Example>
      </div>
    </Section>
  ),
};
