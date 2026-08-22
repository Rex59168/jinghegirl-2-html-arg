import { store } from './store.js';

const OLD_CASES = ['JH-2018-001', 'JH-2022-002', 'JH-2025-003'];
const TARGET_CASE = 'JH-2026-004';
const TXT_FILES = ['file-007', 'file-012', 'file-015'];
const WALK_PAGES = ['page-trust', 'page-archive2019', 'page-market'];

// The mid-story announcement (Lin Xi's body recovered) shouldn't fire the instant
// a player has clicked past enough pages in one sitting — it's supposed to feel like
// news that happened while they were away. Tune this to taste; admin.html's "force"
// button bypasses it entirely for testing.
const MID_UPDATE_MIN_DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

export function noteCaseSeen(id) {
  store.markSeen(id);
  checkMidUpdate();
  checkSecondUpdate();
}

export function notePageSeen(key) {
  store.markSeen(key);
  checkCollectionUnlocked();
  checkSecondUpdate();
}

export function checkMidUpdate() {
  if (store.get('midUpdateFired')) return true;
  const seenOldCount = OLD_CASES.filter((id) => store.hasSeen(id)).length;
  const introAt = store.get('introCompletedAt') || 0;
  const enoughTimePassed = introAt > 0 && Date.now() - introAt >= MID_UPDATE_MIN_DELAY_MS;
  if (store.hasSeen(TARGET_CASE) && seenOldCount >= 2 && enoughTimePassed) {
    store.set('midUpdateFired', true);
    return true;
  }
  return false;
}

export function isMidUpdateFired() {
  return !!store.get('midUpdateFired');
}

// Second, smaller correction to JH-2026-004's summary once the player has both seen
// the mid-update and traced the .txt discovery chain back through legacy.html to 015.txt.
export function checkSecondUpdate() {
  if (store.get('secondUpdateFired')) return true;
  if (isMidUpdateFired() && store.hasSeen('page-legacy') && store.hasSeen('file-015')) {
    store.set('secondUpdateFired', true);
    return true;
  }
  return false;
}

export function isSecondUpdateFired() {
  return !!store.get('secondUpdateFired');
}

export function checkCollectionUnlocked() {
  if (store.get('collectionUnlocked')) return true;
  if (TXT_FILES.every((key) => store.hasSeen(key))) {
    store.set('collectionUnlocked', true);
    return true;
  }
  return false;
}

export function isCollectionUnlocked() {
  return !!store.get('collectionUnlocked');
}

export function isWalkUnlocked() {
  return (
    isCollectionUnlocked() &&
    store.hasSeen('page-collection') &&
    WALK_PAGES.every((key) => store.hasSeen(key)) &&
    !!store.get('trustPuzzleSolved')
  );
}

export function isFinished() {
  return !!store.get('finished');
}

export function markFinished() {
  store.set('finished', true);
}
