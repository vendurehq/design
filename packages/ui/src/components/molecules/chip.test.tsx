import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip } from './chip.tsx';

test('a disabled Chip is marked aria-disabled', () => {
  const html = renderToStaticMarkup(
    <Chip disabled onRemove={() => {}} removeLabel="Remove Apparel">
      Apparel
    </Chip>,
  );
  expect(html).toContain('aria-disabled="true"');
});

test('an enabled Chip carries no aria-disabled', () => {
  expect(renderToStaticMarkup(<Chip>Apparel</Chip>)).not.toContain('aria-disabled');
});

test('the remove button hover tints with the current color, not a raw black/white scrim', () => {
  const html = renderToStaticMarkup(
    <Chip onRemove={() => {}} removeLabel="Remove Apparel">
      Apparel
    </Chip>,
  );
  expect(html).toContain('hover:bg-current/10');
  expect(html).not.toMatch(/bg-(black|white)/);
});

test('Chip variants exclude the link and ghost Badge variants', () => {
  // @ts-expect-error: `link` is not a tag treatment.
  renderToStaticMarkup(<Chip variant="link">Apparel</Chip>);
  // @ts-expect-error: `ghost` is not a tag treatment.
  renderToStaticMarkup(<Chip variant="ghost">Apparel</Chip>);
});
