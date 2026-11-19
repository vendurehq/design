import type { Meta, StoryObj } from '@storybook/react';
import { BellIcon, FilterIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge } from '../src/components/atoms/badge.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { CountBadge, type CountBadgeTone } from '../src/components/molecules/count-badge.tsx';

/**
 * Guidance, not props. When a count on a control is a CountBadge rather than
 * a Badge, which tone to pass, where it sits, and how it joins the button's
 * accessible name. For the API, see the CountBadge stories; for a count in
 * text, see the Badge guidance page.
 */
const meta = {
  title: 'Molecules/CountBadge/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

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
      <div className="flex flex-wrap items-center gap-3">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

const TONES: { tone: CountBadgeTone; count: number; use: string }[] = [
  { tone: 'neutral', count: 2, use: 'A plain count with no urgency: unread notifications, active filters, selected items.' },
  { tone: 'warning', count: 1, use: 'Items where a person must act or a risk exists.' },
  { tone: 'critical', count: 3, use: 'Failures or blocking problems.' },
  {
    tone: 'brand',
    count: 5,
    use: 'Rare: a deliberate highlight the product opts into, at most one per view. Not the routine unread count.',
  },
];

// ── countbadge vs badge ──────────────────────────────────────────────────────

export const CountBadgeVsBadge: Story = {
  name: '1 · CountBadge vs Badge',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A count on a control is a CountBadge"
        intro="A number on an icon button (unread notifications, alerts) or inside a button (active filters) is a CountBadge. It sets the size, the font, the 99+ cap, the corner placement and the tone, and it renders nothing at zero. A count in running text or a table cell stays on Badge."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Pass the raw count and a tone. The badge caps it and places it."
          >
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon />
              <span className="sr-only">Notifications,</span>
              <CountBadge count={120} placement="corner" label="120 unread" />
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon data-icon="inline-start" />
              Active filters
              <CountBadge count={2} />
            </Button>
          </Example>
          <Example
            verdict="dont"
            caption="A Badge squeezed and placed by hand, or a pill built from a span. Each app ends up with its own size, font, cap and colour rule."
          >
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <BellIcon />
              <Badge
                aria-hidden
                variant="primary"
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-2xs"
              >
                99+
              </Badge>
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon data-icon="inline-start" />
              Active filters
              <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs">
                2
              </span>
            </Button>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── choosing a tone ──────────────────────────────────────────────────────────

export const ChoosingATone: Story = {
  name: '2 · Choosing a tone',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The tone says what the count is of"
        intro="Pass a tone, never a colour class. Start at neutral: unread notifications and active filters are neutral. When the counted items have states, pass the state dictionary's maxTone() result as it is; info, success and progress work too. Brand follows accent rationing."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Tone</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {TONES.map(({ tone, count, use }) => (
                <tr key={tone} className="border-b align-middle last:border-0">
                  <td className="p-3 font-mono text-xs">{tone}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" className="relative">
                      {tone === 'warning' || tone === 'critical' ? <TriangleAlertIcon /> : <BellIcon />}
                      <span className="sr-only">{tone},</span>
                      <CountBadge count={count} tone={tone} placement="corner" label={`${count} items`} />
                    </Button>
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

// ── the accessible name ──────────────────────────────────────────────────────

export const TheAccessibleName: Story = {
  name: '3 · The count is part of the name',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A screen reader hears the real count"
        intro="On an icon button, pass label with the real number: the button is read as “Notifications, 120 unread”, not “99+”. An aria-label on the button replaces its content, so in that case write the count into the aria-label. Inside a button with words, the words name the count: leave label out."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The name comes from the content: a screen-reader word for the icon, then the badge label."
          >
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon />
              <span className="sr-only">Notifications,</span>
              <CountBadge count={120} placement="corner" label="120 unread" />
            </Button>
          </Example>
          <Example
            verdict="dont"
            caption="An aria-label without the count: the badge is never read, so the count is lost."
          >
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <BellIcon />
              <CountBadge count={120} placement="corner" label="120 unread" />
            </Button>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
