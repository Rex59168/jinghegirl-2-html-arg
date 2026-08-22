import { store } from './store.js';
import { t } from './i18n.js';
import * as flags from './flags.js';
import { navigate } from './router.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

export function renderWalk(content, locale, container) {
  container.innerHTML = '';
  const root = el('div', 'walk');
  container.appendChild(root);

  let step = 0;

  const audioKey = new Audio('audio/door_key.wav');
  const audioHinge = new Audio('audio/door_hinge.wav');
  audioKey.preload = 'auto';
  audioHinge.preload = 'auto';
  let muted = false;

  const muteBtn = el('button', 'walk__mute', t(content.labels.mute, locale));
  muteBtn.type = 'button';
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    audioKey.muted = muted;
    audioHinge.muted = muted;
    muteBtn.textContent = t(content.labels[muted ? 'unmute' : 'mute'], locale);
  });
  document.body.appendChild(muteBtn);

  function unlockAudio() {
    [audioKey, audioHinge].forEach((a) => {
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
      a.pause();
      a.currentTime = 0;
    });
  }

  function cleanup() {
    muteBtn.remove();
    document.querySelectorAll('.endgame-black, .endgame-red').forEach((n) => n.remove());
    window.removeEventListener('hashchange', cleanup);
  }
  window.addEventListener('hashchange', cleanup, { once: true });

  function clearRoot() {
    root.innerHTML = '';
  }

  function continueButton(onClick) {
    const btn = el('button', 'choice__btn', t(content.labels.continue, locale));
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
      renderIntroStep(t(content.walk.steps[step], locale));
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
    const lines = content.walk.lines.map((l) => t(l, locale));
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
    root.appendChild(el('p', 'walk__question', t(content.walk.question, locale)));
    const choiceWrap = el('div', 'choice');
    root.appendChild(choiceWrap);

    let regrowTimer = null;
    let revertTimer = null;

    const yesBtn = el('button', 'choice__btn', t(content.walk.yes, locale));
    yesBtn.type = 'button';
    yesBtn.dataset.state = 'yes';
    choiceWrap.appendChild(yesBtn);

    const noBtn = el('button', 'choice__btn', t(content.walk.no, locale));
    noBtn.type = 'button';
    noBtn.dataset.state = 'no';
    choiceWrap.appendChild(noBtn);

    function handleClick(e) {
      unlockAudio();
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
          const regrown = el('button', 'choice__btn', t(content.walk.no, locale));
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
        btn.textContent = t(content.walk.refusedText, locale);
        revertTimer = setTimeout(() => {
          btn.disabled = false;
          btn.textContent = t(content.walk.yes, locale);
          btn.dataset.state = 'yes';
        }, 3000);
        return;
      }
    }

    yesBtn.addEventListener('click', handleClick);
    noBtn.addEventListener('click', handleClick);
  }

  function safePlay(audio, duration) {
    return new Promise((resolve) => {
      try {
        audio.currentTime = 0;
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {
        /* ignore missing/blocked audio, timing still advances */
      }
      setTimeout(resolve, duration);
    });
  }

  function runDoor() {
    clearRoot();
    const overlay = el('div', 'endgame-black');
    document.body.appendChild(overlay);

    safePlay(audioKey, 3000)
      .then(() => safePlay(audioHinge, 1000))
      .then(() => new Promise((resolve) => setTimeout(resolve, 1000)))
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
      const stamp = el('p', 'endgame-red__stamp', t(content.endgame.stampLabel, locale) + `${y}/${m}/${d}`);
      stamp.style.opacity = '0';
      overlay.appendChild(stamp);
      requestAnimationFrame(() => {
        stamp.style.opacity = '1';
      });
    }, 4000);

    setTimeout(() => {
      flags.markFinished();
      cleanup();
      navigate('/gone');
    }, 5000);
  }

  runStep();
}
