// share-card.js — 終幕分享卡:純前端 canvas 產生,不含任何謎題答案
const JHShareCard = (() => {
  // canvas 畫出來的是圖片像素,不是 DOM 文字節點,i18n.js 的翻譯引擎完全碰不到,
  // 所以這裡自己依語言挑文字。
  const STRINGS = {
    "zh-Hant": {
      kicker: "靖河市協尋案",
      spent: "我花了",
      nickname: (n) => `暱稱:${n}`,
      tagline: "你以為網路上的陌生人不了解你。",
      footer: "",
      sec: (n) => `${n} 秒`,
      min: (n) => `${n} 分鐘`,
      hm: (h, m) => (m > 0 ? `${h} 小時 ${m} 分鐘` : `${h} 小時`),
    },
    "zh-Hans": {
      kicker: "靖河市协寻案",
      spent: "我花了",
      nickname: (n) => `昵称:${n}`,
      tagline: "你以为网路上的陌生人不了解你。",
      footer: "",
      sec: (n) => `${n} 秒`,
      min: (n) => `${n} 分钟`,
      hm: (h, m) => (m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`),
    },
    en: {
      kicker: "Jinghe City Missing Persons Case",
      spent: "I spent",
      nickname: (n) => `Nickname: ${n}`,
      tagline: "You thought a stranger online didn't know you.",
      footer: "",
      sec: (n) => `${n} sec`,
      min: (n) => `${n} min`,
      hm: (h, m) => (m > 0 ? `${h}h ${m}m` : `${h}h`),
    },
  };

  function formatElapsed(ms, lang) {
    const s = STRINGS[lang] || STRINGS["zh-Hant"];
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return s.sec(totalSeconds);
    const totalMinutes = Math.round(totalSeconds / 60);
    if (totalMinutes < 60) return s.min(totalMinutes);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return s.hm(h, m);
  }

  function draw(canvas, { elapsedMs, nickname, siteHost, lang }) {
    lang = lang || (typeof JH_I18N !== "undefined" ? JH_I18N.getLang() : "zh-Hant");
    const s = STRINGS[lang] || STRINGS["zh-Hant"];
    const W = 1080, H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#050505");
    grad.addColorStop(1, "#151515");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.textAlign = "center";

    ctx.fillStyle = "#8a8a8a";
    ctx.font = "32px -apple-system, 'PingFang TC', sans-serif";
    ctx.fillText(s.kicker, W / 2, 160);

    ctx.fillStyle = "#555";
    ctx.font = "24px -apple-system, 'PingFang TC', sans-serif";
    ctx.fillText("xun-lin-xi", W / 2, 205);

    // 檔案卡片
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(120, 420, W - 240, 340);

    ctx.fillStyle = "#e8e8e8";
    ctx.font = "bold 56px 'SFMono-Regular', Consolas, monospace";
    ctx.fillText("013.txt", W / 2, 500);

    ctx.fillStyle = "#9fc7ff";
    ctx.font = "30px -apple-system, 'PingFang TC', sans-serif";
    ctx.fillText(s.spent, W / 2, 590);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 64px -apple-system, 'PingFang TC', sans-serif";
    ctx.fillText(formatElapsed(elapsedMs, lang), W / 2, 665);

    ctx.fillStyle = "#777";
    ctx.font = "26px -apple-system, 'PingFang TC', sans-serif";
    const nickLine = nickname ? s.nickname(nickname) : "";
    if (nickLine) ctx.fillText(nickLine, W / 2, 720);

    ctx.fillStyle = "#666";
    ctx.font = "24px -apple-system, 'PingFang TC', sans-serif";
    wrapText(ctx, s.tagline, W / 2, 850, W - 200, 34);

    if (s.footer) {
      ctx.fillStyle = "#444";
      ctx.font = "20px -apple-system, 'PingFang TC', sans-serif";
      ctx.fillText(s.footer, W / 2, H - 130);
    }
    if (siteHost) {
      ctx.fillStyle = "#555";
      ctx.font = "22px -apple-system, 'PingFang TC', sans-serif";
      ctx.fillText(siteHost, W / 2, H - 90);
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split("");
    let line = "";
    let lines = [];
    chars.forEach((c) => {
      const test = line + c;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = c;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
  }

  function download(canvas, filename) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "013.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }, "image/png");
  }

  return { draw, download, formatElapsed };
})();
