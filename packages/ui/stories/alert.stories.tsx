import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { RefreshCwIcon, RocketIcon, TerminalIcon } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '../src/components/atoms/alert.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Atoms/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pixel tolerance for sub-pixel rounding in the layout assertions. */
const EPSILON = 1;

function slot(alert: HTMLElement, name: string) {
  const element = alert.querySelector<HTMLElement>(`[data-slot=${name}]`);
  expect(element).not.toBeNull();
  return element!;
}

/** The first button of the action, which is what the eye lines up. */
function actionButton(alert: HTMLElement) {
  const [button] = within(slot(alert, 'alert-action')).getAllByRole('button');
  expect(button).toBeDefined();
  return button!;
}

/** Asserts the action sits beside the text column and never covers it. */
function expectActionBesideText(alert: HTMLElement) {
  const actionBox = slot(alert, 'alert-action').getBoundingClientRect();
  const texts = alert.querySelectorAll<HTMLElement>('[data-slot=alert-title], [data-slot=alert-description]');
  expect(texts.length).toBeGreaterThan(0);
  for (const text of texts) {
    expect(text.getBoundingClientRect().right).toBeLessThanOrEqual(actionBox.left + EPSILON);
  }
}

/** Asserts every button of the action stays inside the alert padding. */
function expectActionInsideAlert(alert: HTMLElement) {
  const alertBox = alert.getBoundingClientRect();
  const style = getComputedStyle(alert);
  const right = alertBox.right - Number.parseFloat(style.paddingRight) - Number.parseFloat(style.borderRightWidth);
  for (const button of within(slot(alert, 'alert-action')).getAllByRole('button')) {
    expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(right + EPSILON);
  }
}

/** Asserts the action button is centred on the first line of the given text. */
function expectActionOnFirstLine(alert: HTMLElement, text: HTMLElement) {
  const textBox = text.getBoundingClientRect();
  const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);
  const buttonBox = actionButton(alert).getBoundingClientRect();
  const buttonCentre = buttonBox.top + buttonBox.height / 2;
  expect(Math.abs(buttonCentre - (textBox.top + lineHeight / 2))).toBeLessThanOrEqual(EPSILON);
}

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
  ),  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    expectActionBesideText(alert);
    expectActionInsideAlert(alert);
    expectActionOnFirstLine(alert, slot(alert, 'alert-title'));
  },
};

export const Warning: Story = {
  render: () => (
    <Alert variant="warning">
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

/**
 * The action takes its own grid column. A wide action stays on the sentence
 * line and the alert keeps the height of a one-line notice.
 */
export const OneLineWithWideAction: Story = {
  render: () => (
    <Alert variant="info">
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
    const description = slot(alert, 'alert-description');
    const lineHeight = Number.parseFloat(getComputedStyle(description).lineHeight);
    expectActionBesideText(alert);
    expectActionInsideAlert(alert);
    // The sentence fits on one line and the action is centred on it.
    expect(description.getBoundingClientRect().height).toBeLessThanOrEqual(lineHeight + EPSILON);
    expectActionOnFirstLine(alert, description);
  },
};

/**
 * A long sentence wraps before the action, never under it. The action lines
 * up with the first line, not the middle of the paragraph.
 */
export const LongSentenceWithAction: Story = {
  render: () => (
    <Alert variant="warning" className="max-w-xl">
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
    const alert = within(canvasElement).getByRole('alert');
    expectActionBesideText(alert);
    expectActionInsideAlert(alert);
    expectActionOnFirstLine(alert, slot(alert, 'alert-description'));
  },
};

/** With a title, the action sits on the title line. */
export const TitleDescriptionAction: Story = {
  render: () => (
    <Alert variant="destructive">
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
    expectActionBesideText(alert);
    expectActionInsideAlert(alert);
    expectActionOnFirstLine(alert, slot(alert, 'alert-title'));
  },
};

/** AlertAction lays out several buttons in a row. */
export const TwoActions: Story = {
  render: () => (
    <Alert variant="warning">
      <AlertDescription>The custom domain is not verified. Add the DNS record, then check again.</AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="sm">
          View DNS record
        </Button>
        <Button variant="outline" size="sm">
          Check again
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    expectActionBesideText(alert);
    expectActionInsideAlert(alert);
    expectActionOnFirstLine(alert, slot(alert, 'alert-description'));
  },
};

/**
 * Below 28rem the action moves to its own row under the text, so the sentence
 * keeps the full width. Buttons that do not fit wrap, and an unbreakable token
 * wraps instead of widening the alert.
 */
export const Narrow: Story = {
  render: () => (
    <Alert variant="info" className="max-w-xs">
      <AlertDescription>
        Backup bk_01JDQ8ZK4W7Y3N2M5P6R8T9V0X is ready for the project vendure-demo-storefront.
      </AlertDescription>
      <AlertAction>
        <Button variant="ghost" size="sm">
          View backups
        </Button>
        <Button variant="outline" size="sm">
          Restore backup
        </Button>
      </AlertAction>
    </Alert>
  ),
  play: async ({ canvasElement }) => {
    const alert = within(canvasElement).getByRole('alert');
    const description = slot(alert, 'alert-description');
    const textBox = description.getBoundingClientRect();
    const actionBox = slot(alert, 'alert-action').getBoundingClientRect();
    expect(actionBox.top).toBeGreaterThanOrEqual(textBox.bottom - EPSILON);
    expect(Math.abs(actionBox.left - textBox.left)).toBeLessThanOrEqual(EPSILON);
    expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth);
    expectActionInsideAlert(alert);
  },
};

/** Every variant with an action: the default variant without an icon, the toned ones with their tone icon. */
export const ActionVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(
        [
          'default',
          'info',
          'warning',
          'destructive',
        ] as const
      ).map((variant) => (
        <Alert key={variant} variant={variant}>
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
    for (const alert of alerts) {
      expectActionBesideText(alert);
      expectActionInsideAlert(alert);
      expectActionOnFirstLine(alert, slot(alert, 'alert-description'));
    }
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
 * A destructive alert is a faint tint of the destructive tone. The title
 * stays foreground and the description foreground-secondary; only the icon takes
 * the tone. Pinned to the light page theme.
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
 * All four variants side by side. The toned variants are a faint tint of the
 * tone in fill and border, with the icon in the tone's text slot. The default variant
 * stays on the card surface.
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
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>The region is updated on Sunday at 02:00 UTC.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>92 of 100 emails sent today. Upgrade to keep sending.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive</AlertTitle>
            <AlertDescription>The deployment failed. Open the build log.</AlertDescription>
          </Alert>
        </>
      )}
    </LightAndDark>
  ),
};

const toneOfVariant = { info: 'info', warning: 'warning', destructive: 'critical' } as const;

/**
 * A toned Alert shows the icon of its tone, the same shape as the StatusBadge
 * of that tone. Pass no icon for these tones. The default variant has no tone
 * and shows no icon unless you pass one.
 */
export const ToneIcons: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <>
          {(['info', 'warning', 'destructive'] as const).map((variant) => (
            <div key={variant} className="flex items-start gap-4">
              <Alert variant={variant} className="flex-1">
                <AlertTitle className="capitalize">{variant}</AlertTitle>
                <AlertDescription>The icon comes from the variant.</AlertDescription>
              </Alert>
              <StatusBadge tone={toneOfVariant[variant]} className="shrink-0">
                {toneOfVariant[variant]}
              </StatusBadge>
            </div>
          ))}
        </>
      )}
    </LightAndDark>
  ),
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>('[data-slot=alert]');
    expect(rows.length).toBeGreaterThan(0);
    for (const alert of rows) {
      const badge = alert.parentElement!.querySelector('[data-slot=status-badge-marker] svg');
      const icon = alert.querySelector('[data-slot=alert-icon]');
      expect(icon).not.toBeNull();
      // The same lucide shape: the class names the icon.
      expect(icon!.getAttribute('class')).toBe(badge!.getAttribute('class'));
    }
  },
};

/**
 * An icon you pass wins over the tone icon, as an `icon` prop or as an svg
 * child. `icon={false}` shows no icon.
 */
export const PassedIconAndNoIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert variant="info" icon={<RocketIcon />}>
        <AlertTitle>The icon prop</AlertTitle>
        <AlertDescription>A rocket replaces the info icon.</AlertDescription>
      </Alert>
      <Alert variant="info">
        <TerminalIcon />
        <AlertTitle>An svg child</AlertTitle>
        <AlertDescription>The terminal icon replaces the info icon.</AlertDescription>
      </Alert>
      <Alert variant="info" icon={false}>
        <AlertTitle>No icon</AlertTitle>
        <AlertDescription>The text starts at the padding.</AlertDescription>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [prop, child, none] = within(canvasElement).getAllByRole('alert');
    const visibleIcons = (alert: HTMLElement) =>
      [...alert.querySelectorAll('svg')].filter((svg) => getComputedStyle(svg).display !== 'none');
    expect(visibleIcons(prop!).map((svg) => svg.getAttribute('class'))).toEqual([expect.stringContaining('lucide-rocket')]);
    expect(visibleIcons(child!).map((svg) => svg.getAttribute('class'))).toEqual([expect.stringContaining('lucide-terminal')]);
    expect(visibleIcons(none!)).toHaveLength(0);
    // The title lines up with the icon column only when there is an icon.
    const title = (alert: HTMLElement) => slot(alert, 'alert-title').getBoundingClientRect().left;
    await expectPx(title(prop!), title(child!));
    expect(title(none!)).toBeLessThan(title(prop!));
  },
};
