import type { Meta, StoryObj } from '@storybook/react';
import { PlusIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbMenu,
  type BreadcrumbMenuOption,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../src/components/atoms/breadcrumb.tsx';
import { DropdownMenuItem, DropdownMenuSeparator } from '../src/components/atoms/dropdown-menu.tsx';

/**
 * Guidance, not props. One trail in the top bar, separators from the
 * component, and a BreadcrumbMenu for a crumb that switches siblings. For the
 * component API, see the Breadcrumb stories.
 */
const meta = {
  title: 'Atoms/Data Display/Breadcrumb/Guidance',
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

const environments: BreadcrumbMenuOption[] = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
];

function EnvironmentTrail() {
  const [value, setValue] = useState('production');
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbMenu label="Environment" options={environments} value={value} onValueChange={setValue}>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon />
              Add environment
            </DropdownMenuItem>
          </BreadcrumbMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Deployments</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const OneTrail: Story = {
  name: '1 · One trail, separators from the component',
  render: () => (
    <Section
      title="Links up, the page last, BreadcrumbSeparator between"
      intro="Each level above the page is a BreadcrumbLink and the page is a BreadcrumbPage. Do not type slashes between links."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Example verdict="do" caption="Breadcrumb: a nav landmark, the page marked as current.">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#catalog">Catalog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Running shoes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Example>
        <Example verdict="dont" caption="Links joined with typed slashes: no landmark, no current page.">
          <p className="text-muted-foreground text-sm">
            <a href="#catalog" className="underline">
              Catalog
            </a>{' '}
            / Running shoes
          </p>
        </Example>
      </div>
    </Section>
  ),
};

export const SwitchSiblings: Story = {
  name: '2 · A crumb that switches siblings is a menu',
  render: () => (
    <Section
      title="Switch the environment from its crumb"
      intro="Make the crumb a BreadcrumbMenu. Do not add a select beside the page title. For a long list with a search field, use BreadcrumbSearchMenu."
    >
      <Example verdict="do" caption="BreadcrumbMenu: the current environment, a menu of the others, and Add environment.">
        <EnvironmentTrail />
      </Example>
    </Section>
  ),
};
