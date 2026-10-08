import type { IllustrationGuidance } from './types.ts';

export const illustrationGuidance = [
  {
    component: 'NoResultsIllustration',
    use: 'A search or filter matched nothing.',
    notFor: 'A list that is empty before any filter (use the scenario illustration).',
  },
  {
    component: 'EmptyCollectionIllustration',
    use: 'Nothing exists yet; the default first-run empty collection.',
    notFor: 'A list with a scenario illustration below; use that one first.',
  },
  {
    component: 'NoOrdersIllustration',
    use: 'An order or checkout list has no entries yet.',
    notFor: 'Orders filtered to zero (NoResults).',
  },
  {
    component: 'NoProductsIllustration',
    use: 'An empty catalog: no products, variants, or collection contents yet.',
    notFor: 'Promotions (NoPromotions); products filtered to zero (NoResults).',
  },
  {
    component: 'NoPromotionsIllustration',
    use: 'No promotions, discounts, or coupon codes set up yet.',
    notFor: 'An empty catalog (NoProducts).',
  },
  {
    component: 'NoCustomersIllustration',
    use: 'A customer list or customer group with nobody in it yet.',
    notFor: 'A team or member list (NoMembers).',
  },
  {
    component: 'NoProjectsIllustration',
    use: 'A list of projects is empty, for example a customer with no projects or only archived ones.',
    notFor: 'The first-run "create your first project" moment (FirstRun).',
  },
  {
    component: 'FirstRunIllustration',
    use: 'A genuine onboarding moment for a feature that has never been configured.',
    notFor: 'An ordinary list that is still empty (EmptyCollection or the scenario illustration).',
  },
  {
    component: 'EmptyMediaIllustration',
    use: 'An empty media or asset library.',
    notFor: 'A drop target (UploadDropzone).',
  },
  {
    component: 'UploadDropzoneIllustration',
    use: 'An empty drag-and-drop upload target.',
    notFor: 'A media library that is empty (EmptyMedia).',
  },
  {
    component: 'NoMembersIllustration',
    use: 'An empty team, member, or administrator list.',
    notFor: 'Customers (NoCustomers).',
  },
  {
    component: 'NoKeysIllustration',
    use: 'No API keys or access tokens exist yet.',
    notFor: 'A permission failure (AccessDenied).',
  },
  {
    component: 'NoDocumentsIllustration',
    use: 'No licenses, certificates, or similar issued documents exist.',
    notFor: 'Invoices (NoInvoices).',
  },
  {
    component: 'NoInvoicesIllustration',
    use: 'A billing page with no invoices or receipts yet.',
    notFor: 'An invoice whose payment failed (PaymentFailed).',
  },
  {
    component: 'NoSubscriptionIllustration',
    use: 'A project or account has no plan or subscription yet.',
    notFor: 'A trial that ended (Expired); a failed payment (PaymentFailed).',
  },
  {
    component: 'NoPluginsIllustration',
    use: 'No plugins, extensions, or packages are installed.',
    notFor: 'A project with no plan that grants packages (NoSubscription).',
  },
  {
    component: 'NoActivityIllustration',
    use: 'An audit log, history, or timeline is empty.',
    notFor: 'Output from a running process (NoLogs).',
  },
  {
    component: 'NoLogsIllustration',
    use: 'An empty log stream has captured nothing.',
    notFor: 'An audit or activity history (NoActivity).',
  },
  {
    component: 'NoNotificationsIllustration',
    use: 'An empty notifications or alerts panel; the user is caught up.',
    notFor: 'A finished task (Success).',
  },
  {
    component: 'NoDeploymentsIllustration',
    use: 'An environment has never been deployed or bound to a runtime.',
    notFor: 'A failed deploy (Error).',
  },
  {
    component: 'EmptyDatabaseIllustration',
    use: 'No database, backup, or database-like resource exists.',
    notFor: 'A generic empty list (EmptyCollection).',
  },
  {
    component: 'SuccessIllustration',
    use: 'A task finished or a queue has nothing left to do.',
    notFor: 'An empty notifications panel (NoNotifications).',
  },
  {
    component: 'PendingApprovalIllustration',
    use: 'An invitation or account awaits approval or provisioning.',
    notFor: 'A request that already expired (Expired).',
  },
  {
    component: 'ExpiredIllustration',
    use: 'A trial, evaluation, link, or sign-in request ran out of time.',
    notFor: 'A request still waiting on someone (PendingApproval).',
  },
  {
    component: 'PaymentFailedIllustration',
    use: 'A payment did not go through: failed charge, past due, or canceled checkout.',
    notFor: 'No plan at all (NoSubscription); a generic failure (Error).',
  },
  {
    component: 'ErrorIllustration',
    use: 'A generic system failure; the ErrorState default.',
    notFor: 'Network loss (Offline), 404 (NotFound), or 403 (AccessDenied).',
  },
  {
    component: 'NotFoundIllustration',
    use: 'A missing resource or 404; pair with navigation rather than retry.',
    notFor: 'A search with no matches (NoResults).',
  },
  {
    component: 'AccessDeniedIllustration',
    use: 'A permission failure or 403; pair with navigation rather than retry.',
    notFor: 'Access that is still awaiting approval (PendingApproval).',
  },
  {
    component: 'OfflineIllustration',
    use: 'A network or connectivity failure.',
    notFor: 'A server-side failure (Error).',
  },
] as const satisfies readonly IllustrationGuidance[];
