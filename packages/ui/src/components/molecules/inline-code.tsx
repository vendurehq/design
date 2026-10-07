import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

/**
 * Code in running text: a prop, a flag, a package name, a file path. The
 * `code-inline` fill tints the host surface, so the code stays a step apart
 * from the page, a card, or an inset well. The text is `text-foreground`, so it
 * keeps full contrast inside a `text-muted-foreground` paragraph.
 *
 * Multi-line code uses `CodeBlock`. A value the user copies elsewhere uses
 * `CopyableText` or `IdChip`. A keystroke uses `Kbd`.
 */
function InlineCode({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      data-slot="inline-code"
      className={cn(
        'bg-code-inline border-code-inline-border text-foreground rounded border px-1 py-px font-mono',
        className,
      )}
      {...props}
    />
  );
}

export { InlineCode };
