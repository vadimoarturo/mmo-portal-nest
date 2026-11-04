import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:3100';
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1, locale: 'en-US', reducedMotion: 'reduce' });
  await page.clock.install({ time: new Date('2026-11-04T07:00:00Z') });
  const samples = [
    { name: 'Aster', job: 100, lv: 170, race: 3, guildName: 'Vanguard', guildIcon: '' },
    { name: 'Lyra', job: 200, lv: 168, race: 4, guildName: 'Starlight', guildIcon: '' },
    { name: 'Orion', job: 300, lv: 165, race: 5, guildName: 'Wayfarers', guildIcon: '' },
  ];
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/top/players') return route.fulfill({ json: samples });
    if (url.pathname === '/api/top/pks' || url.pathname === '/api/top/guilds') return route.fulfill({ json: [] });
    if (url.origin !== origin) return route.abort();
    return route.continue();
  });
  await page.goto(`${origin}/en`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#rank').scrollIntoViewIfNeeded();
  await page.locator('.realm-player-name').first().waitFor();
  assert.equal(await page.locator('.realm-player-name').count(), 3);
  assert.equal((await page.request.get(`${origin}/images/fantasy-hero.webp`)).status(), 200);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => {
    const badge = document.createElement('div');
    badge.textContent = 'DEMO / SAMPLE DATA';
    badge.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:10000;border:1px solid #70e8be55;background:#080e19;color:#70e8be;font:11px monospace;padding:8px 14px;border-radius:8px;letter-spacing:1px';
    document.body.append(badge);
  });
  await mkdir('docs/assets', { recursive: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Desktop page overflows');
  await page.screenshot({ path: 'docs/assets/preview-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile page overflows');
  const table = await page.locator('.realm-table').boundingBox();
  assert.ok(table && table.x >= 0 && table.x + table.width <= 390, 'Ranking table exceeds the mobile viewport');
  await page.screenshot({ path: 'docs/assets/preview-mobile.png', fullPage: true });
  console.log('Saved desktop and mobile previews with synthetic ranking data.');
} finally { await browser.close(); }
