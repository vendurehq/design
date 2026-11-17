import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '../src/components/atoms/combobox.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../src/components/atoms/input-group.tsx';
import { NativeSelect, NativeSelectOption } from '../src/components/atoms/native-select.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/atoms/select.tsx';
import { Toggle } from '../src/components/atoms/toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from '../src/components/atoms/toggle-group.tsx';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Foundations/Control sizes',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Size = 'xs' | 'sm' | 'default' | 'lg';

/** One size name, one height, in every control that takes a `size`. Button sets the scale. */
const HEIGHTS: Record<Size, number> = { xs: 24, sm: 28, default: 34, lg: 40 };

const fruits = ['Apple', 'Banana', 'Cherry'];

function Cell({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div data-control={name} className="flex">
      {children}
    </div>
  );
}

function SelectControl({ size }: { size: 'sm' | 'default' }) {
  return (
    <Select>
      <SelectTrigger size={size} aria-label="Fruit" className="w-32">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {fruits.map((fruit) => (
          <SelectItem key={fruit} value={fruit}>
            {fruit}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ComboboxControl({ size }: { size: 'sm' | 'default' }) {
  return (
    <Combobox items={fruits}>
      <ComboboxTrigger size={size} aria-label="Fruit" className="w-32">
        <ComboboxValue placeholder="Combobox" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList>
          {(fruit: string) => (
            <ComboboxItem key={fruit} value={fruit}>
              {fruit}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function NativeSelectControl({ size }: { size: 'sm' | 'default' }) {
  return (
    <NativeSelect size={size} aria-label="Fruit" className="w-32">
      <NativeSelectOption value="">Native</NativeSelectOption>
      {fruits.map((fruit) => (
        <NativeSelectOption key={fruit} value={fruit}>
          {fruit}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

function ToggleGroupControl({ size }: { size: 'sm' | 'default' | 'lg' }) {
  return (
    <ToggleGroup size={size} variant="outline" aria-label="Text style">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

const rows: Record<Size, ReactNode> = {
  xs: (
    <>
      <Cell name="Button">
        <Button size="xs" variant="outline">
          Button
        </Button>
      </Cell>
      <Cell name="Button icon">
        <Button size="icon-xs" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </Cell>
      <Cell name="InputGroupButton">
        <InputGroupButton size="xs" variant="outline">
          Copy
        </InputGroupButton>
      </Cell>
      <Cell name="InputGroupButton icon">
        <InputGroupButton size="icon-xs" variant="outline" aria-label="Add">
          <Plus />
        </InputGroupButton>
      </Cell>
    </>
  ),
  sm: (
    <>
      <Cell name="Button">
        <Button size="sm" variant="outline">
          Button
        </Button>
      </Cell>
      <Cell name="Button icon">
        <Button size="icon-sm" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </Cell>
      <Cell name="Toggle">
        <Toggle size="sm" variant="outline" aria-label="Bold">
          <Bold />
        </Toggle>
      </Cell>
      <Cell name="ToggleGroup">
        <ToggleGroupControl size="sm" />
      </Cell>
      <Cell name="Select">
        <SelectControl size="sm" />
      </Cell>
      <Cell name="Combobox">
        <ComboboxControl size="sm" />
      </Cell>
      <Cell name="NativeSelect">
        <NativeSelectControl size="sm" />
      </Cell>
      <Cell name="InputGroupButton">
        <InputGroupButton size="sm" variant="outline">
          Copy
        </InputGroupButton>
      </Cell>
      <Cell name="InputGroupButton icon">
        <InputGroupButton size="icon-sm" variant="outline" aria-label="Add">
          <Plus />
        </InputGroupButton>
      </Cell>
    </>
  ),
  default: (
    <>
      <Cell name="Button">
        <Button variant="outline">Button</Button>
      </Cell>
      <Cell name="Button icon">
        <Button size="icon" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </Cell>
      <Cell name="Toggle">
        <Toggle variant="outline" aria-label="Bold">
          <Bold />
        </Toggle>
      </Cell>
      <Cell name="ToggleGroup">
        <ToggleGroupControl size="default" />
      </Cell>
      <Cell name="Select">
        <SelectControl size="default" />
      </Cell>
      <Cell name="Combobox">
        <ComboboxControl size="default" />
      </Cell>
      <Cell name="NativeSelect">
        <NativeSelectControl size="default" />
      </Cell>
      <Cell name="Input">
        <Input aria-label="Name" placeholder="Input" className="w-32" />
      </Cell>
      <Cell name="InputGroup">
        <InputGroup className="w-40">
          <InputGroupAddon align="inline-start">
            <Search />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search" placeholder="InputGroup" />
        </InputGroup>
      </Cell>
      <Cell name="DatePicker">
        <div className="w-40">
          <DatePicker placeholder="DatePicker" />
        </div>
      </Cell>
    </>
  ),
  lg: (
    <>
      <Cell name="Button">
        <Button size="lg" variant="outline">
          Button
        </Button>
      </Cell>
      <Cell name="Button icon">
        <Button size="icon-lg" variant="outline" aria-label="Add">
          <Plus />
        </Button>
      </Cell>
      <Cell name="Toggle">
        <Toggle size="lg" variant="outline" aria-label="Bold">
          <Bold />
        </Toggle>
      </Cell>
      <Cell name="ToggleGroup">
        <ToggleGroupControl size="lg" />
      </Cell>
    </>
  ),
};

/**
 * One row per size name, one control of each type that offers it. Every
 * control in a row has the same height, so a mismatch shows as a ragged edge.
 */
export const AllControls: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(Object.keys(rows) as Size[]).map((size) => (
        <div key={size} data-size-row={size} className="flex flex-col gap-2">
          <p className="text-muted-foreground font-mono text-xs">
            {size} · {HEIGHTS[size]}px
          </p>
          <div className="flex flex-wrap items-center gap-3">{rows[size]}</div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const size of Object.keys(HEIGHTS) as Size[]) {
      const row = canvasElement.querySelector(`[data-size-row="${size}"]`);
      await expect(row).not.toBeNull();
      const cells = Array.from(row?.querySelectorAll<HTMLElement>('[data-control]') ?? []);
      await expect(cells.length).toBeGreaterThan(0);
      for (const cell of cells) {
        await expectPx(
          cell.getBoundingClientRect().height,
          HEIGHTS[size],
          `${cell.dataset.control} size "${size}" is ${HEIGHTS[size]}px`,
        );
      }
    }
  },
};
