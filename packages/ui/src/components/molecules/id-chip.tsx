'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { CopyButton, useCopyAction } from '@vendure-io/ui/components/molecules/copyable-text';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChipCopyTooltip, chipChromeClass, chipCopyButtonProps } from './id-chip-chrome.tsx';

type TruncateMode = 'middle' | 'start' | 'none';

// Middle truncation renders 13 chars (8 + ellipsis + 4), so anything at or
// below that length would lose information without saving space — skip it.
const TRUNCATE_THRESHOLD = 13;

/**
 * `reveal="row"`: in a table row the chip reads as plain text, lined up with
 * the column (it shifts back by its `--content-inset`, its 8px start padding). While the row
 * (`group/row`) is hovered or holds keyboard focus, the fill and the copy icon
 * fade in together, on one transition (150ms, ease-out). Nothing moves, so
 * reduced motion keeps the fade. Without hover (touch), the chip always shows.
 */
const ROW_REVEAL_CLASS = cn(
  '-ms-(--content-inset) bg-transparent transition-[background-color,color,scale] duration-moderate ease-out',
  'group-hover/row:bg-muted group-has-[:focus-visible]/row:bg-muted [@media(hover:none)]:bg-muted',
  '[&_[data-chip-copy]]:opacity-0 [&_[data-chip-copy]]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-out)]',
  'group-hover/row:[&_[data-chip-copy]]:opacity-100 group-has-[:focus-visible]/row:[&_[data-chip-copy]]:opacity-100 [@media(hover:none)]:[&_[data-chip-copy]]:opacity-100',
);

function truncateId(value: string, mode: TruncateMode): string {
  if (mode === 'none' || value.length <= TRUNCATE_THRESHOLD) return value;
  // Middle keeps a recognizable head + tail (proven `AnonymizedToken` pattern);
  // start drops the (often constant) prefix and keeps the distinguishing tail.
  return mode === 'middle' ? `${value.slice(0, 8)}…${value.slice(-4)}` : `…${value.slice(-8)}`;
}

interface IdChipProps {
  /** The full value: always copied in full. A chip without copy shows it in a tooltip when it shortens it. */
  value: string;
  /** Override the rendered text (e.g. a longer prefix). Bypasses `truncate`. */
  display?: string;
  /** How to shorten the rendered value. @default 'middle' */
  truncate?: TruncateMode;
  /** Render the copy affordance. @default true */
  copyable?: boolean;
  /**
   * `'row'` shows the chip only while its table row is hovered or holds
   * keyboard focus; at rest the value reads as plain text, lined up with the
   * column. The row needs the `group/row` class (the `DataTable` rows have
   * it). Over a stretched row link, stack the chip above the link (for
   * example `z-10`). @default 'always'
   */
  reveal?: 'always' | 'row';
  className?: string;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. Falls back to `CopyFeedbackProvider`. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
  /**
   * The tooltip text before copying, e.g. "Copy commit". Keep it short and
   * leave the value out: the copy button's accessible name adds the shown
   * text itself ("Copy commit 9f2c4e1"), so each button in a list has its own
   * name. @default "Copy"
   */
  copyLabel?: string;
  /** The tooltip text and the copy button's accessible name while the copied state is active. @default "Copied" */
  copiedLabel?: string;
  /** How long the check-mark feedback stays visible, in ms. @default 2000 */
  timeout?: number;
}

/**
 * A monospace chip for IDs with a built-in copy action. The rendered text is
 * truncated for density while the full value is copied. When copyable, the
 * whole chip is the copy target: its tooltip says "Copy", then "Copied". The
 * copy button inside is the only tab stop.
 */
function IdChip({
  value,
  display,
  truncate = 'middle',
  copyable = true,
  reveal = 'always',
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
    <span
      data-slot="id-chip"
      data-reveal={reveal === 'row' ? 'row' : undefined}
      className={chipChromeClass(copyable, cn(reveal === 'row' && ROW_REVEAL_CLASS, className))}
    >
      {/* An id reads left to right in a right-to-left page too; the chip itself follows the page. */}
      <span dir="ltr" className="truncate">
        {text}
      </span>
      {copyable ? (
        <CopyButton
          value={value}
          copyAction={action}
          copyLabel={`${copyLabel} ${text}`}
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
      />
    );
  }

  // Nothing is hidden when the chip shows the whole value.
  if (!shortened) return chip;

  // Closes when the pointer leaves the chip, like the copy tooltip.
  return (
    <Tooltip disableHoverablePopup>
      <TooltipTrigger render={chip} />
      <TooltipContent className="font-mono">
        <span dir="ltr">{value}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export { IdChip };
export type { IdChipProps };
