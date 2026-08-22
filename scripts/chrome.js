import { store } from './store.js';
import { t, LOCALES } from './i18n.js';
import { LABELS, ORG_CHROME } from './labels.js';
import * as notebook from './notebook.js';

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

// For pages with the full institutional shell (header/nav/breadcrumb/footer).
export function mount({ breadcrumb = [] } = {}) {
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
  const p1 = document.createElement('p');
  p1.textContent = t(ORG_CHROME.footer.taxId, store.get('locale'));
  const p2 = document.createElement('p');
  p2.textContent = t(ORG_CHROME.footer.address, store.get('locale'));
  const p3 = document.createElement('p');
  p3.textContent = t(ORG_CHROME.footer.updated, store.get('locale'));
  const links = document.createElement('p');
  [
    ['trust.html', t(LABELS.trustFooterLink, store.get('locale'))],
    ['privacy.html', t(LABELS.navPrivacy, store.get('locale'))],
    ['accessibility.html', t(LABELS.navAccessibility, store.get('locale'))]
  ].forEach(([href, text], i) => {
    if (i > 0) links.appendChild(document.createTextNode('　|　'));
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    links.appendChild(a);
  });
  footerEl.appendChild(p1);
  footerEl.appendChild(p2);
  footerEl.appendChild(p3);
  footerEl.appendChild(links);

  document.getElementById('app').hidden = false;
  mountLangSwitchers();
  notebook.mount();
}

// For pages without the institutional chrome (raw snapshots, file views, endgame, admin).
export function mountBare() {
  const appEl = document.getElementById('app');
  if (appEl) appEl.hidden = false;
  mountLangSwitchers();
  notebook.mount();
}
