/**
 * How a popup opens from its trigger, as the v3-look menu does: opacity in
 * 160ms, scale and translate in 200ms on the strong ease-out, from scale 0.96
 * and 2px towards the trigger. It closes in 120ms on the CSS `ease`. Reduced
 * motion keeps the fade and drops the scale and the drop.
 *
 * DropdownMenu, ContextMenu, Select, Combobox, Popover, HoverCard and the
 * NavigationMenu popup share it, so they open alike. Base UI sets
 * `--transform-origin` and `data-side` on each popup.
 */
export const popupMotion =
  'origin-(--transform-origin) transition-[opacity,scale,translate] [transition-duration:160ms,200ms,200ms] ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-120 data-ending-style:ease-[ease] motion-safe:data-starting-style:scale-96 motion-safe:data-ending-style:scale-96 motion-safe:data-starting-style:-translate-y-0.5 motion-safe:data-ending-style:-translate-y-0.5 motion-safe:data-[side=top]:data-starting-style:translate-y-0.5 motion-safe:data-[side=top]:data-ending-style:translate-y-0.5';
