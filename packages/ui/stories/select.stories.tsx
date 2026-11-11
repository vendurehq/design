import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../src/components/atoms/select.tsx';

const meta = {
  title: 'Atoms/Forms/Select',
  component: SelectTrigger,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function SelectDefault() {
    return (
      <Select>
        <SelectTrigger aria-label="Fruit" className="w-[180px]">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes">Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  },
};

// Swapping the item set while the controlled value stays "" exercises the
// SelectContent remount fix: without it, Base UI's stale item registry would
// keep offering the previous fruit set.
export const DynamicItems: Story = {
  render: function SelectDynamicItems() {
    const fruits = ['Apple', 'Banana', 'Blueberry'];
    const vegetables = ['Carrot', 'Potato', 'Spinach'];
    const [items, setItems] = useState(fruits);

    return (
      <div className="flex flex-col items-start gap-3">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setItems(fruits)}>
            Fruits
          </Button>
          <Button size="sm" variant="outline" onClick={() => setItems(vegetables)}>
            Vegetables
          </Button>
        </div>
        <Select value="">
          <SelectTrigger aria-label="Fruit" className="w-[180px]">
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          {/* Items sit directly under SelectContent: the remount key only
              inspects top-level children, so a SelectGroup wrapper would hide
              the item values and the remount would never fire. */}
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item} value={item.toLowerCase()}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
};

export const WithGroups: Story = {
  render: function SelectWithGroups() {
    return (
      <Select>
        <SelectTrigger aria-label="Timezone" className="w-[220px]">
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>North America</SelectLabel>
            <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
            <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
            <SelectItem value="mst">Mountain Standard Time (MST)</SelectItem>
            <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Europe</SelectLabel>
            <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
            <SelectItem value="cet">Central European Time (CET)</SelectItem>
            <SelectItem value="eet">Eastern European Time (EET)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  },
};

const TAX_CATEGORIES = [
  { value: 'standard', label: 'Standard Tax' },
  { value: 'reduced', label: 'Reduced Tax' },
  { value: 'zero', label: 'Zero Tax' },
];

/**
 * Three selects of one width, with the first, the middle and the last item
 * selected, so each opens its list over the trigger at a different offset.
 */
function OverTrigger({ width }: { width: number }) {
  return (
    <div className="flex flex-col gap-24 py-16">
      {TAX_CATEGORIES.map((selected, index) => (
        <Select key={selected.value} defaultValue={selected.value} items={TAX_CATEGORIES}>
          <SelectTrigger aria-label={`Tax category ${index + 1}`} style={{ width }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAX_CATEGORIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}

/**
 * Opens each select and checks that the list placed over the trigger covers
 * it on every side, with the selected item's text on the trigger's text.
 */
async function expectListCoversTrigger(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  for (const index of [1, 2, 3]) {
    const trigger = canvas.getByRole('combobox', { name: `Tax category ${index}` });
    await userEvent.click(trigger);
    const popup = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('[data-slot=select-content][data-open]');
      expect(element).not.toBeNull();
      expect(element?.dataset.side).toBe('none');
      expect(element?.hasAttribute('data-starting-style')).toBe(false);
      return element as HTMLElement;
    });
    await Promise.all(popup.getAnimations().map((animation) => animation.finished));
    const list = popup.getBoundingClientRect();
    const box = trigger.getBoundingClientRect();
    await expect(list.left).toBeLessThanOrEqual(box.left);
    await expect(list.right).toBeGreaterThanOrEqual(box.right);
    await expect(list.top).toBeLessThanOrEqual(box.top);
    await expect(list.bottom).toBeGreaterThanOrEqual(box.bottom);
    // The list overhangs the trigger by the same amount on both sides.
    await expect(Math.abs(box.left - list.left - (list.right - box.right))).toBeLessThan(0.5);
    const value = trigger.querySelector('[data-slot=select-value]') as HTMLElement;
    const selected = popup.querySelector('[data-slot=select-item][data-selected]')?.firstElementChild as HTMLElement;
    const edge = getComputedStyle(popup).direction === 'rtl' ? 'right' : 'left';
    await expect(Math.abs(selected.getBoundingClientRect()[edge] - value.getBoundingClientRect()[edge])).toBeLessThan(0.5);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('[data-slot=select-content]:is([data-open],[data-ending-style])')).toBeNull());
  }
}

/**
 * A wide trigger, as a form field that fills its column. 720px fits the test
 * runner's 800px viewport with room for the list's overhang.
 */
export const OverTriggerWide: Story = {
  render: () => <OverTrigger width={720} />,
  play: async ({ canvasElement }) => expectListCoversTrigger(canvasElement),
};

/** A narrow trigger, about as wide as its longest item. */
export const OverTriggerNarrow: Story = {
  render: () => <OverTrigger width={150} />,
  play: async ({ canvasElement }) => expectListCoversTrigger(canvasElement),
};

/** Right to left: the list overhangs evenly from the trigger's right edge. */
export const OverTriggerRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" className="px-16">
        <OverTrigger width={240} />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => expectListCoversTrigger(canvasElement),
};

const COUNTRIES = Array.from({ length: 40 }, (_, index) => ({
  value: `country-${index + 1}`,
  label: `Country ${index + 1}`,
}));

/**
 * A list longer than the viewport, opened over its trigger: it scrolls to
 * the selected item and grows out of the trigger like a short list.
 */
export const OverTriggerLongList: Story = {
  render: () => (
    <div className="py-48">
      <Select defaultValue="country-20" items={COUNTRIES}>
        <SelectTrigger aria-label="Country" className="w-60">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((country) => (
            <SelectItem key={country.value} value={country.value}>
              {country.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Rest and invalid (`aria-invalid`), in light and dark. Dark mode uses the full
 * destructive border, not a 50% one that was weaker than the rest border.
 * Pinned to the light page theme so the left panel stays light.
 */
export const Invalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <>
          <Select>
            <SelectTrigger aria-label={`Fruit, ${theme}`} className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
          </Select>
          <Select>
            <SelectTrigger aria-label={`Fruit, invalid, ${theme}`} aria-invalid className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
          </Select>
        </>
      )}
    </LightAndDark>
  ),
};
