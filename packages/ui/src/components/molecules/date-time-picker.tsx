'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Calendar } from '@vendure-io/ui/components/atoms/calendar';
import { Input } from '@vendure-io/ui/components/atoms/input';
import { Popover, PopoverContent, PopoverTrigger } from '@vendure-io/ui/components/atoms/popover';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { formatDateLabel, parseInstant } from '@vendure-io/ui/lib/date-value';
import { cn } from '@vendure-io/ui/lib/utils';
import { CalendarClockIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { fieldButton } from '../../lib/field-surface.ts';

type CalendarProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'defaultMonth'
>;

interface DateTimePickerProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /**
   * ISO 8601 instant. Calendar and time controls edit it in the user's local
   * zone. Pass `value` to control the picker. Leave the prop out and it keeps
   * its own state.
   */
  value?: string;
  /** Initial instant when `value` is not passed. */
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** `sm` is 28px tall, for dense rows, like `Input size="sm"`. */
  size?: 'sm' | 'default';
  name?: string;
  id?: string;
  calendarProps?: CalendarProps;
}

function DateTimePicker(allProps: DateTimePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = 'Pick a date and time',
    clearable = true,
    disabled,
    invalid,
    size = 'default',
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
  const selected = parseInstant(value);
  const timeValue = selected
    ? `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`
    : '';

  function commitDate(date: Date | undefined) {
    if (!date) return;
    const next = new Date(date);
    next.setHours(selected?.getHours() ?? 0, selected?.getMinutes() ?? 0, 0, 0);
    commit(next.toISOString());
    setOpen(false);
  }

  function commitTime(time: string) {
    if (!time) return;
    const [hoursText, minutesText] = time.split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return;
    const next = selected ? new Date(selected) : new Date();
    next.setHours(hours, minutes, 0, 0);
    commit(next.toISOString());
  }

  return (
    <div
      data-slot="date-time-picker"
      data-size={size}
      // max-w-92 is the calendar (62), the gap and the w-28 time box. Pass max-w-none to fill the column.
      className={cn('flex min-w-0 max-w-92 items-center gap-2', className)}
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
              className={cn(fieldButton, size === 'sm' && 'h-7')}
            />
          }
        >
          <CalendarClockIcon />
          <span
            data-placeholder={selected ? undefined : ''}
            className={cn('truncate', !selected && 'text-faint-foreground')}
          >
            {selected ? formatDateLabel(selected, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-(--anchor-width) p-0"
          align="start"
          aria-labelledby={triggerId}
        >
          <Calendar
            {...calendarProps}
            // In a popup wider than the grid, the month sits centred with even padding.
            className={cn('mx-auto', calendarProps?.className)}
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={commitDate}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        aria-label="Time"
        aria-invalid={invalid || undefined}
        value={timeValue}
        disabled={disabled || !selected}
        size={size}
        className="w-28"
        onChange={(event) => commitTime(event.currentTarget.value)}
      />
      {clearable && selected ? (
        <Button
          type="button"
          variant="ghost"
          size={size === 'sm' ? 'icon-xs' : 'icon-sm'}
          disabled={disabled}
          aria-label="Clear date and time"
          onClick={() => commit(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DateTimePicker, type DateTimePickerProps };
