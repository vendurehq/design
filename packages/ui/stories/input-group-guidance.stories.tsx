import type { Meta, StoryObj } from '@storybook/react';
import { Copy, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { Field, FieldLabel } from '../src/components/atoms/field.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '../src/components/atoms/input-group.tsx';
import { PasswordInput } from '../src/components/molecules/password-input.tsx';

/**
 * Guidance, not props. An icon, a unit or a button inside a field is an
 * InputGroup; a password field is a PasswordInput. For the component API, see
 * the InputGroup and PasswordInput stories.
 */
const meta = {
  title: 'Atoms/Forms/InputGroup/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, by convention) ───────────

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div>{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── stories ──────────────────────────────────────────────────────────────────

export const AddOns: Story = {
  name: '1 · Add-ons go in InputGroupAddon',
  render: () => (
    <Section
      title="One border and one focus ring around the field and its add-ons"
      intro="Put the icon, the prefix or the button in an InputGroupAddon. Do not position an icon over an Input. The group still sits in a Field with a FieldLabel."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="A search icon at the start, a prefix, and a copy button at the end.">
          <div className="flex max-w-sm flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="ig-search">Search orders</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Search />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="ig-search" placeholder="Order code or customer" />
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor="ig-url">Webhook URL</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>https://</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput id="ig-url" defaultValue="shop.example.com/hooks" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton aria-label="Copy URL">
                    <Copy />
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </div>
        </Example>
        <Example verdict="do" caption="PasswordInput brings the show/hide toggle and its label.">
          <Field className="max-w-sm">
            <FieldLabel htmlFor="ig-password">Password</FieldLabel>
            <PasswordInput id="ig-password" defaultValue="correct horse" />
          </Field>
        </Example>
      </div>
    </Section>
  ),
};
