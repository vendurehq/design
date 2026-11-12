import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../src/components/atoms/button.tsx';

const meta = {
  title: 'Foundations/Motion',
  parameters: {
    docs: {
      description: {
        component:
          'Motion tokens a consumer builds with. The design system ships the tokens only: the pending page state and the log viewer stay in the consumer.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Reads a duration token in milliseconds, so a script waits as long as the CSS.
function tokenMs(name: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
}

const environments = ['Production', 'Staging'] as const;

function PageSwitchDemo() {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(false);
  const environment = environments[index];
  const switchEnvironment = () => {
    setPending(true);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % environments.length);
      setPending(false);
    }, tokenMs('--transition-duration-page-switch'));
  };
  return (
    <div className="flex w-96 flex-col gap-4">
      <Button variant="outline" className="self-start" disabled={pending} onClick={switchEnvironment}>
        Switch environment
      </Button>
      <div
        data-testid="page"
        data-pending={pending ? '' : undefined}
        aria-busy={pending}
        className="transition-opacity duration-normal ease-soft data-pending:opacity-50"
      >
        <div
          key={environment}
          className="bg-card animate-page-enter motion-reduce:animate-page-fade flex flex-col gap-1 rounded-xl border p-4"
        >
          <p className="text-style-card-title">{environment}</p>
          <p className="text-muted-foreground text-sm">3 deployments, last one 12 minutes ago</p>
        </div>
      </div>
    </div>
  );
}

/**
 * A page that switches its content in place. The page dims for
 * `duration-page-switch` (420ms), then the new content enters with
 * `animate-page-enter` (`motion-reduce:animate-page-fade` with reduced motion).
 */
export const PageSwitch: Story = {
  render: () => <PageSwitchDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = canvas.getByTestId('page');
    await userEvent.click(canvas.getByRole('button', { name: 'Switch environment' }));
    await expect(page).toHaveAttribute('data-pending');
    await waitFor(() => expect(canvas.getByText('Staging')).toBeInTheDocument(), { timeout: 2000 });
    await expect(page).not.toHaveAttribute('data-pending');
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
