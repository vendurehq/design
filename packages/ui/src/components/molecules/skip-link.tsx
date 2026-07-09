import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

interface SkipLinkProps extends React.ComponentProps<'a'> {
  /** The main-content element to focus. Include the leading `#`. */
  href?: `#${string}`;
}

/**
 * Keyboard-only escape hatch for repeated application chrome. Place it as the
 * first focusable element in the document and point it at `AppShellMain` (whose
 * default id is `main-content`). Native anchor behavior keeps this server-safe
 * and works before React hydrates.
 */
function SkipLink({
  className,
  href = '#main-content',
  children = 'Skip to main content',
  ...props
}: SkipLinkProps) {
  return (
    <a
      data-slot="skip-link"
      href={href}
      className={cn(
        'bg-primary text-primary-foreground fixed top-3 left-3 z-[100] -translate-y-20 rounded-md px-3 py-2 text-sm font-medium opacity-0 outline-none transition-[transform,opacity] duration-(--transition-duration-fast) ease-(--ease-out) focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export { SkipLink, type SkipLinkProps };
