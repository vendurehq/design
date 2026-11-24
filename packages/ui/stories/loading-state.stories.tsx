import type { Meta, StoryObj } from '@storybook/react';
import { Package, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Avatar, AvatarFallback } from '../src/components/atoms/avatar.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../src/components/atoms/card.tsx';
import { Field, FieldLabel } from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import { DescriptionList, DescriptionListItem } from '../src/components/molecules/description-list.tsx';
import {
  ListRow,
  ListRowContent,
  ListRowLeading,
  ListRowLink,
  ListRowMeta,
  ListRowTrailing,
} from '../src/components/molecules/list-row.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';
import { LoadingState } from '../src/components/molecules/state-views/loading-state.tsx';
import {
  SkeletonCard,
  SkeletonFact,
  SkeletonField,
  SkeletonListRow,
  SkeletonPageHeader,
} from '../src/components/molecules/state-views/skeleton-parts.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Molecules/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  args: {
    variant: 'skeleton',
    rows: 5,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['skeleton', 'spinner'],
    },
    rows: { control: { type: 'number', min: 1, max: 10 } },
    label: { control: 'text' },
    delay: { control: { type: 'number', min: 0, step: 50 } },
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// Default: five shimmer rows sized for tables/lists.
export const Skeleton: Story = {
  args: { variant: 'skeleton' },
};

// Tighter rows via `rowClassName` for dense lists.
export const CompactRows: Story = {
  args: { variant: 'skeleton', rows: 6, rowClassName: 'h-10' },
};

// Centered spinner for compact or unknown-height regions.
export const SpinnerVariant: Story = {
  args: { variant: 'spinner' },
};

// A visible label sits with the placeholder; an sr-only "Loading…" is always
// present for assistive tech regardless.
export const WithLabel: Story = {
  args: { variant: 'spinner', label: 'Loading deployments…' },
};

// ── delay ────────────────────────────────────────────────────────────────────

function outputOf(canvasElement: HTMLElement) {
  const output = canvasElement.querySelector<HTMLElement>('[data-slot="loading-state"]');
  if (!output) throw new Error('LoadingState not rendered');
  return output;
}

/**
 * Nothing shows for the first 150ms: a load that ends sooner never flashes a
 * placeholder. The space is held from the start, so nothing jumps when it
 * appears. The play test pauses the entry animation and steps through it.
 */
export const Delay: Story = {
  args: { variant: 'skeleton', rows: 3 },
  play: async ({ canvasElement }) => {
    const output = outputOf(canvasElement);
    const [entry] = output.getAnimations();
    if (!entry) throw new Error('No entry animation');
    await expect(entry.effect?.getTiming().delay).toBe(150);
    entry.pause();
    entry.currentTime = 0;
    await expect(getComputedStyle(output).opacity).toBe('0');
    entry.currentTime = 149;
    await expect(getComputedStyle(output).opacity).toBe('0');
    entry.finish();
    await expect(getComputedStyle(output).opacity).toBe('1');
    // The region holds its height while it is still transparent.
    await expect(output.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};

/** `delay={0}` shows the placeholder at once, with no entry animation. */
export const NoDelay: Story = {
  args: { variant: 'skeleton', rows: 3, delay: 0 },
  play: async ({ canvasElement }) => {
    const output = outputOf(canvasElement);
    await expect(output.getAnimations()).toHaveLength(0);
    await expect(getComputedStyle(output).opacity).toBe('1');
  },
};

// ── skeleton parts next to the real component ────────────────────────────────

function Pair({ real, skeleton }: { real: ReactNode; skeleton: ReactNode }) {
  return (
    <div className="grid max-w-5xl gap-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-muted-foreground font-mono text-xs">Loaded</p>
        <div data-pair="real">{real}</div>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-muted-foreground font-mono text-xs">Loading</p>
        <div data-pair="skeleton">
          <LoadingState delay={0}>{skeleton}</LoadingState>
        </div>
      </div>
    </div>
  );
}

/** Each `[data-pair=real] <selector>` is as tall as its skeleton counterpart, in order. */
async function expectSameHeights(canvasElement: HTMLElement, realSelector: string, skeletonSelector: string) {
  const real = [...canvasElement.querySelectorAll<HTMLElement>(`[data-pair="real"] ${realSelector}`)];
  const skeleton = [
    ...canvasElement.querySelectorAll<HTMLElement>(`[data-pair="skeleton"] ${skeletonSelector}`),
  ];
  await expect(real.length).toBeGreaterThan(0);
  await expect(skeleton).toHaveLength(real.length);
  for (const [i, element] of real.entries()) {
    await expectPx(
      skeleton[i]?.getBoundingClientRect().height,
      element.getBoundingClientRect().height,
      `${skeletonSelector} #${i + 1} is as tall as the real component`,
    );
  }
}

const ROW_CARD = 'gap-0 py-0';

/**
 * SkeletonListRow next to a ListRow: one-line and two-line rows, with an icon,
 * an avatar or no leading media. 48px with one line, 60px with the meta line.
 */
export const ListRowPart: Story = {
  render: () => (
    <Pair
      real={
        <Card className={ROW_CARD}>
          <ListRow>
            <ListRowLeading>
              <Package />
            </ListRowLeading>
            <ListRowContent>
              <ListRowLink onClick={() => {}}>Product import</ListRowLink>
              <ListRowMeta>1,240 rows · finished in 42s</ListRowMeta>
            </ListRowContent>
            <ListRowTrailing>
              <Button size="sm" variant="outline">
                Retry
              </Button>
            </ListRowTrailing>
          </ListRow>
          <ListRow>
            <ListRowLeading>
              <Avatar>
                <AvatarFallback>MO</AvatarFallback>
              </Avatar>
            </ListRowLeading>
            <ListRowContent>
              <ListRowLink onClick={() => {}}>Mara Okafor</ListRowLink>
              <ListRowMeta>Owner · joined in 2024</ListRowMeta>
            </ListRowContent>
            <ListRowTrailing>
              <Button size="sm" variant="outline">
                Manage
              </Button>
            </ListRowTrailing>
          </ListRow>
          <ListRow>
            <ListRowContent>
              <ListRowLink onClick={() => {}}>Order SB-2043</ListRowLink>
            </ListRowContent>
            <ListRowTrailing>14:02</ListRowTrailing>
          </ListRow>
        </Card>
      }
      skeleton={
        <Card className={ROW_CARD}>
          <SkeletonListRow />
          <SkeletonListRow leading="avatar" />
          <SkeletonListRow leading="none" meta={false} action={false} />
        </Card>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSameHeights(canvasElement, '[data-slot="list-row"]', '[data-skeleton="list-row"]');
  },
};

/**
 * SkeletonCard next to a Card: a one-line header over body lines, and a header
 * with a description and an action.
 */
export const CardPart: Story = {
  render: () => (
    <Pair
      real={
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Build settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Builds run on every push to the main branch.</p>
              <p>Node 22 with the default install command.</p>
              <p>Output directory: dist</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>Who can change this project.</CardDescription>
              <CardAction>
                <Button size="sm" variant="outline">
                  Invite
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p>3 members across 2 roles.</p>
              <p>The owner can transfer the project.</p>
            </CardContent>
          </Card>
        </div>
      }
      skeleton={
        <div className="flex flex-col gap-4">
          <SkeletonCard lines={3} />
          <SkeletonCard description action lines={2} />
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSameHeights(canvasElement, '[data-slot="card"]', '[data-skeleton="card"]');
  },
};

/** SkeletonField next to a Field with an Input: the label above a 34px control. */
export const FieldPart: Story = {
  render: () => (
    <Pair
      real={
        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="skeleton-story-name">Project name</FieldLabel>
            <Input id="skeleton-story-name" defaultValue="Storefront" />
          </Field>
          <Field>
            <FieldLabel htmlFor="skeleton-story-region">Region</FieldLabel>
            <Input id="skeleton-story-region" defaultValue="eu-central" />
          </Field>
        </div>
      }
      skeleton={
        <div className="flex flex-col gap-4">
          <SkeletonField />
          <SkeletonField />
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSameHeights(canvasElement, '[data-slot="field"]', '[data-skeleton="field"]');
  },
};

/** SkeletonFact next to a DescriptionListItem: the label above the value. */
export const FactPart: Story = {
  render: () => (
    <Pair
      real={
        <DescriptionList>
          <DescriptionListItem label="Region">eu-central</DescriptionListItem>
          <DescriptionListItem label="Created">12 March 2026</DescriptionListItem>
        </DescriptionList>
      }
      skeleton={
        <div className="flex flex-col gap-4">
          <SkeletonFact />
          <SkeletonFact />
        </div>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSameHeights(canvasElement, '[data-slot="description-item"]', '[data-skeleton="fact"]');
  },
};

/** SkeletonPageHeader next to a PageHeader: title, description and an action. */
export const PageHeaderPart: Story = {
  render: () => (
    <Pair
      real={
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Environments</PageHeaderTitle>
            <PageHeaderDescription>Where this project runs.</PageHeaderDescription>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button>
              <Plus data-icon="inline-start" />
              New environment
            </Button>
          </PageHeaderActions>
        </PageHeader>
      }
      skeleton={<SkeletonPageHeader />}
    />
  ),
  play: async ({ canvasElement }) => {
    await expectSameHeights(canvasElement, '[data-slot="page-header"]', '[data-skeleton="page-header"]');
  },
};

// ── a composed page ──────────────────────────────────────────────────────────

/**
 * A whole page while it loads: one LoadingState holds the page header, a card
 * of facts, a settings form and a list card. Screen readers hear "Loading…"
 * once; the parts are hidden from them.
 */
export const ComposedPage: Story = {
  render: () => (
    <LoadingState className="max-w-4xl gap-6">
      <SkeletonPageHeader actions={2} />
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard>
          <CardContent className="flex flex-col gap-4">
            <SkeletonFact />
            <SkeletonFact />
          </CardContent>
        </SkeletonCard>
        <SkeletonCard description>
          <CardContent className="flex flex-col gap-4">
            <SkeletonField />
            <SkeletonField />
          </CardContent>
        </SkeletonCard>
      </div>
      <Card className={ROW_CARD}>
        <SkeletonListRow />
        <SkeletonListRow />
        <SkeletonListRow />
      </Card>
    </LoadingState>
  ),
  play: async ({ canvasElement }) => {
    const output = outputOf(canvasElement);
    // One live region with one label; every part is hidden from assistive tech.
    await expect(output.getAttribute('aria-live')).toBe('polite');
    await expect(output.querySelectorAll('.sr-only')).toHaveLength(1);
    const parts = output.querySelectorAll('[data-skeleton]');
    await expect(parts.length).toBeGreaterThan(0);
    for (const part of parts) {
      await expect(part.closest('[aria-hidden="true"]')).not.toBeNull();
    }
  },
};
