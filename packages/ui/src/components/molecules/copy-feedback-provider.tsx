'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';

// Function props can't cross a server→client boundary, so a copy surface
// rendered from RSC (e.g. MDX docs) could never receive an `onCopied` callback
// for toast wiring. This context is the RSC-safe alternative: mount
// CopyFeedbackProvider once in a client component (wire your toast there — the
// DS never toasts), and copy surfaces resolve their feedback in a fixed order —
// explicit prop → this context → nothing beyond the built-in copied icon.
interface CopyFeedbackContextValue {
  /** Called after a successful copy. Wire your toast here — the DS never toasts. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. */
  onCopyError?: (error: Error) => void;
}

const CopyFeedbackContext = createContext<CopyFeedbackContextValue>({});

function CopyFeedbackProvider({
  children,
  onCopied,
  onCopyError,
}: CopyFeedbackContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ onCopied, onCopyError }), [onCopied, onCopyError]);
  return <CopyFeedbackContext.Provider value={value}>{children}</CopyFeedbackContext.Provider>;
}

function useCopyFeedback(): CopyFeedbackContextValue {
  return useContext(CopyFeedbackContext);
}

export { CopyFeedbackProvider, useCopyFeedback, type CopyFeedbackContextValue };
