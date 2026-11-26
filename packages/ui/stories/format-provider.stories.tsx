import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import {
  FormatProvider,
  type FormatMessages,
} from '../src/components/molecules/format-provider.tsx';
import { PasswordInput } from '../src/components/molecules/password-input.tsx';
import { SearchTrigger } from '../src/components/molecules/search-trigger.tsx';

const german: FormatMessages = {
  copyButton: { copy: 'Kopieren', copied: 'Kopiert' },
  passwordInput: { showPassword: 'Passwort anzeigen', hidePassword: 'Passwort verbergen' },
  searchTrigger: { label: 'Suchen', commandPalette: 'Befehlspalette' },
};

function Texts() {
  return (
    <div className="flex w-72 flex-col items-start gap-4">
      <SearchTrigger collapse="never" />
      <PasswordInput aria-label="Passwort" placeholder="Passwort" />
      <CopyableText value="sku-123">SKU-123</CopyableText>
    </div>
  );
}

const meta = {
  title: 'Molecules/FormatProvider',
  component: FormatProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "`messages` translates the library's texts in one place. A component's own label prop wins over it; a text it leaves out stays English.",
      },
    },
  },
} satisfies Meta<typeof FormatProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No provider: every text is the English default. */
export const EnglishDefaults: Story = {
  args: { children: null },
  render: () => <Texts />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Search (command palette)' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Show password' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Copy' })).toBeVisible();
  },
};

/** `messages` in German: the components read their texts from the provider. */
export const Messages: Story = {
  args: { messages: german, children: null },
  render: (args) => (
    <FormatProvider {...args}>
      <Texts />
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Suchen (Befehlspalette)' })).toBeVisible();
    await expect(canvas.getByText('Suchen')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Kopieren' })).toBeVisible();
    const toggle = canvas.getByRole('button', { name: 'Passwort anzeigen' });
    await userEvent.click(toggle);
    await expect(canvas.getByRole('button', { name: 'Passwort verbergen' })).toBeVisible();
  },
};

/** A label prop on the component wins over `messages`. */
export const LabelPropWins: Story = {
  args: { messages: german, children: null },
  render: (args) => (
    <FormatProvider {...args}>
      <PasswordInput aria-label="Passwort" showPasswordLabel="Zeigen" />
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Zeigen' })).toBeVisible();
  },
};
