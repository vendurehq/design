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
        body: 'Use semantic utilities such as background, foreground, border, muted, primary, success, warning, and destructive. Never use a ramp step or literal color in component markup.',
      },
      {
        title: 'Ramps exist only to define themes',
        body: 'A ramp is raw material. Reference ramp steps only while mapping theme values to semantic slots.',
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
        body: 'Reserve overlay and larger shadows for popovers, menus, dialogs, and other content that floats above the page.',
      },
      {
        title: 'Inset reads below its host',
        body: 'Use inset for wells, tracks, skeleton regions, or controls that should appear recessed.',
      },
      {
        title: 'Neutral intensity has an order',
        body: 'Use muted for the lowest emphasis, secondary for supporting filled surfaces, and accent for hover or selected emphasis.',
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
        body: 'Use the named page-title, section-title, card-title, body, caption, and code styles when the content matches that role.',
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
        body: 'Type styles define font, size, weight, tracking, and leading. Apply semantic color separately according to meaning.',
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
        body: 'Choose instant, fast, normal, slow, or slower and the shared easing roles rather than literal milliseconds or custom curves.',
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
