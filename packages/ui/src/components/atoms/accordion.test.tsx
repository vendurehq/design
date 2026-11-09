import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion.tsx';

const render = (open: boolean) =>
  renderToStaticMarkup(
    <Accordion defaultValue={open ? ['a'] : []}>
      <AccordionItem value="a">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );

const classesOf = (tag: string) => tag.match(/class="([^"]*)"/)?.[1]?.split(' ') ?? [];
const slotTag = (html: string, slot: string) =>
  html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';

describe('Accordion', () => {
  test('one chevron turns over when the item opens', () => {
    const html = render(false);
    expect(html.match(/data-slot="accordion-trigger-icon"/g)).toHaveLength(1);
    const chevron = classesOf(slotTag(html, 'accordion-trigger-icon'));
    expect(chevron).toContain('group-aria-expanded/accordion-trigger:rotate-180');
    expect(chevron).not.toContain('hidden');
  });

  test('the chevron turns on the panel timing and its colour on the fill timing', () => {
    const html = render(false);
    const trigger = classesOf(slotTag(html, 'accordion-trigger'));
    const chevron = slotTag(html, 'accordion-trigger-icon');
    const panel = classesOf(slotTag(render(true), 'accordion-content'));
    expect(trigger).toContain('duration-(--transition-duration-fast)');
    expect(trigger).toContain('ease-(--ease-default)');
    expect(chevron).toContain(
      '[transition:rotate_var(--transition-duration-slow)_var(--ease-height),color_var(--transition-duration-fast)_var(--ease-default)]',
    );
    expect(panel).toContain('motion-safe:duration-(--transition-duration-slow)');
    expect(panel).toContain('motion-safe:ease-(--ease-height)');
  });

  test('the chevron sits 2px down, centred on the first 20px line of the title', () => {
    const trigger = classesOf(slotTag(render(false), 'accordion-trigger'));
    expect(trigger).toContain('items-start');
    expect(trigger).toContain('**:data-[slot=accordion-trigger-icon]:size-4');
    expect(trigger).toContain('**:data-[slot=accordion-trigger-icon]:mt-0.5');
  });

  test('a closed trigger fills on hover and does not underline', () => {
    const trigger = classesOf(slotTag(render(false), 'accordion-trigger'));
    expect(trigger).toContain('not-aria-expanded:hover:bg-muted');
    expect(trigger).not.toContain('hover:underline');
  });

  test('the panel eases with transitions, not keyframes, so a second click reverses it', () => {
    const panel = classesOf(slotTag(render(true), 'accordion-content'));
    expect(panel).toContain('h-(--accordion-panel-height)');
    expect(panel).toContain('data-starting-style:h-0');
    expect(panel).toContain('data-ending-style:h-0');
    expect(panel.some((c) => c.includes('animate-accordion'))).toBe(false);
  });
});
