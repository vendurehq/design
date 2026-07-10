import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';

/**
 * Guidance, not props. Which Button variant carries which weight, and the one
 * rule that governs the whole toolbar: a single primary action per view. See
 * Foundations / Accent Rationing for the color principle behind it.
 */
const meta = {
  title: 'Atoms/General/Button/Guidance',
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

const VARIANTS: {
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  label: string;
  use: string;
}[] = [
  { variant: 'default', label: 'Save', use: 'The single primary action of the view. Only one.' },
  {
    variant: 'secondary',
    label: 'Duplicate',
    use: 'A supporting action that still deserves a filled surface.',
  },
  {
    variant: 'outline',
    label: 'Cancel',
    use: 'The common neutral action beside a primary: cancel, back, dismiss.',
  },
  {
    variant: 'ghost',
    label: 'Reset',
    use: 'Tertiary or icon actions that should recede until hovered.',
  },
  {
    variant: 'destructive',
    label: 'Delete',
    use: 'Irreversible or removing actions. Its own weight so it is never a slip.',
  },
  {
    variant: 'link',
    label: 'Learn more',
    use: 'Inline navigation that reads as text, not a control.',
  },
];

// ── one primary per view ─────────────────────────────────────────────────────

export const OnePrimaryPerView: Story = {
  name: '1 · One primary per view',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One primary action per view"
        intro="Decide the single most-important action, give it the default (filled) Button, and step every other action down. Two primaries is a decision you have not made yet."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One filled primary, neutral partners. The intended path is obvious."
          >
            <Button>Publish</Button>
            <Button variant="outline">Save draft</Button>
            <Button variant="ghost">Discard</Button>
          </Example>
          <Example
            verdict="dont"
            caption="Competing primaries. The user has to read all three to find the main path."
          >
            <Button>Publish</Button>
            <Button>Save draft</Button>
            <Button variant="destructive">Discard</Button>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── variant selection ────────────────────────────────────────────────────────

export const ChoosingAVariant: Story = {
  name: '2 · Choosing a variant',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The emphasis ladder"
        intro="Variants are an emphasis scale, not a palette. Pick by how much weight the action deserves relative to its neighbors."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Variant</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map(({ variant, label, use }) => (
                <tr key={variant} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{variant}</td>
                  <td className="p-3">
                    <Button variant={variant} size="sm">
                      {label}
                    </Button>
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

// ── brand is identity, not emphasis ──────────────────────────────────────────

export const BrandIsIdentity: Story = {
  name: '3 · Brand is identity, not emphasis',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The brand variant is an identity spend"
        intro="brand is not a step above default; it sits off the emphasis ladder entirely. Reserve it for a deliberate identity or marketing CTA (start a trial, upgrade to Cloud) where the button itself is the brand moment. Using it to make an in-app primary louder erodes the signature, the exact busy-app problem accent rationing exists to prevent."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A marketing or entry surface where the button is the brand moment. Neutral partners keep it singular."
          >
            <Button variant="brand">Start free trial</Button>
            <Button variant="outline">Contact sales</Button>
          </Example>
          <Example
            verdict="dont"
            caption='Brand used as "primary but shinier" in a routine in-app toolbar. It spends the signature on a Save button, so every screen ends up competing for attention.'
          >
            <Button variant="brand">Save</Button>
            <Button variant="outline">Cancel</Button>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
