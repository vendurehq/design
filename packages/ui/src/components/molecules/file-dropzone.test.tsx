import { describe, expect, test } from 'bun:test';
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
});
