import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// AppShell — the recessed-surface app layout, built on the surface ramp.
//
// Nests three surface tiers so the chrome reads as "deep" the way Linear's does:
//
//   AppShell         → --background     the canvas the whole window sits on
//   AppShellSidebar  → --sidebar        nav rail; equals the canvas, so it recedes
//   AppShellContent  → --surface        the content pane, stepped forward + inset
//
// Cards dropped into the content pane resolve to --surface-raised (via the `card`
// token), completing the third step. In dark mode each tier is a lightness step;
// in light mode the ramp collapses to white, so the pane's border + shadow carry
// the step instead. That asymmetry is intentional, not a gap.
//
// The sidebar slot is deliberately unopinionated: drop the full `Sidebar` atom in
// for a real app, or use `AppShellSidebar` for a lightweight rail.

function AppShell({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="app-shell"
      className={cn('bg-background text-foreground flex min-h-svh w-full', className)}
      {...props}
    />
  );
}

function AppShellSidebar({ className, ...props }: React.ComponentProps<'aside'>) {
  return (
    <aside
      data-slot="app-shell-sidebar"
      className={cn(
        'bg-sidebar text-sidebar-foreground flex w-64 shrink-0 flex-col gap-1 p-3',
        className,
      )}
      {...props}
    />
  );
}

function AppShellContent({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="app-shell-content"
      className={cn(
        // The missing tier: step up to --surface and inset from the canvas so the
        // shell frames the pane on all sides, including a gutter between the
        // sidebar and the pane. Flat by design: the border carries the tier in
        // light mode (see AGENTS.md "flat look"), so no drop shadow.
        'bg-surface m-3 flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60',
        className,
      )}
      {...props}
    />
  );
}

export { AppShell, AppShellSidebar, AppShellContent };
