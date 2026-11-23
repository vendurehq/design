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

test('a Chip has the StatusBadge shape: 24px high, 6px corner', () => {
  const html = renderToStaticMarkup(<Chip>Apparel</Chip>);
  expect(html).toContain('h-6');
  expect(html).toContain('rounded-lg');
  expect(html).not.toContain('rounded-4xl');
  expect(html).not.toContain('h-5');
});

test('the remove button corner is concentric: 6px chip corner minus the 4px inset is 2px', () => {
  const html = renderToStaticMarkup(
    <Chip onRemove={() => {}} removeLabel="Remove Apparel">
      Apparel
    </Chip>,
  );
  const button = html.slice(html.indexOf('<button'));
  expect(button).toContain('rounded-sm');
  expect(button).not.toContain('rounded-full');
  // 24px chip, 16px button: 4px from the top and bottom. The end matches it:
  // the 1px border and 3px of padding.
  expect(html).toContain('pe-0.75');
  expect(button).not.toContain('-me-0.5');
});
