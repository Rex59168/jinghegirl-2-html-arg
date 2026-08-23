// state.js — localStorage 存取層,key 前綴 jh1f_(續作偽裝門面專用,獨立於前作正式站與續作本體)
const JH = (() => {
  const PREFIX = "jh1f_";

  function get(key, fallback = null) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      /* localStorage 不可用時靜默失敗,不影響劇情閱讀 */
    }
  }

  function has(key) {
    return localStorage.getItem(PREFIX + key) !== null;
  }

  async function sha256(text) {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(text)
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  // 標準化輸入：去除頭尾空白、統一全形冒號/井號
  function normalize(text) {
    return String(text || "")
      .trim()
      .replace(/[：]/g, ":")
      .replace(/[＃]/g, "#");
  }

  async function checkAnswer(text, expectedHash) {
    const hash = await sha256(normalize(text));
    return hash === expectedHash;
  }

  // 累計「實際在畫面前」的時間,不計算分頁隱藏或跨日暫停的空檔
  const ACTIVE_KEY = "active_ms";
  let lastTick = Date.now();

  function flushActive() {
    if (document.visibilityState !== "visible") {
      lastTick = Date.now();
      return;
    }
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    if (delta > 0 && delta < 120000) {
      // 單次累加上限 2 分鐘,避免電腦睡眠等異常情況灌入離譜的數字
      const prev = get(ACTIVE_KEY, 0);
      set(ACTIVE_KEY, prev + delta);
    }
  }

  setInterval(flushActive, 5000);
  document.addEventListener("visibilitychange", flushActive);
  window.addEventListener("pagehide", flushActive);

  function activeMs() {
    flushActive();
    return get(ACTIVE_KEY, 0);
  }

  function activeMinutes() {
    return Math.round(activeMs() / 60000);
  }

  return { get, set, has, sha256, normalize, checkAnswer, activeMs, activeMinutes, PREFIX };
})();
