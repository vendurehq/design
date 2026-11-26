import type { Meta, StoryObj } from '@storybook/react';
import { LayoutGridIcon, PlusIcon } from 'lucide-react';
import * as React from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { checkCheckedRowLook } from './menu-checked-row.ts';
import { checkDisabledContentDims } from './menu-disabled-item.ts';
import { DropdownMenuItem, DropdownMenuSeparator } from '../src/components/atoms/dropdown-menu.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { SidebarProvider, SidebarTrigger } from '../src/components/atoms/sidebar.tsx';
import { Separator } from '../src/components/atoms/separator.tsx';
import { CommandItem } from '../src/components/atoms/command.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '../src/components/atoms/tooltip.tsx';
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
    // The sm height, the same as a SidebarTrigger beside it.
    await expectPx(crumb.getBoundingClientRect().height, 28);
    // --content-inset is the real start inset: 9px padding and the 1px border.
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;width:var(--content-inset)';
    crumb.append(probe);
    await expectPx(probe.getBoundingClientRect().width, 10);
    probe.remove();
    const dot = crumb.firstElementChild as HTMLElement;
    await expectPx(dot.getBoundingClientRect().left - crumb.getBoundingClientRect().left, 10);
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

/**
 * Pass `options={undefined}` while the options load. The open menu shows a
 * loading row one item tall, so the items take its place without a jump.
 * Never pass `[]` for "not known yet": it means there are none.
 */
export const WithMenuLoading: Story = {
  render: () => <LoadingEnvironments />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Environment:/ }));
    const menu = await within(document.body).findByRole('menu');
    await expect(menu).toHaveAttribute('aria-busy', 'true');
    const loading = within(menu).getByRole('menuitem', { name: 'Loading…' });
    await expect(loading).toHaveAttribute('aria-disabled', 'true');
    await expect(within(menu).queryAllByRole('menuitemradio')).toHaveLength(0);
    // offsetHeight: the popup scales in, which a bounding box would include.
    const loadingHeight = loading.offsetHeight;
    // A click event only: a press outside would close the menu.
    fireEvent.click(within(canvasElement).getByRole('button', { name: 'Finish loading', hidden: true }));
    const item = await within(menu).findByRole('menuitemradio', { name: /Production/ });
    await expectPx(item.offsetHeight, loadingHeight);
  },
};

/** The menu while its options load, held open. */
export const WithMenuLoadingHeld: Story = {
  tags: ['!autodocs'],
  render: () => <LoadingEnvironments />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: /^Environment:/ }));
    const menu = await within(document.body).findByRole('menu');
    await expect(within(menu).getByRole('menuitem', { name: 'Loading…' })).toHaveAttribute('aria-disabled', 'true');
  },
};

function LoadingEnvironments() {
  const [loaded, setLoaded] = React.useState(false);
  const [value, setValue] = React.useState('production');
  return (
    <div className="flex items-center gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbMenu
              label="Environment"
              options={loaded ? environments : undefined}
              placeholder="All environments"
              value={value}
              onValueChange={setValue}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" onClick={() => setLoaded(true)}>
        Finish loading
      </Button>
    </div>
  );
}

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
    // One comma, no space before it, then the detail.
    await expect(within(menu).getByRole('menuitemradio', { name: 'Production, Healthy' })).toBeInTheDocument();
    await expect(
      within(menu).getByRole('menuitemradio', { name: 'Staging, Deploying Non-production' }),
    ).toBeInTheDocument();
    // The detail sits at the end of the row, right before the check.
    const staging = within(menu).getByRole('menuitemradio', { name: /Staging/ });
    const detail = within(staging).getByText('Non-production');
    const check = staging.querySelector('[data-slot="menu-check"]') as SVGElement;
    await expectPx(check.getBoundingClientRect().left - detail.getBoundingClientRect().right, 10);
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * A top bar: the sidebar's toggle, a divider and the crumbs. The toggle and
 * the crumb share the `sm` height, 28px, so their centres and their hover
 * fills line up.
 */
export const InTopBar: Story = {
  render: () => (
    <SidebarProvider className="min-h-0">
      <header className="bg-background border-border flex h-12 w-full items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-center" />
        <EnvironmentCrumbs options={statusEnvironments} />
      </header>
    </SidebarProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle Sidebar' });
    const crumb = canvas.getByRole('button', { name: 'Environment: Production, Healthy' });
    await expectPx(crumb.getBoundingClientRect().height, toggle.getBoundingClientRect().height);
    await expectPx(crumb.getBoundingClientRect().top, toggle.getBoundingClientRect().top);
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

/**
 * A consumer tooltip around a crumb, as a trail does to show a cut crumb in
 * full: it reads the cut `.truncate` text under the focus or the pointer.
 */
function CutTextTooltip({ children }: { children: React.ReactNode }) {
  const [text, setText] = React.useState<string | null>(null);
  const measure = (event: React.SyntheticEvent<HTMLElement>) => {
    if (!(event.target instanceof Element) || event.target.closest('[data-slot="breadcrumb-menu"]')) {
      setText(null);
      return;
    }
    const cut = [...event.currentTarget.querySelectorAll<HTMLElement>('.truncate')].filter(
      (part) => part.scrollWidth > part.clientWidth,
    );
    setText(cut.length > 0 ? cut.map((part) => part.textContent).join(' ') : null);
  };
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="flex min-w-0 items-center" />} onFocus={measure} onPointerOver={measure}>
        {children}
      </TooltipTrigger>
      {text ? <TooltipContent>{text}</TooltipContent> : null}
    </Tooltip>
  );
}

function CrumbsInTooltip({ options, initial }: { options: BreadcrumbMenuOption[]; initial: string }) {
  const [value, setValue] = React.useState(initial);
  return (
    <div className="w-50">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="min-w-0">
            <CutTextTooltip>
              <BreadcrumbMenu label="Environment" options={options} value={value} onValueChange={setValue} />
            </CutTextTooltip>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbPage>Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

/**
 * No tooltip shows over the open menu, from the crumb or from around it. It
 * records every tooltip that mounts, since one may close again at once.
 */
async function expectNoTooltipWhileOpen(canvasElement: HTMLElement, name: string) {
  const crumb = within(canvasElement).getByRole('button', { name });
  const shown: string[] = [];
  const observer = new MutationObserver((records) => {
    for (const node of records.flatMap((record) => [...record.addedNodes])) {
      if (!(node instanceof Element)) continue;
      const tip = node.matches('[data-slot="tooltip-content"]') ? node : node.querySelector('[data-slot="tooltip-content"]');
      if (tip) shown.push(tip.textContent ?? '');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Longer than the 350ms tooltip delay.
  const settle = () => new Promise((resolve) => setTimeout(resolve, 500));
  try {
    // A cut label shows its own tooltip on focus, while the menu is closed.
    crumb.focus();
    await settle();
    shown.length = 0;
    await userEvent.keyboard('{Enter}');
    const menu = await within(document.body).findByRole('menu');
    await waitFor(() => expect(within(menu).getAllByRole('menuitemradio')[0]).toHaveFocus());
    await settle();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.hover(within(menu).getAllByRole('menuitemradio')[1] as HTMLElement);
    await settle();
    await expect(shown.join(' | ')).toBe('');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(crumb).toHaveFocus());
  } finally {
    observer.disconnect();
  }
}

/**
 * Focus and the pointer in the open menu stay inside it: a tooltip that
 * wraps the crumb does not open over the menu. The hidden labels of the
 * crumb's swap count as cut there, so it would repeat one of them.
 */
export const WithMenuInConsumerTooltip: Story = {
  tags: ['!autodocs'],
  render: () => <CrumbsInTooltip options={environments} initial="production" />,
  play: ({ canvasElement }) => expectNoTooltipWhileOpen(canvasElement, 'Environment: Production'),
};

/** The same with a label that really is cut. */
export const WithMenuLongNameInConsumerTooltip: Story = {
  tags: ['!autodocs'],
  render: () => <CrumbsInTooltip options={longEnvironments} initial="feature" />,
  play: ({ canvasElement }) =>
    expectNoTooltipWhileOpen(
      canvasElement,
      'Environment: Feature: checkout redesign with saved payment methods, Healthy',
    ),
};

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
  const projects = read === 'loaded' ? allProjects : read === 'loading' ? undefined : [];
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="min-w-0 max-w-56">
          <BreadcrumbSearchMenu
            label="Projects"
            searchPlaceholder="Find project…"
            emptyText="No project found."
            placeholder={read === 'error' ? 'Projects unavailable' : value ? 'Project' : 'All projects'}
            options={projects?.map((project) => ({
              value: project.id,
              label: project.name,
              keywords: [project.slug],
              detail: project.plan,
            }))}
            value={value}
            onValueChange={setValue}
            open={open}
            onOpenChange={setOpen}
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
    // The empty row is in the DOM before the popup has finished fading in.
    await waitFor(() => expect(within(popup).getByText('No project found.')).toBeVisible());
    await waitFor(() => expect(within(popup).getByRole('option', { name: /Create project/ })).toBeVisible());
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

/**
 * The loading row is as tall as one option row: when one project arrives,
 * the footer stays where it was.
 */
export const SearchMenuLoadingHeight: Story = {
  tags: ['!autodocs'],
  render: () => <LoadingProjects />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The footer's offset in the open popup, once it has faded and scaled in.
    const footerTop = async () => {
      const popup = await within(document.body).findByRole('dialog', { name: 'Projects' });
      // Until the popup has scaled in: a scaled box would move the footer.
      await waitFor(() => expectPx(popup.getBoundingClientRect().height, popup.offsetHeight));
      const footer = popup.querySelector<HTMLElement>('[data-slot="breadcrumb-search-menu-footer"] [cmdk-item]')!;
      return footer.getBoundingClientRect().top - popup.getBoundingClientRect().top;
    };
    await userEvent.click(canvas.getByRole('button', { name: 'Projects: Project' }));
    await expect(await within(document.body).findByRole('status')).toHaveTextContent('Loading…');
    const loadingTop = await footerTop();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvas.getByRole('button', { name: 'Finish loading' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Projects: Acme Storefront' }));
    await userEvent.keyboard('glob');
    await waitFor(() =>
      expect(within(document.body).getAllByRole('option', { name: /Acme|Northwind|Globex/ })).toHaveLength(1),
    );
    await expectPx(await footerTop(), loadingTop);
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

/**
 * Records the cross-fades of a crumb's label: the opacity transitions that
 * start inside its label swap. A transition event bubbles, so the recorder
 * on the canvas also sees a crumb that mounts after it starts.
 */
function recordLabelFades(root: HTMLElement) {
  const fades: Element[] = [];
  const record = (event: TransitionEvent) => {
    const target = event.target as Element;
    if (event.propertyName === 'opacity' && target.closest('[data-slot="breadcrumb-menu-label"]')) fades.push(target);
  };
  root.addEventListener('transitionrun', record);
  return { fades, stop: () => root.removeEventListener('transitionrun', record) };
}

/** Two frames: a transition the last render starts has run by then. */
function nextFrames() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/**
 * A pending crumb is one status with the list label, not a button: a
 * skeleton bar at 0.8 of the line height, hidden from screen readers, in the
 * crumb's 28px box at the trigger's 10px start inset.
 */
async function checkPendingCrumb(canvasElement: HTMLElement, label: string) {
  const canvas = within(canvasElement);
  const status = canvas.getByRole('status');
  await expect(status).toHaveTextContent(`${label}: Loading…`);
  await expect(canvas.queryByRole('button', { name: new RegExp(`^${label}`) })).toBeNull();
  const bar = status.querySelector<HTMLElement>('[data-slot="skeleton"]')!;
  await expect(bar).toHaveAttribute('aria-hidden', 'true');
  const box = status.getBoundingClientRect();
  await expectPx(box.height, 28);
  await expectPx(bar.getBoundingClientRect().height, Number.parseFloat(getComputedStyle(status).lineHeight) * 0.8);
  await expectPx(bar.getBoundingClientRect().left - box.left, 10);
}

/**
 * Pending, then the first name: it shows without a cross-fade. A later
 * name cross-fades as before.
 */
async function checkPendingThenLoaded(canvasElement: HTMLElement, label: string, first: string, second: string) {
  const canvas = within(canvasElement);
  await checkPendingCrumb(canvasElement, label);
  const { fades, stop } = recordLabelFades(canvasElement);
  try {
    await userEvent.click(canvas.getByRole('button', { name: 'Finish loading' }));
    const crumb = await canvas.findByRole('button', { name: `${label}: ${first}` });
    await expect(canvas.queryByRole('status')).toBeNull();
    await nextFrames();
    await expect(fades).toHaveLength(0);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch' }));
    await waitFor(() => expect(crumb).toHaveAccessibleName(`${label}: ${second}`));
    await waitFor(() => expect(fades.length).toBeGreaterThan(0));
  } finally {
    stop();
  }
}

/**
 * Pending, then the name is confirmed. While it is the same as the last
 * known name, nothing moves; a different name cross-fades.
 */
async function checkKnownThenConfirmed(
  canvasElement: HTMLElement,
  label: string,
  shown: string,
  confirmed: string,
) {
  const canvas = within(canvasElement);
  // The last known name shows while pending: a normal crumb, no skeleton.
  const crumb = canvas.getByRole('button', { name: `${label}: ${shown}` });
  await expect(canvas.queryByRole('status')).toBeNull();
  await expect(crumb.querySelector('[data-slot="skeleton"]')).toBeNull();
  const { fades, stop } = recordLabelFades(canvasElement);
  try {
    await userEvent.click(canvas.getByRole('button', { name: 'Finish loading' }));
    await waitFor(() => expect(crumb).toHaveAccessibleName(`${label}: ${confirmed}`));
    if (shown === confirmed) {
      await nextFrames();
      await expect(fades).toHaveLength(0);
    } else {
      await waitFor(() => expect(fades.length).toBeGreaterThan(0));
    }
  } finally {
    stop();
  }
}

/**
 * A crumb menu while its item loads: pending until Finish loading. `known`
 * is the last known name the app passes as `placeholder` while pending, or
 * nothing.
 */
function PendingEnvironment({ known }: { known?: string }) {
  const [loaded, setLoaded] = React.useState(false);
  const [value, setValue] = React.useState('production');
  return (
    <div className="flex items-center gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbMenu
              label="Environment"
              pending={!loaded}
              options={loaded ? environments : undefined}
              placeholder={loaded ? undefined : known}
              value={value}
              onValueChange={setValue}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" disabled={loaded} onClick={() => setLoaded(true)}>
        Finish loading
      </Button>
      <Button variant="outline" size="sm" disabled={!loaded} onClick={() => setValue('staging')}>
        Switch
      </Button>
    </div>
  );
}

/**
 * While the current item loads or is confirmed, pass `pending`. Show the
 * name until it is known to be wrong: keep the options of the last read, or
 * pass the last known name as `placeholder`. Only when no name is known
 * does the crumb show a text skeleton one line tall. It takes no clicks or
 * focus, and a screen reader hears "Environment: Loading…". The first name
 * after the skeleton shows at once, without a swap. Never pass a
 * placeholder word such as "Environment" for an unknown name. Keep
 * `placeholder` for real words, such as "All projects".
 */
export const WithMenuPending: Story = {
  render: () => <PendingEnvironment />,
  play: ({ canvasElement }) => checkPendingCrumb(canvasElement, 'Environment'),
};

/** The pending crumb in dark mode. */
export const WithMenuPendingDark: Story = {
  tags: ['!autodocs'],
  globals: { theme: 'dark' },
  render: () => <PendingEnvironment />,
  play: ({ canvasElement }) => checkPendingCrumb(canvasElement, 'Environment'),
};

/** No name known: the skeleton, then the first name with no cross-fade, then a switch that cross-fades. */
export const WithMenuPendingLoaded: Story = {
  tags: ['!autodocs'],
  render: () => <PendingEnvironment />,
  play: ({ canvasElement }) => checkPendingThenLoaded(canvasElement, 'Environment', 'Production', 'Staging'),
};

/**
 * Pending with the last known name: the crumb shows it as usual. When the
 * read confirms the same name, nothing moves.
 */
export const WithMenuPendingKnownName: Story = {
  render: () => <PendingEnvironment known="Production" />,
  play: ({ canvasElement }) => checkKnownThenConfirmed(canvasElement, 'Environment', 'Production', 'Production'),
};

/** The last known name was stale: the confirmed name cross-fades in. */
export const WithMenuPendingRenamed: Story = {
  tags: ['!autodocs'],
  render: () => <PendingEnvironment known="Prod" />,
  play: ({ canvasElement }) => checkKnownThenConfirmed(canvasElement, 'Environment', 'Prod', 'Production'),
};

/** A search crumb while its project loads: pending until Finish loading. */
function PendingProject({ known }: { known?: string }) {
  const [loaded, setLoaded] = React.useState(false);
  const [value, setValue] = React.useState('p3');
  return (
    <div className="flex items-center gap-4">
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="min-w-0 max-w-56">
            <BreadcrumbSearchMenu
              label="Projects"
              pending={!loaded}
              options={
                loaded
                  ? allProjects.map((project) => ({
                      value: project.id,
                      label: project.name,
                      keywords: [project.slug],
                    }))
                  : undefined
              }
              placeholder={loaded ? undefined : known}
              value={value}
              onValueChange={setValue}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Activity</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button variant="outline" size="sm" disabled={loaded} onClick={() => setLoaded(true)}>
        Finish loading
      </Button>
      <Button variant="outline" size="sm" disabled={!loaded} onClick={() => setValue('p1')}>
        Switch
      </Button>
    </div>
  );
}

const northwind = 'Northwind Outdoor Equipment and Apparel Europe';

/**
 * `BreadcrumbSearchMenu` takes the same `pending`. It is about the crumb;
 * `options={undefined}` is about the list in the open popup. On the first
 * load, with no name known, pass both: the crumb shows the skeleton. On a later read, keep
 * the last known name, and the crumb shows it.
 */
export const SearchMenuPending: Story = {
  render: () => <PendingProject />,
  play: ({ canvasElement }) => checkPendingCrumb(canvasElement, 'Projects'),
};

/** The pending search crumb in dark mode. */
export const SearchMenuPendingDark: Story = {
  tags: ['!autodocs'],
  globals: { theme: 'dark' },
  render: () => <PendingProject />,
  play: ({ canvasElement }) => checkPendingCrumb(canvasElement, 'Projects'),
};

/** No name known: the skeleton, then the first name with no cross-fade, then a switch that cross-fades. */
export const SearchMenuPendingLoaded: Story = {
  tags: ['!autodocs'],
  render: () => <PendingProject />,
  play: ({ canvasElement }) => checkPendingThenLoaded(canvasElement, 'Projects', northwind, 'Acme Storefront'),
};

/** Pending with the last known name: it shows, and the same confirmed name does not move. */
export const SearchMenuPendingKnownName: Story = {
  render: () => <PendingProject known={northwind} />,
  play: ({ canvasElement }) => checkKnownThenConfirmed(canvasElement, 'Projects', northwind, northwind),
};

/** The last known name was stale: the confirmed name cross-fades in. */
export const SearchMenuPendingRenamed: Story = {
  tags: ['!autodocs'],
  render: () => <PendingProject known="Northwind EU" />,
  play: ({ canvasElement }) => checkKnownThenConfirmed(canvasElement, 'Projects', 'Northwind EU', northwind),
};
