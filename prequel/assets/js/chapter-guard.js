// chapter-guard.js — 只擋「超前」存取(直接打網址跳過還沒解鎖的章節會被導回首頁)
// 已解鎖的舊頁面完全不受影響,仍可自由回頭複習
(() => {
  const need = document.body.dataset.requires;
  if (!need) return;
  if (!JH.get(need)) {
    location.href = "index.html";
  }
})();
