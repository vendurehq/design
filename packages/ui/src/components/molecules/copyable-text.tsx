'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { useCopyFeedback } from '@vendure-io/ui/components/molecules/copy-feedback-provider';
import { useCopy } from '@vendure-io/ui/hooks/use-copy';
import type { ClipboardSource } from '@vendure-io/ui/lib/clipboard';
import { cn } from '@vendure-io/ui/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';
import type * as React from 'react';

interface UseCopyActionOptions {
  /** How long `copied` stays true after a successful copy, in ms. @default 2000 */
  timeout?: number;
  /** Called after a successful copy. Falls back to `CopyFeedbackProvider`. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
}

interface CopyAction {
  /** True for `timeout` ms after the last successful copy. */
  copied: boolean;
  /** Writes `value` to the clipboard and reports the result through the callbacks. */
  copy: (value: ClipboardSource) => Promise<boolean>;
}

/**
 * The copy behaviour of `CopyButton` without the button: clipboard write,
 * transient `copied` flag, and the callback → `CopyFeedbackProvider` fallback.
 * Use it when a parent must know the copied state, for example to change a
 * tooltip from "Copy" to "Copied". Pass the result to `CopyButton` as
 * `copyAction` so the button and the parent share one state.
 */
function useCopyAction({ timeout, onCopied, onCopyError }: UseCopyActionOptions = {}): CopyAction {
  const { copied, copy } = useCopy({ timeout });
  const copyFeedback = useCopyFeedback();

  return {
    copied,
    copy: async (value) => {
      const ok = await copy(value);
      if (ok) (onCopied ?? copyFeedback.onCopied)?.();
      else
        (onCopyError ?? copyFeedback.onCopyError)?.(new Error('Failed to copy to the clipboard'));
      return ok;
    },
  };
}

/**
 * The copy icon that turns into a check-mark while `copied` is true. The two
 * icons cross-fade; with motion allowed, the outgoing icon also shrinks and
 * blurs. The check uses the text-safe `success-text` slot, never a raw green.
 */
function CopyStateIcon({ copied, className }: { copied: boolean; className?: string }) {
  const swap =
    'col-start-1 row-start-1 transition-[opacity,scale,filter] duration-moderate ease-out';
  const out = 'opacity-0 motion-safe:scale-25 motion-safe:blur-[4px]';
  return (
    <span
      aria-hidden
      data-slot="copy-state-icon"
      data-copied={copied || undefined}
      className={cn('grid shrink-0 place-items-center', className)}
    >
      <CopyIcon className={cn(swap, copied && out)} />
      <CheckIcon className={cn(swap, 'text-success-text', !copied && out)} />
    </span>
  );
}

interface CopyButtonProps extends Omit<React.ComponentProps<typeof Button>, 'value' | 'children'> {
  /**
   * The text written to the clipboard, or a callback that loads it when the
   * button is clicked (for values the server returns only on request).
   */
  value: ClipboardSource;
  /** How long the check-mark feedback stays visible, in ms. @default 2000 */
  timeout?: number;
  /**
   * Called after a successful copy. Wire your toast here — the DS never toasts.
   * Falls back to `CopyFeedbackProvider` when omitted (the RSC-safe path, since
   * function props can't be passed from server components).
   */
  onCopied?: () => void;
  /**
   * Called when the clipboard write fails (e.g. permissions, insecure context).
   * Falls back to `CopyFeedbackProvider` when omitted.
   */
  onCopyError?: (error: Error) => void;
  /** Accessible label before copying. @default "Copy" */
  copyLabel?: string;
  /** Accessible label shown while the copied state is active. @default "Copied" */
  copiedLabel?: string;
  /**
   * A shared copy state from `useCopyAction`. When set, the button uses it
   * instead of its own, and `timeout`, `onCopied` and `onCopyError` belong on
   * the hook call.
   */
  copyAction?: CopyAction;
}

/**
 * Ghost icon button that copies `value` and swaps its icon to a check-mark for a
 * short window (see `CopyStateIcon`).
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
  copyAction,
  ...props
}: CopyButtonProps) {
  const ownAction = useCopyAction({ timeout, onCopied, onCopyError });
  const { copied, copy } = copyAction ?? ownAction;

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
        await copy(value);
      }}
      {...props}
    >
      <CopyStateIcon copied={copied} />
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
  /** Called after a successful copy. Wire your toast here — the DS never toasts. Falls back to `CopyFeedbackProvider`. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
  /** Accessible label before copying, forwarded to the inner `CopyButton`. @default "Copy" */
  copyLabel?: string;
  /** Accessible label shown while the copied state is active, forwarded to the inner `CopyButton`. @default "Copied" */
  copiedLabel?: string;
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
  copyLabel,
  copiedLabel,
}: CopyableTextProps) {
  return (
    <span data-slot="copyable-text" className={cn('inline-flex items-center gap-1.5', className)}>
      {children ?? value}
      <CopyButton
        value={value}
        timeout={timeout}
        onCopied={onCopied}
        onCopyError={onCopyError}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
      />
    </span>
  );
}

export { CopyButton, CopyableText, CopyStateIcon, useCopyAction };
export type { CopyAction, CopyButtonProps, CopyableTextProps, UseCopyActionOptions };
