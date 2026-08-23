// notebook.js — 純資料層:玩家看過的關鍵事實,永不清空。實際的「備忘錄」UI
// (清單面板、角標)現在都在殼層(shell.js)那邊,主畫面的備忘錄 App 圖示點進去
// 看,這裡只負責寫資料,並透過 window.top.jhRefreshNotesBadge() 通知殼層即時
// 更新角標數字(同源,可以直接跨框呼叫)。
const JHNotebook = (() => {
  function all() {
    return JH.get("notebook", []);
  }

  function add(id, text, href) {
    const list = all();
    if (list.some((e) => e.id === id)) return;
    list.push({ id, text, href, t: Date.now() });
    JH.set("notebook", list);
    try {
      if (window.top && typeof window.top.jhRefreshNotesBadge === "function") {
        window.top.jhRefreshNotesBadge();
      }
    } catch (e) {}
  }

  return { add, all };
})();
