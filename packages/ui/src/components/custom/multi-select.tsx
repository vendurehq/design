'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vendure-io/ui/components/ui/select';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

type ItemValue = string | number;

/**
 * Describes how to read a piece of data off an item. Pass a property key for
 * the common case, or a function for full control.
 */
type Accessor<T, R> = keyof T | ((item: T) => R);

function resolveAccessor<T, R>(item: T, accessor: Accessor<T, R>): R {
  return typeof accessor === 'function' ? accessor(item) : (item[accessor] as unknown as R);
}

export interface MultiSelectProps<T> {
  /** The list of options to choose from. */
  items: readonly T[];
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
   * to the selected labels joined with commas.
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

  const itemByValue = React.useMemo(() => {
    const map = new Map<ItemValue, T>();
    for (const item of items) {
      map.set(getValue(item), item);
    }
    return map;
  }, [items, getValue]);

  return (
    <Select
      multiple
      value={value as ItemValue[] | undefined}
      defaultValue={defaultValue as ItemValue[] | undefined}
      onValueChange={(nextValue: ItemValue[]) => onValueChange?.(nextValue)}
      disabled={disabled}
      name={name}
      required={required}
    >
      {/* [vendure] default to a stable, container-width trigger so it doesn't grow with the
          selection — the underlying SelectTrigger is `w-fit`, which we override here. */}
      <SelectTrigger
        id={id}
        size={size}
        className={cn('w-full', className)}
        aria-invalid={invalid || undefined}
      >
        <SelectValue placeholder={placeholder}>
          {(selected: ItemValue[]) => {
            const selectedItems = (selected ?? [])
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
      <SelectContent className={contentClassName}>
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
      </SelectContent>
    </Select>
  );
}

export { MultiSelect };
