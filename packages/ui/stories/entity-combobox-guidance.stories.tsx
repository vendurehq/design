import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';

/**
 * Guidance, not props. This page separates closed entity selection from free
 * text and rules on local versus server filtering.
 */
const meta = { title: 'Molecules/EntityCombobox/Guidance' } satisfies Meta;
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

export const SelectionModel: Story = {
  name: '1 · Closed selection vs free text',
  render: () => (
    <div className="max-w-3xl space-y-10">
      <Section title="Pick the model, then the component">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['EntityCombobox', 'Exactly one known record'],
            ['MultiEntityCombobox', 'Several known records'],
            ['ComboboxFreeText', 'Any text, with optional suggestions'],
          ].map(([name, use]) => (
            <div key={name} className="rounded-lg border p-4 text-sm">
              <code>{name}</code>
              <p className="text-muted-foreground mt-2">{use}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="The caller owns fetching">
        <p className="text-muted-foreground text-sm">
          Pass <code>onInputValueChange</code> for debounced server search; its presence disables
          client filtering. Keep the selected record in <code>selectedItems</code> when a new result
          page no longer contains it. Queries, caching, and authorization stay in the consumer.
        </p>
      </Section>
    </div>
  ),
};
