import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { SearchIcon } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '../src/components/atoms/field.tsx';
import { Input } from '../src/components/atoms/input.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from '../src/components/atoms/input-group.tsx';
import { NativeSelect, NativeSelectOption } from '../src/components/atoms/native-select.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../src/components/atoms/select.tsx';
import { Textarea } from '../src/components/atoms/textarea.tsx';
import { DatePicker } from '../src/components/molecules/date-picker.tsx';

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
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <FieldContent>
        <Input id="email" placeholder="you@example.com" />
        <FieldDescription>We will never share your email.</FieldDescription>
      </FieldContent>
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <FieldContent>
        <Input id="username" placeholder="johndoe" />
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
      <FieldLabel htmlFor="display-name">Display Name</FieldLabel>
      <FieldContent>
        <Input id="display-name" placeholder="Enter your name" />
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

/**
 * Field wires its control: the input gets aria-describedby with the ids of the
 * FieldDescription and FieldError it renders, and aria-invalid while the Field
 * is data-invalid. No ids are passed by hand.
 */
export const ValidAndInvalid: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <>
          <Field>
            <FieldLabel htmlFor={`sku-valid-${theme}`}>SKU</FieldLabel>
            <Input id={`sku-valid-${theme}`} defaultValue="TSHIRT-RED-M" />
            <FieldDescription>Unique per variant.</FieldDescription>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor={`sku-invalid-${theme}`}>SKU</FieldLabel>
            <Input id={`sku-invalid-${theme}`} defaultValue="" />
            <FieldDescription>Unique per variant.</FieldDescription>
            <FieldError>Enter a SKU.</FieldError>
          </Field>
        </>
      )}
    </LightAndDark>
  ),
};

/**
 * The v3 field label and placeholder: a 12px, weight 500 label in the muted
 * text colour, 6px above its field, and a placeholder fainter than muted text.
 * An invalid field keeps its red label.
 */
export const LabelLook: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      <Field>
        <FieldLabel htmlFor="label-look-name">Name</FieldLabel>
        <Input id="label-look-name" placeholder="Acme Inc." />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="label-look-email">Email</FieldLabel>
        <Input id="label-look-email" aria-invalid placeholder="you@example.com" />
      </Field>
      <Field>
        <FieldLabel htmlFor="label-look-note">Note</FieldLabel>
        <Textarea id="label-look-note" placeholder="Visible to your team" />
      </Field>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const probe = document.createElement('span');
    canvasElement.append(probe);
    const colorOf = (className: string) => {
      probe.className = className;
      return getComputedStyle(probe).color;
    };

    const name = canvas.getByLabelText('Name');
    const label = canvas.getByText('Name');
    const style = getComputedStyle(label);
    await expect(style.fontSize).toBe('12px');
    await expect(style.fontWeight).toBe('500');
    await expect(style.color).toBe(colorOf('text-muted-foreground'));
    await expect(Math.round(name.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(6);

    await expect(getComputedStyle(canvas.getByText('Email')).color).toBe(
      colorOf('text-destructive-subtle-foreground'),
    );

    const faint = colorOf('text-faint-foreground');
    await expect(faint).not.toBe(colorOf('text-muted-foreground'));
    for (const field of [name, canvas.getByLabelText('Note')]) {
      await expect(getComputedStyle(field, '::placeholder').color).toBe(faint);
    }
    probe.remove();
  },
};

/**
 * Every field in the v3 look, side by side: the muted fill, a 1px inset
 * hairline, the 6px radius, 34px tall, and a 2px ring inside the field on
 * keyboard focus. The play function reads the computed styles.
 */
export const FieldLook: Story = {
  render: () => (
    <div className="grid w-80 gap-4">
      <Input aria-label="Name" placeholder="Name" />
      <Select items={[{ value: 'eur', label: 'Euro' }]}>
        <SelectTrigger aria-label="Currency" className="w-full">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eur">Euro</SelectItem>
        </SelectContent>
      </Select>
      <NativeSelect aria-label="Country" className="w-full">
        <NativeSelectOption value="at">Austria</NativeSelectOption>
      </NativeSelect>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search" />
      </InputGroup>
      <DatePicker aria-label="Ship date" />
      <Textarea aria-label="Note" placeholder="Note" />
      <InputGroup>
        <InputGroupInput aria-label="Coupon" aria-invalid defaultValue="SAVE" />
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="Reason" aria-invalid placeholder="Reason" />
      </InputGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const probe = document.createElement('div');
    probe.className = 'bg-muted shadow-[inset_0_0_0_1px_var(--border)]';
    canvasElement.append(probe);
    const fields = [
      canvas.getByRole('textbox', { name: 'Name' }),
      canvas.getByRole('combobox', { name: 'Currency' }),
      canvas.getByRole('combobox', { name: 'Country' }),
      canvasElement.querySelector<HTMLElement>('[data-slot="input-group"]') as HTMLElement,
      canvas.getByRole('button', { name: /Pick a date/ }),
      canvas.getByRole('textbox', { name: 'Note' }),
    ];
    for (const field of fields) {
      const style = getComputedStyle(field);
      await expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor);
      await expect(style.boxShadow).toBe(getComputedStyle(probe).boxShadow);
      await expect(style.borderTopLeftRadius).toBe('6px');
      // No border: the fill reaches the edge, under the hairline.
      await expect(style.borderTopWidth).toBe('0px');
      if (field.tagName !== 'TEXTAREA') await expect(field.offsetHeight).toBe(34);
      // The text starts 10px in, as in an Input. An InputGroup starts with its addon.
      if (field.dataset.slot !== 'input-group') await expect(style.paddingLeft).toBe('10px');
    }

    // Select and NativeSelect put the chevron 10px from the edge, like the text.
    for (const select of [fields[1], fields[2]] as HTMLElement[]) {
      const chevron = (select.querySelector('svg') ?? select.parentElement?.querySelector('svg')) as SVGElement;
      await expect(Math.round(select.getBoundingClientRect().right - chevron.getBoundingClientRect().right)).toBe(10);
    }

    // A placeholder shown as text is as faint as a native one.
    probe.className = 'text-faint-foreground';
    const faint = getComputedStyle(probe).color;
    for (const placeholder of [
      canvas.getByText('Currency'),
      canvas.getByText('Pick a date'),
    ]) {
      await expect(getComputedStyle(placeholder).color).toBe(faint);
    }

    // An invalid control in an InputGroup turns the group's hairline red and
    // draws no edge of its own, so the field shows one red edge.
    probe.className = 'shadow-[inset_0_0_0_1px_var(--destructive)]';
    for (const control of [canvas.getByRole('textbox', { name: 'Coupon' }), canvas.getByRole('textbox', { name: 'Reason' })]) {
      const group = control.closest<HTMLElement>('[data-slot="input-group"]') as HTMLElement;
      await expect(getComputedStyle(group).boxShadow).toBe(getComputedStyle(probe).boxShadow);
      // Tailwind composes shadow-none from zero-size layers: no length may be above 0.
      await expect(getComputedStyle(control).boxShadow).not.toMatch(/(^|\s)(0?\.\d*[1-9]|[1-9][\d.]*)px/);
    }
    probe.remove();

    // Keyboard focus rings the field 2px inside, over the hairline.
    const [name] = fields as [HTMLElement];
    await userEvent.tab();
    await waitFor(() => expect(getComputedStyle(name).outlineOffset).toBe('-2px'));
    await expect(getComputedStyle(name).outlineWidth).toBe('2px');
  },
};
