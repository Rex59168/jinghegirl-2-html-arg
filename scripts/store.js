const PREFIX = 'jh4:';

const DEFAULTS = {
  locale: 'zh-Hant',
  nickname: '',
  howYouKnew: '',
  firstVisitDate: '',
  warningSeen: false,
  seen: {},
  introCompletedAt: 0,
  midUpdateFired: false,
  secondUpdateFired: false,
  collectionUnlocked: false,
  refusedCount: 0,
  finished: false,
  notebook: [],
  letters: [],
  trustPuzzleSolved: false
};

function detectLocalStorage() {
  try {
    const key = PREFIX + '__probe__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

const persistent = detectLocalStorage();
const memory = {};

function rawGet(key) {
  if (!persistent) return memory[key];
  const raw = window.localStorage.getItem(PREFIX + key);
  return raw === null ? undefined : JSON.parse(raw);
}

function rawSet(key, value) {
  if (!persistent) {
    memory[key] = value;
    return;
  }
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

const state = {};
for (const key of Object.keys(DEFAULTS)) {
  const stored = rawGet(key);
  state[key] = stored === undefined ? DEFAULTS[key] : stored;
}

export const store = {
  get(key) {
    return state[key];
  },
  set(key, value) {
    state[key] = value;
    rawSet(key, value);
  },
  markSeen(id) {
    if (state.seen[id]) return;
    state.seen = { ...state.seen, [id]: true };
    rawSet('seen', state.seen);
  },
  hasSeen(id) {
    return !!state.seen[id];
  },
  isPersistent() {
    return persistent;
  }
};
