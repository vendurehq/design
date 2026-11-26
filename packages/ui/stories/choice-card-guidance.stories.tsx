import type { Meta, StoryObj } from '@storybook/react';
import { PackageIcon, TruckIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Label } from '../src/components/atoms/label.tsx';
import { RadioGroup, RadioGroupItem } from '../src/components/atoms/radio-group.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../src/components/atoms/select.tsx';
import {
  ChoiceCard,
  ChoiceCardBadge,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardGroup,
  ChoiceCardMedia,
  ChoiceCardMeta,
  ChoiceCardTitle,
} from '../src/components/molecules/choice-card.tsx';

/**
 * Guidance, not props. When a choice is a ChoiceCard rather than a RadioGroup
 * or a Select, why the card is the control itself, and how "current" differs
 * from "selected". For the component API, see the ChoiceCard stories.
 */
const meta = {
  title: 'Molecules/ChoiceCard/Guidance',
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

export const WhichControl: Story = {
  name: '1 · ChoiceCard, RadioGroup or Select',
  render: () => (
    <Section
      title="Pick the control by how much each option needs to say"
      intro="A ChoiceCard is for a few options that each need a description, a price, an icon or an image. Short labels in a form are a RadioGroup. A long list, or little room, is a Select."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Example verdict="do" caption="ChoiceCard: each shipping method has a time and a price to compare.">
          <ChoiceCardGroup aria-label="Shipping method" defaultValue="standard">
            <ChoiceCard value="standard" size="sm">
              <ChoiceCardMedia>
                <PackageIcon />
              </ChoiceCardMedia>
              <ChoiceCardContent>
                <ChoiceCardTitle>Standard</ChoiceCardTitle>
                <ChoiceCardDescription>3 to 5 working days</ChoiceCardDescription>
              </ChoiceCardContent>
              <ChoiceCardMeta>€4.90</ChoiceCardMeta>
            </ChoiceCard>
            <ChoiceCard value="express" size="sm">
              <ChoiceCardMedia>
                <TruckIcon />
              </ChoiceCardMedia>
              <ChoiceCardContent>
                <ChoiceCardTitle>Express</ChoiceCardTitle>
                <ChoiceCardDescription>Next working day</ChoiceCardDescription>
              </ChoiceCardContent>
              <ChoiceCardMeta>€12.00</ChoiceCardMeta>
            </ChoiceCard>
          </ChoiceCardGroup>
        </Example>
        <Example verdict="do" caption="RadioGroup: one short label per option, as a field in a form.">
          <RadioGroup aria-label="Tax display" defaultValue="incl">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="incl" aria-labelledby="tax-incl" />
              <Label id="tax-incl">Prices include tax</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="excl" aria-labelledby="tax-excl" />
              <Label id="tax-excl">Prices exclude tax</Label>
            </div>
          </RadioGroup>
        </Example>
        <Example verdict="do" caption="Select: many options, or not enough room for cards.">
          <Select defaultValue="nl">
            <SelectTrigger aria-label="Country" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nl">Netherlands</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="fr">France</SelectItem>
            </SelectContent>
          </Select>
        </Example>
      </div>
    </Section>
  ),
};

export const TheCardIsTheControl: Story = {
  name: '2 · The card is the control',
  render: () => (
    <Section
      title="Do not build a picker from a clickable Card"
      intro="A Card with onClick cannot be picked from the keyboard and announces no checked state. ChoiceCard is a real radio or checkbox: arrow keys, Space, the role and aria-checked come from Base UI. Keep slots to text, icons and images: a button inside the card is not reachable as its own control."
    >
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Example verdict="do" caption="Each address is a ChoiceCard. Edit and delete live next to the group.">
          <ChoiceCardGroup aria-label="Delivery address" defaultValue="home">
            <ChoiceCard value="home" size="sm">
              <ChoiceCardContent>
                <ChoiceCardTitle>Home</ChoiceCardTitle>
                <ChoiceCardDescription>Keizersgracht 12, Amsterdam</ChoiceCardDescription>
              </ChoiceCardContent>
            </ChoiceCard>
            <ChoiceCard value="office" size="sm">
              <ChoiceCardContent>
                <ChoiceCardTitle>Office</ChoiceCardTitle>
                <ChoiceCardDescription>Stationsplein 1, Utrecht</ChoiceCardDescription>
              </ChoiceCardContent>
            </ChoiceCard>
          </ChoiceCardGroup>
        </Example>
        <Example verdict="dont" caption="A bordered div that turns blue on click: no keyboard, no role, colour as the only cue.">
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-primary p-3 text-sm">Home</div>
            <div className="rounded-2xl border p-3 text-sm">Office</div>
          </div>
        </Example>
      </div>
    </Section>
  ),
};

export const CurrentIsNotSelected: Story = {
  name: '3 · Current is not selected',
  render: () => (
    <Section
      title="Mark the current option with a badge, not with the selection"
      intro="On a plan picker the customer's own plan carries a ChoiceCardBadge. The selection is the plan they are moving to. Pre-selecting the current plan to show that it is current mixes the two."
    >
      <div className="max-w-3xl">
        <Example verdict="do" caption="Growth is current; Scale is the plan being chosen.">
          <ChoiceCardGroup aria-label="Plan" defaultValue="scale" className="sm:grid-cols-3">
            <ChoiceCard value="starter" className="flex-col">
              <ChoiceCardContent>
                <ChoiceCardTitle>Starter</ChoiceCardTitle>
                <ChoiceCardDescription>One shop</ChoiceCardDescription>
              </ChoiceCardContent>
              <ChoiceCardMeta className="ms-0 text-start">€29 / month</ChoiceCardMeta>
            </ChoiceCard>
            <ChoiceCard value="growth" className="flex-col">
              <ChoiceCardContent>
                <ChoiceCardTitle>
                  Growth <ChoiceCardBadge>Current</ChoiceCardBadge>
                </ChoiceCardTitle>
                <ChoiceCardDescription>Three shops</ChoiceCardDescription>
              </ChoiceCardContent>
              <ChoiceCardMeta className="ms-0 text-start">€99 / month</ChoiceCardMeta>
            </ChoiceCard>
            <ChoiceCard value="scale" className="flex-col">
              <ChoiceCardContent>
                <ChoiceCardTitle>Scale</ChoiceCardTitle>
                <ChoiceCardDescription>Unlimited shops</ChoiceCardDescription>
              </ChoiceCardContent>
              <ChoiceCardMeta className="ms-0 text-start">€299 / month</ChoiceCardMeta>
            </ChoiceCard>
          </ChoiceCardGroup>
        </Example>
      </div>
    </Section>
  ),
};
