import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { ChevronRight, Loader2, Mail } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';

const meta = {
  title: 'Atoms/General/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Button' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Delete' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
};

export const Link: Story = {
  args: { variant: 'link', children: 'Link' },
};

export const SizeXs: Story = {
  args: { size: 'xs', children: 'Extra Small' },
};

export const SizeSm: Story = {
  args: { size: 'sm', children: 'Small' },
};

export const SizeLg: Story = {
  args: { size: 'lg', children: 'Large' },
};

export const Icon: Story = {
  args: { size: 'icon', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconXs: Story = {
  args: { size: 'icon-xs', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconSm: Story = {
  args: { size: 'icon-sm', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const IconLg: Story = {
  args: { size: 'icon-lg', variant: 'outline', 'aria-label': 'Next', children: <ChevronRight /> },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail /> Send Email
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="animate-spin" /> Please wait
      </>
    ),
  },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled' },
};

// Passing `render` swaps the underlying element for an anchor. The Button
// defaults nativeButton to false in this case, so Base UI doesn't warn.
export const AsLink: Story = {
  args: {
    variant: 'outline',
    // biome-ignore lint/a11y/useAnchorContent: Button injects the label via render
    render: <a href="https://vendure.io" />,
    children: 'Rendered as a link',
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
 * Rest and invalid (`aria-invalid`), in light and dark. Dark mode uses the full
 * destructive border, not a 50% one that was weaker than the rest border.
 * Pinned to the light page theme so the left panel stays light.
 */
export const Invalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex gap-3">
          <Button variant="outline">Choose file</Button>
          <Button variant="outline" aria-invalid>
            Choose file
          </Button>
        </div>
      )}
    </LightAndDark>
  ),
};

/**
 * The destructive variant keeps its tinted fill; its text uses
 * destructive-subtle-foreground, which reaches 4.5:1 in both modes. Pinned to
 * the light page theme.
 */
export const DestructiveLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex gap-3">
          <Button variant="destructive">Delete order</Button>
          <Button variant="destructive" size="sm">
            Remove
          </Button>
        </div>
      )}
    </LightAndDark>
  ),
};
