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
  // pushClue — 提交型謎題現在不在網頁上做確認,而是搬進跟周妤的私訊裡:
  // 訊息串裡只會出現一句中性提示(不是她主動問——她沒理由已經知道玩家剛剛
  // 發現了什麼),玩家自己決定要不要從蒐集到的線索裡挑一則傳給她。這裡只
  // 負責把「有這件事可以做了」轉交給殼層,實際的選擇器 UI 跟答對/答錯的
  // 判斷都在殼層的訊息串裡完成(見 shell.js 的 CLUE_REQUESTS)。
  pushClue(id, text, expectedId, wrongMessage) {
    try {
      if (window.top && typeof window.top.jhReceiveClueRequest === "function") {
        window.top.jhReceiveClueRequest(id, text, expectedId, wrongMessage);
      }
    } catch (e) {}
  },
  // addZYFriend — 周妤不是一開始就在通訊錄裡:玩家要先在她的訊息帳號頁
  // (xunren/correction.html)主動加她好友,她才會出現在訊息 App 的聯絡人
  // 清單裡。在那之前任何一頁記下的線索確認提示都還是會存進訊息紀錄,只是
  // 要等加了好友才看得到。
  addZYFriend() {
    try {
      if (window.top && typeof window.top.jhAddZYFriend === "function") {
        window.top.jhAddZYFriend();
      }
    } catch (e) {}
  },
};
