import type { Meta, StoryObj } from '@storybook/react';
import { PlusIcon } from 'lucide-react';
import * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DirectionProvider } from '../src/components/atoms/direction.tsx';
import { checkCheckedRowLook } from './menu-checked-row.ts';
import { checkDisabledContentDims } from './menu-disabled-item.ts';
import { DropdownMenuItem, DropdownMenuSeparator } from '../src/components/atoms/dropdown-menu.tsx';
import {
  Breadcrumb,
  BreadcrumbMenu,
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
