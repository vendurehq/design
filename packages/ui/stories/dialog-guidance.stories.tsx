import type { Meta, StoryObj } from '@storybook/react';

/**
 * Guidance, not props. Which `size` a Dialog or a Sheet takes, by the job it
 * does. For the API, see the Dialog and Sheet stories (`Sizes`).
 */
const meta = {
  title: 'Atoms/Overlays/Dialog/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const DIALOG_SIZES = [
  { size: 'default', width: '440px', job: 'A confirmation, or a form of a few short fields.' },
  { size: 'lg', width: '560px', job: 'A form with longer fields, a field group or a short list.' },
  { size: 'xl', width: '800px from 1024px', job: 'A wide form, a table, a tree or a grid of choices.' },
  { size: 'full', width: 'the viewport less 1rem each side', job: 'A picker or a preview that needs all the room.' },
];

const SHEET_SIZES = [
  { size: 'default', width: '512px', job: 'A short form, a filter or a settings list.' },
  { size: 'xl', width: '800px', job: 'A table or a wide form beside the page.' },
];

function SizeTable({ caption, rows }: { caption: string; rows: typeof DIALOG_SIZES }) {
  return (
    <table className="mb-8 w-full max-w-3xl border-collapse text-left text-sm">
      <caption className="mb-2 text-left text-lg font-semibold tracking-tight">{caption}</caption>
      <thead>
        <tr className="border-b">
          <th className="py-2 pe-4 font-medium">size</th>
          <th className="py-2 pe-4 font-medium">Width</th>
          <th className="py-2 font-medium">Job</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.size} className="border-b">
            <td className="py-2 pe-4 font-mono">{row.size}</td>
            <td className="py-2 pe-4">{row.width}</td>
            <td className="text-muted-foreground py-2">{row.job}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Pick the size by the job, not by the content's pixel width. Do not set a
 * `max-w-[…]`, `min-w-[…]` or `w-[…]` class on DialogContent or SheetContent:
 * dialogs that do the same job then open at the same width. Every dialog
 * shrinks to the viewport less 1rem on each side on a small screen; a side
 * sheet is at most 3/4 of the viewport. Top and bottom sheets ignore the size.
 */
export const ChoosingTheSize: Story = {
  render: () => (
    <div>
      <SizeTable caption="DialogContent size" rows={DIALOG_SIZES} />
      <SizeTable caption="SheetContent size (left and right)" rows={SHEET_SIZES} />
    </div>
  ),
};
