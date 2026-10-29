import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';

/**
 * Guidance, not props. Use SecretValue for a secret that the server returns
 * only on request, such as an environment variable value: a fixed mask at rest,
 * loaded and revealed by a click. When the full value is already on the client,
 * use AnonymizedToken (see the AnonymizedToken guidance). For the component API,
 * see the SecretValue stories.
 */
const meta = {
  title: 'Molecules/SecretValue/Guidance',
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
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

const DATABASE_URL = 'postgres://shop:p4ssw0rd@db.internal:5432/shop';
const ACCESS_TOKEN = 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7';

const loadDatabaseUrl = () =>
  new Promise<string>((resolve) => setTimeout(() => resolve(DATABASE_URL), 400));

const TOOLS: { tool: string; sample: ReactNode; use: string }[] = [
  {
    tool: 'SecretValue',
    sample: <SecretValue loadValue={loadDatabaseUrl} />,
    use: 'Secrets the server returns only on request, such as environment variable values. The browser holds the value only after the user asks for it.',
  },
  {
    tool: 'AnonymizedToken',
    sample: <AnonymizedToken value={ACCESS_TOKEN} />,
    use: 'Secret-like values that are already on the client, such as a newly issued access token. A blurred prefix and tail at rest, sharp on hover or focus.',
  },
];

export const ChoosingTheTool: Story = {
  name: '1 · Loaded on request vs already on the client',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Where the value lives decides the component"
        intro="Ask one question: is the full value already in the browser? If yes, use AnonymizedToken. If the server sends it only when the user asks, use SecretValue. SecretValue shows a fixed mask with no fake prefix or tail, because it has nothing to preview until the value loads."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Tool</th>
                <th className="p-3 font-medium">Example</th>
                <th className="p-3 font-medium">Use for</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map(({ tool, sample, use }) => (
                <tr key={tool} className="border-b align-top last:border-0">
                  <td className="p-3 font-mono text-xs">{tool}</td>
                  <td className="p-3">{sample}</td>
                  <td className="text-muted-foreground p-3 text-xs">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="The consumer owns the fetch"
        intro="Pass loadValue. SecretValue owns the hidden, loading, revealed and error states. Do not fetch every secret up front to fill a component."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The value loads only when the user clicks reveal or copy. Hide clears it from state."
          >
            <SecretValue loadValue={loadDatabaseUrl} />
          </Example>
          <Example
            verdict="dont"
            caption="Fetching every secret up front sends values the user never asked to see, and the preview shows their prefix and tail."
          >
            <AnonymizedToken value={DATABASE_URL} />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const RevealRules: Story = {
  name: '2 · Reveal and copy rules',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Reveal is a click, never hover"
        intro="Each load is a server read that may be audited. A hover would send a request on every pass of the pointer, so the value loads only on a click of the eye button. Copy while hidden loads the value and copies it without showing it. The value is visible text only after a reveal: never put it in a title, an accessible label or a tooltip."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One SecretValue per secret. Name the copy button for the value when several share a surface."
          >
            <SecretValue loadValue={loadDatabaseUrl} copyLabel="Copy DATABASE_URL" />
          </Example>
          <Example
            verdict="dont"
            caption="A secret shown as plain text, or in a hover title, is visible to anyone who looks at or shares the screen."
          >
            <span className="font-mono text-xs">{DATABASE_URL}</span>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
