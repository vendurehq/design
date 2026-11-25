import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens, tagTokens } from '../../test/slot-tokens.ts';
import { ButtonLabelSwap } from './button.tsx';
import { TooltipLabelSwap } from './tooltip.tsx';
import { nextShown } from './label-swap.tsx';

const labels = ['Copy', 'Copied'];

/** The swap's own classes and the classes of its active label. */
function parts(html: string, slot: string) {
  const swap = slotTokens(html, slot);
  const rest = html.slice(html.indexOf(slotTag(html, slot)) + slotTag(html, slot).length);
  const label = tagTokens(rest.match(/<span[^>]*data-swap="in"[^>]*>/)?.[0] ?? '');
  return { swap, label };
}

const button = parts(
  renderToStaticMarkup(<ButtonLabelSwap labels={labels} active={0} />),
  'button-label-swap',
);
const tooltip = parts(
  renderToStaticMarkup(<TooltipLabelSwap labels={labels} active={0} />),
  'tooltip-label-swap',
);

describe('ButtonLabelSwap and TooltipLabelSwap', () => {
  test('share one reduced-motion rule: the size eases and the labels slide only with full motion', () => {
    for (const { swap, label } of [button, tooltip]) {
      expect(swap).toContain('motion-safe:transition-[width,height]');
      expect(swap.filter((token) => token.startsWith('transition-'))).toEqual([]);
      expect(label).toContain('data-[swap=after]:opacity-0');
      expect(label).toContain('motion-safe:data-[swap=after]:translate-y-(--label-swap-shift)');
      expect(label).toContain('motion-safe:data-[swap=before]:-translate-y-(--label-swap-shift)');
      expect(label).toContain('motion-safe:data-[swap=after]:blur-[2px]');
      expect(
        label.filter((token) => token.startsWith('data-[swap') && token.includes('translate')),
      ).toEqual([]);
    }
  });

  test('differ only in timing: 4px on the button durations, 6px on the tooltip label durations', () => {
    expect(button.swap).toContain('[--label-swap-resize:var(--transition-duration-normal)]');
    expect(tooltip.swap).toContain('[--label-swap-shift:calc(var(--spacing)*1.5)]');
    expect(tooltip.swap).toContain(
      '[--label-swap-resize:var(--transition-duration-tooltip-resize)]',
    );
  });
});

describe('Tooltip width', () => {
  // The bubble side renders in a portal, which server rendering skips; the
  // NeverWiderThan320 story checks it in a browser.
  test('a changing label wraps at the 320px bubble, less its padding', () => {
    expect(tooltip.label).toContain('max-w-[calc(--spacing(80)-1.25rem)]');
    expect(tooltip.label).not.toContain('--tooltip-max-w');
  });
});

describe('LabelSwap: a move to the same words', () => {
  const shown = { active: 0, label: 'Acme Storefront', still: false };

  test('to another index with the same text is still: nothing moves', () => {
    expect(nextShown(shown, 2, 'Acme Storefront')).toEqual({ active: 2, label: 'Acme Storefront', still: true });
  });

  test('to another index with other words swaps as usual', () => {
    expect(nextShown(shown, 2, 'Globex')?.still).toBe(false);
  });

  test('a new text at the same index rewrites in place, not still', () => {
    expect(nextShown(shown, 0, 'Globex')).toEqual({ active: 0, label: 'Globex', still: false });
  });

  test('an element label is never taken for the same words', () => {
    const element = <b>Acme</b>;
    expect(nextShown({ active: 0, label: element, still: false }, 1, element)?.still).toBe(false);
  });

  test('no change returns nothing, so the swap does not render again', () => {
    expect(nextShown(shown, 0, 'Acme Storefront')).toBeUndefined();
  });
});
