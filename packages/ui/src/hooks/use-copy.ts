'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCopyOptions {
  /** How long `copied` stays true after a successful copy, in ms. */
  timeout?: number;
}

interface UseCopyReturn {
  /** True for `timeout` ms after the last successful copy. */
  copied: boolean;
  /** Writes `text` to the clipboard. Resolves `true` on success, `false` on failure — never throws. */
  copy: (text: string) => Promise<boolean>;
}

/**
 * Clipboard-copy hook with transient "copied" feedback. Inlines the
 * `navigator.clipboard` call so the design system takes no third-party
 * clipboard dependency, and never couples to a toast — surface success/failure
 * through the returned `copied` flag (or the `CopyButton` callbacks).
 */
export function useCopy({ timeout = 2000 }: UseCopyOptions = {}): UseCopyReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), timeout);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [timeout],
  );

  return { copied, copy };
}
