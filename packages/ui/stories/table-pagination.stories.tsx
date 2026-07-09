import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TablePagination } from '../src/components/molecules/data-table/table-pagination.tsx';

const meta = {
  title: 'Molecules/TablePagination',
  component: TablePagination,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageSize: 25,
    totalItems: 132,
  },
  argTypes: {
    page: { control: 'number' },
    pageSize: { control: 'number' },
    totalItems: { control: 'number' },
  },
} satisfies Meta<typeof TablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// Server-mode footer: page-size selector (gated by `onPageSizeChange`) plus
// button-mode prev/next. State lives in the story, as it would in the consumer.
export const ServerMode: Story = {
  render: (args) => {
    const [page, setPage] = useState(args.page);
    const [pageSize, setPageSize] = useState(args.pageSize);
    return (
      <div className="w-[720px]">
        <TablePagination
          {...args}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    );
  },
};

// Range-only: no callbacks wired, so neither the selector nor prev/next render.
export const RangeOnly: Story = {
  render: (args) => (
    <div className="w-[720px]">
      <TablePagination {...args} />
    </div>
  ),
};

// Anchor mode: prev/next are real `<a href>` links for full-page navigation.
// `getPageHref` wins over `onPageChange` for how the controls render.
export const AnchorMode: Story = {
  args: { page: 3 },
  render: (args) => (
    <div className="w-[720px]">
      <TablePagination {...args} getPageHref={(page) => `/products?page=${page}`} />
    </div>
  ),
};

// Empty result: the range collapses to "0 of 0"; wired controls are disabled.
export const Empty: Story = {
  args: { totalItems: 0 },
  render: (args) => (
    <div className="w-[720px]">
      <TablePagination {...args} onPageChange={() => {}} onPageSizeChange={() => {}} />
    </div>
  ),
};
