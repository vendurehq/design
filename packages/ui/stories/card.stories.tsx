import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { ChevronRightIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardCount,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  CardRows,
  CardRow,
} from '../src/components/atoms/card.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Atoms/Data Display/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage your team and their account permissions.</CardDescription>
        <CardAction>
          <Button size="sm">Add Member</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>You have 3 team members across 2 roles.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">View All</Button>
      </CardFooter>
    </Card>
  ),
};

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-[320px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 4 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Check your inbox for the latest updates.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  ),
};

const deployments = [
  { id: 'a1f3c9e', message: 'Add the gift card checkout step', state: 'Live', tone: 'success', when: '2 min ago' },
  { id: '7b20d14', message: 'Raise the search index batch size', state: 'Superseded', tone: 'neutral', when: '1 hour ago' },
  { id: 'e94a0b2', message: 'Fix the tax zone fallback', state: 'Failed', tone: 'critical', when: 'Yesterday' },
] as const;

/**
 * A card whose body is a list: the title carries a CardCount, and CardRows runs
 * the rows edge to edge. Each row draws its own top border, so the header needs
 * no border-b, and the last row takes the card's bottom corners.
 */
export const WithRows: Story = {
  render: () => (
    <Card className="w-[520px]">
      <CardHeader>
        <CardTitle>
          Deployments <CardCount>{deployments.length}</CardCount>
        </CardTitle>
        <CardAction>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardRows role="list">
        {deployments.map((deployment) => (
          <CardRow key={deployment.id} role="listitem" className="hover:bg-accent">
            <span className="text-muted-foreground font-mono text-xs">{deployment.id}</span>
            <span className="min-w-0 flex-1 truncate">{deployment.message}</span>
            <StatusBadge tone={deployment.tone}>{deployment.state}</StatusBadge>
            <span className="text-muted-foreground w-20 text-right text-xs">{deployment.when}</span>
            <ChevronRightIcon aria-hidden="true" className="text-muted-foreground size-4" />
          </CardRow>
        ))}
      </CardRows>
    </Card>
  ),
  // The one-line header is one 48px row: the first row starts 48px below the
  // card's inner top edge, and the title sits on the row's centre line.
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-slot="card"]');
    const title = canvasElement.querySelector<HTMLElement>('[data-slot="card-title"]');
    const firstRow = canvasElement.querySelector<HTMLElement>('[data-slot="card-row"]');
    if (!card || !title || !firstRow) throw new Error('Card parts not rendered');
    const top = card.getBoundingClientRect().top + card.clientTop;
    const titleBox = title.getBoundingClientRect();
    await expectPx(firstRow.getBoundingClientRect().top - top, 48);
    await expectPx((titleBox.top + titleBox.bottom) / 2 - top, 24);
  },
};

/** CardRows as the first child: no top padding, and the first row drops its border. */
export const RowsOnly: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardRows>
        <CardRow className="justify-between">
          <span>Region</span>
          <span className="text-foreground-secondary">Frankfurt</span>
        </CardRow>
        <CardRow className="justify-between">
          <span>Plan</span>
          <span className="text-foreground-secondary">Growth</span>
        </CardRow>
        <CardRow className="justify-between">
          <span>Replicas</span>
          <span className="text-foreground-secondary tabular-nums">3</span>
        </CardRow>
      </CardRows>
    </Card>
  ),
};

/** Rows followed by a footer: the footer carries its band border-t. */
export const RowsWithFooter: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>
          Members <CardCount>2</CardCount>
        </CardTitle>
      </CardHeader>
      <CardRows>
        <CardRow>Ada Lovelace</CardRow>
        <CardRow>Grace Hopper</CardRow>
      </CardRows>
      <CardFooter className="border-t">
        <Button variant="outline" size="sm">
          Invite member
        </Button>
      </CardFooter>
    </Card>
  ),
};

// variant="accent" marks the one card that holds the live subject of the page,
// here the deployment that is building. The brand stays faint: a tinted border
// and a wash that fades out down the card. State inside it is a bare badge,
// not a chip, and every other card stays neutral.
export const Accent: Story = {
  render: () => (
    <div className="flex w-[560px] flex-col gap-4">
      <Card variant="accent">
        <CardHeader>
          <CardTitle>Current deployment</CardTitle>
          <CardAction>
            <StatusBadge tone="progress" appearance="bare">
              Building
            </StatusBadge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary">Add the gift card checkout step · started 2 min ago</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Previous deployment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground-secondary">Fix the tax zone fallback · yesterday</p>
        </CardContent>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [accent, plain] = canvasElement.querySelectorAll<HTMLElement>('[data-slot=card]');
    expect(getComputedStyle(accent!).backgroundImage).toContain('linear-gradient');
    expect(getComputedStyle(accent!).borderTopColor).not.toBe(getComputedStyle(plain!).borderTopColor);
    expect(getComputedStyle(plain!).backgroundImage).toBe('none');
  },
};

/**
 * A count that needs action takes a tone: `critical` for failures, `warning`
 * for rows that wait on the user. The count sits 10px after the title. The
 * card stays neutral; only the count is coloured.
 */
export const CountTone: Story = {
  render: () => (
    <div className="flex w-[520px] flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Failed pushes <CardCount tone="critical">2</CardCount>
          </CardTitle>
        </CardHeader>
        <CardRows role="list">
          <CardRow role="listitem">Read the gift card prefix from the environment</CardRow>
          <CardRow role="listitem">Add the gift card balance to the customer account page</CardRow>
        </CardRows>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Payments to review <CardCount tone="warning">1</CardCount>
          </CardTitle>
        </CardHeader>
        <CardRows role="list">
          <CardRow role="listitem">Order SB-2041 · flagged by the fraud check</CardRow>
        </CardRows>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [critical, warning] = canvasElement.querySelectorAll<HTMLElement>('[data-slot=card-count]');
    const title = canvasElement.querySelector<HTMLElement>('[data-slot=card-title]');
    expect(getComputedStyle(critical!).color).not.toBe(getComputedStyle(warning!).color);
    expect(getComputedStyle(critical!).color).not.toBe(getComputedStyle(title!).color);
    expect(getComputedStyle(critical!).marginInlineStart).toBe('10px');
  },
};
