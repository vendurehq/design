import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { AlertCircleIcon, InfoIcon, RefreshCwIcon, TerminalIcon, TriangleAlertIcon } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '../src/components/atoms/alert.tsx';
import { Button } from '../src/components/atoms/button.tsx';

const meta = {
  title: 'Atoms/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">
          Retry
        </Button>
      </AlertAction>
    </Alert>
  ),
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
      <TriangleAlertIcon />
      <AlertTitle>Sending limit almost reached</AlertTitle>
      <AlertDescription>
        92 of 100 emails sent today. Upgrade the plan to keep sending.
      </AlertDescription>
    </Alert>
  ),
};

export const Info: Story = {
  render: () => (
    <Alert variant="info">
      <InfoIcon />
      <AlertTitle>Scheduled maintenance</AlertTitle>
      <AlertDescription>
        The region is updated on Sunday between 02:00 and 03:00 UTC.
      </AlertDescription>
    </Alert>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Alert>
      <TerminalIcon />
      <AlertTitle>Terminal</AlertTitle>
      <AlertDescription>
        You can run commands in the terminal to manage your project.
      </AlertDescription>
    </Alert>
  ),
};

/** Pixel tolerance for sub-pixel rounding in the layout assertions. */
const EPSILON = 1;

/** Asserts the action sits beside the text column and never covers it. */
function expectActionBesideText(alert: HTMLElement) {
  const action = alert.querySelector<HTMLElement>('[data-slot=alert-action]');
  const texts = alert.querySelectorAll<HTMLElement>(
    '[data-slot=alert-title], [data-slot=alert-description]',
  );
  expect(action).not.toBeNull();
  expect(texts.length).toBeGreaterThan(0);
  const actionBox = action!.getBoundingClientRect();
  for (const text of texts) {
    expect(text.getBoundingClientRect().right).toBeLessThanOrEqual(actionBox.left + EPSILON);
  }
  return actionBox;
}

/**
 * The action takes its own grid column. A wide action stays on the sentence
 * line and the alert keeps the height of a one-line notice.
 */
export const OneLineWithWideAction: Story = {
  render: () => (
    <Alert variant="info">
      <InfoIcon />
      <AlertDescription>The deployment list is out of date.</AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="sm">
          <RefreshCwIcon data-icon="inline-start" />
          View deployments
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    const actionBox = expectActionBesideText(alert);
    const description = alert.querySelector<HTMLElement>('[data-slot=alert-description]')!;
    const textBox = description.getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight);
    // The sentence fits on one line.
    expect(textBox.height).toBeLessThanOrEqual(lineHeight + EPSILON);
    // The action is centred on that line.
    const textCentre = textBox.top + textBox.height / 2;
    const actionCentre = actionBox.top + actionBox.height / 2;
    expect(Math.abs(actionCentre - textCentre)).toBeLessThanOrEqual(EPSILON);
  },
};

/** A long sentence wraps before the action, never under it. */
export const LongSentenceWithAction: Story = {
  render: () => (
    <Alert variant="warning" className="max-w-xl">
      <TriangleAlertIcon />
      <AlertDescription>
        The repository has commits that are not deployed yet. Sync the project to fetch the latest
        branches, then start a new deployment from the commit you want to ship.
      </AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">
          Sync project
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    expectActionBesideText(within(canvasElement).getByRole('alert'));
  },
};

/** With a title, the action sits on the title line. */
export const TitleDescriptionAction: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Deployment failed</AlertTitle>
      <AlertDescription>The build stopped at the install step. Open the build log for details.</AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm">
          <RefreshCwIcon data-icon="inline-start" />
          Retry
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    const actionBox = expectActionBesideText(alert);
    const title = alert.querySelector<HTMLElement>('[data-slot=alert-title]')!.getBoundingClientRect();
    const titleCentre = title.top + title.height / 2;
    expect(Math.abs(actionBox.top + actionBox.height / 2 - titleCentre)).toBeLessThanOrEqual(EPSILON);
  },
};

/** Every variant with an action, with and without an icon. */
export const ActionVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        [
          ['default', null],
          ['info', <InfoIcon key="icon" />],
          ['warning', <TriangleAlertIcon key="icon" />],
          ['destructive', <AlertCircleIcon key="icon" />],
        ] as const
      ).map(([variant, icon]) => (
        <Alert key={variant} variant={variant}>
          {icon}
          <AlertDescription>The {variant} alert keeps a wide action on its sentence line.</AlertDescription>
          <AlertAction>
            <Button variant="ghost" size="sm">
              <RefreshCwIcon data-icon="inline-start" />
              View deployments
            </Button>
          </AlertAction>
        </Alert>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alerts = within(canvasElement).getAllByRole('alert');
    expect(alerts).toHaveLength(4);
    for (const alert of alerts) expectActionBesideText(alert);
  },
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
 * Destructive text uses destructive-subtle-foreground, which reaches 4.5:1 on
 * every surface in both modes. Pinned to the light page theme.
 */
export const DestructiveLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <Alert variant="destructive">
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>The card was declined. Ask the customer for another card.</AlertDescription>
        </Alert>
      )}
    </LightAndDark>
  ),
};

/**
 * All four variants side by side. Warning and info follow the destructive
 * treatment: card surface, tone-colored text and icon via the tone's
 * subtle-foreground, which reaches 4.5:1 on every surface in both modes.
 */
export const VariantsLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <>
          <Alert>
            <TerminalIcon />
            <AlertTitle>Default</AlertTitle>
            <AlertDescription>The CLI can deploy this project too.</AlertDescription>
          </Alert>
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>The region is updated on Sunday at 02:00 UTC.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>92 of 100 emails sent today. Upgrade to keep sending.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Destructive</AlertTitle>
            <AlertDescription>The deployment failed. Open the build log.</AlertDescription>
          </Alert>
        </>
      )}
    </LightAndDark>
  ),
};
