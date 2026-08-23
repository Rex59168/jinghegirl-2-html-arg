// ambient.js — 恐怖層 #1:離開分頁 30 秒以上,分頁標題偷偷變成「還在嗎？」
(function () {
  const ORIGINAL_TITLE = document.title;
  let hiddenSince = null;
  let revertTimer = null;

  // 分頁標題不在 document.body 裡,i18n.js 的文字節點遍歷碰不到,所以這裡自己判斷語言。
  function scareTitle() {
    const lang = typeof JH_I18N !== "undefined" ? JH_I18N.getLang() : "zh-Hant";
    if (lang === "en") return "Still there?";
    if (lang === "zh-Hans") return "还在吗?";
    return "還在嗎?";
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hiddenSince = Date.now();
    } else {
      if (hiddenSince && Date.now() - hiddenSince >= 30000) {
        document.title = scareTitle();
        clearTimeout(revertTimer);
        revertTimer = setTimeout(() => {
          document.title = ORIGINAL_TITLE;
        }, 4000);
      }
      hiddenSince = null;
    }
  });

  // 頁面隱藏期間也直接改標題,讓分頁列表本身就顯示異狀
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    setTimeout(() => {
      if (document.hidden) document.title = scareTitle();
    }, 30000);
  });
})();
