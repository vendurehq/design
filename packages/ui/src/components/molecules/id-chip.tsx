'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { CopyButton, useCopyAction } from '@vendure-io/ui/components/molecules/copyable-text';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

type TruncateMode = 'middle' | 'start' | 'none';

/**
 * Shared chrome for the identifier-chip family (`IdChip`, `AnonymizedToken`,
 * `SecretValue`): a borderless `bg-muted`, monospace `text-xs` chip, 24px
 * tall, sized to its content. Kept in one place so the chips can't drift
 * apart: only their *contents* differ (a plain value, a blurred
 * reveal-on-hover secret, or a masked secret loaded on click).
 *
 * A chip that copies as a whole (see `chipCopyButtonProps`) gets the hover
 * fill and the press feedback here, keyed on that button, so a chip with
 * several controls (`SecretValue`) keeps a still surface.
 */
function chipChromeClass(copyable: boolean, className?: string): string {
  return cn(
    'relative inline-flex min-h-6 w-fit items-center gap-1.5 rounded-lg bg-muted py-0.5 pl-2 font-mono text-xs text-foreground-secondary',
    'transition-[background-color,color,scale] duration-fast ease-out',
    'has-data-chip-copy:cursor-pointer has-data-chip-copy:hover:bg-accent has-data-chip-copy:hover:text-foreground motion-safe:has-data-chip-copy:active:scale-[0.97]',
    // The chip is the copy target, so the focus ring goes around the chip, not the 13px button.
    'has-[[data-chip-copy]:focus-visible]:outline-2 has-[[data-chip-copy]:focus-visible]:outline-offset-2 has-[[data-chip-copy]:focus-visible]:outline-ring has-[[data-chip-copy]:focus-visible]:outline-solid',
    copyable ? 'pr-1.5' : 'pr-2',
    className,
  );
}

/**
 * Props for a `CopyButton` that turns its whole chip into the copy target. Its
 * `::after` stretches over the chip (the chip is `relative`), so a click
 * anywhere on the chip copies, while the button stays the only tab stop and
 * keeps its accessible name. The value text stays plain, readable text.
 *
 * The button is exactly the 13px icon, so the chip's 6px end padding is the
 * visible inset, and its focus ring moves to the chip (see `chipChromeClass`). The copy icon takes the chip's text colour at 55%, quieter
 * than the value beside it; the check keeps its full `success-text`.
 *
 * The button never scales on press (the chip does). Any `scale` other than
 * `none` makes the button the containing block of its `::after`, which then
 * shrinks to the 13px icon between mousedown and mouseup. A mouseup over the
 * value text then lands outside the button, and the click goes to the chip
 * instead of the button, so nothing is copied.
 */
const chipCopyButtonProps = {
  'data-chip-copy': '',
  className: cn(
    "size-3.25 [&_svg:not([class*='size-'])]:size-3.25 after:absolute after:inset-0 focus-visible:outline-none",
    'active:scale-none motion-reduce:active:scale-none',
    'text-inherit hover:text-inherit hover:bg-transparent dark:hover:bg-transparent',
    '[&_[data-slot=copy-state-icon]:not([data-copied])>svg:first-child]:opacity-55',
  ),
} as const;

/**
 * Tooltip text of a whole-chip copy target: "Copy" until the copy succeeds,
 * then "Copied". `detail` (the full value of a shortened chip) sits above it.
 */
function ChipCopyTooltip({
  chip,
  copied,
  copyLabel,
  copiedLabel,
  detail,
}: {
  chip: React.ReactElement;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
  detail?: React.ReactNode;
}) {
  return (
    <Tooltip>
      {/* The click that copies must not close the tooltip, or "Copied" is never seen. */}
      <TooltipTrigger render={chip} closeOnClick={false} />
      <TooltipContent>
        {detail ? <span className="block font-mono">{detail}</span> : null}
        <span
          key={copied ? 'copied' : 'copy'}
          className="block animate-in fade-in-0 duration-moderate ease-out motion-safe:slide-in-from-bottom-1"
        >
          {copied ? copiedLabel : copyLabel}
        </span>
      </TooltipContent>
    </Tooltip>
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
 * A monospace chip for IDs with a built-in copy action. The rendered text is
 * truncated for density while the full value is copied. When copyable, the
 * whole chip is the copy target: its tooltip says "Copy", then "Copied", and
 * shows the full value above when the chip shortens it. The copy button inside
 * is the only tab stop.
 */
function IdChip({
  value,
  display,
  truncate = 'middle',
  copyable = true,
  className,
  onCopied,
  onCopyError,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  timeout,
}: IdChipProps) {
  const action = useCopyAction({ timeout, onCopied, onCopyError });
  const text = display ?? truncateId(value, truncate);
  const shortened = text !== value;
  const chip = (
    <span data-slot="id-chip" className={chipChromeClass(copyable, className)}>
      <span className="truncate">{text}</span>
      {copyable ? (
        <CopyButton
          value={value}
          copyAction={action}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          {...chipCopyButtonProps}
        />
      ) : null}
    </span>
  );

  if (copyable) {
    // Focus on the copy button bubbles to the chip, so keyboard users get the
    // tooltip too.
    return (
      <ChipCopyTooltip
        chip={chip}
        copied={action.copied}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        detail={shortened ? value : undefined}
      />
    );
  }

  // Nothing is hidden when the chip shows the whole value.
  if (!shortened) return chip;

  return (
    <Tooltip>
      <TooltipTrigger render={chip} />
      <TooltipContent className="font-mono">{value}</TooltipContent>
    </Tooltip>
  );
}

export { ChipCopyTooltip, chipChromeClass, chipCopyButtonProps, IdChip };
export type { IdChipProps };
