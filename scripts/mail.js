import { store } from './store.js';
import { t } from './i18n.js';
import { MAIL_UI } from './labels.js';

let btnEl = null;
let panelEl = null;
let bodyEl = null;
let backdropEl = null;

function locale() {
  return store.get('locale');
}

function allLetters() {
  return store.get('letters') || [];
}

export function deliverLetter(id, letter, loc) {
  const list = allLetters();
  if (list.some((l) => l.id === id)) return;
  const stored = {
    id,
    subject: t(letter.subject, loc),
    body: t(letter.body, loc),
    linkLabel: t(letter.linkLabel, loc),
    linkHref: letter.linkHref,
    read: false,
    t: Date.now()
  };
  store.set('letters', [...list, stored]);
  renderBadge();
}

function markAllRead() {
  const list = allLetters();
  if (list.every((l) => l.read)) return;
  store.set('letters', list.map((l) => ({ ...l, read: true })));
  renderBadge();
}

function renderBadge() {
  if (!btnEl) return;
  const n = allLetters().filter((l) => !l.read).length;
  const badge = btnEl.querySelector('.mail__badge');
  if (badge) badge.textContent = n > 0 ? String(n) : '';
}

function renderBody() {
  if (!bodyEl) return;
  const letters = allLetters();
  bodyEl.innerHTML = '';
  if (letters.length === 0) {
    const p = document.createElement('p');
    p.className = 'mail__empty';
    p.textContent = t(MAIL_UI.empty, locale());
    bodyEl.appendChild(p);
    return;
  }
  const list = document.createElement('ul');
  list.className = 'mail__list';
  letters
    .slice()
    .reverse()
    .forEach((letter) => {
      const li = document.createElement('li');
      li.className = 'mail__item';
      const subject = document.createElement('p');
      subject.className = 'mail__subject';
      subject.textContent = letter.subject;
      const body = document.createElement('p');
      body.className = 'mail__text';
      body.textContent = letter.body;
      li.appendChild(subject);
      li.appendChild(body);
      if (letter.linkHref) {
        const a = document.createElement('a');
        a.className = 'mail__link';
        a.href = letter.linkHref;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = letter.linkLabel;
        li.appendChild(a);
      }
      list.appendChild(li);
    });
  bodyEl.appendChild(list);
}

function open() {
  renderBody();
  markAllRead();
  backdropEl.classList.add('mail__backdrop--open');
  panelEl.classList.add('mail__panel--open');
}

function close() {
  backdropEl.classList.remove('mail__backdrop--open');
  panelEl.classList.remove('mail__panel--open');
}

export function refreshText() {
  if (!btnEl) return;
  btnEl.querySelector('.mail__label').textContent = t(MAIL_UI.buttonLabel, locale());
  panelEl.querySelector('.mail__title').textContent = t(MAIL_UI.title, locale());
  panelEl.querySelector('.mail__close').textContent = t(MAIL_UI.close, locale());
  if (panelEl.classList.contains('mail__panel--open')) renderBody();
}

export function mount() {
  if (btnEl) {
    refreshText();
    return;
  }

  btnEl = document.createElement('button');
  btnEl.type = 'button';
  btnEl.className = 'mail__button';
  btnEl.innerHTML = '<span class="mail__label"></span> <span class="mail__badge"></span>';

  backdropEl = document.createElement('div');
  backdropEl.className = 'mail__backdrop';

  panelEl = document.createElement('div');
  panelEl.className = 'mail__panel';
  panelEl.innerHTML = `
    <div class="mail__header">
      <strong class="mail__title"></strong>
      <button type="button" class="mail__close"></button>
    </div>
    <div class="mail__body"></div>
  `;

  document.body.appendChild(btnEl);
  document.body.appendChild(backdropEl);
  document.body.appendChild(panelEl);
  bodyEl = panelEl.querySelector('.mail__body');

  btnEl.addEventListener('click', () => {
    if (panelEl.classList.contains('mail__panel--open')) close();
    else open();
  });
  backdropEl.addEventListener('click', close);
  panelEl.querySelector('.mail__close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  refreshText();
  renderBadge();
}
