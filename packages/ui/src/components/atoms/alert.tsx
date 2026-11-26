import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import type { Tone } from "@vendure-io/ui/lib/state-dictionary"
import { alertTint, alertToneVars } from "@vendure-io/ui/lib/tint-recipes"
import { toneIcons } from "@vendure-io/ui/lib/tone-icons"

// Alert is an inline-size container so AlertAction can move under the text when
// the alert is narrow. A container cannot size to its content: an Alert inside a
// flex row needs a width (it is w-full by default), not w-fit.
// The grid has no column gap: the icon carries its own margin, so the empty
// action column of a narrow alert takes no space.
// The v3 banner: a toned alert is a faint tint of its tone. In light mode the
// fill is 7% tone in the card and the border 14% tone in the border colour; in
// dark mode the tone sits over transparent (10% fill, 30% border), because
// mixed into the cool surface it reads grey. The modes switch the
// --alert-fill and --alert-border properties, not the utilities, so a
// consumer's bg-* or border-* class wins in both modes. The icon takes the
// tone's text slot. The tones are the state dictionary's, with the StatusBadge
// recipe: critical tints with destructive-text, progress with info-text and a
// spinner. Warning tints with the brighter warning-indicator, as an
// amber text colour mixes to brown. The title stays foreground and the
// description foreground-secondary in every tone, because a muted grey on
// a tinted fill falls below text contrast.
// The recipe lives in lib/tint-recipes.ts, which the contrast test in
// @vendure-io/design-tokens reads.
const tonedAlert = alertTint

// An alert enters once when it mounts: it fades in and moves 4px down into
// place, 240ms ease-out (@starting-style: nothing runs after it). Reduced motion
// keeps the fade. Content padding is 12px inline, 10px block.
const alertVariants = cva(
  "@container/alert grid grid-cols-[minmax(0,1fr)] rounded-xl border px-3 py-2.5 text-start text-sm has-[>svg]:grid-cols-[auto_minmax(0,1fr)] has-[>[data-slot=alert-action]]:grid-cols-[minmax(0,1fr)_auto] has-[>svg]:has-[>[data-slot=alert-action]]:grid-cols-[auto_minmax(0,1fr)_auto] *:[svg]:row-span-2 *:[svg]:me-3 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4 *:[svg:not([class*='stroke-'])]:stroke-[1.75] [&:has(>svg:not([data-slot=alert-icon]))>[data-slot=alert-icon]]:hidden w-full relative group/alert transition-[opacity,translate] duration-alert-enter ease-out starting:opacity-0 motion-safe:starting:-translate-y-1",
  {
    variants: {
      tone: {
        none: "bg-card text-card-foreground *:[svg]:text-current",
        neutral: [tonedAlert, alertToneVars.neutral],
        info: [tonedAlert, alertToneVars.info],
        success: [tonedAlert, alertToneVars.success],
        warning: [tonedAlert, alertToneVars.warning],
        critical: [tonedAlert, alertToneVars.critical],
        progress: [tonedAlert, alertToneVars.progress],
      } satisfies Record<Tone | "none", unknown>,
    },
    defaultVariants: {
      tone: "none",
    },
  }
)

// The progress spinner turns once per 1.6s, as in StatusBadge, and stands
// still under reduced motion; the loader shape still says "in motion".
const spinnerClass = "animate-spin-slow motion-reduce:animate-none"

/**
 * A toned Alert is a faint tint of its tone and shows the tone's icon, the
 * same shape a StatusBadge of that tone shows (`progress` spins it). Without a
 * tone it sits on the card with no icon. An `icon` prop replaces the tone
 * icon, and so does an svg child (the older way): the tone icon is then
 * hidden. `icon={false}` shows no icon.
 */
function Alert({
  className,
  tone,
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** The tone from the state dictionary. Leave it out for a plain notice on the card. */
  tone?: Tone
  /** Replaces the tone icon. `false` or `null` shows no icon. */
  icon?: React.ReactNode
}) {
  const ToneIcon = tone ? toneIcons[tone] : undefined
  const shownIcon =
    icon !== undefined ? (
      icon || null
    ) : ToneIcon ? (
      <ToneIcon
        aria-hidden
        data-slot="alert-icon"
        className={tone === "progress" ? spinnerClass : undefined}
      />
    ) : null
  return (
    <div
      data-slot="alert"
      data-tone={tone}
      role="alert"
      className={cn(alertVariants({ tone: tone ?? "none" }), className)}
      {...props}
    >
      {shownIcon}
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "[&_a]:hover:text-foreground col-start-1 font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-foreground-secondary [&_a]:hover:text-foreground col-start-1 text-sm text-balance wrap-anywhere group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

// From a 28rem-wide alert up, the action takes the last grid column and spans
// the text rows, so the text wraps before it. The action box is one text line
// high and centres its content, so a button lines up with a line of text and
// overflows into the alert padding instead of making the alert taller.
// Where the box sits follows the height of the text beside it (100% of the
// spanned rows):
// - Up to two lines (a title and one sentence), it is centred on the text.
// - From three lines (an error block, a next step), it stays on the first line.
// The step happens at 2.5 lines; `(2.5lh - 100%) * 999` turns it into 0 or a
// large value, so `min()` picks either the centre offset or 0.
// The span of 9 rows covers every text row; extra implicit rows are 0 high.
// In a narrower alert the action moves to its own row under the text.
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-end-[-1] flex flex-wrap content-center items-center gap-2 @max-md/alert:col-start-1 @max-md/alert:mt-2 @max-md/alert:group-has-[>svg]/alert:col-start-2 @md/alert:relative @md/alert:row-start-1 @md/alert:row-span-9 @md/alert:ms-3 @md/alert:h-lh @md/alert:self-start @md/alert:top-[min((100%_-_1lh)/2,max(0px,(2.5lh_-_100%)*999))]",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
