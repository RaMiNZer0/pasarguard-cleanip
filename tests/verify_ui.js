const { chromium } = require('C:/Users/ZerO/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting Edge Playwright UI Verification for v1.7.1...');

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

  if (cardBox.height > 660 || cardBox.width > 660) {
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

  // 2. Test Tab 2 (Interactive Clean IP Ping & Selection Workspace)
  console.log('⚡ Switching to Tab 2 (Clean IP Ping & Selection)...');
  await page.click('#tab-btn-ping');
  
  // Wait for candidate rows to be rendered
  await page.waitForSelector('.pg-cleanip-ip-row', { timeout: 5000 });
  let candidateRows = await page.$$('.pg-cleanip-ip-row');
  console.log(`✅ Tab 2: Initial candidate rows found: ${candidateRows.length}`);
  if (candidateRows.length === 0) {
    throw new Error('FAIL: No candidate rows populated in Tab 2!');
  }

  // 2a. Test Manual IP Addition
  console.log('➕ Testing Manual IP Addition drawer...');
  await page.click('#cleanip-toggle-manual-btn');
  await page.waitForTimeout(200);
  await page.fill('#cleanip-manual-ips-input', '104.16.99.1');
  await page.click('#cleanip-manual-add-submit-btn');
  await page.waitForTimeout(300);

  const hasManualIp = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.pg-cleanip-ip-row')).some(el => el.innerText.includes('104.16.99.1'));
  });
  console.log(`✅ Tab 2: Manual IP 104.16.99.1 added to table: ${hasManualIp}`);
  if (!hasManualIp) throw new Error('FAIL: Manual IP was not added to candidate table!');

  // 2b. Test Cloudflare Subnet Discovery
  console.log('🎲 Testing Cloudflare Subnet Discovery...');
  await page.click('#cleanip-discover-cf-btn');
  await page.waitForTimeout(600);
  candidateRows = await page.$$('.pg-cleanip-ip-row');
  console.log(`✅ Tab 2: Candidate rows after discovery: ${candidateRows.length}`);

  // 2c. Click Ping All button
  console.log('⚡ Clicking "تست پینگ همه آی‌پی‌ها" button...');
  await page.click('#cleanip-ping-all-btn');
  await page.waitForTimeout(800);

  // Verify latency badge text
  const badgeTexts = await page.$$eval('.cleanip-ip-latency-badge', elements => elements.map(el => el.innerText));
  console.log(`✅ Tab 2: Latency badges after ping: ${JSON.stringify(badgeTexts)}`);
  const hasLatencyMs = badgeTexts.some(txt => txt.includes('ms'));
  if (!hasLatencyMs) {
    throw new Error('FAIL: No ping latency results rendered in candidate rows!');
  }

  // Click "انتخاب بهترین‌ها" button (<150ms)
  console.log('🎯 Clicking "انتخاب بهترین‌ها" (<150ms)...');
  await page.click('#cleanip-select-best-btn');
  await page.waitForTimeout(300);

  const checkedCount = await page.$$eval('.cleanip-select-ip-cb:checked', cbs => cbs.length);
  console.log(`✅ Tab 2: Checked IPs count: ${checkedCount}`);
  if (checkedCount === 0) {
    throw new Error('FAIL: "انتخاب بهترین‌ها" failed to select any low-latency IPs!');
  }

  // Take screenshot of Tab 2 in action
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab2.png') });

  // Test "اعمال روی هاست‌های انتخابی"
  console.log('🚀 Clicking "اعمال روی هاست‌های انتخابی" button...');
  await page.click('#cleanip-apply-selected-btn');
  await page.waitForTimeout(500);

  const bannerVisible = await page.$eval('#cleanip-alert-banner', el => el.style.display !== 'none');
  const bannerText = await page.$eval('#cleanip-alert-banner', el => el.innerText);
  console.log(`✅ Tab 2: Apply Banner: visible=${bannerVisible}, text="${bannerText}"`);
  if (!bannerVisible || !bannerText.includes('اعمال شد')) {
    throw new Error('FAIL: Apply selected IPs banner not displayed properly!');
  }

  // 3. Test Tab 3 (Settings & Diagnostics)
  console.log('⚙️ Switching to Tab 3 (Settings & Diagnostics)...');
  await page.click('#tab-btn-config');
  await page.waitForTimeout(300);

  // Trigger End-to-End Infrastructure Diagnostic
  console.log('🩺 Clicking run infrastructure diagnostic button...');
  await page.click('#cleanip-run-diag-btn');
  await page.waitForTimeout(600);
  const diagResultVisible = await page.$eval('#cleanip-diag-result-container', el => el.style.display !== 'none');
  const diagText = await page.$eval('#cleanip-diag-result-container', el => el.innerText);
  console.log(`✅ Tab 3 Test: DiagResultVisible=${diagResultVisible}, contains "زیرساخت": ${diagText.includes('زیرساخت')}`);
  if (!diagResultVisible || !diagText.includes('زیرساخت')) {
    throw new Error('FAIL: Diagnostic result not displayed properly!');
  }
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

  console.log('🎉 ALL v1.7.1 UI & WORKSPACE TESTS PASSED PERFECTLY!');
  await browser.close();
})();
