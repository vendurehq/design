import { cn } from "@vendure-io/ui/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer motion-reduce:animate-none motion-reduce:bg-none motion-reduce:bg-muted rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--color-muted)_25%,var(--color-accent)_50%,var(--color-muted)_75%)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
