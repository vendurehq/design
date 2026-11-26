'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vendure-io/ui/components/atoms/select';
import { SkeletonLine } from '@vendure-io/ui/components/molecules/state-views/skeleton-parts';
import { cn } from '@vendure-io/ui/lib/utils';
import { Loader2Icon } from 'lucide-react';
import * as React from 'react';
import { isDevelopment } from '../../lib/env.ts';
import { useMessages } from '../../lib/format-messages.ts';

type ItemValue = string | number;

/**
 * Describes how to read a piece of data off an item. Pass a property key — only
 * keys whose value is assignable to `R` are allowed — or a function for full control.
 */
type AccessorKey<T, R> = { [K in keyof T]-?: T[K] extends R ? K : never }[keyof T];
type Accessor<T, R> = AccessorKey<T, R> | ((item: T) => R);

function resolveAccessor<T, R>(item: T, accessor: Accessor<T, R>): R {
  return typeof accessor === 'function' ? accessor(item) : (item[accessor] as R);
}

export interface MultiSelectProps<T> {
  /**
   * The list of options to choose from. `undefined` means the options are
   * still loading: a selected value shows as a skeleton in the trigger (its
   * label is not known yet), and the open list shows a loading row, one
   * option tall. `[]` means there are no options.
   */
  items: readonly T[] | undefined;
  /**
   * Announced while `items` is `undefined`.
   * @default `messages.multiSelect.loading`, "Loading…"
   */
  loadingLabel?: string;
  /**
   * How to render each option's label. Pass a property key for the common case
   * (`itemToLabel="name"`), or a function for full control
   * (`itemToLabel={(item) => <Flag code={item.code} />}`).
   * @default String(item)
   */
  itemToLabel?: Accessor<T, React.ReactNode>;
  /**
   * How to derive the stable value stored in state for each option. Pass a
   * property key (`itemToValue="id"`) or a function. Required when items are
   * objects; for string/number items it defaults to the item itself.
   */
  itemToValue?: Accessor<T, ItemValue>;
  /** Selected values. Use for controlled usage. */
  value?: readonly ItemValue[];
  /** Initially selected values for uncontrolled usage. */
  defaultValue?: readonly ItemValue[];
  /** Called with the next array of selected values whenever the selection changes. */
  onValueChange?: (value: ItemValue[]) => void;
  /** Text shown in the trigger when nothing is selected. */
  placeholder?: React.ReactNode;
  /**
   * Override how the selected options are summarised in the trigger. Defaults
   * to the selected labels joined with commas. Provide this when `itemToLabel`
   * renders multi-line content, so the trigger stays a single, non-growing line.
   */
  renderValue?: (selectedItems: T[]) => React.ReactNode;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Render the error state (sets `aria-invalid` on the trigger). */
  invalid?: boolean;
  /** Trigger height. */
  size?: 'sm' | 'default';
  /** Class applied to the trigger. Defaults to a full-width, non-growing trigger; pass e.g. `w-[260px]` to fix the width. */
  className?: string;
  /** Class applied to the dropdown content. */
  contentClassName?: string;
  /** Form field name for the hidden inputs base-ui renders for each value. */
  name?: string;
  /** Whether a selection is required for form submission. */
  required?: boolean;
  /** id forwarded to the trigger. */
  id?: string;
}

function MultiSelect<T>({
  items,
  loadingLabel,
  itemToLabel = String as unknown as Accessor<T, React.ReactNode>,
  itemToValue,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Select…',
  renderValue,
  disabled,
  invalid,
  size = 'default',
  className,
  contentClassName,
  name,
  required,
  id,
}: MultiSelectProps<T>) {
  const getValue = React.useCallback(
    (item: T): ItemValue =>
      itemToValue == null ? (item as unknown as ItemValue) : resolveAccessor(item, itemToValue),
    [itemToValue],
  );
  const getLabel = React.useCallback(
    (item: T): React.ReactNode => resolveAccessor(item, itemToLabel),
    [itemToLabel],
  );

  const t = useMessages('multiSelect', { loading: loadingLabel });
  const isLoading = items === undefined;

  const itemByValue = React.useMemo(() => {
    const map = new Map<ItemValue, T>();
    for (const item of items ?? []) {
      const itemValue = getValue(item);
      if (isDevelopment) {
        if (typeof itemValue !== 'string' && typeof itemValue !== 'number') {
          console.warn(
            'MultiSelect: `itemToValue` must resolve to a string or number. When `items` are ' +
              'objects, pass `itemToValue` (e.g. itemToValue="id") so the selection survives the ' +
              'items array being recreated.',
          );
        } else if (map.has(itemValue)) {
          console.warn(
            `MultiSelect: duplicate item value ${JSON.stringify(itemValue)} — each item must ` +
              'resolve to a unique `itemToValue`; later items override earlier ones.',
          );
        }
      }
      map.set(itemValue, item);
    }
    return map;
  }, [items, getValue]);

  return (
    <Select
      multiple
      value={value as ItemValue[] | undefined}
      defaultValue={defaultValue as ItemValue[] | undefined}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      required={required}
    >
      {/* Default to a stable, container-width trigger so it doesn't grow with the
          selection — the underlying SelectTrigger is `w-fit`, which we override here. */}
      <SelectTrigger
        id={id}
        size={size}
        className={cn('w-full', className)}
        aria-invalid={invalid || undefined}
        aria-busy={isLoading || undefined}
      >
        <SelectValue placeholder={placeholder}>
          {(selected: ItemValue[]) => {
            // The labels of the selected values come with the options. Until
            // then a skeleton holds their place: the raw values are ids, not
            // text a person reads. With nothing selected, the placeholder is
            // already right.
            if (isLoading && selected.length > 0) {
              return (
                <>
                  <SkeletonLine data-slot="multi-select-value-skeleton" className="w-24" />
                  <span className="sr-only">{t.loading}</span>
                </>
              );
            }
            const selectedItems = selected
              .map((v) => itemByValue.get(v))
              .filter((item): item is T => item !== undefined);
            if (selectedItems.length === 0) return placeholder;
            if (renderValue) return renderValue(selectedItems);
            return selectedItems.map((item, index) => (
              <React.Fragment key={getValue(item)}>
                {index > 0 ? ', ' : null}
                {getLabel(item)}
              </React.Fragment>
            ));
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className={contentClassName} aria-busy={isLoading || undefined}>
        {isLoading ? (
          // Decorative: a listbox holds only options and groups, and the
          // trigger is already busy. One option tall (the SelectItem height).
          <div
            data-slot="multi-select-loading"
            aria-hidden="true"
            className="text-muted-foreground flex min-h-8.5 items-center justify-center"
          >
            <Loader2Icon className="size-4 motion-safe:animate-spin" />
          </div>
        ) : (
          <SelectGroup>
            {items.map((item) => {
              const itemValue = getValue(item);
              return (
                <SelectItem key={itemValue} value={itemValue}>
                  {getLabel(item)}
                </SelectItem>
              );
            })}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}

export { MultiSelect };
