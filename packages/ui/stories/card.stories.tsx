import type { Meta, StoryObj } from '@storybook/react';
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
