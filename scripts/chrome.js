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
  const appEl = document.getElementById('app');
  if (appEl) appEl.hidden = false;
  mountLangSwitchers();
  if (skipWidgets) return;
  notebook.mount();
  mail.mount();
}

