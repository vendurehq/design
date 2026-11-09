import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '../src/components/atoms/progress.tsx';

const meta = {
  title: 'Atoms/Data Display/Progress',
  component: Progress,
  tags: ['autodocs'],
  // baseline args to satisfy required props; all stories use render()
  args: { value: null },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={50} aria-label="Upload progress" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={65}>
        <ProgressLabel>Uploading files...</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={100}>
        <ProgressLabel>Upload complete</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Every bar sits on a 4px track in the accent tint. The fill grows from 0 when
 * it first shows. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex flex-col gap-4">
          <Progress value={0} aria-label={`Not started, ${theme}`} />
          <Progress value={40} aria-label={`In progress, ${theme}`} />
          <Progress value={100} aria-label={`Complete, ${theme}`} />
        </div>
      )}
    </LightAndDark>
  ),
};

/**
 * Tone follows consequence: a usage meter turns warning near a limit the user
 * must act on and critical at or over it. A task progress bar stays default.
 * Each tone fills with its text slot on the same accent track.
 */
export const Tones: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex flex-col gap-4">
          <Progress value={40}>
            <ProgressLabel>Default · deploying</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress tone="success" value={90}>
            <ProgressLabel>Success · 18 of 20 replicas healthy</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress tone="warning" value={92}>
            <ProgressLabel>Warning · 92 of 100 emails sent</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress tone="critical" value={100}>
            <ProgressLabel>Critical · storage full</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress tone="info" value={null}>
            <ProgressLabel>Info · build running</ProgressLabel>
          </Progress>
          <Progress tone="neutral" value={100}>
            <ProgressLabel>Neutral · roll-out cancelled</ProgressLabel>
          </Progress>
        </div>
      )}
    </LightAndDark>
  ),
};

/**
 * `value={null}` makes the bar indeterminate, for work whose length is unknown:
 * a 40% fill with a band that sweeps across at a constant speed. With reduced
 * motion the 40% fill stays and the band is gone.
 */
export const Indeterminate: Story = {
  render: () => (
    <div className="flex w-[400px] flex-col gap-4">
      <Progress value={null}>
        <ProgressLabel>Building image</ProgressLabel>
      </Progress>
      <Progress value={null} aria-label="Deploying" />
    </div>
  ),
};

const steps = [
  { label: 'Queued', detail: '1 min', tone: 'success', value: 100 },
  { label: 'Build', detail: '2 min so far', tone: 'info', value: null },
  { label: 'Roll out', detail: '—', tone: 'default', value: 0 },
  { label: 'Live', detail: '—', tone: 'default', value: 0 },
] as const;

/**
 * The step bars of a deployment: one bar per step. A done step fills green,
 * the running step sweeps in info blue, and a step that has not started shows
 * the empty track. A failed step would be `critical` at 100, and a stopped
 * one `neutral` at 100.
 */
export const Steps: Story = {
  render: () => (
    <div className="grid w-[640px] grid-flow-col auto-cols-fr gap-1.5">
      {steps.map((step) => (
        <Progress key={step.label} tone={step.tone} value={step.value} aria-label={step.label}>
          <div className="order-last flex flex-col gap-0.5">
            <span className={step.value === 0 ? 'text-muted-foreground text-sm font-semibold' : 'text-sm font-semibold'}>
              {step.label}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">{step.detail}</span>
          </div>
        </Progress>
      ))}
    </div>
  ),
};
