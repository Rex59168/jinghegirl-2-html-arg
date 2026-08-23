// mail.js — 純資料層:寫信(deliverLetter)由各頁面直接呼叫,實際的訊息 App
// UI(圖示角標、通知橫幅、面板)現在都在殼層(scripts/shell.js)那邊,這裡只負責
// 把新信寫進 store,並透過 window.top 轉交給殼層(同源,可以直接跨框呼叫)。
import { store } from './store.js';
import { t } from './i18n.js';

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
  try {
    if (window.top && typeof window.top.jhReceiveLetter === 'function') {
      window.top.jhReceiveLetter(stored);
    }
  } catch (e) {}
}
