import { cva } from 'class-variance-authority';

// The look of a whole card the user acts on: a card they pick (ChoiceCard) or
// a card that opens a page (a Card with a CardLink). One place, so every
// interactive card hovers, presses and takes focus the same way.
// - Surface: the Card panel (card fill, hairline border, 12px radius,
//   shadow-control).
// - Hover: the border darkens. No fill, so the card reads as one object.
// - Pressed: the card shrinks to 99.5% on the press curve. Reduced motion keeps
//   it still.
// - Focus: the design-system ring, 2px at a 2px offset, outside the border.
// - Disabled (`data-disabled` or `aria-disabled`): half opacity, no hover, no
//   press.
// Selection is not part of it: a card that opens a page has none. Only
// colours and the scale transition, never `transition-all`.
//
// `target` says which element is the control:
// - `self`: the card itself (ChoiceCard). The states read the card's own
//   :hover, :active and :focus-visible.
// - `link`: a stretched CardLink inside a Card. Every class is gated on
//   `has-data-[slot=card-link]`, so a Card without a link stays static. Hover
//   is the card's (the link covers it). Press and focus read the link's
//   :active and :focus-visible, so pressing a menu inside the card does not
//   press the card. Only a pointer press scales it: a key press (Space or
//   Enter on the focused link) leaves the card still, as keyboard actions do
//   not animate. The link target only transitions what changes: the border
//   and the scale.
const SURFACE = 'rounded-2xl border border-border bg-card text-card-foreground shadow-control';

const SELF_STATES =
  'relative outline-none cursor-pointer select-none [transition:border-color_var(--transition-duration-fast)_var(--ease-soft),background-color_var(--transition-duration-fast)_var(--ease-soft),box-shadow_var(--transition-duration-fast)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-press)] hover:border-foreground/25 active:scale-[0.995] motion-reduce:active:scale-100 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:border-border data-disabled:active:scale-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:border-border aria-disabled:active:scale-100';

const LINK_STATES =
  'has-data-[slot=card-link]:relative has-data-[slot=card-link]:cursor-pointer has-data-[slot=card-link]:[transition:border-color_var(--transition-duration-fast)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-press)] has-data-[slot=card-link]:hover:border-foreground/25 has-[[data-slot=card-link]:active:not(:focus-visible)]:scale-[0.995] motion-reduce:has-[[data-slot=card-link]:active:not(:focus-visible)]:scale-100 has-[[data-slot=card-link]:focus-visible]:outline-solid has-[[data-slot=card-link]:focus-visible]:outline-2 has-[[data-slot=card-link]:focus-visible]:outline-offset-2 has-[[data-slot=card-link]:focus-visible]:outline-ring';

const interactiveCardVariants = cva(SURFACE, {
  variants: {
    target: {
      self: SELF_STATES,
      link: LINK_STATES,
    },
  },
  defaultVariants: { target: 'self' },
});

export { interactiveCardVariants };
