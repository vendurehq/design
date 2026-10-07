import type { Meta, StoryObj } from '@storybook/react';
import { type ComponentProps, type ReactNode, useId } from 'react';
import { Slider } from '../src/components/atoms/slider.tsx';

/** Slider with a visible label; Base UI passes aria-labelledby to each thumb. */
function LabelledSlider({ label = 'Volume', ...props }: ComponentProps<typeof Slider> & { label?: string }) {
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-2">
      <span id={id} className="text-sm font-medium">
        {label}
      </span>
      <Slider aria-labelledby={id} {...props} />
    </div>
  );
}

const meta = {
  title: 'Atoms/Forms/Slider',
  component: Slider,
  tags: ['autodocs'],
  render: (args) => <LabelledSlider {...args} />,
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: [50], max: 100 },
};

export const Range: Story = {
  args: { defaultValue: [25, 75], max: 100 },
};

export const Vertical: Story = {
  args: { defaultValue: [50], max: 100, orientation: 'vertical' },
  decorators: [
    (Story) => (
      <div style={{ height: 200 }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: { defaultValue: [50], max: 100, disabled: true },
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
 * The track uses the control-border slot and the thumb uses bg-background, so
 * neither disappears in dark mode. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <>
          <LabelledSlider label={`Volume, ${theme}`} defaultValue={[30]} />
          <LabelledSlider label={`Price range, ${theme}`} defaultValue={[20, 70]} />
          <LabelledSlider label={`Disabled, ${theme}`} defaultValue={[50]} disabled />
        </>
      )}
    </LightAndDark>
  ),
};
