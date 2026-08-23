import { store } from './store.js';
import { t } from './i18n.js';
import * as flags from './flags.js';
import { CONTENT_WARNING } from './labels.js';
import * as chrome from './chrome.js';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function showWarning(onDone) {
  const el = document.getElementById('content-warning');
  el.querySelector('.content-warning__title').textContent = t(CONTENT_WARNING.title, store.get('locale'));
  el.querySelector('.content-warning__body').textContent = t(CONTENT_WARNING.body, store.get('locale'));
  const btn = el.querySelector('.content-warning__continue');
  btn.textContent = t(CONTENT_WARNING.continue, store.get('locale'));
  el.hidden = false;
  chrome.onLocaleChange(() => {
    if (!el.hidden) {
      el.querySelector('.content-warning__title').textContent = t(CONTENT_WARNING.title, store.get('locale'));
      el.querySelector('.content-warning__body').textContent = t(CONTENT_WARNING.body, store.get('locale'));
      btn.textContent = t(CONTENT_WARNING.continue, store.get('locale'));
    }
  });
  btn.addEventListener(
    'click',
    () => {
      store.set('warningSeen', true);
      el.hidden = true;
      onDone();
    },
    { once: true }
  );
}

/**
 * opts:
 *   isIntro            - this page is intro.html (redirects home if nickname already set)
 *   isGone             - this page is gone.html (exempt from the finished-lock redirect)
 *   bypassChecks       - this page is admin.html (skip nickname/finished/walk-unlock checks entirely)
 *   requireWalkUnlocked- this page is walk.html
 */
export function enter(opts, onReady) {
  if (!store.get('firstVisitDate')) store.set('firstVisitDate', todayString());
  chrome.mountLangSwitchers();

  function afterWarning() {
    if (opts.bypassChecks) {
      onReady();
      return;
    }
    if (flags.isFinished() && !opts.isGone) {
      location.href = 'gone.html';
      return;
    }
    if (opts.isIntro) {
      if (store.get('nickname')) {
        location.href = 'home.html';
        return;
      }
      onReady();
      return;
    }
    if (!store.get('nickname')) {
      location.href = 'intro.html';
      return;
    }
    if (opts.requireWalkUnlocked && !flags.isWalkUnlocked()) {
      location.href = 'home.html';
      return;
    }
    onReady();
  }

  if (!store.get('warningSeen')) {
    showWarning(afterWarning);
  } else {
    afterWarning();
  }
}
