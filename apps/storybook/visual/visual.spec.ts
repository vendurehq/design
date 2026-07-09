import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Baselines are only meaningful when captured on the same platform they're compared
// against (font rendering differs across OSes). CI runs on ubuntu, so that's the only
// platform we maintain baselines for. See docs/testing.md for the seeding flow.
test.skip(
  process.platform !== 'linux',
  'Visual regression baselines are Linux-only; run in CI or a Linux container. See docs/testing.md.',
);

interface StorybookIndexEntry {
  type: string;
  id: string;
  title: string;
  name: string;
}

interface StorybookIndex {
  entries: Record<string, StorybookIndexEntry>;
}

const indexPath = path.resolve(dirname, '../storybook-static/index.json');
const index: StorybookIndex = JSON.parse(readFileSync(indexPath, 'utf-8'));
const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

for (const story of stories) {
  test(`${story.title} > ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot(`${story.id}.png`, {
      animations: 'disabled',
    });
  });
}
