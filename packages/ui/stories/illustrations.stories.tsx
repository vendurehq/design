import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { EmptyCollectionIllustration } from '../src/components/molecules/illustrations/empty-collection.tsx';
import { ErrorIllustration } from '../src/components/molecules/illustrations/error.tsx';
import { FirstRunIllustration } from '../src/components/molecules/illustrations/first-run.tsx';
import { NoOrdersIllustration } from '../src/components/molecules/illustrations/no-orders.tsx';
import { NoResultsIllustration } from '../src/components/molecules/illustrations/no-results.tsx';
import { NotFoundIllustration } from '../src/components/molecules/illustrations/not-found.tsx';
import { OfflineIllustration } from '../src/components/molecules/illustrations/offline.tsx';

/**
 * The full signature illustration set. Each one is a hand-authored inline
 * SVG, geometric and flat, 1.5 stroke weight throughout, sized off a 160×120
 * viewBox. Colors are design-system slots only — neutral strokes and fills
 * (`stroke-border`, `stroke-muted-foreground`, `fill-muted`, `fill-surface`,
 * `fill-background`) plus exactly one brand-accent element per illustration
 * (per accent rationing: an empty/error moment is a deliberate identity
 * moment, so one tasteful `fill-brand` touch is allowed). For where each one
 * belongs and how to wire it into `EmptyState`/`ErrorState`, see the
 * StateViews guidance page.
 */
const meta = {
  title: 'Molecules/Illustrations',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SET: { name: string; use: string; render: () => ReactNode }[] = [
  {
    name: 'NoResultsIllustration',
    use: 'A search or filter matched nothing.',
    render: () => <NoResultsIllustration />,
  },
  {
    name: 'EmptyCollectionIllustration',
    use: "Nothing exists yet — the default for EmptyState's first-run empties.",
    render: () => <EmptyCollectionIllustration />,
  },
  {
    name: 'NoOrdersIllustration',
    use: 'An order/checkout list with nothing in it yet.',
    render: () => <NoOrdersIllustration />,
  },
  {
    name: 'ErrorIllustration',
    use: 'The default for ErrorState — a generic, non-retryable-looking failure.',
    render: () => <ErrorIllustration />,
  },
  {
    name: 'NotFoundIllustration',
    use: "A 404 or missing resource — pair with a 'Go back' action, not retry.",
    render: () => <NotFoundIllustration />,
  },
  {
    name: 'OfflineIllustration',
    use: 'A network/connectivity failure.',
    render: () => <OfflineIllustration />,
  },
  {
    name: 'FirstRunIllustration',
    use: "A genuine onboarding moment — a feature that's never been set up.",
    render: () => <FirstRunIllustration />,
  },
];

export const Gallery: Story = {
  name: '1 · The full set',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SET.map(({ name, use, render }) => (
          <div
            key={name}
            className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center"
          >
            {render()}
            <div>
              <p className="font-mono text-xs font-medium">{name}</p>
              <p className="text-muted-foreground mt-1 text-xs">{use}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: '2 · Scaling via `size`',
  render: () => (
    <div className="text-foreground flex max-w-4xl items-end gap-6 p-1">
      {[64, 96, 128, 160].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <EmptyCollectionIllustration size={size} />
          <p className="text-muted-foreground font-mono text-xs">size={size}</p>
        </div>
      ))}
    </div>
  ),
};
