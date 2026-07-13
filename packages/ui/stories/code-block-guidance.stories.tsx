import type { Meta, StoryObj } from '@storybook/react';
import { SparklesIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Kbd } from '../src/components/atoms/kbd.tsx';
import { CodeBlock, CodeBlockAction } from '../src/components/molecules/code-block.tsx';
import { CopyableText } from '../src/components/molecules/copyable-text.tsx';
import { IdChip } from '../src/components/molecules/id-chip.tsx';

/**
 * Guidance, not props. When a value earns the full CodeBlock treatment versus
 * its lighter siblings (CopyableText/IdChip for one opaque value, inline
 * `<code>`/Kbd for a token in a sentence), and the rules on its three loaded
 * features: the package-manager switcher, the actions slot, and the filename
 * header. For the component API and its props, see the CodeBlock stories.
 */
const meta = {
  title: 'Molecules/CodeBlock/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ── shared primitives (duplicated per guidance file, not imported) ───────────

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

// The test that separates CodeBlock from its lighter siblings: how much code is
// it, and does the reader read/transport it wholesale?
const WHICH: { value: string; pick: string; why: string }[] = [
  {
    value: 'Multi-line config, plugin code, a GraphQL query',
    pick: 'CodeBlock',
    why: 'The reader studies it or lifts the whole block into their own file. Syntax highlighting, copy, and a filename header all pull their weight.',
  },
  {
    value: 'A one-line install or CLI command',
    pick: 'CodeBlock',
    why: 'Still transported wholesale into a terminal, and the only place the package-manager switcher belongs.',
  },
  {
    value: 'One opaque value: an API key, a webhook URL, an entity ID',
    pick: 'CopyableText / IdChip',
    why: 'Nothing to highlight and no header to earn. A single copy affordance beside the value is the whole job.',
  },
  {
    value: 'A token named inside a sentence: a flag, a prop, a method',
    pick: 'inline <code> / Kbd',
    why: 'It lives in prose. A framed, copyable block would break the line and over-furnish one word.',
  },
];

// The switcher rewrites npm → pnpm/yarn/bun. That only makes sense when the
// reader is *running* the command, never when they are reading its output.
const SWITCHER: { case: string; on: boolean; note: string }[] = [
  {
    case: 'Getting-started install step',
    on: true,
    note: 'The reader runs this under their own package manager. Tabs let them pick it.',
  },
  {
    case: 'CLI scaffold command (npx / npm create)',
    on: true,
    note: 'Also a command the reader executes; npx maps to dlx/bunx, npm create to the PM equivalent.',
  },
  {
    case: 'Terminal output pasted for reference',
    on: false,
    note: 'Nobody re-runs output. Rewriting npm lines inside a log would corrupt it.',
  },
  {
    case: 'A shell block that happens to mention npm in a comment',
    on: false,
    note: 'Not an instruction to run. Leave it as a plain bash block.',
  },
];

// ── stories ──────────────────────────────────────────────────────────────────

export const WhichComponent: Story = {
  name: '1 · CodeBlock vs CopyableText vs inline code',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Multi-line code earns CodeBlock; one value does not"
        intro="CodeBlock is the heaviest of the copy-affordance family: a framed, syntax-highlighted, header-bearing block. It pays for that weight when the content is code a reader studies or lifts wholesale — a config file, a plugin, a GraphQL query, an install command. Drop a rung for a single opaque value (an API key, a webhook URL, an ID): that is CopyableText or its IdChip sibling. Drop another for a token named inside a sentence: that is inline <code> or, for a keystroke, Kbd. See the CopyableText guidance for the value-shaped choice between CopyableText and IdChip."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Multi-line code the reader transports wholesale — the frame, highlighting, and copy all earn their place."
          >
            <CodeBlock language="typescript" filename="src/vendure-config.ts">
              {`export const config: VendureConfig = {
  apiOptions: { port: 3000 },
};`}
            </CodeBlock>
          </Example>
          <Example
            verdict="dont"
            caption="One opaque value forced into a code block: a header and a highlighter furnishing a single string. Use CopyableText."
          >
            <CodeBlock language="text" hideHeader>
              whsec_9c1f8b7e2f3a4c9d9e218a7b6c5d4e3f
            </CodeBlock>
          </Example>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The same webhook secret as a single copyable value, and an ID as an IdChip. One affordance, no frame."
          >
            <CopyableText value="whsec_9c1f8b7e2f3a4c9d9e218a7b6c5d4e3f">
              <span className="font-mono text-xs">whsec_9c1f8b7e2f3a4c9d9e218a7b6c5d4e3f</span>
            </CopyableText>
            <IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />
          </Example>
          <Example
            verdict="dont"
            caption="A prop named in prose does not need a block. Set the migrations flag with <code>runMigrations: true</code>, or press Kbd to run them."
          >
            <p className="text-sm">
              Set <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">runMigrations</code>{' '}
              to true, then press <Kbd>⌘ R</Kbd> to apply.
            </p>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const SwitcherIsForInstructions: Story = {
  name: '2 · packageManagerSwitcher: instructions, not output',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Turn the switcher on only when the reader runs the command"
        intro="packageManagerSwitcher adds npm → pnpm/yarn/bun tabs that rewrite the command in place. It exists for docs surfaces telling a reader to install or scaffold something — the reader picks their manager and copies the rewritten line. It is meaningless, and actively wrong, for terminal output: no one re-runs a log, and rewriting the npm lines inside one would corrupt it. Gate it on a single question: is this a command I am asking the reader to run?"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="An install instruction. Tabs let the reader run it under pnpm, yarn, or bun without mental translation."
          >
            <CodeBlock language="bash" packageManagerSwitcher>
              npm install @vendure/core
            </CodeBlock>
          </Example>
          <Example
            verdict="dont"
            caption="Terminal output with the switcher on. There is nothing to run here, and the tabs would rewrite the npm line inside a log."
          >
            <CodeBlock language="bash">
              {`$ vendure add
✔ Installed plugin via npm install @vendure/email-plugin
✔ Wrote src/plugins/email/email.plugin.ts`}
            </CodeBlock>
          </Example>
        </div>
      </Section>

      <Section
        title="When the switcher belongs"
        intro="A quick reference for the call."
      >
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Case</th>
                <th className="p-3 font-medium">Switcher</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {SWITCHER.map(({ case: c, on, note }) => (
                <tr key={c} className="border-b align-top last:border-0">
                  <td className="p-3 text-xs">{c}</td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-xs ${
                        on ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
                      }`}
                    >
                      {on ? 'on' : 'off'}
                    </span>
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  ),
};

export const ActionsAndFilename: Story = {
  name: '3 · The actions slot and the filename header',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="The actions slot is the consumer's, not the design system's"
        intro="CodeBlock ships exactly one built-in toolbar control: Copy. The actions slot is where a consuming app hangs its own — an 'Ask AI' button in a docs site, an 'Open in playground' link, a 'Run' trigger. The design system deliberately does not ship these; they are app-specific and belong to the surface, wired through CodeBlockAction (a tooltip icon button). Keep the slot to one or two genuine actions — it is a toolbar, not a menu."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A docs app adds its own 'Ask AI' action; Copy stays the design-system default beside it."
          >
            <CodeBlock
              language="bash"
              packageManagerSwitcher
              actions={
                <CodeBlockAction
                  icon={<SparklesIcon className="size-4" />}
                  label="Ask AI"
                  onClick={() => {}}
                />
              }
            >
              npm install @vendure/core
            </CodeBlock>
          </Example>
          <Example
            verdict="dont"
            caption="Do not expect the design system to grow a Run/Share/Download toolbar. Those are the app's job; the slot is how you add them."
          >
            <CodeBlock language="bash">vendure migrate</CodeBlock>
          </Example>
        </div>
      </Section>

      <Section
        title="Show a filename when the reader is meant to create or edit that file"
        intro="The filename header (a FileIcon plus the path) tells the reader this code is the contents of a specific file — put it here, name it this. Set it whenever the snippet maps to a real file in their project. Leave it off for throwaway REPL snippets, shell commands, or output, where there is no file to name. The filename can come from the prop or from a `// filename:` directive on the first line of the code."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The reader must create this exact file. The header names it and its path."
          >
            <CodeBlock language="typescript" filename="src/plugins/loyalty/loyalty.plugin.ts">
              {`import { VendurePlugin } from '@vendure/core';

@VendurePlugin({})
export class LoyaltyPlugin {}`}
            </CodeBlock>
          </Example>
          <Example
            verdict="dont"
            caption="A filename on a shell command implies you should save it to a file. It is a command to run — no header, or just 'Terminal'."
          >
            <CodeBlock language="bash" filename="install.ts">
              npm run migration:generate
            </CodeBlock>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

export const NotationRestraint: Story = {
  name: '4 · One notation intent per block',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Notations point at one thing; stacking them points at nothing"
        intro="Shiki notations (highlight, diff ++/--, focus, word, error/warning) exist to draw the eye to the one change or line that matters in a snippet. Their power is contrast: the annotated line stands out because the rest is quiet. Combine highlight and focus and a diff and a word marker in a single block and every line is emphasized, which means none is. Pick the one intent the block is teaching and mark only that; if a snippet genuinely needs several distinct points, split it into several blocks."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="A single diff intent: the reader's eye lands exactly on the line that changed."
          >
            <CodeBlock language="typescript">
              {`export const config: VendureConfig = {
  apiOptions: {
    port: 3000, // [!code --]
    port: 3100, // [!code ++]
  },
};`}
            </CodeBlock>
          </Example>
          <Example
            verdict="dont"
            caption="Highlight, focus, a diff, and a word marker at once. Everything is emphasized, so nothing reads as the point."
          >
            <CodeBlock language="typescript">
              {`export const config: VendureConfig = { // [!code word:VendureConfig]
  apiOptions: {
    port: 3000, // [!code highlight]
    adminApiPath: 'admin', // [!code ++]
  },
  plugins: [], // [!code focus]
};`}
            </CodeBlock>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
