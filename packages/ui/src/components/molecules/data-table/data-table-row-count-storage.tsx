import * as React from 'react';

// The number of rows a table showed at its last load, kept in local storage
// under a consumer's key. The next first load draws that many skeleton rows,
// so the body keeps its height when the rows arrive, also after a reload.

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
 * The row count stored under `key` when the table mounted (or the key last
 * changed), or null without a key or a stored count. Stores `count` whenever
 * `loaded` is true, so each finished load updates the stored count. The
 * returned count does not follow those writes: it is the one read at mount.
 *
 * The count is read in a layout effect, before the first paint. A server
 * render has no count, so it draws the default skeleton and hydrates cleanly.
 */
export function useRememberedRowCount(
  key: string | undefined,
  count: number,
  loaded: boolean,
): number | null {
  const [remembered, setRemembered] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    setRemembered(key == null ? null : readRowCount(key));
  }, [key]);

  React.useEffect(() => {
    if (key != null && loaded) writeRowCount(key, count);
  }, [key, count, loaded]);

  return remembered;
}
