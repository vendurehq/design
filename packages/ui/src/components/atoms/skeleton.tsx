import { cn } from "@vendure-io/ui/lib/utils"

// A <span> with `block`, not a <div>: a skeleton stands in for a value, and a
// value often sits in a <p> or a <span>, where a <div> is invalid HTML. A
// caller's display class (`inline-block`, `flex`) replaces `block`.
function Skeleton({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton"
      className={cn(
        "animate-shimmer motion-reduce:animate-none motion-reduce:bg-none motion-reduce:bg-muted block rounded-md bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--muted)_25%,var(--accent)_50%,var(--muted)_75%)]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
