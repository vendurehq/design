import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { useState } from 'react';
import { FileDropzone } from '../src/components/molecules/file-dropzone.tsx';

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
