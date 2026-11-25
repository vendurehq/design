import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ChoiceCard,
  ChoiceCardBadge,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardGroup,
  ChoiceCardMeta,
  ChoiceCardTitle,
} from './choice-card.tsx';
import { interactiveCardVariants } from './interactive-card.tsx';

const plans = (props: { value?: string; disabled?: boolean } = {}) => (
  <ChoiceCardGroup aria-label="Plan" value={props.value}>
    <ChoiceCard value="starter">
      <ChoiceCardContent>
        <ChoiceCardTitle>Starter</ChoiceCardTitle>
        <ChoiceCardDescription>For one shop</ChoiceCardDescription>
      </ChoiceCardContent>
      <ChoiceCardMeta>€29</ChoiceCardMeta>
    </ChoiceCard>
    <ChoiceCard value="pro" disabled={props.disabled}>
      <ChoiceCardContent>
        <ChoiceCardTitle>
          Pro <ChoiceCardBadge>Current</ChoiceCardBadge>
        </ChoiceCardTitle>
      </ChoiceCardContent>
    </ChoiceCard>
  </ChoiceCardGroup>
);

// The root element of the card for `value`, as rendered.
function cardTag(html: string, text: string) {
  const index = html.indexOf(text);
  const start = html.lastIndexOf('data-slot="choice-card"', index);
  const open = html.lastIndexOf('<', start);
  return html.slice(open, html.indexOf('>', start) + 1);
}

describe('ChoiceCard, single choice', () => {
  test('renders a radiogroup of radio cards', () => {
    const html = renderToStaticMarkup(plans());
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-label="Plan"');
    expect(html.match(/role="radio"/g)).toHaveLength(2);
  });

  test('the selected card is aria-checked and data-checked, the others not', () => {
    const html = renderToStaticMarkup(plans({ value: 'starter' }));
    const starter = cardTag(html, 'Starter');
    const pro = cardTag(html, 'Pro');
    expect(starter).toContain('aria-checked="true"');
    expect(starter).toContain('data-checked');
    expect(pro).toContain('aria-checked="false"');
    expect(pro).toContain('data-unchecked');
  });

  test('a disabled card is aria-disabled and data-disabled', () => {
    const pro = cardTag(renderToStaticMarkup(plans({ disabled: true })), 'Pro');
    expect(pro).toContain('aria-disabled="true"');
    expect(pro).toContain('data-disabled');
  });

  test('a card renders a div, so block content inside it is valid', () => {
    expect(cardTag(renderToStaticMarkup(plans()), 'Starter')).toStartWith('<div');
  });

  test('the indicator is hidden from assistive tech: the role carries the state', () => {
    const html = renderToStaticMarkup(plans());
    expect(html).toMatch(/data-slot="choice-card-indicator" aria-hidden="true"|aria-hidden="true"[^>]*data-slot="choice-card-indicator"/);
  });

  test('the badge sits in the title, apart from the checked state', () => {
    const html = renderToStaticMarkup(plans({ value: 'starter' }));
    expect(html).toContain('data-slot="choice-card-badge"');
    expect(cardTag(html, 'Current')).toContain('aria-checked="false"');
  });
});

describe('ChoiceCard, multiple choice', () => {
  test('renders a group of checkbox cards with the checked ones marked', () => {
    const html = renderToStaticMarkup(
      <ChoiceCardGroup multiple aria-label="Products" value={['shirt']}>
        <ChoiceCard value="shirt">
          <ChoiceCardTitle>Shirt</ChoiceCardTitle>
        </ChoiceCard>
        <ChoiceCard value="hat">
          <ChoiceCardTitle>Hat</ChoiceCardTitle>
        </ChoiceCard>
      </ChoiceCardGroup>,
    );
    expect(html).toContain('role="group"');
    expect(html.match(/role="checkbox"/g)).toHaveLength(2);
    expect(cardTag(html, 'Shirt')).toContain('aria-checked="true"');
    expect(cardTag(html, 'Hat')).toContain('aria-checked="false"');
  });
});

describe('ChoiceCard look', () => {
  test('takes the shared interactive card look', () => {
    const tag = cardTag(renderToStaticMarkup(plans()), 'Starter');
    for (const token of interactiveCardVariants().split(' ').slice(0, 8)) expect(tag).toContain(token);
  });

  test('the shared look draws the design-system ring 2px outside', () => {
    const look = interactiveCardVariants();
    for (const token of [
      'focus-visible:outline-solid',
      'focus-visible:outline-2',
      'focus-visible:outline-offset-2',
      'focus-visible:outline-ring',
    ])
      expect(look).toContain(token);
    expect(look).not.toContain('transition-all');
  });

  test('selected is a primary border and an inset line, never an outline', () => {
    const tag = cardTag(renderToStaticMarkup(plans()), 'Starter');
    expect(tag).toContain('data-checked:border-primary');
    expect(tag).toContain('data-checked:after:shadow-[inset_0_0_0_1px_var(--primary)]');
    expect(tag).not.toMatch(/data-checked:outline/);
  });

  test('the press scale stays still with reduced motion', () => {
    expect(interactiveCardVariants()).toContain('motion-reduce:active:scale-100');
  });

  test('the media variant fills the card with its image', () => {
    const html = renderToStaticMarkup(
      <ChoiceCardGroup multiple aria-label="Assets">
        <ChoiceCard value="a" variant="media" aria-label="Blue shirt">
          <img src="/a.jpg" alt="" />
        </ChoiceCard>
      </ChoiceCardGroup>,
    );
    const tag = cardTag(html, '<img');
    expect(tag).toContain('data-variant="media"');
    expect(tag).toContain('aria-label="Blue shirt"');
    expect(tag).toContain('p-0');
    expect(tag).toContain('[&amp;_img]:object-cover');
  });

  test('raw values stay out of the source', () => {
    const code = readFileSync(join(import.meta.dir, 'choice-card.tsx'), 'utf8');
    expect(code).not.toMatch(/#[0-9a-f]{3,6}\b|oklch\(|rgb\(/i);
  });
});
