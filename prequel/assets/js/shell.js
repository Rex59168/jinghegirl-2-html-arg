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
      ],
    },
    {
      id: "dad", name: "爸", color: "#5c7ce0",
      messages: [
        { from: "them", text: "機車該保養了,這禮拜找時間牽去" },
        { from: "me", text: "好我知道了" },
      ],
    },
    {
      id: "cousin", name: "阿翔(表弟)", color: "#5cc27a",
      messages: [
        { from: "them", text: "姐妳新出的角色抽到了嗎" },
        { from: "me", text: "沒抽,最近沒空" },
        { from: "them", text: "？？？妳不是很愛玩" },
      ],
    },
    {
      id: "friend", name: "映涵", color: "#c25ca0",
      messages: [
        { from: "them", text: "禮拜六唱歌你要不要來" },
        { from: "me", text: "看狀況,最近比較忙" },
        { from: "them", text: "好喔那我先訂位,妳決定要跟我說" },
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
      const rows = [
        { id: ZY_ID, name: ZY_NAME, color: "#4a6fa5", unread },
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

    function openThread(contactId) {
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
      if (messagesOpenedFromBrowser) hideHomeScreen();
    }

    document.getElementById("jh-boot-messages").addEventListener("click", () => openMessages());
    document.getElementById("jh-messages-close").addEventListener("click", closeMessages);
    document.getElementById("jh-messages-back").addEventListener("click", () => {
      messagesEl.classList.remove("jh-messages--thread-open");
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
