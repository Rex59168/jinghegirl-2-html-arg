// shell.js — 殼層本體(只在 prequel/index.html 執行,是整個第一章唯一真正會被瀏覽器
// 導航的頁面)。負責:手機狀態列、Android 三鍵導覽列、鎖定畫面→主畫面開機動畫、
// 管理內層 iframe(實際內容都在裡面跑,換頁只發生在 iframe 內部,殼層本身永遠不重新
// 導航,全螢幕狀態才不會被瀏覽器自動取消)。
//
// 畫面上顯示的日期固定寫死 2025/08/16(六)——網站架好隔天,故事剛開始的時間點,
// 不是抓玩家裝置當下的日期,避免跟其他地方一樣踩到時間線矛盾。
(() => {
  const SIGNAL_SVG = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>';
  const WIFI_SVG = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.2a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/><path d="M4.2 7.4a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 7.4z"/><path d="M1 4.2a9.6 9.6 0 0114 0L13.6 5.6a7.6 7.6 0 00-11.2 0L1 4.2z"/></svg>';
  const BATTERY_SVG = '<svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';
  const BACK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13 3 5 10l8 7z"/></svg>';
  const HOME_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7"/></svg>';
  const RECENTS_SVG = '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="15" height="15" rx="2.5"/></svg>';

  const BOOT_DATE_LABEL = "2025年8月16日 星期六";
  const FULLSCREEN_KEY = "jh2bridge:fullscreen_opt_in";
  const BOOT_SEEN_KEY = "jh2bridge:ch1_boot_seen";

  function pad2(n) { return String(n).padStart(2, "0"); }
  function clockNow() {
    const now = new Date();
    return now.getHours() + ":" + pad2(now.getMinutes());
  }

  // requestFullscreenNow 掛在 window 上,給 iframe 裡的每一頁(同源,可以直接跨框呼叫)
  // 在玩家點擊時請殼層重新嘗試全螢幕用。
  window.requestFullscreenNow = function requestFullscreenNow() {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!req) return;
    try {
      const p = req.call(el);
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  };

  function mount() {
    const frame = document.getElementById("jh-app-frame");

    // ── 手機狀態列 ──
    const statusBar = document.createElement("div");
    statusBar.className = "jh-status-bar";
    statusBar.innerHTML = `
      <span class="jh-sb-time" id="jh-sb-time"></span>
      <span class="jh-sb-icons">${SIGNAL_SVG}${WIFI_SVG}${BATTERY_SVG}</span>
    `;
    document.body.appendChild(statusBar);

    // ── Android 三鍵導覽列 ──
    const navBar = document.createElement("div");
    navBar.className = "jh-home-indicator";
    navBar.innerHTML = `
      <button type="button" class="jh-nav-btn" id="jh-nav-back" aria-label="返回">${BACK_SVG}</button>
      <button type="button" class="jh-nav-btn" id="jh-nav-home" aria-label="主畫面">${HOME_SVG}</button>
      <button type="button" class="jh-nav-btn" id="jh-nav-recents" aria-label="多工">${RECENTS_SVG}</button>
    `;
    document.body.appendChild(navBar);

    const toast = document.createElement("div");
    toast.className = "jh-nav-toast";
    toast.textContent = "沒有其他使用中的頁面";
    document.body.appendChild(toast);
    let toastTimer = null;

    document.getElementById("jh-nav-back").addEventListener("click", () => {
      try { frame.contentWindow.history.back(); } catch (e) {}
    });
    document.getElementById("jh-nav-recents").addEventListener("click", () => {
      toast.classList.add("jh-nav-toast--visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("jh-nav-toast--visible"), 1400);
    });

    // ── 鎖定畫面 / 主畫面覆蓋層(第一次是開機動畫,之後按 Home 鍵可以隨時再叫出來)──
    const boot = document.createElement("div");
    boot.className = "jh-boot";
    boot.innerHTML = `
      <div class="jh-boot__lock" id="jh-boot-lock">
        <div class="jh-boot__time" id="jh-boot-lock-time"></div>
        <div class="jh-boot__date">${BOOT_DATE_LABEL}</div>
        <div class="jh-boot__hint">輕觸螢幕解鎖</div>
      </div>
      <div class="jh-boot__home" id="jh-boot-home">
        <div class="jh-boot__widget">
          <div class="jh-boot__widget-time" id="jh-boot-home-time"></div>
          <div class="jh-boot__widget-date">${BOOT_DATE_LABEL}</div>
        </div>
        <div class="jh-boot__grid">
          <button type="button" class="jh-boot__app jh-boot__app--photos" data-inert="1">
            <span class="jh-boot__app-icon">🖼️</span>
            <span class="jh-boot__app-label">相簿</span>
          </button>
          <button type="button" class="jh-boot__app jh-boot__app--messages" data-inert="1">
            <span class="jh-boot__app-icon">💬</span>
            <span class="jh-boot__app-label">訊息</span>
          </button>
          <button type="button" class="jh-boot__app jh-boot__app--notes" data-inert="1">
            <span class="jh-boot__app-icon">📝</span>
            <span class="jh-boot__app-label">備忘錄</span>
          </button>
          <button type="button" class="jh-boot__app jh-boot__app--browser" id="jh-boot-browser">
            <span class="jh-boot__app-icon">🧭</span>
            <span class="jh-boot__app-label">瀏覽器</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(boot);

    function tick() {
      const t = clockNow();
      document.querySelectorAll("#jh-sb-time, #jh-boot-lock-time, #jh-boot-home-time").forEach((el) => {
        el.textContent = t;
      });
    }
    tick();
    setInterval(tick, 15000);

    const lock = document.getElementById("jh-boot-lock");
    const home = document.getElementById("jh-boot-home");

    boot.querySelectorAll('.jh-boot__app[data-inert="1"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.remove("jh-boot__app--shake");
        void btn.offsetWidth; // 重觸發動畫
        btn.classList.add("jh-boot__app--shake");
      });
    });

    function showHomeScreen() {
      lock.classList.add("jh-boot__lock--hidden");
      home.classList.add("jh-boot__home--visible");
      boot.classList.add("jh-boot--visible");
    }

    function enterApp() {
      localStorage.setItem(FULLSCREEN_KEY, "1");
      window.requestFullscreenNow();
      boot.classList.remove("jh-boot--visible");
      // 主畫面自己也有 pointer-events:auto 的覆蓋規則(讓 App 圖示點得到),
      // 光靠外層 .jh-boot--visible 淡出還不夠,要一併拿掉,不然透明的主畫面
      // 還是會擋住底下 iframe 的點擊。
      home.classList.remove("jh-boot__home--visible");
    }

    document.getElementById("jh-boot-browser").addEventListener("click", enterApp);
    document.getElementById("jh-nav-home").addEventListener("click", showHomeScreen);

    if (localStorage.getItem(BOOT_SEEN_KEY) === "1") {
      // 不是第一次來:直接進站,略過鎖定畫面開機動畫。整層覆蓋維持隱藏、不擋點擊,
      // 之後玩家按 Home 鍵時 showHomeScreen() 會直接跳主畫面(不會再看到鎖定畫面)。
      lock.classList.add("jh-boot__lock--hidden");
    } else {
      requestAnimationFrame(() => boot.classList.add("jh-boot--visible"));
      lock.addEventListener(
        "click",
        () => {
          localStorage.setItem(BOOT_SEEN_KEY, "1");
          showHomeScreen();
        },
        { once: true }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
