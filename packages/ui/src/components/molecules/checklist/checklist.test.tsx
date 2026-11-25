import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { duration, easing } from '@vendure-io/design-tokens';
import { Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag } from '../../../test/slot-tokens.ts';
import { Button } from '../../atoms/button.tsx';
import {
  Checklist,
  type ChecklistHold,
  ChecklistStep,
  ChecklistStepAction,
  ChecklistStepBody,
  ChecklistStepDescription,
  ChecklistStepDetail,
  ChecklistStepGuide,
  ChecklistStepLabel,
  checklistSection,
  reduceChecklistHold,
} from './checklist.tsx';

describe('reduceChecklistHold', () => {
  const none: Record<string, ChecklistHold> = {};

  test('a mouse toggle holds the step until the pointer leaves the row', () => {
    const held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'open',
      input: 'mouse',
    });
    expect(held.a).toEqual({ from: 'open', release: 'pointer' });
    // Still on the row: the checked step shows in the open list.
    expect(checklistSection(true, held.a)).toBe('open');
    // Focus leaving does not release a pointer hold.
    expect(reduceChecklistHold(held, { type: 'focusout', id: 'a' })).toBe(held);
    const released = reduceChecklistHold(held, { type: 'pointerleave', id: 'a' });
    expect(released.a).toBeUndefined();
    expect(checklistSection(true, released.a)).toBe('done');
  });

  test('a pen toggle releases on pointerleave too', () => {
    const held = reduceChecklistHold(none, { type: 'toggle', id: 'a', from: 'open', input: 'pen' });
    expect(reduceChecklistHold(held, { type: 'pointerleave', id: 'a' }).a).toBeUndefined();
  });

  test('a keyboard toggle holds the step until focus leaves the row', () => {
    const held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'open',
      input: 'keyboard',
    });
    expect(held.a).toEqual({ from: 'open', release: 'focus' });
    expect(reduceChecklistHold(held, { type: 'pointerleave', id: 'a' })).toBe(held);
    expect(reduceChecklistHold(held, { type: 'focusout', id: 'a' }).a).toBeUndefined();
  });

  test('a touch toggle holds the step until the pause ends', () => {
    const held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'open',
      input: 'touch',
    });
    expect(held.a).toEqual({ from: 'open', release: 'timer' });
    expect(reduceChecklistHold(held, { type: 'pointerleave', id: 'a' })).toBe(held);
    expect(reduceChecklistHold(held, { type: 'focusout', id: 'a' })).toBe(held);
    expect(reduceChecklistHold(held, { type: 'timer', id: 'a' }).a).toBeUndefined();
  });

  test('checking and unchecking before leaving cancels the move', () => {
    let held = reduceChecklistHold(none, { type: 'toggle', id: 'a', from: 'open', input: 'mouse' });
    // The second toggle sees the step in the open list still, and keeps it there.
    held = reduceChecklistHold(held, { type: 'toggle', id: 'a', from: 'done', input: 'mouse' });
    expect(held.a?.from).toBe('open');
    held = reduceChecklistHold(held, { type: 'pointerleave', id: 'a' });
    // Unchecked again: back in the open list, where it was. No move.
    expect(checklistSection(false, held.a)).toBe('open');
  });

  test('unchecking a step in Completed holds it there until the pointer leaves', () => {
    const held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'done',
      input: 'mouse',
    });
    expect(checklistSection(false, held.a)).toBe('done');
    const released = reduceChecklistHold(held, { type: 'pointerleave', id: 'a' });
    expect(checklistSection(false, released.a)).toBe('open');
  });

  test('a cancelled uncheck in Completed stays there', () => {
    let held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'done',
      input: 'keyboard',
    });
    held = reduceChecklistHold(held, { type: 'toggle', id: 'a', from: 'open', input: 'keyboard' });
    held = reduceChecklistHold(held, { type: 'focusout', id: 'a' });
    expect(checklistSection(true, held.a)).toBe('done');
  });

  test('events for other steps leave the holds alone', () => {
    const held = reduceChecklistHold(none, {
      type: 'toggle',
      id: 'a',
      from: 'open',
      input: 'mouse',
    });
    expect(reduceChecklistHold(held, { type: 'pointerleave', id: 'b' })).toBe(held);
  });

  test('a step without a hold shows where its state puts it', () => {
    expect(checklistSection(true, undefined)).toBe('done');
    expect(checklistSection(false, undefined)).toBe('open');
  });
});

function steps(states: Record<string, boolean>) {
  return Object.entries(states).map(([id, done]) => (
    <ChecklistStep key={id} id={id} done={done}>
      <ChecklistStepLabel>Step {id}</ChecklistStepLabel>
      <ChecklistStepAction>
        <Button size="sm">Do {id}</Button>
      </ChecklistStepAction>
    </ChecklistStep>
  ));
}

/** The markup of the list with the given slot, up to its closing tag. */
function list(html: string, slot: string): string {
  const start = html.indexOf(slotTag(html, slot));
  return html.slice(start, html.indexOf('</ul>', start));
}

describe('Checklist', () => {
  test('the title names the region, the list and the progress bar', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Set up your project">{steps({ a: false })}</Checklist>,
    );
    const root = slotTag(html, 'checklist');
    expect(root).toContain('role="region"');
    const titleId = slotTag(html, 'checklist-title').match(/id="([^"]+)"/)?.[1];
    expect(titleId).toBeTruthy();
    expect(slotTag(html, 'checklist').includes(`aria-labelledby="${titleId}"`)).toBe(true);
    expect(slotTag(html, 'checklist-steps').includes(`aria-labelledby="${titleId}"`)).toBe(true);
    expect(slotTag(html, 'checklist-progress').includes(`aria-labelledby="${titleId}"`)).toBe(true);
  });

  test('the count reads "done of total" and the bar says the same', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup">{steps({ a: true, b: false, c: true })}</Checklist>,
    );
    expect(slotTag(html, 'checklist-count')).toContain('aria-hidden="true"');
    expect(slotTag(html, 'checklist-progress')).toContain('aria-valuetext="2 of 3"');
    // The polite live region is empty on the first render.
    expect(html).toContain('<span role="status" class="sr-only"></span>');
  });

  test('open steps sit in the list, done steps in the Completed group', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup">{steps({ a: true, b: false, c: true })}</Checklist>,
    );
    const open = list(html, 'checklist-steps');
    const completed = list(html, 'checklist-completed-steps');
    expect(open).toContain('Step b');
    expect(open).not.toContain('Step a');
    expect(completed).toContain('Step a');
    expect(completed).toContain('Step c');
  });

  test('the Completed group is a disclosure named by its label', () => {
    const html = renderToStaticMarkup(<Checklist title="Setup">{steps({ a: true })}</Checklist>);
    const trigger = slotTag(html, 'checklist-completed-trigger');
    expect(trigger).toContain('aria-expanded="true"');
    const controls = trigger.match(/aria-controls="([^"]+)"/)?.[1];
    expect(slotTag(html, 'checklist-completed-steps')).toContain(`id="${controls}"`);
    expect(slotTag(html, 'checklist-completed-steps')).toContain('aria-label="Completed"');
  });

  test('a closed Completed group renders no rows', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup" defaultCompletedOpen={false}>
        {steps({ a: true, b: false })}
      </Checklist>,
    );
    expect(slotTag(html, 'checklist-completed-trigger')).toContain('aria-expanded="false"');
    expect(html).not.toContain('Step a');
  });

  test('without done steps there is no Completed group', () => {
    const html = renderToStaticMarkup(<Checklist title="Setup">{steps({ a: false })}</Checklist>);
    expect(html).not.toContain('checklist-completed');
  });

  test('the action shows on open steps only', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup">{steps({ a: true, b: false })}</Checklist>,
    );
    expect(html).toContain('Do b');
    expect(html).not.toContain('Do a');
  });

  test('system mode: a tick, no checkbox, and the state in words', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup">{steps({ a: true, b: false })}</Checklist>,
    );
    expect(html).not.toContain('role="checkbox"');
    expect(slotTag(html, 'checklist-step-tick')).toContain('aria-hidden="true"');
    expect(html).toContain('<span class="sr-only">, done</span>');
    expect(html).toContain('<span class="sr-only">, not done</span>');
  });

  test('manual mode: a checkbox labelled by the step label', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup" mode="manual">
        {steps({ a: false })}
      </Checklist>,
    );
    const control = slotTag(html, 'checklist-step-control');
    expect(control).toContain('role="checkbox"');
    expect(control).toContain('aria-checked="false"');
    const label = slotTag(html, 'checklist-step-label');
    const labelId = label.match(/id="([^"]+)"/)?.[1];
    const controlId = control.match(/ id="([^"]+)"/)?.[1];
    expect(control).toContain(`aria-labelledby="${labelId}"`);
    expect(label.startsWith('<label')).toBe(true);
    expect(label).toContain(`for="${controlId}"`);
  });

  test('manual mode: defaultDone places an uncontrolled step', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup" mode="manual">
        <ChecklistStep id="a" defaultDone>
          <ChecklistStepLabel>Step a</ChecklistStepLabel>
        </ChecklistStep>
      </Checklist>,
    );
    expect(list(html, 'checklist-completed-steps')).toContain('Step a');
    expect(slotTag(html, 'checklist-step-control')).toContain('aria-checked="true"');
  });

  test('the dismiss button shows only when every step is done and onDismiss is set', () => {
    const dismiss = () => {};
    const partial = renderToStaticMarkup(
      <Checklist title="Setup" onDismiss={dismiss}>
        {steps({ a: true, b: false })}
      </Checklist>,
    );
    expect(partial).not.toContain('checklist-dismiss');
    const done = renderToStaticMarkup(
      <Checklist title="Setup" onDismiss={dismiss}>
        {steps({ a: true, b: true })}
      </Checklist>,
    );
    expect(slotTag(done, 'checklist-dismiss')).toContain('aria-label="Dismiss checklist"');
    expect(slotTag(done, 'checklist-progress')).toContain('data-tone="success"');
    const noHandler = renderToStaticMarkup(
      <Checklist title="Setup">{steps({ a: true })}</Checklist>,
    );
    expect(noHandler).not.toContain('checklist-dismiss');
  });

  test('steps in fragments, arrays and conditionals are found; other children are not steps', () => {
    const showC = false;
    const html = renderToStaticMarkup(
      <Checklist title="Setup">
        <Fragment key="ad">
          <ChecklistStep id="a" done={false}>
            <ChecklistStepLabel>Step a</ChecklistStepLabel>
          </ChecklistStep>
          <ChecklistStep id="d" done>
            <ChecklistStepLabel>Step d</ChecklistStepLabel>
          </ChecklistStep>
        </Fragment>
        {[false].map((done) => (
          <ChecklistStep key="b" id="b" done={done}>
            <ChecklistStepLabel>Step b</ChecklistStepLabel>
          </ChecklistStep>
        ))}
        {showC && (
          <ChecklistStep id="c" done={false}>
            <ChecklistStepLabel>Step c</ChecklistStepLabel>
          </ChecklistStep>
        )}
        <p>not a step</p>
      </Checklist>,
    );
    expect(html).toContain('Step a');
    expect(html).toContain('Step b');
    expect(html).toContain('Step d');
    expect(html).not.toContain('Step c');
    expect(html).not.toContain('not a step');
    expect(slotTag(html, 'checklist-progress')).toContain('aria-valuetext="1 of 3"');
  });

  test('the parts render in their slots; body and action leave a done step', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup">
        <ChecklistStep id="a" done={false}>
          <ChecklistStepLabel>Link the project</ChecklistStepLabel>
          <ChecklistStepDescription>Run the command.</ChecklistStepDescription>
          <ChecklistStepDetail>2 min</ChecklistStepDetail>
          <ChecklistStepGuide href="https://docs.example">How linking works</ChecklistStepGuide>
          <ChecklistStepBody>commands</ChecklistStepBody>
        </ChecklistStep>
        <ChecklistStep id="b" done>
          <ChecklistStepLabel>Choose a plan</ChecklistStepLabel>
          <ChecklistStepBody>plan body</ChecklistStepBody>
        </ChecklistStep>
      </Checklist>,
    );
    expect(slotTag(html, 'checklist-step-description')).toBeTruthy();
    expect(slotTag(html, 'checklist-step-detail')).toBeTruthy();
    const guide = slotTag(html, 'checklist-step-guide');
    expect(guide).toContain('target="_blank"');
    expect(guide).toContain('rel="noreferrer"');
    expect(html).toContain('(opens in a new tab)');
    expect(html).toContain('commands');
    expect(html).not.toContain('plan body');
  });

  test('a custom count format and labels', () => {
    const html = renderToStaticMarkup(
      <Checklist
        title="Setup"
        completedLabel="Done"
        formatCount={(done, total) => `${done}/${total}`}
      >
        {steps({ a: true, b: false })}
      </Checklist>,
    );
    expect(slotTag(html, 'checklist-progress')).toContain('aria-valuetext="1/2"');
    expect(slotTag(html, 'checklist-completed-steps')).toContain('aria-label="Done"');
  });

  test('a part outside a Checklist throws', () => {
    expect(() =>
      renderToStaticMarkup(
        <ChecklistStep id="a">
          <ChecklistStepLabel>a</ChecklistStepLabel>
        </ChecklistStep>,
      ),
    ).toThrow('ChecklistStep must be used inside a Checklist.');
  });
});

// checklist.tsx keeps its Motion values as numbers so the ui source needs no
// runtime import of the tokens package. They must match the tokens.
describe('Checklist motion tokens', () => {
  const source = readFileSync(join(import.meta.dir, 'checklist.tsx'), 'utf8');
  const seconds = (token: string) => Number.parseFloat(token) / 1000;
  const curve = (token: string) => `[${token.slice('cubic-bezier('.length, -1)}]`;

  test('the move settles in `slow` with no bounce', () => {
    expect(source).toContain(
      `const MOVE = { type: 'spring', visualDuration: ${seconds(duration.slow)}, bounce: 0 }`,
    );
  });

  test('a fade takes `moderate` on `soft`', () => {
    expect(source).toContain(
      `const FADE = { duration: ${seconds(duration.moderate)}, ease: ${curve(easing.soft)} }`,
    );
  });

  test('the Completed height takes `slow` on `height`', () => {
    expect(source).toContain(
      `const HEIGHT = { duration: ${seconds(duration.slow)}, ease: ${curve(easing.height)} }`,
    );
  });
});

describe('Checklist texts', () => {
  test('the step state words and the new-tab note are props', () => {
    const html = renderToStaticMarkup(
      <Checklist title="Setup" stepDoneLabel="erledigt" stepOpenLabel="offen">
        <ChecklistStep id="a" done>
          <ChecklistStepLabel>a</ChecklistStepLabel>
          <ChecklistStepGuide href="https://docs.example" newTabLabel="(neuer Tab)">
            Guide
          </ChecklistStepGuide>
        </ChecklistStep>
        <ChecklistStep id="b" done={false}>
          <ChecklistStepLabel>b</ChecklistStepLabel>
        </ChecklistStep>
      </Checklist>,
    );
    expect(html).toContain('<span class="sr-only">, erledigt</span>');
    expect(html).toContain('<span class="sr-only">, offen</span>');
    expect(html).toContain('(neuer Tab)');
  });

  test('steps on the first render do not replay their strike', () => {
    const html = renderToStaticMarkup(<Checklist title="Setup">{steps({ a: true })}</Checklist>);
    expect(html).not.toContain('data-arrived=""');
  });
});
