import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
} from './sidebar.tsx';

// Regression pins for the collapsed-geometry and icon-sizing fixes (PRs #52/#53).
// The assertions target class tokens on the specific rendered element rather than
// raw markup substrings; true geometry regressions are covered by the visual
// suite in apps/storybook.

/** Class tokens of the first element carrying the given data-slot, entity-decoded. */
function classTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .split(/\s+/)
    .filter(Boolean);
}

describe('Sidebar geometry', () => {
  test('does not add another inset margin when collapsed', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>Content</SidebarInset>
      </SidebarProvider>,
    );

    expect(classTokens(html, 'sidebar-inset')).not.toContain('peer-data-[state=collapsed]:ml-2');
  });
});

describe('SidebarMenuButton icons', () => {
  test('styles only the leading navigation icon', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider>
        <SidebarMenuButton>
          <HomeIcon />
          <span>Home</span>
          <ChevronRightIcon />
        </SidebarMenuButton>
      </SidebarProvider>,
    );

    const tokens = classTokens(html, 'sidebar-menu-button');
    expect(tokens).toContain('[&_svg]:size-4');
    expect(tokens).toContain('[&>svg:first-child]:size-4.5');
    expect(tokens).toContain('[&>svg:first-child]:[stroke-width:2.125]');
    expect(tokens).not.toContain('[&_svg]:size-4.5');
  });
});
