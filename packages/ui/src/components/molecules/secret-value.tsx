'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import {
  CopyButton,
  type CopyButtonProps,
} from '@vendure-io/ui/components/molecules/copyable-text';
import { chipChromeClass, chipIconButtonClass } from '@vendure-io/ui/components/molecules/id-chip';
import { VisibilityIcon } from '@vendure-io/ui/components/molecules/visibility-icon';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { useReducer, useRef } from 'react';

interface SecretValueProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /**
   * Loads the full value on request, for secrets the server returns only when
   * asked. Reveal and copy call it; each call may be audited, so it never runs
   * on hover or focus.
   */
  loadValue: () => Promise<string>;
  /** Render the copy affordance. Copy while hidden loads without revealing. @default true */
  copyable?: boolean;
  /** How long the check-mark feedback stays visible, in ms. */
  timeout?: CopyButtonProps['timeout'];
  /** Called after a successful copy. Wire your toast here. Falls back to `CopyFeedbackProvider`. */
  onCopied?: CopyButtonProps['onCopied'];
  /** Called when the load or the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: CopyButtonProps['onCopyError'];
  /** Accessible name while the value is masked. @default "Hidden value" */
  hiddenLabel?: string;
  /** Accessible label of the reveal button. @default "Show value" */
  showLabel?: string;
  /** Accessible label of the button that masks the value again. @default "Hide value" */
  hideLabel?: string;
  /** Accessible label before copying. @default "Copy value" */
  copyLabel?: CopyButtonProps['copyLabel'];
  /** Accessible label while the copied state is active. @default "Value copied" */
  copiedLabel?: CopyButtonProps['copiedLabel'];
  /** Shown inline when `loadValue` rejects. @default "Couldn't load the value." */
  loadErrorMessage?: string;
}

const MASK = '••••••••';

// The trailing buttons have the IdChip button look (`chipIconButtonClass`).
// Each one is its own control (the chip has two), so its icon brightens on
// its own hover, and its ::after widens the target to 21px.
const CHIP_BUTTON_CLASS = cn(
  chipIconButtonClass,
  'relative after:absolute after:-inset-1 hover:text-foreground',
  'hover:[&>svg:not([role=status])]:opacity-100',
  'hover:[&_[data-slot=copy-state-icon]:not([data-copied])>svg:first-child]:opacity-100',
);

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

/** State of a SecretValue: hidden, loading, revealed or error. */
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
 * Shows a secret that the server returns only on request. At rest it is a fixed
 * mask; a click on the reveal button loads and shows the value, and copy loads
 * it without showing it. Hiding drops the value from state.
 *
 * Use `AnonymizedToken` instead when the full value is already on the client.
 */
function SecretValue({
  loadValue,
  copyable = true,
  timeout,
  onCopied,
  onCopyError,
  hiddenLabel = 'Hidden value',
  showLabel = 'Show value',
  hideLabel = 'Hide value',
  copyLabel = 'Copy value',
  copiedLabel = 'Value copied',
  loadErrorMessage = "Couldn't load the value.",
  className,
  ...props
}: SecretValueProps) {
  const [state, dispatch] = useReducer(revealReducer, { status: 'hidden' });
  // Drops a load that settles after the user hid the value or asked again.
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
      data-slot="secret-value"
      data-state={state.status}
      role="group"
      // The reveal button always ends the chip, so it always takes the 6px end.
      className={chipChromeClass(true, className)}
      {...props}
    >
      {/* The mask is fixed: no fake prefix or suffix. The value is visible text
          only after a deliberate reveal, and never in a title or label. */}
      {revealed ? (
        // `whitespace-normal` lets the value wrap inside a `whitespace-nowrap`
        // parent such as a TableCell, so a long value grows the row in height
        // instead of widening the table.
        <code data-slot="secret-value-value" className="min-w-0 break-all whitespace-normal">
          {state.value}
        </code>
      ) : (
        <>
          <code data-slot="secret-value-value" aria-hidden="true">
            {MASK}
          </code>
          <span className="sr-only">{hiddenLabel}</span>
        </>
      )}
      <Button
        type="button"
        data-slot="secret-value-reveal"
        variant="ghost"
        size="icon-xs"
        aria-label={revealed ? hideLabel : showLabel}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
        className={CHIP_BUTTON_CLASS}
        onClick={() => {
          if (loading) return;
          if (revealed) hide();
          else void reveal();
        }}
      >
        {loading ? <Spinner /> : <VisibilityIcon visible={!revealed} />}
      </Button>
      {copyable ? (
        <CopyButton
          value={revealed ? state.value : loadValue}
          timeout={timeout}
          onCopied={onCopied}
          onCopyError={onCopyError}
          copyLabel={copyLabel}
          copiedLabel={copiedLabel}
          className={CHIP_BUTTON_CLASS}
        />
      ) : null}
      {state.status === 'error' ? (
        <span
          data-slot="secret-value-error"
          role="alert"
          className="text-destructive-subtle-foreground pe-1 font-sans"
        >
          {loadErrorMessage}
        </span>
      ) : null}
    </span>
  );
}

export { SecretValue };
export type { SecretValueProps };
