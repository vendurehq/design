'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import {
  CopyButton,
  type CopyButtonProps,
} from '@vendure-io/ui/components/molecules/copyable-text';
import { chipChromeClass } from '@vendure-io/ui/components/molecules/id-chip';
import { cn } from '@vendure-io/ui/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import type * as React from 'react';
import { useReducer, useRef, useState } from 'react';

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

interface AnonymizedTokenBaseProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Rendered for nullish or empty values. @default "-" */
  fallback?: React.ReactNode;
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

interface AnonymizedTokenValueProps {
  /** Full token copied by the button. Never rendered in full by the component. */
  value: string | null | undefined;
  loadValue?: never;
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
  hiddenLabel?: never;
  showLabel?: never;
  hideLabel?: never;
  loadErrorMessage?: never;
}

interface AnonymizedTokenLoadValueProps {
  value?: never;
  /**
   * Loads the full value on request, for secrets the server returns only when
   * asked. The value stays masked until the user clicks reveal; copy calls this
   * too while the value is hidden. Each call may be audited, so it never runs
   * on hover or focus.
   */
  loadValue: () => Promise<string>;
  revealOnHover?: never;
  previewPrefixLength?: never;
  previewSuffixLength?: never;
  previewSeparator?: never;
  obscuredLabel?: never;
  previewLabel?: never;
  /** Accessible name while the value is masked. @default "Hidden value" */
  hiddenLabel?: string;
  /** Accessible label of the reveal button. @default "Show value" */
  showLabel?: string;
  /** Accessible label of the button that masks the value again. @default "Hide value" */
  hideLabel?: string;
  /** Shown inline when `loadValue` rejects. @default "Couldn't load the value." */
  loadErrorMessage?: string;
}

type AnonymizedTokenProps = AnonymizedTokenBaseProps &
  (AnonymizedTokenValueProps | AnonymizedTokenLoadValueProps);

const MASK = '••••••••';

type RevealState =
  | { status: 'hidden' }
  | { status: 'loading' }
  | { status: 'revealed'; value: string }
  | { status: 'error' };

type RevealAction =
  | { type: 'load' }
  | { type: 'loaded'; value: string }
  | { type: 'failed' }
  | { type: 'hide' };

/**
 * State of an on-demand AnonymizedToken. Exported for tests; not part of the
 * component API.
 * @internal
 */
function revealReducer(state: RevealState, action: RevealAction): RevealState {
  switch (action.type) {
    case 'load':
      return state.status === 'revealed' ? state : { status: 'loading' };
    case 'loaded':
      return state.status === 'loading' ? { status: 'revealed', value: action.value } : state;
    case 'failed':
      return state.status === 'loading' ? { status: 'error' } : state;
    case 'hide':
      return { status: 'hidden' };
  }
}

/**
 * Displays a blurred, truncated token preview while copying the original value
 * in full. With `loadValue` instead of `value`, shows a fixed mask and loads the
 * value only when the user clicks reveal or copy.
 *
 * This is presentation, not a security boundary: the full token still reaches
 * the client so the explicit copy action can write it to the clipboard.
 */
function AnonymizedToken(props: AnonymizedTokenProps) {
  if (props.loadValue) return <OnDemandToken {...props} />;
  return <PreviewToken {...(props as AnonymizedTokenBaseProps & AnonymizedTokenValueProps)} />;
}

function PreviewToken({
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
}: AnonymizedTokenBaseProps & AnonymizedTokenValueProps) {
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

function OnDemandToken({
  loadValue,
  hiddenLabel = 'Hidden value',
  showLabel = 'Show value',
  hideLabel = 'Hide value',
  loadErrorMessage = "Couldn't load the value.",
  fallback: _fallback,
  copyable = true,
  timeout,
  onCopied,
  onCopyError,
  copyLabel = 'Copy token',
  copiedLabel = 'Token copied',
  className,
  ...props
}: AnonymizedTokenBaseProps & AnonymizedTokenLoadValueProps) {
  const [state, dispatch] = useReducer(revealReducer, { status: 'hidden' });
  // Drops a load that resolves after the user hid the value or asked again.
  const request = useRef(0);

  async function reveal() {
    const id = ++request.current;
    dispatch({ type: 'load' });
    try {
      const value = await loadValue();
      if (id === request.current) dispatch({ type: 'loaded', value });
    } catch {
      if (id === request.current) dispatch({ type: 'failed' });
    }
  }

  function hide() {
    request.current++;
    dispatch({ type: 'hide' });
  }

  const revealed = state.status === 'revealed';
  const loading = state.status === 'loading';

  return (
    <span
      data-slot="anonymized-token"
      data-state={state.status}
      role="group"
      className={chipChromeClass(true, className)}
      {...props}
    >
      {/* The mask is fixed: no fake prefix or suffix. The value is visible text
          only after a deliberate reveal, and never in a title or label. */}
      {revealed ? (
        <code data-slot="anonymized-token-value" className="break-all">
          {state.value}
        </code>
      ) : (
        <>
          <code data-slot="anonymized-token-value" aria-hidden="true">
            {MASK}
          </code>
          <span className="sr-only">{hiddenLabel}</span>
        </>
      )}
      <Button
        type="button"
        data-slot="anonymized-token-reveal"
        variant="ghost"
        size="icon-xs"
        aria-label={revealed ? hideLabel : showLabel}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className="text-muted-foreground hover:text-foreground relative size-4 after:absolute after:-inset-1"
        onClick={() => {
          if (loading) return;
          if (revealed) hide();
          else void reveal();
        }}
      >
        {loading ? <Spinner /> : revealed ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
      {copyable ? (
        <CopyButton
          value={revealed ? state.value : loadValue}
          timeout={timeout}
          onCopied={onCopied}
          onCopyError={onCopyError}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          className="relative size-4 after:absolute after:-inset-1"
        />
      ) : null}
      {state.status === 'error' ? (
        <span
          data-slot="anonymized-token-error"
          role="alert"
          className="text-destructive-subtle-foreground pr-1 font-sans"
        >
          {loadErrorMessage}
        </span>
      ) : null}
    </span>
  );
}

export { AnonymizedToken, revealReducer };
export type { AnonymizedTokenProps };
