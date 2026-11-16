import type { Meta, StoryObj } from '@storybook/react';

// Class strings are static so Tailwind's scanner picks them up.
const displaySteps = [
  {
    name: 'display-xl',
    spec: '60px on 60px',
    use: 'Flagship hero',
    className: 'text-style-display-xl',
  },
  {
    name: 'display-lg',
    spec: '48px on 50px',
    use: 'Page hero',
    className: 'text-style-display-lg',
  },
  {
    name: 'display-md',
    spec: '36px on 38px',
    use: 'Hero on a small screen, large stat or price',
    className: 'text-style-display-md',
  },
  {
    name: 'display-sm',
    spec: '30px on 36px',
    use: 'Section heading',
    className: 'text-style-display-sm',
  },
];

const productSteps = [
  { name: 'page-title', spec: '22px on 26px', className: 'text-style-page-title' },
  { name: 'section-title', spec: '16px', className: 'text-style-section-title' },
  { name: 'card-title', spec: '14px', className: 'text-style-card-title' },
  { name: 'body', spec: '13px on 20px', className: 'text-style-body' },
];

function StepRow({
  name,
  spec,
  use,
  className,
}: {
  name: string;
  spec: string;
  use?: string;
  className: string;
}) {
  return (
    <div className="grid grid-cols-[12rem_1fr] items-baseline gap-6 border-t py-5">
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{spec}</p>
        {use ? <p className="text-muted-foreground text-xs">{use}</p> : null}
      </div>
      <p className={`text-foreground ${className}`}>Ship commerce on your own terms</p>
    </div>
  );
}

function DisplayTypePage() {
  return (
    <div className="bg-background text-foreground max-w-5xl space-y-10 p-6">
      <header>
        <h1 className="text-style-page-title">Display type</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          Display styles set website hero and section headings in Public Sans. Product screens
          never use them; their largest style is page-title. css/fonts loads Public Sans.
        </p>
      </header>
      <section>
        <h2 className="text-style-section-title mb-3">Website: display styles</h2>
        {displaySteps.map((step) => (
          <StepRow key={step.name} {...step} />
        ))}
      </section>
      <section>
        <h2 className="text-style-section-title mb-3">Product: text styles (Inter)</h2>
        {productSteps.map((step) => (
          <StepRow key={step.name} {...step} />
        ))}
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Display Type',
  render: () => <DisplayTypePage />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
  globals: { theme: 'light' },
};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
