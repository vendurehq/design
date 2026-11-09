import type { useRender } from '@base-ui/react/use-render';
import { DirectionLink } from './direction-link.tsx';

// The v3 look: text in `foreground-secondary` and a trailing chevron; the look,
// motion and right-to-left handling live in DirectionLink.
//
// The link is `group/arrow-link`. A card or row that opens the same page
// takes the same class and `relative`, and the link takes
// `after:absolute after:inset-0`: its ::after then covers the parent, so a
// click anywhere on it follows the link, and pointing anywhere on it drives
// the hover.

/**
 * A text link to a page that holds more of what the user is looking at:
 * "View details", "All deployments", "Open logs". Renders an `<a>`; pass
 * `render` to use a router link.
 */
function ArrowLink(props: useRender.ComponentProps<'a'>) {
  return (
    <DirectionLink direction="forward" slot="arrow-link" iconSlot="arrow-link-arrow" {...props} />
  );
}

export { ArrowLink };
