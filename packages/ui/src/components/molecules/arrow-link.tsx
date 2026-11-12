import type { useRender } from '@base-ui/react/use-render';
import { DirectionLink } from './direction-link.tsx';

// The v3 look: text in `foreground-secondary` and a trailing chevron, or an
// up-right arrow for a link that opens another site; the look, motion and
// right-to-left handling live in DirectionLink.
//
// The link is `group/arrow-link`. A card or row that opens the same page
// takes the same class and `relative`, and the link takes
// `after:absolute after:inset-0`: its ::after then covers the parent, so a
// click anywhere on it follows the link, and pointing anywhere on it drives
// the hover.

type ArrowLinkProps = useRender.ComponentProps<'a'> & {
  /**
   * Where the link goes.
   *
   * - `'forward'` (default): a page of this app. A chevron that moves 2px
   *   toward the end on hover.
   * - `'external'`: another site, such as the storefront or a provider's
   *   console. A diagonal arrow that moves 1.5px out on hover. Set `target`
   *   and `rel` yourself when it opens a new tab.
   */
  direction?: 'forward' | 'external';
};

/**
 * A text link to a page that holds more of what the user is looking at:
 * "View details", "All deployments", "Open logs". With
 * `direction="external"`, a link that leaves the app: "Open storefront".
 * Renders an `<a>`; pass `render` to use a router link.
 */
function ArrowLink({ direction = 'forward', ...props }: ArrowLinkProps) {
  return (
    <DirectionLink direction={direction} slot="arrow-link" iconSlot="arrow-link-arrow" {...props} />
  );
}

export { ArrowLink };
export type { ArrowLinkProps };
