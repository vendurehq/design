'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipLabelSwap,
  TooltipTrigger,
} from '@vendure-io/ui/components/atoms/tooltip';
import { CopyButton, useCopyAction } from '@vendure-io/ui/components/molecules/copyable-text';
import { contentInsetPull } from '@vendure-io/ui/lib/content-inset';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

type TruncateMode = 'middle' | 'start' | 'none';

/**
 * Shared chrome for the identifier-chip family (`IdChip`, `AnonymizedToken`,
 * `SecretValue`): a borderless `bg-muted`, monospace `text-xs` chip, 24px
 * tall, sized to its content. Its `--content-inset` (the 8px start padding)
 * lets a DataTable cell line the value up with the column header. Kept in
 * one place so the chips can't drift
 * apart: only their *contents* differ (a plain value, a blurred
 * reveal-on-hover secret, or a masked secret loaded on click).
 *
 * A chip that copies as a whole (see `chipCopyButtonProps`) gets the hover
 * fill and the press feedback here, keyed on that button, so a chip with
 * several controls (`SecretValue`) keeps a still surface.
 */
function chipChromeClass(copyable: boolean, className?: string): string {
  return cn(
    'relative inline-flex min-h-6 w-fit items-center gap-1.5 rounded-lg bg-muted py-0.5 pl-2 [--content-inset:calc(var(--spacing)*2)] font-mono text-xs text-foreground-secondary',
    'transition-[background-color,color,scale] duration-quick ease-soft',
    contentInsetPull,
    'has-data-chip-copy:cursor-pointer has-data-chip-copy:hover:bg-accent has-data-chip-copy:hover:text-foreground motion-safe:has-data-chip-copy:active:scale-[0.97]',
    // The chip is the copy target, so the focus ring goes around the chip, not the 13px button.
    'has-[[data-chip-copy]:focus-visible]:outline-2 has-[[data-chip-copy]:focus-visible]:outline-offset-2 has-[[data-chip-copy]:focus-visible]:outline-ring has-[[data-chip-copy]:focus-visible]:outline-solid',
    copyable ? 'pr-1.5' : 'pr-2',
    className,
  );
}

/**
 * The look of an icon button inside an identifier chip: exactly the 13px
 * icon, in the chip's text colour, with no fill on hover. The icon shows at
 * 55%, quieter than the value beside it; a spinner (`role=status`) and the
 * copied check keep full strength. The chip's 6px end padding is the visible
 * inset. `IdChip`, `AnonymizedToken` and `SecretValue` all build on it, so
 * their buttons cannot drift apart.
 */
const chipIconButtonClass = cn(
  "size-3.25 [&_svg:not([class*='size-'])]:size-3.25",
  'text-inherit hover:bg-transparent dark:hover:bg-transparent',
  '[&>svg:not([role=status])]:opacity-55',
  '[&_[data-slot=copy-state-icon]:not([data-copied])>svg:first-child]:opacity-55',
);

/**
 * Props for a `CopyButton` that turns its whole chip into the copy target. Its
 * `::after` stretches over the chip (the chip is `relative`), so a click
 * anywhere on the chip copies, while the button stays the only tab stop and
 * keeps its accessible name. The value text stays plain, readable text.
 *
 * It has the `chipIconButtonClass` look. Its focus ring moves to the chip
 * (see `chipChromeClass`), and it keeps the chip's text colour on hover: the
 * whole chip brightens instead.
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
    chipIconButtonClass,
    'after:absolute after:inset-0 focus-visible:outline-none hover:text-inherit',
    'active:scale-none motion-reduce:active:scale-none',
  ),
} as const;

/**
 * Tooltip text of a whole-chip copy target: "Copy" until the copy succeeds,
 * then "Copied", swapped in one motion by `TooltipLabelSwap`. Nothing else:
 * the chip shows the start and end of its value, and a click copies all of it.
 *
 * The tooltip closes as soon as the pointer leaves the chip. In a list it can
 * open below the chip and cover the chip in the next row; a tooltip that stays
 * open while the pointer moves onto it would block that chip. Nothing in it
 * needs the pointer.
 */
function ChipCopyTooltip({
  chip,
  copied,
  copyLabel,
  copiedLabel,
}: {
  chip: React.ReactElement;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
}) {
  return (
    <Tooltip disableHoverablePopup>
      {/* The click that copies must not close the tooltip, or "Copied" is never seen. */}
      <TooltipTrigger render={chip} closeOnClick={false} />
      <TooltipContent>
        <TooltipLabelSwap labels={[copyLabel, copiedLabel]} active={copied ? 1 : 0} />
      </TooltipContent>
    </Tooltip>
  );
}

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
      <span className="truncate">{text}</span>
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
      <TooltipContent className="font-mono">{value}</TooltipContent>
    </Tooltip>
  );
}

export { ChipCopyTooltip, chipChromeClass, chipCopyButtonProps, chipIconButtonClass, IdChip };
export type { IdChipProps };
