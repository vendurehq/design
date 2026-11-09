import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// AppShell — the app layout: a flat page, as in the v3 look.
//
// One background for the whole window. The sidebar sits on it with a 1px right
// border, and the content fills the rest with no inset, radius or border:
//
//   AppShell         → --background   the page
//   AppShellSidebar  → --sidebar      nav rail; equals the page, split by a 1px border
//   AppShellContent  → (inherits)     header + main, flush against the sidebar
//
// Cards in the content resolve to --surface-raised (via the `card` token), so
// they are the one step up from the page.
//
// The sidebar slot is deliberately unopinionated: drop the full `Sidebar` atom in
// for a real app, or use `AppShellSidebar` for a lightweight rail. Content owns a
// header + main anatomy so every consumer gets the same scroll boundary and skip
// link target without coupling the design system to a router or auth provider. The
// shell is viewport-bound, so main scrolls and the header stays in view.

function AppShell({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell"
      className={cn('bg-background text-foreground flex h-svh w-full overflow-hidden', className)}
      {...props}
    />
  );
}

function AppShellSidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="app-shell-sidebar"
      className={cn(
        'bg-sidebar text-sidebar-foreground border-sidebar-border flex w-58 shrink-0 flex-col gap-1 border-r px-2.5 py-3',
        className,
      )}
      {...props}
    />
  );
}

function AppShellContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell-content"
      className={cn('flex min-w-0 flex-1 flex-col overflow-hidden', className)}
      {...props}
    />
  );
}

// The header is 52px and sticks to the top of whichever element scrolls. It
// is opaque: content that scrolls under it (a log, a long table) never shows
// through. Its fill follows the surface it sits on: --background on the flat
// page, --surface inside the pane of a Sidebar with variant="inset". The
// hairline below it is an inset shadow, so the full 52px stays the content
// box and the 30px controls centre on whole pixels. It is always on: showing
// it only on scroll would need a scroll listener on a region the header does
// not own. Forced-colors mode drops box shadows, so there a 1px border on an
// ::after line at the bottom edge draws the hairline in CanvasText; it
// overlays the box and does not change the 52px.
function AppShellHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="app-shell-header"
      className={cn(
        'bg-background md:in-[[data-variant=inset]~[data-slot=sidebar-inset]]:bg-surface sticky top-0 z-10 flex h-13 shrink-0 items-center gap-1.5 pr-5 pl-3 shadow-[inset_0_-1px_0_var(--border)] forced-colors:after:pointer-events-none forced-colors:after:absolute forced-colors:after:inset-x-0 forced-colors:after:bottom-0 forced-colors:after:border-b forced-colors:after:border-[CanvasText]',
        className,
      )}
      {...props}
    />
  );
}

interface AppShellMainProps extends React.ComponentProps<'main'> {
  /** The element responsible for scrolling the main content region. */
  scrollOwner?: 'main' | 'container';
}

function AppShellMain({
  className,
  id = 'main-content',
  scrollOwner = 'main',
  ...props
}: AppShellMainProps) {
  return (
    <main
      id={id}
      tabIndex={-1}
      data-slot="app-shell-main"
      className={cn(
        scrollOwner === 'main'
          ? 'min-h-0 min-w-0 flex-1 overflow-auto outline-none'
          : 'min-w-0 flex-1 outline-none',
        className,
      )}
      {...props}
    />
  );
}

export {
  AppShell,
  AppShellSidebar,
  AppShellContent,
  AppShellHeader,
  AppShellMain,
  type AppShellMainProps,
};
