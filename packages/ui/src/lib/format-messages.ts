import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';

// Every English default text in the library, nested by component. A component
// that gains a text adds its group here; the `FormatMessages` type follows.
// List the new texts in the FormatProvider section of `docs/ui-components.md`.
const defaultMessages = {
  breadcrumb: {
    /** The loading row of a crumb menu, and the pending crumb's status. */
    loading: 'Loading…',
    /** The row of a BreadcrumbSearchMenu that reads the options again. */
    retry: 'Retry',
  },
  codeBlock: {
    copyCode: 'Copy code',
    copied: 'Copied!',
    /** Header of a shell block with no filename and no package-manager tabs. */
    terminal: 'Terminal',
    /** Header of a block with no filename and no language. */
    code: 'Code',
    showLess: 'Show less',
    /** `{count}` is the number of hidden lines, formatted with `FormatProvider`'s `locale`. */
    showMore: 'Show {count} more lines',
  },
  combobox: {
    /** Announced while a page of options loads. */
    loading: 'Loading…',
  },
  comboboxFreeText: {
    /** Announced by the field's spinner while suggestions load. */
    loading: 'Loading…',
  },
  confirmDialog: {
    /** Screen-reader text of the spinner while the confirm action runs. */
    loading: 'Loading',
  },
  copyButton: {
    copy: 'Copy',
    copied: 'Copied',
  },
  loadingState: {
    /** Screen-reader text of the loading region. */
    loading: 'Loading…',
  },
  multiSelect: {
    /** Stands in for the selected values while the options load. */
    loading: 'Loading…',
  },
  passwordInput: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  secretValue: {
    /** Screen-reader text of the spinner while the value loads. */
    loading: 'Loading',
  },
  searchTrigger: {
    label: 'Search',
    /** Added to the accessible name in brackets: "Search (command palette)". */
    commandPalette: 'command palette',
  },
  statCard: {
    /** Read before the delta when it rose; the arrow is visual-only. */
    up: 'up',
    /** Read before the delta when it fell. */
    down: 'down',
    /** Screen-reader text while the value loads (`value={undefined}`). */
    loading: 'Loading value',
  },
  money: {
    /** Screen-reader text while the amount loads (`value={undefined}`). */
    loading: 'Loading amount',
  },
  anonymizedToken: {
    /** Screen-reader text while the token loads (`value={undefined}`). */
    loading: 'Loading token',
  },
  dateTime: {
    /** Screen-reader text while the date loads (`value={undefined}`). */
    loading: 'Loading date',
  },
  relativeTime: {
    /** Screen-reader text while the time loads (`value={undefined}`). */
    loading: 'Loading time',
  },
  elapsedTime: {
    /** Screen-reader text while the start loads (`from={undefined}`). */
    loading: 'Loading duration',
  },
  datePicker: {
    /** Accessible name of the button that clears the date. */
    clear: 'Clear date',
  },
  dateTimePicker: {
    /** Accessible name of the button that clears the date and time. */
    clear: 'Clear date and time',
    /** Accessible name of the time field. */
    time: 'Time',
  },
  dateRangePicker: {
    /** Accessible name of the button that clears the range. */
    clear: 'Clear date range',
  },
  fileDropzone: {
    typeNotAccepted: 'This file type is not accepted.',
    /** `{size}` is the largest allowed size, in the `byte`, `kilobyte` or `megabyte` unit. */
    fileTooLarge: 'File size must be {size} or smaller.',
    /** `{max}` is the file limit. Used when it is more than one. */
    tooManyFiles: 'You can select up to {max} files.',
    /** `{max}` is the file limit. Used when it is one. */
    tooManyFilesOne: 'You can select up to {max} file.',
    /** Shown when `validateFile` throws. */
    validationFailed: 'This file could not be validated.',
    /** Replaces the drop prompt while `validateFile` runs. */
    checking: 'Checking files…',
    /** Placed before the `accept` list. */
    accepted: 'Accepted:',
    /** Accessible name of a file's remove button. `{name}` is the file name. */
    remove: 'Remove {name}',
    /** File size units. The number follows `FormatProvider`'s `locale`. */
    byte: 'B',
    kilobyte: 'KB',
    megabyte: 'MB',
  },
};

type DefaultMessages = typeof defaultMessages;
type MessageGroup = keyof DefaultMessages;

/**
 * The texts an app passes to `FormatProvider`'s `messages`. Every group and
 * every text is optional; a missing one falls back to English. An unknown
 * group or text is a type error.
 */
type FormatMessages = {
  [Group in MessageGroup]?: { [Key in keyof DefaultMessages[Group]]?: string };
};

type ResolvedMessages<Group extends MessageGroup> = {
  [Key in keyof DefaultMessages[Group]]: string;
};

/**
 * The texts of one component, resolved in a fixed order: the component's own
 * label prop (`overrides`) → `FormatProvider`'s `messages` → the English
 * default. Without a provider it returns the English defaults, so it is safe
 * on the server and in tests.
 *
 * ```tsx
 * const t = useMessages('passwordInput', {
 *   showPassword: showPasswordLabel,
 *   hidePassword: hidePasswordLabel,
 * });
 * ```
 */
function useMessages<Group extends MessageGroup>(
  group: Group,
  overrides?: Partial<Record<keyof DefaultMessages[Group], string | undefined>>,
): ResolvedMessages<Group> {
  const fromProvider = useFormatSettings().messages?.[group];
  const resolved = { ...defaultMessages[group] } as Record<string, string>;
  for (const layer of [fromProvider, overrides] as (
    | Record<string, string | undefined>
    | undefined
  )[]) {
    if (!layer) continue;
    for (const [key, text] of Object.entries(layer)) {
      if (text !== undefined) resolved[key] = text;
    }
  }
  return resolved as ResolvedMessages<Group>;
}

export { defaultMessages, useMessages };
export type { FormatMessages };
