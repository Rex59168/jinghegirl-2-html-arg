// entry-warning.js — 進站一次性警語彈窗:只在第一次到訪時出現,按下繼續後永遠不再顯示
(() => {
  if (JH.get("warning_seen")) return;

  const TITLE = "內容提醒";
  const BODY = "本站故事情節含失蹤、跟蹤等令人不安的描寫,為虛構創作,建議 15 歲以上瀏覽。如你正處於類似的真實處境,請撥打 110 / 113 尋求協助。";
  const HELP_LINK_TEXT = "→ 查看完整求助資訊";
  const CONTINUE = "我了解,繼續";

  function mount() {
    const overlay = document.createElement("div");
    overlay.className = "entry-warning";
    const box = document.createElement("div");
    box.className = "entry-warning__box";
    const title = document.createElement("h2");
    title.className = "entry-warning__title";
    title.textContent = TITLE;
    const body = document.createElement("p");
    body.className = "entry-warning__body";
    body.textContent = BODY;
    const helpLink = document.createElement("a");
    helpLink.className = "entry-warning__help-link";
    helpLink.href = "resources/help.html";
    helpLink.textContent = HELP_LINK_TEXT;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "entry-warning__continue";
    btn.textContent = CONTINUE;
    box.appendChild(title);
    box.appendChild(body);
    box.appendChild(helpLink);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    btn.addEventListener(
      "click",
      () => {
        JH.set("warning_seen", true);
        overlay.remove();
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
