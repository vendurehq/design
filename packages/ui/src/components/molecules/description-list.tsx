'use client';

import { cn } from '@vendure-io/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react';

// A read-only label/value list with valid `dl`/`dt`/`dd` semantics — the
// display counterpart to the form-oriented `field.tsx` atom. In horizontal and
// (at container width) responsive mode, each item collapses to `display:
// contents` so its `dt`/`dd` land directly in the list's two-column grid.
type Orientation = 'vertical' | 'horizontal' | 'responsive';

const descriptionListVariants = cva('text-sm', {
  variants: {
    orientation: {
      vertical: 'flex flex-col gap-4',
      horizontal: 'grid grid-cols-[auto_1fr] gap-x-6 gap-y-3',
      responsive:
        '@container flex flex-col gap-4 @md:grid @md:grid-cols-[auto_1fr] @md:gap-x-6 @md:gap-y-3',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

const DescriptionListContext = createContext<Orientation>('vertical');

function DescriptionList({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'dl'> & VariantProps<typeof descriptionListVariants>) {
  return (
    <DescriptionListContext.Provider value={orientation ?? 'vertical'}>
      <dl
        data-slot="description-list"
        data-orientation={orientation}
        className={cn(descriptionListVariants({ orientation }), className)}
        {...props}
      />
    </DescriptionListContext.Provider>
  );
}

function DescriptionItem({ className, ...props }: ComponentProps<'div'>) {
  const orientation = useContext(DescriptionListContext);
  return (
    <div
      data-slot="description-item"
      className={cn(
        orientation === 'horizontal' && 'contents',
        orientation === 'responsive' && 'flex flex-col gap-0.5 @md:contents',
        orientation === 'vertical' && 'flex flex-col gap-0.5',
        className,
      )}
      {...props}
    />
  );
}

function DescriptionTerm({ className, ...props }: ComponentProps<'dt'>) {
  return (
    <dt
      data-slot="description-term"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );
}

function DescriptionDetail({ className, ...props }: ComponentProps<'dd'>) {
  return (
    <dd
      data-slot="description-detail"
      className={cn('font-medium break-words', className)}
      {...props}
    />
  );
}

interface DescriptionListItemProps extends ComponentProps<'div'> {
  label: ReactNode;
  /** The value, deliberately children rather than a `value` prop. */
  children: ReactNode;
}

// Sugar covering ~95% of found call sites: a term/detail pair in one line.
function DescriptionListItem({ label, children, ...props }: DescriptionListItemProps) {
  return (
    <DescriptionItem {...props}>
      <DescriptionTerm>{label}</DescriptionTerm>
      <DescriptionDetail>{children}</DescriptionDetail>
    </DescriptionItem>
  );
}

export {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetail,
  DescriptionListItem,
  descriptionListVariants,
  type DescriptionListItemProps,
};
