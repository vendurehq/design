import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

/**
 * Guidance, not props. The date-entry family separates calendar dates from
 * instants so timezone conversion is always a deliberate domain decision.
 */
const meta = { title: 'Molecules/DatePicker/Guidance' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const CHOICES = [
  ['DatePicker', 'A calendar day with no time zone', 'Birth date, activity date, expiry day'],
  ['DateTimePicker', 'An ISO instant edited in local time', 'Scheduled publish, job start'],
  ['DateRangePicker', 'Inclusive calendar-day boundaries', 'Reports, analytics, exports'],
  ['DateTime / RelativeTime', 'Read-only display', 'Created at, last updated'],
];

export const Semantics: Story = {
  name: '1 · Pick by value semantics',
  render: () => (
    <div className="max-w-3xl space-y-10">
      <Section title="Choose the value before the control">
        <div className="overflow-hidden rounded-lg border">
          {CHOICES.map(([component, meaning, examples]) => (
            <div
              key={component}
              className="grid gap-2 border-b p-3 text-sm last:border-0 sm:grid-cols-3"
            >
              <code>{component}</code>
              <span>{meaning}</span>
              <span className="text-muted-foreground">{examples}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Never manufacture midnight UTC">
        <p className="text-muted-foreground text-sm">
          A date-only value stays <code>YYYY-MM-DD</code>. Do not run it through
          <code className="mx-1">toISOString()</code>; users west or east of UTC can otherwise see
          the neighboring day. Use DateTimePicker only when the domain truly stores an instant.
        </p>
      </Section>
    </div>
  ),
};
