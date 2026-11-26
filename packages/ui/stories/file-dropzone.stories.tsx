import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { FileDropzone } from '../src/components/molecules/file-dropzone.tsx';
import { FormatProvider } from '../src/components/molecules/format-provider.tsx';

const meta = {
  title: 'Molecules/FileDropzone',
  component: FileDropzone,
} satisfies Meta<typeof FileDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageField: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="max-w-xl">
        <FileDropzone
          value={files}
          onValueChange={setFiles}
          label="Plugin icon"
          description="Square PNG, JPG, WebP, GIF, or SVG. Maximum 2 MB."
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          maxSize={2 * 1024 ** 2}
          validateFile={(file) =>
            file.name.toLowerCase().endsWith('.svg') || file.type.startsWith('image/')
              ? undefined
              : 'Choose an image file.'
          }
        />
      </div>
    );
  },
};

export const MultipleDocuments: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="max-w-xl">
        <FileDropzone
          multiple
          maxFiles={4}
          value={files}
          onValueChange={setFiles}
          label="Product documents"
          description="Add up to four PDF files."
          accept="application/pdf,.pdf"
        />
      </div>
    );
  },
};

/** Without `value`, the dropzone lists the files it receives. */
export const Uncontrolled: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="max-w-xl">
      <FileDropzone multiple label="Product documents" accept="application/pdf,.pdf" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error('The file input is missing.');
    await expect(canvas.queryByText('spec-sheet.pdf')).toBeNull();
    await userEvent.upload(input, new File(['pdf'], 'spec-sheet.pdf', { type: 'application/pdf' }));
    await expect(await canvas.findByText('spec-sheet.pdf')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove spec-sheet.pdf' }));
    await expect(canvas.queryByText('spec-sheet.pdf')).toBeNull();
  },
};

const pdf = (name: string, size = 3) =>
  new File(['x'.repeat(size)], name, { type: 'application/pdf' });

function fileInput(canvasElement: HTMLElement) {
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error('The file input is missing.');
  return input;
}

/** Each rejection text in English: type, size and file count. */
export const RejectionTexts: Story = {
  tags: ['!autodocs'],
  render: () => (
    <div className="max-w-xl">
      <FileDropzone multiple maxFiles={3} maxSize={2048} accept="application/pdf,.pdf" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = fileInput(canvasElement);
    // `applyAccept: false` keeps user-event from dropping notes.txt before the component sees it.
    await userEvent.setup({ applyAccept: false }).upload(input, [
      new File(['a'], 'notes.txt', { type: 'text/plain' }),
      pdf('big.pdf', 4096),
      pdf('one.pdf'),
      pdf('two.pdf'),
    ]);
    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent('notes.txt: This file type is not accepted.');
    await expect(alert).toHaveTextContent('big.pdf: File size must be 2 KB or smaller.');
    await expect(alert).toHaveTextContent('two.pdf: You can select up to 3 files.');
    // Removing a file clears the rejections, so the a11y scan sees the settled field.
    await userEvent.click(canvas.getByRole('button', { name: 'Remove one.pdf' }));
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};

/** The same texts and sizes in French, from `messages` and the locale. */
export const FrenchTexts: Story = {
  tags: ['!autodocs'],
  render: () => (
    <FormatProvider
      locale="fr-FR"
      messages={{
        fileDropzone: {
          typeNotAccepted: "Ce type de fichier n'est pas accepté.",
          fileTooLarge: 'La taille doit être de {size} ou moins.',
          accepted: 'Acceptés :',
          remove: 'Retirer {name}',
          byte: 'o',
          kilobyte: 'Ko',
          megabyte: 'Mo',
        },
      }}
    >
      <div className="max-w-xl">
        <FileDropzone
          multiple
          maxSize={1.5 * 1024 ** 2}
          accept="application/pdf,.pdf"
          defaultValue={[pdf('fiche.pdf', 2.5 * 1024 ** 2)]}
        />
      </div>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Acceptés : application/pdf,.pdf')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Retirer fiche.pdf' })).toBeVisible();
    await userEvent.upload(fileInput(canvasElement), pdf('lourd.pdf', 2 * 1024 ** 2));
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'lourd.pdf: La taille doit être de 1,5 Mo ou moins.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retirer fiche.pdf' }));
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};

/** `labels` wins over `messages`, including the status text while a file is checked. */
export const LabelsProp: Story = {
  tags: ['!autodocs'],
  render: () => (
    <FormatProvider messages={{ fileDropzone: { checking: 'Prüfe Dateien…' } }}>
      <div className="max-w-xl">
        <FileDropzone
          multiple
          maxFiles={1}
          labels={{
            checking: 'Verifying…',
            remove: (name) => `Drop ${name}`,
            tooManyFiles: (max) => `At most ${max}.`,
            validationFailed: 'Check failed.',
          }}
          validateFile={() => new Promise<string>((resolve) => setTimeout(resolve, 600))}
        />
      </div>
    </FormatProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(fileInput(canvasElement), [pdf('a.pdf'), pdf('b.pdf')]);
    await expect(await canvas.findByText('Verifying…')).toBeVisible();
    await expect(await canvas.findByRole('alert')).toHaveTextContent('b.pdf: At most 1.');
    await expect(canvas.getByRole('button', { name: 'Drop a.pdf' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Drop a.pdf' }));
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};
