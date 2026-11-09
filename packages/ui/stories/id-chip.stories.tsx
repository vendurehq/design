import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

const meta = {
  title: 'Molecules/IdChip',
  component: IdChip,
  tags: ['autodocs'],
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    truncate: 'middle',
    copyable: true,
  },
  argTypes: {
    value: { control: 'text' },
    display: { control: 'text' },
    truncate: {
      control: 'inline-radio',
      options: ['middle', 'start', 'none'],
    },
    copyable: { control: 'boolean' },
    reveal: { control: 'inline-radio', options: ['always', 'row'] },
  },
} satisfies Meta<typeof IdChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The full value is always copied and shown in the tooltip of a shortened chip.
export const TruncationModes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="middle" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="start" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="none" />
    </div>
  ),
};

// `display` overrides the rendered text but the full `value` is still copied.
export const CustomDisplay: Story = {
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    display: '5c1f8b7e-2f3a-4c9d…',
  },
};

// Read-only IDs drop the copy affordance.
export const NotCopyable: Story = {
  args: { copyable: false },
};

/**
 * Name what the button copies with `copyLabel`, and handle a failed clipboard
 * write with `onCopyError` (or a `CopyFeedbackProvider`).
 */
export const CustomCopyLabel: Story = {
  args: {
    value: '9f2c4e1a7b3d5f6e8a0c2b4d6f8e1a3c5b7d9f0e',
    display: '9f2c4e1',
    copyLabel: 'Copy commit SHA',
    copiedLabel: 'Commit SHA copied',
  },
};

/**
 * The whole chip is the copy target. A click on the value (not only on the
 * icon) copies; the tooltip changes from "Copy" to "Copied" and the icon turns
 * into a check-mark. The play function stubs the clipboard, so the run does
 * not depend on browser clipboard permissions. The test runner then presses
 * the value text with a real mouse (see `pressText` in the test runner).
 */
export const WholeChipCopies: Story = {
  args: { value: '9f2c4e1a7b3d5f6e8a0c2b4d6f8e1a3c5b7d9f0e', copyLabel: 'Copy commit SHA' },
  parameters: { pressText: { text: '9f2c4e1a…9f0e', expectButton: 'Copied' } },
  play: async ({ canvasElement }) => {
    stubClipboard();
    const canvas = within(canvasElement);
    // The point over the value text hits the copy button (its stretched
    // ::after), which is what makes the whole chip the click target.
    const text = canvas.getByText('9f2c4e1a…9f0e').getBoundingClientRect();
    const hit = document.elementFromPoint(text.left + 4, text.top + text.height / 2);
    await expect(hit).toBe(canvas.getByRole('button', { name: 'Copy commit SHA' }));
  },
};

function stubClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async () => {} },
  });
}

const VARIANTS = [
  { name: 'Laptop 13 inch 8GB', sku: 'L2201308', price: '$1,558.80' },
  { name: 'Laptop 15 inch 16GB', sku: 'L2201516', price: '$2,758.80' },
  { name: 'Tablet 32GB', sku: 'TBL200032', price: '$394.80' },
];

/**
 * `reveal="row"` in a list. At rest the SKU reads as plain text, lined up with
 * its column header. Hover a row, or tab to its copy button, and the fill and
 * the copy icon fade in together; the text does not move. Each row opens its
 * page through a stretched link; the chip stacks above it (`z-10`), so a click
 * on the chip copies and does not open the row.
 */
export const RevealInTableRow: Story = {
  args: { value: 'L2201516', reveal: 'row' },
  parameters: { pressText: { text: 'L2201516', expectButton: 'Copied' } },
  play: () => stubClipboard(),
  render: () => (
    <Table className="w-[560px]">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {VARIANTS.map((variant) => (
          <TableRow key={variant.sku} className="group/row relative cursor-pointer">
            <TableCell>
              <a href={`#${variant.sku}`} className="outline-none after:absolute after:inset-0">
                {variant.name}
              </a>
            </TableCell>
            <TableCell>
              <IdChip value={variant.sku} truncate="none" reveal="row" className="z-10" />
            </TableCell>
            <TableCell className="text-right tabular-nums">{variant.price}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
