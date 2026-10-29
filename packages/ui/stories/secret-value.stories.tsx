import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/atoms/table.tsx';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';

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
 * Click the eye to see the loading and revealed states.
 */
const meta = {
  title: 'Molecules/SecretValue',
  component: SecretValue,
  tags: ['autodocs'],
  args: {
    loadValue: loadAfter(600),
    copyable: true,
  },
  argTypes: {
    loadValue: { control: false },
    copyable: { control: 'boolean' },
    hiddenLabel: { control: 'text' },
    showLabel: { control: 'text' },
    hideLabel: { control: 'text' },
    copyLabel: { control: 'text' },
    copiedLabel: { control: 'text' },
    loadErrorMessage: { control: 'text' },
  },
} satisfies Meta<typeof SecretValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The load never settles, so the spinner stays after a click. */
export const Loading: Story = {
  args: { loadValue: loadAfter(600_000) },
};

/** The load fails: the message shows inline, and a click on the eye retries. */
export const LoadError: Story = {
  args: {
    loadValue: failAfter(400),
    loadErrorMessage: "Couldn't load the value. Try again.",
  },
};

/** Reveal stays; copy is gone. */
export const NotCopyable: Story = {
  args: { copyable: false },
};

const VARIABLES = [
  { name: 'DATABASE_URL', value: DATABASE_URL },
  {
    name: 'SESSION_SECRET',
    value: 'b7f3c9e1a5d2f8b4c6e0a9d3f7b1c5e9a2d6f0b4c8e3a7d1f5b9c2e6a0d4f8b3c7e1a5d9',
  },
  { name: 'REDIS_URL', value: 'redis://default:hunter2@cache.internal:6379' },
];

/**
 * In a table row. A revealed value wraps inside its cell instead of widening
 * the table, so a long value makes the row taller, not the page wider.
 */
export const InTableRow: Story = {
  render: () => (
    <div className="max-w-2xl rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {VARIABLES.map((variable) => (
            <TableRow key={variable.name}>
              <TableCell className="font-mono text-xs">{variable.name}</TableCell>
              <TableCell>
                <SecretValue
                  data-testid={variable.name}
                  loadValue={loadAfter(300, variable.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
 * Every state in light and dark. Click the eye on the fast, slow and failing
 * rows to see revealed, loading and error.
 */
export const StatesLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <dl className="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">At rest</dt>
          <dd>
            <SecretValue data-testid={`${theme}-rest`} loadValue={loadAfter(300)} />
          </dd>
          <dt className="text-muted-foreground">Fast load</dt>
          <dd>
            <SecretValue data-testid={`${theme}-fast`} loadValue={loadAfter(300)} />
          </dd>
          <dt className="text-muted-foreground">Slow load</dt>
          <dd>
            <SecretValue data-testid={`${theme}-slow`} loadValue={loadAfter(600_000)} />
          </dd>
          <dt className="text-muted-foreground">Failing load</dt>
          <dd>
            <SecretValue data-testid={`${theme}-failing`} loadValue={failAfter(300)} />
          </dd>
          <dt className="text-muted-foreground">Not copyable</dt>
          <dd>
            <SecretValue
              data-testid={`${theme}-not-copyable`}
              loadValue={loadAfter(300)}
              copyable={false}
            />
          </dd>
        </dl>
      )}
    </LightAndDark>
  ),
};
