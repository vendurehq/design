import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';

import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
} from './sidebar.tsx';

describe('Sidebar geometry', () => {
  test('does not add another inset margin when collapsed', () => {
    const html = renderToStaticMarkup(
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>Content</SidebarInset>
      </SidebarProvider>,
    );

    expect(html).not.toContain('peer-data-[state=collapsed]:ml-2');
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

    expect(html).toContain('[&amp;&gt;svg:first-child]:size-5');
    expect(html).toContain('[&amp;&gt;svg:first-child]:[stroke-width:2.25]');
    expect(html).not.toContain('[&amp;_svg]:size-5');
  });
});
