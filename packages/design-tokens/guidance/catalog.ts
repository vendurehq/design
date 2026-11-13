export interface TokenGuidanceRule {
  title: string;
  body: string;
}

export interface TokenGuidanceEntry {
  id: string;
  title: string;
  summary: string;
  rules: TokenGuidanceRule[];
}

export const tokenGuidance = [
  {
    id: 'color',
    title: 'Semantic color',
    summary: 'Map raw color through semantic slots before any component or page consumes it.',
    rules: [
      {
        title: 'Component code consumes slots',
        body: 'Use semantic utilities such as background, foreground, border, muted, primary, success, warning, and destructive. Published Vendure semantic ramps are allowed when a deliberate fixed intensity is required; never use generic palette ramps or literal colors in component markup.',
      },
      {
        title: 'Generic ramps exist only to define themes',
        body: 'Generic palette ramps are raw material and belong in theme mapping. The named brand, success, warning, destructive, and info ramps are part of Vendure’s semantic vocabulary, though role slots remain the default for routine component states.',
      },
      {
        title: 'Neutral by default, tone for state, brand for identity',
        body: 'Spend color only when it reports state or marks a deliberate identity moment. Routine interface structure remains neutral.',
      },
      {
        title: 'State uses the tone vocabulary',
        body: 'Map domain states through neutral, info, success, warning, critical, or progress. Do not choose arbitrary state colors at the call site.',
      },
      {
        title: 'Subtle is the default status treatment',
        body: 'Use the matching subtle background, readable foreground, and border slots for status surfaces instead of full-strength fills.',
      },
      {
        title: 'Tone text uses the text slots',
        body: 'Set a status word, delta, or field error directly on a surface with the matching tone text slot, such as success-text or destructive-text. The solid tone slots are fills for their foreground text and are not safe as text.',
      },
      {
        title: 'Text has three levels',
        body: 'Use foreground for primary text, foreground-secondary for supporting text such as descriptions and table values, and muted-foreground for the lowest emphasis. secondary-foreground is only the text on a secondary fill.',
      },
      {
        title: 'Placeholders are fainter than muted text',
        body: 'Use faint-foreground for placeholder text in a field, native or shown as text by a select, combobox or date picker. It is below 4.5:1, so never use it for text a user must read.',
      },
      {
        title: 'Brand marks are non-text',
        body: 'Use brand-indicator for the active navigation icon, a selected-item marker, or a link mark. It is a brand scale step for non-text marks (about 3:1 in light mode, a little less on the canvas), not text at 4.5:1. The focus ring is brand too. For text in the brand colour, such as a link name on hover, use brand-text: a brand scale step that reads at 4.5:1 on every tier and on a hovered or selected row. info-text is for information status only.',
      },
      {
        title: 'Warning marks are never the only cue',
        body: 'Use warning-indicator for a warning mark beside a label, such as the StatusBadge outline and fill. In light mode it is about 2:1, below the 3:1 non-text bar, so a label or icon must carry the state. The StatusBadge status dot fills with it too, and keeps its label as screen-reader text. Do not use it for text.',
      },
      {
        title: 'Local color concepts remain semantic',
        body: 'A standalone external app may add a namespaced semantic slot for a genuinely product-specific concept, mapped through theme values. Graduate it when a second consumer needs it.',
      },
    ],
  },
  {
    id: 'surfaces',
    title: 'Surfaces and intensity',
    summary: 'Create hierarchy through semantic surface contrast and restrained neutral intensity.',
    rules: [
      {
        title: 'Surface contrast separates levels',
        body: 'Use background, surface, surface-raised, overlay, and inset according to spatial hierarchy. Do not simulate every level with a border or shadow.',
      },
      {
        title: 'Borders divide peers',
        body: 'Use borders to separate siblings within the same surface level, not as the primary signal for every container.',
      },
      {
        title: 'Overlay is for floating content',
        body: "Reserve overlay and the overlay shadow for popovers, menus, dialogs, and other content that floats above the page. The overlay shadow is the popup's border: a clear 1px edge, then the drop. Do not add a border or ring class to a popup. Primitives stay flat: no xs shadow tier on inputs. Default, brand, destructive, destructive-outline and outline buttons, button groups, cards and the sliding sidebar pill sit on shadow-control, a 1px lift off the surface. Ghost and link buttons stay flat.",
      },
      {
        title: 'A disabled menu item never looks highlighted',
        body: 'A disabled item in a dropdown menu, context menu, menubar, select or combobox shows all its content at half strength: text, icon, status dot, detail, shortcut and check, each with its own colour. Under hover or focus it takes no fill and its text and icon do not change, so it never looks like the item a click will pick. The arrow keys still stop on it and draw the focus ring at full strength: the item dims its content, not itself.',
      },
      {
        title: 'A scrolled header gets a rule',
        body: 'A sticky header over a scroll area of your own takes shadow-scrolled while content sits under it: a 1px line in the input colour. Put useScrolled on the scroll container and in-data-scrolled:shadow-scrolled on the header. Give the header a background and z-10 so the rows pass under it. At the top, the header has no line.',
      },
      {
        title: 'Inset reads below its host',
        body: 'Use inset for wells, skeleton regions, or controls that should appear recessed. A Progress track is not inset: it uses the accent tint.',
      },
      {
        title: 'Neutral intensity has an order',
        body: 'Use muted for the lowest emphasis and for hover and selected fills on rows, items and ghost controls. Use secondary for supporting filled surfaces. Use accent as the hover step for a control that already rests on muted.',
      },
    ],
  },
  {
    id: 'typography',
    title: 'Typography',
    summary: 'Use named type roles and shared font context rather than restyling headings ad hoc.',
    rules: [
      {
        title: 'Choose a semantic type role',
        body: 'Use the named page-title, section-title, dialog-title, card-title, body, caption, and code styles when the content matches that role. Body and UI text is 13px (text-sm), small text and keyboard hints 12px (text-xs), and micro text 11px (text-2xs).',
      },
      {
        title: 'Raw headings are not globally restyled',
        body: 'Use the design-system title components or apply the heading role explicitly. Do not rebind the heading font in consumer CSS.',
      },
      {
        title: 'Load fonts separately from the theme',
        body: 'Import css/fonts when the app should self-host the declared families; css/theme declares font tokens but does not load font files.',
      },
      {
        title: 'Typography does not carry state color',
        body: 'Type styles define font, size, weight, tracking, leading, and text wrapping: the title roles balance their lines and body avoids a single word on its last line. Apply semantic color separately according to meaning.',
      },
    ],
  },
  {
    id: 'motion',
    title: 'Motion',
    summary: 'Use shared duration and easing tokens for purposeful state transitions.',
    rules: [
      {
        title: 'Motion explains change',
        body: 'Animate entry, exit, reordering, feedback, or continuity. Do not add movement only to make a static surface feel lively.',
      },
      {
        title: 'Use named duration and easing tokens',
        body: 'Every duration and easing is a token. Choose instant, fast, quick, moderate, normal, slow, or slower and the shared easing roles: ease-out for entrances and for the scale and movement of an exit (its fade stays on ease-soft), ease-drawer for drawers, sheets and the sidebar pill, ease-height for a height that opens or closes, ease-press for the press scale of a control, ease-soft (the CSS `ease` curve) for small colour, opacity and blur changes, and ease-flash (the CSS `ease-out` curve) for the long fade of the match flash only. When the scale lacks a value, add a duration token named for the component or shared look that owns it, and use it there only: palette-* for the command palette, tooltip-* for the tooltip, popup-fade and popup-resize for popups, sidebar-pill for the sidebar pill, toast-* for toasts, progress-fill for Progress, row-enter for a new ListRow, row-swap-out and row-swap-delay for a ListRowSwap, dialog-* for Dialog and AlertDialog, drawer-* for Drawer, alert-enter for Alert, button-icon-turn for the Button icon, external-arrow for the arrow of a link that opens another site, page-fade and page-rise for the page enter, page-switch for the brand line of a page switch, page-reload-fade and page-reload-settle for the content that comes back after it, live-pulse for the LiveIndicator ring, and match-flash for a search match flash. Never write a literal millisecond value or curve in a class. Write the short class form: duration-quick and ease-soft, not duration-(--transition-duration-quick).',
      },
      {
        title: 'Page switch and match flash stay in the consumer',
        body: 'A page that switches its content in place (the environment switch) reloads in place, it does not open as a new page. Key the content to the switched value and give it animate-page-reload motion-reduce:animate-page-reload-fade: it comes back from 35% opacity, a 3px blur and a 3px drop. At the same time a 2px brand line under the top bar runs once with animate-page-switch-line (duration-page-switch, 420ms): key it to the same value, fill it with a gradient from transparent to brand (bg-linear-to-r rtl:bg-linear-to-l, so it turns in right-to-left), give it origin-left rtl:origin-right, and hide it with motion-reduce:hidden. Do not dim the old content while the new one loads. A new search match flashes once with animate-match-flash; set --match-flash-color for another tone. The flash moves nothing, so it also runs with reduced motion, and the current match keeps its own static highlight. The design system ships the tokens only: the brand line, the pending page state and the log viewer are built in the consumer.',
      },
      {
        title: 'Match duration to distance and consequence',
        body: 'Small local feedback is fast; larger spatial transitions may be slower. Routine interactions should not feel ceremonial.',
      },
      {
        title: 'Preserve reduced-motion behavior',
        body: 'Make non-essential motion removable and ensure meaning remains visible when animation is reduced.',
      },
    ],
  },
  {
    id: 'theming',
    title: 'Theming ownership',
    summary: 'Classify the host before deciding whether semantic slot values may be remapped.',
    rules: [
      {
        title: 'Vendure-owned repositories do not override shared values',
        body: 'When a git remote owner is vendurehq, consume the published slot, ramp, typography, radius, shadow, and motion values without redefining them.',
      },
      {
        title: 'Dashboard extensions inherit the host theme',
        body: 'Code using defineDashboardExtension or a VendurePlugin dashboard entry runs inside the dashboard visual environment and must not remap its token values.',
      },
      {
        title: 'Standalone external apps may remap slots',
        body: 'An external standalone app may provide its own values for the semantic contract while component code continues to consume semantic slots.',
      },
      {
        title: 'Dark mode remaps values, not component decisions',
        body: 'Keep component classes semantic and let the dark theme change the underlying variables.',
      },
      {
        title: 'Shared needs graduate',
        body: 'Keep a product-specific semantic slot local until a second consumer needs the same concept, then graduate it into the token package.',
      },
    ],
  },
] as const satisfies readonly TokenGuidanceEntry[];
