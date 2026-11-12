'use client';

import { Kbd } from '@vendure-io/ui/components/atoms/kbd';
import { cn } from '@vendure-io/ui/lib/utils';
import { SearchIcon } from 'lucide-react';
import type * as React from 'react';
import { useSyncExternalStore } from 'react';

type SearchTriggerCollapse = 'md' | 'never' | 'always';

const subscribe = () => () => {};

// Apple platforms show ⌘, the rest show Ctrl. The server and the first
// hydration render have no platform, so they show Ctrl; React swaps in the
// client value right after hydration without a mismatch error.
function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function useIsApplePlatform() {
  return useSyncExternalStore(subscribe, isApplePlatform, () => false);
}

// The v3 look: a button that looks like a field. 28px high, 220px wide, on
// the muted fill with a 1px inset hairline and the lg radius. The 13px text
// is `foreground-secondary`: muted text on the muted fill is under 4.5:1.
// The icon is 14px and quieter than the text (55%). Hover steps the fill up
// to `accent` in 120ms. No press scale: it is a field, not a button, to
// the eye. Focus is the system's 2px ring, 2px out.
const fieldClass = [
  'group/search-trigger inline-flex h-7 w-55 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-muted pr-1.5 pl-2.5 text-sm text-foreground-secondary inset-ring inset-ring-border outline-none select-none',
  'transition-colors duration-quick ease-soft hover:bg-accent',
  'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
];

// Collapsed: a 28px ghost icon button, the size of the SidebarTrigger next
// to it on a narrow top bar. The label and the shortcut leave the box; the
// accessible name stays.
const collapsed = {
  box: 'w-7 justify-center bg-transparent px-0 inset-ring-0 hover:bg-muted',
  hidden: 'hidden',
};

const collapseClasses: Record<SearchTriggerCollapse, { box: string; hidden: string }> = {
  md: {
    box: 'max-md:w-7 max-md:justify-center max-md:bg-transparent max-md:px-0 max-md:inset-ring-0 max-md:hover:bg-muted',
    hidden: 'max-md:hidden',
  },
  never: { box: '', hidden: '' },
  always: collapsed,
};

interface SearchTriggerProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** The placeholder word in the field. @default 'Search' */
  label?: string;
  /**
   * The letter of the shortcut that opens the palette. The trigger shows it
   * after ⌘ on Apple platforms and after Ctrl elsewhere. It only shows the
   * shortcut: the consumer binds the key, as it opens the palette. `null`
   * shows no shortcut. @default 'K'
   */
  shortcutKey?: string | null;
  /**
   * When the field shrinks to an icon button.
   * - `md` (default): below 768px, where the Sidebar turns into a sheet.
   * - `never`: always the field.
   * - `always`: always the icon button.
   * @default 'md'
   */
  collapse?: SearchTriggerCollapse;
}

/**
 * The search field in a top bar. It is a button: a click opens the command
 * palette (the consumer's `onClick`), and the shortcut that also opens it
 * shows at the end.
 */
function SearchTrigger({
  className,
  label = 'Search',
  shortcutKey = 'K',
  collapse = 'md',
  'aria-label': ariaLabel,
  ...props
}: SearchTriggerProps) {
  const apple = useIsApplePlatform();
  const { box, hidden } = collapseClasses[collapse];

  return (
    <button
      type="button"
      data-slot="search-trigger"
      aria-haspopup="dialog"
      aria-label={ariaLabel ?? `${label} (command palette)`}
      aria-keyshortcuts={
        shortcutKey ? `${apple ? 'Meta' : 'Control'}+${shortcutKey.toUpperCase()}` : undefined
      }
      className={cn(fieldClass, box, className)}
      {...props}
    >
      <SearchIcon
        aria-hidden
        className="size-3.5 stroke-[1.75] opacity-55 transition-opacity duration-quick ease-soft group-hover/search-trigger:opacity-85"
      />
      <span className={cn('truncate', hidden)}>{label}</span>
      {shortcutKey ? (
        <Kbd
          aria-hidden
          className={cn(
            'ml-auto h-4.5 bg-transparent text-foreground-secondary inset-ring-input',
            hidden,
          )}
        >
          {apple ? `⌘${shortcutKey.toUpperCase()}` : `Ctrl ${shortcutKey.toUpperCase()}`}
        </Kbd>
      ) : null}
    </button>
  );
}

export { SearchTrigger };
export type { SearchTriggerCollapse, SearchTriggerProps };
