import type { Meta, StoryObj } from '@storybook/react';
import { fr } from 'react-day-picker/locale/fr';
import { Calendar } from '../src/components/atoms/calendar.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';

const meta = {
  title: 'Atoms/Forms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Calendar mode="single" className="rounded-md border" />,
};

export const Range: Story = {
  render: () => <Calendar mode="range" className="rounded-md border" />,
};

export const MultiMonth: Story = {
  render: () => (
    <Calendar mode="single" numberOfMonths={2} className="rounded-md border" />
  ),
};

/**
 * `FormatProvider`'s `calendarLocale` sets the language: caption, weekdays,
 * first day of the week, the month dropdown and screen-reader labels. Import
 * one language from `react-day-picker/locale/<lang>`, never the barrel.
 */
export const French: Story = {
  render: () => (
    <FormatProvider locale="fr-FR" calendarLocale={fr}>
      <Calendar
        mode="single"
        captionLayout="dropdown"
        defaultMonth={new Date(2026, 2, 1)}
        className="rounded-md border"
      />
    </FormatProvider>
  ),
};
