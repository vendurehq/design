import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { ArrowLink } from '../src/components/molecules/arrow-link.tsx';

/**
 * Guidance, not props. When a link to more of the same content is an
 * ArrowLink rather than a Button or an inline text link, and where it goes.
 * For the component API, see the ArrowLink stories.
 */
const meta = {
  title: 'Molecules/ArrowLink/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives ───────────────────────────────────────────────────────

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
      <div className="flex flex-col gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'ArrowLink',
    use: 'Go to a page with more of what the user is looking at: the full list behind a short one, the detail page of a summary, the logs of a failing service. It sits at the end of a panel head, a card or a notice.',
  },
  {
    tool: 'Button',
    use: 'Do something: save, deploy, retry, open a dialog. An action that changes state is a Button, even when it also navigates.',
  },
  {
    tool: 'Button variant="link" size={null}',
    use: 'A link inside running text or a form, where a chevron would break the sentence. `size={null}` drops the button height and padding, so it sits on the line of the text.',
  },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · ArrowLink vs Button vs text link',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A chevron means: more of this, on another page"
        intro="ArrowLink is navigation, never an action. The chevron tells the user the link leaves the current view to show more of the same subject."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Tool</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {CHOICES.map(({ tool, use }) => (
                <tr key={tool} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{tool}</td>
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

// ── 2 · placement ────────────────────────────────────────────────────────────

export const Placement: Story = {
  name: '2 · One link at the end of the region',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Put it at the end of the region it extends"
        intro="A panel head or a card has at most one ArrowLink, at the inline end. The label names the destination in two or three words."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="One link at the end of the head. The label says where it goes.">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Orders</CardTitle>
                <ArrowLink href="#">All orders</ArrowLink>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">The latest five orders.</CardContent>
            </Card>
          </Example>
          <Example
            verdict="dont"
            caption="A chevron on an action. A refund changes data, so it is a Button."
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payment</CardTitle>
                <ArrowLink href="#">Refund order</ArrowLink>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">Paid by card, settled.</CardContent>
            </Card>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
