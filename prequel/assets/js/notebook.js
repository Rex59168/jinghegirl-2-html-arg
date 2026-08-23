// notebook.js — 筆記本:玩家看過的關鍵事實,永不清空,可跳回原始頁面
const JHNotebook = (() => {
  function all() {
    return JH.get("notebook", []);
  }

  function add(id, text, href) {
    const list = all();
    if (list.some((e) => e.id === id)) return;
    list.push({ id, text, href, t: Date.now() });
    JH.set("notebook", list);
    refreshBadge();
  }

  function refreshBadge() {
    const btn = document.getElementById("jh-notebook-btn");
    if (!btn) return;
    const n = all().length;
    const badge = btn.querySelector(".jh-nb-badge");
    if (badge) badge.textContent = n > 0 ? String(n) : "";
  }

  function render() {
    const list = all();
    const body = document.getElementById("jh-notebook-body");
    if (!body) return;
    if (list.length === 0) {
      body.innerHTML = '<p class="jh-nb-empty">還沒有已知事項。繼續往下看。</p>';
      return;
    }
    body.innerHTML =
      "<ul class='jh-nb-list'>" +
      list
        .map(
          (e) =>
            `<li><a href="${e.href}">${e.text}</a></li>`
        )
        .join("") +
      "</ul>";
  }

  function mount() {
    if (document.getElementById("jh-notebook-btn")) return;

    const btn = document.createElement("button");
    btn.id = "jh-notebook-btn";
    btn.className = "jh-notebook-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "打開筆記本");
    btn.innerHTML = '筆記本 <span class="jh-nb-badge"></span>';

    const backdrop = document.createElement("div");
    backdrop.className = "drawer-backdrop";
    backdrop.id = "jh-notebook-backdrop";

    const panel = document.createElement("div");
    panel.className = "jh-notebook-panel";
    panel.id = "jh-notebook-panel";
    panel.innerHTML = `
      <div class="jh-nb-header">
        <strong>【已知】</strong>
        <button type="button" class="jh-nb-close" aria-label="關閉筆記本">✕</button>
      </div>
      <div id="jh-notebook-body"></div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    function open() {
      render();
      backdrop.classList.add("open");
      panel.classList.add("open");
    }
    function close() {
      backdrop.classList.remove("open");
      panel.classList.remove("open");
    }

    btn.addEventListener("click", open);
    backdrop.addEventListener("click", close);
    panel.querySelector(".jh-nb-close").addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "n" || e.key === "N") {
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
        open();
      }
    });

    refreshBadge();
  }

  document.addEventListener("DOMContentLoaded", mount);

  return { add, all, mount };
})();
