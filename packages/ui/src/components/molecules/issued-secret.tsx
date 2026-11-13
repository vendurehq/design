'use client';

import { Alert, AlertDescription, AlertTitle } from '@vendure-io/ui/components/atoms/alert';
import { Button, ButtonLabelSwap } from '@vendure-io/ui/components/atoms/button';
import { DialogFooter } from '@vendure-io/ui/components/atoms/dialog';
import { Field, FieldDescription, FieldLabel } from '@vendure-io/ui/components/atoms/field';
import { Input } from '@vendure-io/ui/components/atoms/input';
import { CopyStateIcon, useCopyAction } from '@vendure-io/ui/components/molecules/copyable-text';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * The close guard of a dialog that holds a secret that was just issued. Before
 * the first copy, a close request (Done, the ✕, Escape, the backdrop) shows a
 * warning instead of closing, and only `closeAnyway` then closes. After a copy,
 * a close request closes. Closing resets the guard for the next secret.
 */
function useIssuedSecretGuard(onClose: () => void) {
  const [copied, setCopied] = useState(false);
  const [warned, setWarned] = useState(false);
  const close = () => {
    setCopied(false);
    setWarned(false);
    onClose();
  };
  const requestClose = () => (copied ? close() : setWarned(true));
  return {
    /** True once any format was copied, by a button or by hand. */
    copied,
    /** True after a close request before a copy, until a copy. */
    warned: warned && !copied,
    markCopied: () => setCopied(true),
    requestClose,
    closeAnyway: close,
    /** For `Dialog`: a close of the dialog becomes a close request. */
    onOpenChange: (open: boolean) => {
      if (!open) requestClose();
    },
  };
}

type IssuedSecretGuard = ReturnType<typeof useIssuedSecretGuard>;

/** One way to copy the secret, for example the plain value or a command line. */
interface IssuedSecretFormat {
  /** The button text. It says what the button copies. */
  label: string;
  /** Where the copy goes. It may show the form with a placeholder, never the secret. */
  hint?: React.ReactNode;
  /** The text the button copies. It contains the secret. */
  value: string;
}

interface IssuedSecretOwnProps {
  /** The guard from `useIssuedSecretGuard`, shared with `IssuedSecretFooter`. */
  guard: IssuedSecretGuard;
  /** The secret in words, for example "API key" or "password". The default texts use it. */
  secretName: string;
  /** The line that says what was issued, for example the key's name. */
  name?: React.ReactNode;
  /** Values of the issue that are not secret, for example a sign-in name. */
  children?: React.ReactNode;
  /** Text of the copy button when there is one value. @default `Copy ${secretName}` */
  copyLabel?: string;
  /** Text of a copy button just after a copy. @default "Copied" */
  copiedLabel?: string;
  /** The line under the buttons. @default `You can copy the ${secretName} only now.` */
  notice?: React.ReactNode;
  /** Label of the field that shows the value when the clipboard fails. @default secretName, capitalised */
  fallbackLabel?: string;
  /** @default `The clipboard is not available. Select the ${secretName} and copy it by hand.` */
  fallbackDescription?: React.ReactNode;
  /** Classes for that field, for example a session replay mask class. */
  fallbackInputClassName?: string;
  /** @default `The ${secretName} is not copied` */
  warningTitle?: React.ReactNode;
  /** @default "You cannot copy it after you close. Copy it now, or close without copying." */
  warningDescription?: React.ReactNode;
  /** Called after a copy by a button. Falls back to `CopyFeedbackProvider`. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
}

type IssuedSecretProps = Omit<React.ComponentProps<'section'>, 'children'> &
  IssuedSecretOwnProps &
  (
    | {
        /** The secret. One button copies it. */
        value: string;
        formats?: never;
      }
    | {
        /** One copy button per format of the secret. */
        formats: IssuedSecretFormat[];
        value?: never;
      }
  );

/**
 * A secret that was just issued, such as a new API key: the user copies it
 * once, and it never shows. One button copies it, or one button per format.
 * The value shows only when the clipboard write fails, in a read-only field,
 * selected, for a copy by hand. Before the first copy, a close request shows
 * a warning (see `useIssuedSecretGuard` and `IssuedSecretFooter`).
 */
function IssuedSecret({
  guard,
  secretName,
  name,
  children,
  value,
  formats,
  copyLabel = `Copy ${secretName}`,
  copiedLabel = 'Copied',
  notice = `You can copy the ${secretName} only now.`,
  fallbackLabel = capitalize(secretName),
  fallbackDescription = `The clipboard is not available. Select the ${secretName} and copy it by hand.`,
  fallbackInputClassName,
  warningTitle = `The ${secretName} is not copied`,
  warningDescription = 'You cannot copy it after you close. Copy it now, or close without copying.',
  onCopied,
  onCopyError,
  className,
  ...props
}: IssuedSecretProps) {
  // The text of the copy the clipboard refused. It contains the secret.
  const [manual, setManual] = useState<string | null>(null);
  const firstButton = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const buttons = formats ?? [{ label: copyLabel, value: value ?? '' }];

  useEffect(() => {
    firstButton.current?.focus();
  }, []);

  // After the warning, a second Enter on the focused button copies instead of
  // reaching "Close without copying".
  useEffect(() => {
    if (guard.warned) firstButton.current?.focus();
  }, [guard.warned]);

  useEffect(() => {
    if (manual === null) return;
    field.current?.focus();
    field.current?.select();
  }, [manual]);

  return (
    <section
      data-slot="issued-secret"
      data-copied={guard.copied || undefined}
      aria-label={capitalize(secretName)}
      className={cn('flex flex-col gap-4', className)}
      {...props}
    >
      {name != null || children != null ? (
        <div className="flex flex-col gap-1">
          {name != null ? (
            <div data-slot="issued-secret-name" className="text-sm font-medium">
              {name}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}
      <div className="flex flex-col items-start gap-3">
        {buttons.map((format, index) => (
          <IssuedSecretCopyButton
            key={format.label}
            ref={index === 0 ? firstButton : undefined}
            format={format}
            copiedLabel={copiedLabel}
            // One primary until the first copy; then Done takes it.
            variant={index === 0 && !guard.copied ? 'default' : 'outline'}
            onCopied={() => {
              guard.markCopied();
              setManual(null);
            }}
            onRefused={() => setManual(format.value)}
            onCopiedCallback={onCopied}
            onCopyError={onCopyError}
          />
        ))}
        <p data-slot="issued-secret-notice" className="text-muted-foreground text-xs">
          {notice}
        </p>
      </div>
      {manual !== null ? (
        <Field data-slot="issued-secret-fallback">
          <FieldLabel htmlFor={fieldId}>{fallbackLabel}</FieldLabel>
          <Input
            ref={field}
            id={fieldId}
            readOnly
            // The secret reads left to right in a right-to-left page too; the label follows the page.
            dir="ltr"
            value={manual}
            className={cn('font-mono', fallbackInputClassName)}
            onFocus={(event) => event.currentTarget.select()}
            onCopy={guard.markCopied}
          />
          <FieldDescription>{fallbackDescription}</FieldDescription>
        </Field>
      ) : null}
      {guard.warned ? (
        <Alert data-slot="issued-secret-warning" variant="warning">
          <AlertTitle>{warningTitle}</AlertTitle>
          <AlertDescription>{warningDescription}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}

function IssuedSecretCopyButton({
  format,
  copiedLabel,
  variant,
  onCopied,
  onRefused,
  onCopiedCallback,
  onCopyError,
  ref,
}: {
  format: IssuedSecretFormat;
  copiedLabel: string;
  variant: 'default' | 'outline';
  onCopied: () => void;
  onRefused: () => void;
  onCopiedCallback?: () => void;
  onCopyError?: (error: Error) => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  const { copied, copy } = useCopyAction({ onCopied: onCopiedCallback, onCopyError });
  const hintId = useId();

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        ref={ref}
        type="button"
        data-slot="issued-secret-copy"
        variant={variant}
        aria-describedby={format.hint != null ? hintId : undefined}
        onClick={async () => {
          if (await copy(format.value)) onCopied();
          else onRefused();
        }}
      >
        <CopyStateIcon copied={copied} />
        <ButtonLabelSwap labels={[format.label, copiedLabel]} active={copied ? 1 : 0} />
      </Button>
      {format.hint != null ? (
        <span id={hintId} className="text-muted-foreground text-xs">
          {format.hint}
        </span>
      ) : null}
    </div>
  );
}

interface IssuedSecretFooterProps
  extends Omit<React.ComponentProps<typeof DialogFooter>, 'children'> {
  /** The guard from `useIssuedSecretGuard`, shared with `IssuedSecret`. */
  guard: IssuedSecretGuard;
  /** @default "Done" */
  doneLabel?: string;
  /** The second action after the warning. @default "Close without copying" */
  closeAnywayLabel?: string;
}

/**
 * The footer of an issued-secret dialog. Done closes after a copy. Before a
 * copy it shows the warning, and "Close without copying" takes its place, as
 * the quiet `destructive-outline` button: the copy stays the one filled button.
 */
function IssuedSecretFooter({
  guard,
  doneLabel = 'Done',
  closeAnywayLabel = 'Close without copying',
  ...props
}: IssuedSecretFooterProps) {
  return (
    <DialogFooter data-slot="issued-secret-footer" {...props}>
      {guard.warned ? (
        <Button
          key="close-anyway"
          type="button"
          data-slot="issued-secret-close-anyway"
          variant="destructive-outline"
          onClick={guard.closeAnyway}
        >
          {closeAnywayLabel}
        </Button>
      ) : (
        <Button
          key="done"
          type="button"
          data-slot="issued-secret-done"
          variant={guard.copied ? 'default' : 'outline'}
          onClick={guard.requestClose}
        >
          {doneLabel}
        </Button>
      )}
    </DialogFooter>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export { IssuedSecret, IssuedSecretFooter, useIssuedSecretGuard };
export type { IssuedSecretFooterProps, IssuedSecretFormat, IssuedSecretGuard, IssuedSecretProps };
