import type { Meta, StoryObj } from '@storybook/react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from '../src/components/atoms/input-group.tsx';
import { Search, Copy } from 'lucide-react';
import { expect } from 'storybook/test';

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
