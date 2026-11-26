import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva } from "class-variance-authority"
import { ArrowUpRight } from "lucide-react"

import { cn } from "@vendure-io/ui/lib/utils"

// A link for running text and for small standalone links. It is `inline`,
// not `inline-flex`, so a long label wraps with the sentence, and it sets no
// font size, weight or line height: it takes them from the text around it.
// `w-fit` keeps it to its label when it is a flex or grid item, where it
// would otherwise stretch, and has no effect inline.
//
// The underline sits 4px under the baseline (`underline-offset-4`, as the
// Button link look) and is 1px.
//
// The focus ring is the design-system ring, 2px solid `ring`, but at offset 0
// instead of 2px: the space between two words is about 4px, so an outset ring
// would touch the next word, and the ring of one line would touch the next
// line. While the ring shows, the underline is hidden: at offset 0 it would
// run into the ring's lower edge, and the ring already marks the link.
// `box-decoration-clone` closes the ring on each line of a wrapped link.
//
// `default`: `primary` text, always underlined in `brand-indicator`. The text
// colour alone is too close to body text to mark a link inside a sentence,
// so the underline is the cue. On hover the text and the underline turn
// `brand-text`; on keyboard focus the text turns `brand-text`.
// `quiet`: `muted-foreground` text with no underline at rest, for a small
// standalone link that must not compete with the actions next to it
// ("Forgot password?", "Terms"). On hover the text reaches `foreground` and
// the underline appears in the text colour; on keyboard focus the text
// reaches `foreground`. Without an
// underline at rest it is not marked as a link inside a sentence: use
// `default` there.
//
// Colour and underline colour ease in `quick` on `soft`. Nothing moves, so
// reduced motion needs no other look.
//
// `external`: opens in a new tab with `rel="noopener noreferrer"`, ends with a
// decorative up-right arrow sized to the text (60%, full on hover or focus),
// and adds "(opens in a new tab)" for screen readers. A word joiner keeps the
// arrow on the line of the last word; it is hidden with the arrow, so it
// stays out of the accessible name. In right-to-left the arrow points
// up-left.

const textLinkVariants = cva(
  "group/text-link inline w-fit cursor-pointer rounded-sm underline decoration-1 underline-offset-4 box-decoration-clone transition-colors duration-quick ease-soft outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring focus-visible:decoration-transparent",
  {
    variants: {
      tone: {
        default:
          "text-primary decoration-brand-indicator hover:text-brand-text hover:decoration-brand-text focus-visible:text-brand-text",
        quiet:
          "text-muted-foreground decoration-transparent hover:text-foreground hover:decoration-current focus-visible:text-foreground",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

type TextLinkProps = useRender.ComponentProps<"a"> & {
  /**
   * - `'default'`: link colour, always underlined. Use it inside a sentence.
   * - `'quiet'`: muted text, underlined on hover. Use it for a small
   *   standalone link next to more important actions.
   */
  tone?: "default" | "quiet"
  /**
   * Opens another site in a new tab: sets `target="_blank"` and
   * `rel="noopener noreferrer"` (your own `target` and `rel` win) and adds a
   * trailing arrow and a screen-reader note.
   */
  external?: boolean
  /** The screen-reader note of an `external` link. */
  externalLabel?: string
}

/**
 * A link inside running text, or a small standalone link. Renders an `<a>`;
 * pass `render` to use a router link. It always keeps the link role.
 */
function TextLink({
  tone = "default",
  external = false,
  externalLabel = "(opens in a new tab)",
  className,
  render,
  children,
  ...props
}: TextLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        className: cn(textLinkVariants({ tone }), className),
        ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        children: external ? (
          <>
            {children}
            <span className="sr-only"> {externalLabel}</span>
            <span aria-hidden="true">
              {"⁠"}
              <ArrowUpRight
                aria-hidden="true"
                data-slot="text-link-external-icon"
                strokeWidth={1.75}
                className="ms-0.5 inline-block size-[0.875em] align-[-0.0625em] opacity-60 transition-opacity duration-moderate ease-soft group-hover/text-link:opacity-100 group-focus-visible/text-link:opacity-100 rtl:-scale-x-100"
              />
            </span>
          </>
        ) : (
          children
        ),
      },
      props
    ),
    state: { slot: "text-link", tone },
  })
}

export { TextLink }
export type { TextLinkProps }
