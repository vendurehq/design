import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge knows only Tailwind's default theme. Without these names it
// reads `shadow-control` as a shadow colour, so `shadow-primary/20` drops it,
// reads `text-style-body` as a text colour, so `text-primary` drops it, and
// keeps two named eases, durations or animations side by side, so the CSS
// order picks the winner instead of the class order.
// The names are the @vendure-io/design-tokens theme keys the defaults miss.
// `utils.test.ts` reads the theme CSS and fails on a key that is missing here.
const twMerge = extendTailwindMerge<'text-style'>({
  extend: {
    theme: {
      shadow: ['control', 'overlay', 'scrolled'],
      ease: ['default', 'spring', 'drawer', 'drawer-content', 'height', 'press', 'soft', 'flash', 'fold'],
      animate: [
        'shimmer',
        'spin-slow',
        'progress-sweep',
        'live-pulse',
        'page-enter',
        'page-fade',
        'page-reload',
        'page-reload-fade',
        'page-switch-line',
        'match-flash',
      ],
    },
    classGroups: {
      duration: [
        {
          duration: [
            'instant',
            'fast',
            'quick',
            'moderate',
            'normal',
            'slow',
            'slower',
            'palette-exit',
            'palette-enter',
            'palette-move',
            'tooltip-enter',
            'tooltip-delay',
            'tooltip-label-fade',
            'tooltip-label-move',
            'tooltip-resize',
            'progress-fill',
            'row-enter',
            'row-swap-out',
            'row-swap-delay',
            'popup-fade',
            'popup-resize',
            'sidebar-pill',
            'toast-exit-fade',
            'toast-exit-move',
            'toast-fade',
            'toast-move',
            'check-mark-delay',
            'dialog-scrim',
            'dialog-enter',
            'dialog-exit',
            'drawer-slide',
            'drawer-swipe',
            'alert-enter',
            'fold-open',
            'fold-close',
            'fold-row-in',
            'fold-row-out',
            'fold-badge-in',
            'fold-hand-off',
            'fold-stagger',
            'fold-step',
            'button-icon-turn',
            'external-arrow',
            'page-fade',
            'page-rise',
            'page-switch',
            'page-reload-fade',
            'page-reload-settle',
            'live-pulse',
            'match-flash',
          ],
        },
      ],
      // A text style sets family, size, weight, tracking and leading at once.
      'text-style': [
        {
          'text-style': [
            'page-title',
            'section-title',
            'dialog-title',
            'card-title',
            'body',
            'caption',
            'code',
            'display-xl',
            'display-lg',
            'display-md',
            'display-sm',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
