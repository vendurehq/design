import type { Meta, StoryObj } from '@storybook/react';
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
