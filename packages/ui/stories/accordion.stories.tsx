import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../src/components/atoms/accordion.tsx';

const meta = {
  title: 'Atoms/Layout/Accordion',
  component: Accordion,
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A closed trigger fills on hover. Opening an item turns its chevron over and
 * eases the panel's height and opacity on one timing. A second click mid-way
 * reverses the panel from where it is.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Is it animated?' });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByText(/The panel eases open and shut/)).toBeNull());
  },
  render: () => (
    <Accordion className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. The panel eases open and shut, and the chevron turns over. With reduced motion, the panel only fades.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion multiple className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Section</AccordionTrigger>
        <AccordionContent>
          Content for the first section. Multiple items can be open at once.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Section</AccordionTrigger>
        <AccordionContent>
          Content for the second section. Try opening both at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Section</AccordionTrigger>
        <AccordionContent>
          Content for the third section with additional details.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/** The chevron centres on the first line of the title. Measures the centre of the chevron against the centre of the first line box. */
function chevronOffset(trigger: HTMLElement) {
  const text = Array.from(trigger.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
  if (!text) throw new Error('The trigger has no title text');
  const range = document.createRange();
  range.selectNodeContents(text);
  const firstLine = range.getClientRects()[0];
  const chevron = trigger.querySelector('[data-slot="accordion-trigger-icon"]')?.getBoundingClientRect();
  if (!firstLine || !chevron) throw new Error('Nothing to measure');
  const lineHeight = Number.parseFloat(getComputedStyle(trigger).lineHeight);
  const lineTop = firstLine.top + (firstLine.height - lineHeight) / 2;
  return chevron.top + chevron.height / 2 - (lineTop + lineHeight / 2);
}

/**
 * A title that wraps keeps the chevron on its first line, centred on it.
 */
export const LongTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of [/Can I move a store/, 'Is it short?']) {
      const trigger = canvas.getByRole('button', { name });
      await expect(Math.abs(chevronOffset(trigger))).toBeLessThanOrEqual(0.5);
    }
  },
  render: () => (
    <Accordion className="w-full max-w-xs">
      <AccordionItem value="long">
        <AccordionTrigger>
          Can I move a store to another region without taking it offline for customers?
        </AccordionTrigger>
        <AccordionContent>Yes. Cloud copies the data first and switches over at the end.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="short">
        <AccordionTrigger>Is it short?</AccordionTrigger>
        <AccordionContent>Yes.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
