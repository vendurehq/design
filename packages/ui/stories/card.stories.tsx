import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../src/components/ui/card.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/Data Display/Card',
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
