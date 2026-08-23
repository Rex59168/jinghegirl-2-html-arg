// hint.js — 周妤傳訊息的橋接:iframe 裡的每一頁呼叫 JHPhone.push(...),實際的訊息
// App(聯絡人清單、對話串、頂部通知橫幅)都在殼層(shell.js)那邊,這裡只負責把
// 訊息轉交給殼層(同源,可以直接跨框呼叫 window.top)。from 預設是"them"(周妤傳
// 來的),頁面也可以送出玩家自己回覆的"me"訊息(例如確認找到某個東西時,做成
// 「回訊息給周妤」而不是單純的系統按鈕)。
const JHPhone = {
  push(id, text, href, from) {
    try {
      if (window.top && typeof window.top.jhReceiveMessage === "function") {
        window.top.jhReceiveMessage(id, text, href, from);
      }
    } catch (e) {}
  },
};
