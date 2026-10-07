import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Accept terms' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Accept terms', defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Accept terms', disabled: true },
};

export const DisabledChecked: Story = {
  args: { 'aria-label': 'Accept terms', disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" aria-label="Accept terms and conditions" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
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
 * Unchecked, checked and invalid, in light and dark. The unchecked border uses
 * the control-border slot (3:1 against every surface). Pinned to the light page
 * theme so the left panel stays light.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex items-center gap-6">
          <Checkbox aria-label={`Unchecked, ${theme}`} />
          <Checkbox aria-label={`Checked, ${theme}`} defaultChecked />
          <Checkbox aria-label={`Invalid, ${theme}`} aria-invalid />
          <Checkbox aria-label={`Disabled, ${theme}`} disabled />
        </div>
      )}
    </LightAndDark>
  ),
};
