import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Checkbox } from '../src/components/atoms/checkbox.tsx';
import { Label } from '../src/components/atoms/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/atoms/select.tsx';
import { MultiSelect } from '../src/components/molecules/multi-select.tsx';

/**
 * Guidance, not props. When MultiSelect is the right multi-value control versus
 * a checkbox group, a single Select, or a searchable combobox, and how the
 * chosen values actually read in the trigger. For the component API and its
 * props, see the MultiSelect stories.
 */
const meta = {
  title: 'Molecules/MultiSelect/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (copied per guidance file, not imported) ───────────────

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

// ── data ─────────────────────────────────────────────────────────────────────

/** A bounded, closed set: the case MultiSelect is built for. */
const channels = [
  'Default',
  'B2C Europe',
  'B2C North America',
  'Wholesale',
  'Retail',
  'Marketplace',
];

/** A small, fixed set that reads best fully visible (a checkbox group). */
const exportColumns = ['Orders', 'Customers', 'Products'];

type Control = {
  control: string;
  picks: string;
  reach: string;
  sibling?: string;
};

const CONTROLS: Control[] = [
  {
    control: 'Checkbox group',
    picks: 'Several',
    reach:
      'A small, fixed set (roughly six or fewer) where seeing every option at once matters and the page has room for them. No collapsing, no summary to read.',
  },
  {
    control: 'MultiSelect',
    picks: 'Several',
    reach:
      'A bounded, closed list too long to lay out inline but short enough to scroll without typing. Collapses to one trigger line.',
  },
  {
    control: 'Select',
    picks: 'Exactly one',
    reach:
      'Only one answer is valid. A multi-value affordance invites a mistake the data model will reject.',
    sibling: 'atoms/Select',
  },
  {
    control: 'Combobox (searchable)',
    picks: 'One or several',
    reach:
      'The list is long enough that people need to type to find an option, or it is fetched async. MultiSelect has no filter input; this is its ceiling.',
    sibling: 'atoms/Combobox',
  },
  {
    control: 'ComboboxFreeText',
    picks: 'One, open',
    reach:
      'An open vocabulary: values the user can invent (tags, ad-hoc labels), not a fixed list. MultiSelect can only offer the values you pass in items.',
    sibling: 'molecules/ComboboxFreeText',
  },
];

const RULES: { rule: string; body: string }[] = [
  {
    rule: 'Closed set only',
    body: 'Every selectable value must exist in items. There is no "add new" affordance; for user-invented values, use ComboboxFreeText.',
  },
  {
    rule: 'No search inside',
    body: 'The dropdown is a plain scrolling list with no filter box. Past roughly a couple dozen options, or for a fetched list, graduate to a searchable Combobox.',
  },
  {
    rule: 'Give objects a stable value',
    body: 'When items are objects, pass itemToValue (e.g. itemToValue="id") so a selection survives the items array being recreated on the next render.',
  },
];

// ── 1 · choosing the control ─────────────────────────────────────────────────

export const ChoosingTheControl: Story = {
  name: '1 · Which multi-value control',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Pick the control before the component"
        intro="MultiSelect is one point on a spectrum of value-picking controls. Choose by three questions: how many values, is the set fixed and known, and how many options there are. MultiSelect owns the middle: several values, from a closed list, small enough to scroll without a search box."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Control</th>
                <th className="p-3 font-medium">Picks</th>
                <th className="p-3 font-medium">Reach for it when</th>
              </tr>
            </thead>
            <tbody>
              {CONTROLS.map(({ control, picks, reach, sibling }) => (
                <tr key={control} className="border-b align-top last:border-0">
                  <td className="p-3">
                    <span className="font-mono text-xs">{control}</span>
                    {sibling ? (
                      <span className="text-muted-foreground mt-0.5 block text-[11px]">
                        {sibling}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{picks}</td>
                  <td className="text-muted-foreground p-3 text-xs">{reach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="The three closed-set controls, side by side"
        intro="All three take a known list. The count of options, and whether every option needs to stay visible, decides which one."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide">Checkbox group</p>
            <div className="flex flex-col gap-2">
              {exportColumns.map((col, i) => (
                <div key={col} className="flex items-center gap-2">
                  <Checkbox id={`col-${col}`} defaultChecked={i === 0} />
                  <Label htmlFor={`col-${col}`} className="text-sm font-normal">
                    {col}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-3 text-xs">
              Three fixed columns to export. Everything visible; nothing to open.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide">MultiSelect</p>
            <MultiSelect
              items={channels}
              defaultValue={['Default', 'B2C Europe']}
              placeholder="Assign channels"
            />
            <p className="text-muted-foreground mt-3 text-xs">
              Several sales channels from a bounded, closed list. Collapses to one line.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide">Select</p>
            <Select defaultValue="Standard">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tax category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Reduced">Reduced</SelectItem>
                <SelectItem value="Zero">Zero-rated</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-3 text-xs">
              Exactly one tax category. Multi would model an impossible state.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · reading the selection ────────────────────────────────────────────────

export const ReadingTheSelection: Story = {
  name: '2 · Reading the selection',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The trigger is one line, not a chip stack"
        intro="MultiSelect summarises the selection as a single, non-growing line: the chosen labels joined with commas, truncated to fit the trigger width. It does not render chips, and it has no “+N” overflow badge. That default reads fine for two or three values, but past that it truncates mid-label into a meaningless fragment. When a selection can grow long, override renderValue with a count."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="renderValue collapses a long selection to a count, so the trigger stays legible however much is chosen."
          >
            <MultiSelect
              className="w-[220px]"
              items={channels}
              defaultValue={['Default', 'B2C Europe', 'Wholesale', 'Retail']}
              renderValue={(selected) =>
                selected.length === 1 ? String(selected[0]) : `${selected.length} channels`
              }
              placeholder="Assign channels"
            />
          </Example>
          <Example
            verdict="dont"
            caption="Leaning on the comma-joined default for a long selection: the line truncates to “Default, B2C Eur…” and the user cannot tell what is actually selected."
          >
            <MultiSelect
              className="w-[220px]"
              items={channels}
              defaultValue={channels}
              placeholder="Assign channels"
            />
          </Example>
        </div>
      </Section>

      <Section
        title="Keep the trigger a stable width"
        intro="The trigger defaults to full-width and does not grow with the selection. Give it a real width via className (a w-* class) so the summary truncates predictably instead of stretching the layout. Fix the width whenever the control sits in a toolbar or a form row."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A pinned width. The summary truncates inside it; neighbouring fields never shift."
          >
            <MultiSelect
              className="w-[200px]"
              items={channels}
              defaultValue={['Default', 'B2C Europe', 'B2C North America']}
              placeholder="Assign channels"
            />
          </Example>
          <Example
            verdict="dont"
            caption="No pinned width: the trigger defaults to full-width, so it stretches or shrinks with its container and shifts whatever sits beside it."
          >
            <MultiSelect
              items={channels}
              defaultValue={['Wholesale']}
              placeholder="Assign channels"
            />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · closed set vs open vocabulary ────────────────────────────────────────

export const ClosedSetVsOpen: Story = {
  name: '3 · Closed set vs open vocabulary',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="MultiSelect can only offer what you pass it"
        intro="Every value comes from items, and there is no filter box and no way to type a value that is not already there. That makes it right for a closed, known, scrollable set, and wrong the moment the vocabulary is open or the list is too long to eyeball."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A closed, known set: the sales channels a product can belong to. Bounded and scrollable, no typing needed to find one."
          >
            <MultiSelect
              className="w-[240px]"
              items={channels}
              defaultValue={['Default']}
              placeholder="Assign channels"
            />
          </Example>
          <Example
            verdict="dont"
            caption="Product tags a merchant invents are an open vocabulary: there is no fixed items list to pass. Reach for ComboboxFreeText; for a long fetched list that needs a search box, a searchable Combobox."
          >
            <MultiSelect
              className="w-[240px]"
              items={['Sale', 'New', 'Clearance']}
              placeholder="Add tags…"
            />
          </Example>
        </div>
      </Section>

      <Section
        title="Three rules that keep it in its lane"
        intro="Cross-reference the sibling controls in prose: ComboboxFreeText for open vocabularies, the searchable Combobox for long or async lists, and Select when only one answer is valid."
      >
        <div className="flex flex-col gap-3">
          {RULES.map(({ rule, body }) => (
            <div key={rule} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">{rule}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
