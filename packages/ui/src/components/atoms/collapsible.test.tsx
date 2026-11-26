import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens } from '../../test/slot-tokens.ts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible.tsx';

const render = (open: boolean, contentClassName?: string) =>
  renderToStaticMarkup(
    <Collapsible defaultOpen={open}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent className={contentClassName}>Details</CollapsibleContent>
    </Collapsible>,
  );

describe('Collapsible', () => {
  test('the trigger reports the open state', () => {
    expect(slotTag(render(false), 'collapsible-trigger')).toContain('aria-expanded="false"');
    expect(slotTag(render(true), 'collapsible-trigger')).toContain('aria-expanded="true"');
  });

  test('a closed panel renders no content; an open one shows it at once', () => {
    expect(render(false)).not.toContain('Details');
    const open = render(true);
    expect(open).toContain('Details');
    // First render: no starting or ending style attribute, so nothing animates.
    const tag = slotTag(open, 'collapsible-content').replace(/class="[^"]*"/, '');
    expect(tag).toContain('data-open');
    expect(tag).not.toContain('data-starting-style');
    expect(tag).not.toContain('data-ending-style');
    expect(tag).toContain('--collapsible-panel-height:auto');
  });

  test('the height runs on the height curve and slow duration', () => {
    const panel = slotTokens(render(true), 'collapsible-content');
    expect(panel).toContain('h-(--collapsible-panel-height)');
    expect(panel).toContain('data-starting-style:h-0');
    expect(panel).toContain('data-ending-style:h-0');
    expect(panel.join(' ')).toContain(
      'motion-safe:[transition:height_var(--transition-duration-slow)_var(--ease-height)',
    );
  });

  test('content is clipped only while the height runs', () => {
    const panel = slotTokens(render(true), 'collapsible-content');
    expect(panel).not.toContain('overflow-hidden');
    expect(panel).toContain('data-starting-style:overflow-hidden');
    expect(panel).toContain('data-ending-style:overflow-hidden');
    // The open clip is held for the height duration, then released.
    expect(panel.join(' ')).toContain('overflow_0s_var(--transition-duration-slow)_allow-discrete');
    expect(panel).toContain('motion-safe:data-ending-style:[transition-delay:0s]');
  });

  test('reduced motion snaps the height and fades the panel', () => {
    const panel = slotTokens(render(true), 'collapsible-content');
    expect(panel).toContain('motion-reduce:transition-opacity');
    expect(panel).toContain('motion-reduce:duration-fast');
    expect(panel).toContain('motion-reduce:data-starting-style:opacity-0');
    expect(panel).toContain('motion-reduce:data-ending-style:opacity-0');
    expect(panel).toContain('motion-reduce:data-ending-style:h-(--collapsible-panel-height)');
  });

  test('a className is merged onto the panel', () => {
    expect(slotTokens(render(true, 'space-y-2'), 'collapsible-content')).toContain('space-y-2');
  });
});
