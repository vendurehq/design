import type { Meta, StoryObj } from '@storybook/react';
import {
  ListFilterIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
} from '../src/components/atoms/card.tsx';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import { Chip } from '../src/components/molecules/chip.tsx';
import { TablePagination } from '../src/components/molecules/data-table/table-pagination.tsx';

// The "table card" recipe: the card is the table's frame. A CardHeader with
// border-b anchors the title and controls, CardTable hosts the Table flush to
// the card edges, and a CardFooter with border-t holds pagination. Band
// dividers render at row-separator strength, so the card outline stays the
// strongest line. Edge cells pick up the card's content padding and align
// with the header/footer content under both card sizes.

const meta = {
  title: 'Atoms/Data Display/Card/Table Card',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: string;
  stock: number;
}

const variants: Variant[] = [
  { id: '1', name: 'Cafe Chair · Oak', sku: 'CC-OAK-01', price: '$100.00', stock: 42 },
  { id: '2', name: 'Cafe Chair · Walnut', sku: 'CC-WAL-01', price: '$120.00', stock: 17 },
  { id: '3', name: 'Cafe Chair · Black', sku: 'CC-BLK-01', price: '$100.00', stock: 0 },
  { id: '4', name: 'Bar Stool · Oak', sku: 'BS-OAK-01', price: '$140.00', stock: 8 },
  { id: '5', name: 'Bar Stool · Walnut', sku: 'BS-WAL-01', price: '$160.00', stock: 23 },
  { id: '6', name: 'Side Table · Oak', sku: 'ST-OAK-01', price: '$180.00', stock: 12 },
  { id: '7', name: 'Side Table · Walnut', sku: 'ST-WAL-01', price: '$200.00', stock: 5 },
  { id: '8', name: 'Bench · Oak', sku: 'BN-OAK-01', price: '$260.00', stock: 3 },
];

function VariantRows({ rows }: { rows: Variant[] }) {
  return (
    <>
      {rows.map((variant) => (
        <TableRow key={variant.id}>
          <TableCell>
            <Checkbox aria-label={`Select ${variant.name}`} />
          </TableCell>
          <TableCell>
            <div className="bg-muted size-8 rounded-md" />
          </TableCell>
          <TableCell className="font-medium">{variant.name}</TableCell>
          <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
          <TableCell className="text-right tabular-nums">{variant.price}</TableCell>
          <TableCell className="text-right tabular-nums">{variant.stock}</TableCell>
        </TableRow>
      ))}
    </>
  );
}

function VariantHeadRow() {
  return (
    <TableRow>
      <TableHead className="w-10">
        <Checkbox aria-label="Select all variants" />
      </TableHead>
      <TableHead>Featured asset</TableHead>
      <TableHead>Variant name</TableHead>
      <TableHead>SKU</TableHead>
      <TableHead className="text-right">Price</TableHead>
      <TableHead className="text-right">Stock</TableHead>
    </TableRow>
  );
}

// List-page shape: title + icon controls in the CardAction, a second header
// line for search and filters, and a paginated footer.
function ListPageDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const rows = variants.slice((page - 1) * pageSize, page * pageSize);
  return (
    <Card className="w-[760px]">
      <CardHeader className="border-b">
        <CardTitle>Product variants</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PlusIcon />
            Manage variants
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="View options">
            <SlidersHorizontalIcon />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Refresh">
            <RefreshCwIcon />
          </Button>
        </CardAction>
        <div className="col-span-full mt-2 flex items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SearchIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="Filter variants" />
          </InputGroup>
          <Button variant="outline">
            <ListFilterIcon />
            Filter
          </Button>
          <Chip onRemove={() => {}} removeLabel="Remove stock filter">
            Stock <span className="text-muted-foreground">is In stock</span>
          </Chip>
        </div>
      </CardHeader>
      <CardTable>
        <Table>
          <TableHeader>
            <VariantHeadRow />
          </TableHeader>
          <TableBody>
            <VariantRows rows={rows} />
          </TableBody>
        </Table>
      </CardTable>
      <CardFooter className="border-t">
        <TablePagination
          className="w-full"
          page={page}
          pageSize={pageSize}
          totalItems={variants.length}
          pageSizeOptions={[5, 10, 25]}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </CardFooter>
    </Card>
  );
}

export const ListPage: Story = {
  render: () => <ListPageDemo />,
};

// Order-items shape: controls-only header (no title), no footer — the last
// row runs flush to the card's bottom edge.
export const ControlsOnlyHeader: Story = {
  render: () => (
    <Card className="w-[640px]">
      <CardHeader className="border-b">
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PlusIcon />
            Add item
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="View options">
            <SlidersHorizontalIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.slice(0, 4).map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.name}</TableCell>
                <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                <TableCell className="text-right tabular-nums">2</TableCell>
                <TableCell className="text-right tabular-nums">{variant.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardTable>
    </Card>
  ),
};

// Widget shape: size="sm" card — edge cells and the band divider track the
// smaller content padding via the card's size hooks.
export const SmallWidget: Story = {
  render: () => (
    <Card size="sm" className="w-[420px]">
      <CardHeader className="border-b">
        <CardTitle>Low stock</CardTitle>
        <CardAction>
          <Button variant="ghost" size="xs">
            View all
          </Button>
        </CardAction>
      </CardHeader>
      <CardTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants
              .filter((variant) => variant.stock < 10)
              .map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                  <TableCell className="text-right tabular-nums">{variant.stock}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardTable>
    </Card>
  ),
};

// Empty body: a full-colspan empty-state row between the bands. The bands
// always render, so filling the table later causes no layout jump.
export const EmptyBody: Story = {
  render: () => (
    <Card className="w-[760px]">
      <CardHeader className="border-b">
        <CardTitle>Product variants</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <PlusIcon />
            Manage variants
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Refresh">
            <RefreshCwIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardTable>
        <Table>
          <TableHeader>
            <VariantHeadRow />
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="text-muted-foreground h-24 text-center">
                No variants yet
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardTable>
      <CardFooter className="border-t">
        <TablePagination
          className="w-full"
          page={1}
          pageSize={10}
          totalItems={0}
          onPageChange={() => {}}
        />
      </CardFooter>
    </Card>
  ),
};
