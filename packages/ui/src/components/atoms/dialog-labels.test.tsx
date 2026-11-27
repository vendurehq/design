import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { defaultMessages } from '../../lib/format-messages.ts';
import { FormatProvider } from '../molecules/format-provider.tsx';
import { Dialog, DialogFooter } from './dialog.tsx';

// DialogContent, SheetContent and the mobile Sidebar render in a portal, which
// server markup does not draw: their labels are checked by the Storybook play
// tests (Dialog/Sheet `CloseLabel*`, Sidebar `MobileLabels`).
const footer = (node: React.ReactElement) => renderToStaticMarkup(<Dialog open>{node}</Dialog>);

describe('DialogFooter close label', () => {
  test('the Close button reads "Close" by default', () => {
    expect(footer(<DialogFooter showCloseButton />)).toContain('>Close</button>');
  });

  test('reads messages.dialog.close from FormatProvider', () => {
    const markup = footer(
      <FormatProvider messages={{ dialog: { close: 'Fermer' } }}>
        <DialogFooter showCloseButton />
      </FormatProvider>,
    );
    expect(markup).toContain('>Fermer</button>');
  });

  test('closeLabel wins over messages', () => {
    const markup = footer(
      <FormatProvider messages={{ dialog: { close: 'Fermer' } }}>
        <DialogFooter showCloseButton closeLabel="Schließen" />
      </FormatProvider>,
    );
    expect(markup).toContain('>Schließen</button>');
    expect(markup).not.toContain('Fermer');
  });
});

describe('English defaults', () => {
  test('Dialog, Sheet and the mobile Sidebar keep their English texts', () => {
    expect(defaultMessages.dialog.close).toBe('Close');
    expect(defaultMessages.sheet.close).toBe('Close');
    expect(defaultMessages.sidebar.mobileTitle).toBe('Sidebar');
    expect(defaultMessages.sidebar.mobileDescription).toBe('Displays the mobile sidebar.');
  });
});
