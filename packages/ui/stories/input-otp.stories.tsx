import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from 'storybook/test';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '../src/components/atoms/input-otp.tsx';

const meta = {
  title: 'Atoms/Forms/InputOTP',
  component: InputOTP,
  tags: ['autodocs'],
  // baseline args to satisfy required props; all stories use render()
  args: { maxLength: 6, children: null },
} satisfies Meta<typeof InputOTP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputOTP maxLength={6} aria-label="One-time code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const FourDigit: Story = {
  render: () => (
    <InputOTP maxLength={4} aria-label="One-time code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

export const Disabled: Story = {
  render: () => (
    <InputOTP maxLength={6} disabled aria-label="One-time code">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

/**
 * Invalid: the group, which draws the field, turns its hairline destructive,
 * and the active slot rings in destructive. No halo around the group.
 */
export const Invalid: Story = {
  render: () => (
    <InputOTP maxLength={4} aria-label="One-time code" defaultValue="12">
      <InputOTPGroup>
        <InputOTPSlot index={0} aria-invalid />
        <InputOTPSlot index={1} aria-invalid />
        <InputOTPSlot index={2} aria-invalid />
        <InputOTPSlot index={3} aria-invalid />
      </InputOTPGroup>
    </InputOTP>
  ),
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>('[data-slot="input-otp-group"]') as HTMLElement;
    const probe = document.createElement('div');
    probe.className = 'bg-muted shadow-[inset_0_0_0_1px_var(--destructive)] outline-destructive';
    canvasElement.append(probe);
    const style = getComputedStyle(group);
    await expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
    await expect(style.boxShadow).toBe(getComputedStyle(probe).boxShadow);
    await expect(style.borderTopLeftRadius).toBe('6px');
    // Slots have no edge of their own: only the hairline between them.
    const [first, second] = canvasElement.querySelectorAll<HTMLElement>('[data-slot="input-otp-slot"]');
    await expect(getComputedStyle(first as HTMLElement).borderTopWidth).toBe('0px');
    await expect(getComputedStyle(second as HTMLElement).borderLeftWidth).toBe('1px');
    // The active slot rings in destructive, 2px inside.
    within(canvasElement).getByRole('textbox').focus();
    const active = await waitFor(() => {
      const slot = canvasElement.querySelector<HTMLElement>('[data-slot="input-otp-slot"][data-active="true"]');
      expect(slot).not.toBeNull();
      return slot as HTMLElement;
    });
    // The slot eases its colours in (transition-all), so wait for the end value.
    await waitFor(() => expect(getComputedStyle(active).outlineColor).toBe(getComputedStyle(probe).outlineColor));
    await expect(getComputedStyle(active).outlineOffset).toBe('-2px');
    probe.remove();
  },
};
