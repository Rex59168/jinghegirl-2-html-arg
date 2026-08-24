// clue-system.js — 線索模組:把玩家已經蒐集到的事實(JHNotebook 的紀錄)包成
// 可以拖曳/點選提交的「線索模組」,取代原本每個提交型謎題各自寫一份文字輸入
// 表單的做法。玩家從已蒐集的線索裡挑出自己覺得相關的那一個交出去,系統只
// 判斷「是不是那個對的線索」——答錯有十秒冷卻,不能無限亂猜答案。
// 「確認」這個動作本身不發生在任何一頁內容頁上——只在殼層(prequel/index.html)
// 跟周妤的訊息串裡掛載(見 shell.js 的 CLUE_REQUESTS/mountClueWidget),靠
// window.JHNotebook 這個殼層補的同名全域物件讀到已蒐集的線索。以後新的
// 提交型謎題也都應該走這一套:內容頁只負責用 JHNotebook.add(...) 記下發現、
// 用 JHPhone.pushClue(...) 請周妤在訊息裡發問,不用再各自做一塊面板。
const JHClueSystem = (() => {
  const COOLDOWN_MS = 10000;
  const DEFAULT_WRONG_MESSAGE = "這則線索好像不太對。";
  const DEFAULT_EMPTY_MESSAGE = "妳還沒有蒐集到任何線索。";
  const DEFAULT_PLACEHOLDER = "把線索拖到這裡,或點選一則線索";

  function allClues() {
    return typeof JHNotebook !== "undefined" ? JHNotebook.all() : [];
  }

  // opts:
  //   root         — 掛載用的容器元素
  //   expectedId   — 正確線索的 JHNotebook id
  //   wrongMessage — 答錯時顯示的提示(選填)
  //   onCorrect(clue) — 答對之後執行的動作
  function mount(opts) {
    const root = opts.root;
    const expectedId = opts.expectedId;
    const wrongMessage = opts.wrongMessage || DEFAULT_WRONG_MESSAGE;
    const onCorrect = opts.onCorrect || function () {};

    let selected = null;
    let cooldownUntil = 0;
    let cooldownTimer = null;

    root.innerHTML = `
      <div class="clue-slot" id="jhcs-slot">
        <span class="clue-slot__placeholder">${DEFAULT_PLACEHOLDER}</span>
      </div>
      <p class="err" id="jhcs-err"></p>
      <p class="clue-actions">
        <button type="button" class="btn btn--secondary" id="jhcs-picker-btn">選擇線索</button>
        <button type="button" class="btn" id="jhcs-submit-btn" disabled>提供線索</button>
      </p>
      <div class="clue-picker__backdrop" id="jhcs-backdrop"></div>
      <div class="clue-picker" id="jhcs-picker">
        <div class="clue-picker__header">
          <strong>已儲存的線索</strong>
          <button type="button" class="clue-picker__close" id="jhcs-picker-close" aria-label="關閉">✕</button>
        </div>
        <div class="clue-picker__list" id="jhcs-picker-list"></div>
      </div>
    `;

    const slotEl = root.querySelector("#jhcs-slot");
    const errEl = root.querySelector("#jhcs-err");
    const pickerBtn = root.querySelector("#jhcs-picker-btn");
    const submitBtn = root.querySelector("#jhcs-submit-btn");
    const backdrop = root.querySelector("#jhcs-backdrop");
    const picker = root.querySelector("#jhcs-picker");
    const pickerClose = root.querySelector("#jhcs-picker-close");
    const pickerList = root.querySelector("#jhcs-picker-list");

    function renderPicker() {
      const clues = allClues();
      pickerList.innerHTML = "";
      if (!clues.length) {
        const p = document.createElement("p");
        p.className = "clue-picker__empty";
        p.textContent = DEFAULT_EMPTY_MESSAGE;
        pickerList.appendChild(p);
        return;
      }
      clues.forEach((clue) => {
        const chip = document.createElement("div");
        chip.className = "clue-chip";
        chip.textContent = clue.text;
        chip.draggable = true;
        chip.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", clue.id);
          e.dataTransfer.effectAllowed = "copy";
        });
        chip.addEventListener("click", () => {
          selectClue(clue);
          closePicker();
        });
        pickerList.appendChild(chip);
      });
    }

    function openPicker() {
      renderPicker();
      picker.classList.add("clue-picker--open");
      backdrop.classList.add("clue-picker__backdrop--open");
    }
    function closePicker() {
      picker.classList.remove("clue-picker--open");
      backdrop.classList.remove("clue-picker__backdrop--open");
    }

    function selectClue(clue) {
      selected = clue;
      slotEl.classList.add("clue-slot--filled");
      slotEl.innerHTML = "";
      const chip = document.createElement("div");
      chip.className = "clue-chip clue-chip--slotted";
      chip.textContent = clue.text;
      slotEl.appendChild(chip);
      if (Date.now() >= cooldownUntil) errEl.textContent = "";
      updateSubmitState();
    }

    function clearSlot() {
      selected = null;
      slotEl.classList.remove("clue-slot--filled");
      slotEl.innerHTML = `<span class="clue-slot__placeholder">${DEFAULT_PLACEHOLDER}</span>`;
      updateSubmitState();
    }

    function updateSubmitState() {
      submitBtn.disabled = !selected || Date.now() < cooldownUntil;
    }

    function tickCooldown() {
      const remain = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (remain <= 0) {
        clearTimeout(cooldownTimer);
        errEl.textContent = "";
        updateSubmitState();
        return;
      }
      errEl.textContent = wrongMessage + `(還要等 ${remain} 秒才能再交一次)`;
      cooldownTimer = setTimeout(tickCooldown, 250);
    }

    pickerBtn.addEventListener("click", () => {
      if (picker.classList.contains("clue-picker--open")) closePicker();
      else openPicker();
    });
    pickerClose.addEventListener("click", closePicker);
    backdrop.addEventListener("click", closePicker);

    slotEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      slotEl.classList.add("clue-slot--dragover");
    });
    slotEl.addEventListener("dragleave", () => slotEl.classList.remove("clue-slot--dragover"));
    slotEl.addEventListener("drop", (e) => {
      e.preventDefault();
      slotEl.classList.remove("clue-slot--dragover");
      if (Date.now() < cooldownUntil) return;
      const id = e.dataTransfer.getData("text/plain");
      const clue = allClues().find((c) => c.id === id);
      if (clue) selectClue(clue);
    });

    submitBtn.addEventListener("click", () => {
      if (!selected || Date.now() < cooldownUntil) return;
      const submitted = selected;
      if (submitted.id === expectedId) {
        errEl.textContent = "";
        onCorrect(submitted);
        return;
      }
      cooldownUntil = Date.now() + COOLDOWN_MS;
      clearSlot();
      tickCooldown();
    });
  }

  return { mount };
})();
