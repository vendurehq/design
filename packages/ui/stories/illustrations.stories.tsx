import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import { AccessDeniedIllustration } from '../src/components/molecules/illustrations/access-denied.tsx';
import { EmptyCollectionIllustration } from '../src/components/molecules/illustrations/empty-collection.tsx';
import { EmptyDatabaseIllustration } from '../src/components/molecules/illustrations/empty-database.tsx';
import { EmptyMediaIllustration } from '../src/components/molecules/illustrations/empty-media.tsx';
import { ErrorIllustration } from '../src/components/molecules/illustrations/error.tsx';
import { ExpiredIllustration } from '../src/components/molecules/illustrations/expired.tsx';
import { FirstRunIllustration } from '../src/components/molecules/illustrations/first-run.tsx';
import type { IllustrationProps } from '../src/components/molecules/illustrations/illustration-types.tsx';
import { NoActivityIllustration } from '../src/components/molecules/illustrations/no-activity.tsx';
import { NoCustomersIllustration } from '../src/components/molecules/illustrations/no-customers.tsx';
import { NoDeploymentsIllustration } from '../src/components/molecules/illustrations/no-deployments.tsx';
import { NoDocumentsIllustration } from '../src/components/molecules/illustrations/no-documents.tsx';
import { NoInvoicesIllustration } from '../src/components/molecules/illustrations/no-invoices.tsx';
import { NoKeysIllustration } from '../src/components/molecules/illustrations/no-keys.tsx';
import { NoLogsIllustration } from '../src/components/molecules/illustrations/no-logs.tsx';
import { NoMembersIllustration } from '../src/components/molecules/illustrations/no-members.tsx';
import { NoNotificationsIllustration } from '../src/components/molecules/illustrations/no-notifications.tsx';
import { NoOrdersIllustration } from '../src/components/molecules/illustrations/no-orders.tsx';
import { NoPluginsIllustration } from '../src/components/molecules/illustrations/no-plugins.tsx';
import { NoProductsIllustration } from '../src/components/molecules/illustrations/no-products.tsx';
import { NoProjectsIllustration } from '../src/components/molecules/illustrations/no-projects.tsx';
import { NoPromotionsIllustration } from '../src/components/molecules/illustrations/no-promotions.tsx';
import { NoResultsIllustration } from '../src/components/molecules/illustrations/no-results.tsx';
import { NoSubscriptionIllustration } from '../src/components/molecules/illustrations/no-subscription.tsx';
import { NotFoundIllustration } from '../src/components/molecules/illustrations/not-found.tsx';
import { OfflineIllustration } from '../src/components/molecules/illustrations/offline.tsx';
import { PaymentFailedIllustration } from '../src/components/molecules/illustrations/payment-failed.tsx';
import { PendingApprovalIllustration } from '../src/components/molecules/illustrations/pending-approval.tsx';
import { SuccessIllustration } from '../src/components/molecules/illustrations/success.tsx';
import { UploadDropzoneIllustration } from '../src/components/molecules/illustrations/upload-dropzone.tsx';

/**
 * The full signature illustration set. Each one is a hand-authored inline
 * SVG, geometric and flat, 1.5 stroke weight throughout, sized off a 160×120
 * viewBox. Colors are design-system slots only — neutral strokes and fills
 * (`stroke-border`, `stroke-muted-foreground`, `fill-muted`, `fill-surface`,
 * `fill-background`) plus exactly one brand-accent element per illustration
 * (per accent rationing: an empty/error moment is a deliberate identity
 * moment, so one tasteful `fill-brand` touch is allowed). For where each one
 * belongs and how to wire it into `EmptyState`/`ErrorState`, see the
 * StateViews guidance page.
 */
const meta = {
  title: 'Molecules/Illustrations',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SET: { name: string; use: string; Illustration: ComponentType<IllustrationProps> }[] = [
  {
    name: 'NoResultsIllustration',
    use: 'A search or filter matched nothing.',
    Illustration: NoResultsIllustration,
  },
  {
    name: 'EmptyCollectionIllustration',
    use: "Nothing exists yet: the default for EmptyState's first-run empties.",
    Illustration: EmptyCollectionIllustration,
  },
  {
    name: 'NoOrdersIllustration',
    use: 'An order/checkout list with nothing in it yet.',
    Illustration: NoOrdersIllustration,
  },
  {
    name: 'ErrorIllustration',
    use: 'The default for ErrorState: a generic failure.',
    Illustration: ErrorIllustration,
  },
  {
    name: 'NotFoundIllustration',
    use: "A 404 or missing resource. Pair with a 'Go back' action, not retry.",
    Illustration: NotFoundIllustration,
  },
  {
    name: 'OfflineIllustration',
    use: 'A network/connectivity failure.',
    Illustration: OfflineIllustration,
  },
  {
    name: 'FirstRunIllustration',
    use: "A genuine onboarding moment — a feature that's never been set up.",
    Illustration: FirstRunIllustration,
  },
  {
    name: 'EmptyMediaIllustration',
    use: 'An empty asset/media library or folder.',
    Illustration: EmptyMediaIllustration,
  },
  {
    name: 'UploadDropzoneIllustration',
    use: 'A drag-and-drop upload target with nothing dropped yet.',
    Illustration: UploadDropzoneIllustration,
  },
  {
    name: 'NoMembersIllustration',
    use: "A team/members list that's empty or awaiting invites.",
    Illustration: NoMembersIllustration,
  },
  {
    name: 'NoKeysIllustration',
    use: 'No API keys or access tokens created yet.',
    Illustration: NoKeysIllustration,
  },
  {
    name: 'NoDocumentsIllustration',
    use: 'No licenses or certificates issued yet.',
    Illustration: NoDocumentsIllustration,
  },
  {
    name: 'NoPluginsIllustration',
    use: 'No plugins or extensions installed.',
    Illustration: NoPluginsIllustration,
  },
  {
    name: 'NoActivityIllustration',
    use: 'An audit log, history, or timeline with no entries yet.',
    Illustration: NoActivityIllustration,
  },
  {
    name: 'NoNotificationsIllustration',
    use: "An empty notifications panel: you're all caught up.",
    Illustration: NoNotificationsIllustration,
  },
  {
    name: 'AccessDeniedIllustration',
    use: 'A permission/authorization failure (403). Pair with "Go back", not retry.',
    Illustration: AccessDeniedIllustration,
  },
  {
    name: 'PendingApprovalIllustration',
    use: 'An invitation or account awaiting approval/provisioning.',
    Illustration: PendingApprovalIllustration,
  },
  {
    name: 'NoDeploymentsIllustration',
    use: 'An environment that has never been deployed.',
    Illustration: NoDeploymentsIllustration,
  },
  {
    name: 'EmptyDatabaseIllustration',
    use: 'No database provisioned yet, or no backups.',
    Illustration: EmptyDatabaseIllustration,
  },
  {
    name: 'NoLogsIllustration',
    use: 'An empty log stream: nothing captured yet.',
    Illustration: NoLogsIllustration,
  },
  {
    name: 'NoProductsIllustration',
    use: 'An empty catalog: no products, variants, or collection contents yet.',
    Illustration: NoProductsIllustration,
  },
  {
    name: 'NoPromotionsIllustration',
    use: 'No promotions, discounts, or coupon codes set up yet.',
    Illustration: NoPromotionsIllustration,
  },
  {
    name: 'NoCustomersIllustration',
    use: 'A customer list or customer group with nobody in it yet.',
    Illustration: NoCustomersIllustration,
  },
  {
    name: 'NoProjectsIllustration',
    use: 'A list of projects that is empty, for example all archived.',
    Illustration: NoProjectsIllustration,
  },
  {
    name: 'NoInvoicesIllustration',
    use: 'A billing page with no invoices or receipts yet.',
    Illustration: NoInvoicesIllustration,
  },
  {
    name: 'NoSubscriptionIllustration',
    use: 'A project or account with no plan or subscription yet.',
    Illustration: NoSubscriptionIllustration,
  },
  {
    name: 'PaymentFailedIllustration',
    use: 'A failed charge, a past-due invoice, or a canceled checkout.',
    Illustration: PaymentFailedIllustration,
  },
  {
    name: 'ExpiredIllustration',
    use: 'A trial, evaluation, link, or sign-in request that ran out of time.',
    Illustration: ExpiredIllustration,
  },
  {
    name: 'SuccessIllustration',
    use: 'A finished task, or a queue with nothing left to do.',
    Illustration: SuccessIllustration,
  },
];

export const Gallery: Story = {
  name: '1 · The full set',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SET.map(({ name, use, Illustration }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
          >
            <Illustration />
            <div>
              <p className="font-mono text-xs font-medium">{name}</p>
              <p className="text-muted-foreground mt-1 text-xs">{use}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: '2 · Scaling via `size`',
  render: () => (
    <div className="text-foreground flex max-w-4xl items-end gap-6 p-1">
      {[64, 96, 128, 160].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <EmptyCollectionIllustration size={size} />
          <p className="text-muted-foreground font-mono text-xs">size={size}</p>
        </div>
      ))}
    </div>
  ),
};

export const Small: Story = {
  name: '3 · The full set at 96 px',
  render: () => (
    <div className="text-foreground grid max-w-4xl grid-cols-3 gap-4 p-1 sm:grid-cols-5">
      {SET.map(({ name, Illustration }) => (
        <div key={name} className="flex flex-col items-center gap-2 text-center">
          <Illustration size={96} />
          <p className="text-muted-foreground font-mono text-xs">
            {name.replace('Illustration', '')}
          </p>
        </div>
      ))}
    </div>
  ),
};
