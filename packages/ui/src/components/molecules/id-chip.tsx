'use client';

import { CopyButton } from '@vendure-io/ui/components/molecules/copyable-text';
import { cn } from '@vendure-io/ui/lib/utils';

type TruncateMode = 'middle' | 'start' | 'none';

/** Threshold below which truncation is a no-op — the value already fits. */
const TRUNCATE_THRESHOLD = 12;

function truncateId(value: string, mode: TruncateMode): string {
  if (mode === 'none' || value.length <= TRUNCATE_THRESHOLD) return value;
  // Middle keeps a recognizable head + tail (proven `AnonymizedToken` pattern);
  // start drops the (often constant) prefix and keeps the distinguishing tail.
  return mode === 'middle' ? `${value.slice(0, 8)}…${value.slice(-4)}` : `…${value.slice(-8)}`;
}

interface IdChipProps {
  /** The full value — always copied in full and revealed on hover via `title`. */
  value: string;
  /** Override the rendered text (e.g. a longer prefix). Bypasses `truncate`. */
  display?: string;
  /** How to shorten the rendered value. @default 'middle' */
  truncate?: TruncateMode;
  /** Render the copy affordance. @default true */
  copyable?: boolean;
  className?: string;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. */
  onCopied?: () => void;
}

/**
 * A bordered, monospace chip for IDs/tokens with a built-in copy affordance.
 * The rendered text is truncated for density while the full value is copied and
 * available on hover (`title`).
 */
function IdChip({
  value,
  display,
  truncate = 'middle',
  copyable = true,
  className,
  onCopied,
}: IdChipProps) {
  const text = display ?? truncateId(value, truncate);

  return (
    <span
      data-slot="id-chip"
      title={value}
      className={cn(
        'inline-flex w-fit items-center gap-1 rounded-md border bg-muted py-0.5 pl-1.5 font-mono text-xs',
        copyable ? 'pr-0.5' : 'pr-1.5',
        className,
      )}
    >
      <span className="truncate">{text}</span>
      {copyable ? <CopyButton value={value} onCopied={onCopied} className="size-4" /> : null}
    </span>
  );
}

export { IdChip };
export type { IdChipProps };
