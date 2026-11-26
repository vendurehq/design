import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { fr } from 'react-day-picker/locale/fr';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';
import {
  DateRangePicker,
  type DateRangeValue,
} from '../src/components/molecules/date-range-picker.tsx';
import { DateTimePicker } from '../src/components/molecules/date-time-picker.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
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

/** Ends with the calendar open, so the accessibility check scans it. */
export const Open: Story = {
  tags: ['!autodocs'],
  render: DateOnly.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button')[0] as HTMLElement);
    await waitFor(() => expect(within(document.body).getByRole('dialog', { name: 'Pick a date' })).toBeVisible());
  },
};

/**
 * Opens the picker and checks the calendar follows the `FormatProvider` language:
 * a French caption and a week that starts on Monday.
 */
async function expectFrenchCalendar(canvasElement: HTMLElement, caption: string) {
  await userEvent.click(within(canvasElement).getAllByRole('button')[0] as HTMLElement);
  const body = within(document.body);
  const grid = await waitFor(() => {
    const first = body.getAllByRole('grid', { name: caption })[0] as HTMLElement;
    expect(first).toBeVisible();
    return first;
  });
  // DayPicker hides the weekday row from assistive tech, so include hidden elements.
  const weekdays = within(grid).getAllByRole('columnheader', { hidden: true });
  await expect(weekdays[0]).toHaveAttribute('aria-label', 'lundi');
  await expect(body.getByRole('button', { name: 'Aller au mois suivant' })).toBeVisible();
}

/**
 * The calendar takes its language from `FormatProvider`'s `calendarLocale`.
 * Import only the language you need (`react-day-picker/locale/fr`), never the
 * `react-day-picker/locale` barrel.
 */
export const FrenchDateOnly: Story = {
  tags: ['!autodocs'],
  render: () => {
    const [value, setValue] = useState<string | undefined>('2026-03-10');
    return (
      <FormatProvider locale="fr-FR" calendarLocale={fr}>
        <div className="w-80">
          <DatePicker value={value} onValueChange={setValue} />
        </div>
      </FormatProvider>
    );
  },
  play: ({ canvasElement }) => expectFrenchCalendar(canvasElement, 'mars 2026'),
};

export const FrenchDateAndTime: Story = {
  tags: ['!autodocs'],
  render: () => {
    const [value, setValue] = useState<string | undefined>('2026-03-10T14:30:00.000Z');
    return (
      <FormatProvider locale="fr-FR" calendarLocale={fr}>
        <div className="w-[460px]">
          <DateTimePicker value={value} onValueChange={setValue} />
        </div>
      </FormatProvider>
    );
  },
  play: ({ canvasElement }) => expectFrenchCalendar(canvasElement, 'mars 2026'),
};

export const FrenchRange: Story = {
  tags: ['!autodocs'],
  render: () => {
    const [value, setValue] = useState<DateRangeValue | undefined>({
      from: '2026-03-10',
      to: '2026-03-17',
    });
    return (
      <FormatProvider locale="fr-FR" calendarLocale={fr}>
        <div className="w-80">
          <DateRangePicker
            value={value}
            onValueChange={setValue}
            calendarProps={{ numberOfMonths: 2 }}
          />
        </div>
      </FormatProvider>
    );
  },
  play: ({ canvasElement }) => expectFrenchCalendar(canvasElement, 'mars 2026'),
};

/** Without `value`, the picker keeps the pick itself. `defaultValue` sets the first one. */
export const UncontrolledDateOnly: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-80">
      <DatePicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getAllByRole('button')[0] as HTMLElement;
    await expect(trigger).toHaveTextContent('Pick a date');
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole('button', { name: /\b15th\b/ }));
    await waitFor(() => expect(trigger).toHaveTextContent(/15/));
    await expect(within(canvasElement).getByRole('button', { name: 'Clear date' })).toBeVisible();
  },
};

export const UncontrolledDateOnlyWithDefault: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-80">
      <DatePicker defaultValue="2026-03-10" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getAllByRole('button')[0] as HTMLElement;
    await expect(trigger).toHaveTextContent(/10/);
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Clear date' }));
    await waitFor(() => expect(trigger).toHaveTextContent('Pick a date'));
  },
};

export const UncontrolledDateAndTime: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-[460px]">
      <DateTimePicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getAllByRole('button')[0] as HTMLElement;
    await expect(trigger).toHaveTextContent('Pick a date and time');
    await expect(canvas.getByLabelText('Time')).toBeDisabled();
    await userEvent.click(trigger);
    await userEvent.click(await within(document.body).findByRole('button', { name: /\b15th\b/ }));
    await waitFor(() => expect(trigger).toHaveTextContent(/15/));
    await expect(canvas.getByLabelText('Time')).toBeEnabled();
  },
};

export const UncontrolledRange: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-80">
      <DateRangePicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getAllByRole('button')[0] as HTMLElement;
    await expect(trigger).toHaveTextContent('Pick a date range');
    await userEvent.click(trigger);
    const body = within(document.body);
    await userEvent.click(await body.findByRole('button', { name: /\b10th\b/ }));
    await userEvent.click(await body.findByRole('button', { name: /\b12th\b/ }));
    await waitFor(() => expect(trigger).toHaveTextContent(/10.*12/));
  },
};
