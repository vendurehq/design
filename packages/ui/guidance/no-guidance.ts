import type { NoGuidance } from './types.ts';

/**
 * Public components that need no guidance entry, each with a reason. Keep this
 * to primitives with no choice to make. Anything an agent might otherwise build
 * by hand needs a catalog entry with `replaces` instead.
 */
export const noGuidance: readonly NoGuidance[] = [
  { component: 'AspectRatio', reason: 'Layout primitive: it only keeps a box at a ratio.' },
  { component: 'Carousel', reason: 'Marketing primitive; no Vendure admin screen uses one.' },
  {
    component: 'DirectionProvider',
    reason: 'Set once at the app root from the locale; the app shell owns it.',
  },
  {
    component: 'NavigationMenu',
    reason: 'Site header navigation for public sites. Admin apps use Sidebar, which has an entry.',
  },
  { component: 'NavigationMenuLink', reason: 'Part of NavigationMenu.' },
  { component: 'ResizableHandle', reason: 'Layout primitive for split panes; no choice to make.' },
  { component: 'ResizablePanel', reason: 'Layout primitive for split panes; no choice to make.' },
  { component: 'ScrollArea', reason: 'Layout primitive: a styled scroll container.' },
  { component: 'ScrollBar', reason: 'Part of ScrollArea.' },
  { component: 'Separator', reason: 'Layout primitive: a rule between groups.' },
  {
    component: 'Toaster',
    reason: 'Mounted once at the app root; there is nothing to choose at a call site.',
  },
  {
    component: 'VisibilityIcon',
    reason: 'The animated eye inside PasswordInput and SecretValue, which have entries.',
  },
];
