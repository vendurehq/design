/**
 * The edge of an outline control: the outline Button, the outline Toggle and
 * the default ButtonGroup. It is the `border` colour, the same hairline as a
 * card, so an outline control on a white card reads as a button without a
 * hard line; `shadow-control` gives it its lift. Hover steps the edge up to
 * the `input` colour. Text fields keep their own `border` hairline
 * (field-surface.ts). The three controls take the edge from here, so they
 * cannot drift apart.
 */
export const outlineEdge = 'border-border';

/** The same edge as an inset ring, for a ButtonGroup that draws its frame with a ring. */
export const outlineEdgeRing = 'inset-ring-border';

/**
 * Hover: the edge steps up to `input`. Not inside a ButtonGroup or a joined
 * ToggleGroup (the group owns the edge), not while invalid and not while
 * aria-disabled.
 */
export const outlineEdgeHover =
  "[&:not([data-slot=button-group]>*,[data-slot=toggle-group-item][data-spacing='0'],[aria-invalid=true],[aria-disabled=true])]:hover:border-input";
