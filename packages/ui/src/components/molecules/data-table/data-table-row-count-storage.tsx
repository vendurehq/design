import * as React from 'react';

// The total row count (all pages) of a list at its last load, kept in local
// storage under a consumer's key. The next first load draws as many skeleton
// rows as the current page will have, so the body keeps its height when the
// rows arrive, also after a reload.

const STORAGE_PREFIX = 'vendure-ui:row-count:';

/** The count stored under `key`, or null. Blocked, missing or malformed storage gives null. */
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
 * The total row count stored under `key` when the table mounted (or the key
 * last changed), or null without a key or a stored count. Stores `total`
 * whenever it is known, so each finished load updates the stored total. The
 * returned total does not follow those writes: it is the one read at mount.
 *
 * The total is read in a layout effect, before the first paint. A server
 * render has no total, so it draws the default skeleton and hydrates cleanly.
 */
export function useRememberedRowCount(
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
 * remembered total ends on or before this page. Without pagination it is the
 * remembered total, else `fallback`. 0 means the page will be empty.
 */
export function skeletonRowCountFor(
  remembered: number | null,
  page: { page: number; pageSize: number } | undefined,
  fallback: number,
): number {
  if (page == null) return remembered ?? fallback;
  if (remembered == null) return page.pageSize;
  const before = (page.page - 1) * page.pageSize;
  return Math.min(page.pageSize, Math.max(0, remembered - before));
}
