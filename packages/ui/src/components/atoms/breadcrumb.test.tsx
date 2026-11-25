import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens } from '../../test/slot-tokens.ts';
import { BreadcrumbMenu, BreadcrumbSearchMenu } from './breadcrumb.tsx';

const options = [{ value: 'p1', label: 'Acme Storefront' }];

const menus = {
  BreadcrumbMenu: (pending: boolean) =>
    renderToStaticMarkup(
      <BreadcrumbMenu
        label="Project"
        options={options}
        value="p1"
        pending={pending}
        className="max-w-56"
      />,
    ),
  BreadcrumbSearchMenu: (pending: boolean) =>
    renderToStaticMarkup(
      <BreadcrumbSearchMenu
        label="Project"
        options={options}
        value="p1"
        pending={pending}
        className="max-w-56"
      />,
    ),
};

describe.each(Object.entries(menus))('%s pending', (_name, render) => {
  const html = render(true);

  test('renders no trigger and no name, only the pending crumb', () => {
    expect(html).not.toContain('<button');
    expect(html).not.toContain('data-slot="breadcrumb-menu"');
    expect(html).not.toContain('Acme Storefront');
  });

  test('is one status that reads "<label>: Loading…"', () => {
    expect(slotTag(html, 'breadcrumb-menu-pending')).toContain('role="status"');
    expect(html.match(/role="status"/g)).toHaveLength(1);
    expect(html).toContain('<span class="sr-only">Project: Loading…</span>');
  });

  test('hides the skeleton from screen readers and sizes it on the line height', () => {
    expect(slotTag(html, 'skeleton')).toContain('aria-hidden="true"');
    expect(slotTokens(html, 'skeleton')).toContain('h-[0.8lh]');
    expect(slotTokens(html, 'skeleton').some((token) => /^h-\d/.test(token))).toBe(false);
  });

  test('keeps the crumb box: 28px, the trigger insets and line, and the consumer class', () => {
    const crumb = slotTokens(html, 'breadcrumb-menu-pending');
    for (const token of ['h-7', 'ps-2.25', 'pe-1.75', 'border', 'border-transparent', 'text-sm', 'max-w-56']) {
      expect(crumb).toContain(token);
    }
  });

  test('renders the trigger with the name once not pending', () => {
    const loaded = render(false);
    expect(loaded).not.toContain('breadcrumb-menu-pending');
    expect(slotTag(loaded, 'breadcrumb-menu')).toMatch(/^<button/);
    expect(loaded).toContain('Acme Storefront');
  });
});
