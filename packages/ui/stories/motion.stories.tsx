import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';
import { cn } from '../src/lib/utils.ts';

const meta = {
  title: 'Foundations/Motion',
  parameters: {
    docs: {
      description: {
        component:
          'Motion tokens a consumer builds with. The design system ships the tokens only: the page switch line, the pending page state and the log viewer stay in the consumer.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const environments = ['Production', 'Staging'] as const;

function PageSwitchDemo() {
  const [index, setIndex] = useState(0);
  // Counts the switches, so the line and the content remount on each one.
  const [switches, setSwitches] = useState(0);
  const environment = environments[index];
  const switchEnvironment = () => {
    setIndex((i) => (i + 1) % environments.length);
    setSwitches((n) => n + 1);
  };
  return (
    <div className="bg-background flex w-96 flex-col overflow-hidden rounded-xl border">
      <div className="flex h-12 items-center justify-between border-b px-4">
        <p className="text-sm font-medium">{environment}</p>
        <Button variant="outline" size="sm" onClick={switchEnvironment}>
          Switch environment
        </Button>
      </div>
      <div className="relative">
        {switches > 0 && (
          <span
            key={switches}
            data-testid="switch-line"
            aria-hidden="true"
            className="animate-page-switch-line pointer-events-none absolute inset-x-0 -top-px h-0.5 origin-left bg-linear-to-r from-transparent to-brand motion-reduce:hidden rtl:origin-right rtl:bg-linear-to-l"
          />
        )}
      </div>
      <div
        key={switches}
        data-testid="page"
        className={cn(
          'flex flex-col gap-3 p-4',
          switches > 0 && 'animate-page-reload motion-reduce:animate-page-reload-fade',
        )}
      >
        <div className="bg-card flex flex-col gap-1 rounded-xl border p-4">
          <p className="text-style-card-title">{environment}</p>
          <p className="text-muted-foreground text-sm">3 deployments, last one 12 minutes ago</p>
        </div>
      </div>
    </div>
  );
}

/**
 * A page that switches its content in place (the environment switch). The
 * new content comes back with `animate-page-reload`: from 35% opacity, a 3px
 * blur and a 3px drop (opacity 240ms, blur and position 280ms, on `ease-out`).
 * At the same time a 2px brand line under the top bar grows from the start
 * edge once with `animate-page-switch-line` (`duration-page-switch`, 420ms).
 * With reduced motion the content only fades
 * (`motion-reduce:animate-page-reload-fade`) and the line is hidden.
 */
export const PageSwitch: Story = {
  render: () => <PageSwitchDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Switch environment' }));
    await expect(canvas.getAllByText('Staging')).not.toHaveLength(0);
    const page = canvas.getByTestId('page');
    const line = canvas.getByTestId('switch-line');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(getComputedStyle(page).animationName).toBe(
      reducedMotion ? 'page-reload-fade' : 'page-reload-fade, page-reload-settle',
    );
    await expect(getComputedStyle(line).display).toBe(reducedMotion ? 'none' : 'block');
    if (!reducedMotion) await expect(getComputedStyle(line).animationName).toBe('page-switch-line');
  },
};

const lines = [
  'Server started on port 3000',
  'GET /shop-api 200 18ms',
  'Worker job finished in 212ms',
  'GET /admin-api 200 24ms',
  'Worker job finished in 198ms',
];

function MatchFlashDemo() {
  const [current, setCurrent] = useState(-1);
  const list = useRef<HTMLDivElement>(null);
  const matches = lines.flatMap((line, i) => (line.includes('Worker') ? [i] : []));
  const next = () => {
    const at = matches[(matches.indexOf(current) + 1) % matches.length] ?? -1;
    setCurrent(at);
    const line = list.current?.children[at] as HTMLElement | undefined;
    if (!line) return;
    // Restart the flash on a line that flashed before.
    line.removeAttribute('data-flash');
    void line.offsetWidth;
    line.setAttribute('data-flash', '');
  };
  return (
    <div className="flex w-96 flex-col gap-4">
      <Button variant="outline" className="self-start" onClick={next}>
        Next match for “Worker”
      </Button>
      <div ref={list} className="bg-card rounded-xl border py-2 font-mono text-xs">
        {lines.map((line, i) => (
          <div
            key={line}
            data-current={i === current ? '' : undefined}
            className="data-flash:animate-match-flash data-current:bg-brand-indicator/14 data-current:shadow-[inset_2px_0_0_var(--brand-indicator)] px-4 py-0.5"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A new search match flashes once with `animate-match-flash`: a bar and a
 * fill in the highlight colour hold, then fade out. It moves nothing, so it
 * also runs with reduced motion. The current match keeps its own static
 * highlight. Set `--match-flash-color` for another tone.
 */
export const MatchFlash: Story = {
  render: () => <MatchFlashDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Next match/ }));
    const line = canvas.getByText('Worker job finished in 212ms');
    await expect(line).toHaveAttribute('data-flash');
    await expect(getComputedStyle(line).animationName).toBe('match-flash');
    await expect(line).toHaveAttribute('data-current');
  },
};
