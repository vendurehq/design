import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { Bold, ChevronDown, Italic, Underline } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { ButtonGroup } from '../src/components/atoms/button-group.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../src/components/atoms/input-otp.tsx';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';

type Dir = 'ltr' | 'rtl';

const meta = {
  title: 'Atoms/Layout/Direction joined groups',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The joined groups: a ToggleGroup in both orientations, a ButtonGroup in both variants, and an InputOTP. */
function JoinedGroups({ dir }: { dir: Dir }) {
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} className="flex flex-col items-start gap-6 px-20 py-8">
        <div className="flex items-start gap-6">
          <ToggleGroup data-testid="toggle-group" variant="outline" multiple defaultValue={['bold']}>
            <ToggleGroupItem value="bold" aria-label="Bold">
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <Underline />
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup data-testid="toggle-group-vertical" variant="outline" orientation="vertical">
            <ToggleGroupItem value="top">1</ToggleGroupItem>
            <ToggleGroupItem value="middle">2</ToggleGroupItem>
            <ToggleGroupItem value="bottom">3</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ButtonGroup data-testid="button-group">
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
        </ButtonGroup>
        <ButtonGroup data-testid="button-group-primary" variant="primary">
          <Button>Deploy</Button>
          <Button size="icon" aria-label="More deploy options">
            <ChevronDown />
          </Button>
        </ButtonGroup>
        <InputOTP maxLength={4} aria-label="One-time code">
          <InputOTPGroup data-testid="input-otp">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </DirectionProvider>
  );
}

function itemsOf(root: HTMLElement, id: string) {
  const group = root.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!group) throw new Error(`No element ${id}`);
  return Array.from(group.children) as HTMLElement[];
}

type Side = 'start' | 'end';

/** Which of a horizontal item's sides have round outer corners. */
function roundSides(el: HTMLElement, dir: Dir): Side[] {
  const s = getComputedStyle(el);
  const left = parseFloat(s.borderTopLeftRadius) > 0 && parseFloat(s.borderBottomLeftRadius) > 0;
  const right = parseFloat(s.borderTopRightRadius) > 0 && parseFloat(s.borderBottomRightRadius) > 0;
  const sides: Side[] = [];
  if (dir === 'ltr' ? left : right) sides.push('start');
  if (dir === 'ltr' ? right : left) sides.push('end');
  return sides;
}

/** Which of a horizontal item's sides draw a visible 1px border. */
function borderSides(el: HTMLElement, dir: Dir): Side[] {
  const s = getComputedStyle(el);
  const visible = (width: string, color: string) => parseFloat(width) > 0 && color !== 'rgba(0, 0, 0, 0)';
  const left = visible(s.borderLeftWidth, s.borderLeftColor);
  const right = visible(s.borderRightWidth, s.borderRightColor);
  const sides: Side[] = [];
  if (dir === 'ltr' ? left : right) sides.push('start');
  if (dir === 'ltr' ? right : left) sides.push('end');
  return sides;
}

/** Which of a vertical item's ends have round corners. */
function roundEnds(el: HTMLElement) {
  const s = getComputedStyle(el);
  const top = parseFloat(s.borderTopLeftRadius) > 0 && parseFloat(s.borderTopRightRadius) > 0;
  const bottom = parseFloat(s.borderBottomLeftRadius) > 0 && parseFloat(s.borderBottomRightRadius) > 0;
  return [top && 'top', bottom && 'bottom'].filter(Boolean);
}

/**
 * In both directions: the first item rounds its start side and the last its
 * end side, the middle items stay square. The divider between two items is
 * the later item's start border (ButtonGroup, InputOTP) or the earlier item's
 * end border (outline ToggleGroup, whose first item also draws the outer
 * start edge). A vertical group rounds top and bottom in either direction.
 */
async function expectDirection(root: HTMLElement, dir: Dir) {
  const map = (id: string, fn: (el: HTMLElement, dir: Dir) => Side[]) => itemsOf(root, id).map((el) => fn(el, dir));
  await expect({
    toggleRound: map('toggle-group', roundSides),
    toggleBorders: map('toggle-group', borderSides),
    toggleVerticalRound: itemsOf(root, 'toggle-group-vertical').map(roundEnds),
    buttonRound: map('button-group', roundSides),
    buttonBorders: map('button-group', borderSides),
    primaryRound: map('button-group-primary', roundSides),
    primaryBorders: map('button-group-primary', borderSides),
    otpRound: map('input-otp', roundSides),
    otpBorders: map('input-otp', borderSides),
  }).toEqual({
    toggleRound: [['start'], [], ['end']],
    toggleBorders: [['start', 'end'], ['end'], ['end']],
    toggleVerticalRound: [['top'], [], ['bottom']],
    buttonRound: [['start'], [], ['end']],
    buttonBorders: [[], ['start'], ['start']],
    primaryRound: [['start'], ['end']],
    primaryBorders: [[], ['start']],
    otpRound: [['start'], [], [], ['end']],
    otpBorders: [[], ['start'], ['start'], ['start']],
  });
}

/** Right to left: each group mirrors, so its round corners and its outer edge sit on the outer sides. */
export const JoinedGroupsRightToLeft: Story = {
  render: () => <JoinedGroups dir="rtl" />,
  play: async ({ canvasElement }) => expectDirection(canvasElement, 'rtl'),
};

/** Left to right, the same groups: the look this change keeps. */
export const JoinedGroupsLeftToRight: Story = {
  render: () => <JoinedGroups dir="ltr" />,
  play: async ({ canvasElement }) => expectDirection(canvasElement, 'ltr'),
};
