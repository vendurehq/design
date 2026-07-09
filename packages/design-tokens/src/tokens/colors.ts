// Vendure Blue — brand[500] = #17c1ff
export const brand = {
  50: 'oklch(0.97 0.02 231)',
  100: 'oklch(0.93 0.04 231)',
  200: 'oklch(0.87 0.08 231)',
  300: 'oklch(0.83 0.11 231)',
  400: 'oklch(0.8 0.13 231)',
  500: 'oklch(0.76 0.15 231)',
  600: 'oklch(0.65 0.16 231)',
  700: 'oklch(0.54 0.16 231)',
  800: 'oklch(0.43 0.13 231)',
  900: 'oklch(0.33 0.1 231)',
  950: 'oklch(0.25 0.07 231)',
} as const;

// "Whisper cool" — near-gray with a barely-perceptible cool bias toward brand hue 231
export const neutral = {
  50: 'oklch(0.97 0.004 231)',
  100: 'oklch(0.93 0.004 231)',
  200: 'oklch(0.87 0.004 231)',
  300: 'oklch(0.78 0.004 231)',
  400: 'oklch(0.68 0.005 231)',
  500: 'oklch(0.55 0.005 231)',
  600: 'oklch(0.45 0.005 231)',
  700: 'oklch(0.37 0.007 231)',
  800: 'oklch(0.28 0.007 231)',
  900: 'oklch(0.2 0.007 231)',
  950: 'oklch(0.15 0.007 231)',
} as const;

export const success = {
  50: 'oklch(0.97 0.02 145)',
  100: 'oklch(0.93 0.04 145)',
  200: 'oklch(0.87 0.07 145)',
  300: 'oklch(0.78 0.11 145)',
  400: 'oklch(0.68 0.15 145)',
  500: 'oklch(0.55 0.17 145)',
  600: 'oklch(0.48 0.15 145)',
  700: 'oklch(0.4 0.13 145)',
  800: 'oklch(0.33 0.1 145)',
  900: 'oklch(0.27 0.08 145)',
  950: 'oklch(0.2 0.06 145)',
} as const;

export const warning = {
  50: 'oklch(0.97 0.02 85)',
  100: 'oklch(0.93 0.05 85)',
  200: 'oklch(0.87 0.08 85)',
  300: 'oklch(0.78 0.12 85)',
  400: 'oklch(0.72 0.15 85)',
  500: 'oklch(0.65 0.18 85)',
  600: 'oklch(0.55 0.13 85)',
  700: 'oklch(0.45 0.11 85)',
  800: 'oklch(0.37 0.09 85)',
  900: 'oklch(0.28 0.06 85)',
  950: 'oklch(0.2 0.04 85)',
} as const;

export const destructive = {
  50: 'oklch(0.97 0.02 25)',
  100: 'oklch(0.93 0.05 25)',
  200: 'oklch(0.87 0.08 25)',
  300: 'oklch(0.78 0.12 25)',
  400: 'oklch(0.68 0.16 25)',
  500: 'oklch(0.55 0.2 25)',
  600: 'oklch(0.48 0.18 25)',
  700: 'oklch(0.4 0.15 25)',
  800: 'oklch(0.33 0.12 25)',
  900: 'oklch(0.27 0.09 25)',
  950: 'oklch(0.2 0.06 25)',
} as const;

// Info — hue 250, clearly distinct from brand 231
export const info = {
  50: 'oklch(0.97 0.02 250)',
  100: 'oklch(0.93 0.05 250)',
  200: 'oklch(0.87 0.08 250)',
  300: 'oklch(0.78 0.12 250)',
  400: 'oklch(0.68 0.16 250)',
  500: 'oklch(0.55 0.19 250)',
  600: 'oklch(0.48 0.17 250)',
  700: 'oklch(0.4 0.15 250)',
  800: 'oklch(0.33 0.12 250)',
  900: 'oklch(0.27 0.09 250)',
  950: 'oklch(0.2 0.06 250)',
} as const;

// Chart/data-viz categorical slots. Muted (chroma ~0.12) for a subtle read, with
// lightness held inside both light and dark bands. Slot ORDER is the colorblind-
// safety mechanism, not cosmetic — it was picked to maximize the minimum adjacent
// separation under protanopia/deuteranopia (worst adjacent ΔE ≈ 29, target ≥12).
// Do not reorder into a hue rainbow: putting red next to green collapses to ΔE ~4.
export const viz = {
  1: 'oklch(0.56 0.12 250)', // blue (brand-adjacent — first series)
  2: 'oklch(0.64 0.12 145)', // green
  3: 'oklch(0.51 0.13 320)', // violet
  4: 'oklch(0.66 0.12 85)', // gold
  5: 'oklch(0.58 0.13 25)', // red
} as const;
