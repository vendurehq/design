import type { Meta, StoryObj } from '@storybook/react';
import { uiGuidanceById } from '../guidance/catalog.ts';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';

const guidance = uiGuidanceById.form;

const meta = {
  title: 'Atoms/Forms/Form Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anatomy: Story = {
  name: '1 · Field anatomy',
  render: () => (
    <div className="text-foreground max-w-4xl space-y-8 p-1">
      <header>
        <h1 className="text-style-page-title">Form composition</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{guidance.summary}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg border p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-success-subtle-foreground">
            Do
          </p>
          <Field data-invalid="true">
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <FieldContent>
              <Input id="email" name="email" type="email" aria-invalid="true" />
              <FieldDescription>Used for order notifications.</FieldDescription>
              <FieldError>Enter a valid email address.</FieldError>
            </FieldContent>
          </Field>
          <p className="text-muted-foreground mt-4 text-sm">
            Visible label, stable help, actionable error, and matching invalid state.
          </p>
        </section>
        <section className="rounded-lg border p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-destructive-subtle-foreground">
            Don&apos;t
          </p>
          <Input placeholder="Email address" aria-label="Email address" />
          <p className="text-muted-foreground mt-4 text-sm">
            Placeholder-only labeling disappears as soon as the user types and provides no stable
            place for help or validation.
          </p>
        </section>
      </div>
    </div>
  ),
};

export const RulesAndActions: Story = {
  name: '2 · Rules and actions',
  render: () => (
    <div className="text-foreground max-w-4xl space-y-8 p-1">
      <section>
        <h2 className="text-style-section-title">The composition contract</h2>
        <div className="mt-4 space-y-3">
          {guidance.rules.map((rule) => (
            <div key={rule.title} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">{rule.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{rule.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border p-5">
        <h2 className="text-style-section-title">Close with one clear action hierarchy</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Keep destructive work away from the normal save path. Cancel is the neutral partner and
          submit is the single primary action.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </section>
    </div>
  ),
};
