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
 * The track uses the control-border slot, so the unfilled part stays visible on
 * every surface. Pinned to the light page theme.
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
 * Toned bars pair the tone's subtle track with its subtle-foreground fill.
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
        </div>
      )}
    </LightAndDark>
  ),
};
