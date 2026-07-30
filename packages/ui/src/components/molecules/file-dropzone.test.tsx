import { describe, expect, spyOn, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileDropzone, fileMatchesAccept, formatFileSize } from './file-dropzone.tsx';

describe('FileDropzone', () => {
  test('matches MIME families, exact MIME types, and extensions', () => {
    const png = new File(['image'], 'store-logo.PNG', { type: 'image/png' });
    expect(fileMatchesAccept(png, 'image/*')).toBe(true);
    expect(fileMatchesAccept(png, 'image/png')).toBe(true);
    expect(fileMatchesAccept(png, '.png')).toBe(true);
    expect(fileMatchesAccept(png, '.svg, application/pdf')).toBe(false);
  });

  test('formats file sizes for guidance and errors', () => {
    expect(formatFileSize(800)).toBe('800 B');
    expect(formatFileSize(2048)).toBe('2 KB');
    expect(formatFileSize(2 * 1024 ** 2)).toBe('2.0 MB');
  });

  test('renders one labelled native input and its drop target', () => {
    const html = renderToStaticMarkup(
      <FileDropzone id="asset" label="Product image" accept="image/*" />,
    );
    expect(html).toContain('type="file"');
    expect(html).toContain('for="asset"');
    expect(html).toContain('data-slot="file-dropzone-target"');
    expect(html).toContain('Accepted: image/*');
  });

  test('two distinct files with identical metadata do not collide on the list key', () => {
    const options = { type: 'image/png', lastModified: 1700000000000 };
    const first = new File(['a'], 'store-logo.png', options);
    const second = new File(['b'], 'store-logo.png', options);
    // React reports duplicate keys through console.error during render.
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    try {
      const html = renderToStaticMarkup(<FileDropzone multiple value={[first, second]} />);
      expect(html.match(/<li/g)).toHaveLength(2);
      const keyWarnings = errorSpy.mock.calls.filter((call) =>
        String(call[0]).includes('same key'),
      );
      expect(keyWarnings).toHaveLength(0);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
