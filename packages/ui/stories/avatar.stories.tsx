import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from '../src/components/atoms/avatar.tsx';

const meta = {
  title: 'Atoms/Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://i.pravatar.cc/150?u=alice" alt="Alice Johnson" />
      <AvatarFallback>AJ</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>DF</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
        <AvatarBadge />
      </Avatar>
    </div>
  ),
};

// A 1x1 image as a data URI, so the story does not depend on the network.
const logo =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="gray"/></svg>';

/**
 * `shape="square"` for an account, an organisation or a channel; the default
 * round shape for a person. The shape covers the ring, the image and the
 * fallback.
 */
export const Square: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radius = (el: Element) => parseFloat(getComputedStyle(el).borderTopLeftRadius);
    const square = canvas.getByTestId('square-image');
    const round = canvas.getByTestId('round-image');
    const image = await waitFor(() => {
      const img = square.querySelector('[data-slot=avatar-image]');
      expect(img).not.toBeNull();
      return img as Element;
    });
    const fallback = canvas.getByTestId('square-fallback').querySelector('[data-slot=avatar-fallback]') as Element;
    for (const el of [square, image, fallback]) {
      await expect(radius(el)).toBeLessThan(radius(round));
    }
  },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar shape="square" data-testid="square-image">
        <AvatarImage src={logo} alt="Acme logo" />
        <AvatarFallback>AC</AvatarFallback>
      </Avatar>
      <Avatar shape="square" data-testid="square-fallback">
        <AvatarFallback>GL</AvatarFallback>
      </Avatar>
      <Avatar data-testid="round-image">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=alice" alt="Alice" />
        <AvatarFallback>AJ</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=bob" alt="Bob" />
        <AvatarFallback>BS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/150?u=carol" alt="Carol" />
        <AvatarFallback>CW</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  ),
};
