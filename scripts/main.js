import { store } from './store.js';
import { t, LOCALES } from './i18n.js';
import * as router from './router.js';
import * as flags from './flags.js';
import * as render from './render.js';
import { renderWalk } from './endgame.js';
import * as notebook from './notebook.js';

let CONTENT = null;
let currentRender = () => {};

const appEl = document.getElementById('app');
const mainEl = document.getElementById('main');
const breadcrumbEl = document.getElementById('breadcrumb');
const headerEl = document.querySelector('.site-header');
const siteNavEl = document.getElementById('site-nav');
const headerNameEl = document.querySelector('.site-header__name');
const donateEl = document.querySelector('.site-header__donate');
const footerEl = document.getElementById('site-footer');
const warningEl = document.getElementById('content-warning');
const langSwitcherEl = document.getElementById('lang-switcher');
const langSwitcherWarningEl = document.getElementById('lang-switcher-warning');

function locale() {
  return store.get('locale');
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function setChromeVisible(visible) {
  headerEl.hidden = !visible;
  siteNavEl.hidden = !visible;
  breadcrumbEl.hidden = !visible;
  footerEl.hidden = !visible;
}

function setBreadcrumb(parts) {
  if (!parts || parts.length === 0) {
    breadcrumbEl.textContent = '';
    return;
  }
  breadcrumbEl.textContent = parts.join(' › ');
}

function buildLangSwitcherInto(container) {
  container.innerHTML = '';
  const labelSpan = document.createElement('span');
  labelSpan.className = 'lang-switcher__label';
  labelSpan.textContent = t(CONTENT.labels.language, locale()) + '：';
  container.appendChild(labelSpan);

  LOCALES.forEach((loc) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-switcher__option' + (loc === locale() ? ' lang-switcher__option--active' : '');
    btn.textContent = t(CONTENT.labels.langNames[loc], loc);
    btn.addEventListener('click', () => {
      if (loc === locale()) return;
      store.set('locale', loc);
      renderLangSwitcher();
      notebook.refreshText(CONTENT, loc);
      if (!warningEl.hidden) {
        applyWarningText();
      } else {
        currentRender();
      }
    });
    container.appendChild(btn);
  });
}

function renderLangSwitcher() {
  buildLangSwitcherInto(langSwitcherEl);
  if (langSwitcherWarningEl) buildLangSwitcherInto(langSwitcherWarningEl);
}

function renderChrome() {
  headerNameEl.textContent = t(CONTENT.org.name, locale());
  donateEl.textContent = t(CONTENT.org.donate, locale());

  siteNavEl.innerHTML = '';
  [
    ['/', t(CONTENT.labels.home, locale())],
    ['/about', t(CONTENT.labels.navAbout, locale())],
    ['/faq', t(CONTENT.labels.navFaq, locale())],
    ['/contact', t(CONTENT.labels.navContact, locale())]
  ].forEach(([route, text]) => {
    const a = document.createElement('a');
    a.href = '#' + route;
    a.textContent = text;
    siteNavEl.appendChild(a);
  });

  footerEl.innerHTML = '';
  const p1 = document.createElement('p');
  p1.textContent = t(CONTENT.org.footer.taxId, locale());
  const p2 = document.createElement('p');
  p2.textContent = t(CONTENT.org.footer.address, locale());
  const p3 = document.createElement('p');
  p3.textContent = t(CONTENT.org.footer.updated, locale());
  const links = document.createElement('p');
  [
    ['/trust', t(CONTENT.labels.trustFooterLink, locale())],
    ['/privacy', t(CONTENT.labels.navPrivacy, locale())],
    ['/accessibility', t(CONTENT.labels.navAccessibility, locale())]
  ].forEach(([route, text], i) => {
    if (i > 0) links.appendChild(document.createTextNode('　|　'));
    const a = document.createElement('a');
    a.href = '#' + route;
    a.textContent = text;
    links.appendChild(a);
  });
  footerEl.appendChild(p1);
  footerEl.appendChild(p2);
  footerEl.appendChild(p3);
  footerEl.appendChild(links);
}

function mount(node, { chrome = true, breadcrumb = null } = {}) {
  setChromeVisible(chrome);
  if (chrome) {
    renderChrome();
    setBreadcrumb(breadcrumb);
  }
  mainEl.innerHTML = '';
  mainEl.appendChild(node);
}

function registerRoutes() {
  router.addRoute('/', () => {
    currentRender = () => {
      mount(render.renderHome(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/intro', () => {
    currentRender = () => {
      const node = render.renderIntro(CONTENT, locale(), (data) => {
        store.set('nickname', data.nickname);
        store.set('howYouKnew', data.howYouKnew);
        router.navigate('/');
      });
      mount(node, {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.introBreadcrumb, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/case/:id', (params) => {
    currentRender = () => {
      mount(render.renderCase(CONTENT, params.id, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.breadcrumbDb, locale()), params.id]
      });
    };
    currentRender();
  });

  router.addRoute('/about', () => {
    currentRender = () => {
      mount(render.renderAbout(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.navAbout, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/faq', () => {
    currentRender = () => {
      mount(render.renderFaq(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.navFaq, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/donate', () => {
    currentRender = () => {
      mount(render.renderDonate(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.org.donate, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/contact', () => {
    currentRender = () => {
      mount(render.renderContact(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.navContact, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/privacy', () => {
    currentRender = () => {
      mount(render.renderPrivacy(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.navPrivacy, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/accessibility', () => {
    currentRender = () => {
      mount(render.renderAccessibility(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.navAccessibility, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/trust', () => {
    currentRender = () => {
      mount(render.renderTrust(CONTENT, locale()), {
        chrome: true,
        breadcrumb: [render.breadcrumbHome(CONTENT, locale()), t(CONTENT.labels.trustBreadcrumb, locale())]
      });
    };
    currentRender();
  });

  router.addRoute('/archive2019', () => {
    currentRender = () => mount(render.renderArchive2019(CONTENT, locale()), { chrome: false });
    currentRender();
  });

  router.addRoute('/market/:id', () => {
    currentRender = () => mount(render.renderMarket(CONTENT, locale()), { chrome: false });
    currentRender();
  });

  router.addRoute('/legacy', () => {
    currentRender = () => mount(render.renderLegacy(CONTENT, locale()), { chrome: false });
    currentRender();
  });

  router.addRoute('/file/:id', (params) => {
    currentRender = () => mount(render.renderFile(CONTENT, params.id, locale()), { chrome: false });
    currentRender();
  });

  router.addRoute('/collection', () => {
    currentRender = () => mount(render.renderCollection(CONTENT, locale()), { chrome: false });
    currentRender();
  });

  router.addRoute('/walk', () => {
    setChromeVisible(false);
    mainEl.innerHTML = '';
    currentRender = () => renderWalk(CONTENT, locale(), mainEl);
    currentRender();
  });

  router.addRoute('/gone', () => {
    currentRender = () => {
      setChromeVisible(false);
      mainEl.innerHTML = '';
      mainEl.appendChild(render.renderGone(CONTENT, locale()));
    };
    currentRender();
  });

  router.addRoute('/admin', () => {
    setChromeVisible(false);
    currentRender = () => {
      mainEl.innerHTML = '';
      mainEl.appendChild(render.renderAdmin());
    };
    currentRender();
  });

  router.setNotFound(() => {
    currentRender = () => {
      mount(render.renderNotFound(CONTENT, locale()), { chrome: true, breadcrumb: null });
    };
    currentRender();
  });
}

function guard(path) {
  if (path === '/admin') return null;
  if (flags.isFinished() && path !== '/gone') return '/gone';
  if (path === '/walk' && !flags.isWalkUnlocked()) return '/';
  if (!store.get('nickname') && path !== '/intro') return '/intro';
  if (store.get('nickname') && path === '/intro') return '/';
  return null;
}

function applyWarningText() {
  warningEl.querySelector('.content-warning__title').textContent = t(CONTENT.contentWarning.title, locale());
  warningEl.querySelector('.content-warning__body').textContent = t(CONTENT.contentWarning.body, locale());
  warningEl.querySelector('.content-warning__continue').textContent = t(CONTENT.contentWarning.continue, locale());
}

function showWarningIfNeeded() {
  return new Promise((resolve) => {
    if (store.get('warningSeen')) {
      resolve();
      return;
    }
    warningEl.hidden = false;
    applyWarningText();
    const btn = warningEl.querySelector('.content-warning__continue');
    btn.addEventListener(
      'click',
      () => {
        store.set('warningSeen', true);
        warningEl.hidden = true;
        resolve();
      },
      { once: true }
    );
  });
}

async function boot() {
  const res = await fetch('data/content.json');
  CONTENT = await res.json();

  if (!store.get('firstVisitDate')) {
    store.set('firstVisitDate', todayString());
  }

  renderLangSwitcher();
  await showWarningIfNeeded();

  appEl.hidden = false;
  donateEl.href = '#/donate';
  notebook.mount(CONTENT, locale());

  registerRoutes();
  router.setGuard(guard);
  router.start();
}

boot();
