// i18n.js — 語言切換引擎
// 繁體中文(預設,站內原文) / 簡體中文(機械轉字,見 t2s-map.js) / English(對照字典,見 i18n-en.js)
//
// 做法:遍歷文字節點與少數屬性(placeholder / aria-label / title / alt),
// 第一次遇到某節點時把「原文(繁體)」存進 WeakMap,之後每次切換語言都從這份原文重新轉換,
// 不會有「簡體轉英文再轉不回繁體」的疊加誤差。
// 用 MutationObserver 監看整頁,任何頁面之後才動態插入/改寫的文字(fetch 回來的資料、
// 玩家互動後才顯示的段落)也會自動套用目前語言,不需要每個頁面自己呼叫翻譯函式。
const JH_I18N = (() => {
  const DEFAULT_LANG = "zh-Hant";
  const I18N_ATTRS = ["placeholder", "aria-label", "title", "alt"];
  const originalText = new WeakMap();
  const originalAttr = new WeakMap();
  let observer = null;
  // document.title 不在 document.body 裡,上面的文字節點遍歷完全碰不到,
  // 之前只有 ambient.js 那個嚇人效果自己手動處理過,平常切語言時分頁標題
  // 一直維持繁體原文沒有跟著換——這裡補上跟內文一樣「存原文、每次切換
  // 都從原文重新轉換」的機制,原文只存一次(第一次 init 的當下)。
  let originalTitle = null;

  function getLang() {
    return JH.get("lang") || DEFAULT_LANG;
  }

  function t2s(text) {
    const map = typeof JH_T2S_MAP !== "undefined" ? JH_T2S_MAP : null;
    if (!map) return text;
    let out = "";
    for (const ch of text) out += map[ch] || ch;
    return out;
  }

  function normalizeWs(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  // 大多數 HTML 原始碼裡的文字節點,前後縮排/換行只是排版方便,瀏覽器渲染時本來就會
  // 摺疊成一行(white-space: normal),所以字典用「摺疊空白後」的版本當 key 最穩定。
  // 少數用 JS 字串常量賦值、且容器有 pre/pre-wrap 樣式的內容(例如結局逐字稿、
  // ASCII 版本樹)刻意保留原始換行,所以查字典時先試「完全原文」,查不到才退回摺疊版本。
  // 還有一批文字是「固定文字 + 動態內容(日期/數字)拼在同一個文字節點裡」組成的
  // (例如「9 則・賣家回覆 5 則」「☑ 約定時間有沒有問題」),字典沒辦法窮舉每種組合,
  // 所以最後再退回一組 regex pattern,分離出動態片段、遞迴翻譯固定片段。
  function lookupEn(text) {
    const dict = typeof JH_I18N_EN !== "undefined" ? JH_I18N_EN : null;
    if (dict && Object.prototype.hasOwnProperty.call(dict, text)) return dict[text];
    const norm = normalizeWs(text);
    if (dict && Object.prototype.hasOwnProperty.call(dict, norm)) return dict[norm];
    const patterns = typeof JH_I18N_EN_PATTERNS !== "undefined" ? JH_I18N_EN_PATTERNS : null;
    if (patterns) {
      for (const p of patterns) {
        const m = norm.match(p.re);
        if (m) {
          const out = p.build(m, lookupEn);
          if (out !== null && out !== undefined) return out;
        }
      }
    }
    return text;
  }

  function translate(text, lang) {
    if (lang === "zh-Hans") return t2s(text);
    if (lang === "en") return lookupEn(text);
    return text;
  }

  function shouldSkipParent(el) {
    if (!el) return true;
    const tag = el.tagName;
    return tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT";
  }

  function walkTextNodes(root, cb) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      if (shouldSkipParent(node.parentElement)) continue;
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      cb(node);
    }
  }

  function applyTextNode(node) {
    if (shouldSkipParent(node.parentElement)) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    node.nodeValue = translate(originalText.get(node), getLang());
  }

  function applyAttrs(root) {
    I18N_ATTRS.forEach((attr) => {
      const els = root.hasAttribute && root.hasAttribute(attr) ? [root] : [];
      root.querySelectorAll(`[${attr}]`).forEach((el) => els.push(el));
      els.forEach((el) => {
        if (!originalAttr.has(el)) originalAttr.set(el, {});
        const store = originalAttr.get(el);
        if (!(attr in store)) store[attr] = el.getAttribute(attr);
        el.setAttribute(attr, translate(store[attr], getLang()));
      });
    });
  }

  function apply(root) {
    root = root || document.body;
    if (root.nodeType === 3) {
      applyTextNode(root);
      return;
    }
    walkTextNodes(root, applyTextNode);
    applyAttrs(root);
  }

  function applyTitle(lang) {
    if (originalTitle === null) originalTitle = document.title;
    document.title = translate(originalTitle, lang);
  }

  function setLang(lang) {
    JH.set("lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : lang;
    apply(document.body);
    applyTitle(lang);
    document.dispatchEvent(new CustomEvent("jh-lang-changed", { detail: { lang } }));
  }

  function observe() {
    observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 || n.nodeType === 3) apply(n);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    document.documentElement.lang = getLang() === "en" ? "en" : getLang();
    apply(document.body);
    applyTitle(getLang());
    observe();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return { getLang, setLang, apply };
})();
