import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Internal: ArrowLink (forward) and PageHeaderBack (back) render this. The
// package exports map this file to null.
//
// The v3 look: 13px medium text, and a 15px chevron at 45%: trailing forward,
// leading back. A straight direction takes a chevron; an arrow is for a
// diagonal only, such as a link that leaves the app. On hover or keyboard
// focus the text reaches full foreground and the chevron full strength, and
// the chevron moves 2px the way the link goes. Colour eases in `quick`
// (120ms) on `soft`; the chevron fades in `moderate` on `soft` and moves in
// `normal` on the strong ease-out. With reduced motion only the colour and
// opacity change. In a right-to-left layout the chevron points and moves the
// other way.
//
// Both directions use the `group/arrow-link` group, the public hook for a card
// or row that opens the same page (see ArrowLink).

type Direction = 'forward' | 'back';

const nudge: Record<Direction, string> = {
  forward:
    'group-hover/arrow-link:translate-x-0.5 group-focus-visible/arrow-link:translate-x-0.5 rtl:group-hover/arrow-link:-translate-x-0.5 rtl:group-focus-visible/arrow-link:-translate-x-0.5',
  back: 'group-hover/arrow-link:-translate-x-0.5 group-focus-visible/arrow-link:-translate-x-0.5 rtl:group-hover/arrow-link:translate-x-0.5 rtl:group-focus-visible/arrow-link:translate-x-0.5',
};

type DirectionLinkProps = useRender.ComponentProps<'a'> & {
  direction: Direction;
  /** The link's `data-slot`. */
  slot: string;
  /** The icon's `data-slot`. */
  iconSlot: string;
};

function DirectionLink({
  direction,
  slot,
  iconSlot,
  className,
  render,
  children,
  ...props
}: DirectionLinkProps) {
  const Icon = direction === 'forward' ? ChevronRight : ChevronLeft;
  const icon = (
    <Icon
      aria-hidden="true"
      data-slot={iconSlot}
      className={cn(
        'size-3.75 shrink-0 opacity-45 rtl:-scale-x-100',
        '[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft),translate_var(--transition-duration-normal)_var(--ease-out)]',
        'group-hover/arrow-link:opacity-100 group-focus-visible/arrow-link:opacity-100',
        nudge[direction],
        'motion-reduce:translate-none!',
      )}
    />
  );
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'group/arrow-link inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground-secondary',
          'transition-colors duration-(--transition-duration-quick) ease-(--ease-soft)',
          'hover:text-foreground focus-visible:text-foreground group-hover/arrow-link:text-foreground',
          'rounded-md outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        ),
        children:
          direction === 'forward' ? (
            <>
              {children}
              {icon}
            </>
          ) : (
            <>
              {icon}
              {children}
            </>
          ),
      },
      props,
    ),
    state: { slot },
  });
}

export { DirectionLink };
