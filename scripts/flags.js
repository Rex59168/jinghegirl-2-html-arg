import { store } from './store.js';

const OLD_CASES = ['JH-2018-001', 'JH-2022-002', 'JH-2025-003'];
const TARGET_CASE = 'JH-2026-004';
const TXT_FILES = ['file-007', 'file-012', 'file-015'];
const WALK_PAGES = ['page-trust', 'page-archive2019', 'page-market'];

export function noteCaseSeen(id) {
  store.markSeen(id);
  checkMidUpdate();
}

export function notePageSeen(key) {
  store.markSeen(key);
  checkCollectionUnlocked();
}

export function checkMidUpdate() {
  if (store.get('midUpdateFired')) return true;
  const seenOldCount = OLD_CASES.filter((id) => store.hasSeen(id)).length;
  if (store.hasSeen(TARGET_CASE) && seenOldCount >= 2) {
    store.set('midUpdateFired', true);
    return true;
  }
  return false;
}

export function isMidUpdateFired() {
  return !!store.get('midUpdateFired');
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
    WALK_PAGES.every((key) => store.hasSeen(key))
  );
}

export function isFinished() {
  return !!store.get('finished');
}

export function markFinished() {
  store.set('finished', true);
}
