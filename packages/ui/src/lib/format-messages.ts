import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';

// Every English default text in the library, nested by component. A component
// that gains a text adds its group here; the `FormatMessages` type follows.
// List the new texts in the FormatProvider section of `docs/ui-components.md`.
const defaultMessages = {
  copyButton: {
    copy: 'Copy',
    copied: 'Copied',
  },
  passwordInput: {
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  searchTrigger: {
    label: 'Search',
    /** Added to the accessible name in brackets: "Search (command palette)". */
    commandPalette: 'command palette',
  },
  money: {
    /** Screen-reader text while the amount loads (`value={undefined}`). */
    loading: 'Loading amount',
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
