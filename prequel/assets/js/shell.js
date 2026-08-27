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
  // 周妤不是一開始就在通訊錄裡——玩家要先在協尋站上加她好友(xunren/
  // correction.html,她的訊息帳號頁),她才會出現在訊息 App 的聯絡人清單裡。
  // 在那之前就先在別的頁面發現的線索,還是會照樣存進 phone_log(等加了好友
  // 一次看到),只是不會計進未讀角標、不會出現在清單上。
  function zyFriended() { return jhGet("zy_friend_added", false); }
  function unreadCount() {
    if (!zyFriended()) return 0;
    const read = readIds();
    return phoneLog().filter((m) => !read.includes(m.id)).length;
  }

  function mount() {
    const frame = document.getElementById("jh-app-frame");

    // 頂部通知橫幅共用的建構函式——訊息/線索/加好友三種通知外觀完全一樣
    // (圖示+標題+內文,點下去消失並觸發對應動作),只有圖示、標題、位置
    // (className 決定,見 phone-boot.css 的 .jh-notif--visible 位移量)、
    // 點擊後的行為不一樣,不用各自重複一份建立 DOM + 計時器的邏輯。
    function createNotifBanner({ id, className, icon, title, onClick }) {
      const el = document.createElement("div");
      el.id = id;
      el.className = className ? "jh-notif " + className : "jh-notif";
      el.innerHTML = `
        <div class="jh-notif__icon">${icon}</div>
        <div class="jh-notif__text">
          <div class="jh-notif__title">${title}</div>
          <div class="jh-notif__body" id="${id}-body"></div>
        </div>
      `;
      document.body.appendChild(el);
      const bodyEl = el.querySelector(".jh-notif__body");
      let timer = null;
      function hide() {
        el.classList.remove("jh-notif--visible");
        clearTimeout(timer);
      }
      function show(bodyText) {
        bodyEl.textContent = bodyText;
        el.classList.add("jh-notif--visible");
        clearTimeout(timer);
        timer = setTimeout(hide, 5000);
      }
      el.addEventListener("click", () => {
        hide();
        onClick();
      });
      return { show };
    }

    // 周妤傳來的一句話,快捷寫法(from 固定是 they)。
    function pushZY(id, text, href) {
      deliverPhoneEntry({ id, text, href, from: "them" });
    }

    // 各個提交型謎題「答對之後要做的事」——原本寫在各自的內容頁裡,現在確認
    // 這個動作整個搬進跟周妤的訊息串完成,所以「答對」的後續效果也一起搬過來
    // 這裡執行,key 對應的是 JHPhone.pushClue(...) 傳進來、那則中性系統提示的
    // id。答對之後的回覆才是周妤真正在講話(她是在回應玩家剛剛傳給她的東西,
    // 不是無中生有地已經知道答案)。
    const CLUE_REQUESTS = {
      ch0_ask: {
        onCorrect() {
          jhSet("ch0_done", true);
          notebookAdd("ch0_answer", "最後訊號其實是 19:41(原公告寫 17:32)", "xunren/correction.html");
          pushZY("ch0_zy_msg1", "……妳說得對,我剛剛又去看了一次,真的是 19:41。我已經把公告改了。");
          setTimeout(() => {
            // 密碼本身是純文字,不能整則都點得進去——不然玩家會分不清楚這則訊息是
            // 「告訴你密碼」還是「點這裡進去」。不另外附連結,她的帳號本來就找
            // 得到,不用周妤特地再遞一次。
            pushZY("ch0_zy_msg2", "對了——她的帳號有一組私人限定相簿要密碼才看得到,我把密碼傳給妳了:linxi0417。我一直沒敢自己點進去看,妳能不能幫我看看裡面有沒有什麼?");
          }, 900);
        },
      },
      ch1_ask: {
        onCorrect() {
          jhSet("ch1_done", true);
          // 這是玩家剛剛主動告訴她的新發現(她根本不知道那張照片裡藏著東西),
          // 第一反應該是驚訝,不是像系統提示一樣直接下指令。連結另外用一則
          // 「本身就是網址」的訊息傳,點下去才會真的跳轉,不要塞在句子中間
          // 讓玩家分不清楚哪裡是連結。
          pushZY("ch1_zy_msg1", "等等——照片裡真的藏著這個?");
          setTimeout(() => {
            pushZY("ch1_zy_msg2", "編號只到 #18_……她該不會一直在找一張光碟吧。我把她手機書籤裡的『找碟』資料夾傳給妳,妳自己看看她都存了什麼。");
          }, 900);
          setTimeout(() => {
            pushZY("ch1_zy_msg3", "market.tw/bookmarks", "market/bookmarks.html");
          }, 1500);
        },
      },
    };

    // 快捷回覆:跟上面的 CLUE_REQUESTS(多選、可能選錯)不一樣,這種情境是玩家
    // 在內容頁被動拿到一句「已經幫她編輯好」的回覆,沒有選擇的餘地、也沒有答錯
    // 這回事,回訊息串裡只是等玩家自己按下傳送——對應 JHPhone.pushQuickReply(...),
    // key 是傳進來的 id,onSend() 是玩家按下傳送之後才觸發的效果(周妤看到這句話
    // 之後的反應),不是一打開就自動發生。
    const QUICK_REPLIES = {
      ch2_quickreply: {
        onSend() {
          jhSet("ch2_done", true);
          pushZY("ch2_zy_msg1", "……#188?兩年都沒人接手喔。");
          setTimeout(() => {
            pushZY("ch2_zy_msg2", "等我一下,我去翻一下晞晞手機裡的訊息記錄,看她是不是也跟這個賣家聊過。");
          }, 900);
          setTimeout(() => {
            pushZY("ch2_zy_msg2b", "……真的有,他們兩個聊過。我把對話記錄整理出來傳給妳。");
          }, 1800);
          setTimeout(() => {
            pushZY("ch2_zy_msg3", "message-export.local/thread", "chat/thread.html");
          }, 2400);
        },
      },
      ch3_quickreply: {
        onSend() {
          jhSet("ch3_done", true);
          pushZY("ch3_zy_msg1", "……回覆間隔都卡在 8 到 12 分鐘?這也太規律了吧。");
          setTimeout(() => {
            pushZY("ch3_zy_msg2", "我們把 8/14 那天,一件一件重新弄清楚。");
          }, 900);
          setTimeout(() => {
            pushZY("ch3_zy_msg3", "xun-lin-xi.github.io/xunren/rebuild-0814", "xunren/rebuild-0814.html");
          }, 1500);
        },
      },
      ch5_quickreply: {
        onSend() {
          jhSet("ch5_done", true);
          pushZY("ch5_zy_msg1", "……同一個人?這種細節妳都能抓出來。");
          setTimeout(() => {
            pushZY("ch5_zy_msg2", "我這邊還有一個東西給妳看,是我從他那邊拿到的。");
          }, 900);
          setTimeout(() => {
            pushZY("ch5_zy_msg3", "file:///C:/Users/rec_1029/收藏/", "files/collection.html");
          }, 1500);
        },
      },
    };

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
        // 訊息 App 如果正開著某一則對話串,返回鍵要先退回聯絡人清單(跟點
        // 左上角的←是一樣的行為),不能直接整個關掉——不然玩家會覺得按一下
        // 返回鍵就直接被彈回主畫面,而不是回到上一層清單。
        if (current === "messages" && messagesEl.classList.contains("jh-messages--thread-open")) {
          messagesEl.classList.remove("jh-messages--thread-open");
          currentThreadContactId = null;
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
    // 社交媒體/二手平台這兩張是動態的——跟真正手機的多工畫面一樣,只列出
    // 玩家實際開過的 App,一開始不存在,玩家逛過對應板塊之後才會出現
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
      // 每次打開才重新檢查——玩家可能是這次瀏覽期間才第一次逛到社交媒體/
      // 二手平台,卡片要跟著即時出現,不是進站當下就定死。
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
    // 社交媒體/購物網現在各自有自己專屬的分頁卡片、各記各的「上次逛到哪裡」,
    // 所以「網站」這張卡片不該再停在那兩個板塊裡——玩家如果正在社交媒體(或
    // 購物網)裡面,點「網站」應該要回到協尋網站本身(home.html),而不是留在
    // 原地什麼都沒變。如果本來就在協尋網站的其他一般頁面,點「網站」維持原樣、
    // 只是收起多工畫面而已,不用被迫跳回首頁。
    function isOnAppTabPage() {
      try {
        const parts = frame.contentWindow.location.pathname.split("/").filter(Boolean);
        return parts.some((seg) => seg === "social" || seg === "market");
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
    // 社交媒體/二手平台這兩張卡片,點下去要跳回玩家上次逛到的那一頁(不是每次
    // 都回到最起始頁),才符合「多工切換」的直覺——跟切回訊息/備忘錄保留原本
    // 畫面是同一個道理。社交媒體平常第一次點進來,預設頁是別人動態的首頁牆
    // (social/feed.html),不是直接跳到林晞的帳號——跟真的打開一個社群 App
    // 一樣先看到首頁,不是先看到某個特定的人。
    function openAppTab(kind, defaultUrl) {
      closeAllPanelsForSwitch();
      enterApp();
      const url = jhGet("app_" + kind + "_last_url", defaultUrl);
      try { frame.contentWindow.location.href = url; } catch (e) {}
    }
    document.getElementById("jh-recents-social").addEventListener("click", () => openAppTab("social", "social/feed.html"));
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
          <button type="button" class="jh-boot__app jh-boot__app--social" id="jh-boot-social">
            <span class="jh-boot__app-icon">📱</span>
            <span class="jh-boot__app-label">社交媒體</span>
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

    // 主畫面的「瀏覽器」圖示原本只有 enterApp(),沒有跟多工畫面的「網站」卡片
    // 一樣先檢查 isOnAppTabPage()——玩家如果先逛過社交媒體/二手平台,iframe
    // 還停在那個板塊,直接點「瀏覽器」會看到上次逛到的社交媒體畫面,而不是
    // 協尋網站本身。跟多工畫面那顆卡片一樣,在社交媒體/二手平台板塊裡的話
    // 先導回 home.html,才是玩家點「瀏覽器」真正期待看到的畫面。
    document.getElementById("jh-boot-browser").addEventListener("click", () => {
      if (isOnAppTabPage()) {
        try { frame.contentWindow.location.href = "home.html"; } catch (e) {}
      }
      enterApp();
    });
    // 主畫面「社交媒體」圖示是真正能點的入口(取代原本只會抖動的裝飾用
    // 「相簿」圖示)——跟多工畫面的社交媒體分頁卡片共用同一個 openAppTab,
    // 平常點進去預設看到動態牆(social/feed.html),逛過之後點回來則是
    // 跳回上次逛到的那一頁。
    document.getElementById("jh-boot-social").addEventListener("click", () => openAppTab("social", "social/feed.html"));
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

    // 通知橫幅是唯一一個「跳過多工畫面、直接開訊息面板」的入口(z-index
    // 2000,不管背後開著什麼都點得到)——如果備忘錄當時剛好開著,不先收
    // 乾淨的話,訊息面板會在備忘錄底下默默打開,備忘錄 z-index 比較高會
    // 繼續蓋著,畫面上完全看不出點了有反應,玩家會以為卡住了。
    const messageNotif = createNotifBanner({
      id: "jh-notif",
      icon: "💬",
      title: ZY_NAME,
      onClick: () => {
        closeAllPanelsForSwitch();
        openMessages(ZY_ID);
      },
    });

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
      // 周妤在玩家去她的訊息帳號頁(xunren/correction.html)加她好友之前,
      // 不會出現在聯絡人清單裡——開頭手機裡本來就有的家人朋友不受影響,
      // 周妤要玩家自己主動加過好友才會「加進」通訊錄,跟真實手機認識新
      // 朋友的順序一樣,不是她單方面知道要來找你。
      const rows = [
        ...(zyFriended() ? [{ id: ZY_ID, name: ZY_NAME, color: "#4a6fa5", unread }] : []),
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
          // closeMessages() 只有在「訊息面板本來就是被瀏覽器內容打斷跳出來的」
          // 情境下才會連帶 hideHomeScreen()——如果玩家是從主畫面點進訊息 App
          // 看到這則連結,messagesOpenedFromBrowser 是 false,單靠 closeMessages()
          // 關閉面板後畫面會停在主畫面,看不到剛剛其實已經在背後導頁完成的
          // iframe 內容。點連結訊息的動作本身就是「去看這個網頁」,不管訊息
          // App 是怎麼打開的,都該直接進到瀏覽器畫面,所以這裡不管前面的狀態,
          // 直接強制收起主畫面。
          hideHomeScreen();
        });
      }
      return el;
    }

    // 線索確認題:不是周妤主動傳訊息問「妳看到的是不是這個」——她沒有理由
    // 已經知道玩家剛剛在哪頁發現了什麼。這裡改成中性的系統提示(置中、灰字,
    // 不套訊息泡泡樣式,不算任何一方講的話),底下接一塊線索選擇器(重用內容頁
    // 那套 JHClueSystem,靠上面補的 window.JHNotebook 讀到已蒐集的線索)。玩家
    // 從自己蒐集到的線索裡挑一則,自己選擇要不要傳給她確認——「確認」這件事
    // 發生在私訊裡,但發起的人是玩家,不是周妤。
    function mountClueWidget(entry) {
      const wrap = document.createElement("div");
      wrap.className = "jh-messages__clue-widget";
      threadBodyEl.appendChild(wrap);
      JHClueSystem.mount({
        root: wrap,
        expectedId: entry.clue.expectedId,
        wrongMessage: entry.clue.wrongMessage,
        onCorrect: (clue) => resolveClueRequest(entry, clue, wrap),
      });
    }

    function resolveClueRequest(entry, clue, wrap) {
      // 這則訊息裡的線索題標記成已回答——重開對話串就不會再看到可以互動的
      // 選擇器,只留下當初送出的那句回覆(下面用一則普通的"me"訊息記錄)。
      const log = phoneLog();
      const found = log.find((m) => m.id === entry.id);
      if (found && found.clue) found.clue.resolved = true;
      jhSet("phone_log", log);
      wrap.remove();

      deliverPhoneEntry({ id: entry.id + "_me", text: clue.text, from: "me" });

      const handler = CLUE_REQUESTS[entry.id];
      if (handler && typeof handler.onCorrect === "function") handler.onCorrect();
    }

    // 快捷回覆卡片:內容頁被動拿到線索的當下,已經幫玩家把要回給周妤的話編輯
    // 好了,訊息串裡只用一張卡片預覽這句話 + 一顆「傳送」按鈕,不需要像
    // CLUE_REQUESTS 那樣挑選/可能選錯——按下去才會真的變成一則"me"的訊息。
    function mountQuickReplyWidget(entry) {
      const wrap = document.createElement("div");
      wrap.className = "jh-messages__quickreply";
      const label = document.createElement("div");
      label.className = "jh-messages__quickreply-label";
      label.textContent = "已編輯好回覆,傳送給周妤:";
      const draft = document.createElement("div");
      draft.className = "jh-messages__quickreply-draft";
      draft.textContent = entry.text;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "jh-messages__quickreply-send";
      btn.textContent = "傳送";
      wrap.appendChild(label);
      wrap.appendChild(draft);
      wrap.appendChild(btn);
      threadBodyEl.appendChild(wrap);
      btn.addEventListener("click", () => resolveQuickReply(entry, wrap));
    }

    function resolveQuickReply(entry, wrap) {
      // 標記成已傳送——重開對話串就不會再看到可以互動的卡片,只留下送出後
      // 那則真正的"me"訊息(下面用另一個 id 記錄,跟草稿卡片本身分開)。
      const log = phoneLog();
      const found = log.find((m) => m.id === entry.id);
      if (found && found.quickReply) found.quickReply.resolved = true;
      jhSet("phone_log", log);
      wrap.remove();

      deliverPhoneEntry({ id: entry.id + "_sent", text: entry.text, from: "me" });

      const handler = QUICK_REPLIES[entry.id];
      if (handler && typeof handler.onSend === "function") handler.onSend();
    }

    function appendThreadEntry(entry) {
      if (entry.clue) {
        // 中性提示,不是任何一方的發言——不套 .jh-messages__bubble,才不會
        // 讓人以為是周妤自己說的話。
        const note = document.createElement("div");
        note.className = "jh-messages__system-note";
        note.textContent = entry.text;
        threadBodyEl.appendChild(note);
        if (!entry.clue.resolved) mountClueWidget(entry);
        return;
      }
      if (entry.quickReply) {
        // 已經傳送過的草稿不用再畫出來——送出當下已經另外記錄成一則真正的
        // "me"訊息(entry.id + "_sent"),重開對話串會看到那則,不是這張卡片。
        if (!entry.quickReply.resolved) mountQuickReplyWidget(entry);
        return;
      }
      threadBodyEl.appendChild(bubble(entry.text, entry.from || "them", entry.href));
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
          log.forEach((m) => appendThreadEntry(m));
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

    // ── iframe 裡任何一頁呼叫 window.top.jhReceiveMessage(...)/
    // jhReceiveClueRequest(...) 都會進來這裡。from 預設是"them"(周妤傳來的,
    // 會跳通知橫幅);玩家自己回覆的"me"訊息不用跳通知打斷自己,直接視為已讀
    // 就好。兩種訊息共用同一套「存進 log→即時顯示或跳通知」邏輯,差別只在
    // entry 有沒有帶 clue 欄位。 ──
    function deliverPhoneEntry(entry) {
      const log = phoneLog();
      if (log.some((m) => m.id === entry.id)) return;
      log.push(entry);
      jhSet("phone_log", log);

      // 玩家正開著跟周妤的對話串的話,新訊息直接接到後面顯示、標成已讀,不用等
      // 重新打開才看得到,也不用為了自己正在看的對話跳通知橫幅打斷自己。
      const threadIsOpenOnZY = currentThreadContactId === ZY_ID && messagesEl.classList.contains("jh-messages--open");
      if (threadIsOpenOnZY) {
        jhSet("phone_read_ids", [...readIds(), entry.id]);
        renderBadge();
        renderContacts();
        appendThreadEntry(entry);
        threadBodyEl.scrollTop = threadBodyEl.scrollHeight;
        return;
      }

      if (entry.from === "me") {
        jhSet("phone_read_ids", [...readIds(), entry.id]);
        renderBadge();
        renderContacts();
        return;
      }

      // 線索確認題是中性的系統提示,不是周妤講的話——不跳這個掛她名字、她
      // 頭像的「周妤傳訊息給你」橫幅(會誤導成是她在講話),但訊息 App 角標
      // 還是照樣增加(不標成已讀),玩家自己找時間去訊息裡看就好。
      if (entry.clue) {
        renderBadge();
        renderContacts();
        return;
      }

      // 快捷回覆卡片是幫玩家編輯好、等玩家自己按傳送的草稿,不是周妤傳來的
      // 訊息——同樣不跳她名字的通知橫幅,只更新角標,玩家自己找時間去看。
      if (entry.quickReply) {
        renderBadge();
        renderContacts();
        return;
      }

      renderBadge();
      messageNotif.show(entry.text);
    }
    window.jhReceiveMessage = function jhReceiveMessage(id, text, href, from) {
      deliverPhoneEntry({ id, text, href, from: from === "me" ? "me" : "them" });
    };
    window.jhReceiveClueRequest = function jhReceiveClueRequest(id, text, expectedId, wrongMessage) {
      deliverPhoneEntry({
        id,
        text,
        href: null,
        from: "them",
        clue: { expectedId, wrongMessage, resolved: false },
      });
    };
    window.jhReceiveQuickReply = function jhReceiveQuickReply(id, draftText) {
      deliverPhoneEntry({
        id,
        text: draftText,
        href: null,
        from: "them",
        quickReply: { resolved: false },
      });
    };
    // 玩家在她的訊息帳號頁(xunren/correction.html)點「加好友」時呼叫——
    // 只是把她加進通訊錄,不會生出任何一則訊息(不然又會變成「莫名其妙就
    // 有一句她的話」)。之前在別的頁面已經存進 phone_log 的內容(如果有)
    // 這時候會一起冒出來,角標也會反映出來,再跳一個通知橫幅引導玩家去看
    // 訊息(friendNotif 定義在下面,但這裡呼叫得到——同一個 mount() 函式裡,
    // 變數宣告雖然不會提升,但這個函式本身只在點擊「加好友」按鈕時才會被
    // 呼叫,那一定是在 mount() 整個執行完、頁面已經可以互動之後,所以沒有
    // 「還沒定義就用到」的問題)。
    window.jhAddZYFriend = function jhAddZYFriend() {
      if (zyFriended()) return;
      jhSet("zy_friend_added", true);
      renderBadge();
      renderContacts();
      friendNotif.show("周妤・點一下前往訊息");
    };

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

    // 讓搬進訊息串裡的線索模組(見下面的 CLUE_REQUESTS/JHClueSystem)可以直接
    // 讀到已蒐集的線索——殼層本身不是走 iframe 那一套 notebook.js,補一個同
    // 名的全域物件給 clue-system.js 用,介面跟內容頁那份完全一樣。
    window.JHNotebook = { all: () => notebookList() };

    function notebookAdd(id, text, href) {
      const list = notebookList();
      if (list.some((e) => e.id === id)) return;
      list.push({ id, text, href, t: Date.now() });
      jhSet("notebook", list);
      renderNotesBadge();
    }

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
          // 跟訊息串裡點連結訊息同樣的道理——不管備忘錄是怎麼打開的,點一則
          // 事項就是要去看那個頁面,不能停在主畫面看不到已經導頁完成的內容。
          hideHomeScreen();
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

    // 線索通知橫幅:iframe 裡任何一頁呼叫 JHNotebook.add(...) 新增一筆
    // *還沒記錄過* 的線索時,會跳出這個橫幅(跟其他通知錯開位置,不會疊在
    // 一起),點一下直接開備忘錄查看剛蒐集到的那則線索。
    const clueNotif = createNotifBanner({
      id: "jh-clue-notif",
      className: "jh-clue-notif",
      icon: "📝",
      title: "已記錄新線索",
      onClick: () => {
        closeAllPanelsForSwitch();
        openNotes();
      },
    });
    window.jhClueNotify = function jhClueNotify(text) {
      renderNotesBadge();
      clueNotif.show(text);
    };

    // 加好友通知橫幅:玩家在她的訊息帳號頁(xunren/correction.html)點
    // 「加好友」之後,跳這個橫幅引導去看訊息,點一下直接開她的對話串。
    const friendNotif = createNotifBanner({
      id: "jh-friend-notif",
      className: "jh-friend-notif",
      icon: "👥",
      title: "已加入好友",
      onClick: () => {
        closeAllPanelsForSwitch();
        openMessages(ZY_ID);
      },
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
