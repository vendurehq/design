import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../src/components/atoms/toggle.tsx';
import { Bold, Italic, Underline } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';

const meta = {
  title: 'Atoms/Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Bold', children: <Bold /> },
};

export const Outline: Story = {
  args: { variant: 'outline', 'aria-label': 'Italic', children: <Italic /> },
};

export const WithText: Story = {
  args: { children: <><Bold /> Bold</> },
};

export const SizeSm: Story = {
  args: { size: 'sm', 'aria-label': 'Underline', children: <Underline /> },
};

export const SizeLg: Story = {
  args: { size: 'lg', 'aria-label': 'Bold', children: <Bold /> },
};

export const Disabled: Story = {
  args: { disabled: true, 'aria-label': 'Bold', children: <Bold /> },
};

export const Pressed: Story = {
  args: { defaultPressed: true, 'aria-label': 'Bold', children: <Bold /> },
};

const DISABLED_WITH_REASON = [
  { label: 'Bold', variant: 'default', pressed: false, reason: 'Formatting is off in a code block.' },
  { label: 'Italic', variant: 'default', pressed: true, reason: 'The heading style sets italic.' },
  { label: 'Underline', variant: 'outline', pressed: false, reason: 'Links are underlined already.' },
  { label: 'Strike', variant: 'outline', pressed: true, reason: 'Removed text keeps its strike.' },
] as const;

function DisabledWithReasonRow() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {DISABLED_WITH_REASON.map(({ label, variant, pressed, reason }) => (
          <Tooltip key={label}>
            <TooltipTrigger
              render={
                <Toggle
                  variant={variant}
                  defaultPressed={pressed}
                  aria-disabled
                  // Base UI's Toggle has no focusableWhenDisabled: cancel the press.
                  onPressedChange={(_, details) => details.cancel()}
                >
                  {label}
                </Toggle>
              }
            />
            <TooltipContent>{reason}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

/**
 * A disabled toggle that says why: `aria-disabled` in place of `disabled`, so
 * it keeps its tab stop and the pointer and its tooltip opens. It looks like a
 * disabled toggle, pressed or not: half opacity, a not-allowed cursor, and no
 * hover or press change. Base UI's Toggle has no `focusableWhenDisabled`, so
 * the toggle cancels its own press in `onPressedChange`. The test runner
 * hovers and presses each one with a real mouse and checks the look holds.
 */
export const DisabledWithReason: Story = {
  parameters: {
    hoverText: DISABLED_WITH_REASON.map(({ label, reason }) => ({
      text: label,
      expectTooltip: reason,
      keepsLook: true,
    })),
  },
  render: () => <DisabledWithReasonRow />,
};

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The same toggles in light and dark. Pinned to the light page theme. */
export const DisabledWithReasonLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      <DisabledWithReasonRow />
    </LightAndDark>
  ),
};
