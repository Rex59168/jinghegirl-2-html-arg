// shell.js — 殼層本體(只在 prequel/index.html 執行,是整個第一章唯一真正會被瀏覽器
// 導航的頁面)。負責:手機狀態列、Android 三鍵導覽列、鎖定畫面→主畫面開機動畫、
// 訊息 App(周妤傳來的所有訊息 + 幾個充場面的聯絡人)、頂部通知橫幅、管理內層
// iframe(實際內容都在裡面跑,換頁只發生在 iframe 內部,殼層本身永遠不重新導航,
// 全螢幕狀態才不會被瀏覽器自動取消)。
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
  // 手機鎖定畫面/主畫面照真實手機的習慣多顯示天氣跟所在地——玩家跟晞晞、周妤
  // 一樣是靖河市在地的女高中生,固定寫死跟日期一樣,不用抓玩家裝置的即時天氣。
  const WEATHER_LABEL = "☀️ 31°C・靖河市";
  const FULLSCREEN_KEY = "jh2bridge:fullscreen_opt_in";
  const BOOT_SEEN_KEY = "jh2bridge:ch1_boot_seen";

  // 直接用跟 state.js 一樣的前綴讀寫 localStorage——殼層是頂層文件,跟 iframe
  // 裡的每一頁同源共用同一份 localStorage,不需要透過 JH 物件也能存取。
  const JH_PREFIX = "jh1f_";
  function jhGet(key, fallback) {
    try {
      const v = localStorage.getItem(JH_PREFIX + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function jhSet(key, value) {
    try { localStorage.setItem(JH_PREFIX + key, JSON.stringify(value)); } catch (e) {}
  }

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

  // ── 充場面的聯絡人:隨便放幾個,固定內容,不需要存進 localStorage ──
  const FILLER_CONTACTS = [
    {
      id: "mom", name: "媽", color: "#e0895c",
      messages: [
        { from: "them", text: "晚餐想吃什麼,還是不回家吃?" },
        { from: "me", text: "在同學家,晚點自己解決" },
        { from: "them", text: "早點回來,不要太晚" },
        { from: "them", text: "對了,妳阿姨明天要來,記得整理一下房間" },
        { from: "me", text: "好啦好啦" },
        { from: "them", text: "冰箱裡有切好的水果,回來記得吃" },
        { from: "me", text: "謝謝媽" },
      ],
    },
    {
      id: "dad", name: "爸", color: "#5c7ce0",
      messages: [
        { from: "them", text: "機車該保養了,這禮拜找時間牽去" },
        { from: "me", text: "好我知道了" },
        { from: "them", text: "順便看一下前輪煞車有沒有聲音" },
        { from: "me", text: "有一點點,我再注意" },
        { from: "them", text: "這個月生活費已經轉了,自己看一下" },
        { from: "me", text: "收到" },
        { from: "them", text: "妳最近好像很常晚回家,還好嗎" },
        { from: "me", text: "就朋友那邊的事,沒事的" },
        { from: "them", text: "有事要說,別自己扛" },
      ],
    },
    {
      id: "cousin", name: "阿翔(表弟)", color: "#5cc27a",
      messages: [
        { from: "them", text: "姐妳新出的角色抽到了嗎" },
        { from: "me", text: "沒抽,最近沒空" },
        { from: "them", text: "？？？妳不是很愛玩" },
        { from: "me", text: "最近有點累,晚點再說" },
        { from: "them", text: "好喔,那我先幫妳把材料存著" },
        { from: "them", text: "對了叔叔說中秋要一起烤肉,妳會回來嗎" },
        { from: "me", text: "應該會,到時候再說" },
        { from: "them", text: "姐妳寒假要不要教我打那個副本" },
        { from: "me", text: "可以啊,到時候敲我" },
      ],
    },
    {
      id: "friend", name: "映涵", color: "#c25ca0",
      messages: [
        { from: "them", text: "禮拜六唱歌妳要不要來" },
        { from: "me", text: "看狀況,最近比較忙" },
        { from: "them", text: "好喔那我先訂位,妳決定要跟我說" },
        { from: "them", text: "欸妳今天怎麼都沒回訊息" },
        { from: "me", text: "抱歉在忙,晚點解釋" },
        { from: "them", text: "沒事啦,妳沒事就好,有空再聊" },
        { from: "me", text: "謝謝妳" },
        { from: "them", text: "妳最近感覺怪怪的,真的沒事嗎" },
        { from: "me", text: "只是比較累,妳別擔心" },
      ],
    },
  ];
  const ZY_ID = "zhouyu";
  const ZY_NAME = "周妤";

  function phoneLog() { return jhGet("phone_log", []); }
  function readIds() { return jhGet("phone_read_ids", []); }
  function unreadCount() {
    const read = readIds();
    return phoneLog().filter((m) => !read.includes(m.id)).length;
  }

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

    document.getElementById("jh-nav-back").addEventListener("click", () => {
      // 跟一般 Android 一樣,返回鍵要先收起蓋在最上層的東西,不會直接穿透去換頁
      // ——不然玩家會看到多工畫面、訊息、備忘錄卡住不動,分不清楚返回鍵到底有
      // 沒有反應。依疊放順序(z-index)由上往下一層一層收。
      if (recents.classList.contains("jh-recents--open")) {
        closeRecents();
        return;
      }
      const current = currentOpenPanel();
      if (current) {
        // 如果是從別的面板切過來的(例如訊息 → 多工切去備忘錄),返回鍵要退回
        // 上一個開著的面板,而不是直接整個關掉——只記一層,不是完整的瀏覽紀錄。
        if (lastPanel && lastPanel !== current) {
          const toReopen = lastPanel;
          lastPanel = null;
          if (current === "messages") {
            messagesEl.classList.remove("jh-messages--open", "jh-messages--thread-open");
            currentThreadContactId = null;
          } else {
            notesEl.classList.remove("jh-notes--open");
          }
          if (toReopen === "messages") openMessages();
          else openNotes();
          return;
        }
        if (current === "messages") closeMessages();
        else closeNotes();
        return;
      }
      // 交給 iframe 自己那頁的站內導覽紀錄處理(browser-chrome.js 掛的
      // window.jhGoBackInSite),不要用瀏覽器原生 history.back()——玩家還沒在
      // 站內換過頁的話,原生上一頁其實是離開整個網站,不是我們要的效果。
      try {
        if (typeof frame.contentWindow.jhGoBackInSite === "function") frame.contentWindow.jhGoBackInSite();
      } catch (e) {}
    });
    document.getElementById("jh-nav-recents").addEventListener("click", openRecents);

    // ── 多工切換畫面:點方塊鍵不再只是「沒有其他使用中的頁面」的提示 toast,
    // 改成跟一般 Android 一樣列出可以切換的幾個畫面卡片,點哪張就直接切過去。
    // 雲端相簿/社交媒體/二手平台這三張是動態的——跟真正手機的多工畫面一樣,
    // 只列出玩家實際開過的 App,一開始不存在,玩家逛過對應板塊之後才會出現
    // (由 browser-chrome.js 每次進那個板塊時寫 jh1f_app_*_unlocked 旗標)。──
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
        <button type="button" class="jh-recents__card jh-recents__card--album" id="jh-recents-album" hidden>
          <span class="jh-recents__icon">☁️</span>
          <span class="jh-recents__label">雲端相簿</span>
        </button>
        <button type="button" class="jh-recents__card jh-recents__card--social" id="jh-recents-social" hidden>
          <span class="jh-recents__icon">📱</span>
          <span class="jh-recents__label">社交媒體</span>
        </button>
        <button type="button" class="jh-recents__card jh-recents__card--market" id="jh-recents-market" hidden>
          <span class="jh-recents__icon">🛒</span>
          <span class="jh-recents__label">購物網</span>
        </button>
      </div>
    `;
    document.body.appendChild(recents);

    function openRecents() {
      // 每次打開才重新檢查——玩家可能是這次瀏覽期間才第一次逛到雲端相簿/
      // 社交媒體/二手平台,卡片要跟著即時出現,不是進站當下就定死。
      document.getElementById("jh-recents-album").hidden = !jhGet("app_album_unlocked", false);
      document.getElementById("jh-recents-social").hidden = !jhGet("app_social_unlocked", false);
      document.getElementById("jh-recents-market").hidden = !jhGet("app_market_unlocked", false);
      recents.classList.add("jh-recents--open");
    }
    function closeRecents() {
      recents.classList.remove("jh-recents--open");
    }
    recents.addEventListener("click", (e) => {
      if (e.target === recents) closeRecents();
    });
    // 記住返回鍵按下前,上一個開著的面板是哪一個——讓「訊息 → 多工切去備忘錄 →
    // 按返回鍵」可以退回訊息,而不是直接整個關掉。只記一層(不是完整堆疊),
    // 符合「回到上一個開啟的分頁」這個需求,不用做到多層瀏覽器式的返回歷史。
    let lastPanel = null; // 'messages' | 'notes' | null
    function currentOpenPanel() {
      if (messagesEl.classList.contains("jh-messages--open")) return "messages";
      if (notesEl.classList.contains("jh-notes--open")) return "notes";
      return null;
    }

    // 切到別的畫面之前,要先把其他所有蓋在上面的東西收乾淨——不只是多工畫面用
    // 得到,任何「跳過多工畫面、直接開某個面板」的入口(例如訊息通知橫幅點擊)
    // 也一定要走這條路。不然的話,假設備忘錄還開著時跳出新訊息通知,點通知只
    // 會在備忘錄底下默默打開訊息面板——備忘錄的 z-index 比訊息面板高,畫面上
    // 完全看不出任何變化,玩家會以為點了沒反應、被卡在備忘錄出不去。
    function closeAllPanelsForSwitch() {
      lastPanel = currentOpenPanel();
      recents.classList.remove("jh-recents--open");
      messagesEl.classList.remove("jh-messages--open", "jh-messages--thread-open");
      currentThreadContactId = null;
      notesEl.classList.remove("jh-notes--open");
    }
    // Home 鍵是徹底離開、回主畫面,不需要「記得等一下退回去」,跟切分頁用的
    // closeAllPanelsForSwitch() 分開一份,呼叫處在下面主畫面覆蓋層那一段。
    function closeAllPanelsForHome() {
      lastPanel = null;
      recents.classList.remove("jh-recents--open");
      messagesEl.classList.remove("jh-messages--open", "jh-messages--thread-open");
      currentThreadContactId = null;
      notesEl.classList.remove("jh-notes--open");
    }
    document.getElementById("jh-recents-messages").addEventListener("click", () => {
      closeAllPanelsForSwitch();
      openMessages();
    });
    document.getElementById("jh-recents-notes").addEventListener("click", () => {
      closeAllPanelsForSwitch();
      openNotes();
    });
    // 雲端相簿/社交媒體/購物網現在各自有自己專屬的分頁卡片、各記各的「上次逛到
    // 哪裡」,所以「網站」這張卡片不該再停在那三個板塊裡——玩家如果正在雲端相簿
    // (或社交媒體、購物網)裡面,點「網站」應該要回到協尋網站本身(home.html),
    // 而不是留在原地什麼都沒變。如果本來就在協尋網站的其他一般頁面,點「網站」
    // 維持原樣、只是收起多工畫面而已,不用被迫跳回首頁。
    function isOnAppTabPage() {
      try {
        const parts = frame.contentWindow.location.pathname.split("/").filter(Boolean);
        return parts.some((seg) => seg === "editor" || seg === "social" || seg === "market");
      } catch (e) {
        return false;
      }
    }
    document.getElementById("jh-recents-browser").addEventListener("click", () => {
      closeAllPanelsForSwitch();
      if (isOnAppTabPage()) {
        try { frame.contentWindow.location.href = "home.html"; } catch (e) {}
      }
      enterApp();
    });
    // 雲端相簿/社交媒體/二手平台這三張卡片,點下去要跳回玩家上次逛到的那一頁
    // (不是每次都回到最起始頁),才符合「多工切換」的直覺——跟切回訊息/備忘錄
    // 保留原本畫面是同一個道理。
    function openAppTab(kind, defaultUrl) {
      closeAllPanelsForSwitch();
      enterApp();
      const url = jhGet("app_" + kind + "_last_url", defaultUrl);
      try { frame.contentWindow.location.href = url; } catch (e) {}
    }
    document.getElementById("jh-recents-album").addEventListener("click", () => openAppTab("album", "editor/album.html"));
    document.getElementById("jh-recents-social").addEventListener("click", () => openAppTab("social", "social/lin-xi.html"));
    document.getElementById("jh-recents-market").addEventListener("click", () => openAppTab("market", "market/listing.html"));

    // ── 鎖定畫面 / 主畫面覆蓋層(第一次是開機動畫,之後按 Home 鍵可以隨時再叫出來)──
    const boot = document.createElement("div");
    boot.className = "jh-boot";
    boot.innerHTML = `
      <div class="jh-boot__lock" id="jh-boot-lock">
        <div class="jh-boot__time" id="jh-boot-lock-time"></div>
        <div class="jh-boot__date">${BOOT_DATE_LABEL}</div>
        <div class="jh-boot__weather">${WEATHER_LABEL}</div>
        <div class="jh-boot__hint">輕觸螢幕解鎖</div>
      </div>
      <div class="jh-boot__home" id="jh-boot-home">
        <div class="jh-boot__widget">
          <div class="jh-boot__widget-time" id="jh-boot-home-time"></div>
          <div class="jh-boot__widget-date">${BOOT_DATE_LABEL}</div>
          <div class="jh-boot__widget-weather">${WEATHER_LABEL}</div>
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
          <button type="button" class="jh-boot__app jh-boot__app--notes" id="jh-boot-notes">
            <span class="jh-boot__app-icon">📝</span>
            <span class="jh-boot__app-badge" id="jh-boot-notes-badge" hidden></span>
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

    // 全螢幕旗標打開、實際請求全螢幕——獨立成一個函式,因為現在有兩個地方要用:
    // 點鎖定畫面解鎖(讓桌布主畫面一出現就已經是全螢幕),還有點「瀏覽器」圖示
    // (原本唯一的入口,保留給略過開機動畫直接進站的情境)。
    function requestFullscreenOptIn() {
      localStorage.setItem(FULLSCREEN_KEY, "1");
      window.requestFullscreenNow();
    }

    function enterApp() {
      requestFullscreenOptIn();
      hideHomeScreen();
    }

    document.getElementById("jh-boot-browser").addEventListener("click", enterApp);
    document.getElementById("jh-nav-home").addEventListener("click", () => {
      // Home 鍵除了叫出主畫面,也要把訊息/備忘錄面板收起來——不然它們的
      // z-index 比主畫面高,玩家會看到面板卡住不動,以為 Home 鍵沒反應。
      // 這裡直接拿掉 class(用徹底離開專用的 closeAllPanelsForHome(),不是切
      // 分頁用的 closeAllPanelsForSwitch()——按 Home 鍵不用記得等一下要退回
      // 剛剛那個面板),不呼叫 closeMessages()/closeNotes() 本身,是因為那兩個
      // 函式在「從瀏覽器內容被打斷跳進來看」的情境下會連帶呼叫 hideHomeScreen()
      // (關閉後要回到原本在讀的頁面),那個副作用不適用在這裡——玩家主動按
      // Home 鍵,就是要去主畫面,不是要回瀏覽器內容。
      closeAllPanelsForHome();
      showHomeScreen();
    });

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
          // 全螢幕從這裡就開始請求,不用等到玩家另外點「瀏覽器」圖示——這是玩家
          // 進站後第一個真正的手勢,桌布主畫面一出現就應該已經是全螢幕狀態,
          // 不是空白晃一下才進全螢幕。
          requestFullscreenOptIn();
          showHomeScreen();
        },
        { once: true }
      );
    }

    // ══════════════════ 訊息 App ══════════════════
    const messagesEl = document.createElement("div");
    messagesEl.className = "jh-messages";
    messagesEl.id = "jh-messages";
    messagesEl.innerHTML = `
      <div class="jh-messages__list">
        <div class="jh-messages__header">
          <strong>訊息</strong>
          <button type="button" class="jh-messages__iconbtn" id="jh-messages-close" aria-label="關閉">✕</button>
        </div>
        <div class="jh-messages__contacts" id="jh-messages-contacts"></div>
      </div>
      <div class="jh-messages__thread" id="jh-messages-thread">
        <div class="jh-messages__thread-header">
          <button type="button" class="jh-messages__iconbtn" id="jh-messages-back" aria-label="返回">←</button>
          <strong id="jh-messages-thread-name"></strong>
        </div>
        <div class="jh-messages__thread-body" id="jh-messages-thread-body"></div>
      </div>
    `;
    document.body.appendChild(messagesEl);

    const notif = document.createElement("div");
    notif.className = "jh-notif";
    notif.id = "jh-notif";
    notif.innerHTML = `
      <div class="jh-notif__icon">💬</div>
      <div class="jh-notif__text">
        <div class="jh-notif__title">${ZY_NAME}</div>
        <div class="jh-notif__body" id="jh-notif-body"></div>
      </div>
    `;
    document.body.appendChild(notif);

    const contactsEl = document.getElementById("jh-messages-contacts");
    const threadNameEl = document.getElementById("jh-messages-thread-name");
    const threadBodyEl = document.getElementById("jh-messages-thread-body");
    const badgeEl = document.getElementById("jh-boot-messages-badge");

    function renderBadge() {
      const n = unreadCount();
      if (n > 0) {
        badgeEl.hidden = false;
        badgeEl.textContent = String(n);
      } else {
        badgeEl.hidden = true;
      }
    }

    function contactPreview(contactId) {
      if (contactId === ZY_ID) {
        const log = phoneLog();
        const last = log[log.length - 1];
        if (!last) return "（還沒有訊息）";
        return (last.from === "me" ? "你:" : "") + last.text;
      }
      const c = FILLER_CONTACTS.find((x) => x.id === contactId);
      const last = c.messages[c.messages.length - 1];
      return last ? last.text : "";
    }

    function renderContacts() {
      contactsEl.innerHTML = "";
      const unread = unreadCount();
      // 周妤在玩家傳出更正時間、她第一次回訊息之前不會出現在聯絡人清單裡——
      // 開頭手機裡本來就有的家人朋友不受影響,周妤要等真的傳來第一則訊息才會
      // 「加進」通訊錄,跟真實手機認識新朋友的順序一樣。
      const rows = [
        ...(phoneLog().length > 0 ? [{ id: ZY_ID, name: ZY_NAME, color: "#4a6fa5", unread }] : []),
        ...FILLER_CONTACTS.map((c) => ({ id: c.id, name: c.name, color: c.color, unread: 0 })),
      ];
      rows.forEach((r) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "jh-messages__contact";
        row.innerHTML = `
          <span class="jh-messages__avatar" style="background:${r.color}">${r.name.slice(0, 1)}</span>
          <span class="jh-messages__contact-info">
            <span class="jh-messages__contact-name">${r.name}</span>
            <span class="jh-messages__contact-preview"></span>
          </span>
          ${r.unread > 0 ? `<span class="jh-messages__contact-badge">${r.unread}</span>` : ""}
        `;
        row.querySelector(".jh-messages__contact-preview").textContent = contactPreview(r.id);
        row.addEventListener("click", () => openThread(r.id));
        contactsEl.appendChild(row);
      });
    }

    function bubble(text, from, href) {
      const el = document.createElement(href ? "a" : "div");
      el.className = "jh-messages__bubble jh-messages__bubble--" + from + (href ? " jh-messages__bubble--link" : "");
      el.textContent = text;
      if (href) {
        el.href = href;
        el.addEventListener("click", (e) => {
          e.preventDefault();
          try { frame.contentWindow.location.href = href; } catch (err) {}
          closeMessages();
        });
      }
      return el;
    }

    let currentThreadContactId = null;
    function openThread(contactId) {
      currentThreadContactId = contactId;
      threadBodyEl.innerHTML = "";
      if (contactId === ZY_ID) {
        threadNameEl.textContent = ZY_NAME;
        const log = phoneLog();
        if (!log.length) {
          const p = document.createElement("p");
          p.className = "jh-messages__empty";
          p.textContent = "還沒有新訊息。";
          threadBodyEl.appendChild(p);
        } else {
          log.forEach((m) => threadBodyEl.appendChild(bubble(m.text, m.from || "them", m.href)));
        }
        jhSet("phone_read_ids", log.map((m) => m.id));
        renderBadge();
        renderContacts();
      } else {
        const c = FILLER_CONTACTS.find((x) => x.id === contactId);
        threadNameEl.textContent = c.name;
        c.messages.forEach((m) => threadBodyEl.appendChild(bubble(m.text, m.from)));
      }
      messagesEl.classList.add("jh-messages--thread-open");
      threadBodyEl.scrollTop = threadBodyEl.scrollHeight;
    }

    // 記住開訊息 App 之前是不是已經在主畫面——如果是在瀏覽器裡讀故事時被通知橫幅
    // 打斷、點進來看訊息,關閉之後應該要回到原本在讀的頁面,而不是留在主畫面
    // 乾等,還要玩家自己想起來要點瀏覽器圖示才能回去。
    let messagesOpenedFromBrowser = false;
    function openMessages(contactId) {
      messagesOpenedFromBrowser = !boot.classList.contains("jh-boot--visible");
      renderContacts();
      showHomeScreen();
      messagesEl.classList.add("jh-messages--open");
      if (contactId) openThread(contactId);
    }
    function closeMessages() {
      messagesEl.classList.remove("jh-messages--open", "jh-messages--thread-open");
      currentThreadContactId = null;
      if (messagesOpenedFromBrowser) hideHomeScreen();
    }

    document.getElementById("jh-boot-messages").addEventListener("click", () => openMessages());
    document.getElementById("jh-messages-close").addEventListener("click", closeMessages);
    document.getElementById("jh-messages-back").addEventListener("click", () => {
      messagesEl.classList.remove("jh-messages--thread-open");
      currentThreadContactId = null;
    });

    // ── 通知橫幅:iframe 裡任何一頁呼叫 window.top.jhReceiveMessage(...) 都會進來這裡。
    // from 預設是"them"(周妤傳來的,會跳通知橫幅);玩家自己回覆的"me"訊息不用
    // 跳通知打斷自己,直接視為已讀就好。 ──
    let notifTimer = null;
    window.jhReceiveMessage = function jhReceiveMessage(id, text, href, from) {
      const log = phoneLog();
      if (log.some((m) => m.id === id)) return;
      const entry = { id, text, href, from: from === "me" ? "me" : "them" };
      log.push(entry);
      jhSet("phone_log", log);

      // 玩家正開著跟周妤的對話串的話,新訊息直接接到後面顯示、標成已讀,不用等
      // 重新打開才看得到,也不用為了自己正在看的對話跳通知橫幅打斷自己。
      const threadIsOpenOnZY = currentThreadContactId === ZY_ID && messagesEl.classList.contains("jh-messages--open");
      if (threadIsOpenOnZY) {
        jhSet("phone_read_ids", [...readIds(), id]);
        renderBadge();
        renderContacts();
        threadBodyEl.appendChild(bubble(entry.text, entry.from, entry.href));
        threadBodyEl.scrollTop = threadBodyEl.scrollHeight;
        return;
      }

      if (entry.from === "me") {
        jhSet("phone_read_ids", [...readIds(), id]);
        renderBadge();
        renderContacts();
        return;
      }

      renderBadge();
      document.getElementById("jh-notif-body").textContent = text;
      notif.classList.add("jh-notif--visible");
      clearTimeout(notifTimer);
      notifTimer = setTimeout(() => notif.classList.remove("jh-notif--visible"), 5000);
    };
    notif.addEventListener("click", () => {
      notif.classList.remove("jh-notif--visible");
      clearTimeout(notifTimer);
      // 通知橫幅是唯一一個「跳過多工畫面、直接開訊息面板」的入口(z-index 2000,
      // 不管背後開著什麼都點得到)——如果備忘錄當時剛好開著,不先收乾淨的話,
      // 訊息面板會在備忘錄底下默默打開,備忘錄 z-index 比較高會繼續蓋著,畫面上
      // 完全看不出點了有反應,玩家會以為卡住了。
      closeAllPanelsForSwitch();
      openMessages(ZY_ID);
    });

    renderBadge();

    // ══════════════════ 備忘錄 App(已知事項清單) ══════════════════
    // 資料模型是純粹的事實清單(跟 iframe 裡各頁呼叫 JHNotebook.add(...) 寫進
    // localStorage 的格式一樣),不用聯絡人/對話串那層,面板是單一列表。點項目
    // 直接跳回原始頁面(操作 iframe.contentWindow,不是跳頂層,不然會脫離殼層)。
    const notesEl = document.createElement("div");
    notesEl.className = "jh-notes";
    notesEl.id = "jh-notes";
    notesEl.innerHTML = `
      <div class="jh-notes__header">
        <strong>【已知】</strong>
        <button type="button" class="jh-notes__iconbtn" id="jh-notes-close" aria-label="關閉">✕</button>
      </div>
      <div class="jh-notes__body" id="jh-notes-body"></div>
    `;
    document.body.appendChild(notesEl);

    const notesBodyEl = document.getElementById("jh-notes-body");
    const notesBadgeEl = document.getElementById("jh-boot-notes-badge");

    function notebookList() { return jhGet("notebook", []); }

    function renderNotesBadge() {
      const n = notebookList().length;
      if (n > 0) {
        notesBadgeEl.hidden = false;
        notesBadgeEl.textContent = String(n);
      } else {
        notesBadgeEl.hidden = true;
      }
    }

    function renderNotesBody() {
      const list = notebookList();
      notesBodyEl.innerHTML = "";
      if (!list.length) {
        const p = document.createElement("p");
        p.className = "jh-notes__empty";
        p.textContent = "還沒有已知事項。繼續往下看。";
        notesBodyEl.appendChild(p);
        return;
      }
      list.forEach((e) => {
        const a = document.createElement("a");
        a.className = "jh-notes__item";
        a.href = e.href;
        a.textContent = e.text;
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          try { frame.contentWindow.location.href = e.href; } catch (err) {}
          closeNotes();
        });
        notesBodyEl.appendChild(a);
      });
    }

    let notesOpenedFromBrowser = false;
    function openNotes() {
      notesOpenedFromBrowser = !boot.classList.contains("jh-boot--visible");
      showHomeScreen();
      renderNotesBody();
      notesEl.classList.add("jh-notes--open");
    }
    function closeNotes() {
      notesEl.classList.remove("jh-notes--open");
      if (notesOpenedFromBrowser) hideHomeScreen();
    }

    document.getElementById("jh-boot-notes").addEventListener("click", openNotes);
    document.getElementById("jh-notes-close").addEventListener("click", closeNotes);

    // ── 線索通知橫幅:iframe 裡任何一頁呼叫 JHNotebook.add(...) 新增一筆
    // *還沒記錄過* 的線索時,會跳出這個橫幅(跟訊息通知同一套視覺,錯開位置
    // 避免疊在一起),點一下直接開備忘錄查看剛蒐集到的那則線索。 ──
    const clueNotif = document.createElement("div");
    clueNotif.className = "jh-notif jh-clue-notif";
    clueNotif.id = "jh-clue-notif";
    clueNotif.innerHTML = `
      <div class="jh-notif__icon">📝</div>
      <div class="jh-notif__text">
        <div class="jh-notif__title">已記錄新線索</div>
        <div class="jh-notif__body" id="jh-clue-notif-body"></div>
      </div>
    `;
    document.body.appendChild(clueNotif);

    let clueNotifTimer = null;
    window.jhClueNotify = function jhClueNotify(text) {
      renderNotesBadge();
      document.getElementById("jh-clue-notif-body").textContent = text;
      clueNotif.classList.add("jh-notif--visible");
      clearTimeout(clueNotifTimer);
      clueNotifTimer = setTimeout(() => clueNotif.classList.remove("jh-notif--visible"), 5000);
    };
    clueNotif.addEventListener("click", () => {
      clueNotif.classList.remove("jh-notif--visible");
      clearTimeout(clueNotifTimer);
      closeAllPanelsForSwitch();
      openNotes();
    });

    // iframe 裡任何一頁呼叫 JHNotebook.add(...) 都會透過這個跨框呼叫通知殼層
    // 立刻更新角標數字,不用等玩家自己點開備忘錄才看到最新數字。
    window.jhRefreshNotesBadge = renderNotesBadge;

    renderNotesBadge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
