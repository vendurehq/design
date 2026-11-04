import type { Meta, StoryObj } from '@storybook/react';
import { CircleCheckIcon, CircleSlashIcon, CircleXIcon, MoonStarIcon } from 'lucide-react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  args: {
    tone: 'neutral',
    appearance: 'chip',
    size: 'default',
    dot: false,
    children: 'Status',
  },
  argTypes: {
    tone: {
      control: 'select',
      options: ['neutral', 'info', 'success', 'warning', 'critical', 'progress'],
    },
    appearance: { control: 'inline-radio', options: ['chip', 'text', 'dot'] },
    size: { control: 'inline-radio', options: ['default', 'lg'] },
    dot: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const TONES: { tone: Tone; label: string }[] = [
  { tone: 'neutral', label: 'Draft' },
  { tone: 'info', label: 'Shipped' },
  { tone: 'success', label: 'Active' },
  { tone: 'warning', label: 'Awaiting approval' },
  { tone: 'critical', label: 'Failed' },
  { tone: 'progress', label: 'Deploying' },
];

export const Playground: Story = {};

// Every tone as a chip: a neutral fill, the tone in the outline only.
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone}>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// The leading dot is opt-in for dense tables; progress ignores the prop and
// always shows its spinner.
export const WithDot: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone} dot>
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// `progress` always renders a spinner regardless of the `dot` prop. It turns
// once every 1.6s and stands still under prefers-reduced-motion.
export const Progress: Story = {
  args: { tone: 'progress', children: 'Deploying' },
};

// `icon` replaces the dot (and the progress spinner) with an icon in the tone
// colour, for a state whose shape says more than a dot.
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge tone="success" icon={<CircleCheckIcon />}>
        Live
      </StatusBadge>
      <StatusBadge tone="critical" icon={<CircleXIcon />}>
        Failed
      </StatusBadge>
      <StatusBadge tone="neutral" icon={<CircleSlashIcon />}>
        Cancelled
      </StatusBadge>
      <StatusBadge tone="neutral" icon={<MoonStarIcon />}>
        Asleep
      </StatusBadge>
    </div>
  ),
};

// `size="lg"` (28px) for the status beside a page title.
export const Large: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge size="lg" tone="success" icon={<CircleCheckIcon />}>
        Live
      </StatusBadge>
      <StatusBadge size="lg" tone="progress">
        Deploying
      </StatusBadge>
      <StatusBadge size="lg" tone="warning" dot>
        Degraded
      </StatusBadge>
    </div>
  ),
};

// `appearance="text"`: the word alone, in the tone colour. The progress spinner
// sits after the word so every word starts on the column edge.
export const TextAppearance: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {TONES.map(({ tone, label }) => (
        <StatusBadge key={tone} tone={tone} appearance="text">
          {label}
        </StatusBadge>
      ))}
    </div>
  ),
};

// `appearance="dot"`: a lone 8px dot. The label is still in the DOM as
// screen-reader text, so the state is never colour-only for assistive tech.
export const DotAppearance: Story = {
  render: () => (
    <div className="flex flex-col gap-2 text-sm">
      {TONES.map(({ tone, label }) => (
        <span key={tone} className="inline-flex items-center gap-2">
          <StatusBadge tone={tone} appearance="dot">
            {label}
          </StatusBadge>
          <span aria-hidden className="text-muted-foreground">
            {tone}
          </span>
        </span>
      ))}
    </div>
  ),
};

// A status chip beside classification Badges. Solid/brand chips stay on Badge;
// StatusBadge never fills with its tone.
export const AlongsideBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge tone="success" dot>
        Active
      </StatusBadge>
      <Badge variant="outline">Production</Badge>
      <StatusBadge tone="warning" dot>
        Degraded
      </StatusBadge>
      <Badge variant="outline">Staging</Badge>
    </div>
  ),
};

// StatusBadge in a list: a fixed status column uses the text appearance, so a
// column of words stays calm and a failure still stands out.
const ROWS: { name: string; env: string; tone: Tone; state: string }[] = [
  { name: 'checkout-api', env: 'Production', tone: 'success', state: 'Running' },
  { name: 'search-worker', env: 'Production', tone: 'progress', state: 'Deploying' },
  { name: 'staff-console', env: 'Staging', tone: 'warning', state: 'Degraded' },
  { name: 'legacy-import', env: 'Staging', tone: 'critical', state: 'Failed' },
  { name: 'analytics-sync', env: 'Production', tone: 'neutral', state: 'Disabled' },
];

export const InAList: Story = {
  render: () => (
    <div className="w-full max-w-xl overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
            <th className="p-3 font-medium">Service</th>
            <th className="p-3 font-medium">Environment</th>
            <th className="p-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ name, env, tone, state }) => (
            <tr key={name} className="border-b align-middle last:border-0">
              <td className="p-3 font-mono text-xs">{name}</td>
              <td className="p-3">
                <Badge variant="outline">{env}</Badge>
              </td>
              <td className="w-32 p-3">
                <StatusBadge tone={tone} appearance="text">
                  {state}
                </StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
