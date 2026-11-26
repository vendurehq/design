import * as React from 'react';

// The total row count (all pages) of a list at its last load, kept in local
// storage under a consumer's key. Passed back as DataTable `expectedTotal`, it
// lets the next first load draw as many skeleton rows as the current page will
// have, so the body keeps its height when the rows arrive, also after a reload.

const STORAGE_PREFIX = 'vendure-ui:list-total:';

/** The total stored under `key`, or null. Blocked, missing or malformed storage gives null. */
export function readRowCount(key: string): number | null {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_PREFIX + key);
    const count = stored ? Number(stored) : Number.NaN;
    return Number.isInteger(count) && count >= 0 ? count : null;
  } catch {
    return null;
  }
}

/** Store `count` under `key`. Storage that is full or blocked is ignored. */
export function writeRowCount(key: string, count: number) {
  try {
    globalThis.localStorage?.setItem(STORAGE_PREFIX + key, String(count));
  } catch {
    // Storage can be full or blocked.
  }
}

/**
 * Remembers a list's total row count in local storage, for DataTable
 * `expectedTotal`:
 *
 * ```tsx
 * const expectedTotal = useRememberedListTotal('orders', data?.totalItems ?? null);
 * <DataTable rows={data?.items} expectedTotal={expectedTotal} … />
 * ```
 *
 * - Returns the total stored under `key` when the component mounted (or the
 *   key last changed), or null. It does not follow later writes: a first load
 *   needs the total of the visit before.
 * - Stores `total` whenever it is not null. Pass null while it is not known.
 * - Reads in a layout effect, before the first paint. A server render gets
 *   null, so it draws the default skeleton and hydrates cleanly.
 * - Blocked or full storage is ignored. Without a key nothing is read or
 *   stored.
 *
 * The key names the list and anything that changes its total, such as a
 * channel, the filters or the search. Pass no key for a filtered load to keep
 * the unfiltered total.
 */
export function useRememberedListTotal(
  key: string | undefined,
  total: number | null,
): number | null {
  const [remembered, setRemembered] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    setRemembered(key == null ? null : readRowCount(key));
  }, [key]);

  React.useEffect(() => {
    if (key != null && total != null) writeRowCount(key, total);
  }, [key, total]);

  return remembered;
}

/**
 * The number of skeleton rows before the first load: the rows the current
 * page will have. With pagination that is the page size, or fewer when the
 * expected total ends on or before this page. Without pagination it is the
 * expected total, else `fallback`. 0 means the page will be empty.
 */
export function skeletonRowCountFor(
  expected: number | null,
  page: { page: number; pageSize: number } | undefined,
  fallback: number,
): number {
  if (page == null) return expected ?? fallback;
  if (expected == null) return page.pageSize;
  const before = (page.page - 1) * page.pageSize;
  return Math.min(page.pageSize, Math.max(0, expected - before));
}
