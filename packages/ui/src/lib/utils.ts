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
      shadow: ['control', 'overlay'],
      ease: ['default', 'spring', 'drawer', 'height', 'press', 'soft'],
      animate: ['shimmer', 'spin-slow', 'progress-sweep'],
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
            'palette-detail-delay',
            'palette-result-delay',
            'palette-detail-exit',
            'palette-exit',
            'palette-tint',
            'palette-result-exit',
            'palette-enter',
            'palette-move',
            'palette-detail-move',
            'palette-result-blur',
            'tooltip-enter',
            'tooltip-label-fade',
            'tooltip-label-move',
            'tooltip-resize',
            'progress-fill',
            'row-enter',
            'popup-fade',
            'popup-resize',
            'sidebar-pill',
            'toast-exit-fade',
            'toast-exit-move',
            'toast-fade',
            'toast-move',
          ],
        },
      ],
      // A text style sets family, size, weight, tracking and leading at once.
      'text-style': [
        {
          'text-style': ['page-title', 'section-title', 'card-title', 'body', 'caption', 'code'],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
