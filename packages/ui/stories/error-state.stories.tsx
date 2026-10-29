import type { Meta, StoryObj } from '@storybook/react';
import { ShieldAlertIcon } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import { NotFoundIllustration } from '../src/components/molecules/illustrations/not-found.tsx';
import { OfflineIllustration } from '../src/components/molecules/illustrations/offline.tsx';
import { ErrorState } from '../src/components/molecules/state-views/error-state.tsx';

const meta = {
  title: 'Molecules/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: 'Something went wrong',
    description: "We couldn't load orders. This is on us; try again in a moment.",
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

// No `icon` or `illustration` passed — defaults: `ErrorIllustration`, default
// title, `role="alert"`.
export const Playground: Story = {};

// Provide `onRetry` to render the "Try again" button.
export const WithRetry: Story = {
  args: {
    onRetry: () => {},
  },
};

// `retryLabel` overrides the button text (e.g. for i18n).
export const CustomRetryLabel: Story = {
  args: {
    onRetry: () => {},
    retryLabel: 'Reload',
  },
};

// A missing resource can't be retried into existence — swap in
// `NotFoundIllustration` and give a real alternative as children instead of
// `onRetry`.
export const NotFound: Story = {
  args: {
    illustration: <NotFoundIllustration />,
    title: 'Page not found',
    description: "The resource you're looking for doesn't exist or was moved.",
    children: (
      <Button variant="outline" size="sm">
        Go back
      </Button>
    ),
  },
};

// A connectivity failure gets `OfflineIllustration` in place of the default.
export const Offline: Story = {
  args: {
    illustration: <OfflineIllustration />,
    title: "You're offline",
    description: 'Check your connection. We’ll keep trying in the background.',
    onRetry: () => {},
    retryLabel: 'Retry now',
  },
};

// `icon` is the pre-illustration API: a small destructive-tinted icon.
// Passing it (without `illustration`) keeps working exactly as it did before
// illustrations existed — no migration required.
export const WithIcon: Story = {
  args: {
    icon: <ShieldAlertIcon />,
    title: 'Access denied',
    description: "You don't have permission to view this order.",
  },
};

// `illustration={null}` opts out entirely, falling back to `icon` (the
// default alert triangle, unless overridden). Reach for this in tight spaces
// where a full illustration would be clutter; see the guidance page.
export const WithoutIllustration: Story = {
  args: {
    illustration: null,
    onRetry: () => {},
  },
};

/**
 * `size="compact"` for a small panel or side column: no illustration, tighter
 * spacing, title, description and at most one action. `bordered={false}` sits
 * flush inside the card.
 */
export const CompactInPanel: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>Usage this month</CardTitle>
      </CardHeader>
      <CardContent>
        <ErrorState
          size="compact"
          bordered={false}
          title="Couldn't load usage"
          description="This is on us. Try again in a moment."
          onRetry={() => {}}
        />
      </CardContent>
    </Card>
  ),
};

/** `bordered={false}` when the error replaces a table body: the table owns its perimeter. */
export const InTableBody: Story = {
  render: () => (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deployment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={2} className="p-0">
              <ErrorState
                bordered={false}
                description="We couldn't load deployments. Try again in a moment."
                onRetry={() => {}}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
