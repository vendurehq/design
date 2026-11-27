import type { Meta, StoryObj } from '@storybook/react';
import { Copy, MoreHorizontal, Pencil, Rocket, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';

/**
 * Guidance, not props. The primary action is a Button; the rest go in one
 * DropdownMenu, the destructive item last. For the component API, see the
 * DropdownMenu stories.
 */
const meta = {
  title: 'Atoms/Menus/DropdownMenu/Guidance',
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

export const OverflowMenu: Story = {
  name: '1 · Overflow actions live in one menu',
  render: () => (
    <Section
      title="One primary Button, the rest in a menu"
      intro="The trigger is a ghost icon button whose aria-label names the item. A destructive item goes last, after a separator."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="Deploy stays a Button. Edit, duplicate and delete sit in the menu.">
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Rocket />
              Deploy
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" aria-label="More for Storefront" />}
              >
                <MoreHorizontal />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Example>
        <Example verdict="dont" caption="Four icon buttons on one row: the row is noisy and Delete sits next to Edit.">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="Deploy">
              <Rocket />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Edit">
              <Pencil />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Duplicate">
              <Copy />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Delete">
              <Trash2 />
            </Button>
          </div>
        </Example>
      </div>
    </Section>
  ),
};
