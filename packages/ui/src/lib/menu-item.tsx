import { cn } from './utils.ts';

/**
 * The item of a dropdown menu, and of every menu built on it (Menubar,
 * BreadcrumbMenu). Under the pointer or the arrow keys an item takes the
 * muted fill, its text darkens and its icon strengthens. A disabled item
 * takes none of that: it dims its text, not itself, so the arrow keys still
 * show its focus ring at full strength.
 */
export const menuItem =
  "not-data-disabled:focus:bg-muted not-data-disabled:focus:text-accent-foreground relative flex min-h-8.5 cursor-default items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:text-foreground-secondary/50 data-disabled:[&_[data-slot$='-shortcut']]:opacity-50 data-inset:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.75 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-moderate not-data-disabled:focus:[&>svg:not([class*='opacity-'])]:opacity-85";

/**
 * The checked row of a radio group in a menu: semibold text in the
 * foreground colour, and a `MenuCheck`. The item needs `group/menu-radio`.
 */
export const menuRadioItem =
  'group/menu-radio data-checked:text-foreground data-checked:font-semibold data-checked:data-disabled:text-foreground/50';

/**
 * The check of a checked radio row draws in: a path with pathLength 1 and a
 * dash of 1, its offset easing from 1 to 0. The row that loses the check
 * fades it out in `quick`, and its dash resets only after that, while
 * hidden. A transition runs only on a change, so the menu opens with the
 * check in place. With reduced motion the check only fades.
 */
const drawCheck =
  'size-3.5 shrink-0 stroke-[1.75] opacity-0 [transition:opacity_var(--transition-duration-quick)_var(--ease-soft)] group-data-checked/menu-radio:opacity-90 group-data-checked/menu-radio:[transition-duration:var(--transition-duration-fast)] motion-reduce:group-data-checked/menu-radio:[transition-duration:var(--transition-duration-normal)]';
const drawCheckPath =
  '[stroke-dasharray:1_2] [stroke-dashoffset:1] [transition:stroke-dashoffset_0s_linear_var(--transition-duration-quick)] group-data-checked/menu-radio:[stroke-dashoffset:0] group-data-checked/menu-radio:[transition:stroke-dashoffset_var(--transition-duration-normal)_var(--ease-out)] motion-reduce:transition-none motion-reduce:group-data-checked/menu-radio:transition-none';

/** The check of a radio row, inside an item with `menuRadioItem`. */
export function MenuCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="menu-check"
      className={cn(drawCheck, className)}
    >
      <path d="M20 6 9 17l-5-5" pathLength={1} className={drawCheckPath} />
    </svg>
  );
}
