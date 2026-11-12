import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import { statusToneText } from '@vendure-io/ui/lib/tint-recipes';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// The dot fill of each tone, as in StatusBadge: a dot is a filled shape, so
// warning takes `warning-indicator`; in `warning-text` the dot reads brown.
const toneDot: Record<Tone, string> = {
  ...statusToneText,
  warning: 'text-warning-indicator',
};

// The ring is a copy of the dot behind it that grows to 2.6× and fades
// (`animate-live-pulse`: 2.4s on the `out` curve, then a rest). Only transform
// and opacity change. Under reduced motion the ring is not drawn: the dot
// alone says "live". Forced colours keep the dot's tone fill: it is a shape,
// not a background.
const ringClass =
  'after:absolute after:inset-0 after:rounded-full after:bg-current after:content-[""] motion-safe:after:animate-live-pulse motion-reduce:after:hidden';

interface LiveIndicatorProps extends React.ComponentProps<'span'> {
  /** The dot colour. Defaults to `success`. @default 'success' */
  tone?: Tone;
  /**
   * Draw the ring that pulses out of the dot. Turn it off where something
   * else on the page already moves for the same state (a spinner, a progress
   * sweep): one moving mark per state is enough. @default true
   */
  pulse?: boolean;
  /**
   * The text for assistive technology when no visible label is next to the
   * dot (`children`). Leave both out when the text beside the indicator
   * already says the same: the indicator is then hidden from assistive
   * technology.
   */
  label?: string;
  /** A visible label after the dot, in 12px secondary text. */
  children?: React.ReactNode;
}

/**
 * A 7px dot with a soft ring that pulses outward: a live stream or work that
 * runs right now and stays on for minutes. StatusBadge keeps its spinner for
 * "in progress"; this dot means "live".
 */
function LiveIndicator({
  className,
  tone = 'success',
  pulse = true,
  label,
  children,
  ...props
}: LiveIndicatorProps) {
  const hasChildren = children !== undefined && children !== null && children !== false;
  const decorative = !hasChildren && !label;

  return (
    <span
      data-slot="live-indicator"
      data-tone={tone}
      aria-hidden={decorative || undefined}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.75 whitespace-nowrap text-xs font-medium text-foreground-secondary',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        data-slot="live-indicator-dot"
        className={cn(
          'relative size-1.75 shrink-0 rounded-full bg-current forced-color-adjust-none',
          toneDot[tone],
          pulse && ringClass,
        )}
      />
      {hasChildren ? children : label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export { LiveIndicator };
export type { LiveIndicatorProps };
