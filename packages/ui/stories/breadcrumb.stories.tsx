import type { Meta, StoryObj } from '@storybook/react';
import { LayoutGridIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { checkCheckedRowLook } from './menu-checked-row.ts';
import { checkDisabledContentDims } from './menu-disabled-item.ts';
import { DropdownMenuItem, DropdownMenuSeparator } from '../src/components/atoms/dropdown-menu.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { CommandItem } from '../src/components/atoms/command.tsx';
import {
  Breadcrumb,
  BreadcrumbMenu,
  BreadcrumbSearchMenu,
  type BreadcrumbMenuOption,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '../src/components/atoms/breadcrumb.tsx';
import { expectPx } from './pixel.ts';

const meta = {
  title: 'Atoms/Data Display/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Products</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Running Shoes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

export const WithEllipsis: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Footwear</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Running Shoes</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

/** A status dot for the stories. The consumer fills the `leading` slot. */
function Dot({ tone }: { tone: 'success' | 'warning' | 'muted' }) {
  const fill = { success: 'bg-success', warning: 'bg-warning', muted: 'bg-muted-foreground' }[tone];
  return <span aria-hidden className={`size-1.75 shrink-0 rounded-full ${fill}`} />;
}

const environments: BreadcrumbMenuOption[] = [
  { value: 'production', label: 'Production', leading: <Dot tone="success" /> },
  { value: 'staging', label: 'Staging', leading: <Dot tone="warning" />, detail: 'Non-production' },
  { value: 'preview', label: 'Checkout preview', leading: <Dot tone="muted" />, detail: 'Non-production' },
];

function EnvironmentCrumbs({ options = environments, page = 'Overview' }: { options?: BreadcrumbMenuOption[]; page?: string }) {
  const [value, setValue] = React.useState(options[0]?.value ?? '');
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbMenu label="Environment" options={options} value={value} onValueChange={setValue}>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <PlusIcon />
              Add environment
            </DropdownMenuItem>
          </BreadcrumbMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * The first crumb switches the current item. It opens a menu toward the
 * centre of the screen; picking a row moves the check, which draws in, and
 * the crumb's label crossfades. The menu stays open until Escape, a click
 * outside or the crumb.
 */
export const WithMenu: Story = {
  render: () => <EnvironmentCrumbs />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Environment: Production' });
    await expect(crumb).toHaveAttribute('aria-haspopup', 'menu');
    await expectPx(crumb.getBoundingClientRect().height, 30);
    await userEvent.click(crumb);
    const menu = await within(document.body).findByRole('menu');
    await Promise.all(menu.getAnimations().map((animation) => animation.finished));
    const staging = within(menu).getByRole('menuitemradio', { name: /Staging/ });
    await expect(within(menu).getByRole('menuitemradio', { name: /Production/ })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(staging);
    await expect(staging).toHaveAttribute('aria-checked', 'true');
    // Picking keeps the menu open, so the check is seen moving.
    await expect(crumb).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).not.toHaveAttribute('data-closed');
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Environment: Staging' })).toBeInTheDocument());
    await checkCheckedRowLook(menu);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(crumb).toHaveFocus());
  },
};

/** Without a `leading` slot the crumb starts with the label. */
export const WithMenuNoDot: Story = {
  render: () => (
    <EnvironmentCrumbs
      options={environments.map(({ leading: _leading, ...option }) => option)}
      page="Variables"
    />
  ),
};

/** Keyboard: Enter opens the menu, the arrows move, Enter picks. */
export const WithMenuKeyboard: Story = {
  tags: ['!autodocs'],
  render: () => <EnvironmentCrumbs />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Environment: Production' });
    crumb.focus();
    await userEvent.keyboard('{Enter}');
    const menu = await within(document.body).findByRole('menu');
    await waitFor(() => expect(within(menu).getAllByRole('menuitemradio')[0]).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Environment: Checkout preview' })).toBeInTheDocument());
  },
};

/**
 * An option with `disabled` shows at half strength and cannot be picked. The
 * arrow keys still stop on it, with only the focus ring.
 */
export const WithMenuDisabledOption: Story = {
  render: () => (
    <EnvironmentCrumbs
      options={environments.map((option) => (option.value === 'staging' ? { ...option, disabled: true } : option))}
    />
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Environment: Production' }));
    const menu = await within(document.body).findByRole('menu');
    const staging = within(menu).getByRole('menuitemradio', { name: /Staging/ });
    await expect(staging).toHaveAttribute('data-disabled');
    // The dot, the label and "Non-production" all dim to half, like the row
    // below with the same parts.
    await checkDisabledContentDims(staging, within(menu).getByRole('menuitemradio', { name: /Checkout preview/ }));
    await userEvent.click(staging, { pointerEventsCheck: 0 });
    await expect(staging).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard('{Escape}');
  },
};

/** Right to left: the chevron and the menu mirror. */
export const WithMenuRightToLeft: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <EnvironmentCrumbs />
      </div>
    </DirectionProvider>
  ),
};

/** A status dot that says its status to a screen reader through `status`. */
const statusEnvironments: BreadcrumbMenuOption[] = [
  { value: 'production', label: 'Production', leading: <Dot tone="success" />, status: 'Healthy' },
  { value: 'staging', label: 'Staging', leading: <Dot tone="warning" />, status: 'Deploying', detail: 'Non-production' },
];

/**
 * `status` gives the dot its words. The crumb reads the list, the name and
 * then the status, though the dot shows first: "Environment: Production,
 * Healthy". The menu rows read the same way.
 */
export const WithMenuStatus: Story = {
  render: () => <EnvironmentCrumbs options={statusEnvironments} />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Environment: Production, Healthy' });
    await userEvent.click(crumb);
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByRole('menuitemradio', { name: /Staging.*Deploying/ })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

const longEnvironments: BreadcrumbMenuOption[] = [
  { value: 'feature', label: 'Feature: checkout redesign with saved payment methods', leading: <Dot tone="success" />, status: 'Healthy' },
  { value: 'production', label: 'Production', leading: <Dot tone="success" />, status: 'Healthy' },
];

/**
 * A long name ends in an ellipsis when the crumb has no room, here a 200px
 * trail, and a tooltip shows it in full. The label still swaps: a pick
 * crossfades to the new name and the crumb's width follows.
 */
export const WithMenuLongName: Story = {
  render: () => (
    <div className="w-50">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="min-w-0">
            <LongNameMenu />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbPage>Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', {
      name: 'Environment: Feature: checkout redesign with saved payment methods, Healthy',
    });
    const shown = () => crumb.querySelector<HTMLElement>('[data-swap="in"]')!;
    // The crumb stays inside the trail, and the page crumb stays in view.
    const trail = canvasElement.querySelector('ol')!;
    await expect(crumb.getBoundingClientRect().right).toBeLessThanOrEqual(trail.getBoundingClientRect().right);
    await expect(shown().scrollWidth).toBeGreaterThan(shown().clientWidth);
    await expect(getComputedStyle(shown()).textOverflow).toBe('ellipsis');
    await userEvent.hover(crumb);
    const tooltip = await within(document.body).findByText('Feature: checkout redesign with saved payment methods', {
      selector: '[data-slot="tooltip-content"]',
    });
    await waitFor(() => expect(tooltip).toBeVisible());
    await userEvent.unhover(crumb);
    // A short name fits: no ellipsis, no tooltip.
    await userEvent.click(crumb);
    const menu = await within(document.body).findByRole('menu');
    await userEvent.click(within(menu).getByRole('menuitemradio', { name: /Production/ }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(shown()).toHaveTextContent('Production'));
    await waitFor(() => expect(shown().scrollWidth).toBeLessThanOrEqual(shown().clientWidth));
    // Back to the long name: it is cut again.
    await userEvent.click(crumb);
    await userEvent.click(within(await within(document.body).findByRole('menu')).getByRole('menuitemradio', { name: /Feature/ }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(shown().scrollWidth).toBeGreaterThan(shown().clientWidth));
  },
};

function LongNameMenu() {
  const [value, setValue] = React.useState('feature');
  return <BreadcrumbMenu label="Environment" options={longEnvironments} value={value} onValueChange={setValue} />;
}

const linkedEnvironments: BreadcrumbMenuOption[] = environments.map((option) => ({
  ...option,
  href: `#environment-${option.value}`,
}));

/**
 * Rows with `href` are links, so they open in a new tab. Each keeps the
 * `menuitemradio` role and the current one its check. A plain click follows
 * the link and calls `onValueChange`; a click with Cmd, Ctrl or Shift opens
 * the link elsewhere and leaves the current item. `render` takes a router
 * link instead.
 */
export const WithMenuLinks: Story = {
  render: () => <EnvironmentCrumbs options={linkedEnvironments} />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Environment: Production' });
    await userEvent.click(crumb);
    const menu = await within(document.body).findByRole('menu');
    const staging = within(menu).getByRole('menuitemradio', { name: /Staging/ });
    await expect(staging.tagName).toBe('A');
    await expect(staging).toHaveAttribute('href', '#environment-staging');
    await expect(within(menu).getByRole('menuitemradio', { name: /Production/ })).toHaveAttribute('aria-checked', 'true');
    // A modifier click is for a new tab: the current item stays. The default
    // is prevented here so the story does not open a tab.
    const keepHere = (event: MouseEvent) => event.preventDefault();
    staging.addEventListener('click', keepHere, { once: true });
    fireEvent.click(staging, { metaKey: true });
    await expect(staging).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(staging);
    await expect(staging).toHaveAttribute('aria-checked', 'true');
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Environment: Staging' })).toBeInTheDocument());
    // Enter on a link row follows the link and picks the row, once.
    const preview = within(menu).getByRole('menuitemradio', { name: /Checkout preview/ });
    preview.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(preview).toHaveAttribute('aria-checked', 'true'));
    await waitFor(() => expect(window.location.hash).toBe('#environment-preview'));
    await userEvent.keyboard('{Escape}');
  },
};

/** `open` and `onOpenChange` control the menu, here from a button beside it. */
export const WithMenuControlled: Story = {
  render: () => <ControlledMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open the environments' }));
    const menu = await within(document.body).findByRole('menu');
    await waitFor(() => expect(menu).toBeVisible());
    await expect(canvas.getByText('Open: yes')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.getByText('Open: no')).toBeInTheDocument());
  },
};

function ControlledMenu() {
  const [value, setValue] = React.useState('production');
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex items-center gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbMenu
              label="Environment"
              options={environments}
              value={value}
              onValueChange={setValue}
              open={open}
              onOpenChange={setOpen}
            />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Open the environments
      </Button>
      <span className="text-muted-foreground text-sm">Open: {open ? 'yes' : 'no'}</span>
    </div>
  );
}

type Project = { id: string; name: string; slug: string; plan?: string };

const allProjects: Project[] = [
  { id: 'p1', name: 'Acme Storefront', slug: 'acme-storefront', plan: 'Growth' },
  { id: 'p2', name: 'Acme Wholesale', slug: 'acme-b2b', plan: 'Starter' },
  { id: 'p3', name: 'Northwind Outdoor Equipment and Apparel Europe', slug: 'northwind-eu' },
  { id: 'p4', name: 'Globex Marketplace', slug: 'globex' },
];

type ProjectsRead = 'loaded' | 'loading' | 'error' | 'empty';

/**
 * The Console's project switcher. The read is local state here: Retry
 * loads the projects again.
 */
function ProjectCrumbs({
  read: initial = 'loaded',
  readControlled,
  projectId = 'p1',
}: {
  read?: ProjectsRead;
  readControlled?: ProjectsRead;
  projectId?: string;
}) {
  const [ownRead, setRead] = React.useState(initial);
  const read = readControlled ?? ownRead;
  const [value, setValue] = React.useState(projectId);
  const [open, setOpen] = React.useState(false);
  const projects = read === 'loaded' ? allProjects : [];
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="min-w-0 max-w-56">
          <BreadcrumbSearchMenu
            label="Projects"
            searchPlaceholder="Find project…"
            emptyText="No project found."
            placeholder={read === 'error' ? 'Projects unavailable' : value ? 'Project' : 'All projects'}
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
              keywords: [project.slug],
              detail: project.plan,
            }))}
            value={value}
            onValueChange={setValue}
            open={open}
            onOpenChange={setOpen}
            loading={read === 'loading'}
            error={read === 'error' ? 'Projects could not be loaded' : undefined}
            onRetry={() => setRead('loaded')}
          >
            <CommandItem
              forceMount
              value="all-projects"
              onSelect={() => {
                setValue('');
                setOpen(false);
              }}
            >
              <LayoutGridIcon />
              <span className="min-w-0 truncate">All projects</span>
            </CommandItem>
            <CommandItem forceMount value="create-project" onSelect={() => setOpen(false)}>
              <PlusIcon />
              <span className="min-w-0 truncate">Create project</span>
            </CommandItem>
          </BreadcrumbSearchMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Activity</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * `BreadcrumbSearchMenu`: the same crumb with a search field, for a list
 * that grows long. The search matches the name and the slug. A pick closes
 * the popup and the crumb's label swaps. The footer stays in view while the
 * list scrolls, and a search does not hide it.
 */
export const SearchMenu: Story = {
  render: () => <ProjectCrumbs />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Projects: Acme Storefront' });
    await userEvent.click(crumb);
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    const search = within(popup).getByRole('combobox');
    await waitFor(() => expect(search).toHaveFocus());
    await expect(within(popup).getByRole('option', { name: /Acme Storefront/ })).toHaveAttribute('data-checked', 'true');
    // The slug matches; the id does not.
    await userEvent.type(search, 'b2b');
    await waitFor(() => expect(within(popup).getAllByRole('option', { name: /Acme|Northwind|Globex/ })).toHaveLength(1));
    await expect(within(popup).getByRole('option', { name: /All projects/ })).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'p3');
    await waitFor(() => expect(within(popup).queryAllByRole('option', { name: /Northwind/ })).toHaveLength(0));
    await userEvent.clear(search);
    await userEvent.type(search, 'glob');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(crumb).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(within(canvasElement).getByRole('button', { name: 'Projects: Globex Marketplace' })).toBeInTheDocument());
  },
};

/** A search that matches nothing says so. The footer stays. */
export const SearchMenuEmpty: Story = {
  render: () => <ProjectCrumbs />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Projects:/ }));
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    await userEvent.type(within(popup).getByRole('combobox'), 'zzz');
    await expect(await within(popup).findByText('No project found.')).toBeVisible();
    await expect(within(popup).getByRole('option', { name: /Create project/ })).toBeVisible();
  },
};

/** No projects at all: the popup says so above the footer. */
export const SearchMenuNoOptions: Story = {
  render: () => <ProjectCrumbs read="empty" projectId="" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Projects: All projects' }));
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    await waitFor(() => expect(within(popup).getByText('No project found.')).toBeVisible());
    await expect(within(popup).getByRole('option', { name: /Create project/ })).toBeVisible();
  },
};

/**
 * While the projects load, the crumb shows the placeholder and the popup a
 * loading row in place of the options. The footer stays.
 */
export const SearchMenuLoading: Story = {
  render: () => <ProjectCrumbs read="loading" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Projects: Project' }));
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    await expect(within(popup).getByRole('status')).toHaveTextContent('Loading…');
    await expect(within(popup).queryByText('No project found.')).not.toBeInTheDocument();
    await expect(within(popup).getByRole('option', { name: /Create project/ })).toBeInTheDocument();
  },
};

/**
 * When the projects arrive, the crumb swaps from the placeholder to the
 * project's name, which it shows in full.
 */
export const SearchMenuLoaded: Story = {
  tags: ['!autodocs'],
  render: () => <LoadingProjects />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Projects: Project' })).toBeInTheDocument();
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Finish loading' }));
    const loaded = await within(canvasElement).findByRole('button', { name: 'Projects: Acme Storefront' });
    // The placeholder and the first project share an index: the crumb
    // measures again, so the longer name is not cut.
    const shown = loaded.querySelector<HTMLElement>('[data-swap="in"]')!;
    await waitFor(() => expect(shown.scrollWidth).toBeLessThanOrEqual(shown.clientWidth));
  },
};

function LoadingProjects() {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="flex items-center gap-4">
      {/* The same crumb stays mounted while the read finishes. */}
      <ProjectCrumbs readControlled={loaded ? 'loaded' : 'loading'} />
      <Button variant="outline" size="sm" onClick={() => setLoaded(true)}>
        Finish loading
      </Button>
    </div>
  );
}

/**
 * The projects could not be read: the crumb says so, and the popup shows
 * the reason as a row that cannot be picked and a Retry row.
 */
export const SearchMenuError: Story = {
  render: () => <ProjectCrumbs read="error" />,
  play: async ({ canvasElement }) => {
    const crumb = within(canvasElement).getByRole('button', { name: 'Projects: Projects unavailable' });
    await userEvent.click(crumb);
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    await waitFor(() => expect(within(popup).getByText('Projects could not be loaded')).toBeVisible());
    await expect(within(popup).getByRole('group', { name: 'Projects could not be loaded' })).toBeInTheDocument();
    await expect(within(popup).queryByText('No project found.')).not.toBeInTheDocument();
    await expect(within(popup).getByRole('option', { name: 'Retry' })).toBeInTheDocument();
  },
};

/** Retry reads the projects again; they replace the error rows. */
export const SearchMenuRetry: Story = {
  tags: ['!autodocs'],
  render: () => <ProjectCrumbs read="error" />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Projects: Projects unavailable' }));
    const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
    await userEvent.click(within(popup).getByRole('option', { name: 'Retry' }));
    await expect(await within(document.body).findByRole('option', { name: /Acme Storefront/ })).toBeInTheDocument();
    await expect(within(canvasElement).getByRole('button', { name: 'Projects: Acme Storefront' })).toBeInTheDocument();
  },
};
