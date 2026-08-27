// social-likes.js — 貼文/限動的按讚互動:點愛心圖示切換已讚/未讚,套用跟 IG
// 一樣的彈跳回饋動畫;貼文照片雙擊也會觸發同一套效果(比照 IG 雙擊大頭貼
// 快速按讚的習慣)。純前端視覺互動,不用跟 JHNotebook/JHPhone 系統打交道,
// 也不存進 localStorage——重新整理就會回到原本的讚數,才符合「這只是玩家
// 順手滑過去按的」的份量,不是需要被記錄的線索行為。
//
// 用事件代理(監聽整個 document)而不是逐一綁定,是因為 feed.html/rec1029.html
// 這類頁面的貼文卡片是頁面載入後才用 JS 動態組出來的,代理可以不管貼文是
// 什麼時候被加進 DOM 都吃得到點擊。
(function () {
  function pop(el) {
    el.classList.remove("ig-like-pop");
    void el.offsetWidth; // 強制 reflow,讓移除/加回同一個 class 能重新觸發動畫
    el.classList.add("ig-like-pop");
  }

  // 讚數直接讀「目前顯示的數字」做加減,不用另外存一份基準值——這樣即使
  // 某些頁面自己的恐怖層腳本在載入時把顯示數字偷偷改過(例如林昭舊帳號那則
  // 貼文,重訪時讚數偶爾會跟記憶中的不一樣),按讚/收回還是會以「畫面上
  // 現在看到的數字」為準做加減,不會被那層恐怖效果影響。
  function toggleLike(btn) {
    const liked = btn.classList.toggle("liked");
    btn.textContent = liked ? "♥" : "♡";
    pop(btn);
    const scope = btn.closest(".ig-post, .card, .story-viewer");
    const countEl = scope && scope.querySelector(".ig-like-count");
    if (countEl) {
      const current = parseInt(countEl.textContent, 10) || 0;
      countEl.textContent = String(liked ? current + 1 : current - 1);
    }
    return liked;
  }

  function showBigHeart(photo) {
    const heart = document.createElement("div");
    heart.className = "ig-double-tap-heart";
    heart.textContent = "♥";
    photo.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".ig-like-btn");
    if (!btn) return;
    toggleLike(btn);
  });

  // 雙擊貼文照片=按讚,跟 IG 一樣;已經讚過的話雙擊只重播愛心動畫,不會
  // 因為連續雙擊一直加來加去。
  document.addEventListener("dblclick", (e) => {
    const photo = e.target.closest(".ig-photo");
    if (!photo) return;
    const scope = photo.closest(".ig-post, .card");
    const likeBtn = scope && scope.querySelector(".ig-like-btn");
    if (likeBtn && !likeBtn.classList.contains("liked")) toggleLike(likeBtn);
    showBigHeart(photo);
  });
})();
