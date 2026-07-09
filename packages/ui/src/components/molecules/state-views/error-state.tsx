import { Button } from '@vendure-io/ui/components/atoms/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@vendure-io/ui/components/atoms/empty';
import { ErrorIllustration } from '@vendure-io/ui/components/molecules/illustrations/error';
import { cn } from '@vendure-io/ui/lib/utils';
import { TriangleAlertIcon } from 'lucide-react';

// `title` is redefined as `ReactNode`, so drop the native string `title` attr.
export interface ErrorStateProps extends Omit<React.ComponentProps<typeof Empty>, 'title'> {
  /**
   * Leading icon, tinted `text-destructive`. Defaults to an alert triangle.
   * Ignored once `illustration` renders (see below).
   */
  icon?: React.ReactNode;
  /**
   * Illustration rendered above the title, in place of `icon`. Defaults to
   * `ErrorIllustration`. Pass a different illustration (e.g. `NotFoundIllustration`
   * for a 404), or `illustration={null}` to fall back to `icon`.
   */
  illustration?: React.ReactNode | null;
  /** The headline. Defaults to "Something went wrong". */
  title?: React.ReactNode;
  /** Optional supporting copy. */
  description?: React.ReactNode;
  /** When provided, renders a "Try again" button that calls this handler. */
  onRetry?: () => void;
  /** Label for the retry button. Defaults to "Try again". */
  retryLabel?: React.ReactNode;
  /** Extra actions (e.g. a not-found "Go back" link) rendered beside retry. */
  children?: React.ReactNode;
}

/**
 * The one canonical error presentation: a centered box that carries semantics
 * no atom has — `role="alert"`, a destructive-tinted icon (or illustration),
 * and an optional retry CTA. Same anatomy as `EmptyState` so failed and empty
 * states line up.
 */
function ErrorState({
  icon,
  illustration,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  children,
  className,
  ...props
}: ErrorStateProps) {
  // Precedence: an explicit `illustration` (including `null`, to opt out)
  // always wins; otherwise an explicit `icon` (including `null`) keeps
  // rendering exactly as before. Only when neither is touched does the
  // default illustration replace the default triangle icon.
  const resolvedIllustration =
    illustration !== undefined ? illustration : icon === undefined ? <ErrorIllustration /> : null;
  const resolvedIcon = icon === undefined ? <TriangleAlertIcon /> : icon;

  return (
    <Empty role="alert" data-slot="error-state" className={cn('border', className)} {...props}>
      <EmptyHeader>
        {resolvedIllustration ? (
          <EmptyMedia>{resolvedIllustration}</EmptyMedia>
        ) : resolvedIcon ? (
          <EmptyMedia variant="icon" className="text-destructive">
            {resolvedIcon}
          </EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {onRetry || children ? (
        <EmptyContent>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {retryLabel}
            </Button>
          ) : null}
          {children}
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export { ErrorState };
