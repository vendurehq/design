import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { Kbd } from '../src/components/atoms/kbd.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';
import { InlineCode } from '../src/components/molecules/inline-code.tsx';
import { IssuedSecret, useIssuedSecretGuard } from '../src/components/molecules/issued-secret.tsx';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';

/**
 * Machine text reads left to right in a right-to-left page: code, ids, keys
 * and secrets keep the order of their punctuation. Only the value turns left
 * to right; labels and buttons around it follow the page.
 */
const meta = {
  title: 'Atoms/Layout/Direction machine text',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SECRET = 'whsec_4f7a-1349';
const KEY = 'sk_live_51Hx-9Qa';

function IssuedKey() {
  const guard = useIssuedSecretGuard(() => {});
  return <IssuedSecret guard={guard} secretName="API key" value={KEY} />;
}

function MachineText() {
  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="flex max-w-xl flex-col gap-5 text-sm">
        <p data-testid="prose">
          הפעילו את השרת עם <InlineCode>--watch</InlineCode> כדי לטעון מחדש.
        </p>
        <p data-testid="keys">
          לחצו <Kbd>⌘K</Kbd> כדי לפתוח הזמנה.
        </p>
        <div data-testid="id">
          <IdChip value="ord_7f3a-01" copyLabel="העתקת מזהה" copiedLabel="המזהה הועתק" />
        </div>
        <div data-testid="secret">
          <SecretValue loadValue={async () => SECRET} />
        </div>
        <IssuedKey />
      </div>
    </DirectionProvider>
  );
}

/** The x of the first and the last character of an element's text. */
function charEdges(element: Element) {
  const node = [...element.childNodes].find((child) => child.nodeType === Node.TEXT_NODE) as Text;
  const at = (index: number) => {
    const range = document.createRange();
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    return range.getBoundingClientRect().left;
  };
  return { first: at(0), last: at((node.textContent ?? '').length - 1) };
}

/** The value is left to right and its first character sits left of its last one. */
async function expectLeftToRight(element: Element) {
  await expect(getComputedStyle(element).direction).toBe('ltr');
  const { first, last } = charEdges(element);
  await expect(first).toBeLessThan(last);
}

export const MachineTextRightToLeft: Story = {
  render: () => <MachineText />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inside = (testId: string, selector: string) =>
      canvas.getByTestId(testId).querySelector(selector) as HTMLElement;

    await expectLeftToRight(inside('prose', '[data-slot=inline-code]'));
    // The key box follows the page, so its logical margins still point to the end; its text is left to right.
    await expect(getComputedStyle(inside('keys', '[data-slot=kbd]')).direction).toBe('rtl');
    await expectLeftToRight(inside('keys', '[data-slot=kbd] > span'));
    // The chip follows the page; only its value is left to right.
    const chip = inside('id', '[data-slot=id-chip]');
    await expect(getComputedStyle(chip).direction).toBe('rtl');
    await expectLeftToRight(within(chip).getByText('ord_7f3a-01'));

    // The masked value, then the revealed one.
    const secret = inside('secret', '[data-slot=secret-value]');
    await expect(getComputedStyle(secret).direction).toBe('rtl');
    await expect(getComputedStyle(inside('secret', '[data-slot=secret-value-value]')).direction).toBe('ltr');
    await userEvent.click(within(secret).getAllByRole('button')[0] as HTMLElement);
    await waitFor(() => expect(within(secret).getByText(SECRET)).toBeVisible());
    await expectLeftToRight(within(secret).getByText(SECRET));

    // The clipboard refuses: the key shows in a read-only field, left to right, under a right-to-left label.
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError');
        },
      },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'Copy API key' }));
    const field = await canvas.findByRole('textbox', { name: 'API key' });
    await expect(field).toHaveValue(KEY);
    await expect(getComputedStyle(field).direction).toBe('ltr');
    const label = canvasElement.querySelector(`label[for="${field.id}"]`) as HTMLElement;
    await expect(getComputedStyle(label).direction).toBe('rtl');
  },
};
