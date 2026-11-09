/**
 * The v3 field surface: the `muted` fill with a 1px inset hairline in the
 * `border` colour, the lg (6px) radius, and a 2px ring drawn inside the field
 * on keyboard focus, over the hairline. An invalid field turns the hairline
 * and the ring destructive. The hairline is a shadow, not a border, so the
 * field keeps its size; forced-colors mode, which drops shadows, gets a real
 * border.
 *
 * Input, Textarea, Select, Combobox, NativeSelect and DatePicker share it.
 * Each field adds its own height, padding and text size.
 */
export const fieldSurface =
  'bg-muted shadow-[inset_0_0_0_1px_var(--border)] rounded-lg outline-none transition-shadow duration-120 ease-[ease] forced-colors:border focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:outline-destructive';
