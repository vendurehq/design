import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { RadioGroup, RadioGroupItem } from '../src/components/atoms/radio-group.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="r1" aria-label="Default" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="r2" aria-label="Comfortable" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="compact" id="r3" aria-label="Compact" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="default" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="default" id="rd1" aria-label="Default" />
        <Label htmlFor="rd1">Default</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="comfortable" id="rd2" aria-label="Comfortable" />
        <Label htmlFor="rd2">Comfortable</Label>
      </div>
    </RadioGroup>
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
 * the control-border slot. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <RadioGroup defaultValue="express" aria-label={`Shipping, ${theme}`} className="flex gap-6">
          <RadioGroupItem value="standard" aria-label="Standard" />
          <RadioGroupItem value="express" aria-label="Express" />
          <RadioGroupItem value="pickup" aria-label="Pickup" aria-invalid />
        </RadioGroup>
      )}
    </LightAndDark>
  ),
};
