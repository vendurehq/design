import type { Meta, StoryObj } from '@storybook/react';
import { HomeIcon, PackageIcon, TruckIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  ChoiceCard,
  ChoiceCardBadge,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardGroup,
  ChoiceCardMedia,
  ChoiceCardMeta,
  ChoiceCardTitle,
} from '../src/components/molecules/choice-card.tsx';

const meta = {
  title: 'Molecules/ChoiceCard',
  component: ChoiceCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A card the user picks from a set: a plan, a shipping method, an address, an asset. The card is the control: a radio in a single-choice group, a checkbox in a multiple-choice group (`multiple`). Arrow keys move a single choice; Space toggles a card.',
      },
    },
  },
} satisfies Meta<typeof ChoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SHIPPING = [
  { value: 'standard', icon: PackageIcon, title: 'Standard', description: '3 to 5 working days', price: '€4.90' },
  { value: 'express', icon: TruckIcon, title: 'Express', description: 'Next working day', price: '€12.00' },
  { value: 'same-day', icon: ZapIcon, title: 'Same day', description: 'Order before 11:00', price: '€19.00' },
];

export const SingleChoice: Story = {
  args: { value: 'standard' },
  render: () => {
    const [value, setValue] = useState('standard');
    return (
      <ChoiceCardGroup aria-label="Shipping method" value={value} onValueChange={(next) => setValue(next as string)} className="max-w-md">
        {SHIPPING.map((option) => (
          <ChoiceCard key={option.value} value={option.value}>
            <ChoiceCardMedia>
              <option.icon />
            </ChoiceCardMedia>
            <ChoiceCardContent>
              <ChoiceCardTitle>{option.title}</ChoiceCardTitle>
              <ChoiceCardDescription>{option.description}</ChoiceCardDescription>
            </ChoiceCardContent>
            <ChoiceCardMeta>{option.price}</ChoiceCardMeta>
          </ChoiceCard>
        ))}
      </ChoiceCardGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const express = canvas.getByRole('radio', { name: 'Express' });
    // The description and the meta join the description once they mount.
    await waitFor(() => expect(express).toHaveAccessibleDescription('Next working day €12.00'));
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toBeChecked();
  },
};

const PRODUCTS = [
  { value: 'tee', title: 'Organic cotton tee', description: 'SKU TEE-001 · 128 in stock' },
  { value: 'hoodie', title: 'Heavyweight hoodie', description: 'SKU HOD-014 · 42 in stock' },
  { value: 'cap', title: 'Six-panel cap', description: 'SKU CAP-007 · 9 in stock' },
];

export const MultipleChoice: Story = {
  args: { value: 'tee' },
  render: () => {
    const [value, setValue] = useState<string[]>(['tee']);
    return (
      <ChoiceCardGroup multiple aria-label="Products" value={value} onValueChange={setValue} className="max-w-md">
        {PRODUCTS.map((product) => (
          <ChoiceCard key={product.value} value={product.value} size="sm">
            <ChoiceCardContent>
              <ChoiceCardTitle>{product.title}</ChoiceCardTitle>
              <ChoiceCardDescription>{product.description}</ChoiceCardDescription>
            </ChoiceCardContent>
          </ChoiceCard>
        ))}
      </ChoiceCardGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cap = canvas.getByRole('checkbox', { name: 'Six-panel cap' });
    await userEvent.click(cap);
    await expect(cap).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Organic cotton tee' })).toBeChecked();
    await userEvent.click(cap);
    await expect(cap).not.toBeChecked();
  },
};

// Flat placeholder tiles, so the story renders offline.
const tile = (fill: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Crect width='4' height='4' fill='%23${fill}'/%3E%3C/svg%3E`;

const ASSETS = [
  { value: 'a1', name: 'Tee, front', src: tile('c7d2fe') },
  { value: 'a2', name: 'Tee, back', src: tile('bae6fd') },
  { value: 'a3', name: 'Hoodie, front', src: tile('d9f99d') },
  { value: 'a4', name: 'Hoodie, detail', src: tile('fde68a') },
  { value: 'a5', name: 'Cap, side', src: tile('fecaca') },
  { value: 'a6', name: 'Cap, top', src: tile('e9d5ff') },
];

export const MediaGrid: Story = {
  args: { value: 'a2' },
  render: () => {
    const [value, setValue] = useState<string[]>(['a2', 'a4']);
    return (
      <ChoiceCardGroup multiple aria-label="Assets" value={value} onValueChange={setValue} className="max-w-md grid-cols-3">
        {ASSETS.map((asset) => (
          <ChoiceCard key={asset.value} value={asset.value} variant="media" aria-label={asset.name}>
            <img src={asset.src} alt="" />
          </ChoiceCard>
        ))}
      </ChoiceCardGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('checkbox', { name: 'Tee, back' })).toBeChecked();
    await expect(canvas.getByRole('checkbox', { name: 'Tee, front' })).not.toBeChecked();
  },
};

const PLANS = [
  { value: 'starter', title: 'Starter', description: 'One shop, community support', price: '€29 / month' },
  { value: 'growth', title: 'Growth', description: 'Three shops, email support', price: '€99 / month', current: true },
  { value: 'scale', title: 'Scale', description: 'Unlimited shops, priority support', price: '€299 / month' },
];

export const CurrentPlan: Story = {
  args: { value: 'growth' },
  render: () => {
    const [value, setValue] = useState('scale');
    return (
      <ChoiceCardGroup aria-label="Plan" value={value} onValueChange={(next) => setValue(next as string)} className="max-w-3xl sm:grid-cols-3">
        {PLANS.map((plan) => (
          <ChoiceCard key={plan.value} value={plan.value} className="flex-col">
            <ChoiceCardContent>
              <ChoiceCardTitle>
                {plan.title}
                {plan.current ? <ChoiceCardBadge>Current</ChoiceCardBadge> : null}
              </ChoiceCardTitle>
              <ChoiceCardDescription>{plan.description}</ChoiceCardDescription>
            </ChoiceCardContent>
            <ChoiceCardMeta className="ms-0 text-start">{plan.price}</ChoiceCardMeta>
          </ChoiceCard>
        ))}
      </ChoiceCardGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // "Current" marks the plan the customer is on; the selection is the plan
    // they are moving to.
    await expect(canvas.getByRole('radio', { name: 'Growth Current' })).not.toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Scale' })).toBeChecked();
  },
};

export const Disabled: Story = {
  args: { value: 'home' },
  render: () => (
    <ChoiceCardGroup aria-label="Delivery address" defaultValue="home" className="max-w-md">
      <ChoiceCard value="home">
        <ChoiceCardMedia>
          <HomeIcon />
        </ChoiceCardMedia>
        <ChoiceCardContent>
          <ChoiceCardTitle>Home</ChoiceCardTitle>
          <ChoiceCardDescription>Keizersgracht 12, 1015 CS Amsterdam</ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
      <ChoiceCard value="office" disabled>
        <ChoiceCardMedia>
          <HomeIcon />
        </ChoiceCardMedia>
        <ChoiceCardContent>
          <ChoiceCardTitle>Office</ChoiceCardTitle>
          <ChoiceCardDescription>We do not ship to this country</ChoiceCardDescription>
        </ChoiceCardContent>
      </ChoiceCard>
    </ChoiceCardGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const office = canvas.getByRole('radio', { name: 'Office' });
    await expect(office).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(office);
    await expect(office).not.toBeChecked();
    await expect(canvas.getByRole('radio', { name: 'Home' })).toBeChecked();
  },
};

export const Keyboard: Story = {
  args: { value: 'standard' },
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <ChoiceCardGroup aria-label="Shipping method" defaultValue="standard">
        {SHIPPING.map((option) => (
          <ChoiceCard key={option.value} value={option.value} size="sm" disabled={option.value === 'express'}>
            <ChoiceCardContent>
              <ChoiceCardTitle>{option.title}</ChoiceCardTitle>
            </ChoiceCardContent>
            <ChoiceCardMeta>{option.price}</ChoiceCardMeta>
          </ChoiceCard>
        ))}
      </ChoiceCardGroup>
      <ChoiceCardGroup multiple aria-label="Gift options" defaultValue={[]}>
        <ChoiceCard value="wrap" size="sm">
          <ChoiceCardTitle>Gift wrap</ChoiceCardTitle>
        </ChoiceCard>
        <ChoiceCard value="note" size="sm">
          <ChoiceCardTitle>Gift note</ChoiceCardTitle>
        </ChoiceCard>
      </ChoiceCardGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const standard = canvas.getByRole('radio', { name: 'Standard' });
    const sameDay = canvas.getByRole('radio', { name: 'Same day' });

    // Tab enters the group on the checked card.
    await userEvent.tab();
    await expect(standard).toHaveFocus();
    // Arrow down skips the disabled card and checks the next one.
    await userEvent.keyboard('{ArrowDown}');
    await expect(sameDay).toHaveFocus();
    await expect(sameDay).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(standard).toBeChecked();

    // Tab leaves the radio group; Space toggles a checkbox card.
    await userEvent.tab();
    const wrap = canvas.getByRole('checkbox', { name: 'Gift wrap' });
    await expect(wrap).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(wrap).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(wrap).not.toBeChecked();
  },
};
