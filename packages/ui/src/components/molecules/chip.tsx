'use client';

import { Badge, type badgeVariants } from '@vendure-io/ui/components/atoms/badge';
import { cn } from '@vendure-io/ui/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import type * as React from 'react';

interface ChipProps extends React.ComponentProps<'span'> {
  /** Badge variants a tag can take. `link` and `ghost` are not tag treatments. */
  variant?: Exclude<VariantProps<typeof badgeVariants>['variant'], 'link' | 'ghost'>;
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /**
   * Presence of this handler renders the remove (×) button; the caller closes
   * over its own id (`onRemove={() => remove(item.id)}`). Absent → static chip.
   */
  onRemove?: () => void;
  /**
   * Accessible label for the remove button (e.g. `Remove ${name}`). Required
   * whenever `onRemove` is set — the × has no text otherwise.
   */
  removeLabel?: string;
  /** Dims the chip and disables removal (e.g. a pending un-assign mutation). */
  disabled?: boolean;
}

/**
 * A compact, optionally removable tag built on the `Badge` atom. Generalizes the
 * hand-rolled entity chips (facet-value / channel / customer-group) — the label
 * is free `children`, and secondary text is a composition:
 *
 * ```tsx
 * <Chip onRemove={() => remove(fv.id)} removeLabel={`Remove ${fv.name}`}>
 *   {fv.name} <span className="text-muted-foreground">in {facet.name}</span>
 * </Chip>
 * ```
 */
function Chip({
  className,
  variant,
  icon,
  onRemove,
  removeLabel,
  disabled,
  children,
  ...props
}: ChipProps) {
  if (process.env.NODE_ENV !== 'production' && onRemove && !removeLabel) {
    console.warn(
      'Chip: `removeLabel` is required when `onRemove` is set — the remove button has no accessible name otherwise. Pass e.g. removeLabel="Remove <name>".',
    );
  }

  return (
    <Badge
      data-slot="chip"
      variant={variant}
      data-disabled={disabled ? '' : undefined}
      // Marks the dimmed label as an inactive component, which WCAG 1.4.3
      // exempts from the contrast minimum.
      aria-disabled={disabled || undefined}
      className={cn(
        // The StatusBadge shape: 24px high, the 6px corner (`rounded-lg`), the
        // label 10px from the edge (9px of padding and the 1px border).
        'h-6 max-w-full gap-1 rounded-lg px-2.25 [--content-inset:calc(var(--spacing)*2.5)]',
        // The remove button sits 4px from the top, bottom and end edges: the
        // 1px border and 3px of padding.
        onRemove && 'pe-0.75',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      {...props}
    >
      {icon}
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          data-slot="chip-remove"
          disabled={disabled}
          aria-label={removeLabel}
          onClick={onRemove}
          // Nested in the chip's 6px corner, 4px from each edge: the concentric
          // radius is 6px - 4px = 2px (`rounded-sm`).
          className="ms-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-current/70 hover:bg-current/10 hover:text-current disabled:pointer-events-none outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}

export { Chip };
export type { ChipProps };
