import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';

const meta = {
  title: 'Atoms/Forms/Field',
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
      <FieldLabel htmlFor="password-error">Password</FieldLabel>
      <FieldContent>
        <Input id="password-error" type="password" aria-invalid="true" />
        <FieldError>Password must be at least 8 characters.</FieldError>
      </FieldContent>
    </Field>
  ),
};

export const WithMultipleErrors: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="password-errors">Password</FieldLabel>
      <FieldContent>
        <Input id="password-errors" type="password" aria-invalid="true" />
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
 * Destructive text uses destructive-subtle-foreground, which reaches 4.5:1 on
 * every surface in both modes. Pinned to the light page theme.
 */
export const ErrorLightAndDark: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <Field data-invalid="true">
          <FieldLabel>SKU</FieldLabel>
          <FieldContent>
            <Input aria-label={`SKU, ${theme}`} aria-invalid="true" />
            <FieldError>Enter a SKU.</FieldError>
          </FieldContent>
        </Field>
      )}
    </LightAndDark>
  ),
};
