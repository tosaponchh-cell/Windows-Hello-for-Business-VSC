/* ═══════════════════════════════════════
   AuthLearn — app.js
   Router · Nav Builder · Page Loader
═══════════════════════════════════════ */

const App = {
  nav: null,
  currentModule: null,
  currentSection: null,

  /* ── INIT ── */
  async init() {
    try {
      const res = await fetch('data/nav.json');
      this.nav = await res.json();
    } catch (e) {
      document.getElementById('content-area').innerHTML =
        '<div class="error-page"><h2>ไม่พบ nav.json</h2><p>ตรวจสอบว่ารันผ่าน HTTP server</p><code>python -m http.server 8080</code></div>';
      return;
    }

    this.buildModuleTabs();
    this.setupMobile();
    window.addEventListener('hashchange', () => this.route());
    this.route();
  },

  /* ── MODULE TABS (header) ── */
  buildModuleTabs() {
    const tabs = document.getElementById('module-tabs');
    tabs.innerHTML = this.nav.modules.map(m => `
      <button class="mod-tab" data-mod="${m.id}"
        style="--mod-accent:${m.accent}"
        onclick="App.switchModule('${m.id}')">
        <span class="mod-icon">${m.icon}</span>
        <span class="mod-label">${m.short}</span>
      </button>
    `).join('');
  },

  /* ── SIDEBAR NAV ── */
  buildSidebar(moduleId) {
    const mod = this.nav.modules.find(m => m.id === moduleId)
              || this.nav.modules[0];
    const nav = document.getElementById('left-nav');

    nav.innerHTML = mod.groups.map(g => `
      <div class="nav-group">${g.label}</div>
      ${g.sections.map(s => `
        <div class="nav-item" data-mod="${mod.id}" data-sec="${s.id}"
          onclick="App.navigate('${mod.id}','${s.id}')">
          <span class="ni-icon">${s.icon}</span>
          <span class="ni-label">${s.title}</span>
        </div>
      `).join('')}
    `).join('');
  },

  /* ── SWITCH MODULE ── */
  switchModule(moduleId) {
    const mod = this.nav.modules.find(m => m.id === moduleId);
    if (!mod) return;
    const firstSec = mod.groups[0].sections[0].id;
    location.hash = `${moduleId}/${firstSec}`;
  },

  navigate(moduleId, sectionId) {
    location.hash = `${moduleId}/${sectionId}`;
  },

  /* ── ROUTER ── */
  async route() {
    const hash = location.hash.slice(1) || 'whfb/s01';
    const [moduleId, sectionId = 's01'] = hash.split('/');

    // Rebuild sidebar if module changed
    if (moduleId !== this.currentModule) {
      this.buildSidebar(moduleId);
      this.currentModule = moduleId;

      // Update module tab highlight
      document.querySelectorAll('.mod-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mod === moduleId);
      });

      // Update header title
      const mod = this.nav.modules.find(m => m.id === moduleId);
      if (mod) {
        document.getElementById('header-module-title').textContent = mod.label;
        document.documentElement.style.setProperty('--active-accent', mod.accent);
      }
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active',
        n.dataset.mod === moduleId && n.dataset.sec === sectionId);
    });

    await this.loadPage(moduleId, sectionId);
    this.currentSection = sectionId;

    // Close mobile sidebar
    if (window.innerWidth < 768) {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('show');
    }
  },

  /* ── PAGE LOADER ── */
  async loadPage(moduleId, sectionId) {
    const area = document.getElementById('content-area');
    area.innerHTML = '<div class="loading-screen"><div class="ls-spinner"></div><div class="ls-text">กำลังโหลด...</div></div>';
    area.scrollTop = 0;

    try {
      const res = await fetch(`pages/${moduleId}/${sectionId}.html`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      area.innerHTML = `<div class="page-wrap">${html}</div>`;

      // innerHTML does NOT execute <script> tags — must do it manually
      // Clean up any previously injected page scripts first
      document.querySelectorAll('script[data-page-script]').forEach(s => s.remove());

      area.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-page-script', '');
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
      });

      this.initTabs();
      this.highlightCode();
    } catch (e) {
      area.innerHTML = `
        <div class="error-page">
          <div class="ep-icon">📄</div>
          <h2>ไม่พบหน้านี้</h2>
          <p>ไม่พบไฟล์ <code>pages/${moduleId}/${sectionId}.html</code></p>
          <p class="ep-hint">ตรวจสอบ HTTP server: <code>python -m http.server 8080</code></p>
        </div>`;
    }
  },

  /* ── TABS (within page) ── */
  initTabs() {
    document.querySelectorAll('.tab-nav').forEach(nav => {
      const firstBtn = nav.querySelector('.tab-btn');
      if (firstBtn) switchTab(firstBtn);
    });
  },

  /* ── SYNTAX HIGHLIGHT (lightweight) ── */
  highlightCode() {
    // Already uses span-based highlighting in HTML partials
    // This hook is for future extensions
  },

  /* ── MOBILE ── */
  setupMobile() {
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').classList.toggle('show');
    });
    document.getElementById('overlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('show');
    });
  }
};

/* ── TAB SWITCHER (global, called from page HTML) ── */
function switchTab(btn) {
  const paneId = btn.dataset.pane;
  const container = btn.closest('.tab-container');
  if (!container || !paneId) return;
  container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  container.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => App.init());
