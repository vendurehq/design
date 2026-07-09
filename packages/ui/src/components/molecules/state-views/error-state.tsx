import { Button } from '@vendure-io/ui/components/atoms/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@vendure-io/ui/components/atoms/empty';
import { cn } from '@vendure-io/ui/lib/utils';
import { TriangleAlertIcon } from 'lucide-react';

// `title` is redefined as `ReactNode`, so drop the native string `title` attr.
export interface ErrorStateProps extends Omit<React.ComponentProps<typeof Empty>, 'title'> {
  /** Leading icon. Defaults to an alert triangle, tinted `text-destructive`. */
  icon?: React.ReactNode;
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
 * no atom has — `role="alert"`, a destructive-tinted icon, and an optional
 * retry CTA. Same anatomy as `EmptyState` so failed and empty states line up.
 */
function ErrorState({
  icon = <TriangleAlertIcon />,
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
  children,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <Empty role="alert" data-slot="error-state" className={cn('border', className)} {...props}>
      <EmptyHeader>
        {icon ? (
          <EmptyMedia variant="icon" className="text-destructive">
            {icon}
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
