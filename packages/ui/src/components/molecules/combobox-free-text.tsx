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
import * as React from 'react';

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
   */
  items: readonly T[];
  /** Async state of the suggestion source. Shows a trailing spinner while true. */
  loading?: boolean;
  /** Render a suggestion row. Defaults to `label` over `description`. */
  renderItem?: (item: T) => React.ReactNode;
  /** id forwarded to the input. */
  id?: string;
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
  loading = false,
  renderItem = defaultRenderItem,
  id,
  placeholder,
  invalid,
  disabled,
  className,
}: ComboboxFreeTextProps<T>) {
  // Base UI opens the popup on every keystroke; we only want it open when there
  // is something pickable, so a no-match closes it silently instead of flashing
  // an empty box. `open` tracks the user's intent (typing, Escape, blur,
  // select) and we AND it with "items present" to derive the rendered state.
  const [open, setOpen] = React.useState(false);

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
          const picked = items.find((i) => i.value === next);
          if (picked) {
            onSelectItem(picked);
          }
        }
      }}
      open={open && items.length > 0}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <InputGroup className={cn('w-full', className)}>
        <Autocomplete.Input
          render={<InputGroupInput />}
          id={id}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
        />
        {loading ? (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <ComboboxContent>
        <ComboboxList>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {renderItem(item)}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Autocomplete.Root>
  );
}

export { ComboboxFreeText };
