import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Chip, type ChipRemoveProps } from './chip.tsx';

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

test('a Chip without onEdit keeps its label as text', () => {
  const html = renderToStaticMarkup(<Chip>Apparel</Chip>);
  expect(html).not.toContain('<button');
  expect(html).not.toContain('chip-edit');
});

test('onEdit makes the label a button, a sibling of the remove button', () => {
  const html = renderToStaticMarkup(
    <Chip onEdit={() => {}} editExpanded={false} onRemove={() => {}} removeLabel="Remove Apparel">
      Apparel
    </Chip>,
  );
  const edit = html.indexOf('data-slot="chip-edit"');
  const remove = html.indexOf('data-slot="chip-remove"');
  expect(edit).toBeGreaterThan(-1);
  expect(remove).toBeGreaterThan(edit);
  // Two sibling buttons, never one inside the other.
  expect(html.slice(edit, remove)).toContain('</button>');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('>Apparel</button>');
});

test('editLabel names the edit button', () => {
  const html = renderToStaticMarkup(
    <Chip onEdit={() => {}} editLabel="Edit Apparel">
      Apparel
    </Chip>,
  );
  expect(html).toContain('aria-label="Edit Apparel"');
});

test('removeLabel is required with onRemove, and not allowed without it', () => {
  // @ts-expect-error: a remove button needs an accessible name.
  renderToStaticMarkup(<Chip onRemove={() => {}}>Apparel</Chip>);
  // @ts-expect-error: `removeLabel` names a remove button that is not there.
  renderToStaticMarkup(<Chip removeLabel="Remove Apparel">Apparel</Chip>);
  const html = renderToStaticMarkup(
    <Chip onRemove={() => {}} removeLabel="Remove Apparel">
      Apparel
    </Chip>,
  );
  expect(html).toContain('aria-label="Remove Apparel"');
});

test('a conditional remove button compiles with both props set or neither', () => {
  const render = (removable: boolean) => {
    const onRemove = () => {};
    const removeProps: ChipRemoveProps = removable
      ? { onRemove, removeLabel: 'Remove Apparel' }
      : {};
    return [
      <Chip key="typed" {...removeProps}>
        Apparel
      </Chip>,
      <Chip
        key="inline"
        {...(removable ? { onRemove, removeLabel: 'Remove Apparel' } : { onRemove: undefined })}
      >
        Apparel
      </Chip>,
      // @ts-expect-error: a `{}` else branch makes both props optional on their own.
      <Chip key="empty" {...(removable ? { onRemove, removeLabel: 'Remove Apparel' } : {})}>
        Apparel
      </Chip>,
    ];
  };
  expect(renderToStaticMarkup(render(true)).match(/aria-label="Remove Apparel"/g)).toHaveLength(3);
  expect(renderToStaticMarkup(render(false))).not.toContain('chip-remove');
});
