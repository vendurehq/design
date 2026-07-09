import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { FileDropzone } from '../src/components/molecules/file-dropzone.tsx';

/**
 * Guidance, not props. FileDropzone standardizes choosing and validating local
 * files; upload transport, persistence, and authorization remain app-owned.
 */
const meta = { title: 'Molecules/FileDropzone/Guidance' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export const Boundary: Story = {
  name: '1 · Validate locally, authorize on the server',
  render: () => (
    <div className="max-w-3xl space-y-10">
      <Section title="The component owns the file-input experience">
        <FileDropzone
          label="Product image"
          description="PNG, JPG, or WebP. Maximum 4 MB."
          accept="image/png,image/jpeg,image/webp"
          maxSize={4 * 1024 ** 2}
        />
      </Section>
      <Section title="Keep both boundaries honest">
        <div className="grid gap-3 sm:grid-cols-2">
          <p className="rounded-lg border p-4 text-sm">
            <strong>Do:</strong> mirror server MIME, size, and dimension rules through
            <code className="mx-1">accept</code>, <code className="mx-1">maxSize</code>, and
            <code className="ml-1">validateFile</code>. Revalidate on the server.
          </p>
          <p className="rounded-lg border p-4 text-sm">
            <strong>Don&apos;t:</strong> put S3 calls, API mutations, or authorization in the design
            system. Feed accepted files into the consumer&apos;s own upload flow.
          </p>
        </div>
      </Section>
    </div>
  ),
};
