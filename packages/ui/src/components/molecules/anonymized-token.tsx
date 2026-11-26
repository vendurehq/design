'use client';

import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import {
  CopyButton,
  type CopyButtonProps,
  useCopyAction,
} from '@vendure-io/ui/components/molecules/copyable-text';
import {
  ChipCopyTooltip,
  chipChromeClass,
  chipCopyButtonProps,
} from '@vendure-io/ui/components/molecules/id-chip';
import { contentInsetPull } from '@vendure-io/ui/lib/content-inset';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { useState } from 'react';
import { useMessages } from '../../lib/format-messages.ts';

function clampLength(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function getTokenPreview(
  value: string,
  prefixLength: number,
  suffixLength: number,
  separator: string,
): string {
  const prefix = clampLength(prefixLength);
  const suffix = clampLength(suffixLength);

  if (prefix === 0 && suffix === 0) return separator;

  if (value.length <= prefix + suffix) {
    const visibleLength = Math.max(1, Math.min(prefix || suffix, Math.floor(value.length / 2)));
    return `${value.slice(0, visibleLength)}${separator}`;
  }

  return `${value.slice(0, prefix)}${separator}${suffix > 0 ? value.slice(-suffix) : ''}`;
}

interface AnonymizedTokenProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /**
   * Full token copied by the button. Never rendered in full by the component.
   * `undefined` means not loaded yet and renders a skeleton the size of the
   * chip; `null` and `''` mean there is no token and render `fallback`.
   */
  value: string | null | undefined;
  /** Remove the blur from the preview on hover/focus. @default true */
  revealOnHover?: boolean;
  /** Characters shown at the start of the preview. @default 8 */
  previewPrefixLength?: number;
  /** Characters shown at the end of the preview. @default 4 */
  previewSuffixLength?: number;
  /** Text placed between visible preview segments. @default "..." */
  previewSeparator?: string;
  /** Accessible name while the preview is blurred. @default "Partially obscured token" */
  obscuredLabel?: string;
  /** Accessible name while the preview is sharp. @default "Partially visible token" */
  previewLabel?: string;
  /** Rendered when `value` is `null` or `''`. @default "—" */
  fallback?: React.ReactNode;
  /** Screen-reader text while `value` is `undefined`. @default `messages.anonymizedToken.loading`, "Loading token" */
  loadingLabel?: string;
  /** Render the copy affordance. @default true */
  copyable?: boolean;
  /** How long the check-mark feedback stays visible, in ms. */
  timeout?: CopyButtonProps['timeout'];
  /** Called after a successful copy. Wire your toast here. Falls back to `CopyFeedbackProvider`. */
  onCopied?: CopyButtonProps['onCopied'];
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: CopyButtonProps['onCopyError'];
  /** Accessible label before copying. @default "Copy token" */
  copyLabel?: CopyButtonProps['copyLabel'];
  /** Accessible label while the copied state is active. @default "Token copied" */
  copiedLabel?: CopyButtonProps['copiedLabel'];
}

/**
 * Displays a blurred, truncated token preview while copying the original value
 * in full.
 *
 * This is presentation, not a security boundary: the full token still reaches
 * the client so the explicit copy action can write it to the clipboard.
 */
function AnonymizedToken({
  value,
  revealOnHover = true,
  previewPrefixLength = 8,
  previewSuffixLength = 4,
  previewSeparator = '...',
  obscuredLabel = 'Partially obscured token',
  previewLabel = 'Partially visible token',
  fallback = '—',
  loadingLabel,
  copyable = true,
  timeout,
  onCopied,
  onCopyError,
  copyLabel = 'Copy token',
  copiedLabel = 'Token copied',
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: AnonymizedTokenProps) {
  const [previewRevealed, setPreviewRevealed] = useState(false);
  const action = useCopyAction({ timeout, onCopied, onCopyError });
  const t = useMessages('anonymizedToken', { loading: loadingLabel });

  // The skeleton is the chip's own box: 24px tall, rounded like the chip and
  // as wide as the default preview ("abcdefgh...mnop", 15 monospace
  // characters) plus the padding and the copy button, so nothing moves when
  // the token arrives. `align-middle` centres it on the line like the chip.
  if (value === undefined) {
    return (
      <span
        data-slot="anonymized-token"
        aria-busy="true"
        className={cn(
          'inline-flex w-fit align-middle font-mono text-xs [--content-inset:calc(var(--spacing)*2)]',
          // Pulled to the column edge like the chip, so it starts where the chip starts.
          contentInsetPull,
          className,
        )}
        {...props}
      >
        <Skeleton
          aria-hidden="true"
          className={cn(
            'h-6 rounded-lg',
            copyable ? 'w-[calc(15ch+var(--spacing)*8.25)]' : 'w-[calc(15ch+var(--spacing)*4)]',
          )}
        />
        <span className="sr-only">{t.loading}</span>
      </span>
    );
  }

  if (!value) {
    return (
      <span
        data-slot="anonymized-token"
        className={cn('text-muted-foreground text-sm', className)}
        {...props}
      >
        {fallback}
      </span>
    );
  }

  const preview = getTokenPreview(
    value,
    previewPrefixLength,
    previewSuffixLength,
    previewSeparator,
  );
  const showRevealed = revealOnHover && previewRevealed;

  const chip = (
    <span
      data-slot="anonymized-token"
      role="group"
      className={chipChromeClass(copyable, className)}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (revealOnHover) setPreviewRevealed(true);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        if (revealOnHover) setPreviewRevealed(false);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (revealOnHover) setPreviewRevealed(true);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        if (revealOnHover && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPreviewRevealed(false);
        }
      }}
      {...props}
    >
      {/* Blur is the only thing that sets a token apart from a plain `IdChip`;
          the chip chrome is shared. No `overflow-hidden` here — it would clip
          the blur halo — and the full value is never surfaced via `title`. */}
      <code
        data-slot="anonymized-token-value"
        aria-hidden="true"
        data-revealed={showRevealed || undefined}
        className="blur-[1px] transition-[filter] motion-reduce:transition-none data-[revealed]:blur-none"
      >
        {preview}
      </code>
      <span className="sr-only">{showRevealed ? previewLabel : obscuredLabel}</span>
      {copyable ? (
        <CopyButton
          value={value}
          copyAction={action}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          {...chipCopyButtonProps}
        />
      ) : null}
    </span>
  );

  if (!copyable) return chip;

  // The whole chip copies, like `IdChip`. The tooltip never shows the value.
  return (
    <ChipCopyTooltip
      chip={chip}
      copied={action.copied}
      copyLabel={copyLabel}
      copiedLabel={copiedLabel}
    />
  );
}

export { AnonymizedToken };
export type { AnonymizedTokenProps };
