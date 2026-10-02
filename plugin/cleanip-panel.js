/**
 * PasarGuard Auto Clean IP - Web UI Dashboard Extension
 * Elegant Tabbed Interface with 100% theme compatibility and smart lifecycle.
 */
(() => {
  'use strict';

  const TAB_ID = 'pg-cleanip-nav-button';
  const MODAL_ID = 'pg-cleanip-modal-overlay';
  const VERSION = '1.2.0';

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  function injectNavTab() {
    // 1. Floating pill button
    if (!document.getElementById('pg-cleanip-floating-pill')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'pg-cleanip-floating-pill';
      floatBtn.type = 'button';
      floatBtn.className = 'fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-full text-emerald-800 dark:text-emerald-200 bg-emerald-500/15 dark:bg-emerald-950/90 border border-emerald-500/40 hover:border-emerald-500/70 hover:bg-emerald-500/25 transition-all shadow-xl backdrop-blur-md cursor-pointer animate-in fade-in duration-300';
      floatBtn.innerHTML = `
        <span class="text-sm">🛡️</span>
        <span class="font-semibold tracking-wide">Clean IP</span>
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      `;
      floatBtn.onclick = (e) => {
        e.preventDefault();
        const existing = document.getElementById(MODAL_ID);
        if (existing) {
          existing.remove();
        } else {
          openDashboardModal();
        }
      };
      document.body.appendChild(floatBtn);
    }

    // 2. Sidebar / Navigation integration
    if (!document.getElementById(TAB_ID)) {
      const menuList = document.querySelector('[data-sidebar="menu"], aside nav ul, nav[data-sidebar="menu"], ul.flex-col');
      if (menuList) {
        const li = document.createElement('li');
        li.id = TAB_ID;
        li.className = 'px-2 py-0.5';
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

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.remove();
    }
  }

  async function openDashboardModal() {
    closeModal();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200';
    document.body.appendChild(modal);

    // 1. Close when clicking backdrop outside the dialog
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };

    // 2. Close on Escape key
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);

    // 3. Close on route change
    const initialPath = window.location.pathname;
    const routeCheck = setInterval(() => {
      if (!document.getElementById(MODAL_ID)) {
        clearInterval(routeCheck);
        return;
      }
      if (window.location.pathname !== initialPath) {
        closeModal();
        clearInterval(routeCheck);
      }
    }, 250);

    // Initial Loading State
    modal.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-8 text-center shadow-2xl text-zinc-700 dark:text-zinc-200" dir="rtl">
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
      document.getElementById('close-err-btn').onclick = closeModal;
    }
  }

  function renderModalContent(modal, statusData, hostsList) {
    const settings = statusData?.settings || {};
    const latest = statusData?.latest_update;
    const targetHostIds = Array.isArray(settings.target_host_ids) ? settings.target_host_ids : (settings.target_host_id ? [settings.target_host_id] : []);

    modal.innerHTML = `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl h-[560px] max-h-[92vh] p-5 shadow-2xl flex flex-col text-right transition-all animate-in zoom-in-95 duration-150" dir="rtl">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <button id="cleanip-close-x" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 text-lg font-bold p-1 rounded-lg transition-colors cursor-pointer">✕</button>
          <div class="flex items-center gap-2.5">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-sm text-zinc-900 dark:text-zinc-100">Clean IP Auto-Pilot</h3>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">v${VERSION}</span>
              </div>
              <p class="text-[11px] text-zinc-400">نوسازی خودکار آی‌پی‌های تمیز کلودفلر</p>
            </div>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-base">🛡️</div>
          </div>
        </div>

        <!-- Navigation Tabs Bar -->
        <div class="flex items-center gap-1 p-1 my-2.5 bg-zinc-100/80 dark:bg-zinc-800/60 rounded-xl text-xs shrink-0 font-medium text-zinc-600 dark:text-zinc-400">
          <button id="tab-btn-hosts" class="cleanip-tab-btn flex-1 py-1.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold">
            <span>🎯 هاست‌های هدف</span>
            <span id="cleanip-tab-hosts-count" class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 font-bold">${targetHostIds.length}</span>
          </button>
          <button id="tab-btn-config" class="cleanip-tab-btn flex-1 py-1.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200">
            <span>⚙️ تنظیمات و اپراتورها</span>
          </button>
          <button id="tab-btn-status" class="cleanip-tab-btn flex-1 py-1.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200">
            <span>📊 وضعیت و آی‌پی‌ها</span>
          </button>
        </div>

        <!-- Notification Banner -->
        <div id="cleanip-alert-banner" class="hidden mb-2 shrink-0"></div>

        <!-- Tab 1: Hosts Selection Pane -->
        <div id="cleanip-pane-hosts" class="cleanip-pane flex-1 flex flex-col min-h-0 space-y-2">
          <!-- Search & Select All Actions -->
          <div class="flex items-center justify-between gap-2 shrink-0">
            <input type="text" id="cleanip-search-input" placeholder="🔍 جستجو در نام هاست یا پورت..." class="flex-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:border-emerald-500">
            <button id="cleanip-select-cdn-btn" type="button" class="text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 font-medium cursor-pointer hover:bg-emerald-100/60 whitespace-nowrap">
              ✓ انتخاب همه CDN
            </button>
            <button id="cleanip-deselect-all-btn" type="button" class="text-[11px] px-2 py-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer whitespace-nowrap">
              ✕ لغو
            </button>
          </div>

          <!-- Hosts Scrollable List -->
          <div id="cleanip-hosts-container" class="flex-1 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 bg-zinc-50/50 dark:bg-zinc-800/30 divide-y divide-zinc-100 dark:divide-zinc-800/60 space-y-0.5">
            ${hostsList.length === 0 ? '<p class="text-xs text-zinc-400 text-center py-8">هیچ هاستی یافت نشد.</p>' : ''}
            ${hostsList.map(h => {
              const cfPorts = [80, 443, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8080, 8443, 8880];
              const tagPortMatch = (h.inbound_tag || '').match(/\b(20[589][0-9]|8443|8080|443|80|8880|\d{2,5})\b/);
              const effectivePort = h.port || (tagPortMatch ? Number(tagPortMatch[0]) : null);
              const isCfPort = effectivePort ? cfPorts.includes(effectivePort) : false;
              
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
                <label class="cleanip-host-row flex items-center justify-between p-2 rounded-lg hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition text-xs ${isReality || isDummyStatus ? 'opacity-50' : ''}" data-is-cdn="${isCdn ? '1' : '0'}" data-search="${searchText}">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <input type="checkbox" class="cleanip-host-cb w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer shrink-0" value="${h.id}" ${isChecked ? 'checked' : ''}>
                    <div class="flex flex-col min-w-0">
                      <span class="font-medium text-xs text-zinc-900 dark:text-zinc-100 truncate" dir="auto" style="unicode-bidi: plaintext;">
                        ${h.remark || 'Host #' + h.id}
                      </span>
                      <span class="text-[10px] text-zinc-400 font-mono">${h.inbound_tag || 'Port ' + (effectivePort || 'Auto')}</span>
                    </div>
                  </div>
                  <div class="shrink-0 ms-2">
                    ${isCdn ? `
                      <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-medium border border-emerald-200 dark:border-emerald-800/60">
                        ☁️ CDN ${effectivePort ? `(پورت ${effectivePort})` : ''}
                      </span>
                    ` : (isReality ? `
                      <span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        ⚡ Reality
                      </span>
                    ` : `
                      <span class="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                        مستقیم / سایر
                      </span>
                    `)}
                  </div>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tab 2: Settings & Operators Pane -->
        <div id="cleanip-pane-config" class="cleanip-pane hidden flex-1 overflow-y-auto space-y-3.5 pr-1 pl-1 text-xs">
          <!-- ISP selection -->
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <span class="font-semibold text-zinc-800 dark:text-zinc-200 block">اپراتورهای فعال:</span>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
                <span>همراه اول (MCI)</span>
                <input type="checkbox" id="isp-mci" value="mci" ${settings.enabled_isps?.includes('mci') ? 'checked' : ''} class="w-4 h-4 rounded accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
                <span>ایرانسل (MTN)</span>
                <input type="checkbox" id="isp-mtn" value="mtn" ${settings.enabled_isps?.includes('mtn') ? 'checked' : ''} class="w-4 h-4 rounded accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 cursor-pointer">
                <span>مخابرات / Wifi</span>
                <input type="checkbox" id="isp-wifi" value="wifi" ${settings.enabled_isps?.includes('wifi') ? 'checked' : ''} class="w-4 h-4 rounded accent-emerald-600">
              </label>
            </div>
          </div>

          <!-- Interval and Limits -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
              <label class="font-semibold text-zinc-800 dark:text-zinc-200 block">بازه بروزرسانی خودکار:</label>
              <select id="cleanip-interval-select" class="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs">
                <option value="1" ${settings.auto_interval_hours === 1 ? 'selected' : ''}>هر ۱ ساعت</option>
                <option value="2" ${settings.auto_interval_hours === 2 ? 'selected' : ''}>هر ۲ ساعت</option>
                <option value="3" ${!settings.auto_interval_hours || settings.auto_interval_hours === 3 ? 'selected' : ''}>هر ۳ ساعت (پیشنهادی)</option>
                <option value="6" ${settings.auto_interval_hours === 6 ? 'selected' : ''}>هر ۶ ساعت</option>
                <option value="12" ${settings.auto_interval_hours === 12 ? 'selected' : ''}>هر ۱۲ ساعت</option>
              </select>
            </div>
            <div class="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-1.5">
              <label class="font-semibold text-zinc-800 dark:text-zinc-200 block">تعداد IP به ازای هر اپراتور:</label>
              <input type="number" id="cleanip-limit-input" min="1" max="5" value="${settings.limit_per_isp || 2}" class="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs">
            </div>
          </div>
        </div>

        <!-- Tab 3: Status & Active Clean IPs Pane -->
        <div id="cleanip-pane-status" class="cleanip-pane hidden flex-1 overflow-y-auto space-y-3 pr-1 pl-1 text-xs">
          <!-- Status Banner -->
          <div class="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
            <div>
              <span class="font-semibold text-emerald-800 dark:text-emerald-300 block text-xs">موتور اسکن خودکار (Auto-Pilot):</span>
              <p class="text-[11px] text-zinc-500 mt-0.5">در پشت‌صحنه بر اساس زمان‌بندی آی‌پی‌های تمیز اعمال می‌شوند.</p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 font-bold text-[10px]">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              فعال
            </span>
          </div>

          <!-- Latest active IPs -->
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-zinc-800 dark:text-zinc-200">آی‌پی‌های تمیز اعمال‌شده اخیر:</span>
              <span class="text-[10px] text-zinc-400 font-mono">${latest?.timestamp ? new Date(latest.timestamp).toLocaleTimeString('fa-IR') : 'هنوز تستی انجام نشده'}</span>
            </div>
            <div id="cleanip-active-ips-list" class="flex flex-wrap gap-1.5 font-mono text-[11px]">
              ${(latest?.applied_ips || []).length > 0 ? (latest.applied_ips).map(ip => `
                <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono">
                  ${ip}
                </span>
              `).join('') : '<span class="text-zinc-400">هنوز اسکن جدیدی انجام نشده است.</span>'}
            </div>
          </div>
        </div>

        <!-- Sticky Footer Action Buttons -->
        <div class="flex items-center gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <button id="cleanip-trigger-scan" type="button" class="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer text-xs whitespace-nowrap">
            <span>⚡ اسکن و اعمال روی هاست‌ها</span>
          </button>
          <button id="cleanip-save-settings" type="button" class="py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium rounded-xl transition text-xs cursor-pointer whitespace-nowrap border border-zinc-200 dark:border-zinc-700">
            ذخیره
          </button>
          <button id="cleanip-footer-close" type="button" class="py-2.5 px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer">
            بستن
          </button>
        </div>
      </div>
    `;

    // Close listeners
    document.getElementById('cleanip-close-x').onclick = closeModal;
    document.getElementById('cleanip-footer-close').onclick = closeModal;

    // Tabs switching
    const tabBtnHosts = document.getElementById('tab-btn-hosts');
    const tabBtnConfig = document.getElementById('tab-btn-config');
    const tabBtnStatus = document.getElementById('tab-btn-status');

    const paneHosts = document.getElementById('cleanip-pane-hosts');
    const paneConfig = document.getElementById('cleanip-pane-config');
    const paneStatus = document.getElementById('cleanip-pane-status');

    function switchTab(activeBtn, activePane) {
      [tabBtnHosts, tabBtnConfig, tabBtnStatus].forEach(btn => {
        btn.className = 'cleanip-tab-btn flex-1 py-1.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200';
      });
      activeBtn.className = 'cleanip-tab-btn flex-1 py-1.5 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-sm font-semibold';

      [paneHosts, paneConfig, paneStatus].forEach(p => p.classList.add('hidden'));
      activePane.classList.remove('hidden');
    }

    tabBtnHosts.onclick = () => switchTab(tabBtnHosts, paneHosts);
    tabBtnConfig.onclick = () => switchTab(tabBtnConfig, paneConfig);
    tabBtnStatus.onclick = () => switchTab(tabBtnStatus, paneStatus);

    // Update selected count badge helper
    function updateSelectedCount() {
      const count = document.querySelectorAll('.cleanip-host-cb:checked').length;
      const countBadge = document.getElementById('cleanip-tab-hosts-count');
      if (countBadge) countBadge.innerText = count;
    }
    updateSelectedCount();

    // Host checkbox listeners
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
      banner.className = `p-2.5 rounded-xl text-xs font-medium ${type === 'error' ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'}`;
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
          showBanner('success', `✅ تنظیمات ذخیره شد. (${payload.target_host_ids.length} هاست هدف فعال)`);
        } else {
          showBanner('error', `❌ خطا در ذخیره: ${data.detail || 'نامشخص'}`);
        }
      } catch (err) {
        showBanner('error', `خطای شبکه: ${err.message}`);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = 'ذخیره';
      }
    };

    // Scan & Apply button
    document.getElementById('cleanip-trigger-scan').onclick = async () => {
      const payload = getFormPayload();
      
      if (payload.target_host_ids.length === 0) {
        switchTab(tabBtnHosts, paneHosts);
        showBanner('error', '⚠️ لطفاً حداقل یک هاست را از تب «هاست‌ها» تیک بزنید.');
        return;
      }

      const btn = document.getElementById('cleanip-trigger-scan');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> در حال اسکن پینگ و اعمال...`;
      btn.disabled = true;

      try {
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
            </div>
          `);

          // Update active IPs in Status pane
          const activeIpsList = document.getElementById('cleanip-active-ips-list');
          if (activeIpsList && appliedIps.length > 0) {
            activeIpsList.innerHTML = appliedIps.map(ip => `
              <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono">
                ${ip}
              </span>
            `).join('');
          }
        } else {
          showBanner('error', `❌ خطا: ${data.detail || 'اسکن ناموفق بود.'}`);
        }
      } catch (e) {
        showBanner('error', `خطای ارتباط: ${e.message}`);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    };
  }

  // Self-healing DOM observer
  const observer = new MutationObserver(() => injectNavTab());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(injectNavTab, 300);
})();
