import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import * as React from 'react';
import {
  ComboboxFreeText,
  type ComboboxFreeTextItem,
} from '../src/components/molecules/combobox-free-text.tsx';

/**
 * Guidance, not props. When free text is the right answer and when it is a
 * trap: reach for ComboboxFreeText only when a brand-new value is legitimate,
 * and pay for that openness in duplicates and typos. For the API and async
 * wiring, see the ComboboxFreeText stories.
 */
const meta = {
  title: 'Molecules/ComboboxFreeText/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (copied per guidance file, no shared import) ───────────

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
      <div className="flex flex-wrap items-start gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// A controlled ComboboxFreeText wired to a static suggestion list, filtered
// client-side purely so the guidance examples are interactive. Real callers
// fetch pre-filtered suggestions from the server; see the ComboboxFreeText
// stories for the debounced async pattern.
function FreeTextDemo({
  suggestions,
  placeholder,
  invalid,
  initial = '',
}: {
  suggestions: ComboboxFreeTextItem[];
  placeholder: string;
  invalid?: boolean;
  initial?: string;
}) {
  const [value, setValue] = React.useState(initial);
  const q = value.trim().toLowerCase();
  const items = q
    ? suggestions.filter(
        (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q),
      )
    : [];
  return (
    <div className="w-[280px]">
      <ComboboxFreeText
        value={value}
        onValueChange={setValue}
        items={items}
        placeholder={placeholder}
        invalid={invalid}
      />
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const CARRIERS: ComboboxFreeTextItem[] = [
  { value: 'DHL', label: 'DHL' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'Royal Mail', label: 'Royal Mail' },
];

const TAX_CATEGORIES: ComboboxFreeTextItem[] = [
  { value: 'standard', label: 'Standard rate' },
  { value: 'reduced', label: 'Reduced rate' },
  { value: 'zero', label: 'Zero rate' },
];

const TAGS: ComboboxFreeTextItem[] = [
  { value: 'summer-sale', label: 'summer-sale' },
  { value: 'clearance', label: 'clearance' },
  { value: 'new-arrival', label: 'new-arrival' },
  { value: 'gift-idea', label: 'gift-idea' },
];

const SUPPLIERS: ComboboxFreeTextItem[] = [
  { value: 'sup_01', label: 'Acme Components', description: 'Rotterdam, NL' },
  { value: 'sup_02', label: 'Northwind Supply', description: 'Bristol, UK' },
  { value: 'sup_03', label: 'Globex Trading', description: 'Hamburg, DE' },
];

type Control = {
  control: string;
  where: string;
  set: string;
  many: string;
  newValues: string;
  reach: string;
};

const CONTROLS: Control[] = [
  {
    control: 'Select',
    where: 'Atoms / Forms / Select',
    set: 'Closed',
    many: 'One',
    newValues: 'No',
    reach:
      'A short, stable closed set that fits in a dropdown: an order-status filter, a currency, a country.',
  },
  {
    control: 'Combobox',
    where: 'Atoms / Forms / Combobox',
    set: 'Closed',
    many: 'One',
    newValues: 'No',
    reach:
      'A long closed set that needs type-to-filter: pick one existing product, one customer, one channel.',
  },
  {
    control: 'MultiSelect',
    where: 'Molecules / MultiSelect',
    set: 'Closed',
    many: 'Many',
    newValues: 'No',
    reach: 'Several values from one closed set: assign a product to channels, grant a user roles.',
  },
  {
    control: 'ComboboxFreeText',
    where: 'Molecules / ComboboxFreeText',
    set: 'Open',
    many: 'One',
    newValues: 'Yes',
    reach:
      'The answer may be a value no list contains: a regional carrier, a product tag, an ad-hoc vendor name.',
  },
];

// ── 1 · strict or open ───────────────────────────────────────────────────────

export const StrictOrOpen: Story = {
  name: '1 · Strict or open?',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Can the answer be a value that does not exist yet?"
        intro="One question decides the control. If a brand-new, never-before-seen value is a legitimate answer, the field is open: reach for ComboboxFreeText, where the typed text always wins and suggestions only assist. If every valid answer already lives in a managed set the user must land on, the field is strict: reach for Combobox, Select, or MultiSelect, which refuse anything off the list."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Shipping carrier is open: you suggest the couriers you know, but a merchant can commit a regional courier you have never heard of. Free text is the feature."
          >
            <FreeTextDemo suggestions={CARRIERS} placeholder="Carrier, e.g. DHL" />
          </Example>
          <Example
            verdict="dont"
            caption="Tax category is a closed, enforced set. Free text lets a typo like “Standrd” commit an invalid category and break tax calculation. A closed set belongs on Combobox or Select, which cannot go off-list."
          >
            <FreeTextDemo
              suggestions={TAX_CATEGORIES}
              placeholder="Tax category"
              initial="Standrd"
              invalid
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · the cost of free text ────────────────────────────────────────────────

export const CostOfFreeText: Story = {
  name: '2 · The cost of free text',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Free text is cheap to type and expensive forever after"
        intro="Every open field fragments its own data: “FedEx”, “Fed Ex”, and “fedex” become three carriers in every report you ever run. Suggestions narrow the funnel but never close it: the component is built so the typed text always wins. Only accept that cost when the vocabulary is genuinely emergent, and when the user does pick a known record, capture it: onSelectItem hands back the full item so you can store its id and link to the canonical entity instead of forking a near-duplicate string."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Product tags are an emergent vocabulary: a new tag is a feature, not an error. Suggest existing tags to steer merchants toward reuse, and let onSelectItem snap “summer-sale” to its known id when they pick it."
          >
            <FreeTextDemo suggestions={TAGS} placeholder="Add a tag…" />
          </Example>
          <Example
            verdict="dont"
            caption="Suppliers are a managed entity with their own records. Free-texting a supplier name orphans the purchase order from its supplier the moment someone types “Acme Comp.” instead of picking. A managed set is a Combobox: pick-only, no duplicates."
          >
            <FreeTextDemo
              suggestions={SUPPLIERS}
              placeholder="Supplier"
              initial="Acme Comp."
              invalid
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · the four controls ────────────────────────────────────────────────────

export const TheFourControls: Story = {
  name: '3 · The four controls',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Pick by set and cardinality"
        intro="ComboboxFreeText is the only one of the four that admits a value no list contains, and it commits exactly one string. When the set is closed, step across to a strict sibling: Select for a short list, Combobox for a long one, MultiSelect when more than one value applies."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Control</th>
                <th className="p-3 font-medium">Set</th>
                <th className="p-3 font-medium">Values</th>
                <th className="p-3 font-medium">New values?</th>
                <th className="p-3 font-medium">Reach for it when</th>
              </tr>
            </thead>
            <tbody>
              {CONTROLS.map((c) => (
                <tr key={c.control} className="border-b align-top last:border-0">
                  <td className="p-3">
                    <div className="font-mono text-xs">{c.control}</div>
                    <div className="text-muted-foreground mt-1 text-xs">{c.where}</div>
                  </td>
                  <td className="p-3 text-xs">{c.set}</td>
                  <td className="p-3 text-xs">{c.many}</td>
                  <td className="p-3 text-xs">{c.newValues}</td>
                  <td className="text-muted-foreground p-3 text-xs">{c.reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Try the one that stays open"
        intro="Type a courier that is on the list, or one that is not. Both commit: that is the whole contract. If you would not want the off-list case to commit, you wanted a strict sibling."
      >
        <FreeTextDemo suggestions={CARRIERS} placeholder="Carrier, e.g. DHL" />
      </Section>
    </div>
  ),
};
