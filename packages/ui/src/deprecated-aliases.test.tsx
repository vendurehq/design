// The deprecated 3.x aliases: each old name behaves like its new name, the new
// name wins when both are set, and each warns once in development. Delete this
// file with `lib/deprecated.ts` in 4.0.
import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import type { SortingState } from '@tanstack/react-table';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert } from './components/atoms/alert.tsx';
import { BreadcrumbSearchMenu } from './components/atoms/breadcrumb.tsx';
import { Combobox, ComboboxList } from './components/atoms/combobox.tsx';
import { DirectionProvider } from './components/atoms/direction.tsx';
import { PaginationLink } from './components/atoms/pagination.tsx';
import { SheetContent } from './components/atoms/sheet.tsx';
import {
  Sidebar,
  SidebarMenuButton,
  SidebarMenuSubButton,
  SidebarProvider,
} from './components/atoms/sidebar.tsx';
import {
  getStoredPackageManager,
  OLD_STORAGE_EVENT,
  STORAGE_EVENT,
  setStoredPackageManager,
} from './components/molecules/code-block/package-manager-storage.ts';
import { ComboboxFreeText } from './components/molecules/combobox-free-text.tsx';
import { withValueChange } from './components/molecules/data-table/data-table-helpers.tsx';
import { readRowCount } from './components/molecules/data-table/data-table-row-count-storage.tsx';
import { readStoredSelection } from './components/molecules/data-table/data-table-selection-storage.tsx';
import type { DataTableSorting } from './components/molecules/data-table/data-table-types.tsx';
import { ElapsedTime } from './components/molecules/elapsed-time.tsx';
import { PageHeaderBackLink, PageHeaderBackRow } from './components/molecules/page-header.tsx';
import * as relativeTimeModule from './components/molecules/relative-time.tsx';
import { RelativeTime } from './components/molecules/relative-time.tsx';
import { StatCard } from './components/molecules/stat-card.tsx';
import { EmptyState } from './components/molecules/state-views/empty-state.tsx';
import { ErrorState } from './components/molecules/state-views/error-state.tsx';
import { LoadingState } from './components/molecules/state-views/loading-state.tsx';
import {
  logicalSide,
  migrateStorageKey,
  resetDeprecationWarnings,
  warnDeprecated,
} from './lib/deprecated.ts';
import { formatRelative, formatRelativeDuration } from './lib/format-relative.ts';

const render = renderToStaticMarkup;
let warn: ReturnType<typeof spyOn<Console, 'warn'>>;

beforeEach(() => {
  resetDeprecationWarnings();
  warn = spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

const warned = () => warn.mock.calls.map((call) => String(call[0]));

describe('warnDeprecated', () => {
  test('warns once per component and old name, with the new name and 4.0', () => {
    warnDeprecated('Alert', 'variant', 'tone');
    warnDeprecated('Alert', 'variant', 'tone');
    warnDeprecated('StatCard', 'variant', 'tone');
    expect(warned()).toEqual([
      'Alert: `variant` is deprecated, use `tone`. It will be removed in 4.0.',
      'StatCard: `variant` is deprecated, use `tone`. It will be removed in 4.0.',
    ]);
  });

  test('a new name alone does not warn', () => {
    render(<Alert tone="info">Note</Alert>);
    render(<LoadingState loadingLabel="x" />);
    expect(warned()).toEqual([]);
  });
});

describe('Alert variant → tone', () => {
  test('each variant renders its tone', () => {
    const tone = (html: string) => html.match(/data-tone="([^"]*)"/)?.[1];
    expect(tone(render(<Alert variant="destructive">x</Alert>))).toBe('critical');
    expect(tone(render(<Alert variant="warning">x</Alert>))).toBe('warning');
    expect(tone(render(<Alert variant="info">x</Alert>))).toBe('info');
    expect(tone(render(<Alert variant="default">x</Alert>))).toBeUndefined();
    expect(render(<Alert variant="destructive">x</Alert>)).toBe(
      render(<Alert tone="critical">x</Alert>),
    );
    expect(warned()).toHaveLength(1);
  });

  test('tone wins', () => {
    expect(
      render(
        <Alert tone="success" variant="destructive">
          x
        </Alert>,
      ),
    ).toContain('data-tone="success"');
  });
});

describe('isActive → active', () => {
  const sidebar = (node: React.ReactNode) => render(<SidebarProvider>{node}</SidebarProvider>);

  test('SidebarMenuButton', () => {
    expect(sidebar(<SidebarMenuButton isActive>Orders</SidebarMenuButton>)).toMatch(
      /\sdata-active=/,
    );
    expect(sidebar(<SidebarMenuButton isActive>Orders</SidebarMenuButton>)).toBe(
      sidebar(<SidebarMenuButton active>Orders</SidebarMenuButton>),
    );
    expect(
      sidebar(
        <SidebarMenuButton active={false} isActive>
          Orders
        </SidebarMenuButton>,
      ),
    ).not.toMatch(/\sdata-active=/);
    expect(warned()).toEqual([
      'SidebarMenuButton: `isActive` is deprecated, use `active`. It will be removed in 4.0.',
    ]);
  });

  test('SidebarMenuSubButton', () => {
    expect(sidebar(<SidebarMenuSubButton isActive>Products</SidebarMenuSubButton>)).toBe(
      sidebar(<SidebarMenuSubButton active>Products</SidebarMenuSubButton>),
    );
    expect(
      sidebar(
        <SidebarMenuSubButton active={false} isActive>
          Products
        </SidebarMenuSubButton>,
      ),
    ).not.toMatch(/\sdata-active=/);
  });

  test('PaginationLink', () => {
    expect(
      render(
        <PaginationLink href="#" isActive>
          2
        </PaginationLink>,
      ),
    ).toBe(
      render(
        <PaginationLink href="#" active>
          2
        </PaginationLink>,
      ),
    );
    expect(
      render(
        <PaginationLink href="#" active={false} isActive>
          2
        </PaginationLink>,
      ),
    ).not.toContain('aria-current');
  });
});

describe('size names', () => {
  test('SidebarMenuSubButton md → default', () => {
    const html = render(
      <SidebarProvider>
        <SidebarMenuSubButton size="md">Products</SidebarMenuSubButton>
      </SidebarProvider>,
    );
    expect(html).toContain('data-size="default"');
    expect(warned()).toEqual([
      'SidebarMenuSubButton: `size="md"` is deprecated, use `size="default"`. It will be removed in 4.0.',
    ]);
  });

  test('EmptyState compact → sm', () => {
    expect(render(<EmptyState size="compact" title="No domains" />)).toBe(
      render(<EmptyState size="sm" title="No domains" />),
    );
  });

  test('ErrorState compact → sm', () => {
    expect(render(<ErrorState size="compact" title="Couldn't load" />)).toBe(
      render(<ErrorState size="sm" title="Couldn't load" />),
    );
  });
});

describe('side left/right → start/end', () => {
  const side = (html: string) => html.match(/data-side="([^"]*)"/)?.[1];
  const sidebar = (value: 'left' | 'right', direction: 'ltr' | 'rtl') =>
    side(
      render(
        <DirectionProvider direction={direction}>
          <SidebarProvider>
            <Sidebar side={value} />
          </SidebarProvider>
        </DirectionProvider>,
      ),
    );

  test('Sidebar keeps the same physical edge in both directions', () => {
    expect(sidebar('left', 'ltr')).toBe('start');
    expect(sidebar('right', 'ltr')).toBe('end');
    expect(sidebar('left', 'rtl')).toBe('end');
    expect(sidebar('right', 'rtl')).toBe('start');
  });

  test('the dir prop decides before the provider', () => {
    const html = render(
      <SidebarProvider>
        <Sidebar side="left" dir="rtl" />
      </SidebarProvider>,
    );
    expect(side(html)).toBe('end');
  });

  test('SheetContent takes left and right; the mapping passes logical sides through', () => {
    // Never called: SheetContent needs a Sheet. Only the types are checked.
    const typeChecks = () => [
      <SheetContent key="l" side="left" />,
      <SheetContent key="r" side="right" />,
    ];
    expect(typeChecks).toBeFunction();
    expect(logicalSide('SheetContent', 'left', 'ltr')).toBe('start');
    expect(logicalSide('SheetContent', 'left', 'rtl')).toBe('end');
    expect(logicalSide('SheetContent', 'top', 'rtl')).toBe('top');
    expect(warned()).toEqual([
      'SheetContent: `side="left"` is deprecated, use `side="start"`. It will be removed in 4.0.',
    ]);
  });
});

describe('loading names', () => {
  const comboboxList = (props: { isLoading?: boolean; loading?: boolean }) =>
    render(
      <Combobox items={['DE']} open onLoadMore={() => {}} {...props}>
        <ComboboxList>{(item: string) => <div key={item}>{item}</div>}</ComboboxList>
      </Combobox>,
    );

  test('Combobox loading → isLoading', () => {
    expect(comboboxList({ loading: true })).toBe(comboboxList({ isLoading: true }));
    expect(comboboxList({ loading: true })).toContain('data-slot="combobox-loading"');
    expect(comboboxList({ isLoading: false, loading: true })).not.toContain(
      'data-slot="combobox-loading"',
    );
  });

  test('ComboboxFreeText loading → isLoading', () => {
    const field = (props: { isLoading?: boolean; loading?: boolean }) =>
      render(<ComboboxFreeText value="" onValueChange={() => {}} items={[]} {...props} />);
    expect(field({ loading: true })).toBe(field({ isLoading: true }));
    expect(field({ loading: true })).toContain('animate-spin');
    expect(field({ isLoading: false, loading: true })).not.toContain('animate-spin');
  });

  test('LoadingState srLabel → loadingLabel', () => {
    expect(render(<LoadingState srLabel="Chargement…" />)).toBe(
      render(<LoadingState loadingLabel="Chargement…" />),
    );
    expect(render(<LoadingState loadingLabel="New" srLabel="Old" />)).toContain(
      '<span class="sr-only">New</span>',
    );
  });

  test('BreadcrumbSearchMenu loading → options={undefined}; the crumb keeps its name', () => {
    const options = [{ value: 'p1', label: 'Acme Storefront' }];
    const html = render(
      <BreadcrumbSearchMenu label="Project" options={options} value="p1" loading />,
    );
    expect(html).toContain('Acme Storefront');
    expect(warned()).toEqual([
      'BreadcrumbSearchMenu: `loading` is deprecated, use `options={undefined}`. It will be removed in 4.0.',
    ]);
  });

  test('StatCard isLoading → value and delta undefined', () => {
    expect(render(<StatCard label="Revenue" value="€1" delta={{ value: 2 }} isLoading />)).toBe(
      render(<StatCard label="Revenue" value={undefined} delta={{ value: undefined }} />),
    );
    expect(render(<StatCard label="Revenue" value="€1" isLoading={false} />)).toContain('€1');
  });
});

describe('time names', () => {
  const START = Date.UTC(2026, 0, 1);

  test('ElapsedTime since/until → from/to', () => {
    expect(render(<ElapsedTime since={START} until={START + 75_000} />)).toBe(
      render(<ElapsedTime from={START} to={START + 75_000} />),
    );
    expect(render(<ElapsedTime from={null} since={START} />)).toBe(
      render(<ElapsedTime from={null} />),
    );
    expect(warned()).toHaveLength(2);
  });

  test('RelativeTime start → from', () => {
    expect(render(<RelativeTime value={START} start={START - 42_000} />)).toBe(
      render(<RelativeTime value={START} from={START - 42_000} />),
    );
  });

  test('molecules/relative-time still exports the format helpers', () => {
    const now = new Date(START);
    const then = new Date(START - 120_000);
    expect(relativeTimeModule.formatRelative(then, { now })).toBe(formatRelative(then, { now }));
    expect(relativeTimeModule.formatRelativeDuration(then, { now })).toBe(
      formatRelativeDuration(then, { now }),
    );
    const options: relativeTimeModule.FormatRelativeOptions = { now };
    expect(options.now).toBe(now);
  });
});

describe('StatCard delta.label → delta.unit', () => {
  test('a unit label is the unit', () => {
    expect(render(<StatCard label="Margin" value="1" delta={{ value: 1.5, label: ' pp' }} />)).toBe(
      render(<StatCard label="Margin" value="1" delta={{ value: 1.5, unit: ' pp' }} />),
    );
  });

  test("'%' is the locale percent", () => {
    expect(render(<StatCard label="Margin" value="1" delta={{ value: 1.5, label: '%' }} />)).toBe(
      render(<StatCard label="Margin" value="1" delta={{ value: 1.5 }} />),
    );
  });

  test('unit wins', () => {
    expect(
      render(
        <StatCard label="Margin" value="1" delta={{ value: 1.5, unit: ' bp', label: ' pp' }} />,
      ),
    ).toContain(' bp');
  });
});

test('PageHeaderBackLink → PageHeaderBackRow', () => {
  expect(render(<PageHeaderBackLink>Back</PageHeaderBackLink>)).toBe(
    render(<PageHeaderBackRow>Back</PageHeaderBackRow>),
  );
  expect(warned()).toEqual([
    'PageHeaderBackLink: `PageHeaderBackLink` is deprecated, use `PageHeaderBackRow`. It will be removed in 4.0.',
  ]);
});

describe('DataTable onChange → onValueChange', () => {
  test('onChange gets the next value', () => {
    const calls: SortingState[] = [];
    const config = withValueChange<SortingState, DataTableSorting>(
      { value: [], onChange: (next) => calls.push(next as SortingState) },
      'sorting',
    );
    config?.onValueChange?.([{ id: 'name', desc: true }]);
    expect(calls).toEqual([[{ id: 'name', desc: true }]]);
    expect(config && 'onChange' in config).toBe(false);
    expect(warned()).toEqual([
      'DataTable: `sorting.onChange` is deprecated, use `sorting.onValueChange`. It will be removed in 4.0.',
    ]);
  });

  test('onValueChange wins: onChange is not called', () => {
    const calls: string[] = [];
    const config = withValueChange<SortingState, DataTableSorting>(
      { value: [], onValueChange: () => calls.push('new'), onChange: () => calls.push('old') },
      'sorting',
    );
    config?.onValueChange?.([]);
    expect(calls).toEqual(['new']);
  });

  test('a config without onChange is passed through unchanged', () => {
    const config: DataTableSorting = { defaultValue: [] };
    expect(withValueChange<SortingState, DataTableSorting>(config, 'sorting')).toBe(config);
    expect(withValueChange<SortingState, DataTableSorting>(undefined, 'sorting')).toBeUndefined();
  });
});

describe('storage key migration', () => {
  const stub = (area: 'localStorage' | 'sessionStorage', store: Record<string, string>) => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, area);
    Object.defineProperty(globalThis, area, {
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
    return () => {
      if (previous) Object.defineProperty(globalThis, area, previous);
      else delete (globalThis as Record<string, unknown>)[area];
    };
  };

  test('moves the old value to the new key and deletes the old key', () => {
    const store: Record<string, string> = { old: 'v' };
    const restore = stub('localStorage', store);
    migrateStorageKey('localStorage', 'old', 'new');
    expect(store).toEqual({ new: 'v' });
    restore();
  });

  test('a value under the new key wins, and the old key stays untouched', () => {
    const store: Record<string, string> = { old: 'stale', new: 'fresh' };
    const restore = stub('localStorage', store);
    migrateStorageKey('localStorage', 'old', 'new');
    expect(store).toEqual({ old: 'stale', new: 'fresh' });
    restore();
  });

  test('no storage, or a throwing one, is ignored', () => {
    const restore = stub('sessionStorage', {});
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });
    expect(() => migrateStorageKey('sessionStorage', 'old', 'new')).not.toThrow();
    restore();
  });

  test('DataTable list total', () => {
    const store: Record<string, string> = { 'vendure-ui:list-total:orders': '42' };
    const restore = stub('localStorage', store);
    expect(readRowCount('orders')).toBe(42);
    expect(store).toEqual({ 'vendure-ui:data-table:list-total:orders': '42' });
    restore();
  });

  test('DataTable selection', () => {
    const store: Record<string, string> = { 'vendure-ui:data-table-selection:orders': '["p1"]' };
    const restore = stub('sessionStorage', store);
    expect(readStoredSelection('orders')).toEqual({ p1: true });
    expect(store).toEqual({ 'vendure-ui:data-table:selection:orders': '["p1"]' });
    restore();
  });

  test('CodeBlock package manager, and the event under both names', () => {
    const store: Record<string, string> = { 'vendure-ui-package-manager': 'pnpm' };
    const restore = stub('localStorage', store);
    const hadWindow = 'window' in globalThis;
    const events: string[] = [];
    if (!hadWindow) {
      (globalThis as Record<string, unknown>).window = {
        dispatchEvent: (event: Event) => events.push(event.type),
      };
    }
    try {
      expect(getStoredPackageManager()).toBe('pnpm');
      expect(store).toEqual({ 'vendure-ui:code-block:package-manager': 'pnpm' });
      if (!hadWindow) {
        setStoredPackageManager('bun');
        expect(events).toEqual([STORAGE_EVENT, OLD_STORAGE_EVENT]);
      }
    } finally {
      if (!hadWindow) delete (globalThis as Record<string, unknown>).window;
      restore();
    }
  });
});
