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
import { fieldButton } from '@vendure-io/ui/lib/field-surface';
import { cn } from '@vendure-io/ui/lib/utils';
import { CalendarIcon, XIcon } from 'lucide-react';
import * as React from 'react';

type CalendarProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'disabled' | 'defaultMonth'
>;

interface DatePickerProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /**
   * Local calendar date (`YYYY-MM-DD`), never an instant. Pass `value` to
   * control the picker. Leave the prop out and it keeps its own state.
   */
  value?: string;
  /** Initial date when `value` is not passed. */
  defaultValue?: string;
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
function DatePicker(allProps: DatePickerProps) {
  const {
    value: valueProp,
    defaultValue,
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
  } = allProps;
  // Controlled when the `value` prop is passed, even as `undefined` (no value).
  const controlled = 'value' in allProps;
  const [open, setOpen] = React.useState(false);
  const [own, setOwn] = React.useState(defaultValue);
  const value = controlled ? valueProp : own;
  function commit(next: string | undefined) {
    if (!controlled) setOwn(next);
    onValueChange?.(next);
  }
  // The calendar popup is a dialog, named by its trigger.
  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
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
          <CalendarIcon />
          <span
            data-placeholder={selected ? undefined : ''}
            className={cn('truncate', !selected && 'text-faint-foreground')}
          >
            {selected ? formatDateLabel(selected, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" aria-labelledby={triggerId}>
          <Calendar
            {...calendarProps}
            mode="single"
            selected={selected}
            defaultMonth={selected ?? minDate}
            disabled={disabledMatchers}
            onSelect={(date) => {
              commit(date ? formatCalendarDate(date) : undefined);
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
          onClick={() => commit(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DatePicker, type DatePickerProps };
