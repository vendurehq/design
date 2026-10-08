import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
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

export const Default: Story = {
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
