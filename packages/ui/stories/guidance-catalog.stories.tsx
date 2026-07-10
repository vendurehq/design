import type { Meta, StoryObj } from '@storybook/react';
import { uiGuidance } from '../guidance/catalog.ts';
import { screenRecipes } from '../guidance/recipes.ts';

const meta = {
  title: 'Guidance/Shared Decision Catalog',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComponentDecisions: Story = {
  name: '1 · Component decisions',
  render: () => (
    <div className="text-foreground max-w-5xl space-y-8 p-1">
      <header>
        <h1 className="text-style-page-title">Shared component decisions</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          This concise catalog is the shared source used by Storybook and the vendure-ui agent
          skill. Open the linked component Guidance page for live do and don&apos;t examples.
        </p>
      </header>
      {uiGuidance.map((entry) => (
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
          <p className="text-muted-foreground mt-4 font-mono text-xs">{entry.sourceStory}</p>
        </section>
      ))}
    </div>
  ),
};

export const ScreenRecipes: Story = {
  name: '2 · Screen recipes',
  render: () => (
    <div className="text-foreground max-w-5xl space-y-8 p-1">
      <header>
        <h1 className="text-style-page-title">Strong-default screen recipes</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          Start from the closest recipe. Preserve its hierarchy, action placement, state handling,
          and responsive anatomy unless a concrete product requirement demands a deviation.
        </p>
      </header>
      {screenRecipes.map((recipe) => (
        <section key={recipe.id} className="rounded-lg border p-5">
          <h2 className="text-style-section-title">{recipe.title}</h2>
          <p className="text-muted-foreground mt-1 text-sm">{recipe.purpose}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            {recipe.invariants.map((invariant) => (
              <li key={invariant}>{invariant}</li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  ),
};
