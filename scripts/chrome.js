import { store } from './store.js';
import { t, LOCALES } from './i18n.js';
import { LABELS, ORG_CHROME } from './labels.js';
import * as notebook from './notebook.js';
import * as mail from './mail.js';

const localeChangeListeners = [];

export function onLocaleChange(fn) {
  localeChangeListeners.push(fn);
}

function buildLangSwitcherInto(container) {
  container.innerHTML = '';
  const labelSpan = document.createElement('span');
  labelSpan.className = 'lang-switcher__label';
  labelSpan.textContent = t(LABELS.language, store.get('locale')) + '：';
  container.appendChild(labelSpan);

  LOCALES.forEach((loc) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-switcher__option' + (loc === store.get('locale') ? ' lang-switcher__option--active' : '');
    btn.textContent = t(LABELS.langNames[loc], loc);
    btn.addEventListener('click', () => {
      if (loc === store.get('locale')) return;
      store.set('locale', loc);
      mountLangSwitchers();
      notebook.refreshText();
      localeChangeListeners.forEach((fn) => fn());
    });
    container.appendChild(btn);
  });
}

export function mountLangSwitchers() {
  document.querySelectorAll('.lang-switcher').forEach(buildLangSwitcherInto);
}

const SIGNAL_SVG = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>';
const WIFI_SVG = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.2a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/><path d="M4.2 7.4a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 7.4z"/><path d="M1 4.2a9.6 9.6 0 0114 0L13.6 5.6a7.6 7.6 0 00-11.2 0L1 4.2z"/></svg>';
const BATTERY_SVG = '<svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';
const BACK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13 3 5 10l8 7z"/></svg>';
const HOME_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7"/></svg>';
const RECENTS_SVG = '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="15" height="15" rx="2.5"/></svg>';

function pad2(n) { return String(n).padStart(2, '0'); }

// 跟前作共用同一把「進全螢幕」旗標(jh2bridge:fullscreen_opt_in)——玩家在前作
// 開機畫面點瀏覽器圖示那次是真正的使用者手勢，之後不管在前作還是續作，每頁
// 都掛一個一次性點擊監聽，趁玩家下一次點擊時嘗試重新全螢幕(換頁會自動退出
// 全螢幕，Fullscreen API 不能用程式在換頁後自動重進)。
const FULLSCREEN_KEY = 'jh2bridge:fullscreen_opt_in';
function isFullscreenActive() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}
function requestFullscreenNow() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (!req) return;
  try {
    const p = req.call(el);
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}
function armFullscreenOnFirstClick() {
  if (localStorage.getItem(FULLSCREEN_KEY) !== '1' || isFullscreenActive()) return;
  document.addEventListener(
    'click',
    () => { if (!isFullscreenActive()) requestFullscreenNow(); },
    { once: true }
  );
}

// 跟前作一樣：狀態列的時間是玩家裝置當下的真實時間(只有時:分)，純粹營造
// 「你正拿著手機看」的臨場感，不代表故事裡的日期，所以不會跟續作 2026/8/26
// 之後的時間線互相矛盾。
function mountPhoneShell() {
  if (document.body.classList.contains('jh-has-shell')) return;

  if (!document.querySelector('link[data-phone-shell]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/phone-shell.css';
    link.setAttribute('data-phone-shell', '1');
    document.head.appendChild(link);
  }

  const statusBar = document.createElement('div');
  statusBar.className = 'jh-status-bar';
  statusBar.innerHTML = `
    <span class="jh-sb-time" id="jh-sb-time"></span>
    <span class="jh-sb-icons">${SIGNAL_SVG}${WIFI_SVG}${BATTERY_SVG}</span>
  `;
  document.body.insertBefore(statusBar, document.body.firstChild);

  function tick() {
    const now = new Date();
    statusBar.querySelector('#jh-sb-time').textContent = now.getHours() + ':' + pad2(now.getMinutes());
  }
  tick();
  setInterval(tick, 15000);

  const homeIndicator = document.createElement('div');
  homeIndicator.className = 'jh-home-indicator';
  homeIndicator.innerHTML = `
    <button type="button" class="jh-nav-btn" id="jh-nav-back" aria-label="返回">${BACK_SVG}</button>
    <button type="button" class="jh-nav-btn" id="jh-nav-home" aria-label="主畫面">${HOME_SVG}</button>
    <button type="button" class="jh-nav-btn" id="jh-nav-recents" aria-label="多工">${RECENTS_SVG}</button>
  `;
  document.body.appendChild(homeIndicator);

  const toast = document.createElement('div');
  toast.className = 'jh-nav-toast';
  toast.textContent = '沒有其他使用中的頁面';
  document.body.appendChild(toast);
  let toastTimer = null;

  homeIndicator.querySelector('#jh-nav-back').addEventListener('click', () => history.back());
  homeIndicator.querySelector('#jh-nav-home').addEventListener('click', () => { location.href = 'index.html'; });
  homeIndicator.querySelector('#jh-nav-recents').addEventListener('click', () => {
    toast.classList.add('jh-nav-toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('jh-nav-toast--visible'), 1400);
  });

  document.body.classList.add('jh-has-shell');
  armFullscreenOnFirstClick();
}

// For pages with the full institutional shell (header/nav/breadcrumb/footer).
export function mount({ breadcrumb = [] } = {}) {
  mountPhoneShell();
  const headerNameEl = document.querySelector('.site-header__name');
  const donateEl = document.querySelector('.site-header__donate');
  const siteNavEl = document.getElementById('site-nav');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const footerEl = document.getElementById('site-footer');

  headerNameEl.textContent = t(ORG_CHROME.name, store.get('locale'));
  donateEl.textContent = t(ORG_CHROME.donate, store.get('locale'));
  donateEl.href = 'donate.html';

  siteNavEl.innerHTML = '';
  [
    ['index.html', t(LABELS.home, store.get('locale'))],
    ['about.html', t(LABELS.navAbout, store.get('locale'))],
    ['faq.html', t(LABELS.navFaq, store.get('locale'))],
    ['contact.html', t(LABELS.navContact, store.get('locale'))]
  ].forEach(([href, text]) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    siteNavEl.appendChild(a);
  });

  breadcrumbEl.textContent = breadcrumb.join(' › ');

  footerEl.innerHTML = '';
  const loc = store.get('locale');
  const inner = document.createElement('div');
  inner.className = 'site-footer__inner';

  const columns = document.createElement('div');
  columns.className = 'site-footer__columns';

  function footerColumn(titleText, items) {
    const col = document.createElement('div');
    col.className = 'site-footer__column';
    const h = document.createElement('strong');
    h.textContent = titleText;
    col.appendChild(h);
    const list = document.createElement('ul');
    items.forEach(({ text, href }) => {
      const li = document.createElement('li');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        li.appendChild(a);
      } else {
        li.textContent = text;
      }
      list.appendChild(li);
    });
    col.appendChild(list);
    return col;
  }

  columns.appendChild(
    footerColumn(t(LABELS.footerAboutTitle, loc), [
      { text: t(LABELS.navAbout, loc), href: 'about.html' },
      { text: t(LABELS.navFaq, loc), href: 'faq.html' },
      { text: t(ORG_CHROME.donate, loc), href: 'donate.html' }
    ])
  );
  columns.appendChild(
    footerColumn(t(LABELS.footerServicesTitle, loc), [
      { text: t(LABELS.trustFooterLink, loc), href: 'trust.html' },
      { text: t(LABELS.navContact, loc), href: 'contact.html' },
      { text: t(LABELS.navPrivacy, loc), href: 'privacy.html' },
      { text: t(LABELS.navAccessibility, loc), href: 'accessibility.html' }
    ])
  );
  columns.appendChild(
    footerColumn(t(LABELS.footerContactTitle, loc), [
      { text: t(LABELS.phone, loc) + '　' + ORG_CHROME.footer.phoneValue },
      { text: t(LABELS.email, loc) + '　' + ORG_CHROME.footer.emailValue },
      { text: t(ORG_CHROME.footer.hoursValue, loc) }
    ])
  );
  inner.appendChild(columns);

  const bottomBar = document.createElement('div');
  bottomBar.className = 'site-footer__bottom';
  const p1 = document.createElement('p');
  p1.textContent = t(ORG_CHROME.footer.taxId, loc);
  const p2 = document.createElement('p');
  p2.textContent = t(ORG_CHROME.footer.address, loc);
  const p3 = document.createElement('p');
  p3.textContent = t(ORG_CHROME.footer.updated, loc);
  bottomBar.appendChild(p1);
  bottomBar.appendChild(p2);
  bottomBar.appendChild(p3);
  inner.appendChild(bottomBar);
  footerEl.appendChild(inner);

  document.getElementById('app').hidden = false;
  mountLangSwitchers();
  notebook.mount();
  mail.mount();
}

// For pages without the institutional chrome (raw snapshots, file views, endgame, admin).
// { skipWidgets: true } drops the notebook/mail drawers too — for gone.html, where the
// site itself is supposed to have stopped working, not just lost its header.
export function mountBare({ skipWidgets = false } = {}) {
  mountPhoneShell();
  const appEl = document.getElementById('app');
  if (appEl) appEl.hidden = false;
  mountLangSwitchers();
  if (skipWidgets) return;
  notebook.mount();
  mail.mount();
}

