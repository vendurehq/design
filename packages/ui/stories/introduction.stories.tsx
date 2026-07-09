import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * The front door to the Vendure Design System. It says what the two packages
 * are, how this Storybook is organized, and how to start consuming it. Read
 * this first, then work down the sidebar: Foundations, Atoms, Molecules.
 */
const meta = {
  title: 'Introduction',
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

function Card({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm font-medium">{heading}</div>
      <p className="text-muted-foreground mt-1 text-xs">{children}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const PACKAGES: { name: string; role: string; body: string }[] = [
  {
    name: '@vendure-io/design-tokens',
    role: 'The visual language',
    body: 'Color, type, radius, and motion as CSS variables and a Tailwind v4 @theme. Components never hard-code values; they read named slots that point into graded ramps, so a theme change moves the whole system at once.',
  },
  {
    name: '@vendure-io/ui',
    role: 'The components',
    body: 'React components built on shadcn/ui (base-vega), Base UI, and Tailwind v4. It ships raw .tsx source with no build step, so every merge is consumer-facing and consumers transpile the package themselves.',
  },
];

const AREAS: { area: string; body: string }[] = [
  {
    area: 'Foundations',
    body: 'The principles the system is built on: accent rationing (neutral by default) and the subtle tier. Start here; every component decision points back to these.',
  },
  {
    area: 'Atoms',
    body: 'shadcn-CLI-managed primitives: Button, Input, Dialog, Select. Kept close to their upstream so they stay updatable, and modified only where the system needs it.',
  },
  {
    area: 'Molecules',
    body: 'Composed components the system owns outright: StatusBadge, EmptyState, PageHeader, DataTable. Hand-written, with no upstream to sync against.',
  },
  {
    area: 'Guidance pages',
    body: 'Many molecules ship a Guidance page next to their API stories. It rules on the decisions the API cannot: when to reach for this component over a sibling, and the do and don’t of using it.',
  },
];

const CSS_SETUP = `/* your app's main CSS file */
@import "@vendure-io/design-tokens/css/theme";
@import "@vendure-io/design-tokens/css/fonts";
@source "../../node_modules/@vendure-io/ui/src";`;

// ── the page ──────────────────────────────────────────────────────────────────

export const Overview: Story = {
  name: 'Overview',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <header className="mb-12 border-b pb-8">
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-wide">
          Vendure Design System
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          The shared visual language for every Vendure surface.
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
          Design tokens and React components built on shadcn/ui, Base UI, and Tailwind v4. One
          system, consumed across Vendure applications and ecosystem surfaces, so the same state
          looks the same wherever it appears.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            @vendure-io/design-tokens
          </Badge>
          <Badge variant="outline" className="font-mono">
            @vendure-io/ui
          </Badge>
        </div>
      </header>

      <Section
        title="Two packages, versioned independently"
        intro="The system splits cleanly in two: the tokens that define the look, and the components that wear it. They publish separately, so a token change and a component change can ship on their own cadence."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKAGES.map(({ name, role, body }) => (
            <div key={name} className="rounded-lg border p-4">
              <div className="font-mono text-xs">{name}</div>
              <div className="mt-2 text-sm font-medium">{role}</div>
              <p className="text-muted-foreground mt-1 text-xs">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="How this Storybook is organized"
        intro="The sidebar is a reading order, not just a catalog. Work down it: the principles first, then the primitives, then the composed components that put them to work."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {AREAS.map(({ area, body }) => (
            <Card key={area} heading={area}>
              {body}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="One principle runs through all of it"
        intro="Accent rationing is the rule every color decision answers to: neutral by default, tone for state, brand only for a deliberate identity moment a component opts into. Read it once and the rest of the system reads as consistent."
      >
        <div className="rounded-lg border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Neutral by default</Badge>
            <StatusBadge tone="success" dot>
              Tone for state
            </StatusBadge>
            <Badge variant="brand">Brand for identity</Badge>
            <Button size="sm" variant="outline">
              One primary action per view
            </Button>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            See Foundations / Accent Rationing for the full reference, and Foundations / Subtle Tier
            for how tones render softly.
          </p>
        </div>
      </Section>

      <Section
        title="Using it in an app"
        intro="Two published packages, one CSS entry point. Add both to your app, then import the theme, fonts, and shadcn base into your main stylesheet."
      >
        <div className="space-y-3">
          <pre className="bg-muted overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">
            <code>npm install @vendure-io/design-tokens @vendure-io/ui</code>
          </pre>
          <pre className="bg-muted overflow-x-auto rounded-lg border p-4 font-mono text-xs leading-relaxed">
            <code>{CSS_SETUP}</code>
          </pre>
          <p className="text-muted-foreground text-sm">
            The full setup (Next.js and Vite config, self-hosted fonts, dark mode) is in the
            getting-started guide in the repo docs. Prerequisites: React 19 and Tailwind CSS v4.
          </p>
        </div>
      </Section>
    </div>
  ),
};
