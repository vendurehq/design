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
  /** Local calendar-date boundaries (`YYYY-MM-DD`), inclusive. */
  value?: DateRangeValue;
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

function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date range',
  clearable = true,
  disabled,
  invalid,
  presets = [],
  calendarProps,
  className,
  ...props
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { locale } = useFormatSettings();
  const selected: DateRange = {
    from: parseCalendarDate(value?.from),
    to: parseCalendarDate(value?.to),
  };
  const hasValue = Boolean(selected.from);

  function commitRange(range: DateRange | undefined) {
    if (!range?.from) {
      onValueChange?.(undefined);
      return;
    }
    onValueChange?.({
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
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={invalid || undefined}
              className="min-w-0 flex-1 justify-start font-normal"
            />
          }
        >
          <CalendarRangeIcon />
          <span className={cn('truncate', !hasValue && 'text-muted-foreground')}>
            {selected.from ? formatDateRangeLabel(selected.from, selected.to, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
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
                      onValueChange?.(resolvePreset(preset.value));
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
          onClick={() => onValueChange?.(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DateRangePicker, type DateRangePickerProps, type DateRangePreset, type DateRangeValue };
