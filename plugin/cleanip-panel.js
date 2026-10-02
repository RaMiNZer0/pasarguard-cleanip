/**
 * PasarGuard Auto Clean IP - Web UI Dashboard Extension
 * Seamlessly integrates into the PasarGuard Dashboard with 100% theme compatibility.
 */
(() => {
  'use strict';

  const TAB_ID = 'pg-cleanip-nav-button';
  const MODAL_ID = 'pg-cleanip-modal-overlay';
  const VERSION = '1.0.0';

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  function injectNavTab() {
    if (document.getElementById(TAB_ID)) return;

    // Look for dashboard navigation tabs or action bars
    const navBar = document.querySelector('nav[aria-label="Tabs"], nav.flex, [role="tablist"], header .flex.items-center');
    if (!navBar) return;

    const btn = document.createElement('button');
    btn.id = TAB_ID;
    btn.type = 'button';
    btn.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-sm';
    btn.innerHTML = `
      <span class="text-sm">🛡️</span>
      <span>Clean IP Auto-Pilot</span>
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
    `;

    btn.onclick = (e) => {
      e.preventDefault();
      openDashboardModal();
    };

    navBar.appendChild(btn);
  }

  async function openDashboardModal() {
    let modal = document.getElementById(MODAL_ID);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = MODAL_ID;
      modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200';
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
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-right transition-all max-h-[90vh] flex flex-col" dir="rtl">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <button id="cleanip-close-x" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 text-lg transition-colors p-1">✕</button>
          <div class="flex items-center gap-2.5">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-bold text-base text-zinc-900 dark:text-zinc-100">Clean IP Auto-Pilot</h3>
                <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">v${VERSION}</span>
              </div>
              <p class="text-[11px] text-zinc-500">نوسازی خودکار آی‌پی‌های تمیز کلودفلر برای اپراتورهای ایران</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl text-emerald-600">🛡️</div>
          </div>
        </div>

        <!-- Body with scrolling -->
        <div class="space-y-4 text-sm overflow-y-auto flex-1 pr-1 pl-1">
          
          <!-- Host Multi-Selection List -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">هاست‌های هدف (Hosts):</label>
              <button id="cleanip-select-cdn-btn" type="button" class="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer">
                ✓ انتخاب خودکار همه هاست‌های ☁ CDN
              </button>
            </div>
            
            <div id="cleanip-hosts-container" class="max-h-44 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50/50 dark:bg-zinc-800/40 divide-y divide-zinc-100 dark:divide-zinc-800/60 space-y-1">
              ${hostsList.length === 0 ? '<p class="text-xs text-zinc-400 text-center py-2">هیچ هاستی یافت نشد.</p>' : ''}
              ${hostsList.map(h => {
                // Official Cloudflare proxy ports
                const cfPorts = [80, 443, 2052, 2053, 2082, 2083, 2086, 2087, 2095, 2096, 8080, 8443, 8880];
                const port = Number(h.port);
                const isCfPort = cfPorts.includes(port);
                
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
                return `
                  <label class="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors text-xs ${isReality || isDummyStatus ? 'opacity-50' : ''}" data-is-cdn="${isCdn ? '1' : '0'}">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" class="cleanip-host-cb accent-emerald-600" value="${h.id}" ${isChecked ? 'checked' : ''}>
                      <span class="font-medium text-zinc-800 dark:text-zinc-200">${h.remark || 'Host #' + h.id}</span>
                      <span class="text-[10px] text-zinc-400 font-mono">(${h.inbound_tag || 'Port ' + (h.port || 'Auto')})</span>
                    </div>
                    ${isCdn ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">CDN ☁ (Port ' + (h.port || '') + ')</span>' : (isReality ? '<span class="text-[10px] text-amber-500 font-medium">Reality ⚡</span>' : '<span class="text-[10px] text-zinc-400">Direct / Other</span>')}
                  </label>
                `;
              }).join('')}
            </div>
            <p class="text-[11px] text-zinc-400 mt-1">آی‌پی‌های تمیز همزمان فقط روی هاست‌های تیک‌خورده اعمال می‌شوند.</p>
          </div>

          <!-- ISP selection -->
          <div>
            <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">اپراتورهای فعال:</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer">
                <span class="text-xs font-medium">همراه اول (MCI)</span>
                <input type="checkbox" id="isp-mci" value="mci" ${settings.enabled_isps?.includes('mci') ? 'checked' : ''} class="accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer">
                <span class="text-xs font-medium">ایرانسل (MTN)</span>
                <input type="checkbox" id="isp-mtn" value="mtn" ${settings.enabled_isps?.includes('mtn') ? 'checked' : ''} class="accent-emerald-600">
              </label>
              <label class="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 cursor-pointer">
                <span class="text-xs font-medium">مخابرات / Wifi</span>
                <input type="checkbox" id="isp-wifi" value="wifi" ${settings.enabled_isps?.includes('wifi') ? 'checked' : ''} class="accent-emerald-600">
              </label>
            </div>
          </div>

          <!-- Interval -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">بازه بروزرسانی خودکار:</label>
              <select id="cleanip-interval-input" class="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
                <option value="1" ${settings.auto_interval_hours === 1 ? 'selected' : ''}>هر ۱ ساعت</option>
                <option value="3" ${settings.auto_interval_hours === 3 ? 'selected' : ''}>هر ۳ ساعت (پیشنهادی)</option>
                <option value="6" ${settings.auto_interval_hours === 6 ? 'selected' : ''}>هر ۶ ساعت</option>
                <option value="12" ${settings.auto_interval_hours === 12 ? 'selected' : ''}>هر ۱۲ ساعت</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">تعداد IP به ازای اپراتور:</label>
              <input type="number" id="cleanip-limit-input" min="1" max="5" value="${settings.limit_per_isp || 2}" class="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs">
            </div>
          </div>

          <!-- Latest active IPs badge -->
          ${latest ? `
            <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-zinc-800 dark:text-zinc-200">آخرین بروزرسانی (${latest.updated_hosts?.length || 0} هاست):</span>
                <span class="text-[10px] text-zinc-400 font-mono">${latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString('fa-IR') : 'نامشخص'}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 font-mono text-[11px]">
                ${(latest.applied_ips || []).map(ip => `
                  <span class="px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    ${ip}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button id="cleanip-trigger-scan" type="button" class="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-xs cursor-pointer">
            <span>⚡ اسکن و اعمال روی هاست‌های انتخابی</span>
          </button>
          <button id="cleanip-save-settings" type="button" class="py-2.5 px-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium rounded-xl transition text-xs cursor-pointer">
            ذخیره
          </button>
        </div>
      </div>
    `;

    document.getElementById('cleanip-close-x').onclick = () => modal.remove();

    // Select all CDN button
    document.getElementById('cleanip-select-cdn-btn').onclick = () => {
      document.querySelectorAll('#cleanip-hosts-container label').forEach(lbl => {
        const cb = lbl.querySelector('.cleanip-host-cb');
        if (lbl.getAttribute('data-is-cdn') === '1' && cb) {
          cb.checked = true;
        }
      });
    };

    // Save button
    document.getElementById('cleanip-save-settings').onclick = async () => {
      const selectedHostIds = Array.from(document.querySelectorAll('.cleanip-host-cb:checked')).map(cb => Number(cb.value));
      const isps = [];
      if (document.getElementById('isp-mci').checked) isps.push('mci');
      if (document.getElementById('isp-mtn').checked) isps.push('mtn');
      if (document.getElementById('isp-wifi').checked) isps.push('wifi');

      const payload = {
        target_host_ids: selectedHostIds,
        enabled_isps: isps,
        auto_interval_hours: Number(document.getElementById('cleanip-interval-input').value) || 3,
        limit_per_isp: Number(document.getElementById('cleanip-limit-input').value) || 2,
        auto_pilot: true
      };

      try {
        const res = await fetch('/api/cleanip/settings', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          alert('✅ تنظیمات با موفقیت ذخیره شد. (' + selectedHostIds.length + ' هاست انتخاب شد)');
        } else {
          const err = await res.json();
          alert('خطا در ذخیره: ' + (err.detail || 'مشکلی پیش آمد'));
        }
      } catch (e) {
        alert('خطای ارتباط با سرور: ' + e.message);
      }
    };

    // Scan now button
    document.getElementById('cleanip-trigger-scan').onclick = async () => {
      const btn = document.getElementById('cleanip-trigger-scan');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> در حال تست و اعمال...`;
      btn.disabled = true;

      try {
        const res = await fetch('/api/cleanip/scan-and-apply', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
          alert('✅ ' + data.message + '\n\nآی‌پی‌های جدید: ' + (data.applied_ips || []).join(', '));
          modal.remove();
        } else {
          alert('❌ خطا: ' + (data.detail || 'اسکن ناموفق بود. ابتدا یک هاست هدف انتخاب و ذخیره کنید.'));
        }
      } catch (e) {
        alert('خطای ارتباط: ' + e.message);
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    };
  }

  // Self-healing DOM observer to keep the tab visible across React re-renders
  const observer = new MutationObserver(() => injectNavTab());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(injectNavTab, 500);
})();
