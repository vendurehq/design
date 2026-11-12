/**
 * The tint recipes of StatusBadge and Alert, in one place. The components use
 * these class strings, and the contrast test in @vendure-io/design-tokens
 * (`src/contrast.test.ts`) reads the tone slots and mix percentages from them,
 * so a recipe change is tested as it ships. The strings are static so
 * Tailwind's scanner picks them up. This file imports nothing, so the token
 * test can load it.
 */

/**
 * A StatusBadge chip takes its tone from one `--status-tone` colour: a 5% tone
 * wash over the `muted` fill, a 1px inset ring at 34%, and a label tinted 30%
 * from `foreground-secondary` towards the tone.
 */
export const statusChipFill = 'bg-[color-mix(in_oklab,var(--status-tone)_5%,var(--muted))]';

/** The chip's inset ring. A ComboboxChip uses it with the neutral tone. */
export const statusChipRing =
  'inset-ring inset-ring-[color-mix(in_oklab,var(--status-tone)_34%,transparent)]';

/** The chip label. `--status-label-tone` and `--status-label-mix` override the tone and the 30%. */
export const statusChipLabel =
  'text-[color-mix(in_oklab,var(--status-label-tone,var(--status-tone))_var(--status-label-mix,30%),var(--foreground-secondary))]';

/**
 * The tone of each StatusBadge tone. `warning` draws its fill and ring in
 * `warning-indicator` (mixed from `warning-text` they read beige) and mixes
 * its label 70% from `warning-text`.
 */
export const statusToneVars = {
  neutral: '[--status-tone:var(--neutral-text)]',
  info: '[--status-tone:var(--info-text)]',
  success: '[--status-tone:var(--success-text)]',
  warning:
    '[--status-label-mix:70%] [--status-label-tone:var(--warning-text)] [--status-tone:var(--warning-indicator)]',
  critical: '[--status-tone:var(--destructive-text)]',
  progress: '[--status-tone:var(--info-text)]',
};

/** The marker colour of each StatusBadge tone: the icon or spinner stroke. */
export const statusToneText = {
  neutral: 'text-neutral-text',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  critical: 'text-destructive-text',
  progress: 'text-info-text',
};

/**
 * A toned Alert is a faint tint of its `--alert-tone`. Light: 7% tone in the
 * card, border 14% tone in the border colour. Dark: the tone over
 * transparent (10% fill, 30% border), because mixed into the cool surface it
 * reads grey.
 */
export const alertTint =
  'text-foreground [--alert-fill:color-mix(in_oklab,var(--alert-tone)_7%,var(--card))] [--alert-border:color-mix(in_oklab,var(--alert-tone)_14%,var(--border))] dark:[--alert-fill:color-mix(in_oklab,var(--alert-tone)_10%,transparent)] dark:[--alert-border:color-mix(in_oklab,var(--alert-tone)_30%,transparent)] bg-(color:--alert-fill) border-(color:--alert-border)';

/**
 * The tone and icon colour of each toned Alert. Warning tints with the
 * brighter `warning-indicator` (an amber text colour mixes to brown) and
 * takes its icon from `warning-text`.
 */
export const alertToneVars = {
  destructive: '[--alert-tone:var(--destructive-text)] *:[svg]:text-destructive-text',
  warning: '[--alert-tone:var(--warning-indicator)] *:[svg]:text-warning-text',
  info: '[--alert-tone:var(--info-text)] *:[svg]:text-info-text',
};
