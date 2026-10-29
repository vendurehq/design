'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { CopyButton } from '@vendure-io/ui/components/molecules/copyable-text';
import { cn } from '@vendure-io/ui/lib/utils';

type TruncateMode = 'middle' | 'start' | 'none';

/**
 * Shared chrome for the identifier-chip family (`IdChip`, `AnonymizedToken`,
 * `SecretValue`): a bordered, `bg-muted`, monospace `text-xs` pill sized to its
 * content. Kept in one place so the chips can't drift apart — only their
 * *contents* differ (a plain value, a blurred reveal-on-hover secret, or a
 * masked secret loaded on click).
 */
function chipChromeClass(copyable: boolean, className?: string): string {
  return cn(
    'inline-flex w-fit items-center gap-1 rounded-md border bg-muted py-0.5 pl-1.5 font-mono text-xs',
    copyable ? 'pr-0.5' : 'pr-1.5',
    className,
  );
}

// Middle truncation renders 13 chars (8 + ellipsis + 4), so anything at or
// below that length would lose information without saving space — skip it.
const TRUNCATE_THRESHOLD = 13;

function truncateId(value: string, mode: TruncateMode): string {
  if (mode === 'none' || value.length <= TRUNCATE_THRESHOLD) return value;
  // Middle keeps a recognizable head + tail (proven `AnonymizedToken` pattern);
  // start drops the (often constant) prefix and keeps the distinguishing tail.
  return mode === 'middle' ? `${value.slice(0, 8)}…${value.slice(-4)}` : `…${value.slice(-8)}`;
}

interface IdChipProps {
  /** The full value: always copied in full, and shown in a tooltip when the chip shortens it. */
  value: string;
  /** Override the rendered text (e.g. a longer prefix). Bypasses `truncate`. */
  display?: string;
  /** How to shorten the rendered value. @default 'middle' */
  truncate?: TruncateMode;
  /** Render the copy affordance. @default true */
  copyable?: boolean;
  className?: string;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. Falls back to `CopyFeedbackProvider`. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
  /** Accessible label of the copy button before copying, e.g. "Copy commit SHA". @default "Copy" */
  copyLabel?: string;
  /** Accessible label of the copy button while the copied state is active. @default "Copied" */
  copiedLabel?: string;
  /** How long the check-mark feedback stays visible, in ms. @default 2000 */
  timeout?: number;
}

/**
 * A bordered, monospace chip for IDs/tokens with a built-in copy affordance.
 * The rendered text is truncated for density while the full value is copied and
 * shown in a DS Tooltip on hover, or when the copy button has focus. The chip
 * adds no tab stop of its own; the copy button is its only interactive part.
 */
function IdChip({
  value,
  display,
  truncate = 'middle',
  copyable = true,
  className,
  onCopied,
  onCopyError,
  copyLabel,
  copiedLabel,
  timeout,
}: IdChipProps) {
  const text = display ?? truncateId(value, truncate);
  const chip = (
    <span data-slot="id-chip" className={chipChromeClass(copyable, className)}>
      <span className="truncate">{text}</span>
      {/* 16px visual button to match the chip's density, but the ::after inset
          extends the hit target to 24px for the WCAG 2.2 AA minimum. */}
      {copyable ? (
        <CopyButton
          value={value}
          timeout={timeout}
          onCopied={onCopied}
          onCopyError={onCopyError}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          className="relative size-4 after:absolute after:-inset-1"
        />
      ) : null}
    </span>
  );

  // Nothing is hidden when the chip shows the whole value.
  if (text === value) return chip;

  // The chip itself is the trigger, so hover anywhere on it opens the tooltip;
  // focus on the copy button bubbles to it for keyboard users.
  return (
    <Tooltip>
      <TooltipTrigger render={chip} />
      <TooltipContent className="font-mono">{value}</TooltipContent>
    </Tooltip>
  );
}

export { chipChromeClass, IdChip };
export type { IdChipProps };
