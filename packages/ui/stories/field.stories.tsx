import type { Meta, StoryObj } from '@storybook/react';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '../src/components/ui/field.tsx';
import { Input } from '../src/components/ui/input.tsx';

const meta = {
  title: 'UI/Forms/Field',
  component: Field,
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>Email</FieldLabel>
      <FieldContent>
        <Input placeholder="you@example.com" />
        <FieldDescription>We will never share your email.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel>Username</FieldLabel>
      <FieldContent>
        <Input placeholder="johndoe" />
        <FieldDescription>Your public display name.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel>Password</FieldLabel>
      <FieldContent>
        <Input type="password" aria-invalid="true" />
        <FieldError>Password must be at least 8 characters.</FieldError>
      </FieldContent>
    </Field>
  ),
};

export const WithMultipleErrors: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel>Password</FieldLabel>
      <FieldContent>
        <Input type="password" aria-invalid="true" />
        <FieldError
          errors={[
            { message: 'Password must be at least 8 characters.' },
            { message: 'Password must contain a number.' },
          ]}
        />
      </FieldContent>
    </Field>
  ),
};

export const Responsive: Story = {
  render: () => (
    <Field orientation="responsive">
      <FieldLabel>Display Name</FieldLabel>
      <FieldContent>
        <Input placeholder="Enter your name" />
        <FieldDescription>This is how others will see you.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};
