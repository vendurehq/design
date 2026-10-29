import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { AnonymizedToken } from '../src/components/molecules/anonymized-token.tsx';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

/**
 * Guidance, not props. When a secret-like value belongs on screen, use
 * AnonymizedToken instead of IdChip: the user can copy the whole token, sees a
 * blurred, truncated preview at rest, and gets a sharp preview on hover/focus.
 * For the component API, see the AnonymizedToken stories.
 */
const meta = {
  title: 'Molecules/AnonymizedToken/Guidance',
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

const SECRET_TOKEN = 'vc_pat_7JjK9mN2pQ4rS6tU8vW0xY1zA3bC5dE7';
const ORDER_ID = '5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f';

const TOOLS: { tool: string; sample: ReactNode; use: string }[] = [
  {
    tool: 'AnonymizedToken',
    sample: <AnonymizedToken value={SECRET_TOKEN} />,
    use: 'Secret-like values the user must copy but should not casually reveal: personal access tokens, registry tokens, webhook secrets.',
  },
  {
    tool: 'IdChip',
    sample: <IdChip value={ORDER_ID} />,
    use: 'Opaque identifiers that are not secrets: entity IDs, gateway references, hashes. The full value may be copied and revealed on hover.',
  },
  {
    tool: 'CopyableText',
    sample: (
      <CopyableText value="https://api.acme.test/webhooks">
        https://api.acme.test/webhooks
      </CopyableText>
    ),
    use: 'Human-readable values that should stay visible in full and only need a copy affordance.',
  },
];

export const ChoosingTheTool: Story = {
  name: '1 · Secret token vs ID vs copyable text',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Mask secrets, chip identifiers, leave readable values readable"
        intro="AnonymizedToken is for values that need two properties at once: the user must copy the exact bytes, but the interface should soften the token during normal scanning. It shows a blurred prefix/tail preview at rest and sharpens it on hover or keyboard focus, never revealing the full value. That is different from IdChip, which is density for non-secret machine IDs, and CopyableText, which adds a button to content you already want visible."
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
        title="Never use masking as a security boundary"
        intro="The component receives the full token so it can copy it. It only controls presentation. Do not pass a value to the browser if the user is not allowed to possess it."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The user owns this newly issued registry token. It renders as a blurred prefix/tail preview, sharpens on hover/focus, copies in full on command, and is not exposed through a hover title."
          >
            <AnonymizedToken value={SECRET_TOKEN} />
          </Example>
          <Example
            verdict="dont"
            caption="A non-secret primary key belongs in IdChip, not AnonymizedToken. Masking suggests secrecy where there is only opacity."
          >
            <AnonymizedToken value={ORDER_ID} />
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const DisplayRules: Story = {
  name: '2 · Display rules',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Blurred at rest, sharp on intent"
        intro="The default treatment gives users enough shape to recognize which token they are copying without making the token crisp during scanning or screen sharing. Hover and keyboard focus sharpen the truncated preview. If a surface needs stronger secrecy, disable reveal-on-hover and keep the preview blurred."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The token preview is present but softened at rest; the same fixed-width capsule sharpens in place on hover/focus."
          >
            <AnonymizedToken value={SECRET_TOKEN} />
            <AnonymizedToken
              value="sk_live_AaBbCcDdEeFfGg"
              previewPrefixLength={7}
              previewSuffixLength={2}
            />
          </Example>
          <Example
            verdict="dont"
            caption="A token rendered as plain CopyableText is fully visible all the time, which is easy to leak while screen sharing or scanning a support page."
          >
            <CopyableText value={SECRET_TOKEN}>
              <span className="font-mono text-sm">{SECRET_TOKEN}</span>
            </CopyableText>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
