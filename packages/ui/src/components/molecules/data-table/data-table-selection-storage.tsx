import type { OnChangeFn, RowSelectionState, Updater } from '@tanstack/react-table';
import type {
  ControlledState,
  DataTableRowSelection,
} from '@vendure-io/ui/components/molecules/data-table/data-table-types';
import * as React from 'react';

// The row selection of a table, kept in session storage under a consumer's key.
// It survives a reload and a visit to another page in the same tab. It is not in
// the URL: a URL change is a navigation, and each checkbox click would run one.

const STORAGE_PREFIX = 'vendure-ui:data-table-selection:';

/** The ids stored under `key`. Blocked, missing or malformed storage gives none. */
export function readStoredSelection(key: string): RowSelectionState {
  try {
    const stored = globalThis.sessionStorage?.getItem(STORAGE_PREFIX + key);
    const ids: unknown = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(ids)) return {};
    return Object.fromEntries(ids.map((id) => [String(id), true]));
  } catch {
    return {};
  }
}

/**
 * Store the selected ids under `key`. All of them, whatever page they are on. An
 * empty selection removes the entry. Storage that is full or blocked is ignored:
 * the selection then lasts until the table unmounts.
 */
export function writeStoredSelection(key: string, selection: RowSelectionState) {
  try {
    const ids = selectedIds(selection);
    if (ids.length === 0) {
      globalThis.sessionStorage?.removeItem(STORAGE_PREFIX + key);
    } else {
      globalThis.sessionStorage?.setItem(STORAGE_PREFIX + key, JSON.stringify(ids));
    }
  } catch {
    // Storage can be full or blocked.
  }
}

const selectedIds = (selection: RowSelectionState) =>
  Object.keys(selection).filter((id) => selection[id]);

const sameSelection = (a: RowSelectionState, b: RowSelectionState) => {
  const left = selectedIds(a);
  return left.length === selectedIds(b).length && left.every((id) => b[id]);
};

const resolve = (updater: Updater<RowSelectionState>, old: RowSelectionState) =>
  typeof updater === 'function' ? updater(old) : updater;

/**
 * Wraps a table's `rowSelection` config so its selection is stored under
 * `storageKey`. Without a key, or without `rowSelection`, it returns the config
 * as it is.
 *
 * - On the first load, ids stored under the key become the selection. Nothing
 *   stored leaves the selection as the consumer set it.
 * - Every change the table makes is stored.
 * - A new key switches to the selection stored under it, or to none. Nothing
 *   from the old key carries over, and the switch itself stores nothing.
 *
 * The stored ids are applied in a layout effect, before the first paint, and
 * reported through the consumer's `onChange`. A controlled consumer takes them
 * there.
 */
export function useSelectionStorage<TData>(
  storageKey: string | undefined,
  rowSelection: DataTableRowSelection<TData> | undefined,
): DataTableRowSelection<TData> | undefined {
  const enabled = storageKey != null && rowSelection != null;
  const controlled = rowSelection?.value !== undefined;
  const [own, setOwn] = React.useState<RowSelectionState>(rowSelection?.defaultValue ?? {});
  const current = controlled ? (rowSelection?.value as RowSelectionState) : own;

  // The latest values, read by the callbacks below so their identity holds.
  const latest = React.useRef({ storageKey, current, onChange: rowSelection?.onChange });
  latest.current = { storageKey, current, onChange: rowSelection?.onChange };
  const loadedKey = React.useRef<string | undefined>(undefined);

  // biome-ignore lint/correctness/useExhaustiveDependencies: restores when the key changes, nothing else
  React.useLayoutEffect(() => {
    if (!enabled) {
      loadedKey.current = undefined;
      return;
    }
    const first = loadedKey.current === undefined;
    loadedKey.current = storageKey;
    const stored = readStoredSelection(storageKey);
    // On the first load an empty store leaves the consumer's own selection.
    if (first && selectedIds(stored).length === 0) return;
    if (sameSelection(stored, latest.current.current)) return;
    if (!controlled) setOwn(stored);
    latest.current.onChange?.(stored);
  }, [enabled, storageKey]);

  const onChange = React.useCallback<OnChangeFn<RowSelectionState>>((updater) => {
    const next = resolve(updater, latest.current.current);
    // Updates in one tick build on each other before the next render.
    latest.current.current = next;
    if (latest.current.storageKey != null) writeStoredSelection(latest.current.storageKey, next);
    setOwn(next);
    latest.current.onChange?.(updater);
  }, []);

  return React.useMemo(() => {
    if (!enabled || rowSelection == null) return rowSelection;
    const { defaultValue: _defaultValue, ...rest } = rowSelection;
    return { ...rest, value: current, onChange } as ControlledState<RowSelectionState> &
      DataTableRowSelection<TData>;
  }, [enabled, rowSelection, current, onChange]);
}
