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

type CalendarProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'defaultMonth'
>;

interface DateTimePickerProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** ISO 8601 instant. Calendar and time controls edit it in the user's local zone. */
  value?: string;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: React.ReactNode;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  calendarProps?: CalendarProps;
}

function DateTimePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date and time',
  clearable = true,
  disabled,
  invalid,
  name,
  id,
  calendarProps,
  className,
  ...props
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { locale } = useFormatSettings();
  const selected = parseInstant(value);
  const timeValue = selected
    ? `${String(selected.getHours()).padStart(2, '0')}:${String(selected.getMinutes()).padStart(2, '0')}`
    : '';

  function commitDate(date: Date | undefined) {
    if (!date) return;
    const next = new Date(date);
    next.setHours(selected?.getHours() ?? 0, selected?.getMinutes() ?? 0, 0, 0);
    onValueChange?.(next.toISOString());
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
    onValueChange?.(next.toISOString());
  }

  return (
    <div
      data-slot="date-time-picker"
      className={cn('flex min-w-0 items-center gap-2', className)}
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
          <CalendarClockIcon />
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? formatDateLabel(selected, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            {...calendarProps}
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
        className="w-28"
        onChange={(event) => commitTime(event.currentTarget.value)}
      />
      {clearable && selected ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label="Clear date and time"
          onClick={() => onValueChange?.(undefined)}
        >
          <XIcon />
        </Button>
      ) : null}
    </div>
  );
}

export { DateTimePicker, type DateTimePickerProps };
