import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import { fr } from 'react-day-picker/locale/fr';
import { Input } from '../src/components/atoms/input.tsx';
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

export const OpenDateAndTime: Story = {
  tags: ['!autodocs'],
  render: DateAndTime.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button')[0] as HTMLElement);
    await waitFor(() => expect(within(document.body).getByRole('dialog')).toBeVisible());
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

/**
 * A picker stops at its cap in a wide column, and its popup is at least as wide
 * as the field. `fitsField` also checks the popup is the calendar's width, which
 * is not true of the range picker with presets.
 */
async function expectCappedField(canvasElement: HTMLElement, fitsField = true) {
  const root = canvasElement.querySelector<HTMLElement>('[data-slot$="picker"]');
  if (!root?.parentElement) throw new Error('The picker is missing.');
  await expect(root.offsetWidth).toBeLessThan(root.parentElement.offsetWidth);
  const trigger = within(canvasElement).getAllByRole('button')[0] as HTMLElement;
  await userEvent.click(trigger);
  const popup = await within(document.body).findByRole('dialog');
  // offsetWidth ignores the scale of the opening animation.
  await expect(popup.offsetWidth).toBeGreaterThanOrEqual(trigger.offsetWidth);
  if (fitsField) await expect(popup.offsetWidth).toBeLessThanOrEqual(root.offsetWidth);
}

export const WideDateOnly: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-120">
      <DatePicker />
    </div>
  ),
  play: ({ canvasElement }) => expectCappedField(canvasElement),
};

/** A field narrower than the calendar keeps the calendar's width. */
export const NarrowDateOnly: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-48">
      <DatePicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getAllByRole('button')[0] as HTMLElement;
    await userEvent.click(trigger);
    const popup = await within(document.body).findByRole('dialog');
    await expect(popup.offsetWidth).toBeGreaterThanOrEqual(trigger.offsetWidth);
  },
};

export const WideDateAndTime: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-160">
      <DateTimePicker />
    </div>
  ),
  play: ({ canvasElement }) => expectCappedField(canvasElement),
};

export const WideRange: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-120">
      <DateRangePicker />
    </div>
  ),
  play: ({ canvasElement }) => expectCappedField(canvasElement),
};

export const WideRangeWithPresets: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-160">
      <DateRangePicker
        presets={[
          { id: 'today', label: 'Today', value: { from: '2026-11-26', to: '2026-11-26' } },
          { id: 'week', label: 'Last 7 days', value: { from: '2026-11-20', to: '2026-11-26' } },
        ]}
      />
    </div>
  ),
  play: ({ canvasElement }) => expectCappedField(canvasElement, false),
};

/** The longest realistic range, across two years, fits the field without truncating. */
export const LongRangeLabel: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="w-120">
      <DateRangePicker defaultValue={{ from: '2026-11-01', to: '2027-12-26' }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector<HTMLElement>('[data-slot="date-range-picker"] .truncate');
    if (!label) throw new Error('The range label is missing.');
    await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
  },
};

/**
 * Next to an Input, the pickers stop at their cap while the Input fills the
 * column. Pass `className="max-w-none"` to a picker to fill the column too.
 */
export const FullWidthFormColumn: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="flex w-full max-w-120 flex-col gap-3">
      <Input aria-label="Name" placeholder="Name" />
      <DatePicker />
      <Input aria-label="Reference" placeholder="Reference" />
      <DateTimePicker />
      <Input aria-label="Notes" placeholder="Notes" />
      <DateRangePicker />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText('Name');
    const roots = canvasElement.querySelectorAll<HTMLElement>('[data-slot$="picker"]');
    await expect(roots).toHaveLength(3);
    for (const root of roots) await expect(root.offsetWidth).toBeLessThan(input.offsetWidth);
  },
};

/** The clear buttons and the time field take their names from `messages`; the label props win. */
export const TranslatedLabels: Story = {
  tags: ['!autodocs'],
  render: () => (
    <FormatProvider
      messages={{
        datePicker: { clear: 'Datum löschen' },
        dateTimePicker: { clear: 'Datum und Uhrzeit löschen', time: 'Uhrzeit' },
        dateRangePicker: { clear: 'Zeitraum löschen' },
      }}
    >
      <div className="flex w-[460px] flex-col gap-3">
        <DatePicker defaultValue="2026-03-10" />
        <DateTimePicker defaultValue="2026-03-10T14:30:00.000Z" />
        <DateTimePicker
          defaultValue="2026-03-10T14:30:00.000Z"
          clearLabel="Reset both"
          timeLabel="Clock"
        />
        <DateRangePicker defaultValue={{ from: '2026-03-10', to: '2026-03-17' }} />
      </div>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Datum löschen' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Datum und Uhrzeit löschen' })).toBeVisible();
    await expect(canvas.getByLabelText('Uhrzeit')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Zeitraum löschen' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Reset both' })).toBeVisible();
    await expect(canvas.getByLabelText('Clock')).toBeVisible();
  },
};
