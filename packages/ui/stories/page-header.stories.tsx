import type { Meta, StoryObj } from '@storybook/react';
import { GitBranchIcon, GlobeIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderBackRow,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderFact,
  PageHeaderFacts,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';

const meta = {
  title: 'Molecules/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Compound-only: assemble the parts. Title + description on the left, actions on the right.
export const Default: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Products</PageHeaderTitle>
        <PageHeaderDescription>Manage your catalog and inventory.</PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Export</Button>
        <Button>
          <PlusIcon />
          New product
        </Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};

// Title only — description and actions are optional.
export const TitleOnly: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Settings</PageHeaderTitle>
      </PageHeaderContent>
    </PageHeader>
  ),
};

// Variance lives as free children: a badge beside the title, a mono id subtitle.
export const WithBadgeAndId: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <div className="flex items-center gap-2">
          <PageHeaderTitle>Order #100234</PageHeaderTitle>
          <Badge variant="outline">Paid</Badge>
        </div>
        <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Refund</Button>
        <Button>Fulfill</Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};

/**
 * PageHeaderBackRow sits above the header as a sibling. PageHeaderBack draws
 * the chevron: on hover the text reaches full foreground and the chevron moves
 * 2px back. Pass `render` for a router link.
 */
export const WithBackLink: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PageHeaderBackRow>
        <PageHeaderBack href="#products">Products</PageHeaderBack>
      </PageHeaderBackRow>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Denim Jacket</PageHeaderTitle>
          <PageHeaderDescription>SKU DJ-001 · 3 variants</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Duplicate</Button>
          <Button>Save</Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  ),
};

// Long titles wrap and stay clear of the actions column.
export const LongTitle: Story = {
  render: () => (
    <div className="max-w-2xl">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>
            Configure the automated fulfillment workflow for the European distribution centers
          </PageHeaderTitle>
          <PageHeaderDescription>
            Applies to all channels routed through the Rotterdam and Hamburg hubs.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button>Save</Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  ),
};

// The row wraps: when title and actions do not fit side by side, the actions
// move to the next line instead of squeezing the title.
export const NarrowViewport: Story = {
  render: () => (
    <div className="max-w-xs">
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Shipping methods</PageHeaderTitle>
          <PageHeaderDescription>Carriers, zones, and delivery rates.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Export</Button>
          <Button>
            <PlusIcon />
            New method
          </Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  ),
};

/**
 * The facts row under the title: an icon at 45% and its text per fact, 18px
 * between facts. It wraps on a narrow screen.
 */
export const WithFacts: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <PageHeaderBackRow>
        <PageHeaderBack href="#environments">Environments</PageHeaderBack>
      </PageHeaderBackRow>
      <PageHeader>
        <PageHeaderContent className="gap-2">
          <PageHeaderTitle>Production</PageHeaderTitle>
          <PageHeaderFacts>
            <PageHeaderFact>
              <GitBranchIcon aria-hidden="true" />
              <span className="font-mono">main</span>
            </PageHeaderFact>
            <PageHeaderFact>
              <MapPinIcon aria-hidden="true" />
              Ireland, Europe <span className="text-muted-foreground">eu-west-1</span>
            </PageHeaderFact>
            <PageHeaderFact>
              <GlobeIcon aria-hidden="true" />
              acme-shop.vendure.cloud
            </PageHeaderFact>
          </PageHeaderFacts>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Redeploy</Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  ),
};
