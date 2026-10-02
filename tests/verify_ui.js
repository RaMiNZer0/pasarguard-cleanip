const { chromium } = require('C:/Users/ZerO/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright');
const path = require('path');

(async () => {
  console.log('🚀 Starting Edge Playwright UI Verification for v1.8.0...');

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

  if (cardBox.height > 860 || cardBox.width > 860 || cardBox.width < 750) {
    throw new Error(`FAIL: Card dimensions out of bounds: width=${cardBox.width}, height=${cardBox.height}`);
  }

  // Verify Version Badge
  const versionText = await page.$eval('.pg-cleanip-header', el => el.innerText);
  console.log(`✅ Version in header: ${versionText.includes('v1.8.0') ? 'v1.8.0 confirmed' : 'FAIL: version mismatch'}`);
  if (!versionText.includes('v1.8.0')) {
    throw new Error('FAIL: Header does not contain v1.8.0!');
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

  // Verify Tab 2 Sticky Toolbar existence & computed style
  const toolbarPosition = await page.$eval('.pg-cleanip-tab2-sticky-toolbar', el => window.getComputedStyle(el).position);
  console.log(`✅ Tab 2 Sticky Toolbar computed position: ${toolbarPosition}`);
  if (toolbarPosition !== 'sticky') {
    throw new Error('FAIL: .pg-cleanip-tab2-sticky-toolbar is not sticky!');
  }

  // Verify Select Contrast in Dark Mode (Theme Isolation)
  const selectBg = await page.$eval('#cleanip-ping-mode-select', el => window.getComputedStyle(el).backgroundColor);
  const selectColor = await page.$eval('#cleanip-ping-mode-select', el => window.getComputedStyle(el).color);
  console.log(`✅ Ping Mode Select theme isolation: bg=${selectBg}, color=${selectColor}`);

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
  console.log(`✅ Tab 2: Latency badges sample: ${JSON.stringify(badgeTexts.slice(0, 4))}`);
  const hasLatencyMs = badgeTexts.some(txt => txt.includes('ms'));
  if (!hasLatencyMs) {
    throw new Error('FAIL: No ping latency results rendered in candidate rows!');
  }

  // 2d. Test Clean Dead / Filtered IPs button
  const deadRowExistsBefore = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.cleanip-ip-latency-badge')).some(el => el.innerText.includes('فیلتر') || el.innerText.includes('قطعی'));
  });
  console.log(`✅ Tab 2: Dead/filtered row exists before cleanup: ${deadRowExistsBefore}`);
  if (deadRowExistsBefore) {
    console.log('🗑️ Clicking "پاکسازی فیلترشده‌ها" button...');
    await page.click('#cleanip-clean-dead-btn');
    await page.waitForTimeout(300);
    const deadRowExistsAfter = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.cleanip-ip-latency-badge')).some(el => el.innerText.includes('فیلتر') || el.innerText.includes('قطعی'));
    });
    console.log(`✅ Tab 2: Dead/filtered row exists after cleanup: ${deadRowExistsAfter}`);
    if (deadRowExistsAfter) {
      throw new Error('FAIL: Clean dead button did not remove filtered IPs!');
    }
  }

  // Test "انتخاب همه" button
  console.log('🎯 Clicking "انتخاب همه"...');
  await page.click('#cleanip-select-all-btn');
  await page.waitForTimeout(200);
  const allCheckedCount = await page.$$eval('.cleanip-select-ip-cb:checked', cbs => cbs.length);
  const totalCbsCount = await page.$$eval('.cleanip-select-ip-cb', cbs => cbs.length);
  console.log(`✅ Tab 2: "انتخاب همه" checked count: ${allCheckedCount}/${totalCbsCount}`);
  if (allCheckedCount !== totalCbsCount || allCheckedCount === 0) {
    throw new Error('FAIL: "انتخاب همه" failed to select all candidate rows!');
  }

  // Click "انتخاب بهترین‌ها" button (<150ms)
  console.log('🎯 Clicking "انتخاب بهترین‌ها" (<150ms)...');
  await page.click('#cleanip-select-best-btn');
  await page.waitForTimeout(300);

  const checkedCount = await page.$$eval('.cleanip-select-ip-cb:checked', cbs => cbs.length);
  console.log(`✅ Tab 2: Checked best IPs count: ${checkedCount}`);
  if (checkedCount === 0) {
    throw new Error('FAIL: "انتخاب بهترین‌ها" failed to select any low-latency IPs!');
  }

  // Test "متوسط‌ها (150-250)" button
  console.log('🎯 Clicking "متوسط‌ها (۱۵۰-۲۵۰)"...');
  await page.click('#cleanip-select-medium-btn');
  await page.waitForTimeout(200);

  // Test "همه سالم‌ها" button
  console.log('🎯 Clicking "همه سالم‌ها"...');
  await page.click('#cleanip-select-healthy-btn');
  await page.waitForTimeout(200);
  const healthyCheckedCount = await page.$$eval('.cleanip-select-ip-cb:checked', cbs => cbs.length);
  console.log(`✅ Tab 2: Checked healthy IPs count: ${healthyCheckedCount}`);
  if (healthyCheckedCount === 0) {
    throw new Error('FAIL: "همه سالم‌ها" failed to select healthy IPs!');
  }

  // Verify ascending latency order of rendered rows
  const latencies = await page.$$eval('.cleanip-ip-latency-badge', els => {
    return els.map(el => {
      const m = el.innerText.match(/(\d+(?:\.\d+)?)ms/);
      return m ? parseFloat(m[1]) : 99999;
    });
  });
  console.log(`✅ Tab 2: Sorted latencies: ${latencies.slice(0, 5).join('ms, ')}ms...`);
  for (let i = 0; i < latencies.length - 1; i++) {
    if (latencies[i] > latencies[i + 1] && latencies[i] !== 99999 && latencies[i + 1] !== 99999) {
      throw new Error(`FAIL: Latencies not sorted ascending! ${latencies[i]} > ${latencies[i + 1]}`);
    }
  }

  // Verify badge shows ratio or count
  const badgeCountText = await page.$eval('#cleanip-tab-selected-ips-count', el => el.innerText);
  console.log(`✅ Tab 2 Selected Badge: "${badgeCountText}"`);
  if (!badgeCountText.includes('/') && !badgeCountText.match(/^\d+$/)) {
    throw new Error('FAIL: Tab badge counter format invalid!');
  }

  // Take screenshot of Tab 2 in action
  await page.screenshot({ path: path.resolve(__dirname, 'test_tab2.png') });

  // Test "اعمال روی هاست‌های انتخابی"
  console.log('🚀 Clicking "اعمال روی هاست‌های انتخابی" button...');
  await page.click('#cleanip-trigger-scan');
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

  console.log('🎉 ALL v1.8.0 UI & WORKSPACE TESTS PASSED PERFECTLY!');
  await browser.close();
})();
