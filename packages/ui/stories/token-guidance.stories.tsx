import type { Meta, StoryObj } from '@storybook/react';
import { tokenGuidance } from '../../design-tokens/guidance/catalog.ts';

const meta = {
  title: 'Foundations/Token Decision Catalog',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decisions: Story = {
  render: () => (
    <div className="text-foreground max-w-5xl space-y-8 p-1">
      <header>
        <h1 className="text-style-page-title">Shared token decisions</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          This catalog is the shared source used by Storybook and the vendure-tokens agent skill.
          Token values remain authoritative in the design-tokens source package.
        </p>
      </header>
      {tokenGuidance.map((entry) => (
        <section key={entry.id} className="rounded-lg border p-5">
          <h2 className="text-style-section-title">{entry.title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{entry.summary}</p>
          <ul className="mt-4 space-y-3">
            {entry.rules.map((rule) => (
              <li key={rule.title} className="border-l-2 pl-3">
                <p className="text-sm font-medium">{rule.title}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{rule.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  ),
};
