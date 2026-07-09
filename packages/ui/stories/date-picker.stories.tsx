import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';
import {
  DateRangePicker,
  type DateRangeValue,
} from '../src/components/molecules/date-range-picker.tsx';
import { DateTimePicker } from '../src/components/molecules/date-time-picker.tsx';
import { formatCalendarDate } from '../src/lib/date-value.ts';

const meta = {
  title: 'Molecules/DatePicker',
  component: DatePicker,
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateOnly: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-80 space-y-2">
        <DatePicker value={value} onValueChange={setValue} />
        <p className="text-muted-foreground font-mono text-xs">{value ?? 'No date selected'}</p>
      </div>
    );
  },
};

export const DateAndTime: Story = {
  render: () => {
    const [value, setValue] = useState<string>();
    return (
      <div className="w-[460px] space-y-2">
        <DateTimePicker value={value} onValueChange={setValue} />
        <p className="text-muted-foreground font-mono text-xs">{value ?? 'No instant selected'}</p>
      </div>
    );
  },
};

export const RangeWithPresets: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>();
    const today = new Date();
    const lastSevenDays = () => {
      const from = new Date(today);
      from.setDate(today.getDate() - 6);
      return { from: formatCalendarDate(from), to: formatCalendarDate(today) };
    };
    return (
      <div className="w-80 space-y-2">
        <DateRangePicker
          value={value}
          onValueChange={setValue}
          presets={[
            {
              id: 'today',
              label: 'Today',
              value: {
                from: formatCalendarDate(today),
                to: formatCalendarDate(today),
              },
            },
            { id: 'last-seven-days', label: 'Last 7 days', value: lastSevenDays },
          ]}
          calendarProps={{ numberOfMonths: 2 }}
        />
        <p className="text-muted-foreground font-mono text-xs">
          {value?.from ? `${value.from} → ${value.to ?? '…'}` : 'No range selected'}
        </p>
      </div>
    );
  },
};
