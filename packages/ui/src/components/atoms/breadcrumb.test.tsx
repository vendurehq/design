import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens } from '../../test/slot-tokens.ts';
import { FormatProvider } from '../molecules/format-provider.tsx';
import { BreadcrumbMenu, BreadcrumbSearchMenu } from './breadcrumb.tsx';

const options = [{ value: 'p1', label: 'Acme Storefront' }];

type Crumb = { pending: boolean; known?: 'option' | 'placeholder' };

/** `known`: the name comes from the option for `value`, the placeholder, or nothing. */
function props({ pending, known }: Crumb) {
  return {
    label: 'Project',
    options: known === 'option' ? options : undefined,
    placeholder: known === 'placeholder' ? 'Acme Storefront' : undefined,
    value: 'p1',
    pending,
    className: 'max-w-56',
  };
}

const menus = {
  BreadcrumbMenu: (crumb: Crumb) => renderToStaticMarkup(<BreadcrumbMenu {...props(crumb)} />),
  BreadcrumbSearchMenu: (crumb: Crumb) => renderToStaticMarkup(<BreadcrumbSearchMenu {...props(crumb)} />),
};

describe.each(Object.entries(menus))('%s pending', (_name, render) => {
  const html = render({ pending: true });

  test('with no name known: renders no trigger, only the pending crumb', () => {
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

  test.each(['option', 'placeholder'] as const)(
    'with a name from the %s: shows the name on the trigger, no skeleton or status',
    (known) => {
      const named = render({ pending: true, known });
      expect(named).not.toContain('breadcrumb-menu-pending');
      expect(named).not.toContain('role="status"');
      expect(slotTag(named, 'breadcrumb-menu')).toMatch(/^<button/);
      expect(named).toContain('Acme Storefront');
    },
  );

  test('renders the trigger with the name once not pending', () => {
    const loaded = render({ pending: false, known: 'option' });
    expect(loaded).not.toContain('breadcrumb-menu-pending');
    expect(slotTag(loaded, 'breadcrumb-menu')).toMatch(/^<button/);
    expect(loaded).toContain('Acme Storefront');
  });
});

describe.each(Object.entries({ BreadcrumbMenu, BreadcrumbSearchMenu }))('%s texts', (_name, Menu) => {
  const pending = (loadingLabel?: string) =>
    renderToStaticMarkup(
      <FormatProvider messages={{ breadcrumb: { loading: 'Wird geladen…' } }}>
        <Menu label="Project" options={undefined} value="p1" pending loadingLabel={loadingLabel} />
      </FormatProvider>,
    );

  test('the pending crumb reads messages.breadcrumb.loading, and loadingLabel wins', () => {
    expect(pending()).toContain('<span class="sr-only">Project: Wird geladen…</span>');
    expect(pending('Chargement…')).toContain('<span class="sr-only">Project: Chargement…</span>');
  });
});

describe('options', () => {
  test('"not known yet" is undefined, and the prop is required', () => {
    const known: React.ComponentProps<typeof BreadcrumbMenu> = { label: 'Project', options: undefined, value: 'p1' };
    // @ts-expect-error Pass `options={undefined}` while the options load, never leave it out.
    const missing: React.ComponentProps<typeof BreadcrumbMenu> = { label: 'Project', value: 'p1' };
    expect([known, missing]).toBeDefined();
  });
});
