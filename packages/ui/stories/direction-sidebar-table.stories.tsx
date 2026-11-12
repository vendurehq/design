import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { FolderIcon } from 'lucide-react';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from '../src/components/atoms/sidebar.tsx';
import { DataTable, DataTableRowLink } from '../src/components/molecules/data-table/data-table.tsx';

type Dir = 'ltr' | 'rtl';

const meta = {
  title: 'Atoms/Layout/Direction sidebar and table',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Product = { id: string; name: string; sku: string };

const products: Product[] = [
  { id: '1', name: 'Laptop 13 inch', sku: 'L2201' },
  { id: '2', name: 'Desk lamp', sku: 'D0412' },
];

// The leading column's start padding and every other column's carry the
// column indent (`--column-indent`), so these two columns cover both kinds.
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <DataTableRowLink href={`#/products/${row.original.id}`}>{row.original.name}</DataTableRowLink>,
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => <span data-testid="sku" className="font-mono text-xs">{row.original.sku}</span>,
  },
];

/** A sidebar with an open sub-list, and a DataTable with selection. */
function SidebarAndTable({ dir }: { dir: Dir }) {
  const [selection, setSelection] = useState<RowSelectionState>({ '1': true });
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} className="flex items-start gap-8 p-8">
        <SidebarProvider className="min-h-0 w-auto">
          <div data-sidebar="sidebar" className="bg-sidebar text-sidebar-foreground w-56 rounded-lg border" data-testid="sidebar">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FolderIcon />
                    <span>Catalog</span>
                  </SidebarMenuButton>
                  <SidebarMenuSub data-testid="sub-list">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#" isActive data-testid="sub-button">
                        <span>Products</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#">
                        <span>Collections</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarProvider>
        {/* The SKU column has no fixed width, so it fills the rest of the row. */}
        <div className="w-[420px]" data-testid="table">
          <DataTable<Product>
            rows={products}
            columns={columns}
            getRowId={(product) => product.id}
            rowSelection={{ value: selection, onChange: setSelection }}
          />
        </div>
      </div>
    </DirectionProvider>
  );
}

function byId(root: HTMLElement, id: string) {
  const el = root.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) throw new Error(`No element ${id}`);
  return el;
}

/** The box of an element's text. */
function textBox(el: Element) {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect();
}

/** The gaps, in px, from the start edge of each part's container, as left to right draws them. */
const START_GAPS = {
  subListLine: 26,
  subButton: 36,
  selectCheckbox: 8,
  nameHeader: 32,
  nameCell: 32,
  skuHeaderToCell: 0,
};

/**
 * Measures each part from the start edge of its container: the right edge in
 * right to left, the left edge in left to right. Both directions match.
 */
async function expectStartGaps(root: HTMLElement, dir: Dir) {
  const fromStart = (part: DOMRect, container: DOMRect) =>
    Math.round(dir === 'rtl' ? container.right - part.right : part.left - container.left);
  const sidebar = byId(root, 'sidebar').getBoundingClientRect();
  const subList = byId(root, 'sub-list');
  const line = subList.getBoundingClientRect();
  const lineWidth = parseFloat(getComputedStyle(subList).borderInlineStartWidth);
  const lineBox = new DOMRect(dir === 'rtl' ? line.right - lineWidth : line.left, line.top, lineWidth, line.height);
  const table = byId(root, 'table');
  const skuCell = table.querySelector<HTMLElement>('tbody td[data-column-id="sku"]')!;
  const row = table.querySelector<HTMLElement>('tbody tr')!.getBoundingClientRect();
  const checkbox = table.querySelector<HTMLElement>('tbody [role=checkbox]')!.getBoundingClientRect();
  const nameHeader = textBox(table.querySelector('thead th[data-column-id="name"]') ?? [...table.querySelectorAll('thead th')][1]!);
  const nameCell = textBox(table.querySelector('tbody a')!);
  const skuHeader = textBox(table.querySelector('thead th[data-column-id="sku"]') ?? [...table.querySelectorAll('thead th')][2]!);
  const skuText = skuCell.querySelector('[data-testid=sku]')!.getBoundingClientRect();
  const gaps = {
    subListLine: fromStart(lineBox, sidebar),
    subButton: fromStart(byId(root, 'sub-button').getBoundingClientRect(), sidebar),
    selectCheckbox: fromStart(checkbox, row),
    nameHeader: fromStart(nameHeader, row),
    nameCell: fromStart(nameCell, row),
    skuHeaderToCell: Math.round(dir === 'rtl' ? skuHeader.right - skuText.right : skuText.left - skuHeader.left),
  };
  // Compared as text, so a failure prints every gap.
  await expect(JSON.stringify(gaps)).toBe(JSON.stringify(START_GAPS));
}

/** Right to left: the sub-list line, the select gutter and the cell padding mirror. */
export const SidebarAndTableRightToLeft: Story = {
  render: () => <SidebarAndTable dir="rtl" />,
  play: async ({ canvasElement }) => expectStartGaps(canvasElement, 'rtl'),
};

/** Left to right, the same parts: the look this change keeps. */
export const SidebarAndTableLeftToRight: Story = {
  render: () => <SidebarAndTable dir="ltr" />,
  play: async ({ canvasElement }) => expectStartGaps(canvasElement, 'ltr'),
};
