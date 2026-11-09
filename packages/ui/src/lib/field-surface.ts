/**
 * The v3 field surface: the `muted` fill with a 1px inset hairline in the
 * `border` colour, the lg (6px) radius, and a 2px ring drawn inside the field
 * on keyboard focus, over the hairline. An invalid field turns the hairline
 * and the ring destructive. The hairline is a shadow, not a border, so the
 * field keeps its size; forced-colors mode, which drops shadows, gets a real
 * border.
 *
 * Input, Textarea, Select, Combobox, NativeSelect and the date pickers share
 * it. Each field adds its own height, padding and text size.
 */
const fieldBase =
  'bg-muted shadow-[inset_0_0_0_1px_var(--border)] rounded-lg outline-none transition-shadow duration-120 ease-[ease] forced-colors:border';

export const fieldSurface = `${fieldBase} focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:outline-destructive`;

/**
 * The field surface for a field whose focus and invalid state sit on an
 * element inside it: the ring follows `focus-within`, and the hairline turns
 * destructive when a control inside is `aria-invalid`. ComboboxChips and the
 * InputOTP group use it.
 */
export const fieldSurfaceWithin = `${fieldBase} focus-within:outline-solid focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring has-aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] has-aria-invalid:focus-within:outline-destructive`;

/**
 * A ghost Button drawn as a field: the trigger of DatePicker, DateRangePicker
 * and DateTimePicker. It drops the Button's transparent border, so the fill
 * reaches the edge and the field is 34px like an Input, and it starts its
 * icon 10px in with an 8px gap, like an Input's text.
 */
export const fieldButton = `${fieldSurface} border-0 bg-clip-border px-2.5 gap-2 min-w-0 flex-1 justify-start font-normal text-foreground hover:text-foreground aria-expanded:text-foreground active:scale-none aria-invalid:ring-0`;
