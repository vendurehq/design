import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens } from '../../test/slot-tokens.ts';
import { TextLink } from './text-link.tsx';

/** Stands in for a router's link component. */
function RouterLink(props: React.ComponentProps<'a'>) {
  return <a data-router="" {...props} />;
}

const tokens = (node: React.ReactElement) => slotTokens(renderToStaticMarkup(node), 'text-link');

describe('TextLink', () => {
  test('renders an anchor with the label and no role override', () => {
    const html = renderToStaticMarkup(<TextLink href="/docs">the docs</TextLink>);
    expect(html).toStartWith('<a');
    expect(html).toContain('href="/docs"');
    expect(html).toContain('data-slot="text-link"');
    expect(html).toContain('data-tone="default"');
    expect(html).not.toContain('role=');
    expect(html).not.toContain('target=');
    expect(html).not.toContain('<svg');
  });

  test('is inline and takes size, weight and line height from the text around it', () => {
    const classes = tokens(<TextLink href="#">link</TextLink>);
    expect(classes).toContain('inline');
    expect(classes).not.toContain('inline-flex');
    expect(classes.filter((c) => /^(text-(xs|sm|base|lg)|font-|leading-)/.test(c))).toEqual([]);
  });

  test('default tone: primary text, always underlined in brand-indicator, brand-text on hover and focus', () => {
    expect(tokens(<TextLink href="#">link</TextLink>)).toEqual(
      expect.arrayContaining([
        'text-primary',
        'underline',
        'underline-offset-4',
        'decoration-brand-indicator',
        'hover:text-brand-text',
        'focus-visible:text-brand-text',
      ]),
    );
  });

  test('quiet tone: muted text, underline only on hover', () => {
    const classes = tokens(
      <TextLink href="#" tone="quiet">
        link
      </TextLink>,
    );
    expect(classes).toEqual(
      expect.arrayContaining([
        'text-muted-foreground',
        'decoration-transparent',
        'hover:text-foreground',
        'hover:decoration-current',
        'focus-visible:text-foreground',
      ]),
    );
    expect(classes).not.toContain('text-primary');
  });

  test('draws the design-system ring at offset 0, so it clears the next word, and hides the underline under it', () => {
    expect(tokens(<TextLink href="#">link</TextLink>)).toEqual(
      expect.arrayContaining([
        'outline-none',
        'focus-visible:outline-solid',
        'focus-visible:outline-2',
        'focus-visible:outline-offset-0',
        'focus-visible:outline-ring',
        'focus-visible:decoration-transparent',
      ]),
    );
    // No tone brings an underline back while the ring shows.
    for (const tone of ['default', 'quiet'] as const) {
      const classes = tokens(
        <TextLink href="#" tone={tone}>
          link
        </TextLink>,
      );
      expect(classes).not.toContain('focus-visible:outline-offset-2');
      expect(classes.filter((c) => c.startsWith('focus-visible:decoration-'))).toEqual([
        'focus-visible:decoration-transparent',
      ]);
    }
  });

  test('eases only colours, never transition-all', () => {
    const classes = tokens(<TextLink href="#">link</TextLink>);
    expect(classes).toContain('transition-colors');
    expect(classes).not.toContain('transition-all');
  });

  test('external opens a new tab safely, with a decorative arrow and a screen-reader note', () => {
    const html = renderToStaticMarkup(
      <TextLink href="https://example.com" external>
        the status page
      </TextLink>,
    );
    const tag = slotTag(html, 'text-link');
    expect(tag).toContain('target="_blank"');
    expect(tag).toContain('rel="noopener noreferrer"');
    expect(html).toContain('<span class="sr-only"> (opens in a new tab)</span>');
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*data-slot="text-link-external-icon"/);
    expect(html).toContain('lucide-arrow-up-right');
    // The arrow comes after the label and the note.
    expect(html.indexOf('the status page')).toBeLessThan(html.indexOf('sr-only'));
    expect(html.indexOf('sr-only')).toBeLessThan(html.indexOf('<svg'));
  });

  test('external: the caller can override target, rel and the note', () => {
    const html = renderToStaticMarkup(
      <TextLink href="https://example.com" external target="docs" rel="noopener" externalLabel="(neuer Tab)">
        Docs
      </TextLink>,
    );
    const tag = slotTag(html, 'text-link');
    expect(tag).toContain('target="docs"');
    expect(tag).toContain('rel="noopener"');
    expect(html).toContain('(neuer Tab)');
  });

  test('render swaps the element for a router link and keeps the link role and the look', () => {
    const html = renderToStaticMarkup(
      <TextLink render={<RouterLink href="/settings" />} external>
        settings
      </TextLink>,
    );
    expect(html).toStartWith('<a');
    expect(html).toContain('data-router');
    expect(html).not.toContain('role=');
    const tag = slotTag(html, 'text-link');
    expect(tag).toContain('target="_blank"');
    expect(tag).toContain('rel="noopener noreferrer"');
    expect(slotTokens(html, 'text-link')).toContain('text-primary');
  });

  test('a className from the caller merges with the look', () => {
    const classes = tokens(
      <TextLink href="#" className="text-xs">
        link
      </TextLink>,
    );
    expect(classes).toContain('text-xs');
    expect(classes).toContain('text-primary');
  });
});

test('external: the word joiner before the arrow is hidden with it, out of the accessible name', () => {
  const html = renderToStaticMarkup(
    <TextLink href="https://example.com" external>
      Docs
    </TextLink>,
  );
  expect(html).toMatch(/<span aria-hidden="true">⁠<svg/);
});
