import type { ScreenRecipe } from './types.ts';

const dashboardPageImports = `import { Page, PageLayout, PageTitle } from '@vendure/dashboard';`;

const standalonePageImports = `import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderTitle,
} from '@vendure-io/ui/components/molecules/page-header';`;

export const screenRecipes = [
  {
    id: 'collection-list',
    title: 'Collection/list page',
    purpose: 'Find, filter, inspect, and act on a collection of domain records.',
    invariants: [
      'Put page identity and the single create/import primary action in the page header.',
      'Prefer DataTable when sorting, filtering, selection, pagination, and column state must coordinate.',
      'Keep URL state, fetching, permissions, and persistence in the consumer.',
      'Render LoadingState while the query is in flight, ErrorState on failure, a first-run EmptyState when nothing exists, and a filtered EmptyState when the query hides existing records.',
      'Use a scenario illustration only for the whole empty region; never repeat it in rows.',
    ],
    dashboardSkeleton: `${dashboardPageImports}
import { DataTable, FullWidthPageBlock } from '@vendure/dashboard';

export function EntityListPage() {
  return (
    <Page pageId='entity-list'>
      <PageTitle>Entities</PageTitle>
      <PageLayout>
        <FullWidthPageBlock blockId='entity-list-table'>
          <DataTable /* consumer-owned data and URL state */ />
        </FullWidthPageBlock>
      </PageLayout>
    </Page>
  );
}

// Register page-level actions through the dashboard action APIs when the host
// owns their placement; import all UI from @vendure/dashboard.`,
    standaloneSkeleton: `${standalonePageImports}
import { Button } from '@vendure-io/ui/components/atoms/button';
import { DataTable } from '@vendure-io/ui/components/molecules/data-table/data-table';

export function EntityListPage() {
  return (
    <main className='space-y-6'>
      <PageHeader>
        <PageHeaderContent><PageHeaderTitle>Entities</PageHeaderTitle></PageHeaderContent>
        <PageHeaderActions><Button>Create entity</Button></PageHeaderActions>
      </PageHeader>
      <DataTable /* consumer-owned data and URL state */ />
    </main>
  );
}`,
  },
  {
    id: 'entity-detail-edit',
    title: 'Entity detail/edit page',
    purpose: 'Understand one entity, edit its fields, and perform consequential actions.',
    invariants: [
      'Use the entity name as the page title and place identity or state beside it, never controls.',
      'Keep one primary save or next-step action; move secondary actions down or into overflow.',
      'Group editable fields by user task rather than database shape.',
      'Use DescriptionList for read-only facts and Field composition for editable values.',
      'Keep destructive actions outside the normal save path and confirm only when the consequence earns interruption.',
      'Render the detail region through explicit loading, error, not-found, and permission states.',
    ],
    dashboardSkeleton: `${dashboardPageImports}
import { PageBlock } from '@vendure/dashboard';

export function EntityDetailPage() {
  return (
    <Page pageId='entity-detail'>
      <PageTitle>Entity name</PageTitle>
      <PageLayout>
        <PageBlock column='main' blockId='entity-form'>
          <form>{/* dashboard form context and grouped fields */}</form>
        </PageBlock>
        <PageBlock column='side' blockId='entity-metadata'>
          {/* status, identifiers, and read-only facts */}
        </PageBlock>
      </PageLayout>
    </Page>
  );
}`,
    standaloneSkeleton: `${standalonePageImports}
import { Button } from '@vendure-io/ui/components/atoms/button';
import { DescriptionList } from '@vendure-io/ui/components/molecules/description-list';

export function EntityDetailPage() {
  return (
    <main className='space-y-6'>
      <PageHeader>
        <PageHeaderContent><PageHeaderTitle>Entity name</PageHeaderTitle></PageHeaderContent>
        <PageHeaderActions><Button type='submit' form='entity-form'>Save</Button></PageHeaderActions>
      </PageHeader>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
        <form id='entity-form'>{/* grouped Field compositions */}</form>
        <aside>{/* DescriptionList, status, and support metadata */}</aside>
      </div>
    </main>
  );
}`,
  },
  {
    id: 'create-form',
    title: 'Create/form page',
    purpose: 'Guide a user through entering and validating a new domain object.',
    invariants: [
      'Use a task-oriented title such as Create product only when the page is genuinely a creation flow.',
      'Keep fields in a short, natural workflow and disclose optional or advanced sections progressively.',
      'Use visible labels, stable descriptions, actionable errors, and matching Field/control invalid state.',
      'Keep form-state plumbing host-owned: dashboard form APIs for extensions and the existing library for standalone apps.',
      'Place a neutral cancel before the single primary submit action; preserve values and prevent duplicate submission while pending.',
    ],
    dashboardSkeleton: `${dashboardPageImports}
import { PageBlock } from '@vendure/dashboard';

export function CreateEntityPage() {
  return (
    <Page pageId='create-entity'>
      <PageTitle>Create entity</PageTitle>
      <PageLayout>
        <PageBlock column='main' blockId='create-entity-form'>
          <form>{/* dashboard form context, fields, cancel, and submit */}</form>
        </PageBlock>
      </PageLayout>
    </Page>
  );
}`,
    standaloneSkeleton: `${standalonePageImports}
import { Button } from '@vendure-io/ui/components/atoms/button';
import { Field, FieldContent, FieldLabel } from '@vendure-io/ui/components/atoms/field';
import { Input } from '@vendure-io/ui/components/atoms/input';

export function CreateEntityPage() {
  return (
    <main className='space-y-6'>
      <PageHeader>
        <PageHeaderContent><PageHeaderTitle>Create entity</PageHeaderTitle></PageHeaderContent>
      </PageHeader>
      <form className='max-w-3xl space-y-6'>
        <Field>
          <FieldLabel htmlFor='name'>Name</FieldLabel>
          <FieldContent><Input id='name' name='name' /></FieldContent>
        </Field>
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline'>Cancel</Button>
          <Button type='submit'>Create entity</Button>
        </div>
      </form>
    </main>
  );
}`,
  },
  {
    id: 'dashboard-overview',
    title: 'Dashboard/overview page',
    purpose: 'Orient the user with a small number of high-value metrics and next actions.',
    invariants: [
      'Start with the page purpose, not a wall of equally weighted cards.',
      'Use only a few StatCards for page-framing KPIs; use charts for shape over time and inline facts for local context.',
      'Every delta states its comparison window and maps tone by consequence rather than arrow direction.',
      'Use sections with descriptive headings and keep the single primary action in the page header.',
      'Give each data region its own loading, empty, and error handling without repeating whole-view illustrations.',
    ],
    dashboardSkeleton: `${dashboardPageImports}
import { PageBlock, StatCard } from '@vendure/dashboard';

export function OverviewPage() {
  return (
    <Page pageId='overview'>
      <PageTitle>Overview</PageTitle>
      <PageLayout>
        <PageBlock column='full' blockId='key-metrics'>
          <div className='grid gap-4 md:grid-cols-3'>{/* a few StatCards */}</div>
        </PageBlock>
        <PageBlock column='main' blockId='activity'>{/* primary trend or activity */}</PageBlock>
        <PageBlock column='side' blockId='attention'>{/* items needing attention */}</PageBlock>
      </PageLayout>
    </Page>
  );
}`,
    standaloneSkeleton: `${standalonePageImports}
import { StatCard } from '@vendure-io/ui/components/molecules/stat-card';

export function OverviewPage() {
  return (
    <main className='space-y-6'>
      <PageHeader>
        <PageHeaderContent><PageHeaderTitle>Overview</PageHeaderTitle></PageHeaderContent>
      </PageHeader>
      <section aria-labelledby='key-metrics' className='grid gap-4 md:grid-cols-3'>
        {/* a few StatCards with explicit comparison windows */}
      </section>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]'>
        <section>{/* primary trend or activity */}</section>
        <aside>{/* items needing attention */}</aside>
      </div>
    </main>
  );
}`,
  },
  {
    id: 'settings',
    title: 'Settings page',
    purpose: 'Organize durable configuration into understandable sections with safe save behavior.',
    invariants: [
      'Group settings by user goal and consequence, not by the backing configuration object.',
      'Keep section titles and descriptions stable so users can scan before editing.',
      'Use Field composition for editable settings and DescriptionList for inherited or read-only values.',
      'Clarify whether save applies per section or to the whole page; never mix both models silently.',
      'Separate destructive resets, disconnects, and removals from routine saving and confirm only consequential outcomes.',
    ],
    dashboardSkeleton: `${dashboardPageImports}
import { PageBlock } from '@vendure/dashboard';

export function SettingsPage() {
  return (
    <Page pageId='settings'>
      <PageTitle>Settings</PageTitle>
      <PageLayout>
        <PageBlock column='main' blockId='general-settings'>
          <form>{/* one clearly scoped settings form */}</form>
        </PageBlock>
        <PageBlock column='side' blockId='settings-context'>
          {/* inherited values, scope, and consequences */}
        </PageBlock>
      </PageLayout>
    </Page>
  );
}`,
    standaloneSkeleton: `${standalonePageImports}
import { Button } from '@vendure-io/ui/components/atoms/button';

export function SettingsPage() {
  return (
    <main className='space-y-6'>
      <PageHeader>
        <PageHeaderContent><PageHeaderTitle>Settings</PageHeaderTitle></PageHeaderContent>
      </PageHeader>
      <form className='max-w-4xl space-y-8'>
        <section aria-labelledby='general-settings'>{/* grouped Fields */}</section>
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline'>Cancel</Button>
          <Button type='submit'>Save changes</Button>
        </div>
      </form>
    </main>
  );
}`,
  },
] as const satisfies readonly ScreenRecipe[];
