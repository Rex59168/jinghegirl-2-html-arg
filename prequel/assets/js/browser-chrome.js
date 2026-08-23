// browser-chrome.js — 把整頁包成「假瀏覽器」外框:網址列會依目前頁面顯示不同假網域
// 這支腳本在 iframe 裡面的每一頁都會執行,只負責假網址列本身,不再重複掛手機狀態列/
// Android三鍵——那兩個現在由外層殼層(shell.js,prequel/index.html)統一掛一次。
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
    const fileName = parts[parts.length - 1] || "home.html";
    const slug = fileName.endsWith(".html") ? fileName.slice(0, -5) : fileName;

    if (topDir === "files") {
      return { text: "file:///C:/Users/rec_1029/收藏/", isLocal: true };
    }
    if (topDir && DOMAIN_MAP[topDir]) {
      return { text: DOMAIN_MAP[topDir] + (slug && slug !== "home" ? "/" + slug : ""), isLocal: false };
    }
    return {
      text: "xun-lin-xi.github.io" + (topDir ? "/" + topDir : "") + (slug && slug !== "home" ? "/" + slug : ""),
      isLocal: false,
    };
  }

  const LANGS = [
    { code: "zh-Hant", label: "繁" },
    { code: "zh-Hans", label: "简" },
    { code: "en", label: "EN" },
  ];

  // 跟殼層共用同一把「進全螢幕」旗標——玩家在殼層的開機/主畫面點瀏覽器圖示是真正的
  // 使用者手勢,由殼層(shell.js)直接處理。這支腳本只在旗標已經打開、而且自己還沒在
  // 全螢幕狀態時,趁玩家在 iframe 裡的下一次點擊,請殼層(window.top)重新嘗試一次——
  // 例如玩家自己按 Esc 跳出全螢幕之後,不用整個殼層重載,下一次點擊就會自動接回來。
  const FULLSCREEN_KEY = "jh2bridge:fullscreen_opt_in";
  function armFullscreenOnFirstClick() {
    if (window.top === window) return; // 不在殼層 iframe 裡(例如直接開這一頁測試),沒有殼層可以請求
    // 旗標的檢查要放在點擊當下,不能在掛載時就檢查一次定生死——像 home.html 這種
    // 一開始就跟著殼層一起載入的頁面,掛載當下玩家可能都還沒點過「瀏覽器」圖示,
    // 旗標根本還沒被設成 "1",若只在掛載時檢查一次就會直接跳過、永遠不會補掛這個
    // 監聽器。也不用 { once: true }——玩家可能在同一頁按好幾次 Esc 跳出全螢幕,
    // 每次點擊都該重試一次。
    document.addEventListener("click", () => {
      try {
        if (localStorage.getItem(FULLSCREEN_KEY) !== "1") return;
        if (window.top.document.fullscreenElement) return; // 已經在全螢幕,不用重試
        if (typeof window.top.requestFullscreenNow === "function") window.top.requestFullscreenNow();
      } catch (e) {}
    });
  }

  function mount() {
    const { text, isLocal } = computeUrl();

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
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector(".jh-bc-url-text").textContent = text;
    document.body.classList.add("jh-has-chrome");

    document.getElementById("jh-bc-back").addEventListener("click", () => history.back());
    document.getElementById("jh-bc-fwd").addEventListener("click", () => history.forward());
    document.getElementById("jh-bc-refresh").addEventListener("click", () => location.reload());

    mountLangSwitcher(bar);
    armFullscreenOnFirstClick();
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
