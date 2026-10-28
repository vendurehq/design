import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';

const meta = {
  title: 'Molecules/AnonymizedToken',
  component: AnonymizedToken,
  tags: ['autodocs'],
  args: {
    value: 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7',
    copyable: true,
  },
  argTypes: {
    value: { control: 'text' },
    revealOnHover: { control: 'boolean' },
    previewPrefixLength: { control: 'number' },
    previewSuffixLength: { control: 'number' },
    previewSeparator: { control: 'text' },
    obscuredLabel: { control: 'text' },
    previewLabel: { control: 'text' },
    copyable: { control: 'boolean' },
  },
} satisfies Meta<typeof AnonymizedToken>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const TokenShapes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <AnonymizedToken value="vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7" />
      <AnonymizedToken value="phc_live_3c929a4f7a134920b5c25aa75c5a2f7c" />
      <AnonymizedToken value="sk_test_short" previewPrefixLength={4} previewSuffixLength={3} />
    </div>
  ),
};

export const RevealDisabled: Story = {
  args: {
    value: 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7',
    revealOnHover: false,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7',
    copyable: false,
  },
};

export const MissingValue: Story = {
  args: {
    value: null,
    fallback: 'No token issued',
  },
};

const DATABASE_URL = 'postgres://shop:p4ssw0rd@db.internal:5432/shop';

/** Resolves after `ms`, like a server read of a secret. */
function loadAfter(ms: number, value = DATABASE_URL) {
  return () => new Promise<string>((resolve) => setTimeout(() => resolve(value), ms));
}

function failAfter(ms: number) {
  return () =>
    new Promise<string>((_, reject) => setTimeout(() => reject(new Error('Forbidden')), ms));
}

/**
 * For secrets the server returns only on request. A fixed mask at rest; the
 * eye button loads and reveals the value, copy loads it without revealing.
 */
export const LoadOnDemand: Story = {
  render: () => <AnonymizedToken loadValue={loadAfter(600)} copyLabel="Copy value" />,
};

export const LoadOnDemandError: Story = {
  render: () => (
    <AnonymizedToken
      loadValue={failAfter(400)}
      loadErrorMessage="Couldn't load the value. Try again."
    />
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Both modes side by side. Click the eye on the loadValue rows to see loading
 * (slow), revealed (fast) and error (failing) states.
 */
export const ModesLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {() => (
        <dl className="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">value</dt>
          <dd>
            <AnonymizedToken value="vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7" />
          </dd>
          <dt className="text-muted-foreground">loadValue</dt>
          <dd>
            <AnonymizedToken data-testid="fast" loadValue={loadAfter(300)} />
          </dd>
          <dt className="text-muted-foreground">loadValue, slow</dt>
          <dd>
            <AnonymizedToken data-testid="slow" loadValue={loadAfter(600_000)} />
          </dd>
          <dt className="text-muted-foreground">loadValue, failing</dt>
          <dd>
            <AnonymizedToken data-testid="failing" loadValue={failAfter(300)} />
          </dd>
        </dl>
      )}
    </LightAndDark>
  ),
};
