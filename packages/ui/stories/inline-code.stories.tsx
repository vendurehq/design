import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent } from '../src/components/atoms/card.tsx';
import { InlineCode } from '../src/components/molecules/inline-code.tsx';

const meta = {
  title: 'Molecules/InlineCode',
  component: InlineCode,
  tags: ['autodocs'],
  args: { children: 'runMigrations' },
  argTypes: {
    children: { control: 'text' },
  },
} satisfies Meta<typeof InlineCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The usual case: a token named inside a sentence.
export const InProse: Story = {
  render: () => (
    <p className="max-w-md text-sm">
      Set <InlineCode>runMigrations</InlineCode> to <InlineCode>true</InlineCode> in{' '}
      <InlineCode>vendure-config.ts</InlineCode>, then restart the server.
    </p>
  ),
};

// The text stays `foreground`, so it keeps full contrast in secondary copy.
export const InMutedText: Story = {
  render: () => (
    <p className="text-muted-foreground max-w-md text-sm">
      Install <InlineCode>@vendure/email-plugin</InlineCode> to send order confirmations.
    </p>
  ),
};

// The fill tints whatever it sits on, so it reads on a card as well as on the page.
export const OnCard: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardContent className="text-sm">
        The API key needs the <InlineCode>ReadCatalog</InlineCode> permission.
      </CardContent>
    </Card>
  ),
};
