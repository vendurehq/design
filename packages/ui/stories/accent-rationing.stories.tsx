import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. Accent rationing is the color principle the whole system
 * is built on: neutral by default, tone for state, brand only for the rare
 * identity moment a component opts into. This page is the "when brand vs
 * neutral" reference every other color decision points back at.
 */
const meta = {
  title: 'Foundations/Accent Rationing',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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

// ── the three roles color plays ──────────────────────────────────────────────

export const ThreeRoles: Story = {
  name: '1 · Three roles for color',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Neutral by default, tone for state, brand for identity"
        intro="Color earns its place. Every element is neutral until it has a reason not to be. Two reasons qualify: it reports a state, or it is a deliberate identity moment. Nothing else gets color."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <Badge>Draft</Badge>
            <p className="mt-3 text-sm font-medium">Neutral is the default</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Most of the interface: text, controls, classification chips, counts. Contrast between
              surfaces separates content, not color.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <StatusBadge tone="success" dot>
              Active
            </StatusBadge>
            <p className="mt-3 text-sm font-medium">Tone carries state</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Success, warning, critical, info, progress. Color here means something can go right or
              wrong. See the state dictionary for the full vocabulary.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <Badge variant="brand">Partner</Badge>
            <p className="mt-3 text-sm font-medium">Brand is rationed</p>
            <p className="text-muted-foreground mt-1 text-xs">
              The Vendure blue is a signature, not a highlighter. A component opts into it
              explicitly for an identity label; it is never a default.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};

// ── one primary action per view ──────────────────────────────────────────────

export const OnePrimaryPerView: Story = {
  name: '2 · One primary action per view',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One primary action per view"
        intro="A view has a single most-important action. It gets the one filled Button; everything else steps down to outline or ghost. When every button is filled, none of them reads as primary and the eye has nowhere to land."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One filled action, supporting actions stepped down. The primary reads at a glance."
          >
            <Button>Save changes</Button>
            <Button variant="outline">Cancel</Button>
            <Button variant="ghost">Reset</Button>
          </Example>
          <Example
            verdict="dont"
            caption="Three filled buttons compete. Equal weight means no priority; the view loses its focal point."
          >
            <Button>Save changes</Button>
            <Button>Cancel</Button>
            <Button>Reset</Button>
          </Example>
        </div>
      </Section>

      <Section
        title="Primary is a strong neutral, not brand"
        intro="The filled Button uses the primary slot, which is a dark neutral. Brand blue is a further step reserved for identity, so a page full of primary actions still stays off the brand color."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </Section>
    </div>
  ),
};

// ── brand is opt-in ──────────────────────────────────────────────────────────

export const BrandIsOptIn: Story = {
  name: '3 · Brand is opt-in',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Brand marks identity, not emphasis"
        intro="Reach for the brand color only when the meaning is identity: a partner tier, an account signature, a moment that is unmistakably Vendure. Using it to make an ordinary chip or button stand out spends the signature on noise."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Brand marks the one identity label; the classification chips beside it stay neutral."
          >
            <Badge variant="brand">Partner</Badge>
            <Badge>Production</Badge>
            <Badge>EU region</Badge>
          </Example>
          <Example
            verdict="dont"
            caption="Brand on every chip turns a signature into wallpaper; nothing is distinguished."
          >
            <Badge variant="brand">Production</Badge>
            <Badge variant="brand">EU region</Badge>
            <Badge variant="brand">v2</Badge>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
