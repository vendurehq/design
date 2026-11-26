import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Card } from '../src/components/atoms/card.tsx';
import {
  StepIndicator,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
  type StepState,
} from '../src/components/molecules/step-indicator.tsx';

/**
 * Guidance, not props. When an ordered flow takes a StepIndicator rather than
 * a Checklist or a Timeline, which state a step is in, and which marker and
 * orientation to pick. For the component API, see the StepIndicator stories.
 */
const meta = {
  title: 'Molecules/StepIndicator/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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
      <div className="flex flex-col gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

function ChoiceTable({ head, rows }: { head: [string, string]; rows: [string, string][] }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
            <th className="p-3 font-medium">{head[0]}</th>
            <th className="p-3 font-medium">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b]) => (
            <tr key={a} className="border-b align-top last:border-0">
              <td className="p-3 font-mono text-xs">{a}</td>
              <td className="text-muted-foreground p-3 text-xs">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Track({
  steps,
  marker = 'icon',
  label,
}: {
  steps: { name: string; state: StepState; note?: string }[];
  marker?: 'number' | 'icon';
  label: string;
}) {
  return (
    <Card className="px-4 py-4">
      <StepIndicator marker={marker} aria-label={label}>
        {steps.map((s) => (
          <StepIndicatorStep key={s.name} state={s.state}>
            <StepIndicatorTitle>{s.name}</StepIndicatorTitle>
            {s.note ? <StepIndicatorDescription>{s.note}</StepIndicatorDescription> : null}
          </StepIndicatorStep>
        ))}
      </StepIndicator>
    </Card>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: [string, string][] = [
  [
    'StepIndicator',
    'An ordered flow: the user or the system goes through the steps one after the other, and the indicator shows where the flow stands. Signup, the build and deploy steps of a deployment, a first-run guide.',
  ],
  [
    'Checklist',
    'Tasks the user ticks off in any order, such as setting up a project. Each task has a checkbox or a tick; done tasks move to a Completed group. No step comes first.',
  ],
  [
    'Timeline',
    'What already happened to one thing, newest first. Events, not steps: nothing in a Timeline is still to come.',
  ],
];

const STATES: [string, string][] = [
  ['upcoming', 'Not reached yet. The empty track and a muted title.'],
  [
    'current',
    'The step the flow is on, waiting for the user or the system. Blue with no spinner: a waiting step can wait for days and must not look like it is loading.',
  ],
  ['running', 'Work on this step is happening now: a build, a deploy. The only state that spins.'],
  ['done', 'Finished. The success tick and a green bar.'],
  ['failed', 'The flow stopped here. The steps after it stay upcoming.'],
];

const LAYOUTS: [string, string][] = [
  [
    'horizontal + number',
    'A short flow the user goes through, such as signup: three to five steps, the number tells how far along they are.',
  ],
  [
    'horizontal + icon',
    'Steps the system runs, such as a deployment: the state icon says more than a number. A time under each step.',
  ],
  [
    'vertical + number',
    'A guide with content under each step: the actions of the current step, a description of what a done step left behind.',
  ],
  ['vertical + icon', 'A guide whose steps the system confirms, such as a CLI sign-in.'],
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · StepIndicator vs Checklist vs Timeline',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="An ordered flow, not a to-do list"
        intro="A StepIndicator shows where an ordered flow stands. When the user can do the tasks in any order, use a Checklist. When the lines are things that already happened, use a Timeline."
      >
        <ChoiceTable head={['Tool', 'Use for']} rows={CHOICES} />
        <div className="grid gap-4 md:grid-cols-2">
          <Example verdict="do" caption="Signup goes one step after the other: a numbered track.">
            <Track
              label="Signup steps"
              marker="number"
              steps={[
                { name: 'Account', state: 'done' },
                { name: 'Organization', state: 'current' },
                { name: 'Plan', state: 'upcoming' },
              ]}
            />
          </Example>
          <Example
            verdict="dont"
            caption="Setup tasks the user can do in any order are a Checklist, not numbered steps."
          >
            <Track
              label="Setup tasks"
              marker="number"
              steps={[
                { name: 'Invite your team', state: 'upcoming' },
                { name: 'Add a domain', state: 'upcoming' },
                { name: 'Set up billing', state: 'upcoming' },
              ]}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · states ───────────────────────────────────────────────────────────────

export const States: Story = {
  name: '2 · Waiting is not running',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Only work happening now spins"
        intro="Pick the state from what the step is doing. A step that waits for the user or for a queue is current: blue, still. A step whose work runs right now is running. The state is also said in words to screen readers, so colour and shape are never the only cue."
      >
        <ChoiceTable head={['State', 'When']} rows={STATES} />
        <div className="grid gap-4 md:grid-cols-2">
          <Example verdict="do" caption="The deployment waits in the queue: blue and still.">
            <Track
              label="Queued deployment"
              steps={[
                { name: 'Queued', state: 'current', note: 'Waiting' },
                { name: 'Build', state: 'upcoming' },
                { name: 'Deploy', state: 'upcoming' },
              ]}
            />
          </Example>
          <Example verdict="dont" caption="A spinner on a queued step reads as loading, for as long as it waits.">
            <Track
              label="Queued deployment, spinning"
              steps={[
                { name: 'Queued', state: 'running', note: 'Waiting' },
                { name: 'Build', state: 'upcoming' },
                { name: 'Deploy', state: 'upcoming' },
              ]}
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · layout ───────────────────────────────────────────────────────────────

export const Layout: Story = {
  name: '3 · Orientation and marker',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A track for progress, a guide for content"
        intro="Horizontal when the steps only need a name and a time. Vertical when a step holds content: actions, a command, a note. Numbers when the user goes through the steps; icons when the system runs them."
      >
        <ChoiceTable head={['Pick', 'When']} rows={LAYOUTS} />
      </Section>
    </div>
  ),
};
