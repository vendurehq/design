import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';
import {
  StepIndicator,
  StepIndicatorContent,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
  type StepState,
} from './step-indicator.tsx';

const STATES: StepState[] = ['done', 'failed', 'running', 'current', 'upcoming'];

function render(
  props: { orientation?: 'horizontal' | 'vertical'; marker?: 'number' | 'icon' } = {},
  states: StepState[] = STATES,
) {
  return renderToStaticMarkup(
    <StepIndicator aria-label="Deployment steps" {...props}>
      {states.map((state) => (
        <StepIndicatorStep key={state} state={state}>
          <StepIndicatorTitle>{`Step ${state}`}</StepIndicatorTitle>
          <StepIndicatorDescription>12s</StepIndicatorDescription>
        </StepIndicatorStep>
      ))}
    </StepIndicator>,
  );
}

/** The `<li>` of each step, in order. */
function steps(html: string): string[] {
  return html
    .split('<li')
    .slice(1)
    .map((part) => `<li${part.split('</li>')[0]}`);
}

describe('StepIndicator', () => {
  test('an ordered list of steps, named by its aria-label, that counts its steps', () => {
    const html = render();
    const root = slotTag(html, 'step-indicator');
    expect(root.startsWith('<ol')).toBe(true);
    expect(root).toContain('aria-label="Deployment steps"');
    expect(root).toContain('data-orientation="horizontal"');
    expect(tagTokens(root)).toContain('[counter-reset:step]');
    // Nothing is marked ready on the server, so no entrance plays on load.
    expect(root).not.toContain('data-ready');
    expect(steps(html)).toHaveLength(STATES.length);
    expect(tagTokens(slotTag(html, 'step-indicator-step'))).toContain('[counter-increment:step]');
  });

  test('aria-current="step" marks the current and the running step only', () => {
    const html = render();
    for (const li of steps(html)) {
      const state = li.match(/data-state="(\w+)"/)?.[1];
      const current = state === 'current' || state === 'running';
      expect(li.includes('aria-current="step"')).toBe(current);
    }
  });

  test('each state is said in words after the title, not by colour alone', () => {
    const html = render();
    expect(html).toContain('Step done<span class="sr-only">, done</span>');
    expect(html).toContain('Step failed<span class="sr-only">, failed</span>');
    expect(html).toContain('Step running<span class="sr-only">, in progress</span>');
    expect(html).toContain('Step current<span class="sr-only">, current step</span>');
    expect(html).toContain('Step upcoming<span class="sr-only">, not started</span>');
  });

  test('the state words can be translated', () => {
    const html = renderToStaticMarkup(
      <StepIndicator stateLabels={{ done: 'erledigt' }}>
        <StepIndicatorStep state="done">
          <StepIndicatorTitle>Konto</StepIndicatorTitle>
        </StepIndicatorStep>
      </StepIndicator>,
    );
    expect(html).toContain('<span class="sr-only">, erledigt</span>');
  });

  test('markers and bars are hidden from screen readers', () => {
    const html = render();
    expect(slotTag(html, 'step-indicator-marker')).toContain('aria-hidden');
    expect(slotTag(html, 'progress')).toContain('aria-hidden');
    const markers = html.match(/data-slot="step-indicator-marker"/g) ?? [];
    expect(markers).toHaveLength(STATES.length);
  });

  test('only the running step spins', () => {
    for (const marker of ['number', 'icon'] as const) {
      const spinning = steps(render({ marker })).filter((li) => li.includes('animate-spin-slow'));
      expect(spinning).toHaveLength(1);
      expect(spinning[0]).toContain('data-state="running"');
      expect(spinning[0]).toContain('motion-reduce:animate-none');
    }
  });

  test('a numbered marker shows the step number until the step is done, running or failed', () => {
    const [done, failed, running, current, upcoming] = steps(render({ marker: 'number' }));
    for (const li of [current, upcoming]) expect(li).toContain('before:content-[counter(step)]');
    for (const li of [done, failed, running]) expect(li).not.toContain('counter(step)');
    // The current step is blue, an upcoming one the input border.
    expect(current).toContain('border-info-text text-info-text');
    expect(upcoming).toContain('border-input text-muted-foreground');
  });

  test('an icon marker shows a tone icon per state, and a plain blue dot on the current step', () => {
    const [done, failed, running, current, upcoming] = steps(render({ marker: 'icon' }));
    expect(done).toContain('lucide-circle-check');
    expect(done).toContain('text-success-text');
    expect(failed).toContain('lucide-circle-x');
    expect(failed).toContain('text-destructive-text');
    expect(running).toContain('lucide-loader');
    expect(running).toContain('text-info-text');
    expect(current).not.toContain('<svg');
    expect(current).toContain('rounded-full bg-info-text');
    expect(upcoming).toContain('lucide-circle-dashed');
    for (const li of [done, failed, running, current, upcoming]) {
      expect(li).not.toContain('counter(step)');
    }
  });

  test('a horizontal step has a bar in its state', () => {
    const [done, failed, running, current, upcoming] = steps(render());
    expect(done).toContain('data-tone="success"');
    expect(failed).toContain('data-tone="critical"');
    // Running and current share the blue tint; only running keeps the band.
    expect(running).toContain('data-tone="progress"');
    expect(running).not.toContain('after:hidden');
    expect(current).toContain('data-tone="progress"');
    expect(current).toContain(']]:after:hidden');
    expect(upcoming).toContain('data-tone="neutral"');
  });

  test('the bars start at their value: no fill grows on the first render', () => {
    const bar = slotTag(render(), 'progress');
    expect(tagTokens(bar)).toContain(
      '[&_[data-slot=progress-indicator]]:starting:scale-x-(--progress-scale,1)!',
    );
  });

  test('a new glyph enters only once the indicator is ready, and fades only under reduced motion', () => {
    const html = render({ marker: 'icon' });
    const tokens = html.match(/class="[^"]*lucide-circle-check[^"]*"/)?.[0] ?? '';
    expect(tokens).toContain('group-data-ready/step-indicator:starting:opacity-0');
    expect(tokens).toContain('motion-safe:group-data-ready/step-indicator:starting:scale-85');
    expect(tokens).toContain('motion-reduce:transition-opacity');
  });

  test('a vertical guide has no bars, a rail between the markers and content under a step', () => {
    const html = renderToStaticMarkup(
      <StepIndicator orientation="vertical">
        <StepIndicatorStep state="done">
          {/* biome-ignore lint/a11y/useHeadingContent: StepIndicatorTitle passes its text to the rendered heading */}
          <StepIndicatorTitle render={<h3 />}>Connect a repository</StepIndicatorTitle>
        </StepIndicatorStep>
        <StepIndicatorStep state="current">
          {/* biome-ignore lint/a11y/useHeadingContent: StepIndicatorTitle passes its text to the rendered heading */}
          <StepIndicatorTitle render={<h3 />}>Deploy</StepIndicatorTitle>
          <StepIndicatorContent>
            <button type="button">Deploy</button>
          </StepIndicatorContent>
        </StepIndicatorStep>
      </StepIndicator>,
    );
    expect(html).not.toContain('data-slot="progress"');
    expect(slotTag(html, 'step-indicator')).toContain('data-orientation="vertical"');
    const step = tagTokens(slotTag(html, 'step-indicator-step'));
    expect(step).toContain('not-last:after:w-px');
    expect(step).toContain('not-last:after:bg-input');
    expect(step).toContain('not-last:after:start-[9.5px]');
    expect(html).toContain('<h3');
    expect(tagTokens(slotTag(html, 'step-indicator-content'))).toContain('col-start-2');
  });
});
