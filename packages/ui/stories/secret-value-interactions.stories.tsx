import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';

// Mounted interaction tests for SecretValue. The test runner (CI step
// "Storybook a11y smoke test") runs each `play` in a real browser, so these
// fail when the component stops calling `loadValue`, dispatching its result,
// or wiring its buttons.

const SECRET = 'postgres://shop:p4ssw0rd@db.internal:5432/shop';

/** A `loadValue` whose promise the test settles by hand. */
function deferredLoader() {
  let settle: { resolve: (value: string) => void; reject: (error: Error) => void } | undefined;
  const load = fn(
    () =>
      new Promise<string>((resolve, reject) => {
        settle = { resolve, reject };
      }),
  );
  return {
    load,
    resolve: (value: string) => settle?.resolve(value),
    reject: () => settle?.reject(new Error('Forbidden')),
    reset: () => {
      load.mockClear();
      settle = undefined;
    },
  };
}

/** Fails when the secret appears anywhere in the rendered markup. */
function expectSecretAbsent(canvasElement: HTMLElement) {
  expect(canvasElement.innerHTML).not.toContain(SECRET);
}

const meta = {
  title: 'Molecules/SecretValue/Interactions',
  component: SecretValue,
  args: { loadValue: async () => SECRET },
  render: (args) => <SecretValue data-testid="secret" {...args} />,
} satisfies Meta<typeof SecretValue>;

export default meta;
type Story = StoryObj<typeof meta>;

const revealLoader = deferredLoader();

/** Reveal loads on click, shows a spinner while pending, then the value. */
export const RevealLoadsOnClick: Story = {
  args: { loadValue: revealLoader.load },
  beforeEach: () => revealLoader.reset(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('secret');
    await expect(revealLoader.load).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    await expect(revealLoader.load).toHaveBeenCalledTimes(1);
    await expect(root).toHaveAttribute('data-state', 'loading');
    await expect(canvas.getByRole('button', { name: 'Show value' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expectSecretAbsent(canvasElement);

    revealLoader.resolve(SECRET);
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'revealed'));
    await expect(canvas.getByText(SECRET)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Hide value' })).toBeInTheDocument();
  },
};

const retryLoader = deferredLoader();

/** A failed load shows the error; a second click retries and reveals. */
export const LoadFailsThenRetries: Story = {
  args: { loadValue: retryLoader.load },
  beforeEach: () => retryLoader.reset(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('secret');

    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    retryLoader.reject();
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'error'));
    await expect(canvas.getByRole('alert')).toHaveTextContent("Couldn't load the value.");
    expectSecretAbsent(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    await expect(retryLoader.load).toHaveBeenCalledTimes(2);
    await expect(root).toHaveAttribute('data-state', 'loading');
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();

    retryLoader.resolve(SECRET);
    await waitFor(() => expect(root).toHaveAttribute('data-state', 'revealed'));
    await expect(canvas.getByText(SECRET)).toBeVisible();
  },
};

const hideLoader = deferredLoader();

/** Hide masks the value again and removes it from the DOM. */
export const HideClearsValue: Story = {
  args: { loadValue: hideLoader.load },
  beforeEach: () => hideLoader.reset(),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('secret');

    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    hideLoader.resolve(SECRET);
    await waitFor(() => expect(canvas.getByText(SECRET)).toBeVisible());

    await userEvent.click(canvas.getByRole('button', { name: 'Hide value' }));
    await expect(root).toHaveAttribute('data-state', 'hidden');
    await expect(canvas.getByText('••••••••')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Show value' })).toBeInTheDocument();
    expectSecretAbsent(canvasElement);
  },
};

const copyLoader = deferredLoader();
const copied: string[] = [];

/** Copy while hidden loads and copies the value without revealing it. */
export const CopyWhileHidden: Story = {
  args: { loadValue: copyLoader.load },
  beforeEach: () => {
    copyLoader.reset();
    copied.length = 0;
    // Records what reaches the clipboard instead of writing to it.
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          copied.push(text);
        },
        write: async (items: ClipboardItem[]) => {
          const blob = await items[0]?.getType('text/plain');
          if (blob) copied.push(await blob.text());
        },
      },
    });
    return () => {
      // Drops the own property, so the prototype's real clipboard is back.
      Reflect.deleteProperty(navigator, 'clipboard');
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByTestId('secret');

    await userEvent.click(canvas.getByRole('button', { name: 'Copy value' }));
    await expect(copyLoader.load).toHaveBeenCalledTimes(1);
    copyLoader.resolve(SECRET);

    await waitFor(() => expect(copied).toEqual([SECRET]));
    await expect(root).toHaveAttribute('data-state', 'hidden');
    await expect(canvas.getByText('••••••••')).toBeInTheDocument();
    expectSecretAbsent(canvasElement);
  },
};
