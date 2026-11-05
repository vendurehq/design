import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import { ArrowRight } from 'lucide-react';

// The v3 look: 13px medium text at 82% foreground and a trailing 15px arrow at
// 45%. On hover the text reaches full foreground and the arrow full strength,
// and the arrow moves 2px out along its direction. Colour eases in 120ms; the
// arrow moves on the strong ease-out. With reduced motion only the colour and
// opacity change. In a right-to-left layout the arrow points and moves left.
//
// The link is `group/arrow-link`. A parent that takes the same class (a card,
// a list row) drives the same hover from anywhere inside it.

/**
 * A text link to a page that holds more of what the user is looking at:
 * "View details", "All deployments", "Open logs". Renders an `<a>`; pass
 * `render` to use a router link or a `<button>`.
 */
function ArrowLink({ className, render, children, ...props }: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'group/arrow-link inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-foreground/82',
          'transition-colors duration-[120ms] ease-[ease]',
          'hover:text-foreground group-hover/arrow-link:text-foreground',
          'rounded-md outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring',
          className,
        ),
        children: (
          <>
            {children}
            <ArrowRight
              aria-hidden="true"
              data-slot="arrow-link-arrow"
              className={cn(
                'size-3.75 shrink-0 opacity-45 rtl:-scale-x-100',
                '[transition:opacity_150ms_ease,translate_200ms_var(--ease-out)]',
                'group-hover/arrow-link:opacity-100 group-hover/arrow-link:translate-x-0.5 rtl:group-hover/arrow-link:-translate-x-0.5',
                'motion-reduce:translate-none!',
              )}
            />
          </>
        ),
      },
      props,
    ),
    state: { slot: 'arrow-link' },
  });
}

export { ArrowLink };
