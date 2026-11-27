import { migrateStorageKey } from '../../../lib/deprecated.ts';
import { PACKAGE_MANAGERS, type PackageManager } from './transform-command.tsx';

const STORAGE_KEY = 'vendure-ui:code-block:package-manager';
const STORAGE_EVENT = 'vendure-ui:code-block:package-manager-change';
// The 2.x key and event. The key moves on read; the event is sent under both
// names, so a 2.x listener still hears it. Remove in 4.0.
const OLD_STORAGE_KEY = 'vendure-ui-package-manager';
const OLD_STORAGE_EVENT = 'vendure-ui-package-manager-change';

/**
 * Get the stored package manager preference from localStorage
 */
function getStoredPackageManager(): PackageManager {
  if (typeof window === 'undefined') return 'npm';
  migrateStorageKey('localStorage', OLD_STORAGE_KEY, STORAGE_KEY);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PACKAGE_MANAGERS.includes(stored as PackageManager)) {
      return stored as PackageManager;
    }
  } catch {
    // localStorage might not be available
  }
  return 'npm';
}

/**
 * Store the package manager preference in localStorage
 */
function setStoredPackageManager(pm: PackageManager): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, pm);
    // Dispatch a custom event so other CodeBlock instances can update
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: pm }));
    window.dispatchEvent(new CustomEvent(OLD_STORAGE_EVENT, { detail: pm }));
  } catch {
    // localStorage might not be available
  }
}

export {
  getStoredPackageManager,
  OLD_STORAGE_EVENT,
  OLD_STORAGE_KEY,
  STORAGE_EVENT,
  STORAGE_KEY,
  setStoredPackageManager,
};
