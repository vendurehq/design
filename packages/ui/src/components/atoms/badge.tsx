import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { contentInsetPull } from "@vendure-io/ui/lib/content-inset"
import { cn } from "@vendure-io/ui/lib/utils"

// `--content-inset` is the distance from the box to the first letter: the
// padding and the 1px border, plus a leading `data-icon="inline-start"` icon
// and the gap. A DataTable cell pulls the badge back by it, so the text lines
// up with the column header.
const badgeVariants = cva(
  [contentInsetPull, "[--content-inset:calc(var(--spacing)*2+1px)] has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*5.5+1px)] h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge"],
  {
    variants: {
      variant: {
        // Neutral by default: brand is a signature, not a wallpaper. Solid
        // brand is an explicit opt-in via the `brand` variant (ui v2).
        default:
          "bg-neutral-subtle text-neutral-subtle-foreground border-neutral-border [a]:hover:bg-neutral-subtle/80",
        primary: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        brand: "bg-brand text-brand-foreground [a]:hover:bg-brand/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 text-destructive-subtle-foreground dark:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
