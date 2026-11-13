import { describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';

const shadcnCss = await Bun.file(resolve(import.meta.dir, 'css/shadcn.css')).text();

/** The body of a `@custom-variant <name> { … }` block. */
function variant(name: string): string {
  const body = shadcnCss.match(new RegExp(`@custom-variant ${name} \\{([\\s\\S]*?)\\n\\}`))?.[1];
  if (!body) throw new Error(`No @custom-variant ${name}`);
  return body;
}

// Base UI sets data-open, data-checked and the rest itself. A data-state
// branch would make a rule built on these variants depend on data-state, and
// a change of data-state (a table row's `selected`) restyles the subtree.
describe('state variants match only the Base UI attribute', () => {
  test.each([
    'open',
    'closed',
    'checked',
    'unchecked',
    'selected',
    'active',
  ])('data-%s', (state) => {
    const body = variant(`data-${state}`);
    expect(body).not.toContain('data-state');
    expect(body).toContain(`&:where([data-${state}]:not([data-${state}="false"]))`);
  });
});
