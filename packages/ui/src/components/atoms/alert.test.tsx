import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertAction, AlertDescription } from './alert.tsx';

// An absolutely positioned action covers any sentence that runs under it. The
// layout itself is checked by the play tests in stories/alert.stories.tsx.
describe('AlertAction', () => {
  test('is not absolutely positioned', () => {
    const html = renderToStaticMarkup(
      <Alert>
        <AlertDescription>The deployment list is out of date.</AlertDescription>
        <AlertAction>Retry</AlertAction>
      </Alert>,
    );
    const tag = html.match(/<div[^>]*data-slot="alert-action"[^>]*>/)?.[0];
    expect(tag).toBeDefined();
    expect(tag).not.toContain('absolute');
  });
});
