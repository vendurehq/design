'use client';

import {
  CopyButton,
  type CopyButtonProps,
} from '@vendure-io/ui/components/molecules/copyable-text';
import { chipChromeClass } from '@vendure-io/ui/components/molecules/id-chip';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { useState } from 'react';

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
  /** Full token copied by the button. Never rendered in full by the component. */
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
  /** Rendered for nullish or empty values. @default "-" */
  fallback?: React.ReactNode;
  /** Render the copy affordance. @default true */
  copyable?: boolean;
  /** How long the check-mark feedback stays visible, in ms. */
  timeout?: CopyButtonProps['timeout'];
  /** Called after a successful copy. Wire your toast here. */
  onCopied?: CopyButtonProps['onCopied'];
  /** Called when the clipboard write fails. */
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
  fallback = '-',
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

  return (
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
          the pill chrome is shared. No `overflow-hidden` here — it would clip
          the blur halo — and the full value is never surfaced via `title`. */}
      <code
        data-slot="anonymized-token-value"
        aria-hidden="true"
        data-revealed={showRevealed || undefined}
        className="blur-[1px] transition-[filter] data-[revealed]:blur-none"
      >
        {preview}
      </code>
      <span className="sr-only">{showRevealed ? previewLabel : obscuredLabel}</span>
      {copyable ? (
        <CopyButton
          value={value}
          timeout={timeout}
          onCopied={onCopied}
          onCopyError={onCopyError}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          className="relative size-4 after:absolute after:-inset-1"
        />
      ) : null}
    </span>
  );
}

export { AnonymizedToken };
export type { AnonymizedTokenProps };
