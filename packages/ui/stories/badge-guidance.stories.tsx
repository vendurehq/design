import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';

/**
 * Guidance, not props. When to reach for a Badge, which variant to pick, and
 * why the default is neutral. For the state-carrying sibling, see StatusBadge
 * and its guidance page.
 */
const meta = {
  title: 'Atoms/General/Badge/Guidance',
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

const VARIANTS: { variant: 'default' | 'outline' | 'brand' | 'destructive'; use: string }[] = [
  { variant: 'default', use: 'The everyday chip: classifications, kinds, counts, tags.' },
  { variant: 'outline', use: 'A quieter classification when even a filled neutral is too much.' },
  { variant: 'brand', use: 'A deliberate identity label (a partner tier). Opt-in, never routine.' },
  {
    variant: 'destructive',
    use: 'A genuinely negative attribute of the thing itself, not a state. Rare.',
  },
];

// ── badge vs statusbadge ─────────────────────────────────────────────────────

export const BadgeVsStatusBadge: Story = {
  name: '1 · Badge vs StatusBadge',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Can it go wrong? Then it is a state"
        intro="Badge labels what a thing is: a kind, an environment, a role, a count, a tag. StatusBadge reports what condition a thing is in: something that can succeed, fail, or be in motion. If the label can go wrong, it is a state and belongs on StatusBadge with a tone."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Classification stays on a neutral Badge; the condition next to it carries a tone."
          >
            <Badge>Production</Badge>
            <StatusBadge tone="success" dot>
              Healthy
            </StatusBadge>
          </Example>
          <Example
            verdict="dont"
            caption="A state forced onto a Badge loses the tone vocabulary and the dictionary contract."
          >
            <Badge variant="destructive">Failed</Badge>
            <Badge variant="default">Deploying</Badge>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── why neutral is the default ───────────────────────────────────────────────

export const WhyNeutralDefault: Story = {
  name: '2 · Why the default is neutral',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The default flipped to neutral"
        intro="The Badge default used to be a solid brand chip. In a list where most rows carry a badge, a brand default paints the whole screen blue and the identity signal disappears. The default is now neutral: brand is an explicit variant you opt into for the one chip that earns it."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Neutral by default; brand spent on the single identity chip that means something."
          >
            <Badge variant="brand">Partner</Badge>
            <Badge>Production</Badge>
            <Badge>Read only</Badge>
            <Badge>v2</Badge>
          </Example>
          <Example
            verdict="dont"
            caption="Brand as the default drowns the signature; every chip shouts, so none is heard."
          >
            <Badge variant="brand">Partner</Badge>
            <Badge variant="brand">Production</Badge>
            <Badge variant="brand">Read only</Badge>
            <Badge variant="brand">v2</Badge>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── variant selection ────────────────────────────────────────────────────────

export const ChoosingAVariant: Story = {
  name: '3 · Choosing a variant',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Choosing a variant"
        intro="Start at default and step away only for a reason. Note that primary, ghost, and link variants exist for parity with Button but are rarely the right call on a chip."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Variant</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {VARIANTS.map(({ variant, use }) => (
                <tr key={variant} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{variant}</td>
                  <td className="p-3">
                    <Badge variant={variant}>
                      {variant === 'brand'
                        ? 'Partner'
                        : variant === 'destructive'
                          ? 'Revoked'
                          : 'Label'}
                    </Badge>
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
