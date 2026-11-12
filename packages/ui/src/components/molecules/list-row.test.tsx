import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag } from '../../test/slot-tokens.ts';
import {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowGroupHeading,
  ListRowLink,
  ListRowMeta,
  ListRowSwap,
  ListRowTitle,
  ListRowTrailing,
} from './list-row.tsx';

describe('ListRow', () => {
  test('the row link is a button by default and stretches over the row', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          <ListRowLink onClick={() => {}}>Fix checkout totals</ListRowLink>
        </ListRowContent>
      </ListRow>,
    );
    const link = slotTag(html, 'list-row-link');
    expect(link.startsWith('<button')).toBe(true);
    expect(link).toContain('type="button"');
    expect(link).toContain('after:absolute');
    expect(link).toContain('after:inset-0');
    expect(slotTag(html, 'list-row')).toContain('relative');
  });

  test('the row link renders as an anchor through render, without a button type', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          {/* biome-ignore lint/a11y/useAnchorContent: ListRowLink injects the label via render */}
          <ListRowLink render={<a href="/orders/SB-2043" />}>SB-2043</ListRowLink>
        </ListRowContent>
      </ListRow>,
    );
    const link = slotTag(html, 'list-row-link');
    expect(link.startsWith('<a')).toBe(true);
    expect(link).toContain('href="/orders/SB-2043"');
    expect(link).not.toContain('type=');
  });

  test('the accessible name is the title: the meta line sits outside the link', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          <ListRowLink>Fix checkout totals</ListRowLink>
          <ListRowMeta>Started by Ana</ListRowMeta>
        </ListRowContent>
      </ListRow>,
    );
    expect(html).toMatch(/<button[^>]*>Fix checkout totals<\/button>/);
    expect(html).toContain('data-slot="list-row-meta"');
  });

  test('controls inside the row are lifted above the stretched link, the link itself is not', () => {
    const row = slotTag(renderToStaticMarkup(<ListRow />), 'list-row');
    // The copy chips are lifted whole; their inner copy button stays static,
    // or its stretched ::after shrinks to the icon.
    const notLifted =
      ':not([data-slot=list-row-link],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]';
    expect(row).toContain(`${notLifted}:relative`);
    expect(row).toContain(`${notLifted}:z-10`);
    expect(row).toContain('[data-slot=anonymized-token],[data-slot=copyable-text]');
    const actions = slotTag(renderToStaticMarkup(<ListRowActions />), 'list-row-actions');
    expect(actions).toContain('z-10');
  });

  test('hover fill and pointer only apply to a row with a link', () => {
    const row = slotTag(renderToStaticMarkup(<ListRow />), 'list-row');
    expect(row).toContain('has-data-[slot=list-row-link]:hover:bg-muted');
    expect(row).toContain('has-data-[slot=list-row-link]:cursor-pointer');
    expect(row).not.toMatch(/(^|\s)hover:bg-muted/);
  });

  test('hover-revealed parts stay visible on touch screens', () => {
    const chevron = renderToStaticMarkup(<ListRowChevron />);
    expect(chevron).toContain('aria-hidden="true"');
    expect(chevron).toContain('[@media(hover:none)]:opacity-100');
    const actions = renderToStaticMarkup(<ListRowActions />);
    expect(actions).toContain('[@media(hover:none)]:opacity-100');
  });

  test('a static row has a title and no link', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          <ListRowTitle>Nightly backup</ListRowTitle>
        </ListRowContent>
        <ListRowTrailing>02:00</ListRowTrailing>
      </ListRow>,
    );
    expect(html).toContain('data-slot="list-row-title"');
    expect(html).not.toContain('list-row-link"');
    expect(html).not.toContain('<button');
  });

  test('row actions and a new row run on the v3-look timings', () => {
    const actions = slotTag(renderToStaticMarkup(<ListRowActions />), 'list-row-actions');
    expect(actions).toContain('duration-quick');
    expect(actions).toContain('ease-soft');
    const row = slotTag(renderToStaticMarkup(<ListRow enter="new" />), 'list-row');
    // The content fades in on `ease` after the height has started to open.
    expect(row).toContain(
      'opacity_var(--transition-duration-slow)_var(--ease-soft)_var(--transition-duration-fast)',
    );
    expect(row).toContain('height_var(--transition-duration-row-enter)_var(--ease-height)');
    expect(row).toContain(
      'filter_var(--transition-duration-slow)_var(--ease-out)_var(--transition-duration-fast)',
    );
  });

  test('a group heading sits between rows with a rule above, and the row under it drops its own', () => {
    const html = renderToStaticMarkup(
      // biome-ignore lint/a11y/useHeadingContent: ListRowGroupHeading injects the text via render
      <ListRowGroupHeading render={<h3 />}>Today</ListRowGroupHeading>,
    );
    const heading = slotTag(html, 'list-row-group-heading');
    expect(heading.startsWith('<h3')).toBe(true);
    for (const token of [
      'border-t',
      'first:border-t-0',
      'text-xs',
      'leading-3',
      'font-semibold',
      // A step above the 12px muted row meta: the day reads as the group.
      'text-foreground-secondary',
      // 16px above, 6px below: a 34px heading, nearer its rows than the rule above.
      'pt-4',
      'pb-1.5',
      'ps-4.5',
    ]) {
      expect(heading).toContain(token);
    }
    const row = slotTag(renderToStaticMarkup(<ListRow />), 'list-row');
    expect(row).toContain('[[data-slot=list-row-group-heading]+&amp;]:border-t-0');
  });

  test('the meta line is 18px high, so a two-line row is 60px', () => {
    const meta = slotTag(renderToStaticMarkup(<ListRowMeta>Pushed</ListRowMeta>), 'list-row-meta');
    expect(meta).toContain('text-xs');
    expect(meta).toContain('leading-4.5');
  });

  test('a row that "Show older" adds fades up after the one above it', () => {
    const later = (index: number) =>
      slotTag(renderToStaticMarkup(<ListRow enter={{ stagger: index }} />), 'list-row');
    expect(later(0)).toContain('data-enter="stagger"');
    expect(later(0)).toContain('--list-row-stagger-delay:0ms');
    expect(later(2)).toContain('--list-row-stagger-delay:56ms');
    // A long page does not keep the last rows waiting.
    expect(later(40)).toContain('--list-row-stagger-delay:336ms');
    const row = later(1);
    expect(row).toContain('data-[enter=stagger]:starting:opacity-0');
    expect(row).toContain('motion-safe:data-[enter=stagger]:starting:translate-y-1.5');
    expect(row).toContain('motion-safe:data-[enter=stagger]:starting:blur-[3px]');
    // Reduced motion keeps the fade only, without the stagger.
    expect(row).toContain(
      'motion-reduce:data-[enter=stagger]:[transition:opacity_var(--transition-duration-normal)_var(--ease-default)',
    );
    // Rows of the first render take none of it.
    const first = slotTag(renderToStaticMarkup(<ListRow />), 'list-row');
    expect(first).not.toContain('data-enter=');
    expect(first).not.toContain('style=');
  });

  test('ListRowSwap stacks the value and the action in one cell, and the value only fades', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          <ListRowTitle>Today, 01:00</ListRowTitle>
        </ListRowContent>
        <ListRowSwap value="1.82 GB">
          <button type="button">Restore</button>
        </ListRowSwap>
      </ListRow>,
    );
    const cell = slotTag(html, 'list-row-swap');
    expect(cell).toContain('grid');
    const value = slotTag(html, 'list-row-swap-value');
    const action = slotTag(html, 'list-row-swap-action');
    // One grid area for both, so the cell is as wide as the wider of the two.
    for (const tag of [value, action]) {
      expect(tag).toContain('col-start-1');
      expect(tag).toContain('row-start-1');
    }
    // The value stays in the accessibility tree.
    expect(value).not.toContain('aria-hidden');
    expect(value).toContain('group-hover/list-row:opacity-0');
    expect(action).toContain('opacity-0');
    expect(action).toContain('group-hover/list-row:opacity-100');
    expect(action).toContain('group-has-[:focus-visible]/list-row:opacity-100');
    expect(action).toContain('group-has-[[aria-expanded=true]]/list-row-swap:opacity-100');
    expect(action).toContain('[@media(hover:none)]:opacity-100');
    // Sequenced: the incoming one waits until the outgoing one has faded.
    expect(action).toContain('group-hover/list-row:delay-(--transition-duration-row-swap-delay)');
    expect(value).toContain('group-hover/list-row:duration-row-swap-out');
    expect(value).toContain('motion-reduce:transition-none');
  });
});
