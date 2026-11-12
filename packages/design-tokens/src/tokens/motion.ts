export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  // Strong ease-out: fast start, long settle. Entrances and state changes.
  out: 'cubic-bezier(0.19, 1, 0.22, 1)',
  // Deliberate alias of `default` — the default easing is ease-in-out.
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // Drawers and sheets that slide in from an edge.
  drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  // A height that opens or closes: an accordion panel, a collapsible
  // section, a new list row. A quick start with a soft settle, so the
  // content below glides instead of jumping.
  height: 'cubic-bezier(0.25, 1, 0.5, 1)',
  // A gentle ease-out for the press scale of a control. Softer than `out`,
  // so a quick tap does not snap to its end value.
  press: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  // The CSS `ease` curve: a light ease for small colour, opacity and blur
  // changes, and for quick exits.
  soft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  // The content of a Drawer fading while a nested drawer opens over it: a
  // near-linear start with a small overshoot at the end. Only Drawer uses it.
  drawerContent: 'cubic-bezier(0.45, 1.005, 0, 1.005)',
} as const;

export const duration = {
  instant: '0ms',
  fast: '100ms',
  // Colour changes on controls: fill, border and text of a button or link.
  quick: '120ms',
  moderate: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  // The command palette's timings. It opens often, so each step is tuned to
  // the palette alone. Use the scale above everywhere else.
  paletteDetailDelay: '40ms', // the highlighted item's detail waits for the highlight
  paletteResultDelay: '50ms', // new results wait for the old ones to start leaving
  paletteDetailExit: '90ms', // the detail leaves an item
  paletteExit: '110ms', // the palette and its scrim close
  paletteTint: '120ms', // item text and icon colour; the reduced-motion fade
  paletteResultExit: '140ms', // old results fade out
  paletteEnter: '160ms', // the palette and its scrim fade in; old results blur out
  paletteMove: '180ms', // the palette drops into place; the detail fades in
  paletteDetailMove: '220ms', // the detail slides into place
  paletteResultBlur: '240ms', // new results come out of their blur
  // The tooltip opens on its own beat, a touch quicker than `moderate`.
  // It leaves in `fast`. Only TooltipContent uses it.
  tooltipEnter: '125ms',
  // A TooltipProvider waits this long before it opens the first tooltip, so a
  // pointer that only passes over a trigger opens nothing. Once a tooltip is
  // open, the next one opens at once. Only TooltipProvider uses it.
  tooltipDelay: '600ms',
  // A tooltip label that changes in place (Copy → Copied): the labels fade
  // and blur in `tooltipLabelFade`, slide in `tooltipLabelMove`, and the
  // bubble eases to the new width in `tooltipResize`.
  tooltipLabelFade: '180ms',
  tooltipLabelMove: '260ms',
  tooltipResize: '320ms',
  // A Progress fill grows from 0 when it first shows, and eases to a new
  // value, in this time with the `out` curve. Only Progress uses it.
  progressFill: '240ms',
  // A list row the user just added opens its height in this time with the
  // `height` curve. Only ListRow uses it.
  rowEnter: '340ms',
  // A ListRowSwap trades its value for its action: the outgoing one fades in
  // `rowSwapOut`, the incoming one fades in `quick` after `rowSwapDelay`, so
  // the two never show at once. Only ListRow uses them.
  rowSwapOut: '80ms',
  rowSwapDelay: '60ms',
  // A popup fades in over this time while it scales in `normal`. The shared
  // popup motion and the NavigationMenu arrow use it.
  popupFade: '160ms',
  // An open NavigationMenu moves and resizes to the next item's content in
  // this time with the `out` curve. Only NavigationMenu uses it.
  popupResize: '350ms',
  // The sidebar's sliding pill moves and resizes to the active item in this
  // time with the `drawer` curve. Only the Sidebar menu indicator uses it.
  sidebarPill: '280ms',
  // Toasts. A toast moves to its place in the stack in `toastMove` and fades
  // in `toastFade`; a leaving toast drops in `toastExitMove` and fades in
  // `toastExitFade`. Only the Toaster uses them.
  toastExitFade: '160ms',
  toastExitMove: '180ms',
  toastFade: '220ms',
  toastMove: '320ms',
  // A Checkbox's check mark starts to draw this long after its fill starts
  // to grow, so the mark lands on a fill that is already there. Only
  // Checkbox uses it.
  checkMarkDelay: '15ms',
  // Dialog and AlertDialog. The scrim fades in `dialogScrim`. The popup
  // scales and moves in `dialogEnter` (its opacity uses `normal`). On exit,
  // the scrim and the popup's scale and move take `dialogExit` (the popup's
  // opacity uses `quick`). Only Dialog and AlertDialog use them.
  dialogScrim: '180ms',
  dialogEnter: '240ms',
  dialogExit: '140ms',
  // A Drawer slides, and its scrim fades, in `drawerSlide` with the
  // `drawer` curve. `drawerSwipe` is the time a released swipe at full
  // strength takes to finish: the Drawer scales it by the swipe strength.
  // Only Drawer uses them.
  drawerSlide: '450ms',
  drawerSwipe: '400ms',
  // An Alert that appears moves into place and fades in this time with the
  // `out` curve. Only Alert uses it.
  alertEnter: '240ms',
  // The icon of a Button turns (a chevron on an expanded trigger) in this
  // time with the `out` curve. Only Button uses it.
  buttonIconTurn: '220ms',
  // The diagonal arrow of a link that opens another site (ArrowLink
  // `external`, PageHeaderFactLink) moves out in this time with the `out`
  // curve. Only those two use it.
  externalArrow: '220ms',
  // A page that opens fades in over `pageFade` and rises into place over
  // `pageRise`, both on the `out` curve. The `page-enter` animation below
  // uses them.
  pageFade: '220ms',
  pageRise: '260ms',
} as const;

// Named animations — Tailwind `animate-*` utilities. Each keyframe name an
// animation runs needs a matching entry in `keyframes` below.
export const animation = {
  shimmer: 'shimmer 1.75s linear infinite',
  // A calm rotation for small in-progress marks (the StatusBadge spinner).
  // Slower than Tailwind's 1s `animate-spin`.
  spinSlow: 'spin-slow 1.6s linear infinite',
  // A band crossing an indeterminate Progress bar at a constant speed: the
  // work runs, its length is unknown.
  progressSweep: 'progress-sweep 2.2s linear infinite',
  // A soft ring that grows out of a live dot and fades, once per 2.4s, on the
  // `out` curve: fast out of the dot, then a long fade. Slow and quiet, so a
  // state that stays live for minutes does not read as urgent. Only
  // LiveIndicator uses it.
  livePulse: 'live-pulse 2.4s cubic-bezier(0.19, 1, 0.22, 1) infinite',
  // A page that opens: it fades in and rises 6px into place. Two keyframes,
  // because the fade and the rise end at different times. It runs once,
  // when the element mounts. AppShellPage uses it; a consumer with its own
  // layout puts it on the element it keys to the route.
  pageEnter: `page-fade ${duration.pageFade} ${easing.out}, page-rise ${duration.pageRise} ${easing.out}`,
  // The same page enter with reduced motion: the fade only.
  pageFade: `page-fade ${duration.pageFade} ${easing.out}`,
} as const;

// Keyframe steps for the animations above, generated as top-level
// `@keyframes` blocks alongside the theme.
export const keyframes = {
  shimmer: {
    from: { backgroundPosition: '-200% 0' },
    to: { backgroundPosition: '200% 0' },
  },
  spinSlow: {
    to: { transform: 'rotate(360deg)' },
  },
  // The band is 40% of the track: it starts just left of the track and
  // ends just right of it.
  progressSweep: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(250%)' },
  },
  // The ring starts at the dot's size and 45% opacity, and is gone at 70%:
  // the last 30% of each cycle is a rest with the dot alone.
  livePulse: {
    '0%': { transform: 'scale(1)', opacity: '0.45' },
    '70%': { transform: 'scale(2.6)', opacity: '0' },
    '100%': { transform: 'scale(2.6)', opacity: '0' },
  },
  // The page enter: each step only sets where the page starts, so it ends on
  // its own styles. The 6px rise is the v3 look's page distance.
  pageFade: {
    from: { opacity: '0' },
  },
  pageRise: {
    from: { transform: 'translateY(6px)' },
  },
} as const;
