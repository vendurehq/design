'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@vendure-io/ui/components/atoms/alert-dialog';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import { cn } from '@vendure-io/ui/lib/utils';
import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  useId,
  useRef,
  useState,
} from 'react';

interface ConfirmDialogProps {
  title: ReactNode;
  /**
   * An icon shown inline before the title, e.g. `<Trash2Icon />`. It is
   * neutral, and takes the destructive tone when `variant="destructive"`.
   */
  icon?: ReactNode;
  description?: ReactNode;
  /**
   * Content between the description and the buttons. Use it for a field the
   * user must fill before confirming ("type the name to confirm"), and pair it
   * with `confirmDisabled` until the value matches.
   */
  body?: ReactNode;
  /**
   * May return a promise: the dialog then keeps itself open, disables both
   * buttons, shows a pending spinner on the action, and closes only on resolve.
   * A rejection leaves the dialog open so the user can retry.
   */
  onConfirm: () => void | Promise<void>;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: 'default' | 'destructive';
  /**
   * Hold the confirm button disabled while the dialog cannot be confirmed yet,
   * e.g. while the consequences it describes are still loading. Cancel stays
   * available.
   */
  confirmDisabled?: boolean;
  /** Why confirm is disabled, shown beside the buttons while `confirmDisabled` is set. */
  confirmDisabledReason?: ReactNode;
  /**
   * The element that takes focus when the dialog opens. By default focus goes
   * to the first focusable element: a field in `body` if there is one,
   * otherwise Cancel, so Enter never confirms a destructive action by accident.
   */
  initialFocus?: ComponentProps<typeof AlertDialogContent>['initialFocus'];
  /** Uncontrolled mode — the element that opens the dialog. */
  children?: ReactElement;
  /** Controlled mode — supply with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ConfirmDialog({
  title,
  icon,
  description,
  body,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  confirmDisabled = false,
  confirmDisabledReason,
  initialFocus,
  children,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  // State alone can't stop a fast double-click: both clicks land before the
  // re-render disables the button, so the in-flight flag lives in a ref too.
  const pendingRef = useRef(false);
  const actualOpen = isControlled ? open : internalOpen;
  const reasonId = useId();
  const showReason = confirmDisabled && !pending && Boolean(confirmDisabledReason);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleConfirm = async () => {
    if (pendingRef.current || confirmDisabled) return;
    pendingRef.current = true;
    try {
      setPending(true);
      await onConfirm();
      setOpen(false);
    } catch {
      // Stay open on rejection so the user can retry or cancel.
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  return (
    <AlertDialog
      open={actualOpen}
      onOpenChange={(next) => {
        // Block dismissal (escape/backdrop) while the action is in flight.
        if (!pending) setOpen(next);
      }}
    >
      {children ? <AlertDialogTrigger render={children} /> : null}
      <AlertDialogContent data-slot="confirm-dialog" initialFocus={initialFocus}>
        <AlertDialogHeader>
          {icon ? (
            <AlertDialogTitle className="flex items-center gap-2.5">
              <span
                data-slot="confirm-dialog-icon"
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
                  variant === 'destructive' ? 'text-destructive-text' : 'text-muted-foreground',
                )}
              >
                {icon}
              </span>
              <span>{title}</span>
            </AlertDialogTitle>
          ) : (
            <AlertDialogTitle>{title}</AlertDialogTitle>
          )}
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        {body ? <div data-slot="confirm-dialog-body">{body}</div> : null}
        <AlertDialogFooter>
          {showReason ? (
            <p
              id={reasonId}
              data-slot="confirm-dialog-disabled-reason"
              className="text-muted-foreground self-center text-sm group-data-[size=sm]/alert-dialog-content:col-span-2 sm:mr-auto"
            >
              {confirmDisabledReason}
            </p>
          ) : null}
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          {/* AlertDialogAction is a plain Button (not a Close), so closing stays
              under our control — the promise decides when the dialog leaves. */}
          {/* While pending, the spinner takes the label's place. The label stays
              in the layout (and the accessible name), so the button keeps its width. */}
          <AlertDialogAction
            variant={variant}
            disabled={pending || confirmDisabled}
            aria-busy={pending || undefined}
            aria-describedby={showReason ? reasonId : undefined}
            onClick={handleConfirm}
            className="relative"
          >
            <span data-slot="confirm-dialog-label" className={cn(pending && 'opacity-0')}>
              {confirmLabel}
            </span>
            {pending ? <Spinner className="absolute inset-0 m-auto" /> : null}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog, type ConfirmDialogProps };
