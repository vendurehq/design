'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Calendar } from '@vendure-io/ui/components/atoms/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@vendure-io/ui/components/atoms/popover';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import {
  formatCalendarDate,
  formatDateRangeLabel,
  parseCalendarDate,
} from '@vendure-io/ui/lib/date-value';
import { fieldButton } from '@vendure-io/ui/lib/field-surface';
import { cn } from '@vendure-io/ui/lib/utils';
import { CalendarRangeIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

type CalendarProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'defaultMonth'
>;

interface DateRangeValue {
  from?: string;
  to?: string;
}

interface DateRangePreset {
  id: string;
  label: React.ReactNode;
  value: DateRangeValue | (() => DateRangeValue);
}

interface DateRangePickerProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /**
   * Local calendar-date boundaries (`YYYY-MM-DD`), inclusive. Pass `value` to
   * control the picker. Leave the prop out and it keeps its own state.
   */
  value?: DateRangeValue;
  /** Initial range when `value` is not passed. */
  defaultValue?: DateRangeValue;
  onValueChange?: (value: DateRangeValue | undefined) => void;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  presets?: readonly DateRangePreset[];
  calendarProps?: CalendarProps;
}

function resolvePreset(value: DateRangePreset['value']): DateRangeValue {
  return typeof value === 'function' ? value() : value;
}

function DateRangePicker(allProps: DateRangePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = 'Pick a date range',
    clearable = true,
    disabled,
    invalid,
    presets = [],
    calendarProps,
    className,
    ...props
  } = allProps;
  // Controlled when the `value` prop is passed, even as `undefined` (no value).
  const controlled = 'value' in allProps;
  const [open, setOpen] = React.useState(false);
  const [own, setOwn] = React.useState(defaultValue);
  const value = controlled ? valueProp : own;
  function commit(next: DateRangeValue | undefined) {
    if (!controlled) setOwn(next);
    onValueChange?.(next);
  }
  // The calendar popup is a dialog, named by its trigger.
  const generatedId = React.useId();
  const triggerId = generatedId;
  const { locale } = useFormatSettings();
  const selected: DateRange = {
    from: parseCalendarDate(value?.from),
    to: parseCalendarDate(value?.to),
  };
  const hasValue = Boolean(selected.from);

  function commitRange(range: DateRange | undefined) {
    if (!range?.from) {
      commit(undefined);
      return;
    }
    commit({
      from: formatCalendarDate(range.from),
      to: range.to ? formatCalendarDate(range.to) : undefined,
    });
  }

  return (
    <div
      data-slot="date-range-picker"
      className={cn('flex min-w-0 items-center gap-1', className)}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={triggerId}
              type="button"
              variant="ghost"
              disabled={disabled}
              aria-invalid={invalid || undefined}
              // Pickers sit in forms next to Inputs, so they take the field look.
              className={fieldButton}
            />
          }
        >
          <CalendarRangeIcon />
          <span
            data-placeholder={hasValue ? undefined : ''}
            className={cn('truncate', !hasValue && 'text-faint-foreground')}
          >
            {selected.from ? formatDateRangeLabel(selected.from, selected.to, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-(--anchor-width) p-0"
          align="start"
          aria-labelledby={triggerId}
        >
          <div className={cn('flex', presets.length > 0 && 'divide-x')}>
            {presets.length > 0 ? (
              <div className="flex w-40 flex-col gap-1 p-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => {
                      commit(resolvePreset(preset.value));
                      setOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            ) : null}
            <Calendar
              {...calendarProps}
              // In a popup wider than the grid, the month sits centred with even padding.
              className={cn('mx-auto', calendarProps?.className)}
              mode="range"
              selected={selected}
              defaultMonth={selected.from}
              onSelect={commitRange}
            />
          </div>
        </PopoverContent>
      </Popover>
      {clearable && hasValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label="Clear date range"
          onClick={() => commit(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DateRangePicker, type DateRangePickerProps, type DateRangePreset, type DateRangeValue };
