import type { Meta, StoryObj } from '@storybook/react';
import { ListFilterIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import { Chip } from '../src/components/molecules/chip.tsx';
import {
  ListHeader,
  ListHeaderChips,
  ListHeaderControls,
} from '../src/components/molecules/data-table/list-header.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '../src/components/molecules/page-header.tsx';

const meta = {
  title: 'Molecules/ListHeader',
  component: ListHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ListHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Full three zones: PageHeader by composition, a control row, and the chip row
// the consumer renders because filters are active.
export const Default: Story = {
  render: () => (
    <ListHeader>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Orders</PageHeaderTitle>
          <PageHeaderDescription>Track and fulfill customer orders.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Export</Button>
          <Button>
            <PlusIcon />
            New order
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <ListHeaderControls>
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search orders" />
        </InputGroup>
        <Button variant="outline">
          <ListFilterIcon />
          Filter
        </Button>
      </ListHeaderControls>
      <ListHeaderChips>
        <Chip onRemove={() => {}} removeLabel="Remove status filter">
          Status <span className="text-muted-foreground">is Paid</span>
        </Chip>
        <Chip onRemove={() => {}} removeLabel="Remove channel filter">
          Channel <span className="text-muted-foreground">is Europe</span>
        </Chip>
      </ListHeaderChips>
    </ListHeader>
  ),
};

// No active filters: the consumer simply omits the chip row.
export const NoFilters: Story = {
  render: () => (
    <ListHeader>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Orders</PageHeaderTitle>
          <PageHeaderDescription>Track and fulfill customer orders.</PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button>
            <PlusIcon />
            New order
          </Button>
        </PageHeaderActions>
      </PageHeader>
      <ListHeaderControls>
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search orders" />
        </InputGroup>
        <Button variant="outline">
          <ListFilterIcon />
          Filter
        </Button>
      </ListHeaderControls>
    </ListHeader>
  ),
};

// Minimal: title row plus a control row, nothing else.
export const Minimal: Story = {
  render: () => (
    <ListHeader>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Customers</PageHeaderTitle>
        </PageHeaderContent>
      </PageHeader>
      <ListHeaderControls>
        <InputGroup className="flex-1">
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search customers" />
        </InputGroup>
      </ListHeaderControls>
    </ListHeader>
  ),
};
