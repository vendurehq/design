import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { type ColumnDef, DataTable, type Table } from './data-table.tsx';
import {
  buildDisplayColumns,
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
