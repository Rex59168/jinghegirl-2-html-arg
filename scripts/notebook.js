import { store } from './store.js';
import { t } from './i18n.js';

let btnEl = null;
let panelEl = null;
let bodyEl = null;
let backdropEl = null;
let currentContent = null;
let currentLocale = 'zh-Hant';

function allFacts() {
  return store.get('notebook') || [];
}

export function addFact(id, text, route) {
  const list = allFacts();
  const idx = list.findIndex((f) => f.id === id);
  if (idx >= 0) {
    if (list[idx].text === text) return;
    const next = list.slice();
    next[idx] = { ...next[idx], text, route };
    store.set('notebook', next);
  } else {
    store.set('notebook', [...list, { id, text, route, t: Date.now() }]);
  }
  renderBadge();
}

function renderBadge() {
  if (!btnEl) return;
  const n = allFacts().length;
  const badge = btnEl.querySelector('.notebook__badge');
  if (badge) badge.textContent = n > 0 ? String(n) : '';
}

function renderBody() {
  if (!bodyEl || !currentContent) return;
  const facts = allFacts();
  bodyEl.innerHTML = '';
  if (facts.length === 0) {
    const p = document.createElement('p');
    p.className = 'notebook__empty';
    p.textContent = t(currentContent.notebook.empty, currentLocale);
    bodyEl.appendChild(p);
    return;
  }
  const list = document.createElement('ul');
  list.className = 'notebook__list';
  facts.forEach((f) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + f.route;
    a.textContent = f.text;
    a.addEventListener('click', close);
    li.appendChild(a);
    list.appendChild(li);
  });
  bodyEl.appendChild(list);
}

function open() {
  renderBody();
  backdropEl.classList.add('notebook__backdrop--open');
  panelEl.classList.add('notebook__panel--open');
}

function close() {
  backdropEl.classList.remove('notebook__backdrop--open');
  panelEl.classList.remove('notebook__panel--open');
}

export function refreshText(content, locale) {
  currentContent = content;
  currentLocale = locale;
  if (!btnEl) return;
  btnEl.querySelector('.notebook__label').textContent = t(content.notebook.buttonLabel, locale);
  panelEl.querySelector('.notebook__title').textContent = t(content.notebook.title, locale);
  panelEl.querySelector('.notebook__close').textContent = t(content.notebook.close, locale);
  if (panelEl.classList.contains('notebook__panel--open')) renderBody();
}

export function mount(content, locale) {
  currentContent = content;
  currentLocale = locale;
  if (btnEl) {
    refreshText(content, locale);
    return;
  }

  btnEl = document.createElement('button');
  btnEl.type = 'button';
  btnEl.className = 'notebook__button';
  btnEl.innerHTML = '<span class="notebook__label"></span> <span class="notebook__badge"></span>';

  backdropEl = document.createElement('div');
  backdropEl.className = 'notebook__backdrop';

  panelEl = document.createElement('div');
  panelEl.className = 'notebook__panel';
  panelEl.innerHTML = `
    <div class="notebook__header">
      <strong class="notebook__title"></strong>
      <button type="button" class="notebook__close"></button>
    </div>
    <div class="notebook__body"></div>
  `;

  document.body.appendChild(btnEl);
  document.body.appendChild(backdropEl);
  document.body.appendChild(panelEl);
  bodyEl = panelEl.querySelector('.notebook__body');

  btnEl.addEventListener('click', () => {
    if (panelEl.classList.contains('notebook__panel--open')) close();
    else open();
  });
  backdropEl.addEventListener('click', close);
  panelEl.querySelector('.notebook__close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  refreshText(content, locale);
  renderBadge();
}
