// hint.js — 周妤傳訊息的橋接:iframe 裡的每一頁呼叫 JHPhone.push(...),實際的訊息
// App(聯絡人清單、對話串、頂部通知橫幅)現在都在殼層(shell.js)那邊,這裡只負責
// 把訊息轉交給殼層(同源,可以直接跨框呼叫 window.top)。
//
// 另外保留一個很陽春的「卡關提示」:設定 window.JH_HINTS = [tier1, tier2, tier3]
// 的頁面,閒置 3 分鐘會在頁面下方冒出一個小按鈕,點開就地顯示提示,不再是獨立的
// 浮動視窗——這個機制單純是解謎輔助,跟「周妤傳訊息」是兩件事,不算劇情對話。
const JHPhone = {
  push(id, text, href) {
    try {
      if (window.top && typeof window.top.jhReceiveMessage === "function") {
        window.top.jhReceiveMessage(id, text, href);
      }
    } catch (e) {}
  },
};

(function mountStuckHint() {
  const hints = window.JH_HINTS;
  if (!hints || !hints.length) return;

  let revealed = 0;
  let idleTimer = null;
  let wrapEl = null;
  let listEl = null;
  let btnEl = null;

  function ensureUI() {
    if (wrapEl) return;
    wrapEl = document.createElement("div");
    wrapEl.className = "jh-stuck-hint";
    wrapEl.innerHTML = `
      <div class="jh-stuck-hint__list" id="jh-stuck-list"></div>
      <button type="button" class="jh-stuck-hint__btn" id="jh-stuck-btn">卡住了嗎?問問周妤</button>
    `;
    document.body.appendChild(wrapEl);
    listEl = wrapEl.querySelector("#jh-stuck-list");
    btnEl = wrapEl.querySelector("#jh-stuck-btn");
    btnEl.addEventListener("click", reveal);
  }

  function reveal() {
    ensureUI();
    if (revealed >= hints.length) return;
    const p = document.createElement("p");
    p.className = "jh-stuck-hint__msg";
    p.textContent = hints[revealed];
    listEl.appendChild(p);
    revealed++;
    if (revealed >= hints.length) {
      btnEl.disabled = true;
      btnEl.textContent = "（沒有更多提示了）";
    } else {
      btnEl.textContent = "再問一次";
    }
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    if (revealed > 0) return;
    idleTimer = setTimeout(() => {
      if (revealed === 0) reveal();
    }, 180000);
  }

  ["click", "keydown", "touchstart", "scroll"].forEach((ev) =>
    window.addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
