import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { slotTag, slotTokens } from '../../test/slot-tokens.ts';
import { interactiveCardVariants } from '../molecules/interactive-card.tsx';
import { Card, CardAction, CardDescription, CardHeader, CardLink, CardTitle } from './card.tsx';

const projectCard = (link: React.ReactNode) =>
  renderToStaticMarkup(
    <Card>
      <CardHeader>
        <CardTitle>{link}</CardTitle>
        <CardDescription>Production · eu-west-1</CardDescription>
        <CardAction>
          <button type="button" aria-label="More actions for Storefront">
            …
          </button>
        </CardAction>
      </CardHeader>
    </Card>,
  );

describe('CardLink', () => {
  test('is a button by default and stretches over the card', () => {
    const html = projectCard(<CardLink onClick={() => {}}>Storefront</CardLink>);
    const link = slotTag(html, 'card-link');
    expect(link.startsWith('<button')).toBe(true);
    expect(link).toContain('type="button"');
    const tokens = slotTokens(html, 'card-link');
    expect(tokens).toContain('after:absolute');
    expect(tokens).toContain('after:inset-0');
    expect(slotTokens(html, 'card')).toContain('has-data-[slot=card-link]:relative');
  });

  test('renders as an anchor through render, without a button type', () => {
    // biome-ignore lint/a11y/useAnchorContent: CardLink injects the label via render
    const html = projectCard(<CardLink render={<a href="/projects/storefront" />}>Storefront</CardLink>);
    const link = slotTag(html, 'card-link');
    expect(link.startsWith('<a')).toBe(true);
    expect(link).toContain('href="/projects/storefront"');
    expect(link).not.toContain('type=');
  });

  test('the accessible name is the title: the description sits outside the link', () => {
    const html = projectCard(<CardLink>Storefront</CardLink>);
    expect(html).toMatch(/<button[^>]*data-slot="card-link"[^>]*>Storefront<\/button>/);
    expect(html).toContain('data-slot="card-description"');
  });

  test('controls inside a linked card are lifted above the stretched link, the link itself is not', () => {
    const tokens = slotTokens(projectCard(<CardLink>Storefront</CardLink>), 'card');
    const lifted = tokens.filter((token) => token.startsWith('[&:has([data-slot=card-link])_:is('));
    expect(lifted.some((token) => token.endsWith(':relative'))).toBe(true);
    expect(lifted.some((token) => token.endsWith(':z-10'))).toBe(true);
    for (const token of lifted) {
      expect(token).toContain('button');
      expect(token).toContain('[data-card-control]');
      expect(token).toContain(':not([data-slot=card-link],');
    }
  });
});

describe('Linked card look', () => {
  test('takes the shared interactive card look, gated on a CardLink', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Card>Body</Card>), 'card');
    for (const token of interactiveCardVariants({ target: 'link' }).split(' ')) expect(tokens).toContain(token);
  });

  test('a card without a link stays static: every state class needs a CardLink', () => {
    const states = interactiveCardVariants({ target: 'link' })
      .split(' ')
      .filter((token) => /hover|active|focus|cursor|relative|transition/.test(token));
    expect(states.length).toBeGreaterThan(0);
    for (const token of states) expect(token).toMatch(/has-(data-\[slot=card-link\]|\[\[data-slot=card-link\])/);
  });

  test('hover darkens the border; press and focus follow the link, not an inner control', () => {
    const look = interactiveCardVariants({ target: 'link' });
    expect(look).toContain('has-data-[slot=card-link]:hover:border-foreground/25');
    expect(look).toContain('has-[[data-slot=card-link]:active:not(:focus-visible)]:scale-[0.995]');
    expect(look).not.toMatch(/(^| )active:/);
  });

  test('draws the design-system ring 2px outside the card while the link has keyboard focus', () => {
    const look = interactiveCardVariants({ target: 'link' });
    for (const token of ['outline-solid', 'outline-2', 'outline-offset-2', 'outline-ring'])
      expect(look).toContain(`has-[[data-slot=card-link]:focus-visible]:${token}`);
    expect(look).not.toContain('ring-[3px]');
    expect(look).not.toContain('transition-all');
  });

  test('the press scale stays still with reduced motion', () => {
    expect(interactiveCardVariants({ target: 'link' })).toContain(
      'motion-reduce:has-[[data-slot=card-link]:active:not(:focus-visible)]:scale-100',
    );
  });

  test('a key press on the focused link does not scale the card, and only the border and scale transition', () => {
    const look = interactiveCardVariants({ target: 'link' });
    const press = look.split(' ').filter((token) => token.includes('scale-['));
    for (const token of press) expect(token).toContain(':active:not(:focus-visible)]');
    expect(look).not.toContain('box-shadow_var');
  });

  test('ChoiceCard keeps the self target', () => {
    expect(interactiveCardVariants()).toBe(interactiveCardVariants({ target: 'self' }));
    expect(interactiveCardVariants()).toContain('focus-visible:outline-ring');
  });
});
