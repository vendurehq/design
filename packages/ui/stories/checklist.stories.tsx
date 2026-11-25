import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Checklist,
  ChecklistStep,
  ChecklistStepAction,
  ChecklistStepBody,
  ChecklistStepDescription,
  ChecklistStepDetail,
  ChecklistStepGuide,
  ChecklistStepLabel,
} from '../src/components/molecules/checklist/checklist.tsx';
import { InlineCode } from '../src/components/molecules/inline-code.tsx';

const meta = {
  title: 'Molecules/Checklist',
  component: Checklist,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { title: 'Set up your store' },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

type Step = {
  id: string;
  label: string;
  description: string;
  detail?: string;
  action?: string;
  guide: string;
};

const STEPS: Step[] = [
  {
    id: 'channel',
    label: 'Create a sales channel',
    description: 'A channel holds its own prices, currencies and stock locations.',
    detail: '2 min',
    action: 'Create channel',
    guide: 'How channels work',
  },
  {
    id: 'products',
    label: 'Add your first product',
    description: 'Give it a name, a price and at least one variant.',
    detail: '5 min',
    action: 'Add product',
    guide: 'Products and variants',
  },
  {
    id: 'shipping',
    label: 'Set up a shipping method',
    description: 'Customers pick it at checkout.',
    detail: '3 min',
    action: 'Add shipping method',
    guide: 'Shipping methods',
  },
  {
    id: 'payment',
    label: 'Connect a payment provider',
    description: 'Take payments in your storefront.',
    detail: '4 min',
    action: 'Connect provider',
    guide: 'Payment integrations',
  },
  {
    id: 'team',
    label: 'Invite your team',
    description: 'Give administrators their own sign-in.',
    action: 'Invite',
    guide: 'Roles and permissions',
  },
];

function StepParts({ step }: { step: Step }) {
  return (
    <>
      <ChecklistStepLabel>{step.label}</ChecklistStepLabel>
      <ChecklistStepDescription>{step.description}</ChecklistStepDescription>
      {step.detail ? <ChecklistStepDetail>{step.detail}</ChecklistStepDetail> : null}
      <ChecklistStepGuide href="https://docs.vendure.io">{step.guide}</ChecklistStepGuide>
      {step.action ? (
        <ChecklistStepAction>
          <Button size="sm" variant="secondary">
            {step.action}
          </Button>
        </ChecklistStepAction>
      ) : null}
    </>
  );
}

// System mode, the default: the app marks a step done from its own data. Each
// step shows a tick, not a checkbox. "Complete next step" stands in for the
// app: the step strikes through and moves into Completed at once.
export const SystemDriven: Story = {
  render: (args) => {
    const [done, setDone] = useState<string[]>(['channel', 'products']);
    const next = STEPS.find((step) => !done.includes(step.id));
    return (
      <div className="flex flex-col gap-4">
        <Checklist {...args}>
          {STEPS.map((step) => (
            <ChecklistStep key={step.id} id={step.id} done={done.includes(step.id)}>
              <StepParts step={step} />
            </ChecklistStep>
          ))}
        </Checklist>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!next}
            onClick={() => next && setDone([...done, next.id])}
          >
            Complete next step
          </Button>
          <Button variant="ghost" onClick={() => setDone([])}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
    await expect(canvas.getByRole('progressbar', { name: 'Set up your store' })).toHaveAttribute(
      'aria-valuetext',
      '2 of 5',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Complete next step' }));
    const completed = canvas.getByRole('list', { name: 'Completed' });
    await waitFor(() =>
      expect(within(completed).getByText('Set up a shipping method')).toBeInTheDocument(),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('3 of 5 steps done');
  },
};

// Manual mode: the user checks a step off. It strikes through and stays in
// place while the pointer is on its row, so a mis-click can be undone there.
// It moves to Completed when the pointer leaves the row (focus, for the
// keyboard; a short pause, on touch). Unchecking a step in Completed works the
// same way back.
export const Manual: Story = {
  args: { mode: 'manual' },
  render: (args) => {
    const [done, setDone] = useState<string[]>(['channel']);
    return (
      <Checklist
        {...args}
        onStepCheckedChange={(id, checked) =>
          setDone((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
        }
      >
        {STEPS.map((step) => (
          <ChecklistStep key={step.id} id={step.id} done={done.includes(step.id)}>
            <StepParts step={step} />
          </ChecklistStep>
        ))}
      </Checklist>
    );
  },
};

// The hold rule, step by step, as an interaction test.
export const ManualHoldRule: Story = {
  ...Manual,
  name: 'Manual: hold rule (test)',
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const open = () => canvas.getByRole('list', { name: 'Set up your store' });
    const completed = () => canvas.getByRole('list', { name: 'Completed' });

    await step('checked with the pointer on the row: it stays in place', async () => {
      const box = canvas.getByRole('checkbox', { name: 'Add your first product' });
      await userEvent.click(box);
      await expect(box).toHaveAttribute('aria-checked', 'true');
      await expect(within(open()).getByText('Add your first product')).toBeInTheDocument();
    });

    await step('the pointer leaves the row: it moves to Completed', async () => {
      await userEvent.unhover(canvas.getByRole('checkbox', { name: 'Add your first product' }));
      await waitFor(() =>
        expect(within(completed()).getByText('Add your first product')).toBeInTheDocument(),
      );
      // Focus follows the step into Completed, onto its checkbox there.
      await waitFor(() =>
        expect(document.activeElement).toBe(
          within(completed()).getByRole('checkbox', { name: 'Add your first product' }),
        ),
      );
    });

    await step('checked and unchecked before leaving: no move', async () => {
      const box = canvas.getByRole('checkbox', { name: 'Set up a shipping method' });
      await userEvent.click(box);
      await userEvent.click(box);
      await userEvent.unhover(box);
      await expect(within(open()).getByText('Set up a shipping method')).toBeInTheDocument();
      await expect(box).toHaveAttribute('aria-checked', 'false');
    });

    await step('keyboard: it moves when focus leaves the row', async () => {
      const box = canvas.getByRole('checkbox', { name: 'Connect a payment provider' });
      box.focus();
      await userEvent.keyboard(' ');
      await expect(box).toHaveAttribute('aria-checked', 'true');
      await expect(within(open()).getByText('Connect a payment provider')).toBeInTheDocument();
      // Focus moves on to the row's guide link, still inside the row.
      await userEvent.tab();
      await expect(within(open()).getByText('Connect a payment provider')).toBeInTheDocument();
      // Then out of the row.
      canvas.getByRole('checkbox', { name: 'Invite your team' }).focus();
      await waitFor(() =>
        expect(within(completed()).getByText('Connect a payment provider')).toBeInTheDocument(),
      );
    });

    await step('touch: it moves after a short pause', async () => {
      const box = canvas.getByRole('checkbox', { name: 'Set up a shipping method' });
      await userEvent.pointer([{ keys: '[TouchA]', target: box }]);
      await expect(box).toHaveAttribute('aria-checked', 'true');
      await expect(within(open()).getByText('Set up a shipping method')).toBeInTheDocument();
      await waitFor(
        () =>
          expect(within(completed()).getByText('Set up a shipping method')).toBeInTheDocument(),
        { timeout: 2000 },
      );
    });

    await step('a click on the label toggles the step', async () => {
      await userEvent.click(canvas.getByText('Invite your team'));
      await expect(canvas.getByRole('checkbox', { name: 'Invite your team' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });
  },
};

// Every step done: the bar turns green and a dismiss button shows. The
// Checklist does not hide itself; the app removes it in `onDismiss`.
export const AllDone: Story = {
  render: (args) => {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) {
      return (
        <Button variant="outline" onClick={() => setDismissed(false)}>
          Show the checklist again
        </Button>
      );
    }
    return (
      <Checklist {...args} onDismiss={() => setDismissed(true)}>
        {STEPS.map((step) => (
          <ChecklistStep key={step.id} id={step.id} done>
            <StepParts step={step} />
          </ChecklistStep>
        ))}
      </Checklist>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss checklist' }));
    await expect(canvas.queryByRole('region', { name: 'Set up your store' })).toBeNull();
  },
};

// The Completed group starts closed. A step that turns done fades out of the
// open list and folds its height, so the card closes up smoothly; the group's
// count goes up.
export const CompletedClosed: Story = {
  args: { defaultCompletedOpen: false },
  render: SystemDriven.render,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('region', { name: 'Set up your store' });

    await step('a step that turns done folds: the card shrinks over frames', async () => {
      const start = card.getBoundingClientRect().height;
      await userEvent.click(canvas.getByRole('button', { name: 'Complete next step' }));
      const heights: number[] = [];
      await new Promise<void>((resolve) => {
        const sample = () => {
          heights.push(card.getBoundingClientRect().height);
          if (heights.length < 40) requestAnimationFrame(sample);
          else resolve();
        };
        requestAnimationFrame(sample);
      });
      const end = heights[heights.length - 1] ?? start;
      await expect(end).toBeLessThan(start - 40);
      // At least one frame in between: no jump.
      await expect(heights.some((h) => h < start - 2 && h > end + 2)).toBe(true);
      await expect(canvas.getByRole('button', { name: /Completed/ })).toHaveTextContent('3');
    });

    const trigger = canvas.getByRole('button', { name: /Completed/ });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('list', { name: 'Completed' })).toBeInTheDocument();
  },
};

// A step with more to do than one button: the body holds the commands, under
// the step and across the row, while the step is open. A step whose action the
// viewer cannot take has a guide and no action.
export const WithBody: Story = {
  args: { title: 'Setup checklist', headingLevel: 3 },
  render: (args) => (
    <Checklist {...args}>
      <ChecklistStep id="plan" done>
        <ChecklistStepLabel>Choose a plan</ChecklistStepLabel>
        <ChecklistStepDescription>A plan unlocks its packages and capabilities.</ChecklistStepDescription>
        <ChecklistStepGuide href="https://docs.vendure.io">Plans</ChecklistStepGuide>
      </ChecklistStep>
      <ChecklistStep id="connect" done={false}>
        <ChecklistStepLabel>Connect your Vendure application</ChecklistStepLabel>
        <ChecklistStepDescription>Link this project to a local Vendure application.</ChecklistStepDescription>
        <ChecklistStepGuide href="https://docs.vendure.io">Linking a project</ChecklistStepGuide>
        <ChecklistStepBody>
          <p className="text-muted-foreground m-0">
            Run <InlineCode>npx vendure link</InlineCode> in your application, then select this
            project.
          </p>
        </ChecklistStepBody>
      </ChecklistStep>
      <ChecklistStep id="token" done={false}>
        <ChecklistStepLabel>Create a registry token</ChecklistStepLabel>
        <ChecklistStepDescription>
          Create an access token to install private packages for this project.
        </ChecklistStepDescription>
        <ChecklistStepGuide href="https://docs.vendure.io">Registry access</ChecklistStepGuide>
        <ChecklistStepAction>
          <Button size="sm" variant="secondary" render={<a href="#registry" />} nativeButton={false}>
            Create token
          </Button>
        </ChecklistStepAction>
      </ChecklistStep>
    </Checklist>
  ),
};
