import { describe, expect, spyOn, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FileDropzone, fileMatchesAccept, formatFileSize } from './file-dropzone.tsx';
import { FormatProvider } from './format-provider.tsx';

describe('FileDropzone', () => {
  test('lists its defaultValue when value is not passed', () => {
    const file = new File(['a'], 'spec-sheet.pdf', { type: 'application/pdf' });
    const html = renderToStaticMarkup(<FileDropzone defaultValue={[file]} />);
    expect(html).toContain('spec-sheet.pdf');
  });

  test('value wins over defaultValue, and an explicit empty value stays controlled', () => {
    const file = new File(['a'], 'spec-sheet.pdf', { type: 'application/pdf' });
    expect(renderToStaticMarkup(<FileDropzone value={[]} defaultValue={[file]} />)).not.toContain(
      'spec-sheet.pdf',
    );
    expect(
      renderToStaticMarkup(<FileDropzone value={undefined} defaultValue={[file]} />),
    ).not.toContain('spec-sheet.pdf');
  });

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

  test('the required mark uses the destructive text colour', () => {
    const html = renderToStaticMarkup(<FileDropzone label="Product image" required />);
    expect(html).toContain('<span class="text-destructive-text"> *</span>');
    expect(html).not.toContain('text-destructive"');
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

describe('FileDropzone texts', () => {
  const file = new File(['a'], 'spec-sheet.pdf', { type: 'application/pdf' });
  const german = {
    fileDropzone: {
      accepted: 'Zulässig:',
      remove: '{name} entfernen',
      byte: 'Byte',
      kilobyte: 'KB',
      megabyte: 'MB',
    },
  };

  test('English by default', () => {
    const html = renderToStaticMarkup(<FileDropzone accept="image/*" defaultValue={[file]} />);
    expect(html).toContain('Accepted: image/*');
    expect(html).toContain('aria-label="Remove spec-sheet.pdf"');
    expect(html).toContain('>1 B<');
  });

  test('read from FormatProvider messages', () => {
    const html = renderToStaticMarkup(
      <FormatProvider messages={german}>
        <FileDropzone accept="image/*" defaultValue={[file]} />
      </FormatProvider>,
    );
    expect(html).toContain('Zulässig: image/*');
    expect(html).toContain('aria-label="spec-sheet.pdf entfernen"');
    expect(html).toContain('>1 Byte<');
  });

  test('labels win over FormatProvider messages', () => {
    const html = renderToStaticMarkup(
      <FormatProvider messages={german}>
        <FileDropzone
          accept="image/*"
          defaultValue={[file]}
          labels={{
            accepted: 'Types:',
            remove: (name) => `Drop ${name}`,
            byte: 'bytes',
          }}
        />
      </FormatProvider>,
    );
    expect(html).toContain('Types: image/*');
    expect(html).toContain('aria-label="Drop spec-sheet.pdf"');
    expect(html).toContain('>1 bytes<');
  });
});

describe('formatFileSize', () => {
  test('keeps the English text for every range', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1023)).toBe('1023 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('2 KB');
    expect(formatFileSize(1024 ** 2 - 1)).toBe('1024 KB');
    expect(formatFileSize(1024 ** 2)).toBe('1.0 MB');
    expect(formatFileSize(1.5 * 1024 ** 2)).toBe('1.5 MB');
    expect(formatFileSize(1234.5 * 1024 ** 2)).toBe('1234.5 MB');
  });

  test('formats the number with the locale and takes the unit texts as options', () => {
    expect(formatFileSize(1.5 * 1024 ** 2, { locale: 'de-DE' })).toBe('1,5 MB');
    expect(formatFileSize(2 * 1024 ** 2, { locale: 'fr-FR', units: { megabyte: 'Mo' } })).toBe(
      '2,0 Mo',
    );
    expect(formatFileSize(5, { units: { byte: 'o' } })).toBe('5 o');
  });
});
