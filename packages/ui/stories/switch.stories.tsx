import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Switch } from '../src/components/atoms/switch.tsx';
import { Button } from '../src/components/atoms/button.tsx';
import { Label } from '../src/components/atoms/label.tsx';

const meta = {
  title: 'Atoms/Forms/Switch',
  component: Switch,
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 'aria-label': 'Airplane mode' },
};

export const Checked: Story = {
  args: { 'aria-label': 'Airplane mode', defaultChecked: true },
};

export const Small: Story = {
  args: { 'aria-label': 'Airplane mode', size: 'sm' },
};

export const SmallChecked: Story = {
  args: { 'aria-label': 'Airplane mode', size: 'sm', defaultChecked: true },
};

export const Disabled: Story = {
  args: { 'aria-label': 'Airplane mode', disabled: true },
};

export const DisabledChecked: Story = {
  args: { 'aria-label': 'Airplane mode', disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane-mode" aria-label="Airplane Mode" />
      <Label htmlFor="airplane-mode">Airplane Mode</Label>
    </div>
  ),
};

type Theme = 'light' | 'dark';

/** Renders the children once in light and once in dark, side by side. */
function LightAndDark({ children }: { children: (theme: Theme) => ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} className={theme === 'dark' ? 'dark' : undefined}>
          <div className="bg-background text-foreground flex flex-col gap-4 rounded-lg border p-6">
            <p className="text-sm font-medium">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children(theme)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Unchecked, checked and invalid, in light and dark. The unchecked track uses
 * the control-border slot. Pinned to the light page theme.
 */
export const States: Story = {
  globals: { theme: 'light' },
  render: () => (
    <LightAndDark>
      {(theme) => (
        <div className="flex items-center gap-6">
          <Switch aria-label={`Unchecked, ${theme}`} />
          <Switch aria-label={`Checked, ${theme}`} defaultChecked />
          <Switch aria-label={`Invalid, ${theme}`} aria-invalid />
          <Switch aria-label={`Small, ${theme}`} size="sm" />
        </div>
      )}
    </LightAndDark>
  ),
};

/**
 * Toggling slides the thumb with `--ease-out` and fades the track colour;
 * pressing stretches the thumb toward the middle of the track (`--ease-press`),
 * which the preview shows with a real mouse down. Under reduced motion the
 * thumb jumps and does not stretch, and only colours fade. Nothing plays on
 * first render.
 */
export const Toggle: Story = {
  args: { 'aria-label': 'Airplane mode' },
  play: async ({ canvasElement, step }) => {
    const control = within(canvasElement).getByRole('switch', { name: 'Airplane mode' });
    const thumb = control.querySelector('[data-slot="switch-thumb"]') as HTMLElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const running = () => control.getAnimations({ subtree: true });
    const settled = async () => {
      for (const animation of running()) animation.finish();
      await waitFor(() => expect(running()).toHaveLength(0));
    };
    // How far the thumb sits from the track's start edge, border included.
    const offset = () => thumb.getBoundingClientRect().left - control.getBoundingClientRect().left;
    const moves = () =>
      running().some((animation) => (animation as CSSTransition).transitionProperty === 'translate');

    await step('nothing is running on first render', async () => {
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(running()).toHaveLength(0);
      await expect(offset()).toBeCloseTo(1, 0);
    });

    await step('a press response is set up: the thumb stretches from its resting side', async () => {
      await expect(getComputedStyle(thumb).transformOrigin.split(' ')[0]).toBe('0px');
      await expect(getComputedStyle(thumb).transitionProperty).toContain('scale');
    });

    await step('toggling on slides the thumb, or jumps under reduced motion', async () => {
      await userEvent.click(control);
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(moves()).toBe(!reduced);
      await settled();
      await expect(offset()).toBeCloseTo(15, 0);
      // Checked, the thumb rests on the right and stretches from there.
      await expect(getComputedStyle(thumb).transformOrigin.split(' ')[0]).toBe('16px');
    });

    await step('Space toggles back with the same motion', async () => {
      control.focus();
      await userEvent.keyboard(' ');
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(moves()).toBe(!reduced);
      await settled();
      await expect(offset()).toBeCloseTo(1, 0);
    });

    await step('a fast toggle twice reverses from where the thumb is', async () => {
      if (reduced) return;
      await userEvent.click(control);
      const [slide] = running().filter((animation) => (animation as CSSTransition).transitionProperty === 'translate');
      if (!slide) throw new Error('the thumb is not sliding');
      slide.pause();
      slide.currentTime = 60;
      await userEvent.click(control);
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await settled();
      await expect(offset()).toBeCloseTo(1, 0);
    });
  },
};

/** With reduced motion emulated the thumb has no slide or stretch. */
export const ReducedMotion: Story = {
  args: { 'aria-label': 'Airplane mode', defaultChecked: true },
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector('[data-slot="switch-thumb"]') as HTMLElement;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    await expect(getComputedStyle(thumb).transitionProperty).not.toMatch(/translate|scale/);
  },
};

/**
 * A button outside the Switch flips `checked`, like data that loads after
 * render, a form reset or another control would. The thumb jumps to its new
 * place with no motion. A click or Space on the Switch itself still slides it.
 */
export const SetFromCode: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-4">
        <Switch aria-label="Airplane mode" checked={checked} onCheckedChange={setChecked} />
        <Button variant="outline" size="sm" onClick={() => setChecked((value) => !value)}>
          Set from code
        </Button>
      </div>
    );
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    const outside = canvas.getByRole('button', { name: 'Set from code' });
    const thumb = control.querySelector('[data-slot="switch-thumb"]') as HTMLElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const running = () => control.getAnimations({ subtree: true });
    const settled = async () => {
      for (const animation of running()) animation.finish();
      await waitFor(() => expect(running()).toHaveLength(0));
    };
    const offset = () => thumb.getBoundingClientRect().left - control.getBoundingClientRect().left;
    const slides = () =>
      running().some((animation) => (animation as CSSTransition).transitionProperty === 'translate');

    await step('a change from code jumps with no transition', async () => {
      await userEvent.click(outside);
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(running()).toHaveLength(0);
      await expect(offset()).toBeCloseTo(15, 0);
      await userEvent.click(outside);
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(running()).toHaveLength(0);
      await expect(offset()).toBeCloseTo(1, 0);
    });

    await step('a click on the Switch slides the thumb', async () => {
      await userEvent.click(control);
      await expect(control).toHaveAttribute('aria-checked', 'true');
      await expect(slides()).toBe(!reduced);
      await settled();
      await expect(offset()).toBeCloseTo(15, 0);
    });

    await step('Space slides it back', async () => {
      control.focus();
      await userEvent.keyboard(' ');
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(slides()).toBe(!reduced);
      await settled();
      await expect(offset()).toBeCloseTo(1, 0);
    });

    await step('a change from code after a user toggle jumps again', async () => {
      await userEvent.click(control);
      await settled();
      await userEvent.click(outside);
      await expect(control).toHaveAttribute('aria-checked', 'false');
      await expect(running()).toHaveLength(0);
      await expect(offset()).toBeCloseTo(1, 0);
    });
  },
};
