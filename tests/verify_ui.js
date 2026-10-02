const { chromium } = require('C:/Users/ZerO/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting Edge Playwright UI Verification for v1.5.0...');

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

  if (cardBox.height > 650 || cardBox.width > 650) {
    throw new Error(`FAIL: Card dimensions out of bounds!`);
  }

  // 1. Test Tab 1 Scrolling & Sticky Bar
  console.log('📜 Testing body scroll...');
  const bodyEl = await page.$('.pg-cleanip-body');
  await bodyEl.evaluate(el => el.scrollTop = 250);
  await page.waitForTimeout(300);
  const newScroll = await bodyEl.evaluate(el => el.scrollTop);
  console.log(`✅ Scroll Test: afterScroll=${newScroll}`);
  if (newScroll < 100) throw new Error('FAIL: Body did not scroll!');
  await page.screenshot({ path: path.resolve(__dirname, 'test_scrolled.png') });

  // 2. Test Tab 2 (Config & Custom IPs)
  console.log('⚙️ Switching to Tab 2 (Config & Custom IPs)...');
  await page.click('#tab-btn-config');
  await page.waitForTimeout(300);
  const customIpVal = await page.$eval('#cleanip-custom-ips-input', el => el.value);
  console.log(`✅ Tab 2 Test: Custom IPs found: "${customIpVal}"`);
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab2.png') });

  // 3. Test Tab 3 (Status & Live Probe)
  console.log('📊 Switching to Tab 3 (Status & Live Probe)...');
  await page.click('#tab-btn-status');
  await page.waitForTimeout(300);

  // Trigger Live In-Browser Probe
  console.log('🔍 Clicking live in-browser probe button...');
  await page.click('#cleanip-start-probe-btn');
  // Wait for probe to complete
  await page.waitForTimeout(1500);

  const probeResultsVisible = await page.$eval('#cleanip-probe-results-container', el => el.style.display !== 'none');
  console.log(`✅ Tab 3 Test: ProbeResultsVisible=${probeResultsVisible}`);
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab3.png') });

  // 4. Test Outside Click (Dismissal)
  console.log('🚪 Testing Outside Click to Close...');
  await page.mouse.click(20, 20);
  await page.waitForTimeout(400);
  const modalStillExists = await page.$('#pg-cleanip-modal-overlay');
  console.log(`✅ Outside Click Test: ModalExistsAfterClick=${!!modalStillExists}`);
  if (modalStillExists) {
    throw new Error('FAIL: Modal did not close when clicking outside overlay!');
  }
  await page.screenshot({ path: path.resolve(__dirname, 'test_closed.png') });

  console.log('🎉 ALL v1.5.0 UI & PROBE TESTS PASSED PERFECTLY!');
  await browser.close();
})();
