import type { IllustrationGuidance } from './types.ts';

export const illustrationGuidance = [
  { component: 'NoResultsIllustration', use: 'A search or filter matched nothing.' },
  {
    component: 'EmptyCollectionIllustration',
    use: 'Nothing exists yet; the default first-run empty collection.',
  },
  { component: 'NoOrdersIllustration', use: 'An order or checkout list has no entries yet.' },
  { component: 'ErrorIllustration', use: 'A generic system failure.' },
  {
    component: 'NotFoundIllustration',
    use: 'A missing resource or 404; pair with navigation rather than retry.',
  },
  { component: 'OfflineIllustration', use: 'A network or connectivity failure.' },
  {
    component: 'FirstRunIllustration',
    use: 'A genuine onboarding moment for a feature that has never been configured.',
  },
  { component: 'EmptyMediaIllustration', use: 'An empty media or asset library.' },
  { component: 'UploadDropzoneIllustration', use: 'An empty drag-and-drop upload target.' },
  { component: 'NoMembersIllustration', use: 'An empty team or member list.' },
  { component: 'NoKeysIllustration', use: 'No API keys or access tokens exist yet.' },
  {
    component: 'NoDocumentsIllustration',
    use: 'No licenses, invoices, certificates, or similar documents exist.',
  },
  { component: 'NoPluginsIllustration', use: 'No plugins or extensions are installed.' },
  { component: 'NoActivityIllustration', use: 'An audit log, history, or timeline is empty.' },
  {
    component: 'NoNotificationsIllustration',
    use: 'An empty notifications panel; the user is caught up.',
  },
  {
    component: 'AccessDeniedIllustration',
    use: 'A permission failure or 403; pair with navigation rather than retry.',
  },
  {
    component: 'PendingApprovalIllustration',
    use: 'An invitation or account awaits approval or provisioning.',
  },
  {
    component: 'NoDeploymentsIllustration',
    use: 'An environment has never been deployed.',
  },
  {
    component: 'EmptyDatabaseIllustration',
    use: 'No database, backup, or database-like resource exists.',
  },
  { component: 'NoLogsIllustration', use: 'An empty log stream has captured nothing.' },
] as const satisfies readonly IllustrationGuidance[];
