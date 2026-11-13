import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { InlineCode } from '../src/components/molecules/inline-code.tsx';
import {
  IssuedSecret,
  IssuedSecretFooter,
  useIssuedSecretGuard,
} from '../src/components/molecules/issued-secret.tsx';
import { SecretValue } from '../src/components/molecules/secret-value.tsx';

/**
 * Guidance, not props. Use IssuedSecret for a secret that was just issued and
 * is shown once, such as a new API key or an initial password: copy-only,
 * never rendered, with a guard before the dialog closes. A stored secret the
 * user can load again is a SecretValue (see the SecretValue guidance). For the
 * component API, see the IssuedSecret stories.
 */
const meta = {
  title: 'Molecules/IssuedSecret/Guidance',
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

// Obviously fake values: never put a real-looking key in a story.
const API_KEY = 'vk_test_example_0000';
const DATABASE_URL = 'postgres://example:example@db.example.test/shop';

/** IssuedSecret outside a dialog, so the guidance page shows it in place. */
function InPlace({ formats }: { formats?: boolean }) {
  const guard = useIssuedSecretGuard(() => {});
  return (
    <div className="flex w-full flex-col gap-3">
      {formats ? (
        <IssuedSecret
          guard={guard}
          secretName="API key"
          name="Deploy bot"
          formats={[
            {
              label: 'Copy as environment variable',
              hint: (
                <>
                  For a .env file: <InlineCode>VENDURE_API_KEY=&lt;key&gt;</InlineCode>
                </>
              ),
              value: `VENDURE_API_KEY=${API_KEY}`,
            },
            { label: 'Copy key only', hint: 'For the value field of a secret store.', value: API_KEY },
          ]}
        />
      ) : (
        <IssuedSecret guard={guard} secretName="API key" name="Deploy bot" value={API_KEY} />
      )}
      <IssuedSecretFooter guard={guard} className="static m-0 bg-transparent p-0" />
    </div>
  );
}

const TOOLS: { tool: string; sample: ReactNode; use: string }[] = [
  {
    tool: 'IssuedSecret',
    sample: <InPlace />,
    use: 'A secret the system shows once: a new API key, a new token, an initial password. Copy-only, never rendered.',
  },
  {
    tool: 'SecretValue',
    sample: <SecretValue loadValue={async () => DATABASE_URL} />,
    use: 'A stored secret the server returns on request, such as an environment variable value.',
  },
];

export const ChoosingTheTool: Story = {
  name: '1 · Shown once vs stored',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Can the user get the value again?"
        intro="If the system shows the secret once and keeps only a hash, the user must copy it now: use IssuedSecret. If the user can load the value again later, it is a stored secret: use SecretValue."
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
                  <td className="w-80 p-3">{sample}</td>
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

export const CopyOnly: Story = {
  name: '2 · Copy-only, never rendered',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The value never shows"
        intro="No text, no blur, no reveal on hover: a screen share or a screenshot must not leak the secret. One button copies it, or one button per format, each with a hint that says where it goes. The value shows only when the clipboard write fails, in a read-only field for a copy by hand."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="One button per format. The hint shows the form with a placeholder, never the secret."
          >
            <InPlace formats />
          </Example>
          <Example
            verdict="dont"
            caption="A blurred preview that sharpens on hover still puts the secret on screen. Do not show a new secret as text or as an AnonymizedToken."
          >
            <AnonymizedToken value={API_KEY} />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const CloseGuard: Story = {
  name: '3 · The close guard',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="A close before the copy warns once"
        intro="Share one useIssuedSecretGuard between IssuedSecret and IssuedSecretFooter, and pass guard.onOpenChange to the Dialog. Before the first copy, Done, the close button, Escape and the backdrop show a warning, and the focus goes back to the copy button. Only the second action, Close without copying, closes. It is a destructive-outline button, so the copy button stays the one filled button. After a copy, Done closes at once."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Done starts quiet. The first copy button is the one primary until the first copy; then Done takes the primary look."
          >
            <InPlace />
          </Example>
          <Example
            verdict="dont"
            caption="A checkbox such as 'I have saved the key' asks the user to confirm what the component can know. The guard knows whether a copy happened."
          >
            <Button variant="outline" disabled>
              I have saved the key
            </Button>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
