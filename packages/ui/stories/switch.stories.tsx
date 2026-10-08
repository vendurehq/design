import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Switch } from '../src/components/atoms/switch.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Airplane mode' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Airplane mode', defaultChecked: true },
};

export const Small: Story = {
  args: { 'aria-label': 'Airplane mode', size: 'sm' },
};

export const SmallChecked: Story = {
  args: { 'aria-label': 'Airplane mode', size: 'sm', defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Airplane mode', disabled: true },
};

export const DisabledChecked: Story = {
  args: { 'aria-label': 'Airplane mode', disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" aria-label="Airplane Mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
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
 * Unchecked, checked and invalid, in light and dark. The unchecked track uses
 * the control-border slot. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex items-center gap-6">
          <Switch aria-label={`Unchecked, ${theme}`} />
          <Switch aria-label={`Checked, ${theme}`} defaultChecked />
          <Switch aria-label={`Invalid, ${theme}`} aria-invalid />
          <Switch aria-label={`Small, ${theme}`} size="sm" />
        </div>
      )}
    </LightAndDark>
  ),
};
