'use client';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@vendure-io/ui/components/atoms/combobox';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

interface EntityComboboxItem {
  value: string;
  label: string;
  description?: React.ReactNode;
  keywords?: readonly string[];
  disabled?: boolean;
}

interface SharedEntityComboboxProps<T extends EntityComboboxItem> {
  items: readonly T[];
  /** Supply for server-filtered lists when the current selection is not in `items`. */
  selectedItems?: readonly T[];
  onInputValueChange?: (value: string) => void;
  renderItem?: (item: T) => React.ReactNode;
  placeholder?: string;
  emptyLabel?: React.ReactNode;
  unavailableLabel?: React.ReactNode;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
}

interface EntityComboboxProps<T extends EntityComboboxItem = EntityComboboxItem>
  extends SharedEntityComboboxProps<T> {
  value?: string | null;
  onValueChange?: (value: string | null, item: T | null) => void;
  clearable?: boolean;
}

interface MultiEntityComboboxProps<T extends EntityComboboxItem = EntityComboboxItem>
  extends SharedEntityComboboxProps<T> {
  value?: readonly string[];
  onValueChange?: (value: string[], items: T[]) => void;
}

function defaultRenderItem(item: EntityComboboxItem): React.ReactNode {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate">{item.label}</span>
      {item.description ? (
        <span className="text-muted-foreground truncate text-xs">{item.description}</span>
      ) : null}
    </div>
  );
}

function getEmptyLabel({
  loading,
  items,
  loadingLabel,
  unavailableLabel,
  emptyLabel,
}: Pick<
  SharedEntityComboboxProps<EntityComboboxItem>,
  'loading' | 'items' | 'loadingLabel' | 'unavailableLabel' | 'emptyLabel'
>): React.ReactNode {
  if (loading) return loadingLabel ?? 'Loading…';
  if (items.length === 0) return unavailableLabel ?? 'None available';
  return emptyLabel ?? 'No matches';
}

function itemFilter(item: EntityComboboxItem, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  const description = typeof item.description === 'string' ? item.description : '';
  return [item.label, description, ...(item.keywords ?? [])].some((text) =>
    text.toLocaleLowerCase().includes(normalized),
  );
}

/** Search-and-pick control for entity identifiers, with optional server filtering. */
function EntityCombobox<T extends EntityComboboxItem = EntityComboboxItem>({
  items,
  selectedItems = [],
  value,
  onValueChange,
  onInputValueChange,
  renderItem = defaultRenderItem,
  placeholder = 'Search…',
  emptyLabel,
  unavailableLabel,
  loadingLabel,
  loading = false,
  disabled,
  invalid,
  clearable = true,
  name,
  required,
  id,
  className,
  contentClassName,
}: EntityComboboxProps<T>) {
  const selected = [...items, ...selectedItems].find((item) => item.value === value) ?? null;
  const noResultsLabel = getEmptyLabel({
    loading,
    items,
    loadingLabel,
    unavailableLabel,
    emptyLabel,
  });

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(next) => onValueChange?.(next?.value ?? null, next ?? null)}
      onInputValueChange={onInputValueChange ? (next) => onInputValueChange(next) : undefined}
      filter={onInputValueChange ? null : (item: T, query) => itemFilter(item, query)}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, selectedItem) => item.value === selectedItem.value}
      name={name}
      required={required}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={loading ? String(loadingLabel ?? 'Loading…') : placeholder}
        aria-invalid={invalid || undefined}
        showClear={clearable && Boolean(selected)}
        disabled={disabled}
        className={cn('w-full', className)}
      />
      <ComboboxContent className={contentClassName}>
        <ComboboxList>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
              {renderItem(item)}
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>{noResultsLabel}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

/** Multi-select sibling that keeps selected entity labels as removable chips. */
function MultiEntityCombobox<T extends EntityComboboxItem = EntityComboboxItem>({
  items,
  selectedItems = [],
  value = [],
  onValueChange,
  onInputValueChange,
  renderItem = defaultRenderItem,
  placeholder = 'Search…',
  emptyLabel,
  unavailableLabel,
  loadingLabel,
  loading = false,
  disabled,
  invalid,
  name,
  required,
  id,
  className,
  contentClassName,
}: MultiEntityComboboxProps<T>) {
  const itemByValue = React.useMemo(() => {
    const map = new Map<string, T>();
    for (const item of [...items, ...selectedItems]) map.set(item.value, item);
    return map;
  }, [items, selectedItems]);
  const selected = value
    .map((selectedValue) => itemByValue.get(selectedValue))
    .filter((item): item is T => item !== undefined);
  const noResultsLabel = getEmptyLabel({
    loading,
    items,
    loadingLabel,
    unavailableLabel,
    emptyLabel,
  });

  return (
    <Combobox
      multiple
      items={items}
      value={selected}
      onValueChange={(next) => {
        const nextItems = next ?? [];
        onValueChange?.(
          nextItems.map((item) => item.value),
          nextItems,
        );
      }}
      onInputValueChange={onInputValueChange ? (next) => onInputValueChange(next) : undefined}
      filter={onInputValueChange ? null : (item: T, query) => itemFilter(item, query)}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, selectedItem) => item.value === selectedItem.value}
      name={name}
      required={required}
      disabled={disabled}
    >
      <ComboboxChips className={cn('w-full', className)}>
        {selected.map((item) => (
          <ComboboxChip key={item.value} aria-label={item.label}>
            {item.label}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          id={id}
          placeholder={loading ? String(loadingLabel ?? 'Loading…') : placeholder}
          aria-invalid={invalid || undefined}
          disabled={disabled}
        />
      </ComboboxChips>
      <ComboboxContent className={contentClassName}>
        <ComboboxList>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item} disabled={item.disabled}>
              {renderItem(item)}
            </ComboboxItem>
          ))}
        </ComboboxList>
        <ComboboxEmpty>{noResultsLabel}</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}

export {
  EntityCombobox,
  MultiEntityCombobox,
  itemFilter,
  type EntityComboboxItem,
  type EntityComboboxProps,
  type MultiEntityComboboxProps,
};
