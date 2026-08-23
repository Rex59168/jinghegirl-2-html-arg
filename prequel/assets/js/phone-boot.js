// phone-boot.js — 進站當下的手機鎖定畫面→主畫面,只在第一次到訪 prequel/index.html 時出現一次。
// 點一下鎖定畫面解鎖,再點主畫面上的瀏覽器圖示才會真正進站(顯示原本的內容提醒彈窗)。
//
// 畫面上顯示的日期是固定寫死的 2025/08/16(六)——網站架好的隔天,故事剛開始的時間點,
// 不是抓玩家裝置當下的日期,避免像其他地方一樣跟劇情時間線對不上。
(() => {
  if (JH.get("phone_boot_seen")) return;

  const SIGNAL_SVG = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>';
  const WIFI_SVG = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.2a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/><path d="M4.2 7.4a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 7.4z"/><path d="M1 4.2a9.6 9.6 0 0114 0L13.6 5.6a7.6 7.6 0 00-11.2 0L1 4.2z"/></svg>';
  const BATTERY_SVG = '<svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';

  const BOOT_DATE_LABEL = "2025年8月16日 星期六";

  function pad2(n) { return String(n).padStart(2, "0"); }
  function clockNow() {
    const now = new Date();
    return now.getHours() + ":" + pad2(now.getMinutes());
  }

  function mount() {
    const root = document.createElement("div");
    root.className = "jh-boot";
    root.innerHTML = `
      <div class="jh-boot__statusbar">
        <span class="jh-sb-time"></span>
        <span class="jh-sb-icons">${SIGNAL_SVG}${WIFI_SVG}${BATTERY_SVG}</span>
      </div>

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
        <div class="jh-boot__home-indicator"><span></span></div>
      </div>
    `;
    document.body.appendChild(root);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => root.classList.add("jh-boot--visible"));

    function tick() {
      const t = clockNow();
      const sb = root.querySelector(".jh-sb-time");
      const lockTime = document.getElementById("jh-boot-lock-time");
      const homeTime = document.getElementById("jh-boot-home-time");
      if (sb) sb.textContent = t;
      if (lockTime) lockTime.textContent = t;
      if (homeTime) homeTime.textContent = t;
    }
    tick();
    const timer = setInterval(tick, 15000);

    const lock = document.getElementById("jh-boot-lock");
    const home = document.getElementById("jh-boot-home");

    lock.addEventListener(
      "click",
      () => {
        lock.classList.add("jh-boot__lock--hidden");
        home.classList.add("jh-boot__home--visible");
      },
      { once: true }
    );

    root.querySelectorAll('.jh-boot__app[data-inert="1"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.remove("jh-boot__app--shake");
        void btn.offsetWidth; // 重觸發動畫
        btn.classList.add("jh-boot__app--shake");
      });
    });

    document.getElementById("jh-boot-browser").addEventListener(
      "click",
      () => {
        clearInterval(timer);
        JH.set("phone_boot_seen", true);
        root.classList.remove("jh-boot--visible");
        document.body.style.overflow = "";
        setTimeout(() => root.remove(), 650);
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
