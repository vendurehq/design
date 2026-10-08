import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Input } from '../src/components/atoms/input.tsx';

const meta = {
  title: 'Atoms/Forms/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Email' },
};

export const WithPlaceholder: Story = {
  args: { 'aria-label': 'Email', placeholder: 'Enter your email...' },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Email', placeholder: 'Disabled input', disabled: true },
};

export const WithValue: Story = {
  args: { 'aria-label': 'Email', defaultValue: 'hello@vendure.io', type: 'email' },
};

export const File: Story = {
  args: { 'aria-label': 'Attachment', type: 'file' },
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
 * Rest and invalid (`aria-invalid`), in light and dark. Dark mode uses the full
 * destructive border, not a 50% one that was weaker than the rest border.
 * Pinned to the light page theme so the left panel stays light.
 */
export const Invalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <>
          <Input aria-label={`Email, ${theme}`} placeholder="Email" />
          <Input aria-label={`Email, invalid, ${theme}`} aria-invalid defaultValue="not-an-email" />
        </>
      )}
    </LightAndDark>
  ),
};
