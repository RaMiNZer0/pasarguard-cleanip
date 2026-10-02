/**
 * PasarGuard Auto Clean IP - Web UI Dashboard Extension
 * Version 1.4.0
 * Centered tabbed dialog with isolated pure CSS, smooth scrolling, and 1-click in-panel updater.
 */
(() => {
  'use strict';

  const TAB_ID = 'pg-cleanip-nav-button';
  const MODAL_ID = 'pg-cleanip-modal-overlay';
  const STYLES_ID = 'pg-cleanip-injected-styles';
  const VERSION = '1.4.0';

  // Inject Self-Contained Isolated CSS (Zero Tailwind dependency)
  function injectStyles() {
    if (document.getElementById(STYLES_ID)) return;
    const style = document.createElement('style');
    style.id = STYLES_ID;
    style.textContent = `
      .pg-cleanip-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.72) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        z-index: 999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 16px !important;
        box-sizing: border-box !important;
      }
      .pg-cleanip-card {
        width: 95% !important;
        max-width: 580px !important;
        height: 580px !important;
        max-height: 85vh !important;
        background: #18181b !important;
        color: #f4f4f5 !important;
        border: 1px solid #27272a !important;
        border-radius: 16px !important;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        direction: rtl !important;
        font-family: inherit !important;
        position: relative !important;
      }
      html:not(.dark) .pg-cleanip-card {
        background: #ffffff !important;
        color: #18181b !important;
        border: 1px solid #e4e4e7 !important;
        box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.2) !important;
      }
      .pg-cleanip-header {
        flex-shrink: 0 !important;
        padding: 14px 18px !important;
        border-bottom: 1px solid #27272a !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        background: inherit !important;
      }
      html:not(.dark) .pg-cleanip-header {
        border-bottom: 1px solid #f4f4f5 !important;
      }
      .pg-cleanip-tabs-bar {
        flex-shrink: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 6px 14px !important;
        background: rgba(39, 39, 42, 0.5) !important;
        border-bottom: 1px solid #27272a !important;
      }
      html:not(.dark) .pg-cleanip-tabs-bar {
        background: #f4f4f5 !important;
        border-bottom: 1px solid #e4e4e7 !important;
      }
      .pg-cleanip-tab-btn {
        flex: 1 !important;
        padding: 8px 10px !important;
        border-radius: 8px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        border: none !important;
        background: transparent !important;
        color: #a1a1aa !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        transition: all 0.15s ease !important;
      }
      .pg-cleanip-tab-btn:hover {
        color: #f4f4f5 !important;
      }
      html:not(.dark) .pg-cleanip-tab-btn:hover {
        color: #18181b !important;
      }
      .pg-cleanip-tab-btn.active {
        background: #18181b !important;
        color: #10b981 !important;
        font-weight: 700 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
      }
      html:not(.dark) .pg-cleanip-tab-btn.active {
        background: #ffffff !important;
        color: #059669 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
      }
      .pg-cleanip-body {
        flex: 1 1 0% !important;
        overflow-y: auto !important;
        padding: 14px 18px !important;
        min-height: 0 !important;
        box-sizing: border-box !important;
      }
      .pg-cleanip-footer {
        flex-shrink: 0 !important;
        padding: 12px 18px !important;
        border-top: 1px solid #27272a !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        background: inherit !important;
      }
      html:not(.dark) .pg-cleanip-footer {
        border-top: 1px solid #f4f4f5 !important;
      }
      .pg-cleanip-body::-webkit-scrollbar {
        width: 6px !important;
      }
      .pg-cleanip-body::-webkit-scrollbar-track {
        background: transparent !important;
      }
      .pg-cleanip-body::-webkit-scrollbar-thumb {
        background: #3f3f46 !important;
        border-radius: 9999px !important;
      }
      html:not(.dark) .pg-cleanip-body::-webkit-scrollbar-thumb {
        background: #d4d4d8 !important;
      }
      .pg-cleanip-sticky-bar {
        position: sticky !important;
        top: -14px !important;
        z-index: 10 !important;
        background: #18181b !important;
        padding: 6px 0 10px 0 !important;
        margin-bottom: 8px !important;
        border-bottom: 1px solid #27272a !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
      }
      html:not(.dark) .pg-cleanip-sticky-bar {
        background: #ffffff !important;
        border-bottom: 1px solid #e4e4e7 !important;
      }
      .pg-cleanip-host-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 9px 12px !important;
        border-radius: 9px !important;
        border: 1px solid #27272a !important;
        margin-bottom: 6px !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
        background: rgba(255, 255, 255, 0.02) !important;
      }
      html:not(.dark) .pg-cleanip-host-row {
        border-color: #f4f4f5 !important;
        background: rgba(0, 0, 0, 0.01) !important;
      }
      .pg-cleanip-host-row:hover {
        background: rgba(16, 185, 129, 0.08) !important;
        border-color: rgba(16, 185, 129, 0.35) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  function injectNavTab() {
    injectStyles();

    // 1. Floating pill button
    if (!document.getElementById('pg-cleanip-floating-pill')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'pg-cleanip-floating-pill';
      floatBtn.type = 'button';
      floatBtn.style.cssText = `
        position: fixed !important;
        bottom: 22px !important;
        right: 22px !important;
        z-index: 9999 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 8px 16px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        border-radius: 9999px !important;
        color: #10b981 !important;
        background: rgba(24, 24, 27, 0.92) !important;
        border: 1px solid rgba(16, 185, 129, 0.4) !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4) !important;
        backdrop-filter: blur(8px) !important;
        cursor: pointer !important;
      `;
      floatBtn.innerHTML = `
        <span style="font-size:14px;">🛡️</span>
        <span>Clean IP</span>
        <span style="width:7px; height:7px; border-radius:50%; background:#10b981; display:inline-block;"></span>
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
        li.style.cssText = 'padding: 2px 8px !important; list-style: none !important;';
        li.innerHTML = `
          <button type="button" style="width:100%; display:flex; align-items:center; gap:10px; padding:8px 12px; font-size:12px; font-weight:500; border-radius:8px; color:#10b981; background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.2); cursor:pointer;">
            <span style="font-size:14px;">🛡️</span>
            <span>Clean IP Auto-Pilot</span>
            <span style="margin-right:auto; width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
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
    injectStyles();

    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'pg-cleanip-overlay';
    document.body.appendChild(overlay);

    // 1. Close when clicking background outside dialog card
    overlay.onclick = (e) => {
      if (e.target === overlay) {
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

    // 3. Auto-close when user navigates to another page
    const initialUrl = window.location.href;
    const routeCheck = setInterval(() => {
      if (!document.getElementById(MODAL_ID)) {
        clearInterval(routeCheck);
        return;
      }
      if (window.location.href !== initialUrl) {
        closeModal();
        clearInterval(routeCheck);
      }
    }, 200);

    // Loading State
    overlay.innerHTML = `
      <div class="pg-cleanip-card" style="height:auto; padding:40px; text-align:center;">
        <div style="width:32px; height:32px; border:3px solid #10b981; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 16px;"></div>
        <p style="font-size:13px; font-weight:500;">در حال بارگذاری اطلاعات Clean IP...</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>
    `;

    try {
      const [statusRes, hostsRes, updateRes] = await Promise.all([
        fetch('/api/cleanip/status', { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ({})),
        fetch('/api/cleanip/hosts', { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ([])),
        fetch('/api/cleanip/check-update', { headers: getAuthHeaders() }).then(r => r.json()).catch(() => ({}))
      ]);

      renderModalContent(overlay, statusRes, hostsRes, updateRes);
    } catch (err) {
      overlay.innerHTML = `
        <div class="pg-cleanip-card" style="height:auto; max-width:400px; padding:24px; text-align:center;">
          <p style="color:#ef4444; font-weight:600; font-size:14px; margin-bottom:8px;">خطا در ارتباط با سرور</p>
          <p style="color:#71717a; font-size:12px; margin-bottom:16px;">${err.message || 'لطفاً وضعیت سرویس را بررسی کنید.'}</p>
          <button id="close-err-btn" style="padding:8px 16px; border-radius:8px; background:#27272a; color:#fff; border:none; cursor:pointer;">بستن</button>
        </div>
      `;
      document.getElementById('close-err-btn').onclick = closeModal;
    }
  }

  function renderModalContent(overlay, statusData, hostsList, updateData) {
    const settings = statusData?.settings || {};
    const latest = statusData?.latest_update;
    const targetHostIds = Array.isArray(settings.target_host_ids) ? settings.target_host_ids : (settings.target_host_id ? [settings.target_host_id] : []);
    const hasUpdate = updateData?.has_update;

    overlay.innerHTML = `
      <div class="pg-cleanip-card">
        
        <!-- Header (Fixed Top) -->
        <div class="pg-cleanip-header">
          <button id="cleanip-close-x" style="background:none; border:none; color:#a1a1aa; font-size:18px; font-weight:bold; cursor:pointer; padding:4px 8px; border-radius:6px;">✕</button>
          <div style="display:flex; align-items:center; gap:10px;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-weight:700; font-size:14px;">مدیریت Clean IP</span>
                <span style="font-size:10px; padding:2px 8px; border-radius:9999px; background:rgba(16,185,129,0.15); color:#10b981; font-weight:600;">v${VERSION}</span>
                ${hasUpdate ? '<span style="font-size:10px; padding:2px 8px; border-radius:9999px; background:#f59e0b; color:#000; font-weight:700;">آپدیت جدید!</span>' : ''}
              </div>
              <p style="font-size:11px; color:#71717a; margin-top:2px;">نوسازی خودکار آی‌پی‌های تمیز کلودفلر</p>
            </div>
            <div style="width:34px; height:34px; border-radius:10px; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; font-size:16px;">🛡️</div>
          </div>
        </div>

        <!-- In-Panel Auto-Update Banner (if available) -->
        ${hasUpdate ? `
          <div id="cleanip-update-banner" style="margin:8px 16px 0; padding:10px 14px; border-radius:10px; background:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.35); display:flex; align-items:center; justify-content:space-between; font-size:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">🚀</span>
              <div>
                <span style="font-weight:700; color:#f59e0b;">نسخه جدید (${updateData.latest_version}) آماده نصب است!</span>
                <p style="font-size:11px; color:#a1a1aa; margin-top:2px;">${updateData.changelog || 'بهینه‌سازی کارایی و حل باگ‌ها'}</p>
              </div>
            </div>
            <button id="cleanip-oneclick-update-btn" style="padding:6px 12px; border-radius:8px; background:#f59e0b; color:#000; font-weight:700; font-size:11px; border:none; cursor:pointer;">
              آپدیت فوری ⚡
            </button>
          </div>
        ` : ''}

        <!-- Tabs Bar (Fixed Top) -->
        <div class="pg-cleanip-tabs-bar">
          <button id="tab-btn-hosts" class="pg-cleanip-tab-btn active">
            <span>🎯 هاست‌های هدف</span>
            <span id="cleanip-tab-hosts-count" style="font-size:10px; padding:1px 6px; border-radius:9999px; background:rgba(16,185,129,0.2); font-weight:700;">${targetHostIds.length}</span>
          </button>
          <button id="tab-btn-config" class="pg-cleanip-tab-btn">
            <span>⚙️ تنظیمات اسکن</span>
          </button>
          <button id="tab-btn-status" class="pg-cleanip-tab-btn">
            <span>📊 وضعیت و آپدیت</span>
            ${hasUpdate ? '<span style="width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span>' : ''}
          </button>
        </div>

        <!-- Alert Banner -->
        <div id="cleanip-alert-banner" style="display:none; margin:8px 16px 0; padding:8px 12px; border-radius:8px; font-size:12px;"></div>

        <!-- Main Body: Single Unified Scroll Container -->
        <div class="pg-cleanip-body">
          
          <!-- TAB 1: HOSTS -->
          <div id="cleanip-pane-hosts">
            <!-- Sticky Filter Toolbar -->
            <div class="pg-cleanip-sticky-bar">
              <input type="text" id="cleanip-search-input" placeholder="🔍 جستجو در نام، پورت، تگ..." style="flex:1; min-width:0; padding:7px 12px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:12px; outline:none;">
              <button id="cleanip-select-cdn-btn" type="button" style="padding:6px 10px; border-radius:8px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap;">
                ✓ انتخاب همه CDN
              </button>
              <button id="cleanip-deselect-all-btn" type="button" style="padding:6px 8px; border-radius:8px; background:none; border:none; color:#71717a; font-size:11px; cursor:pointer; white-space:nowrap;">
                ✕ لغو همه
              </button>
            </div>

            <!-- Hosts List -->
            <div id="cleanip-hosts-list">
              ${hostsList.length === 0 ? '<p style="font-size:12px; color:#71717a; text-align:center; padding:30px 0;">هیچ هاستی یافت نشد.</p>' : ''}
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
                  <label class="pg-cleanip-host-row" data-is-cdn="${isCdn ? '1' : '0'}" data-search="${searchText}" style="${isReality || isDummyStatus ? 'opacity:0.55;' : ''}">
                    <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
                      <input type="checkbox" class="cleanip-host-cb" style="width:16px; height:16px; accent-color:#10b981; cursor:pointer; flex-shrink:0;" value="${h.id}" ${isChecked ? 'checked' : ''}>
                      <div style="display:flex; flex-direction:column; min-width:0;">
                        <span style="font-weight:600; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; unicode-bidi:plaintext;" dir="auto">
                          ${h.remark || 'Host #' + h.id}
                        </span>
                        <span style="font-size:10px; color:#71717a; font-family:monospace; margin-top:2px;">${h.inbound_tag || 'Port ' + (effectivePort || 'Auto')}</span>
                      </div>
                    </div>
                    <div style="flex-shrink:0; margin-right:8px;">
                      ${isCdn ? `
                        <span style="display:inline-flex; align-items:center; gap:4px; font-size:10px; padding:2px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; font-family:monospace; font-weight:600; border:1px solid rgba(16,185,129,0.3);">
                          ☁️ CDN ${effectivePort ? `(پورت ${effectivePort})` : ''}
                        </span>
                      ` : (isReality ? `
                        <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:rgba(245,158,11,0.12); color:#f59e0b; border:1px solid rgba(245,158,11,0.25);">
                          ⚡ Reality
                        </span>
                      ` : `
                        <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.06); color:#71717a;">
                          مستقیم / سایر
                        </span>
                      `)}
                    </div>
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- TAB 2: CONFIG -->
          <div id="cleanip-pane-config" style="display:none; flex-direction:column; gap:14px; font-size:12px;">
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:10px;">
              <span style="font-weight:600;">اپراتورهای هدف جهت دریافت آی‌پی‌های تمیز:</span>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                <label style="display:flex; align-items:center; justify-content:space-between; padding:9px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>همراه اول</span>
                  <input type="checkbox" id="isp-mci" value="mci" ${settings.enabled_isps?.includes('mci') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
                <label style="display:flex; align-items:center; justify-content:space-between; padding:9px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>ایرانسل</span>
                  <input type="checkbox" id="isp-mtn" value="mtn" ${settings.enabled_isps?.includes('mtn') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
                <label style="display:flex; align-items:center; justify-content:space-between; padding:9px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>مخابرات / Wifi</span>
                  <input type="checkbox" id="isp-wifi" value="wifi" ${settings.enabled_isps?.includes('wifi') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div style="padding:12px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:6px;">
                <label style="font-weight:600;">بازه بروزرسانی خودکار:</label>
                <select id="cleanip-interval-select" style="width:100%; padding:8px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:12px; outline:none;">
                  <option value="1" ${settings.auto_interval_hours === 1 ? 'selected' : ''}>هر ۱ ساعت</option>
                  <option value="2" ${settings.auto_interval_hours === 2 ? 'selected' : ''}>هر ۲ ساعت</option>
                  <option value="3" ${!settings.auto_interval_hours || settings.auto_interval_hours === 3 ? 'selected' : ''}>هر ۳ ساعت (پیشنهادی)</option>
                  <option value="6" ${settings.auto_interval_hours === 6 ? 'selected' : ''}>هر ۶ ساعت</option>
                  <option value="12" ${settings.auto_interval_hours === 12 ? 'selected' : ''}>هر ۱۲ ساعت</option>
                </select>
              </div>
              <div style="padding:12px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:6px;">
                <label style="font-weight:600;">تعداد IP برای هر اپراتور:</label>
                <input type="number" id="cleanip-limit-input" min="1" max="5" value="${settings.limit_per_isp || 2}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:12px; box-sizing:border-box; outline:none;">
              </div>
            </div>

            <div style="padding:12px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.1); color:#a1a1aa; font-size:11px; line-height:1.6;">
              💡 <b>نکته مهم ایمنی:</b> آی‌پی‌های تمیز فقط روی هاست‌هایی اعمال می‌شوند که در تب «هاست‌های هدف» تیک زده‌اید. هاست‌های Reality و Status به صورت خودکار محافظت می‌شوند.
            </div>
          </div>

          <!-- TAB 3: STATUS & UPDATE -->
          <div id="cleanip-pane-status" style="display:none; flex-direction:column; gap:12px; font-size:12px;">
            <div style="padding:14px; border-radius:10px; border:1px solid rgba(16,185,129,0.3); background:rgba(16,185,129,0.08); display:flex; align-items:center; justify-content:space-between;">
              <div>
                <span style="font-weight:700; color:#10b981; display:block;">موتور هوشمند Clean IP:</span>
                <p style="font-size:11px; color:#71717a; margin-top:2px;">اسکن و تزریق بدون قطعی و با پینگ زنده در پس‌زمینه در حال کار است.</p>
              </div>
              <span style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:9999px; background:rgba(16,185,129,0.2); color:#10b981; font-weight:700; font-size:11px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#10b981;"></span>
                فعال
              </span>
            </div>

            <!-- In-Panel Online Auto-Update Card -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight:600;">بروزرسانی آنلاین و خودکار:</span>
                <span style="font-family:monospace; font-size:11px; padding:2px 8px; border-radius:6px; background:rgba(255,255,255,0.08);">نسخه فعلی: v${VERSION}</span>
              </div>
              <p style="font-size:11px; color:#71717a;">با یک کلیک بدون نیاز به ورود به SSH سرور، آخرین کدهای افزونه از گیت‌هاب دریافت و جایگزین می‌شوند.</p>
              <button id="cleanip-manual-update-btn" type="button" style="width:100%; padding:9px; border-radius:8px; background:#27272a; color:#fff; border:1px solid #3f3f46; font-weight:600; font-size:12px; cursor:pointer;">
                🔄 بررسی و بروزرسانی خودکار افزونه
              </button>
            </div>

            <!-- Latest Clean IPs List -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight:600;">آی‌پی‌های تمیز اعمال‌شده اخیر:</span>
                <span style="font-size:10px; color:#71717a; font-family:monospace;">${latest?.timestamp ? new Date(latest.timestamp).toLocaleTimeString('fa-IR') : 'هنوز تستی انجام نشده'}</span>
              </div>
              <div id="cleanip-active-ips-list" style="display:flex; flex-wrap:wrap; gap:6px; font-family:monospace; font-size:11px;">
                ${(latest?.applied_ips || []).length > 0 ? (latest.applied_ips).map(ip => `
                  <span style="padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">
                    ${ip}
                  </span>
                `).join('') : '<span style="color:#71717a;">هنوز اسکن جدیدی انجام نشده است.</span>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Action Buttons (Fixed Bottom) -->
        <div class="pg-cleanip-footer">
          <button id="cleanip-trigger-scan" type="button" style="flex:1; padding:10px 14px; border-radius:10px; background:#10b981; color:#fff; border:none; font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
            <span>⚡ اسکن و اعمال فوری</span>
          </button>
          <button id="cleanip-save-settings" type="button" style="padding:10px 16px; border-radius:10px; background:#27272a; color:#f4f4f5; border:1px solid #3f3f46; font-weight:600; font-size:12px; cursor:pointer;">
            ذخیره تنظیمات
          </button>
          <button id="cleanip-footer-close" type="button" style="padding:10px 14px; border-radius:10px; background:none; color:#71717a; border:none; font-size:12px; cursor:pointer;">
            بستن
          </button>
        </div>
      </div>
    `;

    // Close buttons
    document.getElementById('cleanip-close-x').onclick = closeModal;
    document.getElementById('cleanip-footer-close').onclick = closeModal;

    // Tab switching
    const tabHosts = document.getElementById('tab-btn-hosts');
    const tabConfig = document.getElementById('tab-btn-config');
    const tabStatus = document.getElementById('tab-btn-status');

    const paneHosts = document.getElementById('cleanip-pane-hosts');
    const paneConfig = document.getElementById('cleanip-pane-config');
    const paneStatus = document.getElementById('cleanip-pane-status');

    function switchTab(btnActive, paneActive) {
      [tabHosts, tabConfig, tabStatus].forEach(b => b.classList.remove('active'));
      btnActive.classList.add('active');

      paneHosts.style.display = 'none';
      paneConfig.style.display = 'none';
      paneStatus.style.display = 'none';

      paneActive.style.display = 'flex';
      paneActive.style.flexDirection = 'column';
    }

    tabHosts.onclick = () => switchTab(tabHosts, paneHosts);
    tabConfig.onclick = () => switchTab(tabConfig, paneConfig);
    tabStatus.onclick = () => switchTab(tabStatus, paneStatus);

    // Selected count badge
    function updateSelectedCount() {
      const count = document.querySelectorAll('.cleanip-host-cb:checked').length;
      const countBadge = document.getElementById('cleanip-tab-hosts-count');
      if (countBadge) countBadge.innerText = count;
    }
    updateSelectedCount();

    document.querySelectorAll('.cleanip-host-cb').forEach(cb => {
      cb.addEventListener('change', updateSelectedCount);
    });

    // Quick Search
    const searchInput = document.getElementById('cleanip-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.trim().toLowerCase();
        document.querySelectorAll('.pg-cleanip-host-row').forEach(row => {
          const text = row.getAttribute('data-search') || '';
          row.style.display = text.includes(query) ? 'flex' : 'none';
        });
      };
    }

    // Select all CDN button
    document.getElementById('cleanip-select-cdn-btn').onclick = () => {
      document.querySelectorAll('#cleanip-hosts-list label').forEach(lbl => {
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
      banner.style.display = 'block';
      if (type === 'error') {
        banner.style.background = 'rgba(239, 68, 68, 0.15)';
        banner.style.color = '#ef4444';
        banner.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      } else {
        banner.style.background = 'rgba(16, 185, 129, 0.15)';
        banner.style.color = '#10b981';
        banner.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      }
      banner.innerHTML = message;
    }

    // In-Panel One-Click Auto-Updater
    const runSelfUpdate = async (btn) => {
      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `در حال دریافت و نصب...`;
      showBanner('success', '⏳ در حال دریافت فایل‌های آپدیت و جایگزینی در پنل...');

      try {
        const res = await fetch('/api/cleanip/self-update', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        const data = await res.json();

        if (res.ok) {
          showBanner('success', `🎉 ${data.message} صفحه در ۲ ثانیه آینده خودکار ریفرش می‌شود...`);
          setTimeout(() => location.reload(), 2000);
        } else {
          showBanner('error', `❌ خطا در بروزرسانی: ${data.detail || 'ناموفق بود'}`);
          btn.innerHTML = originalHtml;
          btn.disabled = false;
        }
      } catch (err) {
        showBanner('error', `خطای شبکه: ${err.message}`);
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      }
    };

    const oneClickBtn = document.getElementById('cleanip-oneclick-update-btn');
    if (oneClickBtn) oneClickBtn.onclick = () => runSelfUpdate(oneClickBtn);

    const manualBtn = document.getElementById('cleanip-manual-update-btn');
    if (manualBtn) manualBtn.onclick = () => runSelfUpdate(manualBtn);

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
          showBanner('error', `❌ خطا: ${data.detail || 'نامشخص'}`);
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
      
      if (payload.target_host_ids.length === 0) {
        switchTab(tabHosts, paneHosts);
        showBanner('error', '⚠️ لطفاً حداقل یک هاست را از تب «هاست‌های هدف» تیک بزنید.');
        return;
      }

      const btn = document.getElementById('cleanip-trigger-scan');
      const originalText = btn.innerHTML;
      btn.innerHTML = `در حال تست پینگ و اعمال...`;
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
            <div style="display:flex; flex-direction:column; gap:4px;">
              <p style="font-weight:700;">✅ ${data.message}</p>
              <p style="font-size:11px;">هاست‌های آپدیت‌شده: ${updatedNames.join(' ، ')}</p>
            </div>
          `);

          // Update active IPs in Status pane
          const activeIpsList = document.getElementById('cleanip-active-ips-list');
          if (activeIpsList && appliedIps.length > 0) {
            activeIpsList.innerHTML = appliedIps.map(ip => `
              <span style="padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">
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
