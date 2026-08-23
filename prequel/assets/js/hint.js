// hint.js — 周妤的手機:右下角圖示,平常主動傳「下一步」訊息,
// 卡關的頁面(設定 window.JH_HINTS = [tier1, tier2, tier3])也能點進去問她。
const JHHint = (() => {
  let revealed = 0;
  let idleTimer = null;
  let msgsEl = null;
  let btnEl = null;
  let panelOpen = false;

  function log() {
    return JH.get("phone_log", []);
  }
  function readCount() {
    return JH.get("phone_read_count", 0);
  }

  function renderBadge() {
    if (!btnEl) return;
    const unread = log().length - readCount();
    let badge = btnEl.querySelector(".jh-phone-badge");
    if (unread > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "jh-phone-badge";
        btnEl.appendChild(badge);
      }
      badge.textContent = String(unread);
    } else if (badge) {
      badge.remove();
    }
  }

  function addMsgEl(text, href) {
    if (!msgsEl) return;
    const p = document.createElement(href ? "a" : "p");
    p.className = "jh-hint-msg";
    if (href) {
      p.href = href;
      p.style.display = "block";
      p.style.textDecoration = "none";
    }
    p.textContent = text;
    msgsEl.appendChild(p);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function mount() {
    btnEl = document.createElement("button");
    btnEl.id = "jh-hint-btn";
    btnEl.className = "jh-hint-btn";
    btnEl.type = "button";
    btnEl.setAttribute("aria-label", "周妤傳訊息給你");
    btnEl.textContent = "📱";

    const panel = document.createElement("div");
    panel.className = "jh-hint-panel";
    panel.id = "jh-hint-panel";
    const hints = window.JH_HINTS;
    panel.innerHTML = `
      <div class="jh-hint-header">
        <strong>周妤</strong>
        <button type="button" class="jh-hint-close" aria-label="關閉">✕</button>
      </div>
      <div class="jh-hint-msgs" id="jh-hint-msgs"></div>
      ${hints && hints.length ? '<button type="button" class="jh-hint-ask" id="jh-hint-ask">問問她</button>' : ""}
    `;

    document.body.appendChild(btnEl);
    document.body.appendChild(panel);
    msgsEl = panel.querySelector("#jh-hint-msgs");
    const askBtn = panel.querySelector("#jh-hint-ask");

    // 先把她之前傳過的訊息(跨頁面持續存在)畫出來
    log().forEach((m) => addMsgEl(m.text, m.href));
    renderBadge();

    function reveal() {
      if (!hints || revealed >= hints.length) return;
      addMsgEl(hints[revealed]);
      revealed++;
      resetIdle();
      if (revealed >= hints.length) {
        askBtn.disabled = true;
        askBtn.textContent = "（沒有更多了）";
      }
    }

    function open() {
      panel.classList.add("open");
      panelOpen = true;
      if (hints && revealed === 0 && log().length === 0) {
        addMsgEl("……怎麼了?卡住了嗎?");
      }
      JH.set("phone_read_count", log().length);
      renderBadge();
    }
    function close() {
      panel.classList.remove("open");
      panelOpen = false;
    }

    btnEl.addEventListener("click", () => (panelOpen ? close() : open()));
    panel.querySelector(".jh-hint-close").addEventListener("click", close);
    if (askBtn) askBtn.addEventListener("click", reveal);

    // 卡關 3 分鐘,周妤主動傳第 1 層提示(僅限有謎題提示的頁面)
    function resetIdle() {
      if (!hints) return;
      clearTimeout(idleTimer);
      if (revealed > 0) return;
      idleTimer = setTimeout(() => {
        if (revealed === 0) {
          open();
          reveal();
          btnEl.classList.add("jh-hint-nudge");
        }
      }, 180000);
    }

    if (hints) {
      ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
        window.addEventListener(ev, resetIdle, { passive: true })
      );
      resetIdle();
    }
  }

  // 供各頁面呼叫:周妤主動傳一則「下一步」訊息。
  // id 用來避免重複推播;href 可省略(純聊天,不導向任何頁面)。
  function push(id, text, href) {
    const current = log();
    if (current.some((m) => m.id === id)) return;
    current.push({ id, text, href });
    JH.set("phone_log", current);
    if (msgsEl) {
      addMsgEl(text, href);
      renderBadge();
      btnEl.classList.add("jh-hint-nudge");
      setTimeout(() => btnEl && btnEl.classList.remove("jh-hint-nudge"), 3000);
    }
  }

  document.addEventListener("DOMContentLoaded", mount);
  return { mount, push };
})();

const JHPhone = { push: (id, text, href) => JHHint.push(id, text, href) };
