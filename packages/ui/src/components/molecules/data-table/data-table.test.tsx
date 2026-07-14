import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import type { Column } from '@tanstack/react-table';
import { renderToStaticMarkup } from 'react-dom/server';

import { type ColumnDef, DataTable, type Table, type TableOptions } from './data-table.tsx';
import {
  buildDisplayColumns,
  getHideableLeafColumns,
  getSelectedOriginals,
  getSelectedRowIds,
  isControlled,
  resolveSlot,
} from './data-table-helpers.tsx';

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

  test('no columnVisibility prop → no columns gear', () => {
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

describe('DataTable loading state', () => {
  test('empty + isLoading renders skeletonRowCount rows (× column count)', () => {
    const markup = html(<DataTable rows={[]} columns={columns} isLoading skeletonRowCount={3} />);
    // 3 skeleton rows × 2 columns.
    expect(count(markup, /data-slot="skeleton"/g)).toBe(6);
    expect(markup).not.toContain('No results');
  });

  test('populated + isLoading keeps the real rows (no skeleton swap)', () => {
    const markup = html(<DataTable rows={rows} columns={columns} isLoading />);
    expect(markup).not.toContain('data-slot="skeleton"');
    expect(markup).toContain('Aland Islands');
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
    expect(markup).toContain('lucide-minus');
  });
});

describe('DataTable column visibility (controlled source of truth)', () => {
  test('visibility gear renders when wired', () => {
    const markup = html(
      <DataTable
        rows={rows}
        columns={columns}
        columnVisibility={{ value: {}, onChange: () => {} }}
      />,
    );
    expect(markup).toContain('data-slot="data-table-view-options"');
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
    expect(count(markup, /data-slot="context-menu-trigger"/g)).toBe(2);
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
    expect(count(markup, /data-slot="context-menu-trigger"/g)).toBe(2); // rows are triggers
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

  test('bulk selection alone opens the header band; empty selection leaves no band', () => {
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
    expect(selected).toContain('data-slot="card-header"');
    expect(selected).toContain('data-slot="data-table-bulk-actions"');

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
  });

  test('the bulk bar replaces the controls row while rows are selected', () => {
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
    expect(selected).not.toContain('data-slot="list-header-controls"');

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

    const loading = html(<DataTable rows={[]} columns={columns} isLoading footerRows={footer} />);
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
