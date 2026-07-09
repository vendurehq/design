import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
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
        <SelectTrigger className="w-[180px]">
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setItems(vegetables)}
          >
            Vegetables
          </Button>
        </div>
        <Select value="">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an item" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item} value={item.toLowerCase()}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
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
        <SelectTrigger className="w-[220px]">
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
