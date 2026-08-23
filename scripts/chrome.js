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

// 假瀏覽器網址列會依目前頁面顯示不同假網域,跟前作同一套視覺跟判斷方式:
// 用「路徑裡有沒有出現已知目錄名」來判斷,不管實際部署在網域根目錄還是
// GitHub Pages 那種帶 repo 名稱的子路徑,判斷結果都一樣正確。
const DOMAIN_MAP = { case: 'twmissingkids.org.tw/case' };
const FIXED_DOMAIN = { 'market.html': 'market.tw', 'archive2019.html': 'market.tw', 'legacy.html': 'xun-lin-xi.github.io' };
// walk(終局行走序列)、admin(內部重置面板)、gone(網站已停用)這三頁不掛假網址列——
// 跟前作的 debug 頁一樣,屬於跳出敘事之外的頁面,不需要沉浸感包裝。
const NO_CHROME_FILES = ['walk.html', 'admin.html', 'gone.html'];

function computeUrl() {
  const parts = location.pathname.split('/').filter(Boolean);
  const fileName = parts[parts.length - 1] || 'home.html';
  const topDir = parts.length > 1 ? parts[0] : '';

  if (topDir === 'file' || fileName === 'collection.html') {
    return { text: 'file:///C:/Users/rec_1029/收藏/', isLocal: true, skip: false };
  }
  if (FIXED_DOMAIN[fileName]) {
    return { text: FIXED_DOMAIN[fileName], isLocal: false, skip: false };
  }
  if (NO_CHROME_FILES.includes(fileName)) {
    return { skip: true };
  }
  const slug = fileName.endsWith('.html') ? fileName.slice(0, -5) : fileName;
  if (topDir && DOMAIN_MAP[topDir]) {
    return { text: DOMAIN_MAP[topDir] + '/' + slug, isLocal: false, skip: false };
  }
  return { text: 'twmissingkids.org.tw' + (slug && slug !== 'home' ? '/' + slug : ''), isLocal: false, skip: false };
}

// 跟前作共用同一把「進全螢幕」旗標(jh2bridge:fullscreen_opt_in)——玩家在殼層
// (根目錄 index.html)點瀏覽器圖示或主畫面是真正的使用者手勢,由殼層自己處理;
// 這支腳本在 iframe 裡的每一頁只負責趁玩家下一次點擊,請殼層(window.top)重新
// 嘗試一次全螢幕——例如玩家自己按 Esc 跳出,下一次點擊就會自動接回來。
const FULLSCREEN_KEY = 'jh2bridge:fullscreen_opt_in';
function armFullscreenOnFirstClick() {
  if (localStorage.getItem(FULLSCREEN_KEY) !== '1') return;
  if (window.top === window) return; // 不在殼層 iframe 裡(例如直接開這一頁測試)
  document.addEventListener(
    'click',
    () => {
      try {
        if (typeof window.top.requestFullscreenNow === 'function') window.top.requestFullscreenNow();
      } catch (e) {}
    },
    { once: true }
  );
}

function mountBrowserChrome() {
  if (document.querySelector('.jh-browser-chrome')) return;

  if (!document.querySelector('link[data-phone-shell]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/phone-shell.css';
    link.setAttribute('data-phone-shell', '1');
    document.head.appendChild(link);
  }

  const { text, isLocal, skip } = computeUrl();
  if (skip) return;

  const bar = document.createElement('div');
  bar.className = 'jh-browser-chrome';
  bar.innerHTML = `
    <button type="button" class="jh-bc-nav" id="jh-bc-back" aria-label="上一頁">←</button>
    <button type="button" class="jh-bc-nav" id="jh-bc-fwd" aria-label="下一頁">→</button>
    <div class="jh-bc-url">${isLocal ? '' : '<span class="jh-bc-lock">🔒</span>'}<span class="jh-bc-url-text"></span></div>
    <button type="button" class="jh-bc-nav" id="jh-bc-refresh" aria-label="重新整理">⟳</button>
  `;
  document.body.insertBefore(bar, document.body.firstChild);
  bar.querySelector('.jh-bc-url-text').textContent = text;
  document.body.classList.add('jh-has-chrome');

  document.getElementById('jh-bc-back').addEventListener('click', () => history.back());
  document.getElementById('jh-bc-fwd').addEventListener('click', () => history.forward());
  document.getElementById('jh-bc-refresh').addEventListener('click', () => location.reload());

  armFullscreenOnFirstClick();
}

// For pages with the full institutional shell (header/nav/breadcrumb/footer).
export function mount({ breadcrumb = [] } = {}) {
  mountBrowserChrome();
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
    ['home.html', t(LABELS.home, store.get('locale'))],
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
  mountBrowserChrome();
  const appEl = document.getElementById('app');
  if (appEl) appEl.hidden = false;
  mountLangSwitchers();
  if (skipWidgets) return;
  notebook.mount();
  mail.mount();
}

