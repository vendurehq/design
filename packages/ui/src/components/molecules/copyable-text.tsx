'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { useCopy } from '@vendure-io/ui/hooks/use-copy';
import { cn } from '@vendure-io/ui/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type * as React from 'react';

interface CopyButtonProps extends Omit<React.ComponentProps<typeof Button>, 'value' | 'children'> {
  /** The text written to the clipboard. */
  value: string;
  /** How long the check-mark feedback stays visible, in ms. @default 2000 */
  timeout?: number;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. */
  onCopied?: () => void;
  /** Called when the clipboard write fails (e.g. permissions, insecure context). */
  onCopyError?: (error: Error) => void;
  /** Accessible label before copying. @default "Copy" */
  copyLabel?: string;
  /** Accessible label shown while the copied state is active. @default "Copied" */
  copiedLabel?: string;
}

/**
 * Ghost icon button that copies `value` and swaps its icon to a check-mark for a
 * short window. Colours the confirmation with the semantic `text-success` token
 * (never a raw green), per ADR 0003.
 */
function CopyButton({
  value,
  timeout,
  onCopied,
  onCopyError,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  variant = 'ghost',
  size = 'icon-xs',
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopy({ timeout });

  return (
    <Button
      type="button"
      data-slot="copy-button"
      variant={variant}
      size={size}
      aria-label={copied ? copiedLabel : copyLabel}
      className={cn('text-muted-foreground hover:text-foreground', className)}
      onClick={async (event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const ok = await copy(value);
        if (ok) onCopied?.();
        else onCopyError?.(new Error('Failed to copy to the clipboard'));
      }}
      {...props}
    >
      {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
    </Button>
  );
}

interface CopyableTextProps {
  /** The text written to the clipboard. */
  value: string;
  /** Content to render beside the copy button. Falls back to `value` as plain text. Styling is the consumer's. */
  children?: React.ReactNode;
  className?: string;
  /** How long the check-mark feedback stays visible, in ms. @default 2000 */
  timeout?: number;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. */
  onCopyError?: (error: Error) => void;
}

/**
 * Renders arbitrary content alongside a {@link CopyButton}. Applies no styling
 * to `children` — presentation is entirely the consumer's; only the layout
 * (inline flex + gap) belongs to the molecule.
 */
function CopyableText({
  value,
  children,
  className,
  timeout,
  onCopied,
  onCopyError,
}: CopyableTextProps) {
  return (
    <span data-slot="copyable-text" className={cn('inline-flex items-center gap-1.5', className)}>
      {children ?? value}
      <CopyButton value={value} timeout={timeout} onCopied={onCopied} onCopyError={onCopyError} />
    </span>
  );
}

export { CopyButton, CopyableText };
export type { CopyButtonProps, CopyableTextProps };
