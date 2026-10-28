import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IdChip } from './id-chip.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('IdChip', () => {
  test('the copy button keeps its default "Copy" label', () => {
    expect(html(<IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />)).toContain(
      'aria-label="Copy"',
    );
  });

  // `copiedLabel` takes the same path but only renders after a clipboard
  // interaction, which a static render cannot reach.
  test('forwards copyLabel to the copy button', () => {
    const markup = html(
      <IdChip value="a1b2c3d4e5f6a7b8c9d0" copyLabel="Copy commit SHA" onCopyError={() => {}} />,
    );
    expect(markup).toContain('aria-label="Copy commit SHA"');
    expect(markup).not.toContain('aria-label="Copy"');
  });

  test('copyable={false} renders no copy button', () => {
    expect(html(<IdChip value="a1b2c3d4e5f6a7b8c9d0" copyable={false} />)).not.toContain(
      'data-slot="copy-button"',
    );
  });
});
