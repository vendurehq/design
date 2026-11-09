import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ListRow,
  ListRowActions,
  ListRowChevron,
  ListRowContent,
  ListRowLink,
  ListRowMeta,
  ListRowTitle,
  ListRowTrailing,
} from './list-row.tsx';

const openTag = (html: string, slot: string) =>
  html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';

describe('ListRow', () => {
  test('the row link is a button by default and stretches over the row', () => {
    const html = renderToStaticMarkup(
      <ListRow>
        <ListRowContent>
          <ListRowLink onClick={() => {}}>Fix checkout totals</ListRowLink>
        </ListRowContent>
      </ListRow>,
    );
    const link = openTag(html, 'list-row-link');
    expect(link.startsWith('<button')).toBe(true);
    expect(link).toContain('type="button"');
    expect(link).toContain('after:absolute');
    expect(link).toContain('after:inset-0');
    expect(openTag(html, 'list-row')).toContain('relative');
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
    const link = openTag(html, 'list-row-link');
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
    const row = openTag(renderToStaticMarkup(<ListRow />), 'list-row');
    // The copy chips are lifted whole; their inner copy button stays static,
    // or its stretched ::after shrinks to the icon.
    const notLifted =
      ':not([data-slot=list-row-link],[data-slot=id-chip]_*,[data-slot=anonymized-token]_*,[data-slot=copyable-text]_*)]';
    expect(row).toContain(`${notLifted}:relative`);
    expect(row).toContain(`${notLifted}:z-10`);
    expect(row).toContain('[data-slot=anonymized-token],[data-slot=copyable-text]');
    const actions = openTag(renderToStaticMarkup(<ListRowActions />), 'list-row-actions');
    expect(actions).toContain('z-10');
  });

  test('hover fill and pointer only apply to a row with a link', () => {
    const row = openTag(renderToStaticMarkup(<ListRow />), 'list-row');
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
    const actions = openTag(renderToStaticMarkup(<ListRowActions />), 'list-row-actions');
    expect(actions).toContain('duration-(--transition-duration-quick)');
    expect(actions).toContain('ease-(--ease-soft)');
    const row = openTag(renderToStaticMarkup(<ListRow data-new="" />), 'list-row');
    // The content fades in on `ease` after the height has started to open.
    expect(row).toContain(
      'opacity_var(--transition-duration-slow)_var(--ease-soft)_var(--transition-duration-fast)',
    );
    expect(row).toContain('height_var(--transition-duration-slow)_var(--ease-drawer)');
    expect(row).toContain(
      'filter_var(--transition-duration-slow)_var(--ease-out)_var(--transition-duration-fast)',
    );
  });
});
