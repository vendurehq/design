import type { Meta, StoryObj } from '@storybook/react';
import { BellIcon, FilterIcon, TriangleAlertIcon } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { CountBadge } from '../src/components/molecules/count-badge.tsx';

const meta = {
  title: 'Molecules/CountBadge',
  component: CountBadge,
  tags: ['autodocs'],
  args: { count: 3 },
} satisfies Meta<typeof CountBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Inline, neutral: the number alone.
export const Default: Story = {};

// Every shared tone plus brand, inline and on a corner. `progress` draws as
// `info`.
export const Tones: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CountBadge {...args} tone="neutral" />
        <CountBadge {...args} tone="info" />
        <CountBadge {...args} tone="success" />
        <CountBadge {...args} tone="warning" />
        <CountBadge {...args} tone="critical" />
        <CountBadge {...args} tone="brand" />
      </div>
      <div className="flex items-center gap-3">
        {(['neutral', 'info', 'success', 'warning', 'critical', 'brand'] as const).map((tone) => (
          <Button key={tone} variant="ghost" size="icon" className="relative">
            <BellIcon />
            <span className="sr-only">Notifications</span>
            <CountBadge {...args} tone={tone} placement="corner" label={`${args.count} unread`} />
          </Button>
        ))}
      </div>
    </div>
  ),
};

// The Console notification bell: an icon button with an unread count on its
// corner. The button takes its name from its content, so the label joins it:
// "Notifications, 120 unread". The badge shows "99+".
export const OnIconButton: Story = {
  args: { count: 120 },
  render: (args) => (
    <Button variant="ghost" size="icon" className="relative">
      <BellIcon />
      <span className="sr-only">Notifications,</span>
      <CountBadge {...args} placement="corner" label={`${args.count} unread`} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Notifications, 120 unread' });
    const badge = button.querySelector('[data-slot="count-badge"]');
    await expect(badge).toHaveAttribute('data-placement', 'corner');
    await expect(canvas.getByText('99+')).toHaveAttribute('aria-hidden', 'true');
  },
};

// The Dashboard alerts bell: the tone follows the most severe alert.
export const AlertsBell: Story = {
  args: { count: 2 },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" className="relative">
        <TriangleAlertIcon />
        <span className="sr-only">Alerts,</span>
        <CountBadge {...args} tone="warning" placement="corner" label={`${args.count} active`} />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <TriangleAlertIcon />
        <span className="sr-only">Alerts,</span>
        <CountBadge {...args} tone="critical" placement="corner" label={`${args.count} active`} />
      </Button>
    </div>
  ),
};

// The Dashboard active-filters button: the count sits in the label. The word
// beside it names it, so no `label` is needed.
export const InButton: Story = {
  args: { count: 2 },
  render: (args) => (
    <Button variant="outline" size="sm">
      <FilterIcon data-icon="inline-start" />
      Active filters
      <CountBadge {...args} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Active filters 2' })).toBeVisible();
  },
};

// Nothing renders at zero: the button stays, the count goes.
export const HiddenAtZero: Story = {
  args: { count: 0 },
  render: (args) => (
    <Button variant="ghost" size="icon" className="relative">
      <BellIcon />
      <span className="sr-only">Notifications</span>
      <CountBadge {...args} placement="corner" label={`${args.count} unread`} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Notifications' })).toBeVisible();
    await expect(canvasElement.querySelector('[data-slot="count-badge"]')).toBeNull();
  },
};

// A lower cap: `max={9}` shows "9+".
export const CustomMax: Story = {
  args: { count: 12, max: 9 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('9+')).toBeVisible();
  },
};

// On the small icon button (28px), as on the Console bell: one digit and the
// "99+" cap.
export const OnSmallIconButton: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon-sm" className="relative">
        <BellIcon />
        <span className="sr-only">Notifications,</span>
        <CountBadge count={3} placement="corner" label="3 unread" />
      </Button>
      <Button variant="ghost" size="icon-sm" className="relative">
        <BellIcon />
        <span className="sr-only">Notifications,</span>
        <CountBadge count={120} placement="corner" label="120 unread" />
      </Button>
    </div>
  ),
};
