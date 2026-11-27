import type { Meta, StoryObj } from '@storybook/react';
import { FileText, Settings, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../src/components/atoms/command.tsx';
import { Kbd, KbdGroup } from '../src/components/atoms/kbd.tsx';

/**
 * Guidance, not props. The command palette is a CommandDialog; a key is a Kbd.
 * The palette is shown inline here; in an app, CommandDialog opens it from the
 * SearchTrigger. For the component API, see the Command stories.
 */
const meta = {
  title: 'Atoms/Menus/Command/Guidance',
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

export const Palette: Story = {
  name: '1 · The palette is Command',
  render: () => (
    <Section
      title="One search field over pages and actions"
      intro="CommandInput filters the items and the arrow keys move between them. In an app, wrap it in CommandDialog and open it from the SearchTrigger and the same shortcut. Do not build a modal with an input and a list of buttons."
    >
      <Example verdict="do" caption="Command: pages to go to and actions to run, with their shortcuts.">
        <Command className="max-w-md rounded-lg border">
          <CommandInput placeholder="Search pages and actions" />
          <CommandList>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            <CommandGroup heading="Pages">
              <CommandItem>
                <ShoppingCart />
                Orders
                <CommandShortcut>G O</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <FileText />
                Invoices
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Actions">
              <CommandItem>
                <Settings />
                Open settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </Example>
    </Section>
  ),
};

export const Keys: Story = {
  name: '2 · A key is a Kbd',
  render: () => (
    <Section
      title="Show a shortcut with Kbd"
      intro="Use CommandShortcut inside an item and Kbd anywhere else. Do not style a span as a key."
    >
      <Example verdict="do" caption="Kbd in a hint.">
        <p className="text-muted-foreground text-sm">
          Press{' '}
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>{' '}
          to search.
        </p>
      </Example>
    </Section>
  ),
};
