import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsLink,
  TabsList,
  TabsNav,
  TabsTrigger,
} from '../src/components/atoms/tabs.tsx';

const meta = {
  title: 'Atoms/Data Display/Tabs',
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

// Link tabs: each tab is a route, so this is a <nav> of links with
// aria-current="page" on the current one, not a tablist. Compose a router link
// with `render`, for example `render={<Link to="/billing/invoices" />}`. A
// router that sets aria-current itself does not need `active`.
export const LinkTabs: Story = {
  render: function LinkTabsStory() {
    const sections = ['Overview', 'Invoices', 'Payment methods', 'Tax details'];
    const [current, setCurrent] = useState(sections[0]);
    return (
      <TabsNav aria-label="Account sections">
        {sections.map((section) => (
          <TabsLink
            key={section}
            href={`#${section.toLowerCase().replace(/ /g, '-')}`}
            active={section === current}
            onClick={(event) => {
              event.preventDefault();
              setCurrent(section);
            }}
          >
            {section}
          </TabsLink>
        ))}
      </TabsNav>
    );
  },
};

const thresholds = [5, 10, 20, 50];

// True when the element scrolls vertically: a scroll container whose content is
// taller than its box draws a vertical scrollbar where scrollbars always show.
const scrollsVertically = (element: Element) => element.scrollHeight > element.clientHeight;

/**
 * Tabs in a parent that scrolls sideways, like a Dashboard widget header in a
 * narrow column. The triggers fit, so neither the list nor the parent may draw
 * a scrollbar.
 */
export const InAScrollingParent: Story = {
  render: () => (
    <div data-testid="scroll-parent" className="w-fit max-w-full overflow-x-auto">
      <Tabs defaultValue="5">
        <TabsList>
          {thresholds.map((threshold) => (
            <TabsTrigger key={threshold} value={String(threshold)}>
              {`≤ ${threshold}`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByTestId('scroll-parent');
    await expect(scrollsVertically(parent)).toBe(false);
    await expect(parent.scrollWidth).toBe(parent.clientWidth);
    await expect(scrollsVertically(canvas.getByRole('tablist'))).toBe(false);
  },
};

/**
 * More triggers than fit: the list scrolls sideways by wheel, trackpad or the
 * arrow keys, with no scrollbar and never vertically. Both variants and the
 * link tabs behave the same.
 */
export const Overflowing: Story = {
  render: function OverflowingStory() {
    const sections = ['Overview', 'Invoices', 'Payment methods', 'Tax details', 'Usage', 'Audit log'];
    const [current, setCurrent] = useState(sections[0]);
    return (
      <div className="flex w-64 flex-col gap-6">
        {(['default', 'line'] as const).map((variant) => (
          <Tabs key={variant} defaultValue={sections[0]}>
            <TabsList variant={variant} aria-label={`${variant} tabs`}>
              {sections.map((section) => (
                <TabsTrigger key={section} value={section}>
                  {section}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ))}
        <TabsNav aria-label="Account sections">
          {sections.map((section) => (
            <TabsLink
              key={section}
              href={`#${section.toLowerCase().replace(/ /g, '-')}`}
              active={section === current}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(section);
              }}
            >
              {section}
            </TabsLink>
          ))}
        </TabsNav>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = [
      canvas.getByRole('tablist', { name: 'default tabs' }),
      canvas.getByRole('tablist', { name: 'line tabs' }),
      canvas.getByRole('navigation', { name: 'Account sections' }),
    ];
    for (const box of boxes) {
      await expect(box.clientWidth).toBeLessThanOrEqual(256);
      await expect(box.scrollWidth).toBeGreaterThan(box.clientWidth);
      await expect(scrollsVertically(box)).toBe(false);
      await expect(getComputedStyle(box).scrollbarWidth).toBe('none');
    }
  },
};
