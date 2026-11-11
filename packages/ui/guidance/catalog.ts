import type { GuidanceEntry } from './types.ts';

export const uiGuidance = [
  {
    id: 'alert',
    title: 'Alert',
    summary: 'Use one Alert for a page or region notice, toned by its consequence for the viewer.',
    sourceStory: 'alert-guidance.stories.tsx',
    rules: [
      {
        title: 'Tone follows consequence',
        body: '`warning` means the user must act or a risk exists; `info` is a fact worth noticing with no valence; `destructive` is a failure. Tone follows consequence, as in the state dictionary.',
      },
      {
        title: 'Tone is not volume',
        body: 'Never use a tone to make a routine notice louder. A routine notice stays `default`.',
      },
      {
        title: 'A page notice is one Alert',
        body: 'Use the Alert variant for the tone. Do not wrap Alert to hand-color its icon or stack several Alerts for one notice.',
      },
      {
        title: 'A toned Alert carries its tone icon',
        body: 'Put the tone icon first in every `warning`, `info` and `destructive` Alert: TriangleAlert, Info or CircleAlert. The faint tint alone is not enough cue, and the warning tint is never the only cue.',
      },
      {
        title: 'Actions go in AlertAction',
        body: 'Put buttons in AlertAction with `size="sm"` or `size="xs"`, so they fit the first line of text. Do not place actions in a row under AlertDescription; a narrow Alert moves AlertAction under the text itself.',
      },
    ],
    choices: [
      { choice: 'default', when: 'A routine notice with no consequence attached.' },
      { choice: 'info', when: 'A fact worth noticing, with no positive or negative valence.' },
      { choice: 'warning', when: 'The user must act, or a risk exists.' },
      { choice: 'destructive', when: 'Something failed.' },
    ],
    related: ['status-badge'],
  },
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
      {
        title: 'Value on the client, not loaded on request',
        body: 'Use AnonymizedToken when the full value is already on the client. When the server returns the value only on request, use SecretValue.',
      },
    ],
    related: ['copyable-text', 'id-chip', 'secret-value'],
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
    id: 'arrow-link',
    title: 'ArrowLink',
    summary:
      'Link to a page with more of what the user is looking at, at the end of the region it extends.',
    sourceStory: 'arrow-link-guidance.stories.tsx',
    rules: [
      {
        title: 'Navigation, never an action',
        body: 'Use ArrowLink to go to more of the same subject: the full list, the detail page, the logs. An action that changes data is a Button.',
      },
      {
        title: 'One per region, at the end',
        body: 'A panel head, card or notice has at most one ArrowLink, at the inline end. The label names the destination in two or three words.',
      },
      {
        title: 'Not inside running text',
        body: 'A link inside a sentence or a form is `Button variant="link" size={null}` or a plain anchor; a chevron there breaks the sentence. `size={null}` drops the button height and padding, so the link sits on the line of the text.',
      },
    ],
    related: ['button'],
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
        body: 'Use CodeBlock for multi-line code the reader studies or copies whole. Use CopyableText for single values users move elsewhere, and InlineCode for references inside prose.',
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
    id: 'collapsible-section',
    title: 'CollapsibleSection',
    summary:
      'Keep one secondary list of rows behind a header that still says how many rows it holds.',
    sourceStory: 'collapsible-section-guidance.stories.tsx',
    rules: [
      {
        title: 'Collapse what can wait',
        body: 'Use CollapsibleSection for a secondary list on its own card. Rows that are the reason the user came to the page stay open on a plain card.',
      },
      {
        title: 'Do not collapse a single row',
        body: 'A closed section with one row costs a click to save one line. Show the row on a plain card.',
      },
      {
        title: 'Open by default when a row needs the user',
        body: 'Start closed when the rows are routine. When a row has failed or waits on the user, pass `defaultOpen` so the problem is in view.',
      },
      {
        title: 'Tone means action, not volume',
        body: '`tone="warning"` colours the count for rows that wait on the user. `tone="critical"` colours it for rows that have failed. Never use a tone because the count is high.',
      },
      {
        title: 'Name the rows that matter in the detail',
        body: 'When some rows have failed, pass `detail` ("1 failed") with `tone="critical"`. The tone then colours the detail only and the count stays muted: "2 · 1 failed".',
      },
    ],
    choices: [
      { choice: 'CollapsibleSection', when: 'One secondary list of rows on a card, with a count.' },
      { choice: 'Accordion', when: 'A set of peer panels of prose or form content.' },
      { choice: 'Collapsible', when: 'A bare disclosure that is not a card of rows.' },
    ],
    related: ['list-row'],
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
      {
        title: 'Hold confirm until the consequence is known',
        body: 'When the dialog loads what the action affects, set confirmDisabled until it has loaded and give a short confirmDisabledReason. Keep cancel available. Do not rebuild the dialog from AlertDialog atoms to do this.',
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
        title: 'A row you render yourself takes the ripple',
        body: 'Select all and clear all ripple down the rows. A row returned from renderRow joins in when it merges ctx.ripple: ctx.ripple.className into its className, and ctx.ripple.style spread before its own style (it holds only custom properties, so a drag transform never collides). Set data-state="selected" while the row is selected. A row that ignores ctx.ripple changes at once.',
      },
      {
        title: 'Shape loading rows like loaded rows',
        body: 'The default loading cell is one text line tall, so one-line columns need nothing. When a cell is taller than one line (a title over a sub-line, an avatar), pass skeletonCells for its column, stacking one DataTableSkeletonLine per text line, so the loading rows keep the loaded row height and the table does not jump.',
      },
      {
        title: 'A row that opens an item opens it from any point',
        body: 'Wrap the item name in DataTableRowLink (pass href, or render a router link). Its link stretches over the row, so the row has one tab stop and one name, and a chevron appears at the row end on hover or keyboard focus. Do not add a chevron after the name, and do not use a row click handler. Buttons, links, inputs, Tooltip triggers, the select checkbox and copy chips stay clickable above it; mark any other control with data-table-row-control. When the row name is a lookup key, see IdChip: the link holds the key as sr-only text beside a row-reveal chip.',
      },
      {
        title: 'Cell text lines up with the header',
        body: 'Badge, StatusBadge, Button and IdChip set --content-inset, the distance from their box to their first letter, and a DataTable cell pulls its first element back by it. Do not add per-column offsets. Mark a leading icon with data-icon="inline-start". Custom styled content sets --content-inset on the element that starts the cell.',
      },
      {
        title: 'The first column names the row',
        body: 'Start the table with the column that names the row (title, name, key). Put the status column directly after it, as a StatusBadge with appearance="icon". Do not lead with a status, a badge or a count.',
      },
      {
        title: 'No chip or badge in the first or last column',
        body: 'A chip or badge (Badge, StatusBadge chip, Chip) is never in the first or the last column of a table or list: it would sit against the edge of the list. Show the name as plain text first, and the status after it as an icon and a label. This holds for a card or list inside a bordered container too.',
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
      {
        title: 'The other form is a tooltip, not a title',
        body: 'RelativeTime shows the absolute time in a DS Tooltip on hover and always carries it as its accessible description. Add focusable where keyboard users need the exact time; never inside a link, a button or other interactive content. Set tooltip={false} inside another tooltip trigger. Never use a native title. Where the exact time is the point, use DateTime.',
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
        body: 'Mark the Field data-invalid. Field then sets aria-invalid on its control and links FieldDescription and FieldError through aria-describedby, so visual and accessible state agree. Do not pass these ids by hand.',
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
        body: 'Choose truncation by identifier shape while keeping the full value available to copy. The tooltip of a copyable chip says only Copy, then Copied: the chip shows the start and end, and a click copies all of it. A shortened chip without copy shows the full value in a DS Tooltip, never a native title.',
      },
      {
        title: 'Name what the button copies',
        body: 'Pass a short copyLabel (for example "Copy commit") when several chips share a surface. Leave the value out: the tooltip shows the label alone, and the copy button adds the shown text to its name. Handle a failed copy with onCopyError or a CopyFeedbackProvider. Do not rebuild the chip to change its label.',
      },
      {
        title: 'The whole chip copies',
        body: 'A click anywhere on a copyable chip copies the full value, and the tooltip changes from Copy to Copied. Do not put an IdChip inside a link or a clickable cell that does something else.',
      },
      {
        title: 'A lookup key in a list column reveals on row hover',
        body: 'When a list column holds a lookup key such as a SKU, pass reveal="row": the value reads as plain text until its group/row row is hovered or focused. DataTable and ListRow rows keep a copy chip above their stretched row link, so it copies and does not open the row.',
      },
      {
        title: 'A lookup key that names the row is still a chip',
        body: 'When the lookup key is also the row\'s name (an order code), show it as an IdChip with reveal="row" and keep the DataTableRowLink in the same cell with the key as sr-only text. The row keeps one link named by the key and its end chevron. A click on the chip copies; a click anywhere else on the row opens the item.',
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
    id: 'list-row',
    title: 'ListRow',
    summary:
      'Render a short list of entities where each row opens one detail page from any point of the row.',
    sourceStory: 'list-row-guidance.stories.tsx',
    rules: [
      {
        title: 'Rows to open, columns to compare',
        body: 'Use ListRow for a short list the user scans and opens one row of. Use DataTable when the user sorts, filters, pages, selects in bulk, or compares values across rows.',
      },
      {
        title: 'One link per row, over the whole row',
        body: 'Put exactly one ListRowLink in a row. It stretches over the row, so the row has one tab stop and one name. Never make one cell the only link.',
      },
      {
        title: 'A row without a page gets no link',
        body: 'When the row opens nothing, use ListRowTitle and leave out ListRowChevron. No hover fill, no pointer.',
      },
      {
        title: 'The link holds the title only',
        body: 'The link text is the accessible name of the row. Put who, how many, and how long in ListRowMeta, and state in a StatusBadge in ListRowTrailing.',
      },
      {
        title: 'Controls stay above the link',
        body: 'Buttons, menus, links, Tooltip triggers, IdChip, and CopyableText inside the row keep their own click. Another element that must stay hoverable takes `data-list-row-control`.',
      },
      {
        title: 'Hidden actions are never the only way',
        body: 'ListRowActions appears on hover or focus. Every action in it is also available on the detail page.',
      },
      {
        title: 'Group rows under a heading, not in a wrapper',
        body: 'To group rows by day or kind, put a ListRowGroupHeading before each group, as a sibling of the rows. It takes the rule above, and the first row under it drops its own. Do not wrap a group in its own element: the heading then loses its rule.',
      },
      {
        title: 'Only rows added later animate',
        body: 'Set enter="new" on a row the user just created, and enter={{ stagger: n }} (n = 0, 1, 2…) on rows that a "Show older" action adds. Rows of the first render take no enter, so the list does not animate on page load.',
      },
    ],
    related: ['collapsible-section', 'data-table', 'id-chip', 'status-badge'],
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
    id: 'popover',
    title: 'Popover',
    summary:
      'A popover holds content the user reads or edits next to its trigger. It opens toward the centre of the screen by itself.',
    sourceStory: 'popover-guidance.stories.tsx',
    rules: [
      {
        title: 'Do not set align unless there is a reason',
        body: 'Without an align, PopoverContent opens toward the centre of the screen: a trigger in the right half lines the popover up with its right edge, a trigger in the left half with its left edge. Set align only to pin one edge for a reason of the layout, such as a popover that must line up with a field. An explicit align always wins. align="center" brings back the old look, centred on the trigger.',
      },
    ],
    related: ['tooltip'],
  },
  {
    id: 'progress',
    title: 'Progress',
    summary:
      'Show task completion or usage against a limit, toned only when the level has a consequence.',
    sourceStory: 'progress-guidance.stories.tsx',
    rules: [
      {
        title: 'Tone follows consequence, not fill level alone',
        body: 'A usage meter turns `warning` near a limit the user must act on and `critical` at or over it. A task progress bar stays `default`.',
      },
      {
        title: 'Tone never carries the value alone',
        body: 'Pair a toned bar with ProgressValue or text that states the amount and the limit.',
      },
      {
        title: 'One bar per measure',
        body: 'Use Progress with a value for a meter. Do not draw segmented or hand-colored meters.',
      },
      {
        title: 'Indeterminate when the length is unknown',
        body: 'Pass `value={null}` when the work has no measurable progress, such as a build. Do not invent a percentage or loop a fake value.',
      },
      {
        title: 'One bar per step of a pipeline',
        body: 'A done step is `success` at 100, a failed step `critical` at 100, the running step `progress` with `value={null}`, and a step that has not started `default` at 0. A step that stopped and needs nothing from the user is `neutral` at 100.',
      },
    ],
    choices: [
      { choice: 'default', when: 'Task progress, or a meter with no limit the user must act on.' },
      { choice: 'progress', when: 'The running step of a pipeline. It fills in the info colour.' },
      {
        choice: 'info',
        when: 'A level worth noting that is neither good nor bad. Running work is `progress`.',
      },
      {
        choice: 'success',
        when: 'A meter whose filled level is the healthy outcome, or a done step.',
      },
      { choice: 'warning', when: 'Near a limit the user must act on.' },
      { choice: 'critical', when: 'At or over the limit, or a failed step.' },
      {
        choice: 'neutral',
        when: 'A step that stopped and needs nothing from the user, such as a cancelled one.',
      },
    ],
    related: ['status-badge', 'stat-card'],
  },
  {
    id: 'secret-value',
    title: 'SecretValue',
    summary:
      'Show a secret that the server returns only on request as a fixed mask, loaded and revealed by a click.',
    sourceStory: 'secret-value-guidance.stories.tsx',
    rules: [
      {
        title: 'Loaded on request, not on the client',
        body: 'Use SecretValue when the server returns the value only on request, such as an environment variable value. When the full value is already on the client, use AnonymizedToken.',
      },
      {
        title: 'Reveal is a click, never hover',
        body: 'Each load is a server read that may be audited. Load and reveal only on a click of the reveal button, never on hover or focus.',
      },
      {
        title: 'The consumer owns the fetch',
        body: 'Pass loadValue. SecretValue owns the hidden, loading, revealed and error states. Do not fetch every secret up front to fill a value.',
      },
      {
        title: 'Hide clears the value',
        body: 'Hiding drops the loaded value from state. Copy while hidden loads the value and copies it without revealing it.',
      },
      {
        title: 'The value never goes in a title or label',
        body: 'The value is visible text only after a deliberate reveal. Never put it in a title, an accessible label or a tooltip.',
      },
    ],
    related: ['anonymized-token', 'copyable-text'],
  },
  {
    id: 'sidebar',
    title: 'Sidebar',
    summary:
      "For the current page, exactly one icon in the sidebar takes the active colour: the current item's own icon, or its group's icon.",
    sourceStory: 'sidebar-guidance.stories.tsx',
    rules: [
      {
        title: 'One icon shows the current page',
        body: "If the current item has its own icon, only that icon takes the active colour and its group's icon stays neutral. If the current item has no icon, its group's icon takes it. In the icon rail the nested items are hidden, so the group's icon takes it.",
      },
      {
        title: 'Set hasActiveChild on every group that holds the current page',
        body: "Pass `hasActiveChild` to SidebarMenuButton whenever one of the group's items is the current page, with or without an icon on that item. Do not work out whether the item has an icon: SidebarMenuSubButton and SidebarMenuButton pick the one icon together. Set `isActive` on the nested SidebarMenuSubButton as well.",
      },
      {
        title: 'A closed group still lights its icon',
        body: 'Keep `hasActiveChild` on a group whose nested items are not mounted: its icon is then the one that takes the active colour.',
      },
      {
        title: 'The group gets no fill and no bar',
        body: '`hasActiveChild` changes the icon only. Use `isActive` for an item that is itself the current page; it also gets the fill and the bar. Never set both on one button.',
      },
    ],
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
        body: 'When EmptyState or ErrorState replaces a table body, it renders flush within the table container: neither draws a box by default. Do not add an inset dashed outline; pass bordered only for a drop zone.',
      },
      {
        title: 'Compact for small panels',
        body: 'Use size="compact" inside a panel smaller than about 240px tall or a side column. Use the full state for a page region or a table body. Compact keeps a title, a description and at most one action, and sits flush. An icon is optional and renders bare, as in the full state.',
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
      {
        title: 'Pick the appearance by the room it has',
        body: 'Use the default chip for a status that stands alone (size="lg" beside a page title). Inside a tinted or accent surface, use appearance="bare": the icon and tinted label without the box, never a chip inside a coloured card. A status that every row of a table or list shows uses appearance="icon": the tone icon and a neutral label. Never plain coloured text (appearance="text") in a column. Use dot for a group of chips that is not a column, and icon={false} only for an inline chip whose label already names the tone. Use appearance="dot" only where no word fits, and still pass the label: it stays as screen-reader text.',
      },
      {
        title: 'Status comes after the name, never at an edge',
        body: 'In a table or list the name comes first and the status directly after it. A StatusBadge chip is never in the first or the last column: it would sit against the edge of the list.',
      },
      {
        title: 'A status column is an icon and a label, with the icon in its tone colour',
        body: 'Do: when every row of a table shows a status, use appearance="icon" on every row: the tone icon with no box, then the label in neutral text. The icon keeps its tone colour for every state, green for success included; only the label is neutral. Example: a deployments table shows Ready with a green icon, Failed with a red icon, Building with a blue spinner. Don\'t: plain coloured text (appearance="text") in a column, a grey icon for a healthy state, or a coloured label.',
      },
      {
        title: 'A chip marks only the exception',
        body: 'Do: a chip or badge signals importance, so use its colour sparingly: put a chip only on the exception that needs attention, and show nothing for the normal state, when the normal state is far more common. Example: a products list shows no mark on an enabled product and a "Disabled" chip on a disabled one. Don\'t: a chip on every row, or a chip for the normal state. A table where every row has a status uses the icon and label instead.',
      },
      {
        title: 'The second line holds one time',
        body: 'Pass detail for a second line under the label, with the one time that matters for the state: an ElapsedTime that counts up for a state that is happening ("1m 15s") or waiting ("Waiting 9m 07s"), a RelativeTime for when it finished ("2 minutes ago", "yesterday"), and how long a state that continues has lasted ("for 13 days"). Make the time a tab stop with a Tooltip that shows the exact finish time, the start and the duration, so the table needs no Duration or Created column.',
      },
      {
        title: 'The chip brings its own icon',
        body: 'Each tone shows its own icon, and progress always spins. Never put an icon in children: pass a more exact shape as icon={<Icon />}.',
      },
      {
        title: 'Quiet normal, loud abnormal in a list column',
        body: 'When most rows of a list column share one normal state (Enabled, Public), pass reveal="row" for that state only: its badge shows while its group/row row is hovered or focused, and the other states always show. The consumer decides which state is normal.',
      },
      {
        title: 'A state explains itself in a tooltip',
        body: 'To say why a state is what it is (which service is degraded, since when), render the StatusBadge as the TooltipTrigger: <TooltipTrigger render={<StatusBadge …/>} />. The badge then becomes a tab stop with the focus ring, and a chip takes the hover fill. Do not wrap it in a Button. A lone dot never opens a tooltip.',
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
  {
    id: 'tooltip',
    title: 'Tooltip',
    summary:
      'A tooltip names a control or adds a short hint. Anything longer goes on the page or in a Popover.',
    sourceStory: 'tooltip-guidance.stories.tsx',
    rules: [
      {
        title: 'A short hint, at most 320px',
        body: 'A tooltip is a short hint or a label, never wider than 320px. Nothing widens it: a max-w class on TooltipContent is dropped. It holds no values to read in full, no paragraphs and no controls, because nobody can select or click inside it. Put longer content on the page or in a Popover.',
      },
      {
        title: 'One TooltipProvider for the app',
        body: 'Wrap the app in one TooltipProvider. The first tooltip then waits 600ms, so a pointer passing over a trigger opens nothing, and once a tooltip is open the next ones open at once with no animation. Do not set a delay per tooltip. Without a provider every tooltip still waits 600ms, but the next one does not open at once.',
      },
    ],
    related: ['id-chip', 'status-badge'],
  },
] as const satisfies readonly GuidanceEntry[];

type GuidanceId = (typeof uiGuidance)[number]['id'];

// Keyed by the literal id union so lookups are statically checked and never
// `undefined` under noUncheckedIndexedAccess.
export const uiGuidanceById = Object.fromEntries(
  uiGuidance.map((entry) => [entry.id, entry]),
) as Record<string, GuidanceEntry> as Record<GuidanceId, GuidanceEntry>;
