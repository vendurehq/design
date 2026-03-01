import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '../src/components/ui/table.tsx';

const meta = {
  title: 'UI/Data Display/Table',
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
