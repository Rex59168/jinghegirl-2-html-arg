import { store } from './store.js';
import { t } from './i18n.js';
import * as flags from './flags.js';
import { LABELS } from './labels.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function renderWalk(walk, locale, container) {
  container.innerHTML = '';
  const root = el('div', 'walk');
  container.appendChild(root);

  let step = 0;

  function cleanup() {
    document.querySelectorAll('.endgame-black, .endgame-red').forEach((n) => n.remove());
  }

  function clearRoot() {
    root.innerHTML = '';
  }

  function continueButton(onClick) {
    const btn = el('button', 'choice__btn', t(LABELS.continue, locale));
    btn.type = 'button';
    btn.addEventListener('click', onClick);
    return btn;
  }

  function advance() {
    step += 1;
    runStep();
  }

  function runStep() {
    if (step >= 0 && step <= 3) {
      renderIntroStep(t(walk.steps[step], locale));
    } else if (step === 4) {
      renderWalkLines();
    } else if (step === 5) {
      renderChoice();
    } else if (step === 6) {
      runDoor();
    } else if (step === 7) {
      runRed();
    }
  }

  function renderIntroStep(text) {
    clearRoot();
    root.appendChild(el('p', 'walk__line', text));
    root.appendChild(continueButton(() => advance()));
  }

  function renderWalkLines() {
    clearRoot();
    const lines = walk.lines.map((l) => t(l, locale));
    const nodes = lines.map((text) => {
      const p = el('p', 'walk__line', text);
      p.style.opacity = '0';
      root.appendChild(p);
      return p;
    });
    nodes.forEach((p, i) => {
      setTimeout(() => {
        p.style.opacity = '1';
      }, i * 1200);
    });
    setTimeout(() => {
      root.appendChild(continueButton(() => advance()));
    }, lines.length * 1200 + 200);
  }

  function renderChoice() {
    clearRoot();
    root.appendChild(el('p', 'walk__question', t(walk.question, locale)));
    const choiceWrap = el('div', 'choice');
    root.appendChild(choiceWrap);

    let regrowTimer = null;
    let revertTimer = null;

    const yesBtn = el('button', 'choice__btn', t(walk.yes, locale));
    yesBtn.type = 'button';
    yesBtn.dataset.state = 'yes';
    choiceWrap.appendChild(yesBtn);

    const noBtn = el('button', 'choice__btn', t(walk.no, locale));
    noBtn.type = 'button';
    noBtn.dataset.state = 'no';
    choiceWrap.appendChild(noBtn);

    function handleClick(e) {
      const btn = e.currentTarget;
      const state = btn.dataset.state;

      if (state === 'yes') {
        if (regrowTimer) clearTimeout(regrowTimer);
        if (revertTimer) clearTimeout(revertTimer);
        choiceWrap.querySelectorAll('button').forEach((b) => b.removeEventListener('click', handleClick));
        advance();
        return;
      }

      if (state === 'no') {
        store.set('refusedCount', 1);
        btn.remove();
        regrowTimer = setTimeout(() => {
          const regrown = el('button', 'choice__btn', t(walk.no, locale));
          regrown.type = 'button';
          regrown.dataset.state = 'no2';
          regrown.addEventListener('click', handleClick);
          choiceWrap.appendChild(regrown);
        }, 6000);
        return;
      }

      if (state === 'no2') {
        store.set('refusedCount', 2);
        btn.dataset.state = 'locked';
        btn.disabled = true;
        btn.textContent = t(walk.refusedText, locale);
        revertTimer = setTimeout(() => {
          btn.disabled = false;
          btn.textContent = t(walk.yes, locale);
          btn.dataset.state = 'yes';
        }, 3000);
        return;
      }
    }

    yesBtn.addEventListener('click', handleClick);
    noBtn.addEventListener('click', handleClick);
  }

  function wait(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  function runDoor() {
    clearRoot();
    const overlay = el('div', 'endgame-black');
    const crack = el('div', 'endgame-black__crack');
    overlay.appendChild(crack);
    document.body.appendChild(overlay);

    crack.classList.add('endgame-black__crack--click');
    wait(3000)
      .then(() => {
        crack.classList.remove('endgame-black__crack--click');
        crack.classList.add('endgame-black__crack--open');
        return wait(1000);
      })
      .then(() => wait(1000))
      .then(() => {
        overlay.remove();
        step = 7;
        runStep();
      });
  }

  function runRed() {
    const overlay = el('div', 'endgame-red');
    document.body.appendChild(overlay);

    setTimeout(() => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const stamp = el('p', 'endgame-red__stamp', t(walk.stampLabel, locale) + `${y}/${m}/${d}`);
      stamp.style.opacity = '0';
      overlay.appendChild(stamp);
      requestAnimationFrame(() => {
        stamp.style.opacity = '1';
      });
    }, 4000);

    setTimeout(() => {
      flags.markFinished();
      cleanup();
      location.href = 'gone.html';
    }, 5000);
  }

  runStep();
}
