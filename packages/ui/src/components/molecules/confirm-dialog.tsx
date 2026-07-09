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
import { type ReactElement, type ReactNode, useRef, useState } from 'react';

interface ConfirmDialogProps {
  title: ReactNode;
  description?: ReactNode;
  /**
   * May return a promise: the dialog then keeps itself open, disables both
   * buttons, shows a pending spinner on the action, and closes only on resolve.
   * A rejection leaves the dialog open so the user can retry.
   */
  onConfirm: () => void | Promise<void>;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  variant?: 'default' | 'destructive';
  /** Uncontrolled mode — the element that opens the dialog. */
  children?: ReactElement;
  /** Controlled mode — supply with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ConfirmDialog({
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
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

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const handleConfirm = async () => {
    if (pendingRef.current) return;
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
      <AlertDialogContent data-slot="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          {/* AlertDialogAction is a plain Button (not a Close), so closing stays
              under our control — the promise decides when the dialog leaves. */}
          <AlertDialogAction
            variant={variant}
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={handleConfirm}
          >
            {pending ? <Spinner /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog, type ConfirmDialogProps };
