const { chromium } = require('C:/Users/ZerO/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright');
const path = require('path');

(async () => {
  console.log('🔍 Testing All Tabs (Tab 1, Tab 2, Tab 3)...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const testUrl = `file:///${path.resolve(__dirname, 'ui_test_harness.html').replace(/\\/g, '/')}`;

  await page.goto(testUrl);
  await page.waitForSelector('.pg-cleanip-card', { timeout: 5000 });

  // 1. Screenshot Tab 1
  await page.screenshot({ path: path.resolve(__dirname, 'repro_tab1.png') });
  console.log('📸 Captured repro_tab1.png');

  // 2. Screenshot Tab 2 (with candidate rows)
  await page.click('#tab-btn-ping');
  await page.waitForSelector('.pg-cleanip-ip-row', { timeout: 5000 });
  await page.screenshot({ path: path.resolve(__dirname, 'repro_tab2.png') });
  console.log('📸 Captured repro_tab2.png');

  // 3. Screenshot Tab 3
  await page.click('#tab-btn-config');
  await page.waitForSelector('#cleanip-run-diag-btn', { timeout: 5000 });
  await page.screenshot({ path: path.resolve(__dirname, 'repro_tab3.png') });
  console.log('📸 Captured repro_tab3.png');

  await browser.close();
})();
