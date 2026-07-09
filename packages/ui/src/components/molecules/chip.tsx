'use client';

import { Badge, type badgeVariants } from '@vendure-io/ui/components/atoms/badge';
import { cn } from '@vendure-io/ui/lib/utils';
import type { VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import type * as React from 'react';

interface ChipProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
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
      data-disabled={disabled || undefined}
      className={cn(
        'max-w-full gap-1',
        onRemove && 'pr-1',
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
          className="-mr-0.5 ml-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full text-current/70 hover:bg-black/10 hover:text-current disabled:pointer-events-none dark:hover:bg-white/10"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </Badge>
  );
}

export { Chip };
export type { ChipProps };
