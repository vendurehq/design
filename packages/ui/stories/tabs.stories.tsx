import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../src/components/ui/tabs.tsx';

const meta = {
  title: 'UI/Data Display/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm text-muted-foreground pt-2">
          Update your account settings. Set your preferred language and timezone.
        </p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm text-muted-foreground pt-2">
          Change your password here. We recommend using a strong, unique password.
        </p>
      </TabsContent>
      <TabsContent value="notifications">
        <p className="text-sm text-muted-foreground pt-2">
          Configure how you receive notifications. Choose email, push, or both.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const LineTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground pt-4">
          A high-level summary of your store performance this month.
        </p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground pt-4">
          Detailed analytics including traffic sources and conversion rates.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground pt-4">
          Download and schedule automated reports for your team.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <p className="text-sm text-muted-foreground pl-4">
          Manage your general account preferences and display name.
        </p>
      </TabsContent>
      <TabsContent value="security">
        <p className="text-sm text-muted-foreground pl-4">
          Two-factor authentication and session management.
        </p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="text-sm text-muted-foreground pl-4">
          View invoices and update your payment method.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
