/**
 * PasarGuard Auto Clean IP - Web UI Dashboard Extension
 * Seamlessly integrates into the PasarGuard Dashboard with 100% theme compatibility.
 */
(() => {
  'use strict';

  const TAB_ID = 'pg-cleanip-nav-button';
  const MODAL_ID = 'pg-cleanip-modal-overlay';
  const VERSION = '1.1.0';

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  function injectNavTab() {
    // 1. Floating pill button (guaranteed visible everywhere in the dashboard)
    if (!document.getElementById('pg-cleanip-floating-pill')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'pg-cleanip-floating-pill';
      floatBtn.type = 'button';
      floatBtn.className = 'fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-full text-emerald-800 dark:text-emerald-200 bg-emerald-500/20 dark:bg-emerald-950/90 border border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/30 transition-all shadow-xl backdrop-blur-md cursor-pointer animate-in fade-in duration-300';
      floatBtn.innerHTML = `
        <span class="text-sm">🛡️</span>
        <span class="font-semibold tracking-wide">Clean IP Auto-Pilot</span>
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      `;
      floatBtn.onclick = (e) => {
        e.preventDefault();
        openDashboardModal();
      };
      document.body.appendChild(floatBtn);
    }

    // 2. Sidebar / Navigation integration (if sidebar menu exists)
    if (!document.getElementById(TAB_ID)) {
      const menuList = document.querySelector('[data-sidebar="menu"], aside nav ul, nav[data-sidebar="menu"], ul.flex-col');
      if (menuList) {
        const li = document.createElement('li');
        li.id = TAB_ID;
        li.className = 'px-2 py-1';
        li.innerHTML = `
          <button type="button" class="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/40 transition-colors">
            <span class="text-sm">🛡️</span>
            <span>Clean IP Auto-Pilot</span>
            <span class="ms-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </button>
        `;
        li.onclick = (e) => {
          e.preventDefault();
          openDashboardModal();
        };
        menuList.appendChild(li);
      }
    }
  }

  async function openDashboardModal() {
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = MODAL_ID;
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200';
      document.body.appendChild(modal);
    }

    // Show initial loading state
    modal.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl p-8 text-center shadow-2xl text-zinc-700 dark:text-zinc-200" dir="rtl">
        <div class="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="font-medium text-sm">در حال بارگذاری اطلاعات Clean IP...</p>
      </div>
    `;

    try {
      const [statusRes, hostsRes] = await Promise.all([
        fetch('/api/cleanip/status', { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ({})),
        fetch('/api/cleanip/hosts', { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ([]))
      ]);

      renderModalContent(modal, statusRes, hostsRes);
    } catch (err) {
      modal.innerHTML = `
        <div class="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900 rounded-2xl w-full max-w-md p-6 text-center shadow-xl" dir="rtl">
          <p class="text-red-600 dark:text-red-400 font-semibold mb-3">خطا در برقراری ارتباط با افزونه Clean IP</p>
          <p class="text-xs text-zinc-500 mb-4">${err.message || 'لطفاً وضعیت سرویس را بررسی کنید.'}</p>
          <button id="close-err-btn" class="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-sm font-medium">بستن</button>
        </div>
      `;
      document.getElementById('close-err-btn').onclick = () => modal.remove();
    }
  }

  function renderModalContent(modal, statusData, hostsList) {
    const settings = statusData?.settings || {};
    const latest = statusData?.latest_update;
    const targetHostIds = Array.isArray(settings.target_host_ids) ? settings.target_host_ids : (settings.target_host_id ? [settings.target_host_id] : []);

    modal.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-4 text-right transition-all max-h-[92vh] flex flex-col" dir="rtl">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <button id="cleanip-close-x" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 text-xl font-bold transition-colors p-1 cursor-pointer">✕</button>
          <div class="flex items-center gap-3">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100">Clean IP Auto-Pilot</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">v${VERSION}</span>
              </div>
              <p class="text-[11px] text-zinc-500">نوسازی خودکار آی‌پی‌های تمیز کلودفلر برای اپراتورهای ایران</p>
            </div>
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xl">🛡️</div>
          </div>
        </div>

        <!-- Alert / Feedback Banner Container -->
        <div id="cleanip-alert-banner" class="hidden"></div>

        <!-- Scrollable Content -->
        <div class="space-y-4 text-sm overflow-y-auto flex-1 pr-1 pl-1">
          
          <!-- Host Multi-Selection List -->
          <div>
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">هاست‌های هدف (Hosts):</label>
                <span id="cleanip-selected-count-badge" class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                  0 هاست انتخاب‌شده
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button id="cleanip-select-cdn-btn" type="button" class="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer">
                  ✓ انتخاب خودکار همه هاست‌های ☁ CDN
                </button>
                <button id="cleanip-deselect-all-btn" type="button" class="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                  ✕ لغو انتخاب
                </button>
              </div>
            </div>

            <!-- Quick Search Input -->
            <div class="mb-2">
              <input type="text" id="cleanip-search-input" placeholder="🔍 جستجو در نام هاست، تگ یا پورت..." class="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:border-emerald-500 transition">
            </div>
            
            <div id="cleanip-hosts-container" class="max-h-56 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50/50 dark:bg-zinc-800/30 divide-y divide-zinc-100 dark:divide-zinc-800/60 space-y-1">
              ${hostsList.length === 0 ? '<p class="text-xs text-zinc-400 text-center py-4">هیچ هاستی یافت نشد.</p>' : ''}
              ${hostsList.map(h => {
                // Official Cloudflare proxy ports
                const cfPorts = [80, 443, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8080, 8443, 8880];
                const tagPortMatch = (h.inbound_tag || '').match(/\b(20[589][0-9]|8443|8080|443|80|8880|\d{2,5})\b/);
                const effectivePort = h.port || (tagPortMatch ? Number(tagPortMatch[0]) : null);
                const isCfPort = effectivePort ? cfPorts.includes(effectivePort) : false;
                
                // Exclude dummy/status hosts, reality, and tunnels
                const isDummyStatus = h.inbound_tag && (h.inbound_tag.toLowerCase().includes('status') || h.inbound_tag.toLowerCase().includes('wireguard') || h.inbound_tag.toLowerCase().includes('wg_'));
                const isReality = (h.inbound_tag && h.inbound_tag.toLowerCase().includes('reality')) || (h.remark && h.remark.toLowerCase().includes('-ry'));
                const isTunnel = h.inbound_tag && (h.inbound_tag.toLowerCase().includes('tun') || h.inbound_tag.toLowerCase().includes('tcp-tun'));
                
                const isCdn = !isDummyStatus && !isReality && !isTunnel && (
                  isCfPort ||
                  (h.remark && (h.remark.includes('☁') || h.remark.toLowerCase().includes('cdn') || h.remark.toLowerCase().includes('cleanip'))) || 
                  (h.inbound_tag && (h.inbound_tag.toLowerCase().includes('xhttp') || h.inbound_tag.toLowerCase().includes('cloud') || h.inbound_tag.toLowerCase().includes('cf')))
                );
                
                const isChecked = targetHostIds.includes(h.id);
                const searchText = `${h.remark || ''} ${h.inbound_tag || ''} ${effectivePort || ''}`.toLowerCase();
                
                return `
                  <label class="cleanip-host-row flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-emerald-300 dark:hover:border-emerald-700/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-all text-xs ${isReality || isDummyStatus ? 'opacity-55' : ''}" data-is-cdn="${isCdn ? '1' : '0'}" data-search="${searchText}">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <input type="checkbox" class="cleanip-host-cb w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer shrink-0" value="${h.id}" ${isChecked ? 'checked' : ''}>
                      <div class="flex flex-col min-w-0">
                        <span class="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate" dir="auto" style="unicode-bidi: plaintext;">
                          ${h.remark || 'Host #' + h.id}
                        </span>
                        <span class="text-[10px] text-zinc-400 font-mono mt-0.5">${h.inbound_tag || 'Port ' + (effectivePort || 'Auto')}</span>
                      </div>
                    </div>
                    <div class="shrink-0 ms-2">
                      ${isCdn ? `
                        <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-medium border border-emerald-200 dark:border-emerald-800/60">
                          ☁️ CDN ${effectivePort ? `(پورت ${effectivePort})` : ''}
                        </span>
                      ` : (isReality ? `
                        <span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-medium">
                          ⚡ Reality
                        </span>
                      ` : `
                        <span class="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-medium">
                          مستقیم / سایر
                        </span>
                      `)}
                    </div>
                  </label>
                `;
              }).join('')}
            </div>
            <p class="text-[11px] text-zinc-400 mt-1.5">آی‌پی‌های تمیز کلودفلر همزمان فقط روی هاست‌های تیک‌خورده اعمال و جایگزین می‌شوند.</p>
          </div>

          <!-- ISP selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">اپراتورهای فعال برای دریافت آی‌پی:</label>
            <div class="grid grid-cols-3 gap-2.5">
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 cursor-pointer transition">
                <span class="text-xs font-medium">همراه اول (MCI)</span>
                <input type="checkbox" id="isp-mci" value="mci" ${settings.enabled_isps?.includes('mci') ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 cursor-pointer transition">
                <span class="text-xs font-medium">ایرانسل (MTN)</span>
                <input type="checkbox" id="isp-mtn" value="mtn" ${settings.enabled_isps?.includes('mtn') ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 cursor-pointer transition">
                <span class="text-xs font-medium">مخابرات / Wifi</span>
                <input type="checkbox" id="isp-wifi" value="wifi" ${settings.enabled_isps?.includes('wifi') ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-600 accent-emerald-600">
              </label>
            </div>
          </div>

          <!-- Controls grid -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">بازه بروزرسانی خودکار:</label>
              <select id="cleanip-interval-select" class="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs focus:outline-none focus:border-emerald-500">
                <option value="1" ${settings.auto_interval_hours === 1 ? 'selected' : ''}>هر ۱ ساعت</option>
                <option value="2" ${settings.auto_interval_hours === 2 ? 'selected' : ''}>هر ۲ ساعت</option>
                <option value="3" ${!settings.auto_interval_hours || settings.auto_interval_hours === 3 ? 'selected' : ''}>هر ۳ ساعت (پیشنهادی)</option>
                <option value="6" ${settings.auto_interval_hours === 6 ? 'selected' : ''}>هر ۶ ساعت</option>
                <option value="12" ${settings.auto_interval_hours === 12 ? 'selected' : ''}>هر ۱۲ ساعت</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">تعداد IP به ازای اپراتور:</label>
              <input type="number" id="cleanip-limit-input" min="1" max="5" value="${settings.limit_per_isp || 2}" class="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs focus:outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Latest active IPs badge -->
          ${latest ? `
            <div id="cleanip-latest-card" class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-zinc-800 dark:text-zinc-200">آخرین بروزرسانی (${latest.updated_hosts?.length || 0} هاست):</span>
                <span class="text-[10px] text-zinc-400 font-mono">${latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString('fa-IR') : 'نامشخص'}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 font-mono text-[11px]">
                ${(latest.applied_ips || []).map(ip => `
                  <span class="px-2 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    ${ip}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : '<div id="cleanip-latest-card"></div>'}
        </div>

        <!-- Action Buttons Footer -->
        <div class="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button id="cleanip-trigger-scan" type="button" class="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap">
            <span>⚡ اسکن و اعمال روی هاست‌های انتخابی</span>
          </button>
          <button id="cleanip-save-settings" type="button" class="py-3 px-5 shrink-0 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.99] text-zinc-800 dark:text-zinc-200 font-medium rounded-xl transition text-xs sm:text-sm cursor-pointer whitespace-nowrap border border-zinc-200 dark:border-zinc-700">
            ذخیره تنظیمات
          </button>
        </div>
      </div>
    `;

    // Close button
    document.getElementById('cleanip-close-x').onclick = () => modal.remove();

    // Update selected count badge helper
    function updateSelectedCount() {
      const count = document.querySelectorAll('.cleanip-host-cb:checked').length;
      const badge = document.getElementById('cleanip-selected-count-badge');
      if (badge) badge.innerText = `${count} هاست انتخاب‌شده`;
    }
    updateSelectedCount();

    // Listen to all host checkbox changes
    document.querySelectorAll('.cleanip-host-cb').forEach(cb => {
      cb.addEventListener('change', updateSelectedCount);
    });

    // Quick Search filter
    const searchInput = document.getElementById('cleanip-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.trim().toLowerCase();
        document.querySelectorAll('.cleanip-host-row').forEach(row => {
          const text = row.getAttribute('data-search') || '';
          row.style.display = text.includes(query) ? '' : 'none';
        });
      };
    }

    // Select all CDN button
    document.getElementById('cleanip-select-cdn-btn').onclick = () => {
      document.querySelectorAll('#cleanip-hosts-container label').forEach(lbl => {
        const cb = lbl.querySelector('.cleanip-host-cb');
        if (lbl.getAttribute('data-is-cdn') === '1' && cb) {
          cb.checked = true;
        }
      });
      updateSelectedCount();
    };

    // Deselect all button
    document.getElementById('cleanip-deselect-all-btn').onclick = () => {
      document.querySelectorAll('.cleanip-host-cb').forEach(cb => cb.checked = false);
      updateSelectedCount();
    };

    // Helper to gather form payload
    function getFormPayload() {
      const selectedHostIds = Array.from(document.querySelectorAll('.cleanip-host-cb:checked')).map(cb => Number(cb.value));
      const isps = [];
      if (document.getElementById('isp-mci')?.checked) isps.push('mci');
      if (document.getElementById('isp-mtn')?.checked) isps.push('mtn');
      if (document.getElementById('isp-wifi')?.checked) isps.push('wifi');

      const limit = parseInt(document.getElementById('cleanip-limit-input')?.value || '2', 10);
      const interval = parseInt(document.getElementById('cleanip-interval-select')?.value || '3', 10);

      return {
        target_host_ids: selectedHostIds,
        enabled_isps: isps.length > 0 ? isps : ['mci', 'mtn', 'wifi'],
        limit_per_isp: limit,
        auto_pilot: true,
        auto_interval_hours: interval,
        custom_ips: []
      };
    }

    function showBanner(type, message) {
      const banner = document.getElementById('cleanip-alert-banner');
      if (!banner) return;
      banner.className = `p-3 rounded-xl text-xs font-medium ${type === 'error' ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'}`;
      banner.innerHTML = message;
      banner.classList.remove('hidden');
    }

    // Save button
    document.getElementById('cleanip-save-settings').onclick = async () => {
      const payload = getFormPayload();
      const saveBtn = document.getElementById('cleanip-save-settings');
      saveBtn.disabled = true;
      saveBtn.innerText = 'در حال ذخیره...';

      try {
        const res = await fetch('/api/cleanip/settings', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          showBanner('success', `✅ تنظیمات با موفقیت ذخیره شد. (${payload.target_host_ids.length} هاست تنظیم گردید)`);
        } else {
          showBanner('error', `❌ خطا در ذخیره: ${data.detail || 'نامشخص'}`);
        }
      } catch (err) {
        showBanner('error', `خطای شبکه: ${err.message}`);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره تنظیمات';
      }
    };

    // Scan & Apply button
    document.getElementById('cleanip-trigger-scan').onclick = async () => {
      const payload = getFormPayload();
      
      // Validation check
      if (payload.target_host_ids.length === 0) {
        showBanner('error', '⚠️ لطفاً ابتدا حداقل یک هاست را از لیست بالا تیک بزنید تا آی‌پی روی آن اعمال شود.');
        return;
      }

      const btn = document.getElementById('cleanip-trigger-scan');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> در حال اسکن پینگ و اعمال آی‌پی‌ها...`;
      btn.disabled = true;

      try {
        // Send payload directly to scan-and-apply
        const res = await fetch('/api/cleanip/scan-and-apply', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.ok) {
          const appliedIps = data.applied_ips || [];
          const updatedNames = data.updated_hosts || [];
          
          showBanner('success', `
            <div class="space-y-1">
              <p class="font-bold">✅ ${data.message}</p>
              <p class="text-[11px]">هاست‌های آپدیت‌شده: ${updatedNames.join(' ، ')}</p>
              <div class="flex flex-wrap gap-1 mt-1 font-mono text-[10px]">
                ${appliedIps.map(ip => `<span class="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900">${ip}</span>`).join('')}
              </div>
            </div>
          `);

          // Update latest card
          const latestCard = document.getElementById('cleanip-latest-card');
          if (latestCard) {
            latestCard.className = 'p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2 mt-2';
            latestCard.innerHTML = `
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-zinc-800 dark:text-zinc-200">آخرین بروزرسانی (${updatedNames.length} هاست):</span>
                <span class="text-[10px] text-zinc-400 font-mono">هم اکنون</span>
              </div>
              <div class="flex flex-wrap gap-1.5 font-mono text-[11px]">
                ${appliedIps.map(ip => `<span class="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">${ip}</span>`).join('')}
              </div>
            `;
          }
        } else {
          showBanner('error', `❌ خطا: ${data.detail || 'اسکن ناموفق بود.'}`);
        }
      } catch (e) {
        showBanner('error', `خطای ارتباط با سرور: ${e.message}`);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    };
  }

  // Self-healing DOM observer to keep buttons present across React transitions
  const observer = new MutationObserver(() => injectNavTab());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(injectNavTab, 400);
})();
