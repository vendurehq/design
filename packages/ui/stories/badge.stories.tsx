import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';

const meta = {
  title: 'Atoms/General/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Badge' },
};

export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
};

export const Brand: Story = {
  args: { variant: 'brand', children: 'Brand' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
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
        <div className="flex gap-2">
          <Badge variant="destructive">Cancelled</Badge>
          <Badge variant="destructive">Payment declined</Badge>
        </div>
      )}
    </LightAndDark>
  ),
};
