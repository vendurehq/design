import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { type Column, flexRender } from '@tanstack/react-table';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultMessages, type FormatMessages } from '../../../lib/format-messages.ts';
import { TableCell, TableRow } from '../../atoms/table.tsx';
import { ListRowChevron } from '../list-row.tsx';
import { SkeletonLine } from '../state-views/skeleton-parts.tsx';
import {
  type ColumnDef,
  DataTable,
  type DataTableFilterEditorContext,
  type DataTablePagination,
  DataTableRowLink,
  DataTableSkeletonLine,
  type TableInstance as Table,
  type TableOptions,
} from './data-table.tsx';
import {
  buildDisplayColumns,
  columnAlign,
  columnContentIndent,
  columnMinWidth,
  columnWidth,
  getHideableLeafColumns,
  getSelectedOriginals,
  getSelectedRowIds,
  isControlled,
  measureColumnIndents,
  resolveClearFilters,
  resolveSlot,
  STATUS_BADGE_CONTENT_INSETS,
  sameIndents,
} from './data-table-helpers.tsx';
import {
  readRowCount,
  skeletonRowCountFor,
  useRememberedListTotal,
  writeRowCount,
} from './data-table-row-count-storage.tsx';
import { readStoredSelection, writeStoredSelection } from './data-table-selection-storage.tsx';
import type { DataTableLabels } from './data-table-types.tsx';

// Pure-SSR tests, matching the table-pagination.test.tsx convention
// (renderToStaticMarkup, no jsdom). Capability-absence is asserted from markup;
// the controlled contract (make-or-break #5: the prop is the source of truth
// every render) is asserted through the rendered state it produces — aria-sort,
// data-state="selected", aria-checked, hidden columns — since there is no DOM to
// dispatch events on. Interaction-free logic is unit-tested directly below.

interface Country {
  id: string;
  name: string;
  code: string;
}

const aland: Country = { id: '1', name: 'Aland Islands', code: 'AX' };
const brazil: Country = { id: '2', name: 'Brazil', code: 'BR' };
const rows: Country[] = [aland, brazil];

const columns: ColumnDef<Country>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'code', header: 'Code' },
];

const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const count = (markup: string, needle: RegExp) => markup.match(needle)?.length ?? 0;

afterEach(() => {
  mock.restore();
});

describe('DataTable capability absence', () => {
  test('no sorting prop → headers render plain (no sort button, no aria-sort)', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('aria-sort');
    expect(markup).not.toContain('data-slot="data-table-column-header"');
    // The header text still renders, just as passive labels.
    expect(markup).toContain('Name');
    expect(markup).toContain('Code');
  });

  test('no filters prop → no chip row, no add-filter trigger', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('data-slot="list-header-chips"');
    expect(markup).not.toContain('data-slot="data-table-add-filter"');
  });

  test('no pagination prop → no footer rendered', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('data-slot="table-pagination"');
  });

  test('no rowSelection prop → no checkbox column, no select-all', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('role="checkbox"');
    expect(markup).not.toContain('Select all rows');
  });

  test('no columnVisibility prop → no Columns trigger', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('data-slot="data-table-view-options"');
  });

  test('no rowActions prop → no trailing actions column', () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toContain('Open row actions');
  });

  test('rowSelection wired but no bulkActions → no overlay even when rows selected', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {} }}
      />,
    );
    expect(markup).not.toContain('data-slot="data-table-bulk-actions"');
  });
});

describe('DataTable row rendering', () => {
  test('renders one row per datum with cell values', () => {
    const markup = html(<DataTable rows={rows} columns={columns} getRowId={(row) => row.id} />);
    expect(markup).toContain('Aland Islands');
    expect(markup).toContain('Brazil');
    expect(markup).toContain('AX');
    expect(markup).toContain('BR');
    // Two body rows.
    expect(count(markup, /data-slot="table-row"/g)).toBe(3); // 1 header + 2 body
  });
});

describe('DataTable column alignment', () => {
  const endColumns: ColumnDef<Country>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'code', header: 'Code', meta: { align: 'end' } },
  ];
  const cellsOf = (markup: string, id: string) =>
    markup.match(new RegExp(`<t[hd][^>]*data-column-id="${id}"[^>]*>`, 'g')) ?? [];

  test('columnAlign reads meta.align and defaults to start', () => {
    expect(columnAlign({ align: 'end' })).toBe('end');
    expect(columnAlign({ align: 'start' })).toBe('start');
    expect(columnAlign({ fieldInfo: {} })).toBe('start');
    expect(columnAlign(undefined)).toBe('start');
  });

  test("meta.align 'end' aligns the header and the cells to the end", () => {
    const markup = html(<DataTable rows={rows} columns={endColumns} getRowId={(row) => row.id} />);
    const code = cellsOf(markup, 'code');
    expect(code).toHaveLength(3); // header + 2 body cells
    for (const cell of code) expect(cell).toContain('text-end');
    for (const cell of cellsOf(markup, 'name')) expect(cell).not.toContain('text-end');
  });

  test('an end-aligned cell pulls its last element forward, not its first back', () => {
    const markup = html(<DataTable rows={rows} columns={endColumns} getRowId={(row) => row.id} />);
    const [, ...codeCells] = cellsOf(markup, 'code');
    for (const cell of codeCells) {
      expect(cell).toContain('&gt;:last-child)]:-me-(--content-inset)');
      expect(cell).not.toContain('-ms-(--content-inset)');
    }
    const [, ...nameCells] = cellsOf(markup, 'name');
    for (const cell of nameCells) expect(cell).toContain('-ms-(--content-inset)');
  });

  test('an end-aligned sort control pulls forward and puts its icon first', () => {
    const markup = html(
      <DataTable rows={rows} columns={endColumns} sorting={{ defaultValue: [], mode: 'client' }} />,
    );
    const buttons = markup.match(/<button[^>]*data-slot="data-table-column-header"[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(2);
    const [name, code] = buttons as [string, string];
    expect(name).toContain('data-align="start"');
    expect(name).toContain('-ms-(--content-inset)');
    expect(code).toContain('data-align="end"');
    expect(code).toContain('-me-(--content-inset)');
    expect(code).toContain('flex-row-reverse');
  });
});

describe('DataTableRowLink', () => {
  const linkedColumns: ColumnDef<Country>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <DataTableRowLink href={`/countries/${row.original.id}`}>
          {row.original.name}
        </DataTableRowLink>
      ),
    },
    { accessorKey: 'code', header: 'Code' },
  ];

  test('renders one real link per row with a decorative chevron', () => {
    const markup = html(<DataTable rows={rows} columns={linkedColumns} />);
    expect(count(markup, /<a [^>]*data-slot="data-table-row-link"/g)).toBe(2);
    expect(markup).toContain('href="/countries/1"');
    expect(count(markup, /data-slot="data-table-row-chevron"/g)).toBe(2);
    expect(markup).toMatch(/<svg[^>]*data-slot="data-table-row-chevron"[^>]*aria-hidden="true"/);
  });

  test('the row chevron moves like the ListRow chevron', () => {
    const classOf = (markup: string, slot: string) => {
      const tag = markup.match(new RegExp(`<svg[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
      return new Set(tag.match(/class="([^"]*)"/)?.[1]?.split(' '));
    };
    const table = classOf(
      html(<DataTable rows={rows} columns={linkedColumns} />),
      'data-table-row-chevron',
    );
    const listRow = classOf(html(<ListRowChevron />), 'list-row-chevron');
    for (const motion of [
      'transition-[opacity,translate]',
      'duration-fast',
      'ease-out',
      'motion-safe:-translate-x-0.75',
      'group-hover/row:opacity-100',
      'group-hover/list-row:opacity-100',
    ]) {
      expect(table.has(motion), motion).toBe(true);
      expect(listRow.has(motion), motion).toBe(true);
    }
  });

  test('renders through a router link element', () => {
    const RouterLink = (props: React.ComponentProps<'a'> & { to: string }) => {
      const { to, ...rest } = props;
      return <a data-router-link="" href={to} {...rest} />;
    };
    const markup = html(
      <DataTable
        rows={[aland]}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
              <DataTableRowLink render={<RouterLink to={`/countries/${row.original.id}`} />}>
                {row.original.name}
              </DataTableRowLink>
            ),
          },
        ]}
      />,
    );
    expect(markup).toMatch(
      /<a data-router-link="" href="\/countries\/1"[^>]*data-slot="data-table-row-link"/,
    );
    expect(markup).toContain('Aland Islands');
  });

  test('the link stretches over the row, which stacks its controls above it', () => {
    const markup = html(<DataTable rows={rows} columns={linkedColumns} />);
    const table = markup.match(/<table[^>]*>/)?.[0] ?? '';
    expect(markup).toContain('after:absolute after:inset-0');
    expect(table).toContain('[&amp;_tr:has([data-slot=data-table-row-link])]:relative');
    expect(table).toContain('[&amp;_tr:has([data-slot=data-table-row-link])_:is(a,button');
  });

  // The rules sit on the table, so a row the consumer renders itself (a
  // draggable row) gets them without taking a class from the table.
  test('a row from renderRow needs no class for its controls to stack above the link', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={linkedColumns}
        renderRow={(row) => (
          <tr data-custom-row="">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{cell.getValue() as string}</td>
            ))}
          </tr>
        )}
      />,
    );
    const table = markup.match(/<table[^>]*>/)?.[0] ?? '';
    expect(markup).toContain('data-custom-row=""');
    expect(table).toContain('[&amp;_tr:has([data-slot=data-table-row-link])_:is(a,button');
  });
});

describe('DataTable loading state', () => {
  test('before the first load renders skeletonRowCount rows (× column count)', () => {
    const markup = html(
      <DataTable rows={undefined} columns={columns} isLoading skeletonRowCount={3} />,
    );
    // 3 skeleton rows × 2 columns.
    expect(count(markup, /data-slot="skeleton"/g)).toBe(6);
    expect(markup).not.toContain('No results');
  });

  test('default loading cell is one line box tall', () => {
    const markup = html(
      <DataTable rows={undefined} columns={columns} isLoading skeletonRowCount={1} />,
    );
    expect(count(markup, /data-slot="data-table-skeleton-line"/g)).toBe(2);
    // Each line is the shared SkeletonLine (one `1lh` box, hidden from assistive
    // tech) with the DataTable's own marker, not a DataTable-only copy.
    const line = html(<SkeletonLine data-slot="data-table-skeleton-line" />);
    expect(markup.split(line).length - 1).toBe(2);
    expect(markup).toContain('aria-hidden="true"');
  });

  test('DataTableSkeletonLine is the shared SkeletonLine', () => {
    expect(DataTableSkeletonLine).toBe(SkeletonLine);
  });

  test('skeletonCells replaces the default line for the keyed column only', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        skeletonRowCount={2}
        skeletonCells={{ name: <div data-testid="two-line" /> }}
      />,
    );
    expect(count(markup, /data-testid="two-line"/g)).toBe(2);
    // `code` keeps the default line in both rows.
    expect(count(markup, /data-slot="data-table-skeleton-line"/g)).toBe(2);
  });

  test('null renders an empty cell; undefined keeps the default line', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        skeletonRowCount={1}
        skeletonCells={{ name: null, code: undefined }}
      />,
    );
    expect(count(markup, /data-slot="table-cell"/g)).toBe(2);
    expect(count(markup, /data-slot="data-table-skeleton-line"/g)).toBe(1);
  });

  test('skeleton cells carry the loaded cell layout: empty select, indented leading, sized actions', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        skeletonRowCount={2}
        rowSelection={{}}
        rowActions={() => <button type="button">Open row actions</button>}
        skeletonCells={{ select: <span data-testid="select-override" /> }}
      />,
    );
    const body = markup.slice(markup.indexOf('data-slot="table-body"'));
    // Per row: select (always empty, override ignored) + name + code + actions.
    expect(count(body, /data-slot="table-cell"/g)).toBe(8);
    expect(body).not.toContain('select-override');
    expect(count(body, /data-slot="data-table-skeleton-line"/g)).toBe(4);
    expect(count(body, /class="[^"]*size-8/g)).toBe(2);
    expect(count(body, /relative w-0 p-0 ps-0!/g)).toBe(2);
    expect(count(body, /class="[^"]*ps-\[calc\(var\(--spacing\)\*10\+/g)).toBe(2);
    expect(count(body, /class="[^"]*py-0/g)).toBe(2);
  });

  test('skeletonCells can override the generated actions cell', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        skeletonRowCount={1}
        rowActions={() => null}
        skeletonCells={{ actions: <span data-testid="two-buttons" /> }}
      />,
    );
    expect(markup).toContain('data-testid="two-buttons"');
    expect(markup).not.toContain('size-8');
  });

  test('skeletonCells respects hidden columns', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        skeletonRowCount={1}
        columnVisibility={{ value: { name: false }, onChange: () => {} }}
        skeletonCells={{ name: <span data-testid="hidden-name" /> }}
      />,
    );
    expect(markup).not.toContain('data-testid="hidden-name"');
    expect(count(markup, /data-slot="skeleton"/g)).toBe(1);
  });

  test('skeletonCells keys that match no column warn in development', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const nested: ColumnDef<{ customer: { name: string } }>[] = [
      { accessorKey: 'customer.name', header: 'Customer' },
    ];
    html(
      <DataTable
        rows={undefined}
        columns={nested}
        isLoading
        skeletonCells={{ 'customer.name': null, customer_name: null }}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0]?.[0]);
    expect(message).toContain('customer.name');
    expect(message).not.toContain('match no column: customer.name, customer_name');
  });

  test('no columns still renders one cell per skeleton row', () => {
    const markup = html(<DataTable rows={undefined} columns={[]} isLoading skeletonRowCount={2} />);
    expect(count(markup, /data-slot="table-cell"/g)).toBe(2);
  });

  test('an empty list that loads again keeps its empty state, pending (no skeleton swap)', () => {
    const markup = html(<DataTable rows={[]} columns={columns} isLoading />);
    expect(markup).not.toContain('data-slot="skeleton"');
    expect(markup).toContain('No results');
    expect(markup).not.toContain('data-table-empty-placeholder');
    expect(markup).toContain('data-pending=""');
  });

  test('a paginated first load draws one full page, not skeletonRowCount', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        skeletonRowCount={3}
        pagination={{ page: 1, pageSize: 25, totalItems: null, onPageChange: () => {} }}
      />,
    );
    expect(count(markup, /data-slot="data-table-skeleton-line"/g)).toBe(25 * columns.length);
  });

  test('populated + isLoading keeps the real rows (no skeleton swap)', () => {
    const markup = html(<DataTable rows={rows} columns={columns} isLoading />);
    expect(markup).not.toContain('data-slot="skeleton"');
    expect(markup).toContain('Aland Islands');
  });
});

describe('DataTable loading pagination and pending rows', () => {
  const pagination = { page: 2, pageSize: 1, totalItems: 2, onPageChange: () => {} };
  const tbody = (markup: string) => markup.match(/<tbody[^>]*>/)?.[0] ?? '';

  test('an unknown total (null) shows a skeleton range, not "0 of 0"', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        pagination={{ ...pagination, page: 1, totalItems: null }}
      />,
    );
    expect(markup).not.toContain('0 of 0');
    expect(markup).toMatch(/data-slot="table-pagination-range"[^>]*>.*data-slot="skeleton"/);
    const next = markup.match(/<button[^>]*data-slot="table-pagination-next"[^>]*>/)?.[0] ?? '';
    expect(next).toContain('disabled=""');
  });

  test('an undefined total is unknown too, the same as null', () => {
    const table = (totalItems: number | null | undefined) =>
      html(
        <DataTable
          rows={undefined}
          columns={columns}
          isLoading
          pagination={{ ...pagination, page: 1, totalItems }}
        />,
      );
    expect(table(undefined)).toBe(table(null));
  });

  test('loaded rows with an unknown total warn in development, for null and undefined', () => {
    for (const totalItems of [null, undefined]) {
      const warn = spyOn(console, 'warn').mockImplementation(() => {});
      html(
        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(row) => row.code}
          pagination={{ ...pagination, page: 1, totalItems }}
        />,
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('totalItems is not known');
      warn.mockRestore();
    }
  });

  test('a total known before the rows (a cached count) shows its range', () => {
    const markup = html(
      <DataTable
        rows={undefined}
        columns={columns}
        isLoading
        pagination={{ ...pagination, page: 1, pageSize: 10, totalItems: 132 }}
      />,
    );
    expect(markup).toContain('1–10 of 132');
  });

  test('the first load marks the body busy, not pending, with or without isLoading', () => {
    const quiet = html(<DataTable rows={undefined} columns={columns} />);
    expect(tbody(quiet)).toContain('aria-busy="true"');
    expect(quiet).toContain('data-slot="skeleton"');
    const markup = html(<DataTable rows={undefined} columns={columns} isLoading />);
    expect(tbody(markup)).toContain('aria-busy="true"');
    expect(tbody(markup)).not.toContain('data-pending=""');
  });

  test('loading with rows on screen keeps the rows and marks the body busy and pending', () => {
    const markup = html(
      <DataTable rows={[brazil]} columns={columns} isLoading pagination={pagination} />,
    );
    expect(markup).toContain('Brazil');
    expect(markup).not.toContain('data-slot="skeleton"');
    expect(tbody(markup)).toContain('aria-busy="true"');
    expect(tbody(markup)).toContain('data-pending=""');
  });

  test('loading with rows on screen keeps the range and makes prev/next ignore presses', () => {
    const markup = html(
      <DataTable rows={[brazil]} columns={columns} isLoading pagination={pagination} />,
    );
    expect(markup).toContain('2–2 of 2');
    expect(markup).toMatch(/data-slot="table-pagination-range"[^>]*data-pending=""/);
    const previous = markup.match(/<button[^>]*data-slot="table-pagination-previous"[^>]*>/)?.[0];
    expect(previous).toContain('aria-disabled="true"');
  });

  test('not loading: the body is neither busy nor pending', () => {
    const markup = html(<DataTable rows={rows} columns={columns} pagination={pagination} />);
    expect(tbody(markup)).not.toContain('aria-busy');
    expect(tbody(markup)).not.toContain('data-pending=""');
  });
});

describe('DataTable column widths', () => {
  const headerTag = (markup: string, id: string) =>
    markup.match(new RegExp(`<th[^>]*data-column-id="${id}"[^>]*>`))?.[0] ?? '';
  const widthColumns: ColumnDef<Country>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'code', header: 'Code', meta: { width: 96 } },
  ];

  test('meta.width sets the header cell width, while loading and with rows', () => {
    for (const markup of [
      html(<DataTable rows={undefined} columns={widthColumns} isLoading />),
      html(<DataTable rows={rows} columns={widthColumns} />),
    ]) {
      expect(headerTag(markup, 'code')).toContain('width:96px');
      expect(headerTag(markup, 'name')).not.toContain('width');
    }
  });

  test("a column without meta.width gets no width, not TanStack's default size", () => {
    const markup = html(<DataTable rows={rows} columns={columns} />);
    expect(markup).not.toMatch(/<th[^>]*width/);
  });

  test('columnWidth reads a number or a CSS length and ignores anything else', () => {
    expect(columnWidth({ width: 96 })).toBe(96);
    expect(columnWidth({ width: '8rem' })).toBe('8rem');
    expect(columnWidth({ width: null })).toBeUndefined();
    expect(columnWidth(undefined)).toBeUndefined();
  });

  test('meta.width is also the minimum width, and meta.minWidth sets a floor alone', () => {
    const floorColumns: ColumnDef<Country>[] = [
      { accessorKey: 'name', header: 'Name', meta: { minWidth: '12rem' } },
      { accessorKey: 'code', header: 'Code', meta: { width: 96 } },
    ];
    for (const markup of [
      html(<DataTable rows={undefined} columns={floorColumns} isLoading />),
      html(<DataTable rows={rows} columns={floorColumns} />),
    ]) {
      expect(headerTag(markup, 'code')).toContain('width:96px;min-width:96px');
      expect(headerTag(markup, 'name')).toContain('min-width:12rem');
      expect(headerTag(markup, 'name')).not.toMatch(/[;"]width:/);
    }
    expect(columnMinWidth({ width: 96 })).toBe(96);
    expect(columnMinWidth({ width: 96, minWidth: 64 })).toBe(64);
    expect(columnMinWidth({})).toBeUndefined();
  });
});

describe('DataTable declared content inset', () => {
  const insetColumns: ColumnDef<Country>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'code', header: 'Code', meta: { contentInset: 'status-badge' } },
  ];
  const indent = 'max(0px, calc(calc(var(--spacing)*6.75) - var(--spacing)*2))';

  test('meta.contentInset indents the header and cells the same while loading, empty and with rows', () => {
    for (const markup of [
      html(<DataTable rows={undefined} columns={insetColumns} isLoading skeletonRowCount={2} />),
      html(<DataTable rows={[]} columns={insetColumns} />),
      html(<DataTable rows={rows} columns={insetColumns} />),
    ]) {
      const th = markup.match(/<th[^>]*data-column-id="code"[^>]*>/)?.[0] ?? '';
      expect(th).toContain(`--column-indent:${indent}`);
      for (const td of markup.match(/<td[^>]*data-column-id="code"[^>]*>/g) ?? []) {
        expect(td).toContain(`--column-indent:${indent}`);
      }
      expect(markup.match(/<th[^>]*data-column-id="name"[^>]*>/)?.[0]).not.toContain('style=');
    }
  });

  test('columnContentIndent reads a keyword, px or a CSS length', () => {
    expect(columnContentIndent({ contentInset: 'status-icon' })).toBe(
      'max(0px, calc(calc(var(--spacing)*6) - var(--spacing)*2))',
    );
    expect(columnContentIndent({ contentInset: 20 })).toBe(
      'max(0px, calc(20px - var(--spacing)*2))',
    );
    expect(columnContentIndent({ contentInset: '1.5rem' })).toBe(
      'max(0px, calc(1.5rem - var(--spacing)*2))',
    );
    expect(columnContentIndent({})).toBeUndefined();
  });

  test('the StatusBadge keywords match the insets status-badge.tsx sets', async () => {
    const source = await Bun.file(new URL('../status-badge.tsx', import.meta.url)).text();
    const {
      'status-badge': icon,
      'status-badge-dot': dot,
      'status-icon': appearance,
    } = STATUS_BADGE_CONTENT_INSETS;
    expect(source).toContain(
      `has-data-[marker=icon]:[--content-inset:${icon}] has-data-[marker=dot]:[--content-inset:${dot}]`,
    );
    expect(source).toContain(`'[--content-inset:${appearance}]'`);
  });
});

describe('DataTable rowLinks', () => {
  const tableTag = (markup: string) => markup.match(/<table[^>]*>/)?.[0] ?? '';

  test('rowLinks marks the table in every state, so the chevron slot does not wait for a link', () => {
    for (const props of [{ rows }, { rows: undefined, isLoading: true }, { rows: [] }]) {
      expect(tableTag(html(<DataTable {...props} columns={columns} rowLinks />))).toContain(
        'data-row-links=""',
      );
      expect(tableTag(html(<DataTable {...props} columns={columns} />))).not.toContain(
        ' data-row-links=',
      );
    }
  });
});

describe('DataTable empty state', () => {
  test('default empty renders the "No results" label', () => {
    const markup = html(<DataTable rows={[]} columns={columns} />);
    expect(markup).toContain('No results');
  });

  test('custom label overrides the default', () => {
    const markup = html(
      <DataTable rows={[]} columns={columns} labels={{ empty: 'Nothing to show' }} />,
    );
    expect(markup).toContain('Nothing to show');
    expect(markup).not.toContain('No results');
  });

  test('emptyState slot replaces the built-in cell', () => {
    const markup = html(
      <DataTable rows={[]} columns={columns} emptyState={<div>No countries yet</div>} />,
    );
    expect(markup).toContain('No countries yet');
    expect(markup).not.toContain('No results');
  });
});

describe('DataTable sorting (controlled source of truth)', () => {
  test('sorting wired → headers become sortable buttons', () => {
    const markup = html(
      <DataTable rows={rows} columns={columns} sorting={{ value: [], onChange: () => {} }} />,
    );
    expect(markup).toContain('data-slot="data-table-column-header"');
  });

  test('controlled sorting value drives aria-sort on the sorted column', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        sorting={{ value: [{ id: 'name', desc: false }], onChange: () => {} }}
      />,
    );
    expect(markup).toContain('aria-sort="ascending"');
    // The unsorted, sortable column reports "none".
    expect(markup).toContain('aria-sort="none"');
  });

  test('descending controlled value renders aria-sort="descending"', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        sorting={{ value: [{ id: 'name', desc: true }], onChange: () => {} }}
      />,
    );
    expect(markup).toContain('aria-sort="descending"');
  });
});

describe('DataTable row selection (controlled source of truth)', () => {
  test('rowSelection wired → checkbox column with select-all header', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: {}, onChange: () => {} }}
      />,
    );
    expect(markup).toContain('role="checkbox"');
    expect(markup).toContain('Select all rows');
  });

  test('controlled selection value marks the selected row', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {} }}
      />,
    );
    // Exactly one row is flagged selected, and its checkbox is checked.
    expect(count(markup, /data-state="selected"/g)).toBe(1);
    expect(markup).toContain('aria-checked="true"');
  });

  test('selection resolves through getRowId + drives the bulk overlay', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {} }}
        bulkActions={({ selection, selectedRowIds }) => (
          <span>{`Delete ${selection.length} (${selectedRowIds.join(',')})`}</span>
        )}
      />,
    );
    expect(markup).toContain('data-slot="data-table-bulk-actions"');
    // The bulk context materialises the selected original via the cross-page cache.
    expect(markup).toContain('Delete 1 (1)');
  });

  test('server-paginated selection without getRowId warns in development', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});

    html(
      <DataTable
        rows={rows}
        columns={columns}
        pagination={{ page: 1, pageSize: 2, totalItems: 4, onPageChange: () => {} }}
        rowSelection={{ value: { '0': true }, onChange: () => {} }}
      />,
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('getRowId');
  });

  // While rows are selected, a click on a row selects it: the table carries
  // data-selecting, which drops the link cursor and the row chevron.
  test('marks the table as selecting only while a row is selected', () => {
    const table = (value: Record<string, boolean>) =>
      html(
        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowSelection={{ value, onChange: () => {} }}
        />,
      ).match(/<table[^>]*>/)?.[0] ?? '';
    expect(table({})).not.toContain(' data-selecting=');
    expect(table({ '1': true })).toContain(' data-selecting=""');
  });

  test('partial page selection renders a distinct mixed select-all indicator', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {} }}
      />,
    );

    expect(markup).toContain('aria-checked="mixed"');
    // The indeterminate mark is a drawn line, not the lucide icon.
    expect(markup).toContain('d="M5 12h14"');
  });
});

describe('DataTable column visibility (controlled source of truth)', () => {
  test('Columns trigger renders when wired', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        columnVisibility={{ value: {}, onChange: () => {} }}
      />,
    );
    expect(markup).toContain('data-slot="data-table-view-options"');
  });

  test('Columns trigger sits at the end of the controls row', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        toolbar={<input placeholder="Search" />}
        columnVisibility={{ value: {}, onChange: () => {} }}
      />,
    );
    const trigger = markup.slice(
      markup.lastIndexOf('<button', markup.indexOf('data-slot="data-table-view-options"')),
    );
    expect(trigger).toContain('ms-auto');
  });

  test('a column set false hides its header and cells', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        columnVisibility={{ value: { code: false }, onChange: () => {} }}
      />,
    );
    expect(markup).toContain('Name');
    expect(markup).toContain('Aland Islands');
    // The hidden "code" column drops its header and body cells.
    expect(markup).not.toContain('>Code<');
    expect(markup).not.toContain('>AX<');
  });

  test('showViewOptions=false keeps controlled visibility but suppresses the built-in control', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        columnVisibility={{ value: { code: false }, onChange: () => {}, showViewOptions: false }}
        toolbar={() => <span>Dashboard columns</span>}
      />,
    );
    expect(markup).toContain('Dashboard columns');
    expect(markup).not.toContain('data-slot="data-table-view-options"');
    expect(markup).not.toContain('>Code<');
    expect(markup).not.toContain('>AX<');
  });
});

describe('DataTable filters', () => {
  test('applied filter renders a chip row', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        filters={{
          value: [{ id: 'name', value: { contains: 'a' } }],
          onChange: () => {},
          columns: [{ id: 'name', label: 'Name' }],
        }}
      />,
    );
    expect(markup).toContain('data-slot="list-header-chips"');
  });

  test('filters.columns present → add-filter trigger renders', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        filters={{ value: [], onChange: () => {}, columns: [{ id: 'name', label: 'Name' }] }}
      />,
    );
    expect(markup).toContain('data-slot="data-table-add-filter"');
  });

  test('showAddFilter=false keeps formatted chips but suppresses the built-in trigger', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        filters={{
          value: [{ id: 'name', value: { contains: 'Al' } }],
          onChange: () => {},
          columns: [
            {
              id: 'name',
              label: 'Name',
              formatChip: (value) => <>Name contains {String(value.contains)}</>,
            },
          ],
          showAddFilter: false,
        }}
        toolbar={() => <span>Dashboard filter</span>}
      />,
    );
    expect(markup).toContain('Dashboard filter');
    expect(markup).toContain('Name contains Al');
    expect(markup).not.toContain('data-slot="data-table-add-filter"');
  });

  test('showAppliedFilters=false keeps add-filter UI but suppresses the built-in chip row', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        filters={{
          value: [{ id: 'name', value: { contains: 'Al' } }],
          onChange: () => {},
          columns: [{ id: 'name', label: 'Name' }],
          showAppliedFilters: false,
        }}
      />,
    );
    expect(markup).toContain('data-slot="data-table-add-filter"');
    expect(markup).not.toContain('data-slot="list-header-chips"');
  });
});

describe('DataTable editable filter chips', () => {
  const filtered = (
    renderEditor?: (ctx: DataTableFilterEditorContext<Country>) => React.ReactNode,
  ) =>
    html(
      <DataTable
        rows={rows}
        columns={columns}
        filters={{
          value: [{ id: 'name', value: { contains: 'Al' } }],
          onChange: () => {},
          columns: [{ id: 'name', label: 'Name', renderEditor }],
        }}
      />,
    );

  test('without renderEditor the chip label is text', () => {
    const markup = filtered();
    expect(markup).not.toContain('data-slot="chip-edit"');
    expect(markup).toContain('data-slot="chip-remove"');
  });

  test('renderEditor makes the label a button and renders the editor closed', () => {
    const seen: DataTableFilterEditorContext<Country>[] = [];
    const markup = filtered((ctx) => {
      seen.push(ctx);
      return <span data-testid="name-editor" data-open={String(ctx.open)} />;
    });
    expect(markup).toContain('data-slot="chip-edit"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('data-testid="name-editor" data-open="false"');
    expect(seen[0]?.value).toEqual({ contains: 'Al' });
    expect(seen[0]?.column.id).toBe('name');
    expect(seen[0]?.anchor).toHaveProperty('current');
  });
});

describe('DataTable clear filters', () => {
  const nameFilter = [{ id: 'name', value: { contains: 'a' } }];
  const clearButton = /data-slot="data-table-clear-filters"/g;
  const chipLine = (markup: string) =>
    markup.match(/<div data-slot="list-header-chips"[^>]*>/)?.[0];
  const table = (props: {
    rows?: Country[];
    value?: typeof nameFilter;
    clearFilters?: boolean | { hidden?: boolean; onClear?: () => void };
    isLoading?: boolean;
    clearLabel?: string;
  }) =>
    html(
      <DataTable
        rows={props.rows ?? rows}
        columns={columns}
        isLoading={props.isLoading}
        emptyState="No matching countries"
        labels={props.clearLabel ? { clearFilters: props.clearLabel } : undefined}
        filters={{
          value: props.value ?? nameFilter,
          onChange: () => {},
          columns: [{ id: 'name', label: 'Name' }],
          clearFilters: props.clearFilters,
        }}
      />,
    );

  test('off by default: no button, and the chip line keeps its own height', () => {
    const markup = table({});
    expect(count(markup, clearButton)).toBe(0);
    expect(chipLine(markup)).not.toContain('min-h-7');
  });

  test('a chip with matching rows: the button follows the chips', () => {
    const markup = table({ clearFilters: true });
    expect(count(markup, clearButton)).toBe(1);
    const line = markup.slice(markup.indexOf('data-slot="list-header-chips"'));
    expect(line.indexOf('data-slot="chip"')).toBeLessThan(line.indexOf('data-table-clear-filters'));
    expect(markup).toContain('>Clear filters</button>');
  });

  test('no chip (a search alone): no chip line and no button', () => {
    const markup = table({ clearFilters: true, value: [] });
    expect(markup).not.toContain('data-slot="list-header-chips"');
    expect(count(markup, clearButton)).toBe(0);
  });

  test('a chip with no matching rows: the empty state has the only "Clear filters"', () => {
    const markup = table({ clearFilters: true, rows: [] });
    expect(markup).toContain('No matching countries');
    expect(count(markup, clearButton)).toBe(0);
    // The line keeps the button's height, so the table does not move.
    expect(chipLine(markup)).toContain('min-h-7');
  });

  test('a chip while the first page loads: the button stays', () => {
    const markup = table({ clearFilters: true, rows: undefined, isLoading: true });
    expect(count(markup, clearButton)).toBe(1);
  });

  test('hidden overrides the default rule both ways', () => {
    expect(count(table({ clearFilters: { hidden: true } }), clearButton)).toBe(0);
    expect(count(table({ clearFilters: { hidden: false }, rows: [] }), clearButton)).toBe(1);
  });

  test('labels.clearFilters renames the button', () => {
    expect(table({ clearFilters: true, clearLabel: 'Reset' })).toContain('>Reset</button>');
  });

  test('resolveClearFilters: off, default clear, and the consumer handler', () => {
    const setColumnFilters = mock();
    expect(resolveClearFilters(undefined, { setColumnFilters }, false)).toBeUndefined();
    expect(resolveClearFilters(false, { setColumnFilters }, false)).toBeUndefined();

    const builtIn = resolveClearFilters(true, { setColumnFilters }, true);
    expect(builtIn?.hidden).toBe(true);
    builtIn?.onClear();
    expect(setColumnFilters).toHaveBeenCalledWith([]);

    const onClear = mock();
    const custom = resolveClearFilters({ onClear }, { setColumnFilters }, false);
    expect(custom?.hidden).toBe(false);
    custom?.onClear();
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(setColumnFilters).toHaveBeenCalledTimes(1);
  });
});

describe('DataTable row actions', () => {
  test('rowActions appends an action per row plus the sr-only header', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowActions={(row) => <button type="button">{`Edit ${row.name}`}</button>}
      />,
    );
    expect(markup).toContain('Edit Aland Islands');
    expect(markup).toContain('Edit Brazil');
    expect(markup).toContain('Open row actions');
  });
});

describe('DataTable context actions', () => {
  test('contextActions wraps each row as a context-menu trigger without adding a column', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        contextActions={(row) => <button type="button">{`Ctx ${row.name}`}</button>}
      />,
    );
    // Rows still render, and no trailing actions column is added — that's the
    // job of `rowActions`; the right-click accelerator adds no visible column.
    expect(markup).toContain('Aland Islands');
    expect(markup).toContain('Brazil');
    expect(markup).not.toContain('Open row actions');
    // Every row became a context-menu trigger.
    expect(count(markup, /data-context-menu-trigger=""/g)).toBe(2);
  });

  test('contextActions composes with rowActions (button column AND right-click)', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowActions={(row) => <button type="button">{`Edit ${row.name}`}</button>}
        contextActions={() => <button type="button">Ctx</button>}
      />,
    );
    expect(markup).toContain('Open row actions'); // rowActions column still present
    expect(count(markup, /data-context-menu-trigger=""/g)).toBe(2); // rows are triggers
  });
});

describe('DataTable renderRow seam', () => {
  test('renderRow overrides the default row (full-width utility row via columnCount)', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderRow={(row, { columnCount }) =>
          row.id === '1' ? (
            <tr>
              <td colSpan={columnCount}>{`Utility ${columnCount}`}</td>
            </tr>
          ) : undefined
        }
      />,
    );
    // The first row is replaced by a full-width utility row; the "2" proves
    // ctx.columnCount (used for the colspan) is threaded through.
    expect(markup).toContain('Utility 2');
    expect(markup).not.toContain('Aland Islands');
    // A row returning undefined renders nothing for that datum.
    expect(markup).not.toContain('Brazil');
  });

  test('returning ctx.defaultRow keeps the built-in rendering', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderRow={(_row, { defaultRow }) => defaultRow}
      />,
    );
    expect(markup).toContain('Aland Islands');
    expect(markup).toContain('Brazil');
  });

  test('renderRow can read table meta supplied through setTableOptions', () => {
    type UtilityMeta = { utilityRowIds: Set<string> };
    const setUtilityMeta = (options: TableOptions<Country>): TableOptions<Country> => ({
      ...options,
      meta: { utilityRowIds: new Set(['1']) },
    });
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        setTableOptions={setUtilityMeta}
        renderRow={(row, { table, columnCount, defaultRow }) => {
          const meta = table.options.meta as UtilityMeta | undefined;
          return meta?.utilityRowIds.has(row.id) ? (
            <tr>
              <td colSpan={columnCount}>Utility from meta</td>
            </tr>
          ) : (
            defaultRow
          );
        }}
      />,
    );
    expect(markup).toContain('Utility from meta');
    expect(markup).not.toContain('Aland Islands');
    expect(markup).toContain('Brazil');
  });
});

describe('DataTable renderRow ripple', () => {
  test("hands every row its ripple timing: the built-in rows' own, in order from the top", () => {
    const seen: { id: string; className: string; at: string; span: string }[] = [];
    html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderRow={(row, { defaultRow, ripple }) => {
          const style = ripple.style as Record<string, string>;
          seen.push({
            id: row.id,
            className: ripple.className,
            at: style['--ripple-at'] as string,
            span: style['--ripple-span'] as string,
          });
          return defaultRow;
        }}
      />,
    );
    expect(seen).toHaveLength(rows.length);
    expect(seen[0]?.at).toBe('0.0000');
    expect(Number(seen[1]?.at)).toBeGreaterThan(0);
    for (const entry of seen) {
      expect(entry.className).toContain('--row-ripple-delay');
      expect(Number(entry.span)).toBeGreaterThan(0);
    }
  });

  test('a custom row that merges ctx.ripple keeps its own style', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderRow={(row, { ripple }) => (
          <tr
            data-custom=""
            className={ripple.className}
            style={{ ...ripple.style, transform: 'translate3d(0px, 4px, 0px)' }}
          >
            <td>{row.id}</td>
          </tr>
        )}
      />,
    );
    expect(markup).toContain('--ripple-at:0.0000');
    expect(markup).toContain('transform:translate3d(0px, 4px, 0px)');
  });
});

describe('DataTable renderRow select props', () => {
  const capture = (value: Record<string, boolean>) => {
    const seen: { selectProps: Record<string, unknown>; rowProps: Record<string, unknown> }[] = [];
    html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value, onChange: () => {} }}
        renderRow={(_row, { defaultRow, selectProps }) => {
          seen.push({
            selectProps: selectProps as unknown as Record<string, unknown>,
            rowProps: (defaultRow as React.ReactElement<Record<string, unknown>>).props,
          });
          return defaultRow;
        }}
      />,
    );
    return seen;
  };

  test('a custom row gets the same click-to-select handlers and attributes as a built-in row', () => {
    const seen = capture({ '1': true });
    expect(seen).toHaveLength(rows.length);
    for (const { selectProps, rowProps } of seen) {
      expect(Object.keys(selectProps).sort()).toEqual([
        'data-click-selects',
        'onClickCapture',
        'onMouseDown',
        'onPointerDown',
      ]);
      for (const [key, value] of Object.entries(selectProps)) {
        expect(rowProps[key]).toBe(value);
      }
      expect(selectProps['data-click-selects']).toBe('');
    }
  });

  test('with nothing selected, a click on a row does not select: no data-click-selects', () => {
    for (const { selectProps } of capture({})) {
      expect(selectProps['data-click-selects']).toBeUndefined();
    }
  });
});

describe('DataTable renderRow cell classes', () => {
  // The class of each body cell of the first row, in order.
  const bodyCellClasses = (markup: string) => {
    const firstRow = markup.split('<tbody')[1]?.split('</tr>')[0] ?? '';
    return [...firstRow.matchAll(/<td[^>]*?class="([^"]*)"/g)].map((match) => match[1]);
  };
  const selectable = { value: {}, onChange: () => {} };

  test('a custom row built from ctx.cellProps gets the same cell classes as a built-in row', () => {
    const builtIn = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
      />,
    );
    const custom = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
        renderRow={(row, { cellProps }) => (
          <TableRow>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} {...cellProps(cell.column.id)}>
                {String(cell.getValue() ?? '')}
              </TableCell>
            ))}
          </TableRow>
        )}
      />,
    );
    const expected = bodyCellClasses(builtIn);
    expect(expected).toHaveLength(3);
    expect(bodyCellClasses(custom)).toEqual(expected);
  });

  test('cellProps gives the select cell its zero-width classes and the first content cell its gutter', () => {
    const seen: Record<string, string> = {};
    html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
        renderRow={(row, { cellProps, defaultRow }) => {
          for (const cell of row.getVisibleCells()) {
            seen[cell.column.id] = cellProps(cell.column.id).className;
          }
          return defaultRow;
        }}
      />,
    );
    expect(seen.select).toContain('relative w-0 p-0 ps-0!');
    expect(seen.name).toContain('ps-[calc(var(--spacing)*10');
    expect(seen.code).toContain('ps-[calc(var(--spacing)*2');
    expect(seen.code).not.toContain('*10');
  });

  test('a cell the table does not select gets no gutter: without rowSelection the first cell has none', () => {
    const seen: Record<string, string> = {};
    html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderRow={(row, { cellProps, defaultRow }) => {
          for (const cell of row.getVisibleCells()) {
            seen[cell.column.id] = cellProps(cell.column.id).className;
          }
          return defaultRow;
        }}
      />,
    );
    expect(seen.name).toContain('ps-[calc(var(--spacing)*2');
  });
});

describe('DataTable selection storage', () => {
  const real = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const stubStorage = (store: Record<string, string>) =>
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
      },
    });
  afterEach(() => {
    if (real) Object.defineProperty(globalThis, 'sessionStorage', real);
    else Reflect.deleteProperty(globalThis, 'sessionStorage');
  });

  test('a write stores the ids of every page, and a read gives them back', () => {
    const store: Record<string, string> = {};
    stubStorage(store);
    writeStoredSelection('orders:1', { p1: true, p2: true, p11: true, p3: false });
    expect(JSON.parse(Object.values(store)[0] as string)).toEqual(['p1', 'p2', 'p11']);
    expect(readStoredSelection('orders:1')).toEqual({ p1: true, p2: true, p11: true });
  });

  test('an empty selection removes the entry', () => {
    const store: Record<string, string> = {};
    stubStorage(store);
    writeStoredSelection('orders:1', { p1: true });
    expect(Object.keys(store)).toHaveLength(1);
    writeStoredSelection('orders:1', {});
    expect(Object.keys(store)).toHaveLength(0);
    writeStoredSelection('orders:1', { p1: false });
    expect(Object.keys(store)).toHaveLength(0);
  });

  test('a key reads only its own selection', () => {
    stubStorage({});
    writeStoredSelection('orders:1', { p1: true });
    writeStoredSelection('orders:2', { p9: true });
    expect(readStoredSelection('orders:1')).toEqual({ p1: true });
    expect(readStoredSelection('orders:2')).toEqual({ p9: true });
    expect(readStoredSelection('orders:3')).toEqual({});
  });

  test('malformed or non-array storage reads as no selection', () => {
    const store: Record<string, string> = {};
    stubStorage(store);
    store['vendure-ui:data-table-selection:a'] = '{not json';
    store['vendure-ui:data-table-selection:b'] = '{"p1":true}';
    expect(readStoredSelection('a')).toEqual({});
    expect(readStoredSelection('b')).toEqual({});
  });

  test('blocked or full storage is ignored', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'QuotaExceededError');
    };
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: { getItem: blocked, setItem: blocked, removeItem: blocked },
    });
    expect(() => writeStoredSelection('orders:1', { p1: true })).not.toThrow();
    expect(() => writeStoredSelection('orders:1', {})).not.toThrow();
    expect(readStoredSelection('orders:1')).toEqual({});
  });

  test('no storage at all (server render) reads as no selection', () => {
    Reflect.deleteProperty(globalThis, 'sessionStorage');
    expect(readStoredSelection('orders:1')).toEqual({});
    expect(() => writeStoredSelection('orders:1', { p1: true })).not.toThrow();
  });

  test('the prop changes nothing on a server render, and without it nothing is stored', () => {
    const store: Record<string, string> = {};
    stubStorage(store);
    const plain = html(
      <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} rowSelection={{}} />,
    );
    const keyed = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{}}
        selectionStorageKey="countries"
      />,
    );
    expect(keyed).toBe(plain);
    expect(Object.keys(store)).toHaveLength(0);
  });
});

describe('DataTable row count storage', () => {
  const real = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const stubStorage = (store: Record<string, string>) =>
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
      },
    });
  afterEach(() => {
    if (real) Object.defineProperty(globalThis, 'localStorage', real);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });

  test('a write stores the count under the prefixed key, and a read gives it back', () => {
    const store: Record<string, string> = {};
    stubStorage(store);
    writeRowCount('orders', 3);
    expect(store).toEqual({ 'vendure-ui:list-total:orders': '3' });
    expect(readRowCount('orders')).toBe(3);
    writeRowCount('orders', 0);
    expect(readRowCount('orders')).toBe(0);
    expect(readRowCount('customers')).toBeNull();
  });

  test('malformed, negative or fractional counts read as nothing remembered', () => {
    stubStorage({
      'vendure-ui:list-total:a': 'abc',
      'vendure-ui:list-total:b': '-1',
      'vendure-ui:list-total:c': '2.5',
      'vendure-ui:list-total:d': '',
    });
    for (const key of ['a', 'b', 'c', 'd']) expect(readRowCount(key)).toBeNull();
  });

  test('blocked storage, or none at all, is ignored', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: blocked, setItem: blocked },
    });
    expect(readRowCount('orders')).toBeNull();
    expect(() => writeRowCount('orders', 3)).not.toThrow();
    Reflect.deleteProperty(globalThis, 'localStorage');
    expect(readRowCount('orders')).toBeNull();
    expect(() => writeRowCount('orders', 3)).not.toThrow();
  });

  test('the skeleton count is the rows the current page will have', () => {
    const page = (n: number, pageSize = 10) => ({ page: n, pageSize });
    // Nothing remembered: one full page, or the fallback without pagination.
    expect(skeletonRowCountFor(null, page(1, 25), 10)).toBe(25);
    expect(skeletonRowCountFor(null, undefined, 10)).toBe(10);
    // A remembered total of 132 at 10 per page: full pages, then 2 on page 14.
    expect(skeletonRowCountFor(132, page(1), 10)).toBe(10);
    expect(skeletonRowCountFor(132, page(14), 10)).toBe(2);
    expect(skeletonRowCountFor(132, page(15), 10)).toBe(0);
    // A short list, and an empty one.
    expect(skeletonRowCountFor(3, page(1), 10)).toBe(3);
    expect(skeletonRowCountFor(0, page(1), 10)).toBe(0);
    // Without pagination the total is the row count.
    expect(skeletonRowCountFor(3, undefined, 10)).toBe(3);
  });

  test('expectedTotal sets the skeleton rows of the first load', () => {
    const skeletonRows = (markup: string) =>
      count(markup, /data-slot="data-table-skeleton-line"/g) / columns.length;
    expect(
      skeletonRows(html(<DataTable rows={undefined} columns={columns} expectedTotal={3} />)),
    ).toBe(3);
    const lastPage = html(
      <DataTable
        rows={undefined}
        columns={columns}
        expectedTotal={132}
        pagination={{ page: 14, pageSize: 10, totalItems: null, onPageChange: () => {} }}
      />,
    );
    expect(skeletonRows(lastPage)).toBe(2);
    const empty = html(<DataTable rows={undefined} columns={columns} expectedTotal={0} />);
    expect(skeletonRows(empty)).toBe(0);
    expect(empty).toContain('data-table-empty-placeholder');
  });

  test('a server render of the hook reads nothing, so the table draws the default', () => {
    stubStorage({ 'vendure-ui:list-total:countries': '3' });
    function Remembered() {
      const expectedTotal = useRememberedListTotal('countries', null);
      return (
        <DataTable
          rows={undefined}
          columns={columns}
          skeletonRowCount={6}
          expectedTotal={expectedTotal}
        />
      );
    }
    expect(html(<Remembered />).match(/<tr[^>]*>/g)?.length).toBe(1 + 6);
  });
});

describe('DataTable onTableReady', () => {
  test('does not fire during render/SSR — an effect-only "ready" capture', () => {
    const onTableReady = mock(() => {});
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onTableReady={onTableReady}
      />,
    );
    // The prop must be render-inert: the callback fires from an effect after
    // commit, so a server render produces the same markup and no invocation.
    expect(markup).toContain('Aland Islands');
    expect(onTableReady).not.toHaveBeenCalled();
  });
});

describe('DataTable selection column', () => {
  test('selectColumnId customizes the generated display-column id', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {}, selectColumnId: 'selection' }}
        bulkActions={({ table }) => (
          <span>
            {table
              .getAllLeafColumns()
              .map((column) => column.id)
              .join('|')}
          </span>
        )}
      />,
    );
    expect(markup).toContain('selection|name|code');
    expect(markup).not.toContain('select|name|code');
  });
});

describe('DataTable pinFirstColumn', () => {
  const selectable = { value: {}, onChange: () => {} };
  const linkedColumns: ColumnDef<Country>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <DataTableRowLink href={`/countries/${row.original.id}`}>
          {row.original.name}
        </DataTableRowLink>
      ),
    },
    { accessorKey: 'code', header: 'Code' },
  ];
  // The opening tag of every cell of each row, header first.
  const cellTags = (markup: string) =>
    markup
      .split('</tr>')
      .slice(0, -1)
      .map((row) => [...row.matchAll(/<t[dh] [^>]*>/g)].map((match) => match[0]));
  const hostCount = (markup: string) =>
    count(markup, /data-slot="data-table-row-link-overlay-host"/g);

  test('is off by default: no pin mark, no pinned cells, no overlay hosts', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={linkedColumns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
      />,
    );
    expect(markup).not.toMatch(/\sdata-pin-first-column=/);
    expect(markup).not.toMatch(/\sdata-pinned=/);
    expect(hostCount(markup)).toBe(0);
  });

  test('passes the prop to Table and pins the leading column with the select cell', () => {
    const markup = html(
      <DataTable
        pinFirstColumn
        rows={rows}
        columns={linkedColumns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
      />,
    );
    expect(markup).toContain('data-pin-first-column=""');
    // Header and both body rows: the select cell is first (Table pins it as the
    // first child), the name cell carries the mark, the code cell scrolls.
    for (const [select, name, code] of cellTags(markup)) {
      expect(select).toContain('data-column-id="select"');
      expect(select).not.toContain('data-pinned');
      expect(name).toContain('data-column-id="name"');
      expect(name).toContain('data-pinned=""');
      expect(code).not.toContain('data-pinned');
    }
  });

  test('without selection the first column is the first cell, and still marked', () => {
    const markup = html(<DataTable pinFirstColumn rows={rows} columns={columns} />);
    for (const [name, code] of cellTags(markup)) {
      expect(name).toContain('data-column-id="name"');
      expect(name).toContain('data-pinned=""');
      expect(code).not.toContain('data-pinned');
    }
  });

  test('each body row has an overlay host on each side of the pinned edge', () => {
    const markup = html(
      <DataTable
        pinFirstColumn
        rows={rows}
        columns={linkedColumns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
      />,
    );
    expect(hostCount(markup)).toBe(4);
    const firstRow = markup.split('<tbody')[1]?.split('</tr>')[0] ?? '';
    const cells = firstRow.split('<td').slice(1);
    // In the pinned name cell and in the last cell, which scrolls.
    expect(cells.map((cell) => cell.includes('data-table-row-link-overlay-host'))).toEqual([
      false,
      true,
      true,
    ]);
  });

  test('a single data column is all pinned: one host, in its cell', () => {
    const markup = html(
      <DataTable
        pinFirstColumn
        rows={rows}
        columns={linkedColumns.slice(0, 1)}
        getRowId={(row) => row.id}
        rowSelection={selectable}
      />,
    );
    expect(hostCount(markup)).toBe(2);
  });

  test('ctx.rowLinkHost gives a custom row the overlay hosts of a built-in row', () => {
    const customRows = (pinned: boolean, withHost: boolean) =>
      html(
        <DataTable
          pinFirstColumn={pinned}
          rows={rows}
          columns={linkedColumns}
          getRowId={(row) => row.id}
          rowSelection={selectable}
          renderRow={(row, { cellProps, rowLinkHost }) => (
            <TableRow data-custom-row="">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} {...cellProps(cell.column.id)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  {withHost ? rowLinkHost(cell.column.id) : null}
                </TableCell>
              ))}
            </TableRow>
          )}
        />,
      );
    const markup = customRows(true, true);
    expect(count(markup, /data-custom-row/g)).toBe(rows.length);
    expect(hostCount(markup)).toBe(4);
    const firstRow = markup.split('<tbody')[1]?.split('</tr>')[0] ?? '';
    // The same cells as a built-in row: the pinned name cell and the last cell.
    expect(
      firstRow
        .split('<td')
        .slice(1)
        .map((cell) => cell.includes('data-table-row-link-overlay-host')),
    ).toEqual([false, true, true]);
    // Without the host the row has none; without pinning the host is empty.
    expect(hostCount(customRows(true, false))).toBe(0);
    expect(hostCount(customRows(false, true))).toBe(0);
  });

  test('the select cell takes the selection ripple on the bar it draws', () => {
    const selectCell = (pinned: boolean) =>
      html(
        <DataTable
          pinFirstColumn={pinned}
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          rowSelection={selectable}
        />,
      )
        .split('<tbody')[1]
        ?.match(/<td [^>]*data-column-id="select"[^>]*>/)?.[0]
        .replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&') ?? '';
    const ripple =
      'in-data-[select-ripple=select]:[tr:not([data-state=selected])>&]:before:[clip-path:inset(0_0_100%_0)]!';
    expect(selectCell(true)).toContain(ripple);
    expect(selectCell(false)).not.toContain(ripple);
  });

  test('ctx.cellProps carries the pin mark to a custom row', () => {
    const seen: Record<string, string | undefined> = {};
    html(
      <DataTable
        pinFirstColumn
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={selectable}
        renderRow={(row, { cellProps, defaultRow }) => {
          for (const cell of row.getVisibleCells()) {
            seen[cell.column.id] = cellProps(cell.column.id)['data-pinned'];
          }
          return defaultRow;
        }}
      />,
    );
    expect(seen).toEqual({ select: undefined, name: '', code: undefined });
  });

  test('the overlay stays under the row controls and is not one of them', () => {
    const markup = html(<DataTable pinFirstColumn rows={rows} columns={linkedColumns} />)
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&');
    const tableClass = markup.match(/<table [^>]*class="([^"]*)"/)?.[1] ?? '';
    // The rule that raises row controls above the link skips the overlay.
    expect(tableClass).toMatch(
      /:not\(\[data-slot=data-table-row-link\],\[data-slot=data-table-row-link-overlay\],/,
    );
    // While the link holds keyboard focus, the pinned cells draw their part
    // of the row's ring.
    expect(tableClass).toContain(
      '[&_tr:not([data-click-selects]):has([data-slot=data-table-row-link]:focus-visible)]:[--table-pin-ring-x:inset_2px_0_0_var(--ring)]',
    );
  });
});

describe('DataTable pagination', () => {
  test('pagination wired → footer renders with the range', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        pagination={{ page: 1, pageSize: 25, totalItems: 132, onPageChange: () => {} }}
      />,
    );
    expect(markup).toContain('data-slot="table-pagination"');
    expect(markup.replace(/<[^>]+>/g, '')).toContain('1–25 of 132');
  });

  test('the footer is a CardFooter band; absent without pagination', () => {
    const paged = html(
      <DataTable
        rows={rows}
        columns={columns}
        pagination={{ page: 1, pageSize: 25, totalItems: 132, onPageChange: () => {} }}
      />,
    );
    expect(paged).toContain('data-slot="card-footer"');
    const unpaged = html(<DataTable rows={rows} columns={columns} />);
    expect(unpaged).not.toContain('data-slot="card-footer"');
  });
});

describe('DataTable card frame', () => {
  test('the root is the card frame; the header band renders only with header content', () => {
    const bare = html(<DataTable rows={rows} columns={columns} />);
    expect(bare).toContain('data-slot="data-table"');
    expect(bare).toContain('data-slot="card-table"');
    expect(bare).not.toContain('data-slot="card-header"');

    const withHeader = html(<DataTable rows={rows} columns={columns} header={<h2>Orders</h2>} />);
    expect(withHeader).toContain('data-slot="card-header"');
  });

  test('controls alone open the header band (no header slot)', () => {
    const markup = html(<DataTable rows={rows} columns={columns} columnVisibility={{}} />);
    expect(markup).toContain('data-slot="card-header"');
    expect(markup).toContain('data-slot="data-table-view-options"');
  });

  test('with no controls row the bulk bar covers the column header row; it opens no band', () => {
    const bulk = (
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: { '1': true }, onChange: () => {} }}
        bulkActions={() => <span>Archive</span>}
      />
    );
    const selected = html(bulk);
    expect(selected).not.toContain('data-slot="card-header"');
    expect(selected).toContain('data-slot="data-table-bulk-actions"');
    // The bar sits in the table's card slot, over the header row, and the
    // table marks its column labels to fade out under it.
    expect(selected).toMatch(
      /data-slot="card-table"[^>]*>[\s\S]*data-slot="data-table-bulk-actions"[\s\S]*<table/,
    );
    expect(selected).toContain('data-bulk-over-header=""');

    const idle = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: {}, onChange: () => {} }}
        bulkActions={() => <span>Archive</span>}
      />,
    );
    expect(idle).not.toContain('data-slot="card-header"');
    expect(idle).not.toContain('data-bulk-over-header=""');
  });

  test("the bulk bar takes the controls row's place while rows are selected", () => {
    const props = {
      rows,
      columns,
      getRowId: (row: Country) => row.id,
      columnVisibility: {},
      bulkActions: () => <span>Archive</span>,
    };
    const selected = html(
      <DataTable {...props} rowSelection={{ value: { '1': true }, onChange: () => {} }} />,
    );
    expect(selected).toContain('data-slot="data-table-bulk-actions"');
    // The controls row stays in the cell, out of reach, so the cell keeps its
    // height from the first frame.
    expect(selected).toMatch(/<div[^>]*inert=""[^>]*><div data-slot="list-header-controls"/);

    const idle = html(<DataTable {...props} rowSelection={{ value: {}, onChange: () => {} }} />);
    expect(idle).toContain('data-slot="list-header-controls"');
    expect(idle).not.toContain('data-slot="data-table-bulk-actions"');
  });

  test('frame="plain" renders a chrome-less stack, not a nested card', () => {
    const markup = html(<DataTable rows={rows} columns={columns} frame="plain" />);
    const rootClass = markup.match(/data-slot="data-table"[^>]*class="([^"]*)"/)?.[1] ?? '';
    expect(rootClass).not.toContain('bg-card');
    expect(rootClass).not.toContain('border');
    expect(rootClass).not.toContain('rounded');
    expect(markup).not.toContain('data-slot="card"'); // no Card root at all
    expect(markup).toContain('data-slot="card-table"');
  });

  test('footerRows function form receives the injected column count', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowSelection={{ value: {}, onChange: () => {} }}
        rowActions={() => <span>edit</span>}
        footerRows={({ columnCount }) => (
          <tr data-slot="footer-row">
            <td colSpan={columnCount}>Total</td>
          </tr>
        )}
      />,
    );
    // 2 data columns + select + actions
    expect(markup.toLowerCase()).toContain('colspan="4"');
  });

  test('footerRows render after the data rows, only alongside real rows', () => {
    const footer = (
      <tr data-slot="footer-row">
        <td colSpan={2}>Total</td>
      </tr>
    );
    const withRows = html(<DataTable rows={rows} columns={columns} footerRows={footer} />);
    expect(withRows).toContain('data-slot="footer-row"');
    expect(withRows.indexOf('data-slot="footer-row"')).toBeGreaterThan(withRows.indexOf('Brazil'));

    const empty = html(<DataTable rows={[]} columns={columns} footerRows={footer} />);
    expect(empty).not.toContain('data-slot="footer-row"');

    const loading = html(
      <DataTable rows={undefined} columns={columns} isLoading footerRows={footer} />,
    );
    expect(loading).not.toContain('data-slot="footer-row"');
  });
});

// --- pure helper units (the getRange/clampPage precedent) ---

const asColumn = (id: string): ColumnDef<Country> => ({ id, header: id });

describe('buildDisplayColumns', () => {
  test('no display columns returns the data columns unchanged', () => {
    const data = [asColumn('a'), asColumn('b')];
    expect(buildDisplayColumns(data, {})).toEqual(data);
  });

  test('select column is prepended', () => {
    const result = buildDisplayColumns([asColumn('a')], { select: asColumn('select') });
    expect(result.map((c) => c.id)).toEqual(['select', 'a']);
  });

  test('actions column is appended', () => {
    const result = buildDisplayColumns([asColumn('a')], { actions: asColumn('actions') });
    expect(result.map((c) => c.id)).toEqual(['a', 'actions']);
  });

  test('select and actions wrap the data columns', () => {
    const result = buildDisplayColumns([asColumn('a'), asColumn('b')], {
      select: asColumn('select'),
      actions: asColumn('actions'),
    });
    expect(result.map((c) => c.id)).toEqual(['select', 'a', 'b', 'actions']);
  });
});

describe('getSelectedRowIds', () => {
  test('returns only the ids flagged true', () => {
    expect(getSelectedRowIds({ '1': true, '2': false, '3': true })).toEqual(['1', '3']);
  });

  test('empty selection yields no ids', () => {
    expect(getSelectedRowIds({})).toEqual([]);
  });
});

describe('DataTable bulk action context', () => {
  const contextOf = (props: Partial<React.ComponentProps<typeof DataTable<Country>>>) => {
    let seen: Record<string, unknown> | undefined;
    html(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        bulkActions={(ctx) => {
          seen = {
            ids: ctx.selectedRowIds,
            count: ctx.selectedCount,
            loaded: ctx.selection.length,
            missing: ctx.missingRowIds,
          };
          return null;
        }}
        {...props}
      />,
    );
    return seen;
  };

  test('every selected id counts, also for a row on another page', () => {
    // '9' is on a page the table has not shown: the table holds two rows.
    expect(
      contextOf({ rowSelection: { value: { '1': true, '9': true }, onChange: () => {} } }),
    ).toEqual({ ids: ['1', '9'], count: 2, loaded: 1, missing: ['9'] });
  });

  test('a restored selection before its rows load still reports every id', () => {
    expect(
      contextOf({
        rows: undefined,
        isLoading: true,
        rowSelection: { value: { '1': true, '2': true, '9': true }, onChange: () => {} },
      }),
    ).toEqual({ ids: ['1', '2', '9'], count: 3, loaded: 0, missing: ['1', '2', '9'] });
  });

  test('a row deleted on the server stays in the ids and is reported missing', () => {
    expect(
      contextOf({
        rowSelection: { value: { '1': true, '2': true, '404': true }, onChange: () => {} },
      }),
    ).toEqual({ ids: ['1', '2', '404'], count: 3, loaded: 2, missing: ['404'] });
  });

  test('nothing is missing when every selected row is loaded', () => {
    expect(
      contextOf({ rowSelection: { value: { '1': true, '2': true }, onChange: () => {} } }),
    ).toEqual({ ids: ['1', '2'], count: 2, loaded: 2, missing: [] });
  });
});

describe('getSelectedOriginals', () => {
  const cache = new Map<string, Country>([
    ['1', aland],
    ['2', brazil],
  ]);

  test('materialises selected ids into originals via the cache', () => {
    expect(getSelectedOriginals({ '1': true, '2': true }, cache)).toEqual([aland, brazil]);
  });

  test('ids missing from the cache are skipped (no undefined holes)', () => {
    expect(getSelectedOriginals({ '1': true, '9': true }, cache)).toEqual([aland]);
  });

  test('deselected ids are excluded', () => {
    expect(getSelectedOriginals({ '1': true, '2': false }, cache)).toEqual([aland]);
  });
});

describe('getHideableLeafColumns', () => {
  const column = (id: string, canHide = true) =>
    ({ id, getCanHide: () => canHide }) as Column<Country, unknown>;

  test('returns hideable leaf columns and omits grouped parent columns', () => {
    const parentColumn = column('identity');
    const nameColumn = column('name');
    const selectColumn = column('select', false);
    const table = {
      getAllColumns: () => [parentColumn, nameColumn, selectColumn],
      getAllLeafColumns: () => [nameColumn, selectColumn],
    } as unknown as Table<Country>;

    expect(getHideableLeafColumns(table).map((item) => item.id)).toEqual(['name']);
  });
});

describe('resolveSlot', () => {
  const table = { marker: 'table' } as unknown as Table<unknown>;

  test('a plain node is returned as-is', () => {
    expect(resolveSlot('node', table)).toBe('node');
  });

  test('a render-prop is invoked with the table', () => {
    expect(resolveSlot((t) => (t as unknown as { marker: string }).marker, table)).toBe('table');
  });

  test('undefined stays undefined', () => {
    expect(resolveSlot(undefined, table)).toBeUndefined();
  });
});

describe('isControlled', () => {
  test('a config with a value is controlled', () => {
    expect(isControlled({ value: [], onChange: () => {} })).toBe(true);
  });

  test('a defaultValue config is uncontrolled', () => {
    expect(isControlled({ defaultValue: [] })).toBe(false);
  });

  test('an absent config is uncontrolled', () => {
    expect(isControlled(undefined)).toBe(false);
  });
});

// The browser measure (alignment within 0.5px, nothing leaves its cell) runs in
// the `Molecules/DataTable/Cell Text Alignment` story. These cover the wiring
// and the arithmetic without a DOM.
describe('cell text alignment', () => {
  test('body cells pull their first element back by its content inset', () => {
    const markup = renderToStaticMarkup(
      <DataTable<Country> rows={rows} columns={columns} getRowId={(row) => row.id} />,
    );
    expect(markup).toContain('data-column-id="name"');
    expect(markup).toContain('[:where(&amp;&gt;:first-child)]:-ms-(--content-inset)');
  });

  test('the sort header pulls back by its own content inset', () => {
    const markup = renderToStaticMarkup(
      <DataTable<Country>
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sorting={{ defaultValue: [] }}
      />,
    );
    expect(markup).toContain('-ms-(--content-inset)');
    expect(markup).not.toContain('-ml-2.5');
  });
});

describe('measureColumnIndents', () => {
  // A cell starts at x=0 with 8px padding on each side, unless set. `content`
  // is the left edge of its first element, `inner` that of the element inside
  // it (content one wrapper deep). `indent` is the column indent already
  // applied, which the padding includes.
  type FakeCell = {
    columnId: string;
    start?: number;
    end?: number;
    indent?: number;
    content?: number;
    inner?: number;
  };

  const box = (left: number) => ({
    getBoundingClientRect: () => ({ left, right: left + 40, width: 40 }) as DOMRect,
  });

  function measure(cells: FakeCell[]) {
    const styles = new Map<object, object>();
    const elements = cells.map((cell) => {
      const inner = cell.inner === undefined ? null : box(cell.inner);
      const first =
        cell.content === undefined ? null : { ...box(cell.content), firstElementChild: inner };
      const element = {
        ...box(0),
        firstElementChild: first,
        dataset: { columnId: cell.columnId },
        style: { getPropertyValue: () => (cell.indent ? `${cell.indent}px` : '') },
      };
      styles.set(element, {
        direction: 'ltr',
        paddingInlineStart: `${(cell.start ?? 8) + (cell.indent ?? 0)}px`,
        paddingInlineEnd: `${cell.end ?? 8}px`,
      });
      return element;
    });
    const original = globalThis.getComputedStyle;
    globalThis.getComputedStyle = ((element: object) =>
      styles.get(element)) as unknown as typeof getComputedStyle;
    try {
      return measureColumnIndents({
        querySelectorAll: () => elements,
      } as unknown as HTMLTableElement);
    } finally {
      globalThis.getComputedStyle = original;
    }
  }

  test('content within the gutter needs no indent', () => {
    expect(
      measure([
        { columnId: 'sku', content: 0 },
        { columnId: 'name', content: 8 },
      ]),
    ).toEqual({});
  });

  test('a column indents by its widest overshoot', () => {
    expect(
      measure([
        { columnId: 'state', content: -19 },
        { columnId: 'state', content: -2 },
        { columnId: 'state', content: 8 },
        { columnId: 'sku', content: -1 },
      ]),
    ).toEqual({ state: 19, sku: 1 });
  });

  test('content one wrapper deep counts too', () => {
    expect(measure([{ columnId: 'state', content: 8, inner: -19 }])).toEqual({ state: 19 });
  });

  test('in an edge column the content keeps the card inset clear, less one gutter', () => {
    // 20px card inset: a 20px pull-back may only take the 8px gutter.
    expect(measure([{ columnId: 'state', start: 20, content: 0 }])).toEqual({ state: 12 });
  });

  test('the measure is stable once the indent is applied', () => {
    // Indented by 19px, the chip now starts on the cell edge.
    expect(measure([{ columnId: 'state', indent: 19, content: 0 }])).toEqual({ state: 19 });
  });

  test('sameIndents compares by value', () => {
    expect(sameIndents({ a: 1 }, { a: 1 })).toBe(true);
    expect(sameIndents({ a: 1 }, { a: 2 })).toBe(false);
    expect(sameIndents({ a: 1 }, {})).toBe(false);
  });
});

describe('DataTable filter value label', () => {
  test('labels.filterValue and messages.dataTable.filterValue are strings', () => {
    const labels: DataTableLabels = { filterValue: 'Wert' };
    const messages: FormatMessages = { dataTable: { filterValue: 'Wert' } };
    // @ts-expect-error: the label is a string, not a function.
    const wrong: DataTableLabels = { filterValue: () => 'Wert' };
    expect([labels.filterValue, messages.dataTable?.filterValue, wrong]).toHaveLength(3);
    expect(defaultMessages.dataTable.filterValue).toBe('Value');
  });
});

describe('DataTable pagination types', () => {
  test('server pagination requires totalItems (null or undefined when not known); client pagination takes none', () => {
    const base = { page: 1, pageSize: 10, onPageChange: () => {} };
    // @ts-expect-error: server mode without totalItems.
    const missing: DataTablePagination = { ...base };
    const unknown: DataTablePagination = { ...base, totalItems: null };
    const notYet: DataTablePagination = { ...base, totalItems: undefined };
    // @ts-expect-error: client mode pages `rows` itself.
    const clientTotal: DataTablePagination = { ...base, mode: 'client', totalItems: 3 };
    expect([missing, unknown, notYet, clientTotal]).toHaveLength(4);
  });
});
