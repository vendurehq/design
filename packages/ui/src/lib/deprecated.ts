// Deprecated 2.x and early 3.0 names that still work in 3.x. Remove this
// module and every caller in 4.0.
import { isDevelopment } from './env.ts';

const warned = new Set<string>();

/**
 * Warns once per component and old name, in development only:
 * "<Component>: `<old>` is deprecated, use `<new>`. It will be removed in 4.0."
 */
export function warnDeprecated(component: string, oldName: string, newName: string): void {
  if (!isDevelopment) return;
  const key = `${component}\u0000${oldName}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(
    `${component}: \`${oldName}\` is deprecated, use \`${newName}\`. It will be removed in 4.0.`,
  );
}

/** Test hook: forget which warnings were shown. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}

/**
 * Moves a value stored under a pre-3.0 key to its new key. When the new key is
 * absent and the old key holds a value, the value is copied to the new key and
 * the old key is deleted. Call it before reading the new key. Storage errors
 * (private mode, a full quota, no window) are ignored.
 */
export function migrateStorageKey(
  area: 'localStorage' | 'sessionStorage',
  oldKey: string,
  newKey: string,
): void {
  try {
    // Reading the storage itself can throw (a sandboxed frame, blocked cookies).
    const storage: Storage | undefined = globalThis[area];
    if (!storage) return;
    if (storage.getItem(newKey) !== null) return;
    const value = storage.getItem(oldKey);
    if (value === null) return;
    storage.setItem(newKey, value);
    storage.removeItem(oldKey);
  } catch {
    // Storage is unavailable; the reader falls back to its default.
  }
}

/** The 2.x physical sides of Sidebar and SheetContent. */
export type PhysicalSide = 'left' | 'right';

/**
 * Turns a physical 2.x side into the logical side that puts the panel on the
 * same edge, and warns. `left` is the start edge left to right and the end
 * edge right to left. The direction comes from the nearest DirectionProvider
 * or `dir` prop, then from `<html dir>`. Other sides pass through.
 */
export function logicalSide<S extends string>(
  component: string,
  side: S | PhysicalSide,
  dir: string | undefined,
): S | 'start' | 'end' {
  if (side !== 'left' && side !== 'right') return side;
  const logical = side === 'left' ? 'start' : 'end';
  warnDeprecated(component, `side="${side}"`, `side="${logical}"`);
  const documentDir = typeof document === 'undefined' ? undefined : document.documentElement.dir;
  const rtl = (dir === 'ltr' || dir === 'rtl' ? dir : documentDir) === 'rtl';
  return (side === 'left') !== rtl ? 'start' : 'end';
}
