'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Calendar } from '@vendure-io/ui/components/atoms/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@vendure-io/ui/components/atoms/popover';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import {
  formatCalendarDate,
  formatDateLabel,
  parseCalendarDate,
} from '@vendure-io/ui/lib/date-value';
import { cn } from '@vendure-io/ui/lib/utils';
import { CalendarIcon, XIcon } from 'lucide-react';
import * as React from 'react';

type CalendarProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'disabled' | 'defaultMonth'
>;

interface DatePickerProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Local calendar date (`YYYY-MM-DD`), never an instant. */
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  min?: string;
  max?: string;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  calendarProps?: CalendarProps;
}

/** Date-only picker whose value cannot shift when serialized across time zones. */
function DatePicker({
  value,
  onValueChange,
  min,
  max,
  placeholder = 'Pick a date',
  clearable = true,
  disabled,
  invalid,
  name,
  id,
  calendarProps,
  className,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { locale } = useFormatSettings();
  const selected = parseCalendarDate(value);
  const minDate = parseCalendarDate(min);
  const maxDate = parseCalendarDate(max);
  const disabledMatchers = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  return (
    <div
      data-slot="date-picker"
      className={cn('flex min-w-0 items-center gap-1', className)}
      {...props}
    >
      {name ? <input type="hidden" name={name} value={value ?? ''} /> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={invalid || undefined}
              className="min-w-0 flex-1 justify-start font-normal"
            />
          }
        >
          <CalendarIcon />
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? formatDateLabel(selected, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...calendarProps}
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate}
            disabled={disabledMatchers}
            onSelect={(date) => {
              onValueChange?.(date ? formatCalendarDate(date) : undefined);
              if (date) setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {clearable && selected ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label="Clear date"
          onClick={() => onValueChange?.(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DatePicker, type DatePickerProps };
