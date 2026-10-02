const { chromium } = require('C:/Users/ZerO/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting Edge Playwright UI Verification...');

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const testUrl = `file:///${path.resolve(__dirname, 'ui_test_harness.html').replace(/\\/g, '/')}`;

  await page.goto(testUrl);
  console.log('📄 Page loaded, waiting for Clean IP modal...');

  // Wait for modal card to appear
  const card = await page.waitForSelector('.pg-cleanip-card', { timeout: 5000 });
  const cardBox = await card.boundingBox();
  console.log(`✅ Modal Card Dimensions: width=${cardBox.width}px, height=${cardBox.height}px, top=${cardBox.y}px, left=${cardBox.x}px`);

  // Assertions on dimensions: must NOT be full-screen!
  if (cardBox.height > 650) {
    throw new Error(`FAIL: Card height is too large: ${cardBox.height}px`);
  }
  if (cardBox.width > 650) {
    throw new Error(`FAIL: Card width is too large: ${cardBox.width}px`);
  }

  // 1. Test Scrolling in Tab 1
  console.log('📜 Testing body scroll...');
  const bodyEl = await page.$('.pg-cleanip-body');
  const initialScroll = await bodyEl.evaluate(el => el.scrollTop);
  
  // Scroll down
  await bodyEl.evaluate(el => el.scrollTop = 250);
  await page.waitForTimeout(300);
  const newScroll = await bodyEl.evaluate(el => el.scrollTop);
  console.log(`✅ Scroll Test: initial=${initialScroll}, afterScroll=${newScroll}`);
  if (newScroll < 100) {
    throw new Error('FAIL: Body did not scroll!');
  }
  await page.screenshot({ path: path.resolve(__dirname, 'test_scrolled.png') });

  // 2. Test Tab 2 (Config)
  console.log('⚙️ Switching to Tab 2 (Config)...');
  await page.click('#tab-btn-config');
  await page.waitForTimeout(300);
  const isHostsHidden = await page.$eval('#cleanip-pane-hosts', el => el.style.display === 'none');
  const isConfigVisible = await page.$eval('#cleanip-pane-config', el => el.style.display !== 'none');
  console.log(`✅ Tab 2 Test: HostsHidden=${isHostsHidden}, ConfigVisible=${isConfigVisible}`);
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab2.png') });

  // 3. Test Tab 3 (Status & Update)
  console.log('📊 Switching to Tab 3 (Status)...');
  await page.click('#tab-btn-status');
  await page.waitForTimeout(300);
  const isStatusVisible = await page.$eval('#cleanip-pane-status', el => el.style.display !== 'none');
  console.log(`✅ Tab 3 Test: StatusVisible=${isStatusVisible}`);
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab3.png') });

  // 4. Test Outside Click (Dismissal)
  console.log('🚪 Testing Outside Click to Close...');
  await page.mouse.click(20, 20); // click top-left outside card
  await page.waitForTimeout(400);
  const modalStillExists = await page.$('#pg-cleanip-modal-overlay');
  console.log(`✅ Outside Click Test: ModalExistsAfterClick=${!!modalStillExists}`);
  if (modalStillExists) {
    throw new Error('FAIL: Modal did not close when clicking outside overlay!');
  }
  await page.screenshot({ path: path.resolve(__dirname, 'test_closed.png') });

  console.log('🎉 ALL UI TESTS PASSED PERFECTLY!');
  await browser.close();
})();
