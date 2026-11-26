import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Checklist,
  ChecklistStep,
  ChecklistStepAction,
  ChecklistStepDescription,
  ChecklistStepLabel,
} from '../src/components/molecules/checklist/checklist.tsx';

/**
 * Guidance, not props. When a list of steps is a Checklist rather than a
 * Timeline or a Progress bar, which mode marks steps done, and when the
 * checklist goes away. For the component API, see the Checklist stories.
 */
const meta = {
  title: 'Molecules/Checklist/Guidance',
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

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'Checklist',
    use: 'A short set of steps the person completes, in any order, each with its own action: set up a store, finish a project. Progress is how many are done.',
  },
  {
    tool: 'Timeline',
    use: 'What already happened to one thing, newest first: a deployment, an order. Nothing to complete.',
  },
  {
    tool: 'Progress',
    use: 'One task the system runs, with a known or unknown length: an import, an upload. No steps for the person to do.',
  },
  {
    tool: 'ListRow',
    use: 'A list of items to open. Done or not is a state of each item, shown with a StatusBadge.',
  },
];

const MODES: { mode: string; use: string }[] = [
  {
    mode: 'system (default)',
    use: 'The app can tell a step is done from its own data: a channel exists, a token is active. The step shows a tick, not a checkbox, so nobody can claim progress the app cannot verify.',
  },
  {
    mode: 'manual',
    use: 'Only the person knows: "Read the launch guide", "Tell your team". The checkbox is theirs. A step they check off waits on its row until the pointer leaves, so a mis-click is undone in place.',
  },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · Checklist vs Timeline vs Progress',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Steps the person completes"
        intro="A Checklist is for work the person still has to do. Use a Timeline for what has happened and a Progress bar for work the system does."
      >
        <ChoiceTable head="Tool" rows={CHOICES.map(({ tool, use }) => [tool, use])} />
      </Section>
    </div>
  ),
};

// ── 2 · who marks a step done ────────────────────────────────────────────────

export const WhoMarksDone: Story = {
  name: '2 · System or manual',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Let the data decide when it can"
        intro="Pick the mode by who knows the step is done. Do not mix a checkbox into a step the app verifies."
      >
        <ChoiceTable head="Mode" rows={MODES.map(({ mode, use }) => [mode, use])} />
      </Section>
    </div>
  ),
};

// ── 3 · one action per step ──────────────────────────────────────────────────

export const OneAction: Story = {
  name: '3 · One action per open step',
  render: () => (
    <div className="text-foreground grid max-w-4xl gap-4 p-1 md:grid-cols-2">
      <Example
        verdict="do"
        caption="One secondary action takes the person to where the step is done. The page keeps its own primary action."
      >
        <Checklist title="Set up your store" headingLevel={3}>
          <ChecklistStep id="product" done={false}>
            <ChecklistStepLabel>Add your first product</ChecklistStepLabel>
            <ChecklistStepDescription>Give it a name and a price.</ChecklistStepDescription>
            <ChecklistStepAction>
              <Button size="sm" variant="secondary">
                Add product
              </Button>
            </ChecklistStepAction>
          </ChecklistStep>
        </Checklist>
      </Example>
      <Example
        verdict="dont"
        caption="A primary button in every row competes with the page. Two actions in one step split it: make it two steps."
      >
        <Checklist title="Set up your store" headingLevel={3}>
          <ChecklistStep id="product" done={false}>
            <ChecklistStepLabel>Add your first product</ChecklistStepLabel>
            <ChecklistStepDescription>Give it a name and a price.</ChecklistStepDescription>
            <ChecklistStepAction className="gap-2">
              <Button size="sm">Add product</Button>
              <Button size="sm">Import</Button>
            </ChecklistStepAction>
          </ChecklistStep>
        </Checklist>
      </Example>
    </div>
  ),
};

// ── 4 · when it goes away ────────────────────────────────────────────────────

export const Dismissal: Story = {
  name: '4 · When the checklist goes away',
  render: () => (
    <div className="text-foreground max-w-2xl p-1">
      <Section
        title="Dismiss only when every step is done"
        intro="The dismiss button shows once the last step is done; remove the Checklist in onDismiss and remember the choice. Until then the open steps and their actions stay in view: a half-done setup is not something to hide."
      >
        <Checklist title="Set up your store" headingLevel={3} onDismiss={() => {}}>
          <ChecklistStep id="product" done>
            <ChecklistStepLabel>Add your first product</ChecklistStepLabel>
          </ChecklistStep>
          <ChecklistStep id="shipping" done>
            <ChecklistStepLabel>Set up a shipping method</ChecklistStepLabel>
          </ChecklistStep>
        </Checklist>
      </Section>
    </div>
  ),
};

function ChoiceTable({ head, rows }: { head: string; rows: [string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
            <th className="p-3 font-medium">{head}</th>
            <th className="p-3 font-medium">Use for</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, use]) => (
            <tr key={name} className="border-b align-top last:border-0">
              <td className="p-3 font-mono text-xs">{name}</td>
              <td className="text-muted-foreground p-3 text-xs">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
