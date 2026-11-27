import { PACKAGE_MANAGERS, type PackageManager } from './transform-command.tsx';

const STORAGE_KEY = 'vendure-ui:code-block:package-manager';
const STORAGE_EVENT = 'vendure-ui:code-block:package-manager-change';

/**
 * Get the stored package manager preference from localStorage
 */
function getStoredPackageManager(): PackageManager {
  if (typeof window === 'undefined') return 'npm';
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
  } catch {
    // localStorage might not be available
  }
}

export { getStoredPackageManager, STORAGE_EVENT, STORAGE_KEY, setStoredPackageManager };
