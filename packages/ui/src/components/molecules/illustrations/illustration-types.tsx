// Pure type module for the illustrations set. Kept runtime-free so every
// illustration file can import it without pulling in unrelated JSX.

export interface IllustrationProps {
  /** Extra classes applied to the root `<svg>` (e.g. to resize or reposition). */
  className?: string;
  /** Width in px. Height follows the fixed 160×120 (4:3) aspect ratio. Defaults to 160. */
  size?: number;
}
