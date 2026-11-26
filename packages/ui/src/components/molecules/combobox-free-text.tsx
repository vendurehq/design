'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import {
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
} from '@vendure-io/ui/components/atoms/combobox';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@vendure-io/ui/components/atoms/input-group';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import { cn } from '@vendure-io/ui/lib/utils';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { useMessages } from '../../lib/format-messages.ts';

export interface ComboboxFreeTextItem {
  /**
   * The string committed to `value` when this row is chosen. Must be unique
   * across `items`: it is used as the React key and to resolve a picked row back
   * to its record for `onSelectItem`.
   */
  value: string;
  /** Primary line of the suggestion row. */
  label: string;
  /** Optional secondary line. */
  description?: string;
}

export interface ComboboxFreeTextProps<T extends ComboboxFreeTextItem = ComboboxFreeTextItem> {
  /** The input text — the source of truth. Free-form: it need not match any item. */
  value: string;
  /**
   * Fires on every keystroke and when a suggestion is chosen (with the chosen
   * item's `value`). Always a string — never the item object, because most
   * fires (keystrokes, free text) have no item behind them.
   */
  onValueChange: (value: string) => void;
  /**
   * Fires only when a suggestion is chosen (by click or keyboard) — never on a
   * keystroke or free-text entry, since those have no underlying record. Hands
   * back the full item, so attach extra fields (e.g. an `id`) to your `items`
   * and read them here.
   */
  onSelectItem?: (item: T) => void;
  /**
   * Suggestions for the current input. The caller fetches these — typically
   * debounced against `value` — and they are assumed to be already filtered
   * (the component does no client-side filtering). Items may carry extra fields
   * beyond `value`/`label`/`description`; those flow through to `onSelectItem`.
   *
   * `undefined` means the first fetch has not returned yet: the field shows
   * its spinner and the open list shows a loading row, one suggestion tall.
   * `[]` means there are no suggestions: the list stays closed.
   */
  items: readonly T[] | undefined;
  /**
   * A refetch is running and the current `items` stay on screen. Shows the
   * trailing spinner. For the first load, pass `items={undefined}` instead.
   */
  isLoading?: boolean;
  /**
   * Announced by the spinner while the suggestions load.
   * @default `messages.comboboxFreeText.loading`, "Loading…"
   */
  loadingLabel?: string;
  /** Render a suggestion row. Defaults to `label` over `description`. */
  renderItem?: (item: T) => React.ReactNode;
  /** id forwarded to the input. */
  id?: string;
  /** Form field name of the input. */
  name?: string;
  /** Accessible name of the input, when no visible label points at it. */
  'aria-label'?: string;
  /** Id of the element that names the input. */
  'aria-labelledby'?: string;
  placeholder?: string;
  /** Render the error state (sets `aria-invalid` on the input). */
  invalid?: boolean;
  disabled?: boolean;
  /** Class applied to the input container. */
  className?: string;
}

function defaultRenderItem(item: ComboboxFreeTextItem): React.ReactNode {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate">{item.label}</span>
      {item.description ? (
        <span className="text-muted-foreground truncate text-xs">{item.description}</span>
      ) : null}
    </div>
  );
}

/**
 * A text input with debounced, server-driven suggestions where free text wins:
 * pick a suggestion to commit its value, or keep typing and your text is the
 * value. A choice is never forced — Enter, blur and no-match all keep the text.
 *
 * Built on Base UI's `Autocomplete` (the free-text primitive — `selectionMode`
 * is fixed to `none` and the input value is the source of truth), not the
 * pick-only `Combobox`. `mode="none"` keeps suggestions static (no client-side
 * filtering, since the caller pre-filters server-side) and disables
 * inline-autocompletion. Fetching, debounce and validation live with the caller.
 */
function ComboboxFreeText<T extends ComboboxFreeTextItem = ComboboxFreeTextItem>({
  value,
  onValueChange,
  onSelectItem,
  items,
  isLoading,
  loadingLabel,
  renderItem = defaultRenderItem,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  placeholder,
  invalid,
  disabled,
  className,
}: ComboboxFreeTextProps<T>) {
  // Base UI opens the popup on every keystroke; we only want it open when there
  // is something pickable, so a no-match closes it silently instead of flashing
  // an empty box. `open` tracks the user's intent (typing, Escape, blur,
  // select) and we AND it with "items present" to derive the rendered state.
  // While the first fetch runs (`items` undefined) the list opens on its
  // loading row, so the field shows that suggestions are coming.
  const [open, setOpen] = React.useState(false);
  const t = useMessages('comboboxFreeText', { loading: loadingLabel });
  const firstLoad = items === undefined;
  // The list lines up with the whole field, as a Combobox list does. Anchored
  // to the input, it would widen when the trailing spinner goes away.
  const fieldRef = React.useRef<HTMLDivElement>(null);

  return (
    <Autocomplete.Root
      mode="none"
      autoHighlight={false}
      value={value}
      onValueChange={(next, details) => {
        // Call onValueChange before onSelectItem so a record captured in the
        // latter survives any reset the value handler performs.
        onValueChange(next);
        // `item-press` is the only reason a row selection (mouse or keyboard)
        // drives a value change; keystrokes and free text use other reasons.
        // The literal is checked against Base UI's public `reason` union, so a
        // future rename surfaces as a type error rather than silent breakage.
        if (onSelectItem && details.reason === 'item-press') {
          const picked = items?.find((i) => i.value === next);
          if (picked) {
            onSelectItem(picked);
          }
        }
      }}
      open={open && (firstLoad || items.length > 0)}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <InputGroup ref={fieldRef} className={cn('w-full', className)}>
        <Autocomplete.Input
          render={<InputGroupInput />}
          id={id}
          name={name}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          // Base UI only requests open on a keystroke; for pick-or-create
          // fields the suggestions should also show on focus/click so a small
          // known option set is discoverable without typing. The gate on
          // `open` keeps an empty popup from flashing when there is nothing
          // to pick.
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          // Enter has a local meaning here — commit the highlighted suggestion
          // or keep the typed text — so it must never double as the browser's
          // implicit form submission (Base UI deliberately lets Enter fall
          // through to submit when nothing is highlighted). preventDefault
          // cancels only the native submit; Base UI's own Enter handling runs
          // regardless, since merged handlers ignore defaultPrevented.
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
            }
          }}
        />
        {isLoading || firstLoad ? (
          <InputGroupAddon align="inline-end">
            {/* Decorative: the status below announces the load. */}
            <Spinner role={undefined} aria-label={undefined} aria-hidden />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {/* Stays mounted, so screen readers announce the change: a status
          that mounts with its text is not reliably read. */}
      <Autocomplete.Status data-slot="combobox-free-text-status" className="sr-only">
        {isLoading || firstLoad ? t.loading : null}
      </Autocomplete.Status>
      <ComboboxContent anchor={fieldRef}>
        <ComboboxList aria-busy={isLoading || firstLoad || undefined}>
          {firstLoad ? (
            // Decorative: the status announces the load. One
            // suggestion row tall (the ComboboxItem height), so a single
            // one-line suggestion takes its place without a jump.
            <div
              data-slot="combobox-free-text-loading"
              aria-hidden="true"
              className="text-muted-foreground flex min-h-8.5 items-center justify-center"
            >
              <Loader2Icon className="size-4 motion-safe:animate-spin" />
            </div>
          ) : (
            items.map((item) => (
              <ComboboxItem key={item.value} value={item.value}>
                {renderItem(item)}
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Autocomplete.Root>
  );
}

export { ComboboxFreeText };
