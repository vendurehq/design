import type { Meta, StoryObj } from '@storybook/react';
import { PackageIcon, MailIcon, StarIcon } from 'lucide-react';
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
  ItemSeparator,
} from '../src/components/ui/item.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/Data Display/Item',
  component: Item,
  tags: ['autodocs'],
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ItemGroup>
      <Item>
        <ItemContent>
          <ItemTitle>Order #1042</ItemTitle>
          <ItemDescription>Placed by Alice Johnson on Feb 14, 2026</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">View</Button>
        </ItemActions>
      </Item>
      <Item>
        <ItemContent>
          <ItemTitle>Order #1041</ItemTitle>
          <ItemDescription>Placed by Bob Smith on Feb 13, 2026</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">View</Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};

export const Outline: Story = {
  render: () => (
    <ItemGroup>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Premium Plan</ItemTitle>
          <ItemDescription>$29/month billed annually</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm">Upgrade</Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Enterprise Plan</ItemTitle>
          <ItemDescription>Custom pricing for large teams</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">Contact Sales</Button>
        </ItemActions>
      </Item>
    </ItemGroup>
  ),
};

export const WithMedia: Story = {
  render: () => (
    <ItemGroup>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <PackageIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Shipment Dispatched</ItemTitle>
          <ItemDescription>Your order has been shipped via FedEx.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemMedia variant="icon">
          <MailIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Email Confirmation</ItemTitle>
          <ItemDescription>A confirmation email was sent to your inbox.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemMedia variant="icon">
          <StarIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Leave a Review</ItemTitle>
          <ItemDescription>Tell us what you think about your purchase.</ItemDescription>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};
