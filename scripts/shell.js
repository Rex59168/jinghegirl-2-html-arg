// shell.js — 續作殼層本體(只在根目錄 index.html 執行,是第二章唯一真正會被瀏覽器
// 導航的頁面)。負責:手機狀態列、Android 三鍵導覽列、桌布主畫面(按 Home 鍵叫出來)、
// 訊息 App(案件通知信,跟前作周妤的訊息 App 同一套視覺跟位置)、管理內層 iframe
// (實際內容都在裡面跑,換頁只發生在 iframe 內部,殼層本身永遠不重新導航,全螢幕
// 狀態才不會被瀏覽器自動取消)。跟前作共用同一把橋接旗標的命名方式。
//
// 主畫面掛的時間點是 2026/08/17(靖河下游尋獲遺體公告當天)——固定寫死,不抓玩家
// 裝置的即時日期,理由跟前作 013.txt 那次修掉的矛盾一樣:這裡如果抓即時日期,
// 案件時間軸(2026/8/26 之後)就可能被戳破。
import { t } from './i18n.js';
import { MAIL_UI } from './labels.js';

(() => {
  const SIGNAL_SVG = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="0.5"/><rect x="5" y="5" width="3" height="7" rx="0.5"/><rect x="10" y="3" width="3" height="9" rx="0.5"/><rect x="15" y="0" width="3" height="12" rx="0.5"/></svg>';
  const WIFI_SVG = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 10.2a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/><path d="M4.2 7.4a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 7.4z"/><path d="M1 4.2a9.6 9.6 0 0114 0L13.6 5.6a7.6 7.6 0 00-11.2 0L1 4.2z"/></svg>';
  const BATTERY_SVG = '<svg width="24" height="12" viewBox="0 0 24 12" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>';
  const BACK_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M13 3 5 10l8 7z"/></svg>';
  const HOME_SVG = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7"/></svg>';
  const RECENTS_SVG = '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="1" width="15" height="15" rx="2.5"/></svg>';

  const HOME_DATE_LABEL = "2026年8月17日 星期一";
  const FULLSCREEN_KEY = "jh2bridge:fullscreen_opt_in";

  // 跟 scripts/store.js 用同一個前綴直接讀寫 localStorage——殼層是頂層文件,跟
  // iframe 裡的每一頁同源共用同一份 localStorage,不需要透過 store.js 的模組
  // 實例(每個文件各自快取一份記憶體狀態,不會自動同步)也能拿到最新資料。
  const JH_PREFIX = "jh4:";
  function jhGet(key, fallback) {
    try {
      const v = localStorage.getItem(JH_PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function jhSet(key, value) {
    try { localStorage.setItem(JH_PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }
  function currentLocale() { return jhGet("locale", "zh-Hant"); }
  function letters() { return jhGet("letters", []); }
  function unreadCount() { return letters().filter((l) => !l.read).length; }

  function pad2(n) { return String(n).padStart(2, "0"); }
  function clockNow() {
    const now = new Date();
    return now.getHours() + ":" + pad2(now.getMinutes());
  }

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

    const statusBar = document.createElement("div");
    statusBar.className = "jh-status-bar";
    statusBar.innerHTML = `
      <span class="jh-sb-time" id="jh-sb-time"></span>
      <span class="jh-sb-icons">${SIGNAL_SVG}${WIFI_SVG}${BATTERY_SVG}</span>
    `;
    document.body.appendChild(statusBar);

    const navBar = document.createElement("div");
    navBar.className = "jh-home-indicator";
    navBar.innerHTML = `
      <button type="button" class="jh-nav-btn" id="jh-nav-back" aria-label="返回">${BACK_SVG}</button>
      <button type="button" class="jh-nav-btn" id="jh-nav-home" aria-label="主畫面">${HOME_SVG}</button>
      <button type="button" class="jh-nav-btn" id="jh-nav-recents" aria-label="多工">${RECENTS_SVG}</button>
    `;
    document.body.appendChild(navBar);

    document.getElementById("jh-nav-back").addEventListener("click", () => {
      // 跟一般 Android 一樣,返回鍵要先收起蓋在最上層的東西,不會直接穿透去換頁
      // ——不然玩家會看到多工畫面、信件面板卡住不動,分不清楚返回鍵到底有沒有
      // 反應。依疊放順序(z-index)由上往下一層一層收。
      if (recents.classList.contains("jh-recents--open")) {
        closeRecents();
        return;
      }
      if (mailEl.classList.contains("jh-mail--open")) {
        closeMail();
        return;
      }
      // 交給 iframe 自己那頁的站內導覽紀錄處理(scripts/chrome.js 掛的
      // window.jhGoBackInSite),不要用瀏覽器原生 history.back()——玩家還沒在
      // 站內換過頁的話,原生上一頁其實是離開整個網站,不是我們要的效果。
      try {
        if (typeof frame.contentWindow.jhGoBackInSite === "function") frame.contentWindow.jhGoBackInSite();
      } catch (e) {}
    });
    document.getElementById("jh-nav-recents").addEventListener("click", openRecents);

    // ── 多工切換畫面:點方塊鍵不再只是「沒有其他使用中的頁面」的提示 toast,
    // 改成跟一般 Android 一樣列出可以切換的幾個畫面卡片,點哪張就直接切過去。
    // 「備忘錄」在這一章是掛在目前這頁 iframe 內容裡的浮動按鈕(scripts/notebook.js),
    // 不像訊息/瀏覽器是殼層自己管的,所以要跨 frame 呼叫它掛的 window.jhOpenNotebook。──
    const recents = document.createElement("div");
    recents.className = "jh-recents";
    recents.id = "jh-recents";
    recents.innerHTML = `
      <div class="jh-recents__title">多工</div>
      <div class="jh-recents__list">
        <button type="button" class="jh-recents__card jh-recents__card--messages" id="jh-recents-messages">
          <span class="jh-recents__icon">💬</span>
          <span class="jh-recents__label">訊息</span>
        </button>
        <button type="button" class="jh-recents__card jh-recents__card--notes" id="jh-recents-notes">
          <span class="jh-recents__icon">📝</span>
          <span class="jh-recents__label">備忘錄</span>
        </button>
        <button type="button" class="jh-recents__card jh-recents__card--browser" id="jh-recents-browser">
          <span class="jh-recents__icon">🧭</span>
          <span class="jh-recents__label">網站</span>
        </button>
      </div>
    `;
    document.body.appendChild(recents);

    function openRecents() {
      recents.classList.add("jh-recents--open");
    }
    function closeRecents() {
      recents.classList.remove("jh-recents--open");
    }
    recents.addEventListener("click", (e) => {
      if (e.target === recents) closeRecents();
    });
    // 信件面板停留在殼層這一層(z-index 1600),蓋在整個 iframe 上面——玩家在
    // 多工畫面連續選了兩個不同分頁的話,如果前一個面板沒有先關掉,即使選了別的
    // 分頁,信件面板還是會繼續蓋著、讓玩家覺得選了跟沒選一樣。所以在這裡開新的
    // 之前,要先把信件面板收起來,確保玩家選哪個,哪個才會真的疊到最上層。
    function closeAllPanelsForSwitch() {
      mailEl.classList.remove("jh-mail--open");
    }
    document.getElementById("jh-recents-messages").addEventListener("click", () => {
      closeRecents();
      closeAllPanelsForSwitch();
      openMail();
    });
    document.getElementById("jh-recents-notes").addEventListener("click", () => {
      closeRecents();
      closeAllPanelsForSwitch();
      hideHomeScreen();
      try {
        if (typeof frame.contentWindow.jhOpenNotebook === "function") frame.contentWindow.jhOpenNotebook();
      } catch (e) {}
    });
    document.getElementById("jh-recents-browser").addEventListener("click", () => {
      closeRecents();
      closeAllPanelsForSwitch();
      enterApp();
    });

    const boot = document.createElement("div");
    boot.className = "jh-boot";
    boot.innerHTML = `
      <div class="jh-boot__home" id="jh-boot-home">
        <div class="jh-boot__widget">
          <div class="jh-boot__widget-time" id="jh-boot-home-time"></div>
          <div class="jh-boot__widget-date">${HOME_DATE_LABEL}</div>
        </div>
        <div class="jh-boot__grid">
          <button type="button" class="jh-boot__app jh-boot__app--photos" data-inert="1">
            <span class="jh-boot__app-icon">🖼️</span>
            <span class="jh-boot__app-label">相簿</span>
          </button>
          <button type="button" class="jh-boot__app jh-boot__app--messages" id="jh-boot-messages">
            <span class="jh-boot__app-icon">💬</span>
            <span class="jh-boot__app-badge" id="jh-boot-messages-badge" hidden></span>
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
      const time = clockNow();
      document.querySelectorAll("#jh-sb-time, #jh-boot-home-time").forEach((el) => { el.textContent = time; });
    }
    tick();
    setInterval(tick, 15000);

    boot.querySelectorAll('.jh-boot__app[data-inert="1"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.classList.remove("jh-boot__app--shake");
        void btn.offsetWidth;
        btn.classList.add("jh-boot__app--shake");
      });
    });

    const home = document.getElementById("jh-boot-home");

    function showHomeScreen() {
      boot.classList.add("jh-boot--visible");
      home.classList.add("jh-boot__home--visible");
      // 多工畫面的 z-index 比主畫面高,不主動收起來的話會一直蓋在上面,
      // 玩家會覺得按 Home 鍵沒反應。
      closeRecents();
    }
    function hideHomeScreen() {
      boot.classList.remove("jh-boot--visible");
      // 主畫面自己也有 pointer-events:auto 的覆蓋規則(讓 App 圖示點得到),
      // 光靠外層 .jh-boot--visible 淡出還不夠,要一併拿掉,不然透明的主畫面
      // 還是會擋住底下 iframe 的點擊。
      home.classList.remove("jh-boot__home--visible");
    }

    function enterApp() {
      localStorage.setItem(FULLSCREEN_KEY, "1");
      window.requestFullscreenNow();
      hideHomeScreen();
    }
    document.getElementById("jh-boot-browser").addEventListener("click", enterApp);
    document.getElementById("jh-nav-home").addEventListener("click", () => {
      // Home 鍵除了叫出主畫面,也要把信件面板收起來——不然它的 z-index 比
      // 主畫面高,玩家會看到面板卡住不動,以為 Home 鍵沒反應。這裡直接拿掉
      // class,不呼叫 closeMail() 本身,是因為它在「從瀏覽器內容被打斷跳進來
      // 看」的情境下會連帶呼叫 hideHomeScreen()(關閉後要回到原本在讀的頁面),
      // 那個副作用不適用在這裡——玩家主動按 Home 鍵,就是要去主畫面。
      closeAllPanelsForSwitch();
      showHomeScreen();
    });

    // ══════════════════ 訊息 App(案件通知信) ══════════════════
    // 跟前作周妤的訊息 App 同一套視覺跟位置,但資料模型不同——這裡沒有多個聯絡人,
    // 只有一份案件通知信的清單(跟原本 scripts/mail.js 的「信件」資料模型一樣),
    // 所以面板是單一列表,不用做聯絡人清單+對話串那層。
    const mailEl = document.createElement("div");
    mailEl.className = "jh-mail";
    mailEl.id = "jh-mail";
    mailEl.innerHTML = `
      <div class="jh-mail__header">
        <strong id="jh-mail-title"></strong>
        <button type="button" class="jh-mail__iconbtn" id="jh-mail-close" aria-label="關閉">✕</button>
      </div>
      <div class="jh-mail__body" id="jh-mail-body"></div>
    `;
    document.body.appendChild(mailEl);

    const notif = document.createElement("div");
    notif.className = "jh-notif";
    notif.id = "jh-notif";
    notif.innerHTML = `
      <div class="jh-notif__icon">💬</div>
      <div class="jh-notif__text">
        <div class="jh-notif__title" id="jh-notif-title"></div>
        <div class="jh-notif__body" id="jh-notif-body"></div>
      </div>
    `;
    document.body.appendChild(notif);

    const mailBodyEl = document.getElementById("jh-mail-body");
    const mailBadgeEl = document.getElementById("jh-boot-messages-badge");

    function renderBadge() {
      const n = unreadCount();
      if (n > 0) {
        mailBadgeEl.hidden = false;
        mailBadgeEl.textContent = String(n);
      } else {
        mailBadgeEl.hidden = true;
      }
    }

    function renderMailBody() {
      const list = letters();
      mailBodyEl.innerHTML = "";
      if (!list.length) {
        const p = document.createElement("p");
        p.className = "jh-mail__empty";
        p.textContent = t(MAIL_UI.empty, currentLocale());
        mailBodyEl.appendChild(p);
        return;
      }
      list.slice().reverse().forEach((letter) => {
        const item = document.createElement("div");
        item.className = "jh-mail__item";
        const subject = document.createElement("p");
        subject.className = "jh-mail__subject";
        subject.textContent = letter.subject;
        const body = document.createElement("p");
        body.className = "jh-mail__text";
        body.textContent = letter.body;
        item.appendChild(subject);
        item.appendChild(body);
        if (letter.linkHref) {
          const a = document.createElement("a");
          a.className = "jh-mail__link";
          a.href = letter.linkHref;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = letter.linkLabel;
          item.appendChild(a);
        }
        mailBodyEl.appendChild(item);
      });
    }

    // 記住開訊息面板之前是不是已經在主畫面——如果是在瀏覽器裡讀內容時被通知橫幅
    // 打斷、點進來看信,關閉之後應該要回到原本在讀的頁面,不是留在主畫面乾等。
    let mailOpenedFromBrowser = false;
    function openMail() {
      mailOpenedFromBrowser = !boot.classList.contains("jh-boot--visible");
      showHomeScreen();
      document.getElementById("jh-mail-title").textContent = t(MAIL_UI.title, currentLocale());
      renderMailBody();
      jhSet("letters", letters().map((l) => ({ ...l, read: true })));
      renderBadge();
      mailEl.classList.add("jh-mail--open");
    }
    function closeMail() {
      mailEl.classList.remove("jh-mail--open");
      if (mailOpenedFromBrowser) hideHomeScreen();
    }

    document.getElementById("jh-boot-messages").addEventListener("click", () => {
      openMail();
    });
    document.getElementById("jh-mail-close").addEventListener("click", closeMail);

    // ── 通知橫幅:iframe 裡任何一頁呼叫 mail.deliverLetter(...) 都會透過
    // window.top.jhReceiveLetter(...) 進來這裡 ──
    let notifTimer = null;
    window.jhReceiveLetter = function jhReceiveLetter(letter) {
      renderBadge();
      document.getElementById("jh-notif-title").textContent = t(MAIL_UI.title, currentLocale());
      document.getElementById("jh-notif-body").textContent = letter.subject;
      notif.classList.add("jh-notif--visible");
      clearTimeout(notifTimer);
      notifTimer = setTimeout(() => notif.classList.remove("jh-notif--visible"), 5000);
    };
    notif.addEventListener("click", () => {
      notif.classList.remove("jh-notif--visible");
      clearTimeout(notifTimer);
      openMail();
    });

    renderBadge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
