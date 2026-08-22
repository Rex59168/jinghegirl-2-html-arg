import { store } from './store.js';
import { t } from './i18n.js';
import * as flags from './flags.js';
import * as notebook from './notebook.js';

const STATUS_CLASS = { 協尋中: 'searching', 已尋獲: 'found', 已結案: 'closed' };
const CASE_FILE_MAP = { 'JH-2022-002': '007', 'JH-2025-003': '012', 'JH-2026-004': '015' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function link(text, route) {
  const a = document.createElement('a');
  a.href = '#' + route;
  a.textContent = text;
  return a;
}

function findCase(content, id) {
  return content.cases.find((c) => c.id === id);
}

function normalizeAnswer(s) {
  return String(s || '').trim().toUpperCase().replace(/[-\s]/g, '');
}

function caseMatchesAnswer(c, answer) {
  const norm = normalizeAnswer(answer);
  if (!norm || !c) return false;
  return normalizeAnswer(c.name) === norm || normalizeAnswer(c.id) === norm;
}

function statusLabel(content, key, locale) {
  return t(content.statusValues[key], locale);
}

function labelOf(content, key, locale) {
  return t(content.labels[key], locale);
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

export function breadcrumbHome(content, locale) {
  return labelOf(content, 'home', locale);
}

export function renderHome(content, locale) {
  const root = el('div');

  root.appendChild(el('p', 'note-block', t(content.org.homeIntro, locale)));

  if (flags.isMidUpdateFired()) {
    const card = el('div', 'announcement');
    card.appendChild(el('p', 'announcement__date', content.announcement.date));
    card.appendChild(el('h2', 'announcement__title', t(content.announcement.title, locale)));
    card.appendChild(el('p', 'announcement__body', t(content.announcement.body, locale)));
    root.appendChild(card);
    notebook.addFact('mid-update', t(content.notebookFacts.midUpdate, locale), '/');
  }

  const statusKeyOf = (c) => (c.id === 'JH-2025-003' && flags.isMidUpdateFired() ? c.statusAfterMidUpdate : c.status);

  const counts = { 協尋中: 0, 已尋獲: 0, 已結案: 0 };
  content.cases.forEach((c) => {
    counts[statusKeyOf(c)] = (counts[statusKeyOf(c)] || 0) + 1;
  });
  const statsLine = el('p', 'note-block');
  const unit = labelOf(content, 'statsUnit', locale);
  statsLine.textContent =
    labelOf(content, 'statsTotal', locale) + '　' + content.cases.length + unit +
    '　｜　' + statusLabel(content, '協尋中', locale) + ' ' + counts['協尋中'] + unit +
    '　' + statusLabel(content, '已尋獲', locale) + ' ' + counts['已尋獲'] + unit +
    '　' + statusLabel(content, '已結案', locale) + ' ' + counts['已結案'] + unit;
  root.appendChild(statsLine);

  const filterWrap = el('p', null);
  const filterLabel = el('label', null, labelOf(content, 'filterLabel', locale) + '　');
  const select = document.createElement('select');
  select.className = 'case-list__filter';
  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = labelOf(content, 'filterAll', locale);
  select.appendChild(allOption);
  ['協尋中', '已尋獲', '已結案'].forEach((key) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = statusLabel(content, key, locale);
    select.appendChild(opt);
  });
  filterLabel.appendChild(select);
  filterWrap.appendChild(filterLabel);
  root.appendChild(filterWrap);

  const list = el('ul', 'case-list');
  content.cases.forEach((c) => {
    const statusKey = statusKeyOf(c);
    const li = el('li', 'case-list__item');
    li.dataset.status = statusKey;
    const a = link(c.id, '/case/' + c.id);
    a.className = 'case-list__id';
    li.appendChild(a);
    li.appendChild(el('span', 'case-list__name', c.name));
    li.appendChild(el('span', 'status status--' + STATUS_CLASS[statusKey], statusLabel(content, statusKey, locale)));
    list.appendChild(li);
  });
  root.appendChild(list);

  select.addEventListener('change', () => {
    const val = select.value;
    list.querySelectorAll('.case-list__item').forEach((li) => {
      li.hidden = !!val && li.dataset.status !== val;
    });
  });

  return root;
}

export function renderIntro(content, locale, onSubmit) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.intro.title, locale)));

  const form = el('form', 'intro-form');
  const inputs = {};

  content.intro.fields.forEach((field) => {
    const wrap = el('div', 'intro-form__field');
    const label = el('label', 'intro-form__label', t(field.label, locale));
    label.htmlFor = 'field-' + field.id;
    wrap.appendChild(label);

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

  const submit = el('button', 'intro-form__submit', t(content.intro.submit, locale));
  submit.type = 'submit';
  form.appendChild(submit);
  form.appendChild(el('p', 'intro-form__note', t(content.intro.note, locale)));

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

export function renderCase(content, id, locale) {
  const c = findCase(content, id);
  if (!c) return renderNotFound(content, locale);

  flags.noteCaseSeen(c.id);

  const statusKey = c.id === 'JH-2025-003' && flags.isMidUpdateFired() ? c.statusAfterMidUpdate : c.status;
  const showRecovery = c.recovery && (statusKey === '已尋獲' || statusKey === '已結案');

  notebook.addFact(
    'case-' + c.id,
    c.name + '（' + c.id + '）　' + c.missing + '　' + statusLabel(content, statusKey, locale),
    '/case/' + c.id
  );

  const root = el('div');
  const table = el('table', 'case-table');
  table.style.borderCollapse = 'collapse';
  const tbody = el('tbody');

  tbody.appendChild(tableRow(labelOf(content, 'caseId', locale), c.id));
  tbody.appendChild(tableRow(labelOf(content, 'name', locale), c.name));
  tbody.appendChild(tableRow(labelOf(content, 'ageAtDisappearance', locale), String(c.age)));
  tbody.appendChild(tableRow(labelOf(content, 'missingDate', locale), c.missing));
  tbody.appendChild(tableRow(labelOf(content, 'lastSeen', locale), t(c.lastSeen, locale)));

  const statusSpan = el('span', 'status status--' + STATUS_CLASS[statusKey], statusLabel(content, statusKey, locale));
  tbody.appendChild(tableRow(labelOf(content, 'status', locale), statusSpan));

  if (c.statusHistory) {
    const historyList = el('ul', null);
    c.statusHistory.forEach((h) => {
      historyList.appendChild(el('li', null, h.date + '　' + statusLabel(content, h.value, locale)));
    });
    tbody.appendChild(tableRow(labelOf(content, 'statusHistory', locale), historyList));
  }

  if (showRecovery) {
    tbody.appendChild(tableRow(labelOf(content, 'recoveryDate', locale), c.recovery.date));
    tbody.appendChild(tableRow(labelOf(content, 'recoveryPlace', locale), t(c.recovery.place, locale)));
    tbody.appendChild(tableRow(labelOf(content, 'condition', locale), t(c.recovery.condition, locale)));
    tbody.appendChild(tableRow(labelOf(content, 'cause', locale), t(c.recovery.cause, locale)));
    tbody.appendChild(tableRow(labelOf(content, 'timeOfDeath', locale), t(c.recovery.timeOfDeath, locale)));
    tbody.appendChild(tableRow(labelOf(content, 'belongings', locale), t(c.recovery.belongings, locale)));
  }

  tbody.appendChild(tableRow(labelOf(content, 'summary', locale), t(c.summary, locale)));

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = labelOf(content, 'viewPdf', locale);
  details.appendChild(summary);
  details.appendChild(el('p', null, '[' + t(c.photoNote, locale) + ']'));
  tbody.appendChild(tableRow(labelOf(content, 'poster', locale), details));

  const fileId = CASE_FILE_MAP[c.id];
  const relatedWrap = el('div');
  if (c.links) {
    c.links.forEach((l) => relatedWrap.appendChild(link(t(l.label, locale), l.route)));
  }
  if (fileId) {
    const a = link(labelOf(content, 'sourceFile', locale) + '　' + fileId + '.txt', '/file/' + fileId);
    relatedWrap.appendChild(a);
  }
  if (c.links || fileId) {
    tbody.appendChild(tableRow(labelOf(content, 'relatedLinks', locale), relatedWrap));
  }

  [c.note, c.removedNote].forEach((noteField) => {
    if (noteField) tbody.appendChild(tableRow(labelOf(content, 'note', locale), t(noteField, locale)));
  });

  table.appendChild(tbody);
  root.appendChild(table);
  return root;
}

function renderChatlog(content, locale) {
  const wrap = el('div', 'chatlog');
  wrap.appendChild(el('h3', null, labelOf(content, 'evidenceChatlog', locale)));
  wrap.appendChild(el('p', 'note-block', labelOf(content, 'recoveredFromLabel', locale) + '：' + t(content.chatlog.recoveredFrom, locale)));

  content.chatlog.messages.forEach((m) => {
    const line = el('p', 'chatlog__message');
    line.appendChild(el('span', 'chatlog__time', m.t + '　'));
    line.appendChild(el('span', 'chatlog__who', m.who + '：'));
    const text = t(m.text, locale);
    if (text) line.appendChild(el('span', 'chatlog__text', text));
    if (m.attachment) line.appendChild(el('span', 'chatlog__attachment', '［' + t(m.attachment, locale) + '］'));
    wrap.appendChild(line);
  });
  wrap.appendChild(el('p', 'note-block', t(content.chatlog.footer, locale)));

  wrap.appendChild(el('h4', null, labelOf(content, 'evidenceSchoolNotice', locale)));
  wrap.appendChild(el('p', null, content.school.announcementReal.posted + '　' + t(content.school.announcementReal.text, locale)));

  return wrap;
}

export function renderFile(content, id, locale) {
  flags.notePageSeen('file-' + id);

  const root = el('div', 'file-view');
  root.appendChild(el('p', null, id + '.txt'));

  if (id === '013') {
    root.appendChild(el('p', null, store.get('howYouKnew') || '—'));
    root.appendChild(el('p', null, labelOf(content, 'filed', locale) + '　' + (store.get('firstVisitDate') || '—')));
  } else if (id === '014') {
    root.appendChild(el('p', null, '—'));
  } else {
    const data = content.files[id];
    if (!data) {
      root.appendChild(el('p', null, '—'));
    } else {
      root.appendChild(el('p', null, labelOf(content, 'name', locale) + '　' + data.name));
      root.appendChild(el('p', null, labelOf(content, 'filed', locale) + '　' + data.created));

      if (id === '007' && data.updated) {
        root.appendChild(el('p', null, labelOf(content, 'lastUpdated', locale) + '　' + data.updated));
      }
      if (id === '012' && flags.isMidUpdateFired() && data.updatedAfterMidUpdate) {
        root.appendChild(el('p', null, labelOf(content, 'lastUpdated', locale) + '　' + data.updatedAfterMidUpdate));
      }
      if (id === '015') {
        root.appendChild(renderChatlog(content, locale));
      }
      if (id === '007') {
        root.appendChild(el('p', null, labelOf(content, 'relatedMarketSnapshot', locale)));
        root.appendChild(link(content.market.seller, '/market/rec_1029'));
      }
    }
  }

  if (flags.isCollectionUnlocked()) {
    root.appendChild(link(labelOf(content, 'upLink', locale), '/collection'));
  }

  return root;
}

export function renderTrust(content, locale) {
  flags.notePageSeen('page-trust');
  notebook.addFact('trust-seen', t(content.notebookFacts.trustSeen, locale), '/trust');

  const root = el('div');
  root.appendChild(el('h1', null, t(content.trust.title, locale)));
  root.appendChild(el('p', null, t(content.trust.note, locale)));

  const solved = !!store.get('trustPuzzleSolved');

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  const headers = [labelOf(content, 'year', locale), labelOf(content, 'date', locale), labelOf(content, 'amount', locale), labelOf(content, 'donorName', locale), labelOf(content, 'zip', locale)];
  if (!solved) headers.push(t(content.trustPuzzle.answerHeader, locale));
  headers.forEach((h) => headRow.appendChild(el('th', 'data-table__cell', h)));
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  const inputs = [];
  content.trust.rows.forEach((r) => {
    const tr = el('tr', 'data-table__row');
    tr.appendChild(el('td', 'data-table__cell', r.year));
    tr.appendChild(el('td', 'data-table__cell', r.date));
    tr.appendChild(el('td', 'data-table__cell', r.amount));
    tr.appendChild(el('td', 'data-table__cell', t(r.name, locale)));
    tr.appendChild(el('td', 'data-table__cell', t(r.zip, locale)));
    if (!solved) {
      const td = el('td', 'data-table__cell');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'trust-puzzle__input';
      const feedback = el('span', 'trust-puzzle__feedback');
      td.appendChild(input);
      td.appendChild(feedback);
      tr.appendChild(td);
      inputs.push({ input, feedback, row: r });
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);

  if (solved) {
    root.appendChild(link(labelOf(content, 'archiveLink', locale), '/archive2019'));
    return root;
  }

  root.appendChild(el('p', null, t(content.trustPuzzle.prompt, locale)));
  const resultMsg = el('p', 'note-block');
  const checkBtn = el('button', 'choice__btn', t(content.trustPuzzle.check, locale));
  checkBtn.type = 'button';
  checkBtn.addEventListener('click', () => {
    let allCorrect = true;
    inputs.forEach(({ input, feedback, row }) => {
      const correct = caseMatchesAnswer(findCase(content, row.matchCaseId), input.value);
      feedback.textContent = correct ? '✓' : '✗';
      if (!correct) allCorrect = false;
    });
    if (allCorrect) {
      store.set('trustPuzzleSolved', true);
      resultMsg.textContent = t(content.trustPuzzle.allCorrect, locale);
      checkBtn.disabled = true;
      inputs.forEach(({ input: i }) => (i.disabled = true));
      root.appendChild(link(labelOf(content, 'archiveLink', locale), '/archive2019'));
    } else {
      resultMsg.textContent = t(content.trustPuzzle.incorrect, locale);
    }
  });
  root.appendChild(checkBtn);
  root.appendChild(resultMsg);

  return root;
}

export function renderArchive2019(content, locale) {
  flags.notePageSeen('page-archive2019');
  notebook.addFact('archive-seen', t(content.notebookFacts.archiveSeen, locale), '/archive2019');
  const root = el('div');
  root.appendChild(el('h1', null, t(content.archive2019.title, locale)));
  root.appendChild(el('p', null, t(content.archive2019.note, locale)));
  root.appendChild(el('p', null, t(content.archive2019.row.name, locale) + '　' + t(content.archive2019.row.district, locale)));
  root.appendChild(link(labelOf(content, 'closeSnapshot', locale), '/'));
  return root;
}

export function renderMarket(content, locale) {
  flags.notePageSeen('page-market');
  notebook.addFact('market-seen', t(content.notebookFacts.marketSeen, locale), '/market/rec_1029');
  const root = el('div');
  root.appendChild(el('h1', null, content.market.seller));
  root.appendChild(el('p', null, t(content.market.note, locale)));

  const table = el('table', 'data-table');
  const thead = el('thead');
  const headRow = el('tr', 'data-table__row');
  [labelOf(content, 'listingTitle', locale), labelOf(content, 'posted', locale), labelOf(content, 'deal', locale), labelOf(content, 'spot', locale)].forEach((h) => {
    headRow.appendChild(el('th', 'data-table__cell', h));
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  content.market.listings.forEach((item) => {
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
      metaTd.textContent = labelOf(content, 'comments', locale) + ' ' + item.comments + '　' + labelOf(content, 'replies', locale) + ' ' + item.replies;
      metaTr.appendChild(metaTd);
      tbody.appendChild(metaTr);
    }
  });
  table.appendChild(tbody);
  root.appendChild(table);

  root.appendChild(el('p', 'note-block', t(content.market.windowNote, locale)));
  root.appendChild(link(labelOf(content, 'closeSnapshot', locale), '/'));
  return root;
}

export function renderLegacy(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.legacy.title, locale)));
  root.appendChild(el('p', null, content.legacy.author));
  root.appendChild(el('p', null, t(content.legacy.note, locale)));
  root.appendChild(el('p', null, t(content.legacy.line, locale)));
  root.appendChild(link(labelOf(content, 'closeSnapshot', locale), '/'));
  return root;
}

export function renderCollection(content, locale) {
  flags.notePageSeen('page-collection');
  const root = el('div', 'collection');

  for (let n = 1; n <= 15; n++) {
    const id = String(n).padStart(3, '0');
    const line = el('p', null);
    const a = link(id + '.txt', '/file/' + id);
    line.appendChild(a);

    if (id === '007') {
      line.appendChild(document.createTextNode('　' + content.files['007'].name + '　' + labelOf(content, 'filed', locale) + ' ' + content.files['007'].created + '　' + labelOf(content, 'lastUpdated', locale) + ' ' + content.files['007'].updated));
    } else if (id === '012') {
      const updated = flags.isMidUpdateFired() ? content.files['012'].updatedAfterMidUpdate : null;
      let text = '　' + content.files['012'].name + '　' + labelOf(content, 'filed', locale) + ' ' + content.files['012'].created;
      if (updated) text += '　' + labelOf(content, 'lastUpdated', locale) + ' ' + updated;
      line.appendChild(document.createTextNode(text));
    } else if (id === '013') {
      line.appendChild(document.createTextNode('　' + (store.get('nickname') || '—')));
    } else if (id === '014') {
      line.appendChild(document.createTextNode('　—'));
    } else if (id === '015') {
      line.appendChild(document.createTextNode('　' + content.files['015'].name + '　' + labelOf(content, 'filed', locale) + ' ' + content.files['015'].created));
    }
    root.appendChild(line);
  }

  if (flags.isWalkUnlocked()) {
    const line = el('p', null);
    line.appendChild(link('016.txt', '/walk'));
    root.appendChild(line);
  }

  return root;
}

export function renderGone(content, locale) {
  const root = el('div', 'gone');
  content.endgame.gone.forEach((line) => root.appendChild(el('p', null, t(line, locale))));
  const donate = el('a', 'site-header__donate', t(content.org.donate, locale));
  donate.href = 'javascript:void(0)';
  root.appendChild(donate);
  return root;
}

export function renderAbout(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.about.title, locale)));

  root.appendChild(el('h2', null, t(content.about.introTitle, locale)));
  root.appendChild(el('p', null, t(content.about.introBody, locale)));

  root.appendChild(el('h2', null, t(content.about.servicesTitle, locale)));
  const list = el('ul', null);
  content.about.services.forEach((s) => list.appendChild(el('li', null, t(s, locale))));
  root.appendChild(list);

  root.appendChild(el('h2', null, t(content.about.hoursTitle, locale)));
  root.appendChild(el('p', null, t(content.about.hoursBody, locale)));

  return root;
}

export function renderFaq(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.faq.title, locale)));
  content.faq.items.forEach((item) => {
    root.appendChild(el('h2', null, t(item.q, locale)));
    root.appendChild(el('p', null, t(item.a, locale)));
  });
  return root;
}

export function renderDonate(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.donate.title, locale)));
  root.appendChild(el('p', null, t(content.donate.intro, locale)));

  root.appendChild(el('h2', null, t(content.donate.bankTitle, locale)));
  const bankList = el('ul', null);
  content.donate.bankLines.forEach((line) => bankList.appendChild(el('li', null, t(line, locale))));
  root.appendChild(bankList);

  root.appendChild(el('h2', null, t(content.donate.receiptTitle, locale)));
  root.appendChild(el('p', null, t(content.donate.receiptBody, locale)));

  root.appendChild(el('h2', null, t(content.donate.disclosureTitle, locale)));
  root.appendChild(el('p', null, t(content.donate.disclosureBody, locale)));
  root.appendChild(link(labelOf(content, 'trustFooterLink', locale), '/trust'));

  return root;
}

export function renderContact(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.contact.title, locale)));

  const table = el('table', 'case-table');
  const tbody = el('tbody');
  tbody.appendChild(tableRow(labelOf(content, 'officeHours', locale), t(content.contact.hoursBody, locale)));
  tbody.appendChild(tableRow(labelOf(content, 'phone', locale), content.contact.phoneValue));
  tbody.appendChild(tableRow(labelOf(content, 'email', locale), content.contact.emailValue));
  table.appendChild(tbody);
  root.appendChild(table);

  root.appendChild(el('p', 'note-block', t(content.contact.noCounter, locale)));
  return root;
}

export function renderPrivacy(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.privacy.title, locale)));
  content.privacy.body.forEach((p) => root.appendChild(el('p', null, t(p, locale))));
  return root;
}

export function renderAccessibility(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, t(content.accessibility.title, locale)));
  content.accessibility.body.forEach((p) => root.appendChild(el('p', null, t(p, locale))));
  return root;
}

function stateDump() {
  const keys = [
    'locale', 'nickname', 'howYouKnew', 'firstVisitDate', 'warningSeen',
    'midUpdateFired', 'collectionUnlocked', 'refusedCount', 'finished'
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

  function button(label, onClick) {
    const btn = el('button', 'admin-panel__button', label);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      onClick();
      location.reload();
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
    store.markSeen('page-archive2019');
    store.markSeen('page-market');
    store.markSeen('page-collection');
    location.hash = '#/walk';
  });

  button('清除「已結束」狀態（重新打開網站）', () => {
    store.set('finished', false);
  });

  return root;
}

export function renderNotFound(content, locale) {
  const root = el('div');
  root.appendChild(el('h1', null, labelOf(content, 'notFound', locale)));
  root.appendChild(link(labelOf(content, 'backHome', locale), '/'));
  return root;
}
