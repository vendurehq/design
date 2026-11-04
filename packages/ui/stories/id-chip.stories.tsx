import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

const meta = {
  title: 'Molecules/IdChip',
  component: IdChip,
  tags: ['autodocs'],
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    truncate: 'middle',
    copyable: true,
  },
  argTypes: {
    value: { control: 'text' },
    display: { control: 'text' },
    truncate: {
      control: 'inline-radio',
      options: ['middle', 'start', 'none'],
    },
    copyable: { control: 'boolean' },
  },
} satisfies Meta<typeof IdChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The full value is always copied and shown in the tooltip of a shortened chip.
export const TruncationModes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="middle" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="start" />
      <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" truncate="none" />
    </div>
  ),
};

// `display` overrides the rendered text but the full `value` is still copied.
export const CustomDisplay: Story = {
  args: {
    value: '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f',
    display: '5c1f8b7e-2f3a-4c9d…',
  },
};

// Read-only IDs drop the copy affordance.
export const NotCopyable: Story = {
  args: { copyable: false },
};

/**
 * Name what the button copies with `copyLabel`, and handle a failed clipboard
 * write with `onCopyError` (or a `CopyFeedbackProvider`).
 */
export const CustomCopyLabel: Story = {
  args: {
    value: '9f2c4e1a7b3d5f6e8a0c2b4d6f8e1a3c5b7d9f0e',
    display: '9f2c4e1',
    copyLabel: 'Copy commit SHA',
    copiedLabel: 'Commit SHA copied',
  },
};

/**
 * The whole chip is the copy target. A click on the value (not only on the
 * icon) copies; the tooltip changes from "Copy" to "Copied" and the icon turns
 * into a check-mark. The play function stubs the clipboard, so the run does
 * not depend on browser clipboard permissions.
 */
export const WholeChipCopies: Story = {
  args: { value: '9f2c4e1a7b3d5f6e8a0c2b4d6f8e1a3c5b7d9f0e', copyLabel: 'Copy commit SHA' },
  play: async ({ canvasElement }) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
    const canvas = within(canvasElement);
    // The point over the value text hits the copy button (its stretched
    // ::after), which is what makes the whole chip the click target.
    const text = canvas.getByText('9f2c4e1a…9f0e').getBoundingClientRect();
    const hit = document.elementFromPoint(text.left + 4, text.top + text.height / 2);
    const button = canvas.getByRole('button', { name: 'Copy commit SHA' });
    await expect(hit).toBe(button);
    await userEvent.click(button);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Copied' })).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(within(document.body).getByText('Copied', { selector: 'span' })).toBeVisible(),
    );
  },
};
