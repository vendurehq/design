import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { TextLink } from '../src/components/atoms/text-link.tsx';
import { ArrowLink } from '../src/components/molecules/arrow-link.tsx';

/**
 * Guidance, not props. Which of the three link looks to use: TextLink in
 * text, ArrowLink at the end of a region, Button for an action. See the
 * ArrowLink and Button guidance pages for their own rules.
 */
const meta = {
  title: 'Atoms/General/TextLink/Guidance',
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
      <div className="text-sm">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

const CHOICES: { part: string; sample: ReactNode; use: string }[] = [
  {
    part: 'TextLink',
    sample: (
      <span>
        Change the <TextLink href="#">capture setting</TextLink>.
      </span>
    ),
    use: 'A link inside a sentence, or a small standalone link ("Forgot password?", "Terms").',
  },
  {
    part: 'ArrowLink',
    sample: <ArrowLink href="#">All deployments</ArrowLink>,
    use: 'More of the same subject, at the end of a panel head, card or notice. One per region.',
  },
  {
    part: 'Button',
    sample: <Button variant="outline">Retry build</Button>,
    use: 'An action: it changes data or opens a dialog. Never a link look.',
  },
];

export const ChoosingALink: Story = {
  name: '1 · TextLink, ArrowLink or Button',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Pick the part by where the link sits and what it does"
        intro="A link goes somewhere; an action does something. Inside text, a link is a TextLink. At the end of a region that has more behind it, it is an ArrowLink."
      >
        <div className="grid gap-3">
          {CHOICES.map(({ part, sample, use }) => (
            <div key={part} className="grid grid-cols-[8rem_14rem_1fr] items-center gap-4 rounded-lg border p-4">
              <code className="text-sm font-medium">{part}</code>
              <div className="text-sm">{sample}</div>
              <p className="text-muted-foreground text-sm">{use}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const ToneAndPlace: Story = {
  name: '2 · Tone and place',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Default in text, quiet beside actions"
        intro="The default tone is underlined at rest, so it reads as a link inside a sentence. The quiet tone is underlined only on hover: keep it out of sentences."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="A default TextLink inside the sentence it belongs to.">
            <p>
              Taxes follow the <TextLink href="#">tax zone</TextLink> of the shipping address.
            </p>
          </Example>
          <Example
            verdict="dont"
            caption="A quiet link inside a sentence has no underline at rest, so it looks like plain text."
          >
            <p className="text-muted-foreground">
              Taxes follow the{' '}
              <TextLink href="#" tone="quiet">
                tax zone
              </TextLink>{' '}
              of the shipping address.
            </p>
          </Example>
          <Example verdict="do" caption="A quiet link next to the main action, where it should not compete.">
            <div className="flex items-center gap-4">
              <Button>Sign in</Button>
              <TextLink href="#" tone="quiet">
                Forgot password?
              </TextLink>
            </div>
          </Example>
          <Example
            verdict="dont"
            caption="A chevron in a sentence breaks the line of text. ArrowLink belongs at the end of a region."
          >
            <p>
              Taxes follow the <ArrowLink href="#">tax zone</ArrowLink> of the shipping address.
            </p>
          </Example>
        </div>
      </Section>
      <Section
        title="Another site opens in a new tab"
        intro="Set external on a link to another site. It opens a new tab, ends with an up-right arrow and tells screen readers. A page of this app never takes the arrow."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example verdict="do" caption="An external TextLink to the provider's documentation.">
            <p>
              Create the API key in the{' '}
              <TextLink href="https://example.com" external>
                provider dashboard
              </TextLink>
              .
            </p>
          </Example>
          <Example
            verdict="dont"
            caption="A Button forced to look like a link. Use TextLink for navigation in text."
          >
            <p>
              Create the API key in the{' '}
              <Button variant="link" className="h-auto p-0">
                provider dashboard
              </Button>
              .
            </p>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
