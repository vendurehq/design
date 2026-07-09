'use client';

import {
  CopyButton,
  type CopyButtonProps,
} from '@vendure-io/ui/components/molecules/copyable-text';
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
      className={cn('inline-flex w-fit max-w-full items-center gap-1.5', className)}
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
      <code
        data-slot="anonymized-token-value"
        aria-hidden="true"
        data-revealed={showRevealed || undefined}
        className="bg-muted text-foreground inline-block w-[15ch] overflow-hidden rounded-md px-1.5 py-0.5 text-center font-mono text-sm whitespace-nowrap blur-[1px] transition-[background-color,filter] data-[revealed]:bg-muted/70 data-[revealed]:blur-none"
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
        />
      ) : null}
    </span>
  );
}

export { AnonymizedToken };
export type { AnonymizedTokenProps };
