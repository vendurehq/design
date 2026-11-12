import type { Meta, StoryObj } from '@storybook/react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from '../src/components/atoms/input-group.tsx';
import { Kbd, KbdGroup } from '../src/components/atoms/kbd.tsx';
import { Search, Copy } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

const meta = {
  title: 'Atoms/Forms/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText><Search /></InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  ),
};

/**
 * A button sits 4px from the edge: its own 6px padding puts its icon 10px in,
 * like the text of an Input.
 */
export const WithButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput aria-label="Value" placeholder="Enter value..." />
      <InputGroupAddon align="inline-end">
        <InputGroupButton><Copy /> Copy</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(insets(canvasElement, 'inline-end').end).toBe(4);
  },
};

/**
 * A key hint in an addon has no fill of its own: its text and hairline sit
 * straight on the field, so the text keeps its contrast in light and dark.
 */
export const WithKbd: Story = {
  render: () => (
    <div className="grid gap-4">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText><Search /></InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput aria-label="Command" placeholder="Run a command..." />
        <InputGroupAddon align="inline-end">
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea placeholder="Write your message..." />
      <InputGroupAddon align="block-end">
        <InputGroupButton>Submit</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/**
 * The button shows only when there is something to send. Empty, or only
 * spaces, and it is gone: hidden, inert and out of the tab order. The first
 * character brings it in from the bottom-right corner (`moderate`, `out`: it
 * fades, scales from 0.9 and loses a 2px blur). Clearing the field sends it
 * away faster (`fast`, `soft`). The key hint arrives and leaves with it. With
 * reduced motion, only the fade stays. Cmd or Ctrl + Enter sends.
 */
export const SubmitOnContent: Story = {
  render: function SubmitOnContentStory() {
    const [value, setValue] = useState('');
    const canSend = value.trim().length > 0;
    const send = () => {
      if (canSend) setValue('');
    };
    return (
      <InputGroup>
        <InputGroupTextarea
          aria-label="Message"
          placeholder="Write your message..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) send();
          }}
        />
        <InputGroupAddon align="block-end">
          <span
            data-slot="submit-reveal"
            data-hidden={!canSend}
            inert={!canSend}
            aria-hidden={!canSend}
            className="ms-auto flex origin-bottom-right items-center gap-2 transition-[opacity,scale,filter] duration-moderate ease-out data-[hidden=true]:scale-90 data-[hidden=true]:opacity-0 data-[hidden=true]:blur-[2px] data-[hidden=true]:duration-fast data-[hidden=true]:ease-soft motion-reduce:transition-opacity motion-reduce:data-[hidden=true]:scale-100 motion-reduce:data-[hidden=true]:blur-none"
          >
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
            </KbdGroup>
            <InputGroupButton variant="default" onClick={send}>
              Send
            </InputGroupButton>
          </span>
        </InputGroupAddon>
      </InputGroup>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Message' });
    const reveal = () => canvasElement.querySelector<HTMLElement>('[data-slot=submit-reveal]')!;
    await step('empty: no button to reach', async () => {
      await expect(reveal()).toHaveAttribute('data-hidden', 'true');
      await expect(reveal()).toHaveAttribute('inert');
      await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
    });
    await step('only spaces: still hidden', async () => {
      await userEvent.type(field, '   ');
      await expect(reveal()).toHaveAttribute('data-hidden', 'true');
    });
    await step('a character brings the button in', async () => {
      await userEvent.type(field, 'Hi');
      await waitFor(() => expect(canvas.getByRole('button', { name: 'Send' })).toBeVisible());
      await expect(reveal()).toHaveAttribute('data-hidden', 'false');
    });
    await step('clearing the field takes it away again', async () => {
      await userEvent.clear(field);
      await expect(reveal()).toHaveAttribute('data-hidden', 'true');
      await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
    });
  },
};

export const WithTextAddon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};

/** Distance of an addon's content from the group's start and end edges. */
function insets(canvasElement: HTMLElement, align: string) {
  const group = canvasElement.querySelector('[data-slot="input-group"]') as HTMLElement;
  const addon = group.querySelector(`[data-slot="input-group-addon"][data-align="${align}"]`) as HTMLElement;
  const outer = group.getBoundingClientRect();
  const inner = (addon.firstElementChild as HTMLElement).getBoundingClientRect();
  return { start: Math.round(inner.left - outer.left), end: Math.round(outer.right - inner.right) };
}

/**
 * Text addons sit 10px from the edge, like the text of an Input, in left-to-right
 * and right-to-left.
 */
export const BothSides: Story = {
  render: () => (
    <div className="grid gap-4">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Amount" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>USD</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <div dir="rtl" data-testid="rtl">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput aria-label="المبلغ" placeholder="0.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(insets(canvasElement, 'inline-start').start).toBe(10);
    await expect(insets(canvasElement, 'inline-end').end).toBe(10);
    const rtl = canvasElement.querySelector<HTMLElement>('[data-testid="rtl"]') as HTMLElement;
    await expect(insets(rtl, 'inline-start').end).toBe(10);
    await expect(insets(rtl, 'inline-end').start).toBe(10);
  },
};
