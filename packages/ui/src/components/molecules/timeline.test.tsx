import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag } from '../../test/slot-tokens.ts';
import {
  Timeline,
  TimelineContent,
  TimelineDetail,
  TimelineGroupHeading,
  TimelineItem,
  TimelineLink,
  TimelineMarker,
  TimelineMeta,
  TimelineTitle,
} from './timeline.tsx';

describe('Timeline', () => {
  test('a feed is an ordered list of entries on one rail between the markers', () => {
    const html = renderToStaticMarkup(
      <Timeline>
        <TimelineItem>
          <TimelineMarker />
          <TimelineContent>
            <TimelineTitle>The server restarted.</TimelineTitle>
            <TimelineMeta>4 minutes ago</TimelineMeta>
          </TimelineContent>
        </TimelineItem>
      </Timeline>,
    );
    expect(slotTag(html, 'timeline').startsWith('<ol')).toBe(true);
    const item = slotTag(html, 'timeline-item');
    expect(item.startsWith('<li')).toBe(true);
    // A 14px marker column, 12px before the text, 16px between entries.
    expect(item).toContain('grid-cols-[14px_minmax(0,1fr)]');
    expect(item).toContain('gap-x-3');
    expect(item).toContain('not-last:pb-4');
    // The rail: 1px `input`, from 4px under this dot to 4px above the next,
    // on the start edge, so it moves to the right in right-to-left.
    expect(item).toContain('not-last:after:w-px');
    expect(item).toContain('not-last:after:bg-input');
    expect(item).toContain('not-last:after:start-[6.5px]');
    expect(item).toContain('not-last:after:top-[18px]');
    expect(item).toContain('not-last:after:-bottom-0.5');
  });

  test('the marker is an 8px dot in its tone colour, neutral by default, hidden from screen readers', () => {
    const neutral = slotTag(renderToStaticMarkup(<TimelineMarker />), 'timeline-marker');
    expect(neutral).toContain('aria-hidden');
    expect(neutral).toContain('data-marker="dot"');
    expect(neutral).toContain('size-2');
    expect(neutral).toContain('mt-1.5');
    expect(neutral).toContain('text-neutral-text');
    const critical = slotTag(
      renderToStaticMarkup(<TimelineMarker tone="critical" />),
      'timeline-marker',
    );
    expect(critical).toContain('text-destructive-text');
    // A filled dot takes the warning fill colour, not the brown text colour.
    const warning = slotTag(
      renderToStaticMarkup(<TimelineMarker tone="warning" />),
      'timeline-marker',
    );
    expect(warning).toContain('text-warning-indicator');
  });

  test('an icon takes the place of the dot, and the rail starts under it', () => {
    const html = renderToStaticMarkup(
      <TimelineMarker tone="warning">
        <svg />
      </TimelineMarker>,
    );
    const marker = slotTag(html, 'timeline-marker');
    expect(marker).toContain('data-marker="icon"');
    expect(marker).toContain('size-3.5');
    expect(marker).not.toContain('rounded-full');
    expect(marker).toContain('text-warning-text');
    expect(html).toContain('<svg');
    const item = slotTag(renderToStaticMarkup(<TimelineItem />), 'timeline-item');
    expect(item).toContain('has-[[data-slot=timeline-marker][data-marker=icon]]:after:top-[21px]');
  });

  test('the sentence is 13px on a 20px line; the meta line is 12px muted', () => {
    const title = slotTag(
      renderToStaticMarkup(<TimelineTitle>Live</TimelineTitle>),
      'timeline-title',
    );
    expect(title).toContain('text-sm');
    expect(title).toContain('leading-5');
    const meta = slotTag(renderToStaticMarkup(<TimelineMeta>now</TimelineMeta>), 'timeline-meta');
    expect(meta).toContain('text-xs');
    expect(meta).toContain('text-muted-foreground');
    expect(meta).toContain('tabular-nums');
    const detail = slotTag(
      renderToStaticMarkup(<TimelineDetail>€12.00</TimelineDetail>),
      'timeline-detail',
    );
    expect(detail).toContain('mt-2');
  });

  test('the link is a button by default and stretches over the whole entry', () => {
    const html = renderToStaticMarkup(
      <TimelineItem>
        <TimelineContent>
          <TimelineLink onClick={() => {}}>Deployment failed.</TimelineLink>
        </TimelineContent>
      </TimelineItem>,
    );
    const link = slotTag(html, 'timeline-link');
    expect(link.startsWith('<button')).toBe(true);
    expect(link).toContain('type="button"');
    expect(link).toContain('after:absolute');
    expect(link).toContain('after:-inset-y-1');
    // The stretched area stops short of the gap to the next entry.
    expect(link).toContain('group-not-last/timeline-item:after:bottom-3');
    expect(link).toContain('focus-visible:after:outline-ring');
    expect(slotTag(html, 'timeline-item')).toContain('relative');
  });

  test('the link renders as an anchor through render, without a button type', () => {
    const html = renderToStaticMarkup(
      // biome-ignore lint/a11y/useAnchorContent: TimelineLink injects the label via render
      <TimelineLink render={<a href="/deployments/9f3c2a1" />}>Went live.</TimelineLink>,
    );
    const link = slotTag(html, 'timeline-link');
    expect(link.startsWith('<a')).toBe(true);
    expect(link).not.toContain('type=');
  });

  test('the group heading has the type of the ListRow day heading', () => {
    const html = renderToStaticMarkup(
      // biome-ignore lint/a11y/useHeadingContent: TimelineGroupHeading injects the text via render
      <TimelineGroupHeading render={<h3 />}>Today</TimelineGroupHeading>,
    );
    const heading = slotTag(html, 'timeline-group-heading');
    expect(heading.startsWith('<h3')).toBe(true);
    for (const token of [
      'text-xs',
      'leading-3',
      'font-semibold',
      'text-foreground-secondary',
      'first:pt-0',
    ]) {
      expect(heading).toContain(token);
    }
  });

  test('only an entry added later enters, like a new ListRow', () => {
    const plain = slotTag(renderToStaticMarkup(<TimelineItem />), 'timeline-item');
    expect(plain).not.toContain('data-enter');
    const added = slotTag(renderToStaticMarkup(<TimelineItem enter="new" />), 'timeline-item');
    expect(added).toContain('data-enter="new"');
    expect(added).toContain('motion-safe:data-[enter=new]:starting:h-0');
    expect(added).toContain('data-[enter=new]:starting:opacity-0');
    expect(added).toContain('height_var(--transition-duration-row-enter)_var(--ease-height)');
  });
});
