/**
 * PasarGuard Auto Clean IP - Web UI Dashboard Extension
 * Version 1.7.1
 * Features:
 *  - Interactive Clean IP live ping testing & manual candidate selection
 *  - Dual testing modes: High-speed server ping & In-browser client probe
 *  - 3-tier Cloudflare Infrastructure Diagnostic (DNS proxy, Clean IP TLS, Origin core probe)
 *  - Centered isolated-CSS modal with unified smooth scrolling
 *  - Multi-feed operator-based clean IP engine (IRCF / vfarid)
 *  - Custom clean IP input with priority injection
 *  - Iranian relay node detection
 *  - 1-click in-panel self-updater
 */
(() => {
  'use strict';

  const TAB_ID = 'pg-cleanip-nav-button';
  const MODAL_ID = 'pg-cleanip-modal-overlay';
  const STYLES_ID = 'pg-cleanip-injected-styles';
  const VERSION = '1.7.1';

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
        max-width: 610px !important;
        height: 610px !important;
        max-height: 88vh !important;
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
      .pg-cleanip-ip-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 7px 10px !important;
        border-radius: 8px !important;
        border: 1px solid #27272a !important;
        background: rgba(255, 255, 255, 0.02) !important;
        transition: all 0.15s ease !important;
      }
      .pg-cleanip-ip-row:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        border-color: #3f3f46 !important;
      }
      .pg-cleanip-ip-row.selected {
        background: rgba(16, 185, 129, 0.08) !important;
        border-color: rgba(16, 185, 129, 0.35) !important;
      }
      .pg-cleanip-filter-chip {
        padding: 3px 8px !important;
        border-radius: 9999px !important;
        font-size: 10px !important;
        cursor: pointer !important;
        border: 1px solid #3f3f46 !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #a1a1aa !important;
        transition: all 0.15s !important;
      }
      .pg-cleanip-filter-chip.active {
        background: #10b981 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        border-color: #10b981 !important;
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
    const iranNode = statusData?.iran_node || { available: false };

    overlay.innerHTML = `
      <div class="pg-cleanip-card">
        
        <!-- Header (Fixed Top) -->
        <div class="pg-cleanip-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:34px; height:34px; border-radius:10px; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; font-size:16px;">🛡️</div>
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-weight:700; font-size:14px;">مدیریت Clean IP</span>
                <span style="font-size:10px; padding:2px 8px; border-radius:9999px; background:rgba(16,185,129,0.15); color:#10b981; font-weight:600;">v${VERSION}</span>
                ${hasUpdate ? '<span style="font-size:10px; padding:2px 8px; border-radius:9999px; background:#f59e0b; color:#000; font-weight:700;">آپدیت جدید!</span>' : ''}
              </div>
              <p style="font-size:11px; color:#71717a; margin-top:2px;">نوسازی خودکار آی‌پی‌های تمیز کلودفلر</p>
            </div>
          </div>
          <button id="cleanip-close-x" style="background:none; border:none; color:#a1a1aa; font-size:18px; font-weight:bold; cursor:pointer; padding:4px 8px; border-radius:6px;">✕</button>
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
          <button id="tab-btn-ping" class="pg-cleanip-tab-btn">
            <span>⚡ تست پینگ و انتخاب آی‌پی</span>
            <span id="cleanip-tab-selected-ips-count" style="font-size:10px; padding:1px 6px; border-radius:9999px; background:rgba(16,185,129,0.2); font-weight:700;">0</span>
          </button>
          <button id="tab-btn-config" class="pg-cleanip-tab-btn">
            <span>⚙️ تنظیمات و عیب‌یابی</span>
            ${hasUpdate ? '<span style="width:6px; height:6px; border-radius:50%; background:#f59e0b;"></span>' : ''}
          </button>
        </div>

        <!-- Main Body: Single Unified Scroll Container -->
        <div class="pg-cleanip-body">
          <!-- Alert Banner (Scrolls naturally with content) -->
          <div id="cleanip-alert-banner" style="display:none; margin-bottom:10px; padding:9px 14px; border-radius:8px; font-size:12px;"></div>
          
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
                    <div style="flex-shrink:0; margin-right:8px; display:flex; align-items:center; gap:6px;">
                      ${isCdn ? `
                        <button type="button" class="cleanip-quick-diag-btn" data-host-id="${h.id}" title="تست و عیب‌یابی زیرساخت کلودفلر" style="padding:2px 7px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:10px; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">
                          🩺 تست زیرساخت
                        </button>
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
            <!-- Jump to Tab 2 guidance -->
            <div style="margin-top:10px; padding:10px 12px; border-radius:8px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <span style="font-size:11px; color:#10b981;">👈 هاست‌های مدنظرتان را تیک زدید؟ برای تست پینگ و انتخاب آی‌پی‌ها وارد مرحله بعد شوید:</span>
              <button id="cleanip-goto-ping-btn" type="button" style="padding:5px 12px; border-radius:6px; background:#10b981; color:#fff; border:none; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap;">
                مرحله بعد: تست پینگ ⚡
              </button>
            </div>
          </div>

          <!-- TAB 2: PING TEST & MANUAL IP SELECTION -->
          <div id="cleanip-pane-ping" style="display:none; flex-direction:column; gap:10px; font-size:12px;">
            <!-- Control Header Card -->
            <div style="padding:12px 14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:10px;">
              <!-- Header Title -->
              <div>
                <span style="font-weight:700; font-size:13px; display:block; color:#10b981;">⚡ تست زنده پینگ و گزینش آی‌پی‌های تمیز</span>
                <p style="font-size:11px; color:#71717a; margin-top:2px;">پینگ آی‌پی‌ها را بسنجید، هر کدام که پینگ سبز و عالی داشت تیک بزنید و اعمال کنید.</p>
              </div>

              <!-- Action Bar -->
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <button id="cleanip-ping-all-btn" type="button" style="padding:7px 14px; border-radius:8px; background:#10b981; color:#fff; border:none; font-weight:700; font-size:11px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                  ⚡ تست پینگ همه آی‌پی‌ها
                </button>
                <select id="cleanip-ping-mode-select" style="padding:6px 8px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:11px; outline:none; cursor:pointer;">
                  <option value="server">🌐 تست از سرور (سریع)</option>
                  <option value="browser">💻 تست از مرورگر شما</option>
                </select>
                <button id="cleanip-toggle-manual-btn" type="button" style="padding:6px 10px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid #3f3f46; color:#e4e4e7; font-size:11px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                  ➕ افزودن دستی
                </button>
                <button id="cleanip-discover-cf-btn" type="button" style="padding:6px 10px; border-radius:8px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); color:#38bdf8; font-size:11px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                  🎲 اسکن رنج‌های کلودفلر
                </button>
              </div>

              <!-- Expandable Manual Add Drawer -->
              <div id="cleanip-manual-drawer" style="display:none; padding:10px; border-radius:8px; background:rgba(0,0,0,0.25); border:1px solid #3f3f46; flex-direction:column; gap:6px;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                  <span style="font-size:11px; font-weight:600; color:#10b981;">➕ چسباندن آی‌پی‌های دلخواه:</span>
                  <span style="font-size:10px; color:#71717a;">با کاما، فاصله یا اینتر جدا کنید</span>
                </div>
                <div style="display:flex; gap:6px;">
                  <input type="text" id="cleanip-manual-ips-input" placeholder="مثال: 104.16.24.11, 104.17.150.10, 162.159.136.2" style="flex:1; padding:7px 10px; border-radius:6px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:11px; font-family:monospace; outline:none;">
                  <button id="cleanip-manual-add-submit-btn" type="button" style="padding:7px 12px; border-radius:6px; background:#10b981; color:#fff; border:none; font-weight:700; font-size:11px; cursor:pointer; white-space:nowrap;">
                    افزودن ↵
                  </button>
                </div>
              </div>

              <!-- Quick Selectors & Filters -->
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <button type="button" class="pg-cleanip-filter-chip active" data-isp="all">همه (<span id="count-all">0</span>)</button>
                  <button type="button" class="pg-cleanip-filter-chip" data-isp="mci">همراه اول (<span id="count-mci">0</span>)</button>
                  <button type="button" class="pg-cleanip-filter-chip" data-isp="mtn">ایرانسل (<span id="count-mtn">0</span>)</button>
                  <button type="button" class="pg-cleanip-filter-chip" data-isp="wifi">مخابرات/Wifi (<span id="count-wifi">0</span>)</button>
                  <button type="button" class="pg-cleanip-filter-chip" data-isp="custom">سفارشی (<span id="count-custom">0</span>)</button>
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <button id="cleanip-select-best-btn" type="button" style="padding:4px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:10px; font-weight:600; cursor:pointer;">
                    ✓ انتخاب بهترین‌ها
                  </button>
                  <button id="cleanip-select-healthy-btn" type="button" style="padding:4px 8px; border-radius:6px; background:rgba(255,255,255,0.06); color:#a1a1aa; border:1px solid #3f3f46; font-size:10px; cursor:pointer;">
                    ✓ انتخاب همه سالم‌ها
                  </button>
                  <button id="cleanip-deselect-ips-btn" type="button" style="padding:4px 6px; border-radius:6px; background:none; color:#71717a; border:none; font-size:10px; cursor:pointer;">
                    ✕ لغو
                  </button>
                </div>
              </div>
            </div>

            <!-- Candidate IPs Table / List -->
            <div id="cleanip-candidates-table" style="display:flex; flex-direction:column; gap:6px; padding:2px;">
              <div style="text-align:center; padding:20px; color:#71717a;">در حال بارگذاری لیست آی‌پی‌های تمیز...</div>
            </div>

            <!-- Apply Selected IPs Action Bar -->
            <div style="padding:10px 14px; border-radius:10px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); display:flex; align-items:center; justify-content:space-between; gap:10px;">
              <div>
                <span style="font-weight:700; color:#10b981;">اعمال آی‌پی‌های تیک‌خورده:</span>
                <span id="cleanip-selected-summary" style="display:block; font-size:11px; color:#a1a1aa; margin-top:2px;">۰ آی‌پی انتخاب شده</span>
              </div>
              <button id="cleanip-apply-selected-btn" type="button" style="padding:8px 16px; border-radius:8px; background:#10b981; color:#fff; border:none; font-weight:700; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                🚀 اعمال روی هاست‌های انتخابی
              </button>
            </div>
          </div>

          <!-- TAB 3: CONFIG & DIAGNOSTIC -->
          <div id="cleanip-pane-config" style="display:none; flex-direction:column; gap:12px; font-size:12px;">
            <!-- End-to-End Infrastructure Diagnostic Section -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:10px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight:700; color:#10b981; display:flex; align-items:center; gap:6px;">
                  🩺 عیب‌یابی هوشمند زیرساخت کلودفلر (۳ لایه):
                </span>
              </div>
              <p style="font-size:11px; color:#71717a; margin:0; line-height:1.5;">
                تست خودکار و بدون نیاز به کلاینت: بررسی ابر نارنجی کلودفلر، هندشیک امنیتی TLS روی Clean IP، و پاسخگویی هسته سرور پاسارگارد.
              </p>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <select id="cleanip-diag-host-select" style="flex:1; min-width:180px; padding:8px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:12px; outline:none;">
                  ${hostsList.map(h => `<option value="${h.id}">${h.remark || 'Host #' + h.id} (${h.sni || (Array.isArray(h.address)?h.address[0]:h.address) || 'Port ' + (h.port || '443')})</option>`).join('')}
                </select>
                <button id="cleanip-run-diag-btn" type="button" style="padding:8px 14px; border-radius:8px; background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4); font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                  🚀 شروع عیب‌یابی زیرساخت
                </button>
              </div>
              <div id="cleanip-diag-result-container" style="display:none; flex-direction:column; gap:8px; padding:10px; border-radius:8px; background:rgba(0,0,0,0.25); border:1px solid #27272a; font-size:11px;"></div>
            </div>

            <!-- Custom Clean IPs Section -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <label style="font-weight:600;">آی‌پی‌های تمیز اختصاصی (Custom Clean IPs):</label>
                <span style="font-size:10px; padding:2px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; font-weight:700;">اولویت اول ⚡</span>
              </div>
              <p style="font-size:11px; color:#71717a;">آی‌پی‌های اختصاصی خود را وارد کنید تا بلافاصله در تب تست پینگ نمایش داده شوند (با اینتر جدا کنید):</p>
              <textarea id="cleanip-custom-ips-input" rows="3" placeholder="مثال:&#10;104.16.24.11&#10;104.17.150.10" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); color:inherit; font-size:12px; font-family:monospace; box-sizing:border-box; outline:none; resize:vertical;">${(settings.custom_ips || []).join('\n')}</textarea>
            </div>

            <!-- Auto Update Interval & Limit -->
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
                <label style="font-weight:600;">تعداد IP خودکار هر اپراتور:</label>
                <input type="number" id="cleanip-limit-input" min="1" max="5" value="${settings.limit_per_isp || 2}" style="width:100%; padding:8px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.05); color:inherit; font-size:12px; box-sizing:border-box; outline:none;">
              </div>
            </div>

            <!-- Target ISPs -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:10px;">
              <span style="font-weight:600;">اپراتورهای هدف دریافت خودکار:</span>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>همراه اول</span>
                  <input type="checkbox" id="isp-mci" value="mci" ${settings.enabled_isps?.includes('mci') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
                <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>ایرانسل</span>
                  <input type="checkbox" id="isp-mtn" value="mtn" ${settings.enabled_isps?.includes('mtn') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
                <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:8px; border:1px solid #3f3f46; background:rgba(255,255,255,0.04); cursor:pointer;">
                  <span>مخابرات/Wifi</span>
                  <input type="checkbox" id="isp-wifi" value="wifi" ${settings.enabled_isps?.includes('wifi') ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981;">
                </label>
              </div>
            </div>

            <!-- Iran Node Relay Section -->
            <div style="padding:12px 14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; align-items:center; justify-content:space-between;">
              <div>
                <span style="font-weight:600; display:block;">اعتبارسنجی از نود ایران (در صورت وجود):</span>
                <p style="font-size:11px; color:#71717a; margin-top:2px;">
                  ${iranNode.available ? `🇮🇷 نود ایران پاسارگارد: <b>${iranNode.name}</b> (${iranNode.address})` : 'نود ایران ثبت‌نشده (تست‌های مستقیم انجام می‌شود)'}
                </p>
              </div>
              <input type="checkbox" id="cleanip-use-iran-node" ${settings.use_iran_node !== false ? 'checked' : ''} style="width:16px; height:16px; accent-color:#10b981; cursor:pointer;">
            </div>

            <!-- In-Panel Online Auto-Update Card -->
            <div style="padding:14px; border-radius:10px; border:1px solid #27272a; background:rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-weight:600;">بروزرسانی آنلاین و خودکار افزونه:</span>
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
                <span style="font-weight:600;">آی‌پی‌های تمیز فعال اخیر روی سرور:</span>
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
    const tabPing = document.getElementById('tab-btn-ping');
    const tabConfig = document.getElementById('tab-btn-config');

    const paneHosts = document.getElementById('cleanip-pane-hosts');
    const panePing = document.getElementById('cleanip-pane-ping');
    const paneConfig = document.getElementById('cleanip-pane-config');

    function switchTab(btnActive, paneActive) {
      const body = document.querySelector('.pg-cleanip-body');
      if (body) body.scrollTop = 0;

      [tabHosts, tabPing, tabConfig].forEach(b => b?.classList.remove('active'));
      btnActive.classList.add('active');

      if (paneHosts) paneHosts.style.display = 'none';
      if (panePing) panePing.style.display = 'none';
      if (paneConfig) paneConfig.style.display = 'none';

      paneActive.style.display = 'flex';
      paneActive.style.flexDirection = 'column';

      const scanBtn = document.getElementById('cleanip-trigger-scan');
      if (scanBtn) {
        if (paneActive === panePing) {
          scanBtn.innerHTML = `<span>🚀 اعمال آی‌پی‌های انتخابی روی هاست‌ها</span>`;
        } else {
          scanBtn.innerHTML = `<span>⚡ اسکن و اعمال فوری</span>`;
        }
      }

      if (paneActive === panePing && candidateIpsList.length === 0) {
        loadCandidates();
      }
    }

    if (tabHosts) tabHosts.onclick = () => switchTab(tabHosts, paneHosts);
    if (tabPing) tabPing.onclick = () => switchTab(tabPing, panePing);
    if (tabConfig) tabConfig.onclick = () => switchTab(tabConfig, paneConfig);

    const gotoPingBtn = document.getElementById('cleanip-goto-ping-btn');
    if (gotoPingBtn) gotoPingBtn.onclick = () => switchTab(tabPing, panePing);

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

      const customIpsText = document.getElementById('cleanip-custom-ips-input')?.value || '';
      const customIps = customIpsText
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(s => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(s));

      const useIranNode = document.getElementById('cleanip-use-iran-node')?.checked ?? true;

      return {
        target_host_ids: selectedHostIds,
        enabled_isps: isps.length > 0 ? isps : ['mci', 'mtn', 'wifi'],
        limit_per_isp: limit,
        auto_pilot: true,
        auto_interval_hours: interval,
        custom_ips: customIps,
        use_iran_node: useIranNode
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
      } else if (type === 'info') {
        banner.style.background = 'rgba(56, 189, 248, 0.15)';
        banner.style.color = '#38bdf8';
        banner.style.border = '1px solid rgba(56, 189, 248, 0.3)';
      } else {
        banner.style.background = 'rgba(16, 185, 129, 0.15)';
        banner.style.color = '#10b981';
        banner.style.border = '1px solid rgba(16, 185, 129, 0.3)';
      }
      banner.innerHTML = message;
    }

    // ==========================================
    // TAB 2: INTERACTIVE CANDIDATE PING & SELECTION WORKSPACE
    // ==========================================
    const DEFAULT_FALLBACK_CANDIDATES = [
      { ip: '104.16.24.11', isp: 'mci', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '104.17.150.10', isp: 'mtn', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '104.16.132.5', isp: 'mci', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '162.159.136.2', isp: 'wifi', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '172.67.180.55', isp: 'mci', provider: 'IRCF/vfarid', quality: 'standard' },
      { ip: '172.64.155.20', isp: 'mtn', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '104.18.2.161', isp: 'mtn', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '104.19.143.10', isp: 'wifi', provider: 'IRCF/vfarid', quality: 'standard' },
      { ip: '104.16.132.22', isp: 'wifi', provider: 'IRCF/vfarid', quality: 'gold' },
      { ip: '172.67.74.88', isp: 'mtn', provider: 'IRCF/vfarid', quality: 'standard' },
      { ip: '104.18.45.67', isp: 'wifi', provider: 'IRCF/vfarid', quality: 'standard' },
      { ip: '162.159.192.1', isp: 'wifi', provider: 'IRCF/vfarid', quality: 'standard' },
      { ip: '108.162.193.15', isp: 'wifi', provider: 'Cloudflare Net', quality: 'standard' },
      { ip: '188.114.96.12', isp: 'wifi', provider: 'Cloudflare Net', quality: 'standard' },
    ];

    let candidateIpsList = [];
    let currentFilterIsp = 'all';
    const candidatesContainer = document.getElementById('cleanip-candidates-table');
    const selectedIpsCountBadge = document.getElementById('cleanip-tab-selected-ips-count');
    const selectedSummaryText = document.getElementById('cleanip-selected-summary');

    function updateSelectedIpsCount() {
      const count = candidateIpsList.filter(c => c.selected === true).length;
      if (selectedIpsCountBadge) selectedIpsCountBadge.innerText = count;
      if (selectedSummaryText) selectedSummaryText.innerText = `${count} آی‌پی انتخاب شده`;
    }

    function updateIspCounts() {
      const counts = { all: candidateIpsList.length, mci: 0, mtn: 0, wifi: 0, custom: 0 };
      candidateIpsList.forEach(c => {
        const isp = c.isp || 'wifi';
        if (counts[isp] !== undefined) counts[isp]++;
      });
      ['all', 'mci', 'mtn', 'wifi', 'custom'].forEach(k => {
        const el = document.getElementById(`count-${k}`);
        if (el) el.innerText = counts[k] || 0;
      });
    }

    const loadCandidates = async () => {
      if (!candidatesContainer) return;
      candidatesContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#71717a;">در حال بارگذاری کاندیداهای Clean IP از فیدها...</div>`;
      try {
        let list = [];
        const res = await fetch('/api/cleanip/candidates', { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          list = data.candidates || [];
        }

        // If backend returned empty or 404 (e.g. backend not updated yet)
        if (list.length === 0) {
          const customIps = settings.custom_ips || [];
          const customItems = customIps.map(ip => ({
            ip: ip.trim(),
            isp: 'custom',
            provider: 'تنظیمات کاربر',
            source: 'custom',
            quality: 'custom'
          })).filter(x => x.ip);

          list = [...customItems, ...DEFAULT_FALLBACK_CANDIDATES];
        }

        candidateIpsList = list.map(c => ({
          ...c,
          selected: false,
          latency_ms: undefined
        }));

        updateIspCounts();
        renderCandidateRows(currentFilterIsp);
      } catch (err) {
        candidateIpsList = DEFAULT_FALLBACK_CANDIDATES.map(c => ({
          ...c,
          selected: false,
          latency_ms: undefined
        }));
        updateIspCounts();
        renderCandidateRows(currentFilterIsp);
      }
    };

    function renderCandidateRows(filterIsp = 'all') {
      if (!candidatesContainer) return;
      candidatesContainer.innerHTML = '';

      const filtered = filterIsp === 'all'
        ? candidateIpsList
        : candidateIpsList.filter(c => c.isp === filterIsp);

      if (filtered.length === 0) {
        candidatesContainer.innerHTML = `<div style="text-align:center; padding:20px; color:#71717a;">هیچ آی‌پی در این دسته‌بندی یافت نشد.</div>`;
        return;
      }

      filtered.forEach((item) => {
        const ip = item.ip;
        const ispCode = item.isp || 'wifi';
        const ispLabel = ispCode === 'mci' ? 'همراه اول' : (ispCode === 'mtn' ? 'ایرانسل' : (ispCode === 'custom' ? 'سفارشی' : 'مخابرات/Wifi'));
        const isGold = item.quality === 'gold';
        const isChecked = item.selected === true;

        const row = document.createElement('div');
        row.className = `pg-cleanip-ip-row ${isChecked ? 'selected' : ''}`;
        row.id = `cleanip-row-${ip.replace(/\./g, '-')}`;
        row.setAttribute('data-ip', ip);
        row.setAttribute('data-isp', ispCode);

        let latencyHtml = `<span style="color:#71717a; font-size:10px;">آماده تست</span>`;
        if (item.testing) {
          latencyHtml = `<span style="color:#38bdf8; font-size:10px;">در حال تست... ⏳</span>`;
        } else if (item.latency_ms !== undefined) {
          if (item.latency_ms > 0 && item.latency_ms < 140) {
            latencyHtml = `<span style="color:#10b981; font-weight:700; font-size:11px;">🟢 ${item.latency_ms}ms (عالی)</span>`;
          } else if (item.latency_ms > 0 && item.latency_ms < 250) {
            latencyHtml = `<span style="color:#f59e0b; font-weight:700; font-size:11px;">🟡 ${item.latency_ms}ms (متوسط)</span>`;
          } else {
            latencyHtml = `<span style="color:#ef4444; font-weight:700; font-size:11px;">🔴 فیلتر / قطعی</span>`;
          }
        }

        row.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px; min-width:0;">
            <input type="checkbox" class="cleanip-select-ip-cb" value="${ip}" ${isChecked ? 'checked' : ''} style="width:15px; height:15px; accent-color:#10b981; cursor:pointer; flex-shrink:0;">
            <span style="font-family:monospace; font-weight:700; font-size:12px;">${ip}</span>
            <span style="font-size:9px; padding:1px 6px; border-radius:4px; background:rgba(255,255,255,0.08);">${ispLabel}</span>
            ${isGold ? '<span style="font-size:9px; padding:1px 5px; border-radius:4px; background:rgba(245,158,11,0.15); color:#f59e0b; font-weight:700;">طلایی</span>' : ''}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="cleanip-ip-latency-badge" id="latency-${ip.replace(/\./g, '-')}">${latencyHtml}</span>
            <button type="button" class="cleanip-retest-single-btn" data-ip="${ip}" title="تست مجدد این آی‌پی" style="padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.05); border:1px solid #3f3f46; color:#a1a1aa; font-size:10px; cursor:pointer;">
              🔄
            </button>
          </div>
        `;

        candidatesContainer.appendChild(row);
      });

      // Bind checkbox change
      document.querySelectorAll('.cleanip-select-ip-cb').forEach(cb => {
        cb.addEventListener('change', () => {
          const val = cb.value;
          const found = candidateIpsList.find(c => c.ip === val);
          if (found) found.selected = cb.checked;
          const parentRow = cb.closest('.pg-cleanip-ip-row');
          if (parentRow) {
            if (cb.checked) parentRow.classList.add('selected');
            else parentRow.classList.remove('selected');
          }
          updateSelectedIpsCount();
        });
      });

      // Bind single re-test buttons
      document.querySelectorAll('.cleanip-retest-single-btn').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const targetIp = btn.getAttribute('data-ip');
          const item = candidateIpsList.find(c => c.ip === targetIp);
          const badge = document.getElementById(`latency-${targetIp.replace(/\./g, '-')}`);
          if (badge) badge.innerHTML = `<span style="color:#38bdf8; font-size:10px;">در حال تست... ⏳</span>`;
          try {
            const res = await fetch('/api/cleanip/test-single?ip=' + encodeURIComponent(targetIp), {
              method: 'POST',
              headers: getAuthHeaders()
            });
            const data = await res.json();
            if (item) {
              item.latency_ms = data.latency_ms;
              if (data.reachable && data.latency_ms < 250) item.selected = true;
            }
            if (data.reachable) {
              const color = data.latency_ms < 140 ? '#10b981' : '#f59e0b';
              const dot = data.latency_ms < 140 ? '🟢' : '🟡';
              badge.innerHTML = `<span style="color:${color}; font-weight:700; font-size:11px;">${dot} ${data.latency_ms}ms</span>`;
            } else {
              badge.innerHTML = `<span style="color:#ef4444; font-weight:700; font-size:11px;">🔴 فیلتر / قطعی</span>`;
            }
          } catch {
            if (badge) badge.innerHTML = `<span style="color:#ef4444; font-size:10px;">خطای تست</span>`;
          }
          updateSelectedIpsCount();
        };
      });

      updateSelectedIpsCount();
    }

    // Browser-side live probe runner
    async function runBrowserProbe() {
      for (let i = 0; i < candidateIpsList.length; i++) {
        const item = candidateIpsList[i];
        const badge = document.getElementById(`latency-${item.ip.replace(/\./g, '-')}`);
        if (badge) badge.innerHTML = `<span style="color:#38bdf8; font-size:10px;">در حال تست... ⏳</span>`;

        const start = performance.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2600);
        let ok = false;
        let latency = 0;
        try {
          await fetch(`https://${item.ip}:443`, { mode: 'no-cors', signal: controller.signal, cache: 'no-store' });
          clearTimeout(timer);
          latency = Math.round(performance.now() - start);
          ok = true;
        } catch (e) {
          clearTimeout(timer);
          latency = Math.round(performance.now() - start);
          if (e.name !== 'AbortError' && latency < 2100) ok = true;
        }

        item.latency_ms = ok ? latency : -1;
        if (ok && latency < 220) item.selected = true;

        if (badge) {
          if (ok) {
            const color = latency < 140 ? '#10b981' : '#f59e0b';
            const dot = latency < 140 ? '🟢' : '🟡';
            badge.innerHTML = `<span style="color:${color}; font-weight:700; font-size:11px;">${dot} ${latency}ms</span>`;
          } else {
            badge.innerHTML = `<span style="color:#ef4444; font-weight:700; font-size:11px;">🔴 فیلتر / قطعی</span>`;
          }
        }
        const cb = document.querySelector(`.cleanip-select-ip-cb[value="${item.ip}"]`);
        if (cb) {
          cb.checked = item.selected === true;
          const parentRow = cb.closest('.pg-cleanip-ip-row');
          if (parentRow) {
            if (cb.checked) parentRow.classList.add('selected');
            else parentRow.classList.remove('selected');
          }
        }
        updateSelectedIpsCount();
      }
      showBanner('success', `🎉 تست زنده مرورگر با موفقیت تکمیل شد.`);
    }

    // Ping All Button Handler
    const pingAllBtn = document.getElementById('cleanip-ping-all-btn');
    if (pingAllBtn) {
      pingAllBtn.onclick = async () => {
        if (candidateIpsList.length === 0) return;
        pingAllBtn.disabled = true;
        const origText = pingAllBtn.innerHTML;
        pingAllBtn.innerHTML = `در حال تست پینگ... ⏳`;

        const mode = document.getElementById('cleanip-ping-mode-select')?.value || 'server';

        if (mode === 'server') {
          // Server-side concurrent test
          try {
            const res = await fetch('/api/cleanip/ping-candidates', {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({ ips: candidateIpsList.map(c => c.ip) })
            });
            if (!res.ok) {
              showBanner('info', 'ℹ️ تست پینگ از مرورگر شما آغاز شد...');
              await runBrowserProbe();
              pingAllBtn.disabled = false;
              pingAllBtn.innerHTML = origText;
              return;
            }
            const data = await res.json();
            const results = data.results || [];
            results.forEach(r => {
              const item = candidateIpsList.find(c => c.ip === r.ip);
              if (item) {
                item.latency_ms = r.latency_ms;
                if (r.reachable && r.latency_ms > 0 && r.latency_ms < 220) {
                  item.selected = true;
                } else if (!r.reachable) {
                  item.selected = false;
                }
              }
            });
            // Sort candidate list by latency
            candidateIpsList.sort((a, b) => {
              const latA = (a.latency_ms && a.latency_ms > 0) ? a.latency_ms : 99999;
              const latB = (b.latency_ms && b.latency_ms > 0) ? b.latency_ms : 99999;
              return latA - latB;
            });
            renderCandidateRows(currentFilterIsp);
            const healthyCount = candidateIpsList.filter(c => c.latency_ms > 0).length;
            showBanner('success', `🎉 تست پینگ سرور پایان یافت: تعداد ${healthyCount} آی‌پی سالم شناسایی و به ترتیب کمترین پینگ مرتب شدند.`);
          } catch (err) {
            showBanner('info', 'ℹ️ خطا در تست پینگ سرور؛ تست از مرورگر جایگزین شد...');
            await runBrowserProbe();
          }
        } else {
          await runBrowserProbe();
        }

        pingAllBtn.disabled = false;
        pingAllBtn.innerHTML = origText;
      };
    }

    // Toggle Manual Add Drawer
    const toggleManualBtn = document.getElementById('cleanip-toggle-manual-btn');
    const manualDrawer = document.getElementById('cleanip-manual-drawer');
    if (toggleManualBtn && manualDrawer) {
      toggleManualBtn.onclick = () => {
        const isHidden = manualDrawer.style.display === 'none';
        manualDrawer.style.display = isHidden ? 'flex' : 'none';
        if (isHidden) {
          const inp = document.getElementById('cleanip-manual-ips-input');
          if (inp) inp.focus();
        }
      };
    }

    // Handle Manual Add Submit
    const manualAddBtn = document.getElementById('cleanip-manual-add-submit-btn');
    const manualInp = document.getElementById('cleanip-manual-ips-input');
    if (manualAddBtn && manualInp) {
      const handleManualAdd = () => {
        const raw = manualInp.value || '';
        const matched = raw.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g) || [];
        if (matched.length === 0) {
          showBanner('error', '⚠️ لطفاً حداقل یک آی‌پی معتبر IPv4 وارد کنید (مثال: 104.16.24.11).');
          return;
        }

        let addedCount = 0;
        matched.forEach(ip => {
          if (!candidateIpsList.some(c => c.ip === ip)) {
            candidateIpsList.unshift({
              ip: ip,
              isp: 'custom',
              provider: 'ورود دستی',
              source: 'custom',
              quality: 'custom',
              selected: true,
              latency_ms: undefined
            });
            addedCount++;
          }
        });

        // Also save to settings.custom_ips so they persist across sessions
        const existingCustom = settings.custom_ips || [];
        const combined = Array.from(new Set([...existingCustom, ...matched]));
        settings.custom_ips = combined;
        const customInputArea = document.getElementById('cleanip-custom-ips-input');
        if (customInputArea) customInputArea.value = combined.join('\n');

        fetch('/api/cleanip/settings', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(getFormPayload())
        }).catch(() => {});

        manualInp.value = '';
        manualDrawer.style.display = 'none';
        updateIspCounts();
        renderCandidateRows(currentFilterIsp);
        showBanner('success', `✅ تعداد ${addedCount} آی‌پی دستی به جدول تست اضافه و تیک خوردند.`);
      };

      manualAddBtn.onclick = handleManualAdd;
      manualInp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleManualAdd();
        }
      };
    }

    // Discover Cloudflare Subnet IPs Button Handler
    const discoverCfBtn = document.getElementById('cleanip-discover-cf-btn');
    if (discoverCfBtn) {
      discoverCfBtn.onclick = async () => {
        discoverCfBtn.disabled = true;
        const origText = discoverCfBtn.innerHTML;
        discoverCfBtn.innerHTML = `در حال دریافت... ⏳`;
        try {
          let sampled = [];
          const res = await fetch('/api/cleanip/discover-cf-ips', {
            method: 'POST',
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            sampled = data.candidates || [];
          }

          if (sampled.length === 0) {
            // Client-side fallback generator from Cloudflare subnets
            const prefixes = ['104.16.', '104.17.', '104.18.', '172.67.', '162.159.', '108.162.'];
            for (let i = 0; i < 12; i++) {
              const pref = prefixes[Math.floor(Math.random() * prefixes.length)];
              const b = Math.floor(Math.random() * 253) + 1;
              const c = Math.floor(Math.random() * 253) + 1;
              sampled.push({
                ip: `${pref}${b}.${c}`,
                isp: 'wifi',
                provider: 'CF Subnet',
                source: 'subnet-scan',
                quality: 'standard'
              });
            }
          }

          let added = 0;
          sampled.forEach(item => {
            if (!candidateIpsList.some(c => c.ip === item.ip)) {
              candidateIpsList.push({
                ...item,
                selected: false,
                latency_ms: undefined
              });
              added++;
            }
          });

          updateIspCounts();
          renderCandidateRows(currentFilterIsp);
          showBanner('success', `🎲 تعداد ${added} آی‌پی از رنج‌های کلودفلر استخراج و به جدول اضافه شد. اکنون دکمه «تست پینگ همه» را بزنید.`);
        } catch (e) {
          showBanner('error', `خطا در دریافت آی‌پی‌ها: ${e.message}`);
        } finally {
          discoverCfBtn.disabled = false;
          discoverCfBtn.innerHTML = origText;
        }
      };
    }

    // Select best (< 150ms)
    const selectBestBtn = document.getElementById('cleanip-select-best-btn');
    if (selectBestBtn) {
      selectBestBtn.onclick = () => {
        candidateIpsList.forEach(c => {
          c.selected = (c.latency_ms !== undefined && c.latency_ms > 0 && c.latency_ms < 150);
        });
        renderCandidateRows(currentFilterIsp);
        showBanner('success', `✅ آی‌پی‌های با تاخیر زیر ۱۵۰ میلی‌ثانیه انتخاب شدند.`);
      };
    }

    // Select all healthy (> 0)
    const selectHealthyBtn = document.getElementById('cleanip-select-healthy-btn');
    if (selectHealthyBtn) {
      selectHealthyBtn.onclick = () => {
        candidateIpsList.forEach(c => {
          c.selected = (c.latency_ms !== undefined && c.latency_ms > 0);
        });
        renderCandidateRows(currentFilterIsp);
      };
    }

    // Deselect all IPs
    const deselectIpsBtn = document.getElementById('cleanip-deselect-ips-btn');
    if (deselectIpsBtn) {
      deselectIpsBtn.onclick = () => {
        candidateIpsList.forEach(c => c.selected = false);
        renderCandidateRows(currentFilterIsp);
      };
    }

    // Filter chips
    document.querySelectorAll('.pg-cleanip-filter-chip').forEach(chip => {
      chip.onclick = () => {
        document.querySelectorAll('.pg-cleanip-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilterIsp = chip.getAttribute('data-isp') || 'all';
        renderCandidateRows(currentFilterIsp);
      };
    });

    // Apply Selected IPs to Hosts Button Handler
    const applySelectedBtn = document.getElementById('cleanip-apply-selected-btn');
    if (applySelectedBtn) {
      applySelectedBtn.onclick = async () => {
        const selectedIps = candidateIpsList.filter(c => c.selected === true).map(c => c.ip);
        if (selectedIps.length === 0) {
          showBanner('error', '⚠️ لطفاً حداقل یک آی‌پی را با تیک در جدول انتخاب کنید.');
          return;
        }

        const targetHostIds = Array.from(document.querySelectorAll('.cleanip-host-cb:checked')).map(cb => Number(cb.value));
        if (targetHostIds.length === 0) {
          switchTab(tabHosts, paneHosts);
          showBanner('error', '⚠️ لطفاً ابتدا حداقل یک هاست را از تب «هاست‌های هدف» تیک بزنید تا آی‌پی‌ها روی آن اعمال شوند.');
          return;
        }

        applySelectedBtn.disabled = true;
        const origText = applySelectedBtn.innerHTML;
        applySelectedBtn.innerHTML = `در حال اعمال روی هاست‌ها... ⏳`;

        try {
          const res = await fetch('/api/cleanip/apply-selected', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              host_ids: targetHostIds,
              selected_ips: selectedIps
            })
          });
          const data = await res.json();
          if (res.ok) {
            showBanner('success', `
              <div style="display:flex; flex-direction:column; gap:4px;">
                <p style="font-weight:700;">✅ ${data.message}</p>
                <p style="font-size:11px;">هاست‌های آپدیت‌شده: ${(data.updated_hosts || []).join(' ، ')}</p>
                <p style="font-size:11px; font-family:monospace;">آی‌پی‌ها: ${selectedIps.join(', ')}</p>
              </div>
            `);

            // Update active list in Config tab
            const activeList = document.getElementById('cleanip-active-ips-list');
            if (activeList) {
              activeList.innerHTML = selectedIps.map(ip => `
                <span style="padding:3px 8px; border-radius:6px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3);">
                  ${ip}
                </span>
              `).join('');
            }
          } else {
            showBanner('error', `❌ خطا: ${data.detail || 'اعمال آی‌پی‌ها ناموفق بود.'}`);
          }
        } catch (e) {
          showBanner('error', `خطای ارتباط: ${e.message}`);
        } finally {
          applySelectedBtn.disabled = false;
          applySelectedBtn.innerHTML = origText;
        }
      };
    }

    // Load candidate IPs initially
    loadCandidates();

    // Infrastructure Diagnostic Handler
    const diagBtn = document.getElementById('cleanip-run-diag-btn');
    const diagSelect = document.getElementById('cleanip-diag-host-select');
    const diagResult = document.getElementById('cleanip-diag-result-container');

    const executeDiagnose = async (hostId) => {
      if (!diagResult) return;
      diagResult.style.display = 'flex';
      diagResult.innerHTML = `
        <div style="text-align:center; padding:12px; color:#10b981; display:flex; align-items:center; justify-content:center; gap:8px;">
          <span>⏳</span>
          <span>در حال ارسال پروب‌های ۳ لایه‌ای به کلودفلر و سرور مبدا...</span>
        </div>
      `;
      if (diagBtn) diagBtn.disabled = true;

      try {
        const res = await fetch('/api/cleanip/diagnose', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ host_id: Number(hostId) })
        });
        const data = await res.json();

        if (!res.ok) {
          diagResult.innerHTML = `<div style="color:#ef4444; padding:8px;">❌ خطا: ${data.detail || 'عیب‌یابی با خطا مواجه شد.'}</div>`;
          return;
        }

        const isHealthy = data.overall_healthy;
        const dns = data.dns_check || {};
        const clean = data.clean_ip_check || {};
        const origin = data.origin_check || {};

        diagResult.innerHTML = `
          <!-- Header Status -->
          <div style="padding:8px 12px; border-radius:6px; background:${isHealthy ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border:1px solid ${isHealthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; color:${isHealthy ? '#10b981' : '#ef4444'}; font-weight:700; display:flex; align-items:center; justify-content:space-between;">
            <span>${isHealthy ? '✅ زیرساخت و Clean IP آماده سرویس‌دهی است' : '⚠️ نیاز به بررسی زیرساخت'}</span>
            <span style="font-family:monospace; font-size:10px;">${data.domain}:${data.port}</span>
          </div>

          <!-- Layer 1: DNS & Orange Cloud -->
          <div style="padding:8px 10px; border-radius:6px; border:1px solid #27272a; background:rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600;">۱. وضعیت ابر کلودفلر (DNS & Proxy):</span>
              <span style="color:${dns.is_proxied ? '#10b981' : '#ef4444'}; font-weight:700;">
                ${dns.is_proxied ? '🟢 فعال (پشت کلودفلر)' : '🔴 غیرفعال (ابر خاکستری یا دامنه مستقیم)'}
              </span>
            </div>
            <div style="color:#a1a1aa; font-size:10px;">آی‌پی‌های دامنه: ${(dns.resolved_ips || []).join(', ') || 'یافت نشد'}</div>
            ${dns.advice ? `<div style="color:#f59e0b; font-size:10px; background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:4px; margin-top:2px;">💡 ${dns.advice}</div>` : ''}
          </div>

          <!-- Layer 2: Clean IP TLS Handshake -->
          <div style="padding:8px 10px; border-radius:6px; border:1px solid #27272a; background:rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600;">۲. اتصال TLS کلین آی‌پی (SNI Handshake):</span>
              <span style="color:${clean.status === 'ok' ? '#10b981' : '#ef4444'}; font-weight:700;">
                ${clean.status === 'ok' ? `🟢 موفق (${clean.latency_ms}ms)` : '🔴 ناموفق / مسدود'}
              </span>
            </div>
            <div style="color:#a1a1aa; font-size:10px;">کلین آی‌پی تست‌شده: ${clean.ip || '-'} | ${clean.message || ''}</div>
            ${clean.advice ? `<div style="color:#f59e0b; font-size:10px; background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:4px; margin-top:2px;">💡 ${clean.advice}</div>` : ''}
          </div>

          <!-- Layer 3: Origin Server Core Response -->
          <div style="padding:8px 10px; border-radius:6px; border:1px solid #27272a; background:rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:600;">۳. پاسخ هسته پاسارگارد (Origin Server):</span>
              <span style="color:${origin.status === 'ok' ? '#10b981' : (origin.status === 'warning' ? '#f59e0b' : '#ef4444')}; font-weight:700;">
                ${origin.status === 'ok' ? `🟢 پاسخ تایید شد (HTTP ${origin.http_status || '101'})` : (origin.status === 'warning' ? `🟡 ${origin.http_status || 'پاسخ نامتعارف'}` : '🔴 قطع ارتباط مبدا')}
              </span>
            </div>
            <div style="color:#a1a1aa; font-size:10px;">${origin.message || ''}</div>
            ${origin.advice ? `<div style="color:#f59e0b; font-size:10px; background:rgba(245,158,11,0.1); padding:4px 8px; border-radius:4px; margin-top:2px;">💡 ${origin.advice}</div>` : ''}
          </div>
        `;

      } catch (err) {
        diagResult.innerHTML = `<div style="color:#ef4444; padding:8px;">خطای ارتباط با سرور: ${err.message}</div>`;
      } finally {
        if (diagBtn) diagBtn.disabled = false;
      }
    };

    if (diagBtn && diagSelect) {
      diagBtn.onclick = () => {
        const val = diagSelect.value;
        if (val) executeDiagnose(val);
      };
    }

    // Quick diagnostic buttons on host rows
    document.querySelectorAll('.cleanip-quick-diag-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const hostId = btn.getAttribute('data-host-id');
        switchTab(tabConfig, paneConfig);
        if (diagSelect) diagSelect.value = hostId;
        executeDiagnose(hostId);
      };
    });

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
          showBanner('success', `✅ تنظیمات ذخیره شد. (${payload.target_host_ids.length} هاست هدف فعال، ${payload.custom_ips.length} آی‌پی اختصاصی)`);
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
      // If user is currently in Tab 2, route directly to apply selected IPs!
      if (panePing && panePing.style.display !== 'none') {
        const applyBtn = document.getElementById('cleanip-apply-selected-btn');
        if (applyBtn) {
          applyBtn.click();
          return;
        }
      }

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
