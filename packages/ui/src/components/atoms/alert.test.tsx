import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertAction, AlertDescription } from './alert.tsx';

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

// An absolutely positioned action covered any sentence longer than the fixed
// padding it reserved. The action now takes its own grid column.
describe('AlertAction', () => {
  const html = renderToStaticMarkup(
    <Alert>
      <AlertDescription>The deployment list is out of date.</AlertDescription>
      <AlertAction>
        <button type="button">View deployments</button>
      </AlertAction>
    </Alert>,
  );

  test('sits in the last grid column on the first row', () => {
    const tokens = slotTokens(html, 'alert-action');
    expect(tokens).toContain('col-end-[-1]');
    expect(tokens).toContain('row-start-1');
    expect(tokens).not.toContain('absolute');
  });

  test('adds an action column to the alert grid instead of reserving padding', () => {
    const tokens = slotTokens(html, 'alert');
    expect(tokens).toContain('has-data-[slot=alert-action]:grid-cols-[1fr_auto]');
    expect(tokens).toContain('has-[>svg]:has-data-[slot=alert-action]:grid-cols-[auto_1fr_auto]');
    expect(tokens.some((token) => token.includes('pr-18'))).toBe(false);
  });
});
