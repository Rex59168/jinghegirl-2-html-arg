/* stats.js — GoatCounter 進站/結局人數統計,失敗不影響網站本身 */
const JH_STATS = (() => {
  const CODE = "rex59168";
  const BASE = `https://${CODE}.goatcounter.com`;

  function ensureLoaded(cb) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        cb();
        return;
      }
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://gc.zgo.at/count.js";
      s.dataset.goatcounter = BASE + "/count";
      s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
      s.onload = () => {
        try { cb(); } catch (e) { /* noop */ }
      };
      document.head.appendChild(s);
    } catch (e) { /* noop */ }
  }

  function fireOnce(flagKey, path, title) {
    try {
      if (JH.get(flagKey)) return;
      ensureLoaded(() => {
        if (window.goatcounter && window.goatcounter.count) {
          window.goatcounter.count({ path, title, event: true });
          JH.set(flagKey, true);
        }
      });
    } catch (e) { /* noop */ }
  }

  function fetchCount(path) {
    return fetch(`${BASE}/counter/${path}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || typeof data.count !== "string") return null;
        const n = parseInt(data.count.replace(/[^\d]/g, ""), 10);
        return Number.isFinite(n) ? n : null;
      })
      .catch(() => null);
  }

  return {
    trackEntered() { fireOnce("stats_entered_sent", "/entered", "進站"); },
    trackEnding() { fireOnce("stats_ending_sent", "/ending-reached", "抵達結局"); },
    getEnteredCount() { return fetchCount("/entered"); },
    getEndingCount() { return fetchCount("/ending-reached"); },
  };
})();
