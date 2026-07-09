import type { Meta, StoryObj } from '@storybook/react';
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
