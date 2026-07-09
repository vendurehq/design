'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vendure-io/ui/components/atoms/select';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import type * as React from 'react';

// The list-page pagination footer: range text on one side, optional page-size
// selector and prev/next controls on the other. TanStack-free and
// fetch-agnostic — driven by value props, not a table instance.
//
// Capability-props contract: a feature renders only if its prop is wired. The
// page-size selector appears only with `onPageSizeChange`; prev/next appear only
// with `onPageChange` or `getPageHref`. There are no feature flags and no
// disabled placeholder UI for capabilities the consumer didn't opt into.

/** max(1, …) so an empty result still reports a single page, never zero pages. */
function getPageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/** Clamp a possibly out-of-range page into `[1, pageCount]`. */
function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, 1), pageCount);
}

/**
 * The 1-based item range shown on the current page. Empty results collapse to
 * `{ 0, 0 }` so the caller can render "0 of 0" rather than a nonsensical "1–0".
 * The last partial page clamps its end to `totalItems` (e.g. "126–132 of 132").
 */
function getRange(
  page: number,
  pageSize: number,
  totalItems: number,
): { start: number; end: number } {
  if (totalItems <= 0) return { start: 0, end: 0 };
  const clamped = clampPage(page, getPageCount(totalItems, pageSize));
  const start = (clamped - 1) * pageSize + 1;
  const end = Math.min(clamped * pageSize, totalItems);
  return { start, end };
}

/** Default range string: "0 of 0" when empty, else "start–end of total" (en dash). */
function defaultFormatRange({
  start,
  end,
  total,
}: {
  start: number;
  end: number;
  total: number;
}): string {
  return total <= 0 ? '0 of 0' : `${start}–${end} of ${total}`;
}

interface TablePaginationProps extends React.ComponentProps<'div'> {
  /**
   * 1-based current page. The footer clamps this into range for what it
   * *displays* only — it does not own page state. If `page` can end up past the
   * last page (e.g. after the page size grows), reset it in your own handler;
   * see `onPageSizeChange`.
   */
  page: number;
  /** Items per page — also scales the range math. */
  pageSize: number;
  /** Total items across all pages, used for the range text and last-page detection. */
  totalItems: number;
  /**
   * Wires button-mode prev/next: renders `<button>`s that call this with the
   * target page. Ignored for navigation rendering when `getPageHref` is set.
   */
  onPageChange?: (page: number) => void;
  /**
   * Its presence is the only thing that renders the page-size selector. Called
   * with the chosen size. You own page state: growing the size can leave `page`
   * pointing past the new last page, so reset it here (typically `setPage(1)`).
   * The footer clamps only its own display, never your state.
   */
  onPageSizeChange?: (size: number) => void;
  /** Options offered by the page-size selector. */
  pageSizeOptions?: number[];
  /**
   * Anchor mode: prev/next render as real `<a href>` elements for full-page
   * navigation (RSC-friendly). When set, it wins over `onPageChange`. A disabled
   * edge renders a non-link with `aria-disabled` rather than an `<a>`.
   */
  getPageHref?: (page: number) => string;
  /**
   * Override the range text. Receives the clamped 1-based range and total, and
   * defaults to "start–end of total" ("0 of 0" when empty). A function, not a
   * word-swap prop, so it survives non-English word order.
   */
  formatRange?: (range: { start: number; end: number; total: number }) => string;
  /** Accessible name for the prev/next navigation landmark. */
  navLabel?: string;
  /** Accessible name for the previous-page control. */
  previousLabel?: string;
  /** Accessible name for the next-page control. */
  nextLabel?: string;
  /** Visible + accessible name for the page-size selector. */
  pageSizeLabel?: string;
}

function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  getPageHref,
  formatRange = defaultFormatRange,
  navLabel = 'Pagination',
  previousLabel = 'Go to previous page',
  nextLabel = 'Go to next page',
  pageSizeLabel = 'Items per page',
  className,
  ...props
}: TablePaginationProps) {
  const pageCount = getPageCount(totalItems, pageSize);
  const current = clampPage(page, pageCount);
  const { start, end } = getRange(page, pageSize, totalItems);

  const rangeText = formatRange({ start, end, total: totalItems });

  const anchorMode = Boolean(getPageHref);
  const showNav = anchorMode || Boolean(onPageChange);
  const isFirst = current <= 1;
  const isLast = current >= pageCount;

  return (
    <div
      data-slot="table-pagination"
      className={cn('flex items-center justify-between gap-4', className)}
      {...props}
    >
      <span className="text-muted-foreground text-sm tabular-nums">{rangeText}</span>

      {(onPageSizeChange || showNav) && (
        <div className="flex items-center gap-4">
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{pageSizeLabel}</span>
              <Select value={pageSize} onValueChange={(value) => onPageSizeChange(Number(value))}>
                <SelectTrigger size="sm" aria-label={pageSizeLabel} className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {showNav && (
            // Only the prev/next group is a navigation landmark — not the range
            // text or size selector. Mirrors the shadcn pagination atom's
            // role="navigation" + aria-label.
            <nav aria-label={navLabel} className="flex items-center gap-1">
              <NavButton
                slot="table-pagination-previous"
                anchor={anchorMode}
                disabled={isFirst}
                label={previousLabel}
                href={anchorMode && !isFirst ? getPageHref?.(current - 1) : undefined}
                onClick={onPageChange ? () => onPageChange(current - 1) : undefined}
              >
                <ChevronLeftIcon />
              </NavButton>
              <NavButton
                slot="table-pagination-next"
                anchor={anchorMode}
                disabled={isLast}
                label={nextLabel}
                href={anchorMode && !isLast ? getPageHref?.(current + 1) : undefined}
                onClick={onPageChange ? () => onPageChange(current + 1) : undefined}
              >
                <ChevronRightIcon />
              </NavButton>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

function NavButton({
  slot,
  anchor,
  href,
  onClick,
  disabled,
  label,
  children,
}: {
  slot: string;
  anchor: boolean;
  href?: string;
  onClick?: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const shared = {
    variant: 'outline' as const,
    size: 'icon-sm' as const,
    'data-slot': slot,
  };

  if (anchor) {
    // A disabled edge is a non-link (span) so it isn't focusable or followable.
    // The icon lives inside the render element (rather than as a Button child) so
    // the anchor's content is statically visible to the a11y linter. No aria-label
    // on the span — naming a role-less, non-interactive element is prohibited.
    if (disabled) {
      return (
        <Button
          {...shared}
          aria-disabled
          nativeButton={false}
          className="pointer-events-none opacity-50"
          render={<span>{children}</span>}
        />
      );
    }
    return (
      <Button
        {...shared}
        aria-label={label}
        nativeButton={false}
        render={
          <a href={href} aria-label={label}>
            {children}
          </a>
        }
      />
    );
  }

  return (
    <Button {...shared} aria-label={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

export { TablePagination, type TablePaginationProps };
