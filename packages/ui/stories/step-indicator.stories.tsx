import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Card } from '../src/components/atoms/card.tsx';
import { CodeBlock } from '../src/components/molecules/code-block.tsx';
import {
  StepIndicator,
  StepIndicatorContent,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
  type StepState,
} from '../src/components/molecules/step-indicator.tsx';

const meta = {
  title: 'Molecules/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATES: StepState[] = ['done', 'current', 'running', 'failed', 'upcoming'];

/** The step states the indicator shows the user, from the step index the flow is on. */
function statesAt(count: number, at: number, last: 'current' | 'running' = 'current'): StepState[] {
  return Array.from({ length: count }, (_, i) => (i < at ? 'done' : i === at ? last : 'upcoming'));
}

// ── Horizontal ──────────────────────────────────────────────────────────────

const SIGNUP = ['Account', 'Organization', 'Plan'];

// Signup, on its second step: a numbered track of three steps. The first is
// done, the second is where the user is.
export const SignupTrack: Story = {
  render: () => (
    <div className="max-w-md">
      <StepIndicator aria-label="Signup steps">
        {SIGNUP.map((name, i) => (
          <StepIndicatorStep key={name} state={statesAt(SIGNUP.length, 1)[i]}>
            <StepIndicatorTitle>{name}</StepIndicatorTitle>
          </StepIndicatorStep>
        ))}
      </StepIndicator>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Signup steps' });
    await expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(3);
    await expect(items[1]).toHaveAttribute('aria-current', 'step');
    await expect(items[0]).not.toHaveAttribute('aria-current');
    await expect(items[0]).toHaveTextContent('Account, done');
    // The bars are decoration: the state words carry the meaning.
    await expect(within(list).queryAllByRole('progressbar')).toHaveLength(0);
  },
};

type DeployStep = { name: string; state: StepState; time?: string };

function DeploymentSteps({ steps }: { steps: DeployStep[] }) {
  return (
    <Card className="max-w-2xl px-4 py-4">
      <StepIndicator aria-label="Deployment steps" marker="icon">
        {steps.map((step) => (
          <StepIndicatorStep key={step.name} state={step.state}>
            <StepIndicatorTitle>{step.name}</StepIndicatorTitle>
            <StepIndicatorDescription>{step.time ?? ' '}</StepIndicatorDescription>
          </StepIndicatorStep>
        ))}
      </StepIndicator>
    </Card>
  );
}

// A deployment while it builds: the queue and checkout are done, the build
// runs (the only spinner), the rest wait their turn.
export const DeploymentRunning: Story = {
  render: () => (
    <DeploymentSteps
      steps={[
        { name: 'Queued', state: 'done', time: '4s' },
        { name: 'Checkout', state: 'done', time: '6s' },
        { name: 'Build', state: 'running', time: '1m 12s' },
        { name: 'Deploy', state: 'upcoming' },
        { name: 'Live', state: 'upcoming' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(canvasElement.querySelectorAll('.animate-spin-slow')).toHaveLength(1);
  },
};

// The same deployment after the build failed: the flow stops at the failed
// step, and the steps after it never start.
export const DeploymentFailed: Story = {
  render: () => (
    <DeploymentSteps
      steps={[
        { name: 'Queued', state: 'done', time: '4s' },
        { name: 'Checkout', state: 'done', time: '6s' },
        { name: 'Build', state: 'failed', time: '2m 40s' },
        { name: 'Deploy', state: 'upcoming' },
        { name: 'Live', state: 'upcoming' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole('listitem');
    await expect(items[2]).toHaveTextContent('Build, failed');
    await expect(canvasElement.querySelector('[aria-current]')).toBeNull();
    await expect(canvasElement.querySelectorAll('.animate-spin-slow')).toHaveLength(0);
  },
};

// ── Vertical ────────────────────────────────────────────────────────────────

// A first-run guide: numbered steps one under the other, the current one with
// its actions. Done steps say what they left behind.
export const VerticalGuide: Story = {
  render: () => (
    <Card className="max-w-lg px-5 py-5">
      <StepIndicator orientation="vertical" aria-label="Get your project live">
        <StepIndicatorStep state="done">
          <StepIndicatorTitle render={<h3 />}>Connect a repository</StepIndicatorTitle>
          <StepIndicatorDescription>acme/storefront, branch main.</StepIndicatorDescription>
        </StepIndicatorStep>
        <StepIndicatorStep state="current">
          <StepIndicatorTitle render={<h3 />}>Deploy the first build</StepIndicatorTitle>
          <StepIndicatorDescription>
            Cloud builds the newest commit of main and deploys it.
          </StepIndicatorDescription>
          <StepIndicatorContent className="flex gap-2">
            <Button size="sm">Deploy</Button>
            <Button size="sm" variant="ghost">
              Use the CLI
            </Button>
          </StepIndicatorContent>
        </StepIndicatorStep>
        <StepIndicatorStep state="upcoming">
          <StepIndicatorTitle render={<h3 />}>Add a domain</StepIndicatorTitle>
          <StepIndicatorDescription>Point your own domain at the storefront.</StepIndicatorDescription>
        </StepIndicatorStep>
      </StepIndicator>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    await expect(canvas.getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
    // The actions of the current step are in the tab order.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Deploy' })).toHaveFocus();
  },
};

// A CLI guide: icon markers and a command under each step.
export const VerticalWithCommands: Story = {
  render: () => (
    <div className="max-w-lg">
      <StepIndicator orientation="vertical" marker="icon" aria-label="Deploy from the CLI">
        <StepIndicatorStep state="done">
          <StepIndicatorTitle>Install the CLI</StepIndicatorTitle>
          <StepIndicatorContent>
            <CodeBlock language="bash">{'npm install -g @vendure/cloud'}</CodeBlock>
          </StepIndicatorContent>
        </StepIndicatorStep>
        <StepIndicatorStep state="running">
          <StepIndicatorTitle>Sign in</StepIndicatorTitle>
          <StepIndicatorDescription>Waiting for the browser to confirm.</StepIndicatorDescription>
        </StepIndicatorStep>
        <StepIndicatorStep state="upcoming">
          <StepIndicatorTitle>Deploy</StepIndicatorTitle>
          <StepIndicatorContent>
            <CodeBlock language="bash">{'vendure deploy'}</CodeBlock>
          </StepIndicatorContent>
        </StepIndicatorStep>
      </StepIndicator>
    </div>
  ),
};

// ── States ──────────────────────────────────────────────────────────────────

const LABELS: Record<StepState, string> = {
  done: 'Done',
  current: 'Current',
  running: 'Running',
  failed: 'Failed',
  upcoming: 'Upcoming',
};

// Every state in both markers and both orientations. Only running spins; a
// current step that waits is blue with no icon.
export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-8">
      {(['number', 'icon'] as const).map((marker) => (
        <div key={marker} className="flex flex-col gap-6">
          <StepIndicator marker={marker} aria-label={`States, ${marker} markers`}>
            {STATES.map((state) => (
              <StepIndicatorStep key={state} state={state}>
                <StepIndicatorTitle>{LABELS[state]}</StepIndicatorTitle>
              </StepIndicatorStep>
            ))}
          </StepIndicator>
          <StepIndicator
            orientation="vertical"
            marker={marker}
            aria-label={`States, vertical, ${marker} markers`}
          >
            {STATES.map((state) => (
              <StepIndicatorStep key={state} state={state}>
                <StepIndicatorTitle>{LABELS[state]}</StepIndicatorTitle>
              </StepIndicatorStep>
            ))}
          </StepIndicator>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // One spinner per indicator: the running step.
    await expect(canvasElement.querySelectorAll('.animate-spin-slow')).toHaveLength(4);
    for (const li of canvasElement.querySelectorAll('li[data-state=current]')) {
      await expect(li.querySelector('[data-slot=step-indicator-marker] svg')).toBeNull();
    }
  },
};

// ── Motion ──────────────────────────────────────────────────────────────────

const DEPLOY = ['Build', 'Deploy', 'Live'];

/** The CSS transitions running inside an element. */
function transitionsIn(element: Element) {
  return document
    .getAnimations()
    .filter(
      (a) =>
        a instanceof CSSTransition &&
        a.effect instanceof KeyframeEffect &&
        a.effect.target instanceof Element &&
        element.contains(a.effect.target),
    );
}

// Nothing moves when the steps first show. Each click moves the flow on: the
// finished step's tick scales in, the next step's bar fills and its spinner
// fades in. With reduced motion, the glyphs only fade and the bars change at
// once.
export const Advancing: Story = {
  render: function Render() {
    const [at, setAt] = useState(0);
    const states = statesAt(DEPLOY.length, at, 'running');
    return (
      <div className="flex max-w-md flex-col items-start gap-6">
        <StepIndicator marker="icon" aria-label="Deployment steps" className="w-full">
          {DEPLOY.map((name, i) => (
            <StepIndicatorStep key={name} state={states[i]}>
              <StepIndicatorTitle>{name}</StepIndicatorTitle>
            </StepIndicatorStep>
          ))}
        </StepIndicator>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAt((value) => (value + 1) % (DEPLOY.length + 1))}
        >
          Next step
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list', { name: 'Deployment steps' });
    await expect(transitionsIn(list)).toHaveLength(0);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Next step' }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Build, done');
    await expect(within(list).getAllByRole('listitem')[1]).toHaveAttribute('aria-current', 'step');
    await waitFor(() => expect(transitionsIn(list).length).toBeGreaterThan(0));
  },
};
