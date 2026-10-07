import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { NativeSelect, NativeSelectOption, NativeSelectOptGroup } from '../src/components/atoms/native-select.tsx';

const meta = {
  title: 'Atoms/Forms/NativeSelect',
  component: NativeSelect,
  tags: ['autodocs'],
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NativeSelect aria-label="Fruit">
      <NativeSelectOption value="">Select a fruit...</NativeSelectOption>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  ),
};

export const Small: Story = {
  render: () => (
    <NativeSelect size="sm" aria-label="Fruit">
      <NativeSelectOption value="">Select a fruit...</NativeSelectOption>
      <NativeSelectOption value="apple">Apple</NativeSelectOption>
      <NativeSelectOption value="banana">Banana</NativeSelectOption>
      <NativeSelectOption value="cherry">Cherry</NativeSelectOption>
    </NativeSelect>
  ),
};

export const WithOptGroups: Story = {
  render: () => (
    <NativeSelect aria-label="Fruit">
      <NativeSelectOption value="">Select a food...</NativeSelectOption>
      <NativeSelectOptGroup label="Fruits">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="Vegetables">
        <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
        <NativeSelectOption value="broccoli">Broccoli</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  ),
};

export const Disabled: Story = {
  render: () => (
    <NativeSelect disabled aria-label="Fruit">
      <NativeSelectOption value="">Disabled select</NativeSelectOption>
    </NativeSelect>
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
          <NativeSelect aria-label={`Country, ${theme}`}>
            <NativeSelectOption value="">Select a country</NativeSelectOption>
          </NativeSelect>
          <NativeSelect aria-label={`Country, invalid, ${theme}`} aria-invalid>
            <NativeSelectOption value="">Select a country</NativeSelectOption>
          </NativeSelect>
        </>
      )}
    </LightAndDark>
  ),
};
