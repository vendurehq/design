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

  test('a copyable chip copies as a whole: the copy button stretches over it', () => {
    const markup = html(<IdChip value="a1b2c3d4e5f6a7b8c9d0" />);

    expect(markup).toContain('data-chip-copy=""');
    expect(markup).toContain('after:inset-0');
  });

  test('a copyable chip keeps the full value as text and the button as its only control', () => {
    const markup = html(<IdChip value="abc123" />);

    expect(markup).toContain('>abc123<');
    expect(markup.match(/<button/g)?.length).toBe(1);
  });

  // A scaled button becomes the containing block of its ::after, which then
  // shrinks to the icon mid-click; a press on the value text would copy nothing.
  // The real press is tested in the WholeChipCopies story.
  test('the copy button never scales on press, with or without reduced motion', () => {
    const markup = html(<IdChip value="a1b2c3d4e5f6a7b8c9d0" />);
    const buttonClass = markup.match(/<button[^>]*class="([^"]*)"/)?.[1].split(' ') ?? [];

    expect(buttonClass).toContain('active:scale-none');
    expect(buttonClass).toContain('motion-reduce:active:scale-none');
    expect(buttonClass).not.toContain('active:scale-[0.97]');
    expect(buttonClass).not.toContain('motion-reduce:active:scale-100');
  });

  test('reveal="row" hides the fill and the copy icon until the row is hovered or focused', () => {
    const markup = html(<IdChip value="L2201516" truncate="none" reveal="row" />);

    expect(markup).toContain('data-reveal="row"');
    expect(markup).toContain('bg-transparent');
    expect(markup).toContain('group-hover/row:bg-muted');
    expect(markup).toContain('group-has-[:focus-visible]/row:[&amp;_[data-chip-copy]]:opacity-100');
  });

  test('a chip shows by default', () => {
    expect(html(<IdChip value="L2201516" />)).not.toContain('data-reveal');
  });

  test('a non-copyable chip has no whole-chip copy target', () => {
    expect(html(<IdChip value="abc123" copyable={false} />)).not.toContain('data-chip-copy=""');
  });
});
