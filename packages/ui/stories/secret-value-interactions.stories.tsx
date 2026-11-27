import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';
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
    // The spinner announces the English text by default.
    await expect(canvas.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

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

/** Centre of an element's border box. */
function centre(el: Element) {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * Show and Copy each own a 24 x 24 px target that the other does not cover
 * (WCAG 2.5.8), while the icons stay 13px. Their centres are at least 24px
 * apart, and every corner of a 23 x 23 px square around each centre hits that
 * button.
 */
export const TargetsDoNotOverlap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const show = canvas.getByRole('button', { name: 'Show value' });
    const copy = canvas.getByRole('button', { name: 'Copy value' });

    await expect(show.getBoundingClientRect().width).toBeLessThan(14);
    const a = centre(show);
    const b = centre(copy);
    await expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThanOrEqual(24);

    for (const [button, c] of [
      [show, a],
      [copy, b],
    ] as const) {
      for (const dx of [-11.5, 11.5]) {
        for (const dy of [-11.5, 11.5]) {
          const hit = document.elementFromPoint(c.x + dx, c.y + dy);
          await expect(button.contains(hit)).toBe(true);
        }
      }
    }
  },
};

const messagesLoader = deferredLoader();

/** `FormatProvider` `messages` translate the spinner text while the value loads. */
export const LoadingTextFromMessages: Story = {
  args: { loadValue: messagesLoader.load },
  beforeEach: () => messagesLoader.reset(),
  render: (args) => (
    <FormatProvider messages={{ secretValue: { loading: 'Wird geladen' } }}>
      <SecretValue data-testid="secret" {...args} />
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    await expect(canvas.getByRole('status', { name: 'Wird geladen' })).toBeInTheDocument();
    messagesLoader.resolve(SECRET);
    await waitFor(() => expect(canvas.getByText(SECRET)).toBeVisible());
  },
};

const labelLoader = deferredLoader();

/** `loadingLabel` wins over `messages`. */
export const LoadingTextFromProp: Story = {
  args: { loadValue: labelLoader.load, loadingLabel: 'Chargement' },
  beforeEach: () => labelLoader.reset(),
  render: (args) => (
    <FormatProvider messages={{ secretValue: { loading: 'Wird geladen' } }}>
      <SecretValue data-testid="secret" {...args} />
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show value' }));
    await expect(canvas.getByRole('status', { name: 'Chargement' })).toBeInTheDocument();
    labelLoader.resolve(SECRET);
    await waitFor(() => expect(canvas.getByText(SECRET)).toBeVisible());
  },
};
