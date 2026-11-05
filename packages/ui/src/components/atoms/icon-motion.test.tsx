import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button } from './button.tsx';
import { Skeleton } from './skeleton.tsx';
import { Spinner } from './spinner.tsx';

const source = (file: string) => readFileSync(join(import.meta.dir, '..', file), 'utf8');

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .filter(Boolean);
}

const BUTTON_ICON = "[&>svg:not([role=status]):not([class*='opacity-'])]";
const ITEM_ICON = "[&>svg:not([class*='opacity-'])]";

// A decorative icon next to a label is quieter than the label: 55% at rest,
// 85% when its parent is hovered, highlighted or open.
describe('v3 icon recipe', () => {
  test('Button dims an icon next to a label; icon-only buttons keep it at full strength', () => {
    const outline = slotTokens(renderToStaticMarkup(<Button variant="outline">Save</Button>), 'button');
    expect(outline).toContain(`${BUTTON_ICON}:opacity-55`);
    expect(outline).toContain(`hover:${BUTTON_ICON}:opacity-85`);
    const iconOnly = slotTokens(
      renderToStaticMarkup(<Button variant="outline" size="icon" aria-label="More" />),
      'button',
    );
    expect(iconOnly.filter((token) => token.includes('svg') && token.includes(':opacity-'))).toEqual([]);
  });

  test('the primary Button keeps its icon at 75%', () => {
    const primary = slotTokens(renderToStaticMarkup(<Button>Deploy</Button>), 'button');
    expect(primary).toContain(`${BUTTON_ICON}:opacity-75`);
    expect(primary).not.toContain(`${BUTTON_ICON}:opacity-55`);
  });

  for (const file of ['atoms/dropdown-menu.tsx', 'atoms/context-menu.tsx', 'atoms/menubar.tsx']) {
    test(`${file} items dim their icon until highlighted`, () => {
      const code = source(file);
      expect(code).toContain(`${ITEM_ICON}:opacity-55`);
      expect(code).toContain(`focus:${ITEM_ICON}:opacity-85`);
    });
  }

  test('the destructive menu item icon keeps its full colour', () => {
    for (const file of ['atoms/dropdown-menu.tsx', 'atoms/context-menu.tsx']) {
      expect(source(file)).toContain(`data-[variant=destructive]:${ITEM_ICON}:opacity-100`);
    }
  });

  test('command and combobox items brighten the icon on the highlighted item', () => {
    expect(source('atoms/command.tsx')).toContain(`data-[selected=true]:${ITEM_ICON}:opacity-85`);
    expect(source('atoms/combobox.tsx')).toContain(`data-highlighted:${ITEM_ICON}:opacity-85`);
  });

  test('sidebar: inactive item icons are dimmed, the active icon is the brand indicator at full strength', () => {
    const code = source('atoms/sidebar.tsx');
    expect(code).toContain('[&>svg:first-child]:opacity-55');
    expect(code).toContain('hover:[&>svg:first-child]:opacity-85');
    expect(code).toContain('data-active:[&>svg:first-child]:opacity-100');
    expect(code).toContain('data-active:[&>svg:first-child]:text-brand-indicator');
  });

  test('ListRow dims a plain leading icon, not a coloured tone icon', () => {
    const code = source('molecules/list-row.tsx');
    expect(code).toContain("[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-55");
    expect(code).toContain("group-hover/list-row:[&>svg:not([class*='opacity-']):not([class*='text-'])]:opacity-85");
  });
});

// Reduced motion keeps the opacity fades and drops movement: scale, slide,
// blur, height and width.
describe('v3 reduced motion', () => {
  test('popups that fade keep the fade: no blanket animate-none', () => {
    for (const file of ['atoms/combobox.tsx', 'atoms/navigation-menu.tsx']) {
      expect(source(file)).not.toContain('motion-reduce:animate-none');
    }
    expect(source('atoms/combobox.tsx')).toContain('motion-safe:data-open:zoom-in-95');
    expect(source('atoms/navigation-menu.tsx')).toContain('motion-reduce:transition-opacity');
  });

  test('the drawer panel fades in place under reduced motion', () => {
    const code = source('atoms/drawer.tsx');
    expect(code).toContain('motion-reduce:transition-opacity');
    expect(code).toContain('motion-reduce:data-starting-style:opacity-0');
    expect(code).toContain('motion-safe:data-starting-style:transform-(--closed-transform)');
    expect(code).not.toContain('motion-reduce:transition-none');
  });

  test('the accordion panel swaps its height animation for a fade', () => {
    const code = source('atoms/accordion.tsx');
    expect(code).toContain('motion-safe:data-open:animate-accordion-down');
    expect(code).toContain('motion-reduce:data-open:fade-in-0');
  });

  test('the sidebar group label collapses its height with the rail; reduced motion keeps the fade', () => {
    const code = source('atoms/sidebar.tsx');
    expect(code).toContain('group-data-[collapsible=icon]:h-0');
    expect(code).toContain('transition-[height,opacity]');
    expect(code).toContain('motion-reduce:transition-opacity');
  });

  test('spinners stand still', () => {
    const html = renderToStaticMarkup(<Spinner />);
    expect(html).toContain('motion-reduce:animate-none');
    expect(source('molecules/status-badge.tsx')).toContain('animate-spin-slow motion-reduce:animate-none');
    expect(source('molecules/status-badge.tsx')).not.toContain('animate-[spin');
  });
});

describe('slot variables in arbitrary values', () => {
  // The --color-* aliases resolve on :root, so they ignore a nested .dark scope.
  test('Skeleton mixes the slot variables', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Skeleton />), 'skeleton');
    const gradient = tokens.find((token) => token.startsWith('bg-[linear-gradient'));
    expect(gradient).toContain('var(--muted)');
    expect(gradient).toContain('var(--accent)');
    expect(gradient).not.toContain('--color-');
  });

  test('no atom or molecule reads a --color-* alias', () => {
    for (const file of ['atoms/skeleton.tsx', 'atoms/progress.tsx', 'atoms/drawer.tsx']) {
      expect(source(file)).not.toMatch(/var\(--color-/);
    }
  });
});

describe('command palette', () => {
  test('uses the lighter scrim with a 2px blur', () => {
    const scrim = source('atoms/command.tsx').match(/overlayClassName="([^"]*)"/)?.[1].split(' ') ?? [];
    expect(scrim).toEqual(
      expect.arrayContaining(['bg-scrim-subtle', 'supports-backdrop-filter:backdrop-blur-[2px]']),
    );
  });

  test('drops 6px from 98% to open, closes in 110ms, and only fades under reduced motion', () => {
    const palette = source('atoms/command.tsx');
    for (const token of [
      'origin-top',
      'duration-[160ms,180ms,180ms]',
      'motion-safe:data-starting-style:-translate-y-1.5',
      'motion-safe:data-starting-style:scale-98',
      'data-ending-style:duration-110',
      'motion-reduce:transition-opacity',
    ]) {
      expect(palette).toContain(token);
    }
  });
});
