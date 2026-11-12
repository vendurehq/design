import type { Meta, StoryObj } from '@storybook/react';
import { CircleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../src/components/atoms/alert.tsx';
import { uiGuidanceById } from '../guidance/catalog.ts';

/**
 * Guidance, not props. Which Alert variant a notice gets: tone follows the
 * consequence for the viewer, as in the state dictionary (see StatusBadge /
 * Guidance). For the variants themselves, see the Alert stories.
 */
const meta = {
  title: 'Atoms/Feedback/Alert/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const guidance = uiGuidanceById.alert;

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
// ── 1 · choosing the variant ─────────────────────────────────────────────────

export const ChoosingTheVariant: Story = {
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
        title="Warning asks for action; info states a fact"
        intro="A sending limit the user must raise is a risk they own. A maintenance window is a fact with no valence."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Warning names the risk and the action. The variant tints the fill and border and colours the icon; the title and description stay neutral."
          >
            <Alert variant="warning">
              <AlertTitle>Sending limit almost reached</AlertTitle>
              <AlertDescription>92 of 100 emails sent today. Upgrade to keep sending.</AlertDescription>
            </Alert>
          </Example>
          <Example
            verdict="do"
            caption="Info for a fact worth noticing. Nothing is wrong and nothing is required."
          >
            <Alert variant="info">
              <AlertTitle>Scheduled maintenance</AlertTitle>
              <AlertDescription>The region is updated on Sunday at 02:00 UTC.</AlertDescription>
            </Alert>
          </Example>
        </div>
      </Section>

      <Section
        title="Tone is not volume"
        intro="A routine notice gets no tone. A failure is destructive, not warning."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="dont"
            caption="A saved-changes notice has no consequence. Warning here makes the real warnings easier to ignore."
          >
            <Alert variant="warning">
              <AlertTitle>Changes saved</AlertTitle>
              <AlertDescription>Your settings were updated.</AlertDescription>
            </Alert>
          </Example>
          <Example
            verdict="dont"
            caption="A default Alert with a hand-colored icon. Use the variant: it tints the fill and border and colours the icon, and the title and description stay neutral."
          >
            <Alert>
              <CircleAlertIcon className="text-warning" />
              <AlertTitle>Sending limit almost reached</AlertTitle>
              <AlertDescription>92 of 100 emails sent today.</AlertDescription>
            </Alert>
          </Example>
        </div>
      </Section>

      <Section
        title="A toned Alert carries its tone icon"
        intro="The tint is faint, so the icon is the cue that names the tone. The warning tint is never the only cue. A toned Alert shows its tone icon by itself: the same shape as the StatusBadge of that tone. Pass no icon for these tones. Pass one only for a notice that needs another shape, such as a spinner for work in progress."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="No icon passed: the variant shows its tone icon, first, in the tone's colour.">
            <Alert variant="warning">
              <AlertTitle>Sending limit almost reached</AlertTitle>
              <AlertDescription>92 of 100 emails sent today. Upgrade to keep sending.</AlertDescription>
            </Alert>
          </Example>
          <Example
            verdict="dont"
            caption="icon={false}: the faint tint alone does not say that this is a warning."
          >
            <Alert variant="warning" icon={false}>
              <AlertTitle>Sending limit almost reached</AlertTitle>
              <AlertDescription>92 of 100 emails sent today. Upgrade to keep sending.</AlertDescription>
            </Alert>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
