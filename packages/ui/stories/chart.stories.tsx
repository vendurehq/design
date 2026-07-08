import type { Meta, StoryObj } from '@storybook/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../src/components/atoms/chart.tsx';

const meta = {
  title: 'Atoms/Data Display/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
  // baseline args to satisfy required props; all stories use render()
  args: { config: {}, children: <div /> },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export const Default: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full max-w-lg">
      <BarChart data={chartData}>
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};

const channelSales = [
  { month: 'Jan', web: 4200, mobile: 2800, marketplace: 1900, b2b: 3400, pos: 1100 },
  { month: 'Feb', web: 4800, mobile: 3100, marketplace: 2100, b2b: 3000, pos: 1300 },
  { month: 'Mar', web: 5200, mobile: 3600, marketplace: 2400, b2b: 3800, pos: 1500 },
  { month: 'Apr', web: 4900, mobile: 3900, marketplace: 2600, b2b: 4100, pos: 1400 },
  { month: 'May', web: 5600, mobile: 4400, marketplace: 2800, b2b: 4600, pos: 1700 },
  { month: 'Jun', web: 6100, mobile: 4800, marketplace: 3200, b2b: 5000, pos: 1900 },
];

const fiveSeriesConfig = {
  web: { label: 'Web', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile App', color: 'var(--chart-2)' },
  marketplace: { label: 'Marketplace', color: 'var(--chart-3)' },
  b2b: { label: 'B2B', color: 'var(--chart-4)' },
  pos: { label: 'In-store POS', color: 'var(--chart-5)' },
} satisfies ChartConfig;

export const StackedBarFiveSeries: Story = {
  name: 'Bar — stacked, 5 channels',
  render: () => (
    <ChartContainer config={fiveSeriesConfig} className="min-h-[320px] w-full max-w-xl">
      <BarChart data={channelSales}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="web" stackId="a" fill="var(--color-web)" />
        <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" />
        <Bar dataKey="marketplace" stackId="a" fill="var(--color-marketplace)" />
        <Bar dataKey="b2b" stackId="a" fill="var(--color-b2b)" />
        <Bar dataKey="pos" stackId="a" fill="var(--color-pos)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
};

export const LineFiveSeries: Story = {
  name: 'Line — 5 categories',
  render: () => (
    <ChartContainer config={fiveSeriesConfig} className="min-h-[320px] w-full max-w-xl">
      <LineChart data={channelSales}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line type="monotone" dataKey="web" stroke="var(--color-web)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="mobile" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="marketplace" stroke="var(--color-marketplace)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="b2b" stroke="var(--color-b2b)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="pos" stroke="var(--color-pos)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  ),
};

export const StackedAreaFiveSeries: Story = {
  name: 'Area — stacked, 5 regions',
  render: () => (
    <ChartContainer config={fiveSeriesConfig} className="min-h-[320px] w-full max-w-xl">
      <AreaChart data={channelSales}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="web" stackId="1" stroke="var(--color-web)" fill="var(--color-web)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="mobile" stackId="1" stroke="var(--color-mobile)" fill="var(--color-mobile)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="marketplace" stackId="1" stroke="var(--color-marketplace)" fill="var(--color-marketplace)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="b2b" stackId="1" stroke="var(--color-b2b)" fill="var(--color-b2b)" fillOpacity={0.4} />
        <Area type="monotone" dataKey="pos" stackId="1" stroke="var(--color-pos)" fill="var(--color-pos)" fillOpacity={0.4} />
      </AreaChart>
    </ChartContainer>
  ),
};

const paymentBreakdown = [
  { method: 'card', value: 4200 },
  { method: 'paypal', value: 1800 },
  { method: 'klarna', value: 1100 },
  { method: 'invoice', value: 900 },
  { method: 'crypto', value: 400 },
];

const paymentConfig = {
  card: { label: 'Card', color: 'var(--chart-1)' },
  paypal: { label: 'PayPal', color: 'var(--chart-2)' },
  klarna: { label: 'Klarna', color: 'var(--chart-3)' },
  invoice: { label: 'Invoice', color: 'var(--chart-4)' },
  crypto: { label: 'Crypto', color: 'var(--chart-5)' },
} satisfies ChartConfig;

export const DonutFiveSlices: Story = {
  name: 'Donut — 5 payment methods',
  render: () => (
    <ChartContainer config={paymentConfig} className="min-h-[320px] w-full max-w-md">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="method" hideLabel />} />
        <Pie
          data={paymentBreakdown}
          dataKey="value"
          nameKey="method"
          innerRadius={60}
          outerRadius={110}
          strokeWidth={2}
        >
          {paymentBreakdown.map((entry) => (
            <Cell key={entry.method} fill={`var(--color-${entry.method})`} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="method" />} />
      </PieChart>
    </ChartContainer>
  ),
};

export const VizPaletteSwatches: Story = {
  name: 'Viz palette — Tailwind utilities',
  parameters: {
    docs: {
      description: {
        story:
          'The `viz` palette is also exposed as Tailwind utility classes (`bg-viz-1`…`bg-viz-5`, `text-viz-N`, `border-viz-N`, `ring-viz-N`) for categorical accents outside chart contexts — tags, calendar events, multi-tenant badges.',
      },
    },
  },
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="grid grid-cols-5 gap-3">
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-md bg-viz-1" aria-label="viz-1 swatch" />
          <code className="text-muted-foreground text-xs">viz-1</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-md bg-viz-2" aria-label="viz-2 swatch" />
          <code className="text-muted-foreground text-xs">viz-2</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-md bg-viz-3" aria-label="viz-3 swatch" />
          <code className="text-muted-foreground text-xs">viz-3</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-md bg-viz-4" aria-label="viz-4 swatch" />
          <code className="text-muted-foreground text-xs">viz-4</code>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-16 w-16 rounded-md bg-viz-5" aria-label="viz-5 swatch" />
          <code className="text-muted-foreground text-xs">viz-5</code>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="bg-viz-1/15 text-viz-1 ring-viz-1/30 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1">
          Tenant Acme
        </span>
        <span className="bg-viz-2/15 text-viz-2 ring-viz-2/30 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1">
          Tenant Globex
        </span>
        <span className="bg-viz-3/15 text-viz-3 ring-viz-3/30 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1">
          Tenant Initech
        </span>
        <span className="bg-viz-4/15 text-viz-4 ring-viz-4/30 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1">
          Tenant Soylent
        </span>
        <span className="bg-viz-5/15 text-viz-5 ring-viz-5/30 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1">
          Tenant Hooli
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="bg-card flex items-center gap-3 rounded-md border-l-4 border-viz-1 px-4 py-3">
          <span className="bg-viz-1 h-2 w-2 rounded-full" />
          <span className="text-sm">Event channel 1</span>
          <span className="text-muted-foreground ml-auto text-xs">14:01</span>
        </div>
        <div className="bg-card flex items-center gap-3 rounded-md border-l-4 border-viz-2 px-4 py-3">
          <span className="bg-viz-2 h-2 w-2 rounded-full" />
          <span className="text-sm">Event channel 2</span>
          <span className="text-muted-foreground ml-auto text-xs">14:02</span>
        </div>
        <div className="bg-card flex items-center gap-3 rounded-md border-l-4 border-viz-3 px-4 py-3">
          <span className="bg-viz-3 h-2 w-2 rounded-full" />
          <span className="text-sm">Event channel 3</span>
          <span className="text-muted-foreground ml-auto text-xs">14:03</span>
        </div>
        <div className="bg-card flex items-center gap-3 rounded-md border-l-4 border-viz-4 px-4 py-3">
          <span className="bg-viz-4 h-2 w-2 rounded-full" />
          <span className="text-sm">Event channel 4</span>
          <span className="text-muted-foreground ml-auto text-xs">14:04</span>
        </div>
        <div className="bg-card flex items-center gap-3 rounded-md border-l-4 border-viz-5 px-4 py-3">
          <span className="bg-viz-5 h-2 w-2 rounded-full" />
          <span className="text-sm">Event channel 5</span>
          <span className="text-muted-foreground ml-auto text-xs">14:05</span>
        </div>
      </div>
    </div>
  ),
};
