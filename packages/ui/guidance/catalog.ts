import type { GuidanceEntry } from './types.ts';

export const uiGuidance = [
  {
    id: 'anonymized-token',
    title: 'AnonymizedToken',
    summary: 'Render secret-like values as protected, copyable previews rather than exposed text.',
    sourceStory: 'anonymized-token-guidance.stories.tsx',
    rules: [
      {
        title: 'Secrets are never plain identifiers',
        body: 'Use AnonymizedToken for credentials and secret-like values; use IdChip only for non-secret identifiers.',
      },
      {
        title: 'Reveal only through deliberate interaction',
        body: 'Keep the preview blurred and truncated at rest, reveal it on hover or focus, and copy the complete value.',
      },
      {
        title: 'Do not render the full value elsewhere',
        body: 'A protected token loses its purpose if the same secret is also present as visible text, a title, or an accessible label.',
      },
    ],
    related: ['copyable-text', 'id-chip'],
  },
  {
    id: 'app-shell',
    title: 'AppShell',
    summary:
      'Use the shared application anatomy without moving app-owned routing or context into the shell.',
    sourceStory: 'app-shell-guidance.stories.tsx',
    rules: [
      {
        title: 'The shell owns anatomy',
        body: 'AppShell owns the header, navigation region, main landmark, scroll boundary, and skip-link destination. Prefer AppShellMain as the scroll owner so the viewport-bound shell keeps its header and canvas inset visible; use container ownership only when integrating with an established shell that already owns scrolling.',
      },
      {
        title: 'Compose one main landmark with Sidebar',
        body: 'When using the collapsible Sidebar atom, render SidebarInset as a div and keep AppShellMain as the single focusable main landmark.',
      },
      {
        title: 'The consumer owns application state',
        body: 'Keep routing, navigation data, authentication, permissions, and context switching in the consumer.',
      },
      {
        title: 'Use one shell per application surface',
        body: 'Do not nest AppShells to create local layouts; compose local regions inside the existing main content area.',
      },
    ],
    related: ['page-header'],
  },
  {
    id: 'badge',
    title: 'Badge',
    summary: 'Use Badge for static classification or counts, neutral by default.',
    sourceStory: 'badge-guidance.stories.tsx',
    rules: [
      {
        title: 'Classification is not state',
        body: 'Use Badge for kind, category, or count. State words that can succeed, fail, or move belong to StatusBadge.',
      },
      {
        title: 'Neutral is the default',
        body: 'Begin with the default Badge and step away only when the meaning requires it.',
      },
      {
        title: 'Brand is an identity opt-in',
        body: 'Use the brand variant only for a deliberate identity label, never to make routine metadata louder.',
      },
    ],
    choices: [
      { choice: 'default', when: 'Routine classification and counts.' },
      { choice: 'outline', when: 'A quieter classification on a dense surface.' },
      { choice: 'brand', when: 'A rare identity label that deliberately spends brand.' },
      {
        choice: 'destructive',
        when: 'A destructive classification, not an entity workflow state.',
      },
    ],
    related: ['chip', 'status-badge'],
  },
  {
    id: 'button',
    title: 'Button',
    summary: 'Compose actions as an emphasis ladder with one primary action per view.',
    sourceStory: 'button-guidance.stories.tsx',
    rules: [
      {
        title: 'One primary action per view',
        body: 'Choose the single most-important action and give it the default filled Button. Step every other action down.',
      },
      {
        title: 'Variant expresses weight, not color preference',
        body: 'Choose variants relative to neighboring actions; do not use filled or destructive styling merely to attract attention.',
      },
      {
        title: 'Destructive means loss',
        body: 'Reserve destructive for irreversible or removing actions. An outward-facing action is not automatically destructive.',
      },
      {
        title: 'Brand is an identity spend, not a louder primary',
        body: 'Use the brand variant only for a deliberate identity or marketing CTA such as a trial or upgrade entry point. It is off the emphasis ladder; never reach for it to make an in-app primary shinier.',
      },
    ],
    choices: [
      { choice: 'default', when: 'The single primary action of the view.' },
      {
        choice: 'brand',
        when: 'A deliberate identity or marketing CTA (start a trial, upgrade to Cloud), never a louder in-app primary.',
      },
      { choice: 'secondary', when: 'A supporting action that still deserves a filled surface.' },
      { choice: 'outline', when: 'The common neutral partner: cancel, back, or dismiss.' },
      { choice: 'ghost', when: 'Tertiary, overflow, or icon actions that should recede.' },
      { choice: 'destructive', when: 'Irreversible or removing actions.' },
      { choice: 'link', when: 'Inline navigation that should read as text.' },
    ],
    related: ['confirm-dialog', 'page-header'],
  },
  {
    id: 'chip',
    title: 'Chip',
    summary: 'Use Chip for removable members of an editable set or applied filters.',
    sourceStory: 'chip-guidance.stories.tsx',
    rules: [
      {
        title: 'Removability is the signal',
        body: 'A Chip represents membership in an editable set. Static labels are Badges, and state words are StatusBadges.',
      },
      {
        title: 'State words are never Chips',
        body: 'Active, Pending, Failed, Cancelled, and similar dictionary states must retain their state-dictionary tone contract.',
      },
      {
        title: 'Name the remove action',
        body: 'Whenever onRemove exists, provide a specific removeLabel for assistive technology.',
      },
      {
        title: 'Disabled means a pending mutation',
        body: 'Disable a Chip while membership removal is in flight, not to represent a deactivated entity.',
      },
    ],
    related: ['badge', 'id-chip', 'status-badge'],
  },
  {
    id: 'code-block',
    title: 'CodeBlock',
    summary:
      'Present multi-line code for reading, with the switcher reserved for runnable instructions and one annotation intent per block.',
    sourceStory: 'code-block-guidance.stories.tsx',
    rules: [
      {
        title: 'Blocks are for reading, not transport',
        body: 'Use CodeBlock for multi-line code the reader studies or copies whole. Use CopyableText for single values users move elsewhere, and inline code for references inside prose.',
      },
      {
        title: 'The switcher is for instructions, not output',
        body: 'Enable packageManagerSwitcher only on shell blocks the reader should run under their own package manager. Terminal output and logs stay plain.',
      },
      {
        title: 'App actions live in the actions slot',
        body: 'The DS ships only the copy button. Hang app-specific controls such as an Ask AI button on the actions slot using CodeBlockAction.',
      },
      {
        title: 'A filename names a real file',
        body: 'Set the filename header when the snippet is the contents of a file in the reader’s project. It takes precedence over the switcher tabs, so never combine the two.',
      },
      {
        title: 'One notation intent per block',
        body: 'Choose one Shiki notation intent per block: highlight, diff, focus, or word. Stacked intents bury the point of the annotation.',
      },
    ],
    related: ['copyable-text'],
  },
  {
    id: 'combobox-free-text',
    title: 'ComboboxFreeText',
    summary: 'Use free-text selection only when a brand-new value is a legitimate domain answer.',
    sourceStory: 'combobox-free-text-guidance.stories.tsx',
    rules: [
      {
        title: 'Openness is a domain decision',
        body: 'Use ComboboxFreeText only when typed values outside the suggestion set are valid and should win.',
      },
      {
        title: 'Managed vocabularies stay strict',
        body: 'Use Combobox, Select, or MultiSelect when every valid answer already exists in a managed set.',
      },
      {
        title: 'Pay for openness deliberately',
        body: 'Expect and handle duplicates, spelling variation, normalization, and creation semantics when free text is allowed.',
      },
    ],
    related: ['multi-select'],
  },
  {
    id: 'confirm-dialog',
    title: 'ConfirmDialog',
    summary: 'Confirm only consequential actions, and make the consequence and verb explicit.',
    sourceStory: 'confirm-dialog-guidance.stories.tsx',
    rules: [
      {
        title: 'Confirmation must earn the interruption',
        body: 'Confirm irreversible, bulk, or outward-facing actions. Do not confirm routine reversible changes.',
      },
      {
        title: 'Name the action twice',
        body: 'The title states the consequence and the confirmation button repeats the concrete verb.',
      },
      {
        title: 'Destructive styling follows destructive outcome',
        body: 'A confirmation can be consequential without causing loss. Use destructive only when the action removes or destroys.',
      },
      {
        title: 'Keep pending state inside the dialog',
        body: 'Disable repeated submission, preserve context, and close only after the confirmed action succeeds.',
      },
    ],
    related: ['button'],
  },
  {
    id: 'copyable-text',
    title: 'CopyableText',
    summary: 'Offer copying only for values users genuinely transport elsewhere.',
    sourceStory: 'copyable-text-guidance.stories.tsx',
    rules: [
      {
        title: 'Copy is a workflow, not decoration',
        body: 'Add copying for URLs, commands, addresses, references, and other values users move into another tool.',
      },
      {
        title: 'Identifiers have a dedicated compact form',
        body: 'Use IdChip for opaque non-secret identifiers and CopyableText when readable content is primary.',
      },
      {
        title: 'Secrets use AnonymizedToken',
        body: 'Do not expose credential-like values through CopyableText.',
      },
      {
        title: 'Truncate without destroying recognition',
        body: 'Choose middle, start, or no truncation according to which portion users recognize while copying the full value.',
      },
    ],
    related: ['anonymized-token', 'id-chip'],
  },
  {
    id: 'data-table',
    title: 'DataTable',
    summary:
      'Use the batteries-included collection engine while keeping URL, fetching, and persistence consumer-owned.',
    sourceStory: 'data-table-guidance.stories.tsx',
    rules: [
      {
        title: 'Reach for the whole engine',
        body: 'Use DataTable when a collection needs coordinated columns, sorting, filtering, selection, pagination, and list chrome.',
      },
      {
        title: 'Capabilities are opt-in',
        body: 'Enable a capability by supplying its configuration; do not render disabled placeholder controls.',
      },
      {
        title: 'The consumer owns state outside the table',
        body: 'The consumer owns URL state, fetching, authorization, and persistence. DataTable owns one TanStack table instance and UI composition.',
      },
      {
        title: 'Use composition seams before wrappers',
        body: 'Use provided toolbar, row, action, and display seams rather than forking the table or rebuilding its coordinated parts.',
      },
      {
        title: 'Do not use DataTable for static layout',
        body: 'Use Table or DescriptionList when there is no interactive collection behavior to coordinate.',
      },
    ],
    related: ['list-header', 'table-pagination'],
  },
  {
    id: 'date-picker',
    title: 'Date picker family',
    summary: 'Choose date inputs by value semantics so timezone conversion is deliberate.',
    sourceStory: 'date-picker-guidance.stories.tsx',
    rules: [
      {
        title: 'Calendar dates are not instants',
        body: 'Use DatePicker for date-only domain values such as birthdays or reporting dates that should not shift by timezone.',
      },
      {
        title: 'Instants include time and zone semantics',
        body: 'Use DateTimePicker for a precise moment such as a scheduled publication or promotion boundary.',
      },
      {
        title: 'Ranges use one coordinated control',
        body: 'Use DateRangePicker when start and end form one domain value and must be validated together.',
      },
    ],
    related: ['date-time'],
  },
  {
    id: 'date-time',
    title: 'DateTime and RelativeTime',
    summary:
      'Render recency relatively and records absolutely, with formatting owned by FormatProvider.',
    sourceStory: 'date-time-guidance.stories.tsx',
    rules: [
      {
        title: 'Recency reads relative; records read absolute',
        body: 'Use RelativeTime when the question is freshness. Use DateTime for financial, legal, scheduled, and audit facts.',
      },
      {
        title: 'Never hand-format a date',
        body: 'Use the molecules so the semantic time element, machine-readable value, locale, and timezone remain consistent.',
      },
      {
        title: 'Formatting comes from FormatProvider',
        body: 'Treat locale and timezone as application context. Pass them per call only for a genuine one-off.',
      },
      {
        title: 'Pin locale and timezone under SSR',
        body: 'Prevent hydration disagreement by making server and client formatting context explicit.',
      },
    ],
    related: ['date-picker', 'money'],
  },
  {
    id: 'description-list',
    title: 'DescriptionList',
    summary: 'Use a description list for labeled facts, not editable values or record collections.',
    sourceStory: 'description-list-guidance.stories.tsx',
    rules: [
      {
        title: 'Facts, tables, and forms are different shapes',
        body: "Use DescriptionList for one entity's labeled facts, Table for repeated records, and Field-based forms for editable values.",
      },
      {
        title: 'Values may compose display molecules',
        body: 'Use Money, DateTime, StatusBadge, CopyableText, and links inside values instead of reimplementing formatting.',
      },
      {
        title: 'Split long detail surfaces by meaning',
        body: 'Group facts into named sections once one list becomes difficult to scan; do not create arbitrary columns only to reduce height.',
      },
    ],
    related: ['form', 'money', 'date-time'],
  },
  {
    id: 'file-dropzone',
    title: 'FileDropzone',
    summary:
      'Standardize local file selection and validation while leaving transport and persistence app-owned.',
    sourceStory: 'file-dropzone-guidance.stories.tsx',
    rules: [
      {
        title: 'The molecule owns local interaction',
        body: 'FileDropzone owns drag-and-drop, file picking, constraints, validation feedback, and removal.',
      },
      {
        title: 'The consumer owns upload lifecycle',
        body: 'Keep authorization, transport, progress, persistence, retry policy, and server errors in the consumer.',
      },
      {
        title: 'State the accepted contract',
        body: 'Make file type, count, and size constraints visible before the user selects a file.',
      },
    ],
  },
  {
    id: 'form',
    title: 'Form composition',
    summary:
      'Compose accessible fields, validation, grouping, and actions independently of the form-state library.',
    sourceStory: 'form-guidance.stories.tsx',
    rules: [
      {
        title: 'Every control has one visible label',
        body: 'Compose FieldLabel and the control with a programmatic association. Placeholder text never replaces a label.',
      },
      {
        title: 'Description teaches; error corrects',
        body: 'Use FieldDescription for stable help and FieldError for actionable validation. Do not swap help text for errors in a way that shifts the layout.',
      },
      {
        title: 'Invalid state belongs to field and control',
        body: 'Mark the Field data-invalid and the control aria-invalid so visual and accessible state agree.',
      },
      {
        title: 'Group by task, not database shape',
        body: "Create short semantic sections, order fields by the user's workflow, and use responsive orientation only when labels remain scannable.",
      },
      {
        title: 'Actions close the form hierarchy',
        body: 'Place one primary submit action last, a neutral cancel beside it, and destructive actions outside the normal save path.',
      },
      {
        title: 'Pending submission preserves context',
        body: 'Disable duplicate submission, communicate progress on the submit action, retain entered values, and surface server errors near the responsible region.',
      },
      {
        title: 'Form state is host-owned',
        body: 'Dashboard extensions use the form APIs exported by @vendure/dashboard. Standalone consumers keep their existing form-state library.',
      },
    ],
    related: ['button', 'confirm-dialog'],
  },
  {
    id: 'id-chip',
    title: 'IdChip',
    summary:
      'Show compact, copyable, non-secret identifiers only where the exact identity helps the task.',
    sourceStory: 'id-chip-guidance.stories.tsx',
    rules: [
      {
        title: 'Identifiers must earn screen space',
        body: 'Use IdChip on detail, support, and diagnostic surfaces where a user needs the exact identifier.',
      },
      {
        title: 'Dense rows already identify the entity',
        body: 'Do not repeat an opaque ID in every table row unless the identifier is itself a primary lookup key.',
      },
      {
        title: 'Secrets are not IDs',
        body: 'Use AnonymizedToken for secret-like values and CopyableText for readable transported values.',
      },
      {
        title: 'Truncate visually, copy completely',
        body: 'Choose truncation by identifier shape while keeping the full value available to copy.',
      },
    ],
    related: ['anonymized-token', 'copyable-text'],
  },
  {
    id: 'list-header',
    title: 'ListHeader',
    summary: 'Use list-page chrome without duplicating PageHeader or the DataTable engine.',
    sourceStory: 'list-header-guidance.stories.tsx',
    rules: [
      {
        title: 'PageHeader still owns the page title',
        body: 'Place PageHeader first. ListHeader owns collection controls and applied filters, not the page heading hierarchy.',
      },
      {
        title: 'Use it outside DataTable',
        body: 'Reach for ListHeader when composing a collection view manually. DataTable already assembles its own coordinated list chrome.',
      },
      {
        title: 'Controls and applied filters have separate zones',
        body: 'Keep search, filter, sort, and view controls together; render the Chip row only when filters are active.',
      },
    ],
    related: ['data-table', 'page-header', 'table-pagination'],
  },
  {
    id: 'money',
    title: 'Money',
    summary: 'Render minor-unit amounts with explicit currency and shared locale context.',
    sourceStory: 'money-guidance.stories.tsx',
    rules: [
      {
        title: 'Amounts enter as minor units',
        body: "Pass the integer amount using the currency's minor units. Do not divide ad hoc at the call site.",
      },
      {
        title: 'Currency is domain data',
        body: 'Take currency from the record or channel context, never from the browser locale.',
      },
      {
        title: 'Locale comes from FormatProvider',
        body: 'Use shared formatting context and override it only for a real one-off.',
      },
      {
        title: 'Tables align amounts for comparison',
        body: 'Right-align monetary columns, use tabular numbers, and render negatives and zero consistently.',
      },
    ],
    related: ['date-time'],
  },
  {
    id: 'multi-select',
    title: 'MultiSelect',
    summary:
      'Choose multi-value controls by option count, search need, and how selected values must read.',
    sourceStory: 'multi-select-guidance.stories.tsx',
    rules: [
      {
        title: 'Use a compact multi-value trigger for bounded sets',
        body: 'Use MultiSelect when several values may be chosen from a managed option set without exposing every checkbox.',
      },
      {
        title: 'Small visible sets may use checkboxes',
        body: 'Prefer a checkbox group when the option set is short and seeing every choice improves the task.',
      },
      {
        title: 'Long sets need search',
        body: 'Use a searchable multi-select or relation selector when scanning the full list is unreasonable.',
      },
      {
        title: 'Summarize large selections',
        body: 'Use a count or domain summary when joined labels would truncate into an unreadable trigger.',
      },
    ],
    related: ['combobox-free-text'],
  },
  {
    id: 'page-header',
    title: 'PageHeader',
    summary: 'State what the view is and place its action hierarchy in one predictable header.',
    sourceStory: 'page-header-guidance.stories.tsx',
    rules: [
      {
        title: 'The title says what this is',
        body: 'Use an entity name or concise page noun, not an instruction or sentence.',
      },
      {
        title: 'At most one primary action',
        body: 'Place one filled Button in the actions slot; step supporting actions down or move them into overflow.',
      },
      {
        title: 'Title-adjacent content describes identity or state',
        body: 'Badges and StatusBadges may sit beside the title. Controls and routine actions do not.',
      },
      {
        title: 'Keep the hierarchy stable on small screens',
        body: 'Allow actions to wrap or collapse without moving the page identity below transient controls.',
      },
    ],
    related: ['button', 'list-header', 'status-badge'],
  },
  {
    id: 'stat-card',
    title: 'StatCard',
    summary: 'Reserve cards for a small set of page-framing KPIs with explicit comparison context.',
    sourceStory: 'stat-card-guidance.stories.tsx',
    rules: [
      {
        title: 'A number must frame the page',
        body: 'Use StatCard for a few KPIs that orient the entire view. Use inline text for local facts and a chart for shape over time.',
      },
      {
        title: 'Every delta names its comparison',
        body: 'State the window or baseline; an isolated percentage is not meaningful.',
      },
      {
        title: 'Tone follows consequence, not arrow direction',
        body: 'An increase can be harmful and a decrease can be healthy. Map the domain meaning before choosing tone.',
      },
      {
        title: 'Avoid walls of cards',
        body: 'Once every fact becomes a StatCard, the hierarchy disappears. Keep the set deliberately small.',
      },
    ],
    related: ['money'],
  },
  {
    id: 'state-views',
    title: 'LoadingState, EmptyState, and ErrorState',
    summary:
      'Render waiting, successful emptiness, and failure as distinct states with the right recovery.',
    sourceStory: 'state-views-guidance.stories.tsx',
    rules: [
      {
        title: 'Ask waiting, empty, or failed in that order',
        body: 'Loading means the answer is in flight, Empty means the request succeeded with nothing, and Error means the system failed.',
      },
      {
        title: 'Empty states teach the first action',
        body: 'Explain what belongs in the region and offer the one concrete action that creates the first item.',
      },
      {
        title: 'Filtered empty recovers the query',
        body: 'When data exists but filters hide it, offer clear filters or a broader search rather than a create action.',
      },
      {
        title: 'Tables own their perimeter',
        body: 'When EmptyState replaces a table body, render it flush and borderless within the table container. Do not add an inset dashed outline.',
      },
      {
        title: 'Errors own the failure',
        body: 'Use ErrorState, take responsibility in the copy, and offer retry only when retry can help.',
      },
      {
        title: 'One illustration, once per region',
        body: 'Use a scenario-matched illustration for a whole empty or error region, never inside populated rows or repeated cards.',
      },
      {
        title: 'Skeleton for known shape; spinner for compact unknown shape',
        body: 'Default to skeletons for tables and detail panes. Use a spinner for compact regions where skeleton rows would misrepresent the result.',
      },
    ],
    related: ['button'],
  },
  {
    id: 'status-badge',
    title: 'StatusBadge and state dictionary',
    summary: 'Map domain states to the six shared tones by consequence for the viewer.',
    sourceStory: 'status-badge-guidance.stories.tsx',
    rules: [
      {
        title: 'Tone follows consequence, not the verb',
        body: 'The same state word can map differently across domains. Build domain-specific state dictionaries rather than a global string map.',
      },
      {
        title: 'Critical means intervene',
        body: 'Reserve critical for failed, blocked, invalid, or service-affecting conditions. User-cancelled terminal states are neutral.',
      },
      {
        title: 'Pending splits by resolver',
        body: 'Human-blocked is warning, system- or time-resolved waiting is neutral, and active execution is progress.',
      },
      {
        title: 'Positive terminal or healthy operating is success',
        body: 'Use success for completed, approved, enabled, healthy, and operating states rather than brand or neutral.',
      },
      {
        title: 'Unknown wire values fall back safely',
        body: 'Use the state dictionary helpers so unknown values remain neutral and warn in development instead of receiving invented color.',
      },
    ],
    choices: [
      { choice: 'neutral', when: 'Inert, terminal without failure, or waiting on system/time.' },
      { choice: 'info', when: 'A noteworthy fact with no positive or negative valence.' },
      { choice: 'success', when: 'Positive terminal, healthy, enabled, or operating.' },
      { choice: 'warning', when: 'Human action is needed or risk is present.' },
      { choice: 'critical', when: 'Failed, blocked, invalid, or service-affecting.' },
      { choice: 'progress', when: 'The system is actively working right now.' },
    ],
    related: ['badge', 'chip'],
  },
  {
    id: 'table-pagination',
    title: 'TablePagination',
    summary:
      'Use the standalone collection footer only when DataTable is not coordinating pagination.',
    sourceStory: 'table-pagination-guidance.stories.tsx',
    rules: [
      {
        title: 'DataTable already owns its footer',
        body: 'Use TablePagination when composing a collection manually; do not add a second pagination system around DataTable.',
      },
      {
        title: 'Capabilities appear only when wired',
        body: 'Hide page-size and navigation controls when the consumer has not provided the state and handlers that make them work.',
      },
      {
        title: 'URL-owned pagination uses links',
        body: 'Use anchor navigation when pages have meaningful URLs and should support browser affordances; use buttons for local state.',
      },
    ],
    related: ['data-table', 'list-header'],
  },
] as const satisfies readonly GuidanceEntry[];

type GuidanceId = (typeof uiGuidance)[number]['id'];

// Keyed by the literal id union so lookups are statically checked and never
// `undefined` under noUncheckedIndexedAccess.
export const uiGuidanceById = Object.fromEntries(
  uiGuidance.map((entry) => [entry.id, entry]),
) as Record<string, GuidanceEntry> as Record<GuidanceId, GuidanceEntry>;
