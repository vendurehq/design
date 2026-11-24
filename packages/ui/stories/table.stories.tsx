import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../src/components/atoms/table.tsx';

const meta = {
  title: 'Atoms/Data Display/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = [
  { id: 'INV-001', customer: 'Alice Johnson', email: 'alice@example.com', amount: '$250.00', status: 'Paid' },
  { id: 'INV-002', customer: 'Bob Smith', email: 'bob@example.com', amount: '$150.00', status: 'Pending' },
  { id: 'INV-003', customer: 'Carol White', email: 'carol@example.com', amount: '$350.00', status: 'Paid' },
  { id: 'INV-004', customer: 'Dave Brown', email: 'dave@example.com', amount: '$450.00', status: 'Overdue' },
  { id: 'INV-005', customer: 'Eve Davis', email: 'eve@example.com', amount: '$200.00', status: 'Paid' },
];

/**
 * One-line text sits in the middle of its 48px row: as far from the divider
 * above as from the divider below. The table fits, so its edges do not fade.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('[data-slot=table-container]') as HTMLElement;
    await expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth);
    await expect(container.hasAttribute('data-overflow-start')).toBe(false);
    await expect(container.hasAttribute('data-overflow-end')).toBe(false);
    await expect(getComputedStyle(container).maskImage).toBe('none');
    const rows = [...canvasElement.querySelectorAll('tbody tr')];
    await expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const box = row.getBoundingClientRect();
      await expect(Math.abs(box.height - 48)).toBeLessThanOrEqual(0.5);
      // Measure one line box, not the glyphs: where the glyphs sit inside
      // their line depends on the font's ascent and descent, which differ
      // between machines. A block as tall as the cell's line stands in for
      // the text while it is measured.
      const cell = row.querySelector('td') as HTMLElement;
      const text = [...cell.childNodes];
      const line = document.createElement('div');
      line.style.height = getComputedStyle(cell).lineHeight;
      cell.replaceChildren(line);
      const lineBox = line.getBoundingClientRect();
      cell.replaceChildren(...text);
      // The row box runs from the middle of the divider above to the middle
      // of its own divider, so its centre is the centre of the visible row.
      await expect(Math.abs(lineBox.top + lineBox.height / 2 - (box.top + box.height / 2))).toBeLessThanOrEqual(0.25);
    }
  },
  render: () => (
    <Table>
      <TableCaption>Recent invoices for your account.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>{invoice.customer}</TableCell>
            <TableCell>{invoice.email}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total</TableCell>
          <TableCell className="text-right">$1,400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * A selected row (`data-state="selected"`, the DataTable row-selection marker)
 * next to plain rows, in light and dark. Hover a row to compare hover with
 * selected. Pinned to the light page theme.
 */
export const SelectedRow: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.slice(0, 3).map((invoice, index) => (
              <TableRow key={invoice.id} data-state={index === 1 ? 'selected' : undefined}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell className="text-right">{invoice.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </LightAndDark>
  ),
};

const products = [
  { name: 'Laptop Stand Pro', sku: 'LSP-2041', status: 'Published', stock: 128, price: '$89.00', channel: 'Default channel', updated: '12 Nov 2026' },
  { name: 'Wireless Keyboard', sku: 'WKB-1180', status: 'Draft', stock: 0, price: '$129.00', channel: 'Wholesale', updated: '9 Nov 2026' },
  { name: 'USB-C Hub, 7 ports', sku: 'HUB-0707', status: 'Published', stock: 42, price: '$59.00', channel: 'Default channel', updated: '2 Nov 2026' },
];

/** A table with more columns than its container can show, so it scrolls sideways. */
function WideTable({ pinFirstColumn, selectedSku }: { pinFirstColumn?: boolean; selectedSku?: string }) {
  return (
    <Table pinFirstColumn={pinFirstColumn}>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-end">Stock</TableHead>
          <TableHead className="text-end">Price</TableHead>
          <TableHead>Channel</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.sku} data-state={product.sku === selectedSku ? 'selected' : undefined}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>{product.status}</TableCell>
            <TableCell className="text-end tabular-nums">{product.stock}</TableCell>
            <TableCell className="text-end tabular-nums">{product.price}</TableCell>
            <TableCell>{product.channel}</TableCell>
            <TableCell>{product.updated}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * The tables once their widths are final: a web font that loads later widens
 * the columns, and a scroll made before then stops short of the new end.
 */
async function scrollContainers(canvasElement: HTMLElement) {
  await document.fonts.ready;
  return [...canvasElement.querySelectorAll<HTMLElement>('[data-slot=table-container]')];
}

function cueState(container: HTMLElement) {
  return {
    start: container.hasAttribute('data-overflow-start'),
    end: container.hasAttribute('data-overflow-end'),
  };
}

/** Scrolls to a point and waits for the scroll event to reach the table. */
async function scrollTo(container: HTMLElement, left: number) {
  await new Promise<void>((resolve) => {
    container.addEventListener('scroll', () => requestAnimationFrame(() => resolve()), { once: true });
    container.scrollLeft = left;
  });
}

/**
 * Narrow panels on the page and on a card, in light and dark. Each table is
 * wider than its panel, so it scrolls sideways.
 */
function OverflowPanels({ dir, pinFirstColumn }: { dir?: 'rtl'; pinFirstColumn?: boolean }) {
  // A pinned cell paints the table surface; on the page that is the page
  // background, so the page panel sets `--table-surface`.
  return (
    <LightAndDark>
      {() => (
        <div dir={dir} className="flex flex-col gap-4">
          <div className="max-w-xs [--table-surface:var(--background)]">
            <WideTable pinFirstColumn={pinFirstColumn} />
          </div>
          <div className="bg-card max-w-xs rounded-lg border">
            <WideTable pinFirstColumn={pinFirstColumn} selectedSku={pinFirstColumn ? 'WKB-1180' : undefined} />
          </div>
        </div>
      )}
    </LightAndDark>
  );
}

/**
 * At rest, the far edge fades out, so the cut column reads as cut and more
 * columns sit past the edge. The fade needs no background colour: it is a mask
 * on the scroll container, so it works on the page and on a card alike.
 */
export const OverflowAtRest: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    for (const container of await scrollContainers(canvasElement)) {
      await expect(container.scrollWidth).toBeGreaterThan(container.clientWidth);
      await expect(cueState(container)).toEqual({ start: false, end: true });
      await expect(getComputedStyle(container).maskImage).toContain('linear-gradient');
    }
  },
  render: () => <OverflowPanels />,
};

/**
 * Scrolled part of the way (the tables on the page): both edges fade, since
 * content is hidden past both. Scrolled to the end (the tables on a card):
 * only the start edge fades.
 */
export const OverflowScrolled: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    // Each theme renders a table on the page, then one on a card.
    const containers = await scrollContainers(canvasElement);
    await expect(containers).toHaveLength(4);
    for (const [index, container] of containers.entries()) {
      if (index % 2 === 0) {
        await scrollTo(container, 120);
        await expect(cueState(container)).toEqual({ start: true, end: true });
      } else {
        await scrollTo(container, container.scrollWidth);
        await expect(cueState(container)).toEqual({ start: true, end: false });
      }
    }
  },
  render: () => <OverflowPanels />,
};

/**
 * Right to left, the start edge is on the right. The tables on the page are
 * at rest: the left edge fades. The tables on a card are scrolled part of the
 * way: both edges fade. Scrolled to the end, only the right edge fades.
 */
export const OverflowRightToLeft: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    const containers = await scrollContainers(canvasElement);
    await expect(containers).toHaveLength(4);
    for (const [index, container] of containers.entries()) {
      if (index % 2 === 0) {
        await expect(cueState(container)).toEqual({ start: false, end: true });
      } else {
        await scrollTo(container, -container.scrollWidth);
        await expect(cueState(container)).toEqual({ start: true, end: false });
        await scrollTo(container, -120);
        await expect(cueState(container)).toEqual({ start: true, end: true });
      }
    }
  },
  render: () => <OverflowPanels dir="rtl" />,
};

/** The inline-start offset of a cell inside its scroll container, in px. */
function offsetInContainer(cell: Element, container: HTMLElement) {
  const rtl = getComputedStyle(container).direction === 'rtl';
  const box = cell.getBoundingClientRect();
  const frame = container.getBoundingClientRect();
  return rtl ? frame.right - box.right : box.left - frame.left;
}

function pinnedCells(container: HTMLElement) {
  return [...container.querySelectorAll('tr > :first-child')];
}

/**
 * The pinned edge a cell draws. Read from `--table-pin-edge`, not
 * `box-shadow`: the shadow fades in, and a read right after a scroll would
 * catch it part way.
 */
function pinEdge(cell: Element) {
  return getComputedStyle(cell).getPropertyValue('--table-pin-edge').trim();
}

/**
 * `pinFirstColumn`: the first column stays in place while the others scroll
 * under it. At rest the pinned column has no edge and the end fades as usual.
 * The card table has a selected row: the selected fill shows on the pinned
 * cell too.
 */
export const PinnedFirstColumn: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    for (const container of await scrollContainers(canvasElement)) {
      await expect(container.hasAttribute('data-pin-first-column')).toBe(true);
      await expect(cueState(container)).toEqual({ start: false, end: true });
      for (const cell of pinnedCells(container)) {
        await expect(getComputedStyle(cell).position).toBe('sticky');
        await expect(pinEdge(cell)).toMatch(/^inset 0 0 0/);
      }
    }
  },
  render: () => <OverflowPanels pinFirstColumn />,
};

/**
 * Scrolled part of the way: the pinned column stays at the start edge and
 * shows a 1px edge on its inline-end side, where the other columns pass under
 * it. The start of the table does not fade: the edge replaces the start fade.
 * Scrolling back to the start removes the edge.
 */
export const PinnedFirstColumnScrolled: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    const containers = await scrollContainers(canvasElement);
    await expect(containers).toHaveLength(4);
    for (const container of containers) {
      await scrollTo(container, 120);
      await expect(cueState(container)).toEqual({ start: true, end: true });
      await expect(getComputedStyle(container).getPropertyValue('--table-fade-start').trim()).toBe('0px');
      for (const cell of pinnedCells(container)) {
        await expect(Math.abs(offsetInContainer(cell, container))).toBeLessThanOrEqual(0.5);
        await expect(pinEdge(cell)).toMatch(/^inset -1px 0 0/);
      }
    }
    // Back at the start, the edge goes; then scroll again for the picture.
    const first = containers[0] as HTMLElement;
    await scrollTo(first, 0);
    await expect(cueState(first)).toEqual({ start: false, end: true });
    for (const cell of pinnedCells(first)) {
      await expect(pinEdge(cell)).toMatch(/^inset 0 0 0/);
    }
    await scrollTo(first, 120);
  },
  render: () => <OverflowPanels pinFirstColumn />,
};

/**
 * Right to left, the first column is pinned on the right, and its edge is on
 * its left side.
 */
export const PinnedFirstColumnRightToLeft: Story = {
  globals: { theme: 'light' },
  play: async ({ canvasElement }) => {
    for (const container of await scrollContainers(canvasElement)) {
      await scrollTo(container, -120);
      await expect(cueState(container)).toEqual({ start: true, end: true });
      for (const cell of pinnedCells(container)) {
        await expect(Math.abs(offsetInContainer(cell, container))).toBeLessThanOrEqual(0.5);
        await expect(pinEdge(cell)).toMatch(/^inset 1px 0 0/);
      }
    }
  },
  render: () => <OverflowPanels dir="rtl" pinFirstColumn />,
};
