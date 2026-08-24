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
  // pushClue — 提交型謎題現在不在網頁上做確認,而是由周妤在私訊裡直接問「妳
  // 看到的是不是這個」,玩家從自己蒐集到的線索裡挑一則回覆她。這裡只負責把
  // 「周妤要問這件事了」轉交給殼層,實際的選擇器 UI 跟答對/答錯的判斷都在
  // 殼層的訊息串裡完成(見 shell.js 的 CLUE_REQUESTS)。
  pushClue(id, text, expectedId, wrongMessage) {
    try {
      if (window.top && typeof window.top.jhReceiveClueRequest === "function") {
        window.top.jhReceiveClueRequest(id, text, expectedId, wrongMessage);
      }
    } catch (e) {}
  },
};
