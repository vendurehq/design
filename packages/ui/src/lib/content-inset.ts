/**
 * Lines up the text of a styled element (a Badge, a StatusBadge chip, a
 * Button, an IdChip) with the header of its DataTable column.
 *
 * The element sets `--content-inset`: the distance from its box to its first
 * letter (padding, border, and a leading icon with its gap). A DataTable cell
 * pulls its first element back by that distance. This class also pulls the
 * element back when it sits one wrapper deep, as the first child of the
 * cell's first child (for example inside a tooltip trigger).
 *
 * The rule has zero specificity, so a margin the element sets itself wins. It
 * only applies inside a cell marked `data-content-inset-cell`, which only the
 * DataTable sets: it measures the pull-back and indents the column when the
 * pull-back would leave the cell.
 */
export const contentInsetPull =
  '[:where([data-content-inset-cell]>:first-child>&:first-child)]:-ms-(--content-inset)';
