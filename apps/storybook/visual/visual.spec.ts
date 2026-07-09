import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Capture-only: we screenshot every story and publish the set as a CI artifact
// for manual review. No committed baselines and no pixel-diff gate (for now) —
// so this runs on any platform. See docs/testing.md.

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
const outputDir = path.resolve(dirname, '../visual-output');

for (const story of stories) {
  test(`${story.title} > ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForLoadState('networkidle');
    await page.locator('#storybook-root').screenshot({
      path: path.join(outputDir, `${story.id}.png`),
      animations: 'disabled',
    });
  });
}
