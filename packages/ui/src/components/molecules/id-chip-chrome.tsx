'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipLabelSwap,
  TooltipTrigger,
} from '@vendure-io/ui/components/atoms/tooltip';
import type * as React from 'react';
import { contentInsetPull } from '../../lib/content-inset.ts';
import { cn } from '../../lib/utils.ts';

// Internal: closed in `package.json` exports. Only the identifier-chip family
// imports it, by a relative path.

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
    'relative inline-flex min-h-6 w-fit items-center gap-1.5 rounded-lg bg-muted py-0.5 ps-2 [--content-inset:calc(var(--spacing)*2)] font-mono text-xs text-foreground-secondary',
    'transition-[background-color,color,scale] duration-quick ease-soft',
    contentInsetPull,
    'has-data-chip-copy:cursor-pointer has-data-chip-copy:hover:bg-accent has-data-chip-copy:hover:text-foreground motion-safe:has-data-chip-copy:active:scale-[0.97]',
    // The chip is the copy target, so the focus ring goes around the chip, not the 13px button.
    'has-[[data-chip-copy]:focus-visible]:outline-2 has-[[data-chip-copy]:focus-visible]:outline-offset-2 has-[[data-chip-copy]:focus-visible]:outline-ring has-[[data-chip-copy]:focus-visible]:outline-solid',
    copyable ? 'pe-1.5' : 'pe-2',
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

export { ChipCopyTooltip, chipChromeClass, chipCopyButtonProps, chipIconButtonClass };
