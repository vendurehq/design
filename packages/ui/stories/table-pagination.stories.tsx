import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, within } from 'storybook/test';
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

/**
 * The footer is one line at every width, whatever the range text, so it keeps
 * its height from the first load to the rows. In a 355px footer (a phone
 * list) the page-size label is visually hidden; it stays the select's name.
 * From the top: loading, "0 of 0", "1–10 of 123,456".
 */
export const OneLineAtEveryWidth: Story = {
  render: (args) => (
    <div className="flex w-[355px] flex-col gap-4">
      {[undefined, 0, 123456].map((total) => (
        <TablePagination
          key={String(total)}
          {...args}
          page={1}
          pageSize={10}
          totalItems={total}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('1–10 of 123,456')).toBeInTheDocument();
    const footers = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-slot="table-pagination"]'),
      (footer) => Math.round(footer.getBoundingClientRect().height),
    );
    await expect(footers).toHaveLength(3);
    await expect(new Set(footers).size).toBe(1);
    // One line: as tall as the prev/next buttons.
    const button = canvasElement.querySelector('[data-slot="table-pagination-next"]');
    await expect(footers[0]).toBe(Math.round(button?.getBoundingClientRect().height ?? 0));
  },
};
