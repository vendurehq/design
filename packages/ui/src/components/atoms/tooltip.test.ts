import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { duration } from '@vendure-io/design-tokens';

const source = readFileSync(join(import.meta.dir, 'tooltip.tsx'), 'utf8');

describe('TooltipProvider', () => {
  // tooltip.tsx keeps the delay as a number so the ui source needs no runtime
  // import of the tokens package. It must match the token.
  test('waits the tooltip-delay token before the first tooltip', () => {
    const delay = source.match(/const TOOLTIP_DELAY = (\d+)/)?.[1];
    expect(Number(delay)).toBe(Number.parseFloat(duration.tooltipDelay));
    expect(source).toContain('delay = TOOLTIP_DELAY');
  });

  test('an instant tooltip does not animate', () => {
    expect(source).toContain('data-instant:duration-instant');
  });
});
