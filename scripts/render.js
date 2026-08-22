import { store } from './store.js';
import { t } from './i18n.js';
import * as flags from './flags.js';
import { LABELS, STATUS_VALUES } from './labels.js';
import { sha256Hex } from './hash.js';

const STATUS_CLASS = { 協尋中: 'searching', 已尋獲: 'found', 已結案: 'closed' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function link(text, href) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  return a;
}

function label(key, locale) {
  return t(LABELS[key], locale);
}

function statusLabel(key, locale) {
  return t(STATUS_VALUES[key], locale);
}

// Small hand-drawn line-icon set — plain geometric shapes, not sourced from any
// icon library or photo, so there's nothing to license and nothing that could be
// mistaken for a real photograph anywhere on the site.
const ICON_PATHS = {
  users: ['<circle cx="8" cy="8" r="3"></circle>', '<circle cx="17" cy="9" r="2.5"></circle>', '<path d="M2 20c0-3.3 2.7-5 6-5s6 1.7 6 5"></path>', '<path d="M15 20c0-2.5 1.8-4 4.5-4S22 17.5 22 20"></path>'],
  heart: ['<path d="M12 20s-7-4.2-9.3-8.6C1.2 8.4 2.3 5 5.8 5c2 0 3.7 1.3 6.2 4 2.5-2.7 4.2-4 6.2-4 3.5 0 4.6 3.4 3.1 6.4C19 15.8 12 20 12 20z"></path>'],
  mail: ['<rect x="2.5" y="5" width="19" height="14" rx="1.5"></rect>', '<path d="M3 6.5l9 6.5 9-6.5"></path>'],
  phone: ['<path d="M5 4h3l1.5 4-2 1.5c1 2.5 2.5 4 5 5l1.5-2 4 1.5v3c0 1-1 2-2 2C10 19 5 14 5 8c0-1.5.5-3 0-4z"></path>'],
  document: ['<path d="M6 2.5h8l4 4v15H6z"></path>', '<path d="M14 2.5v4h4"></path>', '<path d="M9 12h6M9 15.5h6"></path>'],
  bell: ['<path d="M12 3c-3 0-5 2.3-5 5.5V13l-1.5 3h13L17 13V8.5C17 5.3 15 3 12 3z"></path>', '<path d="M10 19a2 2 0 004 0"></path>'],
  shield: ['<path d="M12 3l7 3v5.5c0 4.6-3 7.8-7 9.5-4-1.7-7-4.9-7-9.5V6z"></path>'],
  building: ['<rect x="4" y="3" width="16" height="18"></rect>', '<path d="M8 7.5h2M14 7.5h2M8 11.5h2M14 11.5h2M8 15.5h2M14 15.5h2"></path>', '<path d="M10 21v-4h4v4"></path>']
};

function icon(name, className) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = (ICON_PATHS[name] || []).join('');
  if (className) svg.setAttribute('class', className);
  return svg;
}

function tableRow(labelText, valueNode) {
  const tr = document.createElement('tr');
  const th = el('th', 'case-table__label', labelText);
  const td = el('td', 'case-table__value');
  if (typeof valueNode === 'string') td.textContent = valueNode;
  else td.appendChild(valueNode);
  tr.appendChild(th);
  tr.appendChild(td);
  return tr;
}

export function homeCrumb(locale) {
  return label('home', locale);
}

export function renderHome(page, locale) {
  const root = el('div');

  const hero = el('div', 'home-hero');
  hero.appendChild(el('h1', 'home-hero__title', t(page.heroTitle, locale)));
  hero.appendChild(el('p', 'home-hero__body', t(page.homeIntro, locale)));
  root.appendChild(hero);

  if (flags.isMidUpdateFired()) {
    const card = el('div', 'announcement');
    card.appendChild(el('p', 'announcement__date', page.announcement.date));
    card.appendChild(el('h2', 'announcement__title', t(page.announcement.title, locale)));
    card.appendChild(el('p', 'announcement__body', t(page.announcement.body, locale)));
    root.appendChild(card);
  }

  const statusKeyOf = (c) => (c.id === 'JH-2025-003' && flags.isMidUpdateFired() ? c.statusAfterMidUpdate : c.status);

  const counts = { 協尋中: 0, 已尋獲: 0, 已結案: 0 };
  page.cases.forEach((c) => {
    counts[statusKeyOf(c)] = (counts[statusKeyOf(c)] || 0) + 1;
  });
  const unit = label('statsUnit', locale);
  const statsGrid = el('div', 'home-stats');
  [
    [label('statsTotal', locale), page.cases.length, 'document'],
    [statusLabel('協尋中', locale), counts['協尋中'], 'bell'],
    [statusLabel('已尋獲', locale), counts['已尋獲'], 'heart'],
    [statusLabel('已結案', locale), counts['已結案'], 'shield']
  ].forEach(([statLabel, value, iconName]) => {
    const card = el('div', 'home-stats__card');
    card.appendChild(icon(iconName, 'home-stats__icon'));
    card.appendChild(el('span', 'home-stats__value', String(value) + unit));
    card.appendChild(el('span', 'home-stats__label', statLabel));
    statsGrid.appendChild(card);
  });
  root.appendChild(statsGrid);

  if (page.quickLinks) {
    const quickTitle = el('h2', null, label('quickServicesTitle', locale));
    root.appendChild(quickTitle);
    const quickGrid = el('div', 'home-quicklinks');
    page.quickLinks.forEach((q) => {
      const a = document.createElement('a');
      a.className = 'home-quicklinks__item';
      a.href = q.href;
      a.appendChild(icon(q.icon, 'home-quicklinks__icon'));
      a.appendChild(el('span', null, label(q.labelKey, locale)));
      quickGrid.appendChild(a);
    });
    root.appendChild(quickGrid);
  }

  const controlsWrap = el('div', 'case-list__controls');
  const filterLabel = el('label', null, label('filterLabel', locale) + '　');
  const select = document.createElement('select');
  select.className = 'case-list__filter';
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = label('filterAll', locale);
  select.appendChild(allOption);
  ['協尋中', '已尋獲', '已結案'].forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = statusLabel(key, locale);
    select.appendChild(opt);
  });
  filterLabel.appendChild(select);
  controlsWrap.appendChild(filterLabel);

  const sortLabelEl = el('label', null, label('sortLabel', locale) + '　');
  const sortSelect = document.createElement('select');
  sortSelect.className = 'case-list__sort';
  const STATUS_ORDER = { 協尋中: 0, 已尋獲: 1, 已結案: 2 };
  const SORTERS = {
    'missing-desc': (a, b) => (a.missing < b.missing ? 1 : a.missing > b.missing ? -1 : 0),
    'missing-asc': (a, b) => (a.missing > b.missing ? 1 : a.missing < b.missing ? -1 : 0),
    id: (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    name: (a, b) => a.name.localeCompare(b.name, 'zh-Hant'),
    status: (a, b) => STATUS_ORDER[statusKeyOf(a)] - STATUS_ORDER[statusKeyOf(b)] || (a.missing < b.missing ? 1 : a.missing > b.missing ? -1 : 0)
  };
  [
    ['missing-desc', 'sortMissingDesc'],
    ['missing-asc', 'sortMissingAsc'],
    ['id', 'sortId'],
    ['name', 'sortName'],
    ['status', 'sortStatusOpt']
  ].forEach(([value, key]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label(key, locale);
    sortSelect.appendChild(opt);
  });
  sortSelect.value = 'missing-desc';
  sortLabelEl.appendChild(sortSelect);
  controlsWrap.appendChild(sortLabelEl);
  root.appendChild(controlsWrap);

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  [label('caseId', locale), label('name', locale), label('missingDate', locale), label('status', locale)].forEach((h) => {
    headRow.appendChild(el('th', 'data-table__cell', h));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  table.appendChild(tbody);
  root.appendChild(table);

  function buildRows(sortKey) {
    tbody.replaceChildren();
    const sortedCases = page.cases.slice().sort(SORTERS[sortKey] || SORTERS['missing-desc']);
    sortedCases.forEach((c) => {
      const statusKey = statusKeyOf(c);
      const tr = el('tr', 'data-table__row');
      tr.dataset.status = statusKey;
      const idCell = el('td', 'data-table__cell');
      idCell.appendChild(link(c.id, 'case/' + c.id + '.html'));
      tr.appendChild(idCell);
      tr.appendChild(el('td', 'data-table__cell', c.name));
      tr.appendChild(el('td', 'data-table__cell', c.missing));
      const statusCell = el('td', 'data-table__cell');
      statusCell.appendChild(el('span', 'status status--' + STATUS_CLASS[statusKey], statusLabel(statusKey, locale)));
      tr.appendChild(statusCell);
      tbody.appendChild(tr);
    });
    applyFilter();
  }

  function applyFilter() {
    const val = select.value;
    tbody.querySelectorAll('tr').forEach((tr) => {
      tr.hidden = !!val && tr.dataset.status !== val;
    });
  }

  buildRows(sortSelect.value);
  select.addEventListener('change', applyFilter);
  sortSelect.addEventListener('change', () => buildRows(sortSelect.value));

  if (page.news) {
    root.appendChild(el('h2', null, label('newsTitle', locale)));
    const newsList = el('ul', 'home-news');
    page.news.forEach((n) => {
      const li = el('li', 'home-news__item');
      li.appendChild(el('span', 'home-news__date', n.date));
      li.appendChild(el('span', 'home-news__title', t(n.title, locale)));
      newsList.appendChild(li);
    });
    root.appendChild(newsList);
  }

  if (page.partners) {
    root.appendChild(el('h2', null, label('partnersTitle', locale)));
    const partnerRow = el('div', 'home-partners');
    page.partners.forEach((p) => {
      partnerRow.appendChild(el('span', 'home-partners__badge', t(p, locale)));
    });
    root.appendChild(partnerRow);
  }

  return root;
}

export function renderIntro(page, locale, onSubmit) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));

  const form = el('form', 'intro-form');
  const inputs = {};

  page.fields.forEach((field) => {
    const wrap = el('div', 'intro-form__field');
    const fieldLabel = el('label', 'intro-form__label', t(field.label, locale));
    fieldLabel.htmlFor = 'field-' + field.id;
    wrap.appendChild(fieldLabel);

    let input;
    if (field.type === 'textarea') {
      input = el('textarea', 'intro-form__textarea');
    } else {
      input = el('input', 'intro-form__input');
      input.type = 'text';
    }
    input.id = 'field-' + field.id;
    input.maxLength = field.maxlength;
    wrap.appendChild(input);
    form.appendChild(wrap);
    inputs[field.id] = input;
  });

  const submit = el('button', 'intro-form__submit', t(page.submit, locale));
  submit.type = 'submit';
  form.appendChild(submit);
  form.appendChild(el('p', 'intro-form__note', t(page.note, locale)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onSubmit({
      nickname: inputs.nickname.value.trim(),
      howYouKnew: inputs.howYouKnew.value.trim()
    });
  });

  root.appendChild(form);
  return root;
}

export function renderCaseDetail(c, locale) {
  flags.noteCaseSeen(c.id);

  const statusKey = c.id === 'JH-2025-003' && flags.isMidUpdateFired() ? c.statusAfterMidUpdate : c.status;
  const showRecovery = c.recovery && (statusKey === '已尋獲' || statusKey === '已結案');

  const root = el('div');
  const table = el('table', 'case-table');
  const tbody = el('tbody');

  tbody.appendChild(tableRow(label('caseId', locale), c.id));
  tbody.appendChild(tableRow(label('name', locale), c.name));
  tbody.appendChild(tableRow(label('ageAtDisappearance', locale), String(c.age)));
  tbody.appendChild(tableRow(label('missingDate', locale), c.missing));
  tbody.appendChild(tableRow(label('lastSeen', locale), t(c.lastSeen, locale)));

  const statusSpan = el('span', 'status status--' + STATUS_CLASS[statusKey], statusLabel(statusKey, locale));
  tbody.appendChild(tableRow(label('status', locale), statusSpan));

  if (c.statusHistory) {
    const historyList = el('ul', null);
    c.statusHistory.forEach((h) => {
      historyList.appendChild(el('li', null, h.date + '　' + statusLabel(h.value, locale)));
    });
    tbody.appendChild(tableRow(label('statusHistory', locale), historyList));
  }

  if (showRecovery) {
    tbody.appendChild(tableRow(label('recoveryDate', locale), c.recovery.date));
    tbody.appendChild(tableRow(label('recoveryPlace', locale), t(c.recovery.place, locale)));
    tbody.appendChild(tableRow(label('condition', locale), t(c.recovery.condition, locale)));
    tbody.appendChild(tableRow(label('cause', locale), t(c.recovery.cause, locale)));
    tbody.appendChild(tableRow(label('timeOfDeath', locale), t(c.recovery.timeOfDeath, locale)));
    tbody.appendChild(tableRow(label('belongings', locale), t(c.recovery.belongings, locale)));
  }

  const summaryText = c.summaryRevised && flags.isSecondUpdateFired() ? c.summaryRevised : c.summary;
  tbody.appendChild(tableRow(label('summary', locale), t(summaryText, locale)));

  const details = document.createElement('details');
  const summaryEl = document.createElement('summary');
  summaryEl.textContent = label('viewPdf', locale);
  details.appendChild(summaryEl);
  details.appendChild(el('p', null, '[' + t(c.photoNote, locale) + ']'));
  tbody.appendChild(tableRow(label('poster', locale), details));

  if (c.links) {
    const relatedWrap = el('div');
    c.links.forEach((l) => relatedWrap.appendChild(link(t(l.label, locale), l.href)));
    tbody.appendChild(tableRow(label('relatedLinks', locale), relatedWrap));
  }

  [c.note, c.removedNote].forEach((noteField) => {
    if (noteField) tbody.appendChild(tableRow(label('note', locale), t(noteField, locale)));
  });

  table.appendChild(tbody);
  root.appendChild(table);
  return root;
}

export function renderChatlog(chatlog, school, locale) {
  const wrap = el('div', 'chatlog');
  wrap.appendChild(el('h3', null, label('evidenceChatlog', locale)));
  wrap.appendChild(el('p', 'note-block', label('recoveredFromLabel', locale) + '：' + t(chatlog.recoveredFrom, locale)));

  chatlog.messages.forEach((m) => {
    const line = el('p', 'chatlog__message');
    line.appendChild(el('span', 'chatlog__time', m.t + '　'));
    line.appendChild(el('span', 'chatlog__who', m.who + '：'));
    const text = t(m.text, locale);
    if (text) line.appendChild(el('span', 'chatlog__text', text));
    if (m.attachment) line.appendChild(el('span', 'chatlog__attachment', '［' + t(m.attachment, locale) + '］'));
    wrap.appendChild(line);
  });
  wrap.appendChild(el('p', 'note-block', t(chatlog.footer, locale)));

  wrap.appendChild(el('h4', null, label('evidenceSchoolNotice', locale)));
  wrap.appendChild(el('p', null, school.posted + '　' + t(school.text, locale)));

  return wrap;
}

export function renderFileLines(lines) {
  const root = el('div', 'file-view');
  lines.forEach((line) => root.appendChild(el('p', null, line)));
  return root;
}

export function appendUpLink(root, locale) {
  if (flags.isCollectionUnlocked()) {
    root.appendChild(link(label('upLink', locale), 'collection.html'));
  }
  return root;
}

export function renderFile007(data, locale) {
  const root = renderFileLines([
    '007.txt',
    label('name', locale) + '　' + data.name,
    label('filed', locale) + '　' + data.created,
    label('lastUpdated', locale) + '　' + data.updated
  ]);
  root.appendChild(el('p', null, label('relatedMarketSnapshot', locale)));
  root.appendChild(link(data.seller, 'market.html'));
  return appendUpLink(root, locale);
}

export function renderFile012(data, locale) {
  const lines = ['012.txt', label('name', locale) + '　' + data.name, label('filed', locale) + '　' + data.created];
  if (flags.isMidUpdateFired() && data.updatedAfterMidUpdate) {
    lines.push(label('lastUpdated', locale) + '　' + data.updatedAfterMidUpdate);
  }
  return appendUpLink(renderFileLines(lines), locale);
}

export function renderFile015(data, chatlog, school, locale) {
  const root = renderFileLines(['015.txt', label('name', locale) + '　' + data.name, label('filed', locale) + '　' + data.created]);
  root.appendChild(renderChatlog(chatlog, school, locale));
  return appendUpLink(root, locale);
}

export function renderFile013(howYouKnew, firstVisitDate, locale) {
  return appendUpLink(renderFileLines(['013.txt', howYouKnew || '—', label('filed', locale) + '　' + (firstVisitDate || '—')]), locale);
}

export function renderFile014(locale) {
  return appendUpLink(renderFileLines(['014.txt', '—']), locale);
}

export function renderTrust(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  root.appendChild(el('p', null, t(page.note, locale)));

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  [label('year', locale), label('date', locale), label('amount', locale), label('donorName', locale), label('zip', locale)].forEach((h) =>
    headRow.appendChild(el('th', 'data-table__cell', h))
  );
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  page.rows.forEach((r) => {
    const tr = el('tr', 'data-table__row');
    tr.appendChild(el('td', 'data-table__cell', r.year));
    tr.appendChild(el('td', 'data-table__cell', r.date));
    tr.appendChild(el('td', 'data-table__cell', r.amount));
    tr.appendChild(el('td', 'data-table__cell', t(r.name, locale)));
    tr.appendChild(el('td', 'data-table__cell', t(r.zip, locale)));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);

  return root;
}

export function renderWorksheet(page, locale, onSolved) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  root.appendChild(el('p', null, t(page.note, locale)));

  const solved = !!store.get('trustPuzzleSolved');

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  const headers = [label('year', locale), label('date', locale), label('amount', locale), label('donorName', locale), label('zip', locale)];
  if (!solved) headers.push(label('correspondingCase', locale));
  headers.forEach((h) => headRow.appendChild(el('th', 'data-table__cell', h)));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  const selects = [];
  page.rows.forEach((r) => {
    const tr = el('tr', 'data-table__row');
    tr.appendChild(el('td', 'data-table__cell', r.year));
    tr.appendChild(el('td', 'data-table__cell', r.date));
    tr.appendChild(el('td', 'data-table__cell', r.amount));
    tr.appendChild(el('td', 'data-table__cell', t(r.name, locale)));
    tr.appendChild(el('td', 'data-table__cell', t(r.zip, locale)));
    if (!solved) {
      const td = el('td', 'data-table__cell');
      const select = document.createElement('select');
      select.className = 'trust-puzzle__input';
      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = label('chooseCasePlaceholder', locale);
      select.appendChild(blank);
      page.cases.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.id + '　' + c.name;
        select.appendChild(opt);
      });
      const feedback = el('span', 'trust-puzzle__feedback');
      td.appendChild(select);
      td.appendChild(feedback);
      tr.appendChild(td);
      selects.push({ select, feedback, row: r });
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);

  if (solved) {
    root.appendChild(link(label('archiveLink', locale), 'archive2019.html'));
    return root;
  }

  root.appendChild(el('p', null, t(page.puzzle.prompt, locale)));
  const resultMsg = el('p', 'note-block');
  const hintMsg = el('p', 'note-block');
  const checkBtn = el('button', 'choice__btn', t(page.puzzle.check, locale));
  checkBtn.type = 'button';
  let attempts = 0;
  checkBtn.addEventListener('click', async () => {
    checkBtn.disabled = true;
    const results = await Promise.all(
      selects.map(async ({ select, row }) => {
        if (!select.value) return false;
        const hash = await sha256Hex(select.value);
        return hash === row.correctHash;
      })
    );
    selects.forEach(({ feedback }, i) => {
      feedback.textContent = results[i] ? '✓' : '✗';
    });
    const allCorrect = results.every(Boolean);
    if (allCorrect) {
      store.set('trustPuzzleSolved', true);
      resultMsg.textContent = t(page.puzzle.allCorrect, locale);
      hintMsg.textContent = '';
      selects.forEach(({ select: s }) => (s.disabled = true));
      root.appendChild(link(label('archiveLink', locale), 'archive2019.html'));
      if (onSolved) onSolved();
    } else {
      attempts += 1;
      resultMsg.textContent = t(page.puzzle.incorrect, locale);
      if (attempts >= 3 && page.puzzle.hint) {
        hintMsg.textContent = t(page.puzzle.hint, locale);
      }
      checkBtn.disabled = false;
    }
  });
  root.appendChild(checkBtn);
  root.appendChild(resultMsg);
  root.appendChild(hintMsg);

  return root;
}

export function renderArchive2019(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  root.appendChild(el('p', null, t(page.note, locale)));

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  [label('donorName', locale), label('district', locale), label('note', locale)].forEach((h) => {
    headRow.appendChild(el('th', 'data-table__cell', h));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  page.rows.forEach((r) => {
    const tr = el('tr', 'data-table__row');
    tr.appendChild(el('td', 'data-table__cell', t(r.name, locale)));
    tr.appendChild(el('td', 'data-table__cell', t(r.district, locale)));
    tr.appendChild(el('td', 'data-table__cell', r.note ? t(r.note, locale) : ''));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);

  root.appendChild(link(label('closeSnapshot', locale), 'index.html'));
  return root;
}

export function renderMarket(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, page.seller));
  root.appendChild(el('p', null, t(page.note, locale)));

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  [label('listingTitle', locale), label('posted', locale), label('deal', locale), label('spot', locale)].forEach((h) => {
    headRow.appendChild(el('th', 'data-table__cell', h));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  page.listings.forEach((item) => {
    const tr = el('tr', 'data-table__row');
    tr.appendChild(el('td', 'data-table__cell', t(item.title, locale)));
    tr.appendChild(el('td', 'data-table__cell', item.posted));
    tr.appendChild(el('td', 'data-table__cell', t(item.deal, locale)));
    tr.appendChild(el('td', 'data-table__cell', t(item.spot, locale)));
    tbody.appendChild(tr);
    if (item.comments !== undefined) {
      const metaTr = el('tr', 'data-table__row');
      const metaTd = el('td', 'data-table__cell');
      metaTd.colSpan = 4;
      metaTd.textContent = label('comments', locale) + ' ' + item.comments + '　' + label('replies', locale) + ' ' + item.replies;
      metaTr.appendChild(metaTd);
      tbody.appendChild(metaTr);
    }
    if (item.photoNote) {
      const photoTr = el('tr', 'data-table__row');
      const photoTd = el('td', 'data-table__cell');
      photoTd.colSpan = 4;
      const details = document.createElement('details');
      const summaryEl = document.createElement('summary');
      summaryEl.textContent = label('viewDetail', locale);
      details.appendChild(summaryEl);
      details.appendChild(el('p', 'note-block', t(item.photoNote, locale)));
      photoTd.appendChild(details);
      photoTr.appendChild(photoTd);
      tbody.appendChild(photoTr);
    }
  });
  table.appendChild(tbody);
  root.appendChild(table);

  root.appendChild(link(label('closeSnapshot', locale), 'index.html'));
  return root;
}

export function renderLegacy(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  root.appendChild(el('p', null, page.author));
  root.appendChild(el('p', null, t(page.note, locale)));
  root.appendChild(el('p', null, t(page.line, locale)));

  if (page.staleLinks) {
    root.appendChild(el('p', 'note-block', t(page.staleLinksNote, locale)));
    const linksLine = el('p', null);
    page.staleLinks.forEach((sl, i) => {
      if (i > 0) linksLine.appendChild(document.createTextNode('　'));
      linksLine.appendChild(link(sl.id + '.txt', 'file/' + sl.id + '.html'));
    });
    root.appendChild(linksLine);
  }

  root.appendChild(link(label('closeSnapshot', locale), 'index.html'));
  return root;
}

export function renderCollection(page, locale) {
  const root = el('div', 'collection');

  for (let n = 1; n <= 15; n++) {
    const id = String(n).padStart(3, '0');
    const line = el('p', null);
    const a = link(id + '.txt', 'file/' + id + '.html');
    line.appendChild(a);

    if (id === '007') {
      line.appendChild(document.createTextNode('　' + page.file007.name + '　' + label('filed', locale) + ' ' + page.file007.created + '　' + label('lastUpdated', locale) + ' ' + page.file007.updated));
    } else if (id === '012') {
      const updated = flags.isMidUpdateFired() ? page.file012.updatedAfterMidUpdate : null;
      let text = '　' + page.file012.name + '　' + label('filed', locale) + ' ' + page.file012.created;
      if (updated) text += '　' + label('lastUpdated', locale) + ' ' + updated;
      line.appendChild(document.createTextNode(text));
    } else if (id === '013') {
      line.appendChild(document.createTextNode('　' + (store.get('nickname') || '—')));
    } else if (id === '014') {
      line.appendChild(document.createTextNode('　—'));
    } else if (id === '015') {
      line.appendChild(document.createTextNode('　' + page.file015.name + '　' + label('filed', locale) + ' ' + page.file015.created));
    }
    root.appendChild(line);
  }

  if (flags.isWalkUnlocked()) {
    const line = el('p', null);
    line.appendChild(link('016.txt', 'walk.html'));
    root.appendChild(line);
  }

  return root;
}

export function renderGone(page, locale) {
  const root = el('div', 'gone');
  page.lines.forEach((line) => root.appendChild(el('p', null, t(line, locale))));
  const donate = el('a', 'site-header__donate', t(page.donateLabel, locale));
  donate.href = 'javascript:void(0)';
  root.appendChild(donate);
  return root;
}

export function renderAbout(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));

  root.appendChild(el('h2', null, t(page.introTitle, locale)));
  root.appendChild(el('p', null, t(page.introBody, locale)));

  if (page.orgStats) {
    root.appendChild(el('h2', null, label('orgStatsTitle', locale)));
    const statsGrid = el('div', 'home-stats');
    page.orgStats.forEach((s) => {
      const card = el('div', 'home-stats__card');
      card.appendChild(icon(s.icon, 'home-stats__icon'));
      card.appendChild(el('span', 'home-stats__value', t(s.value, locale)));
      card.appendChild(el('span', 'home-stats__label', t(s.label, locale)));
      statsGrid.appendChild(card);
    });
    root.appendChild(statsGrid);
  }

  root.appendChild(el('h2', null, t(page.servicesTitle, locale)));
  const list = el('ul', null);
  page.services.forEach((s) => list.appendChild(el('li', null, t(s, locale))));
  root.appendChild(list);

  if (page.history) {
    root.appendChild(el('h2', null, label('historyTitle', locale)));
    const historyList = el('ul', null);
    page.history.forEach((h) => historyList.appendChild(el('li', null, h.year + '　' + t(h.text, locale))));
    root.appendChild(historyList);
  }

  root.appendChild(el('h2', null, t(page.hoursTitle, locale)));
  root.appendChild(el('p', null, t(page.hoursBody, locale)));

  return root;
}

export function renderFaq(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  page.items.forEach((item) => {
    root.appendChild(el('h2', null, t(item.q, locale)));
    root.appendChild(el('p', null, t(item.a, locale)));
  });
  return root;
}

export function renderContact(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));

  const table = el('table', 'case-table');
  const tbody = el('tbody');
  tbody.appendChild(tableRow(label('officeHours', locale), t(page.hoursBody, locale)));
  tbody.appendChild(tableRow(label('phone', locale), page.phoneValue));
  tbody.appendChild(tableRow(label('email', locale), page.emailValue));
  table.appendChild(tbody);
  root.appendChild(table);

  root.appendChild(el('p', 'note-block', t(page.noCounter, locale)));
  return root;
}

export function renderDonate(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  root.appendChild(el('p', null, t(page.intro, locale)));

  root.appendChild(el('h2', null, t(page.bankTitle, locale)));
  const bankList = el('ul', null);
  page.bankLines.forEach((line) => bankList.appendChild(el('li', null, t(line, locale))));
  root.appendChild(bankList);

  root.appendChild(el('h2', null, t(page.receiptTitle, locale)));
  root.appendChild(el('p', null, t(page.receiptBody, locale)));

  root.appendChild(el('h2', null, t(page.disclosureTitle, locale)));
  root.appendChild(el('p', null, t(page.disclosureBody, locale)));
  root.appendChild(link(label('trustFooterLink', locale), 'trust.html'));

  return root;
}

export function renderPrivacy(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  page.body.forEach((p) => root.appendChild(el('p', null, t(p, locale))));
  return root;
}

export function renderAccessibility(page, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(page.title, locale)));
  page.body.forEach((p) => root.appendChild(el('p', null, t(p, locale))));
  return root;
}

function stateDump() {
  const keys = [
    'locale', 'nickname', 'howYouKnew', 'firstVisitDate', 'warningSeen', 'introCompletedAt',
    'midUpdateFired', 'secondUpdateFired', 'collectionUnlocked', 'trustPuzzleSolved', 'refusedCount', 'finished'
  ];
  const lines = keys.map((k) => k + ': ' + JSON.stringify(store.get(k)));
  lines.push('seen: ' + JSON.stringify(store.get('seen')));
  return lines.join('\n');
}

export function renderAdmin() {
  const root = el('div', 'admin-panel');
  root.appendChild(el('h1', null, '管理員重置面板'));
  root.appendChild(el('p', 'note-block', '這頁不對外連結，僅供測試用。按鈕會直接改本機儲存的進度並重新整頁。'));

  const pre = document.createElement('pre');
  pre.className = 'admin-panel__state';
  pre.textContent = stateDump();
  root.appendChild(pre);

  function button(labelText, onClick, { reload = true } = {}) {
    const btn = el('button', 'admin-panel__button', labelText);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      onClick();
      if (reload) location.reload();
    });
    root.appendChild(btn);
    return btn;
  }

  button('全部重置（清空進度，回到告示畫面）', () => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('jh4:'))
      .forEach((k) => localStorage.removeItem(k));
  });

  button('略過序章（暱稱設為 admin）', () => {
    store.set('nickname', 'admin');
    store.set('howYouKnew', '（管理員測試帳號）');
  });

  button('強制觸發中段更新（林晞已尋獲公告）', () => {
    store.set('midUpdateFired', true);
  });

  button('把「志工登錄時間」往前撥 3 小時（跳過中段更新的真實時間門檻）', () => {
    store.set('introCompletedAt', Date.now() - 3 * 60 * 60 * 1000);
  });

  button('強制觸發二次更新（JH-2026-004 摘要修正）', () => {
    store.set('midUpdateFired', true);
    store.markSeen('page-legacy');
    store.markSeen('file-015');
    store.set('secondUpdateFired', true);
  });

  button('強制解鎖收藏頁（標記三個 .txt 已讀）', () => {
    store.markSeen('file-007');
    store.markSeen('file-012');
    store.markSeen('file-015');
    store.set('collectionUnlocked', true);
  });

  button('強制解鎖第六幕（含上面全部條件）', () => {
    store.markSeen('file-007');
    store.markSeen('file-012');
    store.markSeen('file-015');
    store.set('collectionUnlocked', true);
    store.markSeen('page-trust');
    store.set('trustPuzzleSolved', true);
    store.markSeen('page-archive2019');
    store.markSeen('page-market');
    store.markSeen('page-collection');
  });

  button('解鎖並直接跳到第六幕', () => {
    store.markSeen('file-007');
    store.markSeen('file-012');
    store.markSeen('file-015');
    store.set('collectionUnlocked', true);
    store.markSeen('page-trust');
    store.set('trustPuzzleSolved', true);
    store.markSeen('page-archive2019');
    store.markSeen('page-market');
    store.markSeen('page-collection');
    location.href = 'walk.html';
  }, { reload: false });

  button('清除「已結束」狀態（重新打開網站）', () => {
    store.set('finished', false);
  });

  return root;
}
