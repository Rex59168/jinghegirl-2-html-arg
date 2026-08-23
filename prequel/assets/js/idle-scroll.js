// idle-scroll.js — 恐怖層:閒置 90 秒後,畫面自己往下捲動一點點
(function () {
  let idleTimer = null;
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      window.scrollBy({ top: 80, behavior: "smooth" });
    }, 90000);
  }
  ["click", "keydown", "touchstart", "mousemove"].forEach((ev) =>
    window.addEventListener(ev, resetIdle, { passive: true })
  );
  resetIdle();
})();
