import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
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

const TOKEN = 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7';

// `undefined` means the token has not loaded yet: a skeleton the size of the
// chip. `null` and `''` mean there is no token: the fallback, an em dash.
export const LoadingAndMissing: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-sm">
      {[true, false].map((copyable) => (
        <div key={String(copyable)} className="flex flex-col gap-3">
          <p data-state="loaded" data-copyable={copyable}>
            Key <AnonymizedToken value={TOKEN} copyable={copyable} /> created today.
          </p>
          <p data-state="loading" data-copyable={copyable}>
            Key <AnonymizedToken value={undefined} copyable={copyable} /> created today.
          </p>
        </div>
      ))}
      <p data-state="missing">
        Key <AnonymizedToken value={null} /> created today.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rect = (selector: string) =>
      canvasElement.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
    for (const copyable of ['true', 'false']) {
      const p = (state: string) => `p[data-state="${state}"][data-copyable="${copyable}"]`;
      const chip = rect(`${p('loaded')} [data-slot="anonymized-token"]`);
      const skeleton = rect(`${p('loading')} [data-slot="skeleton"]`);

      // The line and the chip box do not move when the token arrives.
      await expect(rect(p('loading'))?.height).toBe(rect(p('loaded'))?.height);
      await expect(skeleton?.height).toBe(chip?.height);
      await expect(Math.abs((skeleton?.width ?? 0) - (chip?.width ?? 0))).toBeLessThan(2);
      await expect(Math.abs((skeleton?.top ?? 0) - (chip?.top ?? 0) - (rect(p('loading'))?.top ?? 0) + (rect(p('loaded'))?.top ?? 0))).toBeLessThan(1);
    }
    const busy = canvasElement.querySelector('p[data-state="loading"] [aria-busy="true"]');
    await expect(busy?.textContent).toBe('Loading token');
    await expect(canvasElement.querySelector('p[data-state="missing"]')?.textContent).toContain('—');
  },
};
