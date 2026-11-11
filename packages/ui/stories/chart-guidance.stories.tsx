import type { Meta, StoryObj } from '@storybook/react';
import { Cell, Pie, PieChart } from 'recharts';
import { ChartContainer, type ChartConfig } from '../src/components/atoms/chart.tsx';

/**
 * Guidance, not props. How a chart gets the accessible names of its shapes.
 * For the component API, see the Chart stories.
 */
const meta = {
  title: 'Atoms/Data Display/Chart/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const methods = [
  { method: 'card', value: 540 },
  { method: 'paypal', value: 210 },
  { method: 'invoice', value: 90 },
];

const config = {
  card: { label: 'Card', color: 'var(--chart-1)' },
  paypal: { label: 'PayPal', color: 'var(--chart-2)' },
  invoice: { label: 'Invoice', color: 'var(--chart-3)' },
} satisfies ChartConfig;

function Donut() {
  return (
    <ChartContainer config={config} className="h-40 w-40">
      <PieChart>
        <Pie data={methods} dataKey="value" nameKey="method" innerRadius={36} outerRadius={64}>
          {methods.map((entry) => (
            <Cell
              key={entry.method}
              fill={`var(--color-${entry.method})`}
              aria-label={`${config[entry.method as keyof typeof config].label}: ${entry.value}`}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export const NameEveryShape: Story = {
  name: 'Every chart shape has a name',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <section className="p-4">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">Every chart shape has a name</h2>
      <p className="text-muted-foreground mb-4 max-w-2xl text-sm">
        recharts draws pie slices, radial bars, scatter points, funnel steps, treemap cells and sankey nodes as images,
        and an image needs a name. Chart names each one from what it has: the shape&apos;s name, else the label of the
        config key in its colour. Key the colour to the config (var(--color-card)) and the name is there. Add an
        aria-label on the shape when the name should carry the value too: it always wins.
      </p>
      <div className="grid max-w-xl grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-success-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Do</p>
          <Donut />
          <p className="text-muted-foreground mt-2 text-xs">Colour from the config, aria-label with the value.</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-destructive-subtle-foreground mb-3 text-xs font-semibold tracking-wide uppercase">Don&apos;t</p>
          <pre className="bg-muted text-muted-foreground flex h-40 w-40 items-center overflow-hidden rounded-md p-2 text-xs">
            {'<Cell fill="var(--chart-1)" />'}
          </pre>
          <p className="text-muted-foreground mt-2 text-xs">
            A plain colour and no config entry: Chart has nothing to name the slice from, and the check fails.
          </p>
        </div>
      </div>
    </section>
  ),
};
