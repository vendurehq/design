import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertDescription, AlertTitle } from './alert.tsx';
import { Badge } from './badge.tsx';
import { Button } from './button.tsx';
import { Field, FieldError } from './field.tsx';

// Dark destructive is below 4.5:1 as text on the dark surfaces. Tone text uses
// destructive-subtle-foreground, which @vendure-io/design-tokens checks at 4.5:1
// on all four surfaces in both modes. Fills keep the destructive slot.

/** Every class token in the markup, entity-decoded. */
function allTokens(html: string): string[] {
  return [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) =>
    (match[1] ?? '').replace(/&amp;/g, '&').split(/\s+/).filter(Boolean),
  );
}

const cases = {
  Alert: (
    <Alert variant="destructive">
      <AlertTitle>Payment failed</AlertTitle>
      <AlertDescription>The card was declined.</AlertDescription>
    </Alert>
  ),
  Badge: <Badge variant="destructive">Cancelled</Badge>,
  Button: <Button variant="destructive">Delete</Button>,
  Field: (
    <Field data-invalid="true">
      <FieldError>Enter a SKU.</FieldError>
    </Field>
  ),
};

describe('destructive tone text', () => {
  for (const [name, element] of Object.entries(cases)) {
    test(`${name} uses destructive-subtle-foreground for text`, () => {
      const tokens = allTokens(renderToStaticMarkup(element));
      expect(tokens.some((token) => token.endsWith('text-destructive-subtle-foreground'))).toBe(true);
      expect(tokens.filter((token) => /text-destructive(\/\d+)?!?$/.test(token))).toEqual([]);
    });
  }
});
