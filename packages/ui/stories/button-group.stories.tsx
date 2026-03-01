import type { Meta, StoryObj } from '@storybook/react';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '../src/components/ui/button-group.tsx';
import { Button } from '../src/components/ui/button.tsx';

const meta = {
  title: 'UI/General/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Save</Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Cancel</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>or</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline">Reset</Button>
    </ButtonGroup>
  ),
};
