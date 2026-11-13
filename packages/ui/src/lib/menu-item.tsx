import { cn } from './utils.ts';

/**
 * A disabled item of any menu, Select or Combobox dims all its content to
 * half strength, not itself: an opacity on the item would dim its focus
 * ring too, and the arrow keys still stop on it with the ring at full
 * strength. The item's own text paints at half its colour
 * (`-webkit-text-fill-color`, so its children do not take it). Every child
 * shows at half through `filter: opacity()`, which stacks on the child's own
 * opacity: a status dot, a detail, a shortcut, an icon and a check each dim
 * by the same half from their rest look, whatever colour they bring.
 */
export const menuItemDisabled =
  'data-disabled:pointer-events-none data-disabled:[-webkit-text-fill-color:color-mix(in_oklab,currentColor_50%,transparent)] data-disabled:*:[-webkit-text-fill-color:currentColor] data-disabled:*:[filter:opacity(50%)]';

/**
 * The item of a dropdown menu, and of every menu built on it (Menubar,
 * BreadcrumbMenu). Under the pointer or the arrow keys an item takes the
 * muted fill, its text darkens and its icon strengthens. A disabled item
 * takes none of that and dims its content (`menuItemDisabled`).
 */
export const menuItem = cn(
  menuItemDisabled,
  "not-data-disabled:focus:bg-muted not-data-disabled:focus:text-accent-foreground relative flex min-h-8.5 cursor-default items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-inset:ps-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.75 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-moderate not-data-disabled:focus:[&>svg:not([class*='opacity-'])]:opacity-85",
);

/**
 * An item that shows a `MenuCheck`: a checkbox item of a menu, and a Select
 * or Combobox option. The check shows when the item is checked
 * (`data-checked`) or selected (`data-selected`).
 */
export const menuCheckItem = 'group/menu-check';

/**
 * The checked row of a radio group in a menu: semibold text in the
 * foreground colour, and a `MenuCheck`.
 */
export const menuRadioItem = `${menuCheckItem} data-checked:text-foreground data-checked:font-semibold`;

/**
 * The check of a checked row draws in: a path with pathLength 1 and a
 * dash of 1, its offset easing from 1 to 0. The row that loses the check
 * fades it out in `quick`, and its dash resets only after that, while
 * hidden. A transition runs only on a change, so the menu opens with the
 * check in place. With reduced motion the check only fades.
 */
const drawCheck =
  'size-3.5 shrink-0 stroke-[1.75] opacity-0 [transition:opacity_var(--transition-duration-quick)_var(--ease-soft)] group-data-checked/menu-check:opacity-90 group-data-[selected]/menu-check:opacity-90 group-data-checked/menu-check:[transition-duration:var(--transition-duration-fast)] group-data-[selected]/menu-check:[transition-duration:var(--transition-duration-fast)] motion-reduce:group-data-checked/menu-check:[transition-duration:var(--transition-duration-normal)] motion-reduce:group-data-[selected]/menu-check:[transition-duration:var(--transition-duration-normal)]';
const drawCheckPath =
  '[stroke-dasharray:1_2] [stroke-dashoffset:1] [transition:stroke-dashoffset_0s_linear_var(--transition-duration-quick)] group-data-checked/menu-check:[stroke-dashoffset:0] group-data-[selected]/menu-check:[stroke-dashoffset:0] group-data-checked/menu-check:[transition:stroke-dashoffset_var(--transition-duration-normal)_var(--ease-out)] group-data-[selected]/menu-check:[transition:stroke-dashoffset_var(--transition-duration-normal)_var(--ease-out)] motion-reduce:transition-none motion-reduce:group-data-checked/menu-check:transition-none motion-reduce:group-data-[selected]/menu-check:transition-none';

/**
 * The check of a checked radio or checkbox row, or of a selected Select or
 * Combobox option, inside an item with `menuCheckItem` or `menuRadioItem`.
 */
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
