import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Progress, ProgressLabel, ProgressValue } from '../src/components/atoms/progress.tsx';
import { uiGuidanceById } from '../guidance/catalog.ts';

/**
 * Guidance, not props. When a Progress bar takes a tone: tone follows the
 * consequence of the level, not the fill alone (see StatusBadge / Guidance).
 * For the tones themselves, see the Progress stories.
 */
const meta = {
  title: 'Atoms/Data Display/Progress/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const guidance = uiGuidanceById.progress;

// ── shared primitives ───────────────────────────────────────────────────────

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
// ── 1 · choosing the tone ────────────────────────────────────────────────────

export const ChoosingTheTone: Story = {
  name: '1 · Tone follows consequence',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section title={guidance.title} intro={guidance.summary}>
        <ul className="space-y-3">
          {guidance.rules.map((rule) => (
            <li key={rule.title} className="border-l-2 pl-3">
              <p className="text-sm font-medium">{rule.title}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">{rule.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Meters tone near the limit; tasks stay default"
        intro="A usage meter has a limit the user must act on. A task bar only says how far the work has come."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The sending meter turns warning near the daily limit, and the value states the amount and the limit."
          >
            <Progress tone="warning" value={92} className="w-full">
              <ProgressLabel>92 of 100 emails sent today</ProgressLabel>
              <ProgressValue />
            </Progress>
          </Example>
          <Example
            verdict="do"
            caption="At or over the limit is critical: sending has stopped until the user acts."
          >
            <Progress tone="critical" value={100} className="w-full">
              <ProgressLabel>100 of 100 emails sent today</ProgressLabel>
              <ProgressValue />
            </Progress>
          </Example>
          <Example
            verdict="dont"
            caption="A deployment at 92% is not at risk. A task bar stays default whatever its fill."
          >
            <Progress tone="warning" value={92} className="w-full">
              <ProgressLabel>Deploying</ProgressLabel>
              <ProgressValue />
            </Progress>
          </Example>
          <Example
            verdict="dont"
            caption="Color alone carries the level. Pair a toned bar with a label and value."
          >
            <Progress tone="warning" value={92} aria-label="Usage" className="w-full" />
          </Example>
        </div>
      </Section>
    </div>
  ),
};
