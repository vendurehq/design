import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { Bold, ChevronDown, Copy, Italic, MoreHorizontal, Scissors, Underline } from 'lucide-react';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '../src/components/atoms/button-group.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';

const meta = {
  title: 'Atoms/General/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Save</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Cancel</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>or</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline">Reset</Button>
    </ButtonGroup>
  ),
};

/**
 * A primary split button: the main action and a menu trigger share one
 * primary fill, split by a 1px divider. Put default Buttons inside.
 */
export const PrimarySplitButton: Story = {
  render: () => <SplitButton />,
};

function SplitButton({ size }: { size?: 'sm' }) {
  return (
    <ButtonGroup variant="primary">
      <Button size={size}>Publish</Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button size={size === 'sm' ? 'icon-sm' : 'icon'} aria-label="More publish options">
              <ChevronDown />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Schedule publish</DropdownMenuItem>
          <DropdownMenuItem>Publish to all channels</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}

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
 * The group draws one outer edge with 1px inner dividers; only the outer ends
 * are rounded. Default and sm sizes, the primary split button and a vertical
 * group, in light and dark. Pinned to the light page theme.
 */
export const LightAndDarkOverview: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <ButtonGroup>
              <Button variant="outline">
                <Scissors /> Cut
              </Button>
              <Button variant="outline">
                <Copy /> Copy
              </Button>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </ButtonGroup>
            <SplitButton />
          </div>
          <div className="flex items-center gap-3">
            <ButtonGroup>
              <Button variant="outline" size="sm">
                Day
              </Button>
              <Button variant="outline" size="sm">
                Week
              </Button>
              <Button variant="outline" size="sm">
                Month
              </Button>
            </ButtonGroup>
            <SplitButton size="sm" />
          </div>
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
        </div>
      )}
    </LightAndDark>
  ),
};

const FORMATS = [
  { label: 'Bold', icon: Bold },
  { label: 'Italic', icon: Italic },
  { label: 'Underline', icon: Underline },
] as const;

/** The same controls with or without a tooltip on each button. */
function FormatControls({ tooltips }: { tooltips: boolean }) {
  const wrap = (label: string, button: ReactElement) =>
    tooltips ? (
      <Tooltip key={label}>
        <TooltipTrigger render={button} />
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    ) : (
      <Fragment key={label}>{button}</Fragment>
    );
  const prefix = tooltips ? 'With tooltip' : 'Plain';
  return (
    <div className="flex items-center gap-4" data-testid={tooltips ? 'tooltips' : 'plain'}>
      <ButtonGroup aria-label={`${prefix} group`}>
        {FORMATS.map(({ label }) => wrap(label, <Button variant="outline">{label}</Button>))}
      </ButtonGroup>
      <div className="flex items-center" aria-label={`${prefix} icons`} role="toolbar">
        {FORMATS.map(({ label, icon: Icon }) =>
          wrap(
            label,
            <Button variant="ghost" size="icon-sm" aria-label={label}>
              <Icon />
            </Button>,
          ),
        )}
      </div>
    </div>
  );
}

/**
 * A Button used as a tooltip trigger keeps its own slot (`data-slot="button"`)
 * and gains `data-tooltip-trigger`. The group with tooltips and the row of
 * small icon buttons with tooltips look the same as the plain ones below:
 * the joined edges and corners, and each icon button's click area.
 */
export const WithTooltips: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <FormatControls tooltips />
        <FormatControls tooltips={false} />
      </div>
    </TooltipProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const look = (element: Element) => {
      const style = getComputedStyle(element);
      const area = getComputedStyle(element, '::before');
      return [style.borderRadius, style.borderColor, style.boxShadow, style.backgroundClip, area.width, area.height].join(' | ');
    };
    const withTips = canvas.getByTestId('tooltips').querySelectorAll('button');
    const plain = canvas.getByTestId('plain').querySelectorAll('button');
    expect(withTips).toHaveLength(plain.length);
    withTips.forEach((button, index) => {
      expect(button).toHaveAttribute('data-slot', 'button');
      expect(button).toHaveAttribute('data-tooltip-trigger');
      expect(look(button)).toBe(look(plain[index] as Element));
    });
  },
};
