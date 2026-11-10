import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal, Package, RotateCcw, Truck } from 'lucide-react';
import { Fragment, type ReactNode, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { Card } from '../src/components/atoms/card.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowGroupHeading,
  ListRowLeading,
  ListRowLink,
  ListRowMeta,
  ListRowTitle,
  ListRowTrailing,
} from '../src/components/molecules/list-row.tsx';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Molecules/ListRow',
  component: ListRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

// The rows sit on a card surface; the Card clips the hover fill to its corners.
function RowCard({ children }: { children: ReactNode }) {
  return <Card className="max-w-3xl gap-0 py-0">{children}</Card>;
}

const ORDERS: { code: string; customer: string; state: string; tone: Tone; time: string }[] = [
  { code: 'SB-2043', customer: 'Hayden Zieme', state: 'Payment settled', tone: 'success', time: '14:02' },
  { code: 'SB-2042', customer: 'Mara Okafor', state: 'Payment authorized', tone: 'info', time: '13:47' },
  { code: 'SB-2041', customer: 'Liam Becker', state: 'Payment declined', tone: 'critical', time: '12:15' },
];

// One line, 48px. The title is the row link: a click on any point of the row
// opens the order, and the row is one tab stop.
export const Default: Story = {
  render: () => (
    <RowCard>
      {ORDERS.map((order) => (
        <ListRow key={order.code}>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>Order {order.code}</ListRowLink>
          </ListRowContent>
          <ListRowTrailing>
            <StatusBadge tone={order.tone}>{order.state}</StatusBadge>
            <span className="w-12 text-right">{order.time}</span>
          </ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </RowCard>
  ),
};

// A ListRowMeta line makes the row a two-line row. The meta is not part of the
// link's name, so a screen reader announces the title only.
export const TwoLine: Story = {
  render: () => (
    <RowCard>
      {ORDERS.map((order) => (
        <ListRow key={order.code}>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>Order {order.code}</ListRowLink>
            <ListRowMeta>Placed by {order.customer} · 3 items</ListRowMeta>
          </ListRowContent>
          <ListRowTrailing>
            <StatusBadge tone={order.tone}>{order.state}</StatusBadge>
            <span className="w-12 text-right">{order.time}</span>
          </ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </RowCard>
  ),
};

// Leading media: an icon or a status mark at 16px.
export const WithLeading: Story = {
  render: () => (
    <RowCard>
      {[
        { icon: <Package />, title: 'Product import', meta: '1,240 rows · finished in 42s' },
        { icon: <Truck />, title: 'Shipping rates sync', meta: '3 carriers · finished in 8s' },
        { icon: <RotateCcw />, title: 'Search index rebuild', meta: '18,400 variants · finished in 2m' },
      ].map((job) => (
        <ListRow key={job.title}>
          <ListRowLeading>{job.icon}</ListRowLeading>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>{job.title}</ListRowLink>
            <ListRowMeta>{job.meta}</ListRowMeta>
          </ListRowContent>
          <ListRowTrailing>Today</ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </RowCard>
  ),
};

// Row controls stay clickable above the stretched link and keep their own tab
// stop. ListRowActions fades in on hover or focus; on a touch screen it is
// always visible.
export const WithActions: Story = {
  render: () => (
    <RowCard>
      {ORDERS.map((order) => (
        <ListRow key={order.code}>
          <ListRowContent>
            <ListRowLink onClick={() => {}}>Order {order.code}</ListRowLink>
            <ListRowMeta>Placed by {order.customer}</ListRowMeta>
          </ListRowContent>
          <ListRowTrailing>
            <IdChip value={`5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d${order.code.slice(-4)}`} />
            <StatusBadge tone={order.tone}>{order.state}</StatusBadge>
          </ListRowTrailing>
          <ListRowActions>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon-sm" aria-label={`More for order ${order.code}`} />
                }
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Print invoice</DropdownMenuItem>
                <DropdownMenuItem>Resend confirmation</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ListRowActions>
          <ListRowChevron />
        </ListRow>
      ))}
    </RowCard>
  ),
};

// `render` turns the row link into an anchor or a router link element, the
// same way Button takes `render`.
export const AsAnchor: Story = {
  render: () => (
    <RowCard>
      {ORDERS.map((order) => (
        <ListRow key={order.code}>
          <ListRowContent>
            <ListRowLink render={<a href={`#order-${order.code}`} />}>Order {order.code}</ListRowLink>
          </ListRowContent>
          <ListRowTrailing>{order.time}</ListRowTrailing>
          <ListRowChevron />
        </ListRow>
      ))}
    </RowCard>
  ),
};

// A row with no detail page gets no link: ListRowTitle instead of
// ListRowLink, no chevron. The row has no hover fill and no pointer.
export const Static: Story = {
  render: () => (
    <RowCard>
      <ListRow>
        <ListRowContent>
          <ListRowTitle>Nightly backup</ListRowTitle>
          <ListRowMeta>Kept for 14 days</ListRowMeta>
        </ListRowContent>
        <ListRowTrailing>02:00</ListRowTrailing>
      </ListRow>
      <ListRow>
        <ListRowContent>
          <ListRowTitle>Weekly backup</ListRowTitle>
          <ListRowMeta>Kept for 8 weeks</ListRowMeta>
        </ListRowContent>
        <ListRowTrailing>Sunday 03:00</ListRowTrailing>
      </ListRow>
    </RowCard>
  ),
};

// Long titles truncate; the trailing columns keep their width.
export const LongTitle: Story = {
  render: () => (
    <RowCard>
      <ListRow>
        <ListRowContent>
          <ListRowLink onClick={() => {}}>
            Recalculate tax for every open order in the EU channel after the rate change on the first of the month
          </ListRowLink>
          <ListRowMeta>
            Started by Mara Okafor · took 4m 12s · 18,204 orders across 27 tax zones and 4 channels
          </ListRowMeta>
        </ListRowContent>
        <ListRowTrailing>
          <StatusBadge tone="success">Completed</StatusBadge>
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
    </RowCard>
  ),
};

const openOrder = fn();
const printInvoice = fn();

/** A click anywhere on the row opens it; a row control runs its own action only. */
export const OpensFromAnyPoint: Story = {
  beforeEach: () => {
    openOrder.mockClear();
    printInvoice.mockClear();
  },
  render: () => (
    <RowCard>
      <ListRow data-testid="row">
        <ListRowContent>
          <ListRowLink onClick={openOrder}>Order SB-2043</ListRowLink>
          <ListRowMeta data-testid="meta">Placed by Hayden Zieme</ListRowMeta>
        </ListRowContent>
        <ListRowActions>
          <Button variant="ghost" size="sm" onClick={printInvoice}>
            Print invoice
          </Button>
        </ListRowActions>
        <ListRowChevron />
      </ListRow>
    </RowCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('button', { name: 'Order SB-2043' });
    const control = canvas.getByRole('button', { name: 'Print invoice' });
    // What the pointer actually hits at the centre of an element.
    const hitAt = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return canvasElement.ownerDocument.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      );
    };

    // The meta line lies under the stretched link: the pointer hits the link.
    await expect(hitAt(canvas.getByTestId('meta'))).toBe(link);
    await userEvent.click(link);
    await expect(openOrder).toHaveBeenCalledTimes(1);

    // The row control sits above the stretched link: the pointer hits the control.
    await expect(hitAt(control)).toBe(control);
    await userEvent.click(control);
    await expect(printInvoice).toHaveBeenCalledTimes(1);
    await expect(openOrder).toHaveBeenCalledTimes(1);

    // One tab stop for the row link, then the control's own.
    await userEvent.click(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(control).toHaveFocus();
  },
};

/**
 * The copy chips keep their own click above the row link. A click on any point
 * of an IdChip or an AnonymizedToken copies, the tooltip says "Copied", and
 * the row does not open. A click on CopyableText or SecretValue text does
 * nothing: only their buttons act. The play function stubs the clipboard; the
 * test runner then presses the chip text with a real mouse (`pressText`).
 *
 * A chip's tooltip closes as soon as the pointer leaves the chip. The first
 * row's tooltip opens below and covers the next chip, so the test runner moves
 * a real mouse from one chip to the next and expects only the next chip's
 * tooltip (`hoverText`).
 */
export const ChipsInRow: Story = {
  parameters: {
    hoverText: [
      { text: '5c1f8b7e…2043', expectTooltip: 'Copy order ID' },
      { text: 'vc_pat_7...5dE7', expectTooltip: 'Copy token' },
    ],
    pressText: [
      { text: '5c1f8b7e…2043', expectButton: 'Order ID copied' },
      { text: 'vc_pat_7...5dE7', expectButton: 'Token copied' },
    ],
  },
  render: () => (
    <RowCard>
      <ListRow>
        <ListRowContent>
          <ListRowLink render={<a href="#order" />}>Order SB-2043</ListRowLink>
        </ListRowContent>
        <ListRowTrailing>
          <IdChip
            value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d2043"
            copyLabel="Copy order ID"
            copiedLabel="Order ID copied"
          />
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
      <ListRow>
        <ListRowContent>
          <ListRowLink render={<a href="#token" />}>Deploy token</ListRowLink>
        </ListRowContent>
        <ListRowTrailing>
          <AnonymizedToken value="vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7" />
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
      <ListRow>
        <ListRowContent>
          <ListRowLink render={<a href="#webhook" />}>Order webhook</ListRowLink>
        </ListRowContent>
        <ListRowTrailing>
          <CopyableText value="https://shop.example.com/hooks/orders" copyLabel="Copy webhook URL" />
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
      <ListRow>
        <ListRowContent>
          <ListRowLink render={<a href="#secret" />}>Signing secret</ListRowLink>
        </ListRowContent>
        <ListRowTrailing>
          <SecretValue loadValue={async () => 'whsec_4f7a1349'} />
        </ListRowTrailing>
        <ListRowChevron />
      </ListRow>
    </RowCard>
  ),
  play: async ({ canvasElement }) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
    const canvas = within(canvasElement);
    // What the pointer hits 4px into a piece of text, where the runner presses.
    const hitAt = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return canvasElement.ownerDocument.elementFromPoint(rect.left + 4, rect.top + rect.height / 2);
    };

    // The copy chips: the value text lies under the copy button's stretched ::after.
    await expect(hitAt(canvas.getByText('5c1f8b7e…2043'))).toBe(
      canvas.getByRole('button', { name: 'Copy order ID 5c1f8b7e…2043' }),
    );
    await expect(hitAt(canvas.getByText('vc_pat_7...5dE7'))).toBe(
      canvas.getByRole('button', { name: 'Copy token' }),
    );
    // CopyableText and SecretValue: the text stays above the row link.
    const url = canvas.getByText('https://shop.example.com/hooks/orders');
    await expect(hitAt(url)).toBe(url);
    const mask = canvas.getByText('••••••••');
    await expect(mask.closest('[data-slot=secret-value]')?.contains(hitAt(mask))).toBe(true);
  },
};

// A row the user just added takes `enter="new"`: its space opens first, so the rows
// below glide down, then its content fades in from a light blur. Rows of the
// first render never take it, so the list does not animate on page load.
function NewRowDemo() {
  const [backups, setBackups] = useState([
    { id: 'bk-0412', label: 'Backup 4 Nov, 02:00', isNew: false },
    { id: 'bk-0411', label: 'Backup 3 Nov, 02:00', isNew: false },
  ]);
  const add = () =>
    setBackups((rows) => [
      { id: `bk-${rows.length + 1}`, label: `Manual backup ${rows.length - 1}`, isNew: true },
      ...rows,
    ]);
  return (
    <div className="flex max-w-3xl flex-col items-start gap-4">
      <Button variant="outline" onClick={add}>
        Create backup
      </Button>
      <Card className="w-full gap-0 py-0">
        {backups.map((backup) => (
          <ListRow key={backup.id} enter={backup.isNew ? 'new' : undefined}>
            <ListRowContent>
              <ListRowLink onClick={() => {}}>{backup.label}</ListRowLink>
            </ListRowContent>
            <ListRowTrailing>
              <IdChip value={backup.id} />
            </ListRowTrailing>
            <ListRowChevron />
          </ListRow>
        ))}
      </Card>
    </div>
  );
}

export const NewRow: Story = {
  render: () => <NewRowDemo />,
};

const DEPLOYMENTS: { id: string; day: string; message: string; meta: string; hash: string; time: string }[] = [
  { id: 'd1', day: 'Today', message: 'Merge pull request #412 from acme/feature/gift-cards', meta: 'Started by Tobias Okafor · stopped after 5 min', hash: 'b3d71e6', time: '09:52' },
  { id: 'd2', day: 'Today', message: 'Add Klarna payment handler to checkout', meta: 'Deployed by Mara Lindqvist · took 5 min', hash: '9f3c2a1', time: '09:18' },
  { id: 'd3', day: 'Yesterday', message: 'Bump @vendure/core to 3.6.2', meta: 'Pushed · took 5 min', hash: 'e27f9a3', time: '14:04' },
  { id: 'd4', day: 'Yesterday', message: 'Index product variants by SKU for faster search', meta: 'Deployed by Mara Lindqvist · took 9 min', hash: '77ac1e0', time: '08:08' },
  { id: 'd5', day: 'Monday', message: 'Translate order confirmation email into German', meta: 'Pushed · took 6 min', hash: '6a3e1d9', time: '09:05' },
  { id: 'd6', day: 'Monday', message: 'Remove the legacy promotions plugin', meta: 'Pushed · stopped after 3 min', hash: '58f0c2a', time: '08:02' },
  { id: 'd7', day: 'Sunday', message: 'Raise the worker job concurrency to 4', meta: 'Pushed · took 4 min', hash: 'e1907c4', time: '10:01' },
  { id: 'd8', day: 'Sunday', message: 'Cache the shipping zones lookup', meta: 'Deployed by Tobias Okafor · took 7 min', hash: '3c88b10', time: '09:12' },
  { id: 'd9', day: 'Sunday', message: 'Fix the tax rounding on multi-currency orders', meta: 'Pushed · took 6 min', hash: 'a04d7f2', time: '08:40' },
  { id: 'd10', day: '2 November', message: 'Add the gift card product type', meta: 'Deployed by Mara Lindqvist · took 8 min', hash: '5be21c9', time: '16:22' },
];
const PAGE = 5;

// A ListRowGroupHeading starts each day; it takes the rule above, so the first
// row under it has none. Headings and rows are siblings: do not wrap a group
// in its own element. "Show older" adds a page: the added rows take
// `enter={{ stagger }}` and fade up one after another. The first page does not animate.
function GroupedDemo() {
  const [shown, setShown] = useState(PAGE);
  const visible = DEPLOYMENTS.slice(0, shown);
  const days = [...new Set(visible.map((d) => d.day))];
  return (
    <Card className="max-w-3xl gap-0 py-0">
      {days.map((day) => (
        <Fragment key={day}>
          <ListRowGroupHeading>{day}</ListRowGroupHeading>
          {visible
            .filter((d) => d.day === day)
            .map((d) => {
              const index = DEPLOYMENTS.indexOf(d);
              return (
                <ListRow key={d.id} enter={index >= PAGE ? { stagger: index % PAGE } : undefined}>
                  <ListRowContent>
                    <ListRowLink onClick={() => {}}>{d.message}</ListRowLink>
                    <ListRowMeta>{d.meta}</ListRowMeta>
                  </ListRowContent>
                  <ListRowTrailing>
                    <IdChip value={d.hash} />
                    <span className="w-12 text-end">{d.time}</span>
                  </ListRowTrailing>
                  <ListRowChevron />
                </ListRow>
              );
            })}
        </Fragment>
      ))}
      {shown < DEPLOYMENTS.length ? (
        <div className="flex items-center gap-3 border-t border-border px-4.5 py-3">
          <Button variant="outline" size="sm" onClick={() => setShown(shown + PAGE)}>
            Show older
          </Button>
          <span className="text-xs text-muted-foreground">
            {shown} of {DEPLOYMENTS.length}
          </span>
        </div>
      ) : null}
    </Card>
  );
}

export const GroupedByDay: Story = {
  render: () => <GroupedDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = () => [...canvasElement.querySelectorAll<HTMLElement>('[data-slot=list-row]')];
    // The first page does not animate.
    await expect(rows()).toHaveLength(PAGE);
    await expect(rows().some((row) => row.dataset.enter === 'stagger')).toBe(false);
    // The row under a heading drops its rule; the next row keeps it, and so
    // does the next heading.
    const [first, second] = rows();
    await expect(getComputedStyle(first as HTMLElement).borderTopWidth).toBe('0px');
    await expect(getComputedStyle(second as HTMLElement).borderTopWidth).toBe('1px');
    const yesterday = canvas.getByText('Yesterday');
    await expect(getComputedStyle(yesterday).borderTopWidth).toBe('1px');

    await userEvent.click(canvas.getByRole('button', { name: 'Show older' }));
    const added = rows().slice(PAGE);
    await expect(added).toHaveLength(PAGE);
    await expect(added.every((row) => row.dataset.enter === 'stagger')).toBe(true);
    await expect(added.map((row) => row.style.getPropertyValue('--list-row-stagger-delay'))).toEqual([
      '0ms',
      '28ms',
      '56ms',
      '84ms',
      '112ms',
    ]);
    await expect(canvas.queryByRole('button', { name: 'Show older' })).toBeNull();
  },
};
