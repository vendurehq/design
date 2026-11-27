import type { Meta, StoryObj } from '@storybook/react';
import { CircleX, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '../src/components/atoms/card.tsx';
import { ActionNeeded, type ActionNeededItem } from '../src/components/molecules/action-needed.tsx';

/**
 * Guidance, not props. When a list of findings is an ActionNeeded, and the
 * hand-built patterns it replaces. For the component API, see the
 * ActionNeeded stories.
 */
const meta = {
  title: 'Molecules/ActionNeeded/Guidance',
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

const FINDINGS: ActionNeededItem[] = [
  {
    key: 'shipping',
    tone: 'critical',
    title: 'No shipping method',
    description: 'Customers cannot check out until a shipping method is enabled.',
    action: (
      <Button variant="outline" size="sm">
        Set up shipping
      </Button>
    ),
  },
  {
    key: 'password',
    tone: 'warning',
    title: 'Default superadmin password',
    description: 'Anyone who knows the default password can sign in.',
    action: (
      <Button variant="outline" size="sm">
        Change password
      </Button>
    ),
  },
];

const CHOICES: { tool: string; use: string }[] = [
  {
    tool: 'ActionNeeded',
    use: 'Several findings, each with its own fix: the setup problems of a store, the alerts of a project.',
  },
  { tool: 'Alert', use: 'One notice about a page or region.' },
  { tool: 'StatusBadge', use: 'The state of one object, in a list or a header.' },
  { tool: 'Checklist', use: 'Steps the user works through in order, with progress.' },
];

// ── 1 · choosing the tool ────────────────────────────────────────────────────

export const ChoosingTheTool: Story = {
  name: '1 · ActionNeeded vs Alert vs Checklist',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A list of findings that wait on someone"
        intro="ActionNeeded holds problems that each need the user to fix something. One notice, a status or a list of steps uses another component."
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

// ── 2 · what it replaces ─────────────────────────────────────────────────────

function TintedBox({ tone, title, children }: { tone: 'critical' | 'warning'; title: string; children: ReactNode }) {
  const Icon = tone === 'critical' ? CircleX : TriangleAlert;
  return (
    <div
      className={`flex gap-2 rounded-md border p-3 text-sm ${
        tone === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'
      }`}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>
        <div className="font-medium">{title}</div>
        {children}
      </div>
    </div>
  );
}

export const HandBuiltPatterns: Story = {
  name: '2 · The card header folds plain rows',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="One header, plain rows, one named action each"
        intro="Render ActionNeeded as the only child of the Card. Its title is the card title, and the header folds the list."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The card header is the fold row. Each finding has one action that names the fix."
          >
            <Card>
              <ActionNeeded title="Store setup" items={FINDINGS} storage={null} />
            </Card>
          </Example>
          <Example
            verdict="dont"
            caption='A tinted box per finding, a bare "Open" link, and a second "Action needed" header under the card title.'
          >
            <Card>
              <CardHeader>
                <CardTitle>Store setup</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm font-medium">Action needed</p>
                <TintedBox tone="critical" title="No shipping method">
                  <a className="text-sm underline" href="#">
                    Open
                  </a>
                </TintedBox>
                <TintedBox tone="warning" title="Default superadmin password">
                  <a className="text-sm underline" href="#">
                    Open
                  </a>
                </TintedBox>
              </CardContent>
            </Card>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
