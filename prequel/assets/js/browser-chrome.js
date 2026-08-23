// browser-chrome.js — 把整頁包成「假瀏覽器」外框:網址列會依目前頁面顯示不同假網域
(function () {
  const DOMAIN_MAP = {
    social: "sns.today",
    editor: "雲端",
    market: "market.tw",
    chat: "message-export.local",
    transit: "transit.jinghe.gov.tw",
    news: "jinghedaily.tw",
  };
  const KNOWN_DIRS = ["xunren", "social", "editor", "market", "chat", "transit", "files", "news", "resources", "ending"];

  function computeUrl() {
    // 用「路徑裡有沒有出現已知目錄名」來判斷,不管實際部署在網域根目錄
    // 還是 GitHub Pages 那種帶 repo 名稱的子路徑,判斷結果都一樣正確。
    const parts = location.pathname.split("/").filter(Boolean);
    const topDir = parts.find((seg) => KNOWN_DIRS.includes(seg)) || "";
    const fileName = parts[parts.length - 1] || "index.html";
    const slug = fileName.endsWith(".html") ? fileName.slice(0, -5) : fileName;

    if (topDir === "files") {
      return { text: "file:///C:/Users/rec_1029/收藏/", isLocal: true };
    }
    if (topDir && DOMAIN_MAP[topDir]) {
      return { text: DOMAIN_MAP[topDir] + (slug && slug !== "index" ? "/" + slug : ""), isLocal: false };
    }
    return {
      text: "xun-lin-xi.github.io" + (topDir ? "/" + topDir : "") + (slug && slug !== "index" ? "/" + slug : ""),
      isLocal: false,
    };
  }

  const LANGS = [
    { code: "zh-Hant", label: "繁" },
    { code: "zh-Hans", label: "简" },
    { code: "en", label: "EN" },
  ];

  const SIGNAL_SVG = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>';
  const WIFI_SVG = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.2a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/><path d="M4.2 7.4a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 7.4z"/><path d="M1 4.2a9.6 9.6 0 0114 0L13.6 5.6a7.6 7.6 0 00-11.2 0L1 4.2z"/></svg>';
  const BATTERY_SVG = '<svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';

  function pad2(n) { return String(n).padStart(2, "0"); }

  // 手機狀態列上的時間直接顯示玩家當下裝置的真實時間(只有時:分,不含日期),
  // 純粹營造「你正拿著手機看」的臨場感,不涉及第一章 2025 年的故事時間線,
  // 所以不會像 013.txt 的建檔日期那樣有跟劇情時間矛盾的風險。
  function mountStatusBar() {
    const bar = document.createElement("div");
    bar.className = "jh-status-bar";
    bar.innerHTML = `
      <span class="jh-sb-time" id="jh-sb-time"></span>
      <span class="jh-sb-icons">${SIGNAL_SVG}${WIFI_SVG}${BATTERY_SVG}</span>
    `;
    document.body.insertBefore(bar, document.body.firstChild);

    function tick() {
      const now = new Date();
      bar.querySelector("#jh-sb-time").textContent = now.getHours() + ":" + pad2(now.getMinutes());
    }
    tick();
    setInterval(tick, 15000);
  }

  function mountHomeIndicator() {
    const el = document.createElement("div");
    el.className = "jh-home-indicator";
    el.innerHTML = '<span class="jh-home-indicator__pill"></span>';
    document.body.appendChild(el);
  }

  function mount() {
    const { text, isLocal } = computeUrl();

    mountStatusBar();

    const bar = document.createElement("div");
    bar.className = "jh-browser-chrome";
    bar.innerHTML = `
      <button type="button" class="jh-bc-nav" id="jh-bc-back" aria-label="上一頁">←</button>
      <button type="button" class="jh-bc-nav" id="jh-bc-fwd" aria-label="下一頁">→</button>
      <div class="jh-bc-url">${isLocal ? "" : '<span class="jh-bc-lock">🔒</span>'}<span class="jh-bc-url-text"></span></div>
      <button type="button" class="jh-bc-nav" id="jh-bc-refresh" aria-label="重新整理">⟳</button>
      <div class="jh-bc-lang" id="jh-bc-lang">
        <button type="button" class="jh-bc-lang-toggle" id="jh-bc-lang-toggle" aria-label="切換語言">🌐</button>
        <div class="jh-bc-lang-menu" id="jh-bc-lang-menu">
          ${LANGS.map((l) => `<button type="button" class="jh-bc-lang-opt" data-lang="${l.code}">${l.label}</button>`).join("")}
        </div>
      </div>
    `;
    document.body.insertBefore(bar, document.body.firstChild.nextSibling);
    bar.querySelector(".jh-bc-url-text").textContent = text;
    document.body.classList.add("jh-has-chrome", "jh-has-shell");

    mountHomeIndicator();

    document.getElementById("jh-bc-back").addEventListener("click", () => history.back());
    document.getElementById("jh-bc-fwd").addEventListener("click", () => history.forward());
    document.getElementById("jh-bc-refresh").addEventListener("click", () => location.reload());

    mountLangSwitcher(bar);
  }

  function mountLangSwitcher(bar) {
    const toggle = bar.querySelector("#jh-bc-lang-toggle");
    const menu = bar.querySelector("#jh-bc-lang-menu");

    function refreshActive() {
      const current = typeof JH_I18N !== "undefined" ? JH_I18N.getLang() : "zh-Hant";
      menu.querySelectorAll(".jh-bc-lang-opt").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === current);
      });
    }
    refreshActive();

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", () => menu.classList.remove("open"));
    menu.querySelectorAll(".jh-bc-lang-opt").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (typeof JH_I18N !== "undefined") JH_I18N.setLang(btn.dataset.lang);
        refreshActive();
        menu.classList.remove("open");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
