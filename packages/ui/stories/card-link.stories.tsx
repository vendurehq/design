import type { Meta, StoryObj } from '@storybook/react';
import { MoreHorizontal } from 'lucide-react';
import { type MouseEvent, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardLink,
  CardTitle,
} from '../src/components/atoms/card.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../src/components/atoms/dialog.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../src/components/atoms/dropdown-menu.tsx';
import { StatusBadge } from '../src/components/molecules/status-badge.tsx';
import type { Tone } from '../src/lib/state-dictionary.ts';

const meta = {
  title: 'Atoms/Data Display/CardLink',
  component: CardLink,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CardLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const openProject = fn();
const renameProject = fn();

const projects: { name: string; slug: string; region: string; state: string; tone: Tone; updated: string }[] = [
  { name: 'Storefront', slug: 'storefront', region: 'Production · eu-west-1', state: 'Live', tone: 'success', updated: 'Deployed 2 hours ago' },
  { name: 'Wholesale portal', slug: 'wholesale', region: 'Staging · us-east-1', state: 'Building', tone: 'info', updated: 'Started 3 minutes ago' },
  { name: 'Outlet', slug: 'outlet', region: 'Production · eu-central-1', state: 'Failed', tone: 'critical', updated: 'Failed yesterday' },
];

/** The element a real pointer would hit at the centre of `element`. */
function hitTarget(element: Element) {
  const box = element.getBoundingClientRect();
  return element.ownerDocument.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
}

function ProjectGrid() {
  return (
    <div className="grid w-[760px] grid-cols-3 gap-3">
      {projects.map((project) => (
        <Card key={project.slug}>
          <CardHeader>
            <CardTitle>
              <CardLink
                render={<a href={`#/projects/${project.slug}`} />}
                onClick={(event: MouseEvent) => {
                  event.preventDefault();
                  openProject(project.slug);
                }}
              >
                {project.name}
              </CardLink>
            </CardTitle>
            <CardDescription>{project.region}</CardDescription>
            <CardAction>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon-sm" aria-label={`More for ${project.name}`} />
                  }
                >
                  <MoreHorizontal />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => renameProject(project.slug)}>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Copy project ID</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <StatusBadge tone={project.tone}>{project.state}</StatusBadge>
            <span className="text-muted-foreground text-xs">{project.updated}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * A grid of project cards. Each card opens its project from any point of the
 * card, and its "…" menu keeps its own click and tab stop. The play function
 * tabs from the link to the card's menu, clicks the middle of a card's body
 * (where a real pointer hits the stretched link), and opens the menu without
 * opening the project.
 */
export const ProjectCards: Story = {
  beforeEach: () => {
    openProject.mockClear();
    renameProject.mockClear();
  },
  render: () => <ProjectGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Storefront' });
    const card = link.closest<HTMLElement>('[data-slot=card]');
    if (!card) throw new Error('Card not found');

    // One link per card, named by the title only.
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    const menu = canvas.getByRole('button', { name: 'More for Storefront' });

    // Tab reaches the link, then the card's menu, then the next card.
    await userEvent.click(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await userEvent.tab();
    await expect(menu).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Wholesale portal' })).toHaveFocus();

    // A click on the card's status line lands on the stretched link.
    const status = within(card).getByText('Deployed 2 hours ago');
    const target = hitTarget(status);
    await expect(target).toBe(link);
    await userEvent.click(target as Element);
    await expect(openProject).toHaveBeenCalledWith('storefront');

    // The menu sits above the link: it opens and the project does not.
    openProject.mockClear();
    await expect(hitTarget(menu)).toBe(menu);
    await userEvent.click(menu);
    const rename = await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'Rename' });
    await userEvent.click(rename);
    await expect(renameProject).toHaveBeenCalledWith('storefront');
    await expect(openProject).not.toHaveBeenCalled();
  },
};

const capabilities = [
  { name: 'Search', description: 'Full-text product search with typo tolerance.', state: 'Enabled', tone: 'success' as Tone },
  { name: 'Background jobs', description: 'A worker for imports, emails and reindexing.', state: 'Off', tone: 'neutral' as Tone },
];

function CapabilityCards() {
  // The name stays set while the dialog closes, so its title does not blank
  // during the exit animation.
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="grid w-[520px] grid-cols-2 gap-3">
        {capabilities.map((capability) => (
          <Card key={capability.name} size="sm">
            <CardHeader>
              <CardTitle>
                <CardLink
                  onClick={() => {
                    setSelected(capability.name);
                    setOpen(true);
                  }}
                >{capability.name}</CardLink>
              </CardTitle>
              <CardDescription>{capability.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusBadge tone={capability.tone}>{capability.state}</StatusBadge>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected}</DialogTitle>
            <DialogDescription>Turn the capability on or off for this project.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * A card that opens a dialog, not a page: CardLink without `render` is a
 * button. The play function clicks the card's description and checks that
 * the dialog opens with the card's title.
 */
export const OpensDialog: Story = {
  render: () => <CapabilityCards />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Search' });
    await expect(button).toHaveAttribute('type', 'button');
    const target = hitTarget(canvas.getByText('Full-text product search with typo tolerance.'));
    await expect(target).toBe(button);
    await userEvent.click(target as Element);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('heading', { name: 'Search' })).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole('dialog')).toBeNull());
  },
};

/**
 * Keyboard focus on the link draws the design-system ring around the whole
 * card: 2px at a 2px offset, outside the border. A pointer click draws no
 * ring.
 */
export const FocusState: Story = {
  render: () => <ProjectGrid />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Storefront' });
    const card = link.closest<HTMLElement>('[data-slot=card]');
    if (!card) throw new Error('Card not found');
    await userEvent.click(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await waitFor(() => {
      const style = getComputedStyle(card);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
      expect(style.outlineOffset).toBe('2px');
    });
    // The link draws nothing of its own: the card carries the ring.
    await expect(getComputedStyle(link).outlineStyle).toBe('none');
  },
};
