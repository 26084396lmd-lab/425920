/* =========================================================
   烬的生日花园 · interactions
   handmade for Jin, by Li Mingda · 2026.10.29
   ========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const rand = (min, max) => min + Math.random() * (max - min);
  const pad = (n) => String(n).padStart(2, "0");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const body = document.body;
  const intro = $("#intro");

  /* =========================================================
     PHOTOS
     ========================================================= */

  const PHOTOS = [
    { n: "01", w: 1124, h: 1500, caption: "绿衣小仙，落在我心上" },
    { n: "06", w: 1126, h: 1500, caption: "像从童话里借来的白裙" },
    { n: "07", w: 1125, h: 1500, caption: "镜子里最好看的，永远是你" },
    { n: "14", w: 1126, h: 1500, caption: "红沙发上的小猫，今天归我" },
    { n: "08", w: 1125, h: 1500, caption: "星星耳坠，没有你的眼睛亮" },
    { n: "15", w: 1126, h: 1500, caption: "围裙一系，人间烟火都甜" },
    { n: "16", w: 1076, h: 1436, caption: "短发也很酷，酷得让我心动" },
    { n: "20", w: 1125, h: 1500, caption: "毛线帽和冬天，都想抱你" },
    { n: "19", w: 1500, h: 844, caption: "比个耶，先牵为敬" },
    { n: "21", w: 576, h: 1014, caption: "把光穿在身上的女孩" },
    { n: "17", w: 1125, h: 1500, caption: "逆光里，你还是最亮" },
    { n: "04", w: 1125, h: 1500, caption: "你一嘟嘴，世界先投降" },
    { n: "05", w: 961, h: 1280, caption: "蓝格子，和等你的夜晚" },
    { n: "09", w: 1125, h: 1500, caption: "帽子压不住的好看" },
    { n: "11", w: 720, h: 1280, caption: "平安扣，扣住岁岁平安" },
    { n: "18", w: 1500, h: 1500, caption: "镜头记得，我也记得" },
    { n: "03", w: 960, h: 1162, caption: "连头发丝都有自己的想法" },
    { n: "13", w: 1126, h: 1500, caption: "睫毛上落了一点光" },
    { n: "02", w: 960, h: 1280, caption: "灯光很暗，眼睛很亮" },
    { n: "10", w: 1124, h: 1500, caption: "这双眼睛，我记了很久" },
    { n: "12", w: 1125, h: 1500, caption: "夜色再深，也藏不住你" }
  ];

  /* =========================================================
     AUDIO · a tiny music box, no external files
     ========================================================= */

  const audio = (() => {
    let ctx = null;
    let master = null;
    let playing = false;
    let timer = null;
    let nextBar = 0;
    let melodyPlayed = false;

    const FREQ = {
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99
    };

    // Happy Birthday, arranged as a slow music box.
    const BIRTHDAY = [
      ["G4", 0.0, 0.7], ["G4", 0.75, 0.25], ["A4", 1.0, 0.9], ["G4", 1.9, 0.9],
      ["C5", 2.8, 0.9], ["B4", 3.7, 1.5],
      ["G4", 5.3, 0.7], ["G4", 6.05, 0.25], ["A4", 6.3, 0.9], ["G4", 7.2, 0.9],
      ["D5", 8.1, 0.9], ["C5", 9.0, 1.5],
      ["G4", 10.6, 0.7], ["G4", 11.35, 0.25], ["G5", 11.6, 0.9], ["E5", 12.5, 0.9],
      ["C5", 13.4, 0.9], ["B4", 14.3, 0.9], ["A4", 15.2, 0.9],
      ["F5", 16.4, 0.7], ["F5", 17.15, 0.25], ["E5", 17.4, 0.9], ["C5", 18.3, 0.9],
      ["D5", 19.2, 0.9], ["C5", 20.1, 2.1]
    ];

    const CHORDS = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 392.0]
    ];

    const SPARKLES = [523.25, 587.33, 659.25, 783.99, 880.0, 987.77, 1046.5];

    function ensure() {
      if (ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
        return true;
      } catch (err) {
        ctx = null;
        return false;
      }
    }

    function note(freq, when, dur, gain = 0.05, type = "sine") {
      if (!ctx || !master) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(gain, when + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g);
      g.connect(master);
      o.start(when);
      o.stop(when + dur + 0.06);

      // A quiet upper harmonic gives it a music-box shimmer.
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = "triangle";
      o2.frequency.value = freq * 2.004;
      g2.gain.setValueAtTime(0.0001, when);
      g2.gain.linearRampToValueAtTime(gain * 0.16, when + 0.012);
      g2.gain.exponentialRampToValueAtTime(0.0001, when + dur * 0.75);
      o2.connect(g2);
      g2.connect(master);
      o2.start(when);
      o2.stop(when + dur + 0.06);
    }

    function melody() {
      if (!ctx) return;
      const t = ctx.currentTime + 0.22;
      BIRTHDAY.forEach(([name, start, dur]) => {
        note(FREQ[name], t + start, dur * 1.55, 0.043, "sine");
      });
      note(130.81, t + 0.1, 4.2, 0.014, "sine");
      note(174.61, t + 9.0, 4.2, 0.014, "sine");
      note(196.0, t + 16.4, 4.2, 0.014, "sine");
    }

    function ambientBar(t) {
      if (!ctx) return;
      const chord = CHORDS[Math.floor(Math.random() * CHORDS.length)];
      chord.forEach((f, i) => {
        note(f, t + i * 0.42, 4.6, 0.018, "sine");
      });
      const sparkleCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < sparkleCount; i += 1) {
        const f = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
        note(f, t + 1.1 + i * 2.2 + rand(-0.2, 0.4), 1.8, 0.012, "sine");
      }
    }

    function schedule() {
      if (!playing || !ctx) return;
      if (nextBar < ctx.currentTime - 1) nextBar = ctx.currentTime + 0.4;
      let guard = 0;
      while (nextBar < ctx.currentTime + 1.5 && guard < 4) {
        ambientBar(nextBar);
        nextBar += 8.2;
        guard += 1;
      }
    }

    function start(withMelody = true) {
      if (!ensure()) return false;
      if (playing) return true;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      playing = true;

      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0.55, now, 0.45);

      if (withMelody && !melodyPlayed) {
        melody();
        melodyPlayed = true;
        nextBar = now + 25;
      } else {
        nextBar = now + 0.6;
      }

      clearInterval(timer);
      schedule();
      timer = window.setInterval(schedule, 700);
      return true;
    }

    function stop() {
      playing = false;
      clearInterval(timer);
      timer = null;
      if (ctx && master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0.0001, now, 0.18);
      }
    }

    function toggle() {
      if (playing) {
        stop();
        return false;
      }
      return start(true);
    }

    function noise(duration, frequency, gainValue = 0.14, type = "bandpass") {
      if (!ctx || !master) return;
      const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        const fade = 1 - i / length;
        data[i] = (Math.random() * 2 - 1) * fade * fade;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      filter.Q.value = 0.75;
      const g = ctx.createGain();
      g.gain.value = gainValue;
      source.connect(filter);
      filter.connect(g);
      g.connect(master);
      source.start();
    }

    function sfx(kind) {
      if (!playing || !ctx) return;
      const t = ctx.currentTime + 0.02;
      if (kind === "plant") {
        [392.0, 523.25, 659.25].forEach((f, i) => note(f, t + i * 0.075, 1.1, 0.024));
      } else if (kind === "wish") {
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => note(f, t + i * 0.1, 1.8, 0.028));
      } else if (kind === "blow") {
        noise(0.55, 700, 0.13, "bandpass");
      } else if (kind === "paper") {
        noise(0.32, 1900, 0.055, "highpass");
      } else if (kind === "spark") {
        [659.25, 987.77].forEach((f, i) => note(f, t + i * 0.08, 1.2, 0.02));
      } else if (kind === "tap") {
        note(880, t, 0.5, 0.012);
      }
    }

    return {
      start,
      stop,
      toggle,
      sfx,
      isPlaying: () => playing
    };
  })();

  /* =========================================================
     SOUND UI
     ========================================================= */

  const soundBtn = $("#soundBtn");

  function syncSound() {
    const on = audio.isPlaying();
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.setAttribute("aria-label", on ? "关闭音乐" : "打开音乐");
    body.classList.toggle("music-on", on);
  }

  soundBtn.addEventListener("click", () => {
    const wasPlaying = audio.isPlaying();
    const ok = audio.toggle();
    syncSound();
    if (!wasPlaying && !ok) {
      toast("这个浏览器好像不太会唱歌，但花园还开着。");
    }
  });

  /* =========================================================
     INTRO
     ========================================================= */

  let entered = false;

  function enter(withMusic) {
    if (entered) return;
    entered = true;
    intro.classList.add("is-blooming");
    body.classList.add("entered");

    if (withMusic) {
      const ok = audio.start(true);
      syncSound();
      if (!ok) toast("声音没有打开，不过今天的花照样开。");
    }

    window.setTimeout(() => {
      intro.classList.add("is-gone");
      body.classList.remove("is-locked");
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ block: "start" });
      }
    }, 850);

    window.setTimeout(() => {
      intro.setAttribute("aria-hidden", "true");
      intro.style.display = "none";
    }, 1900);
  }

  $("#enterBtn").addEventListener("click", () => enter(true));
  $("#quietBtn").addEventListener("click", () => enter(false));

  /* =========================================================
     NAV / SCROLL
     ========================================================= */

  const nav = $("#nav");
  const navLinks = $("#navLinks");
  const menuBtn = $("#menuBtn");
  const scrollBar = $("#scrollBar");
  let scrollTicking = false;

  function closeMenu() {
    nav.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "打开菜单");
  }

  function toggleMenu() {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  }

  menuBtn.addEventListener("click", toggleMenu);
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target)) closeMenu();
  });

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
      scrollTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* =========================================================
     REVEAL ON SCROLL
     ========================================================= */

  $$(".reveal").forEach((el) => {
    const delay = Number(el.dataset.delay || 0);
    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  /* =========================================================
     FLOATING PETALS
     ========================================================= */

  (() => {
    const canvas = $("#petalCanvas");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#ffc7d8", "#f7a6bd", "#e6bd7a", "#fff1e3", "#d95f87", "#f4d9ab"];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let petals = [];
    let lastTime = performance.now();

    function makePetal() {
      return {
        x: rand(-20, width + 20),
        y: rand(-height, height),
        size: rand(2.4, 7.5),
        vy: rand(0.12, 0.42),
        vx: rand(-0.13, 0.13),
        phase: rand(0, Math.PI * 2),
        sway: rand(0.25, 0.8),
        spin: rand(-0.012, 0.012),
        rot: rand(0, Math.PI * 2),
        alpha: rand(0.14, 0.42),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        dot: Math.random() < 0.26
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 600 ? 16 : width < 1000 ? 24 : 32;
      petals = Array.from({ length: count }, makePetal);
    }

    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      const s = p.size;
      if (p.dot) {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.88, -s * 0.35, s * 0.65, s * 0.55, 0, s);
        ctx.bezierCurveTo(-s * 0.65, s * 0.55, -s * 0.88, -s * 0.35, 0, -s);
        ctx.fill();
      }
      ctx.restore();
    }

    function loop(now) {
      const delta = Math.min(40, now - lastTime) / 16.67;
      lastTime = now;
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.phase += 0.004 * delta;
        p.x += (p.vx + Math.sin(p.phase) * p.sway * 0.09) * delta;
        p.y += p.vy * delta;
        p.rot += p.spin * delta;

        if (p.y > height + 24) {
          p.y = -24;
          p.x = rand(-10, width + 10);
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        drawPetal(p);
      });

      window.requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    resize();
    window.requestAnimationFrame(loop);
  })();

  /* =========================================================
     DAY COUNTER + TEASE
     ========================================================= */

  const dayCount = $("#dayCount");
  let countStarted = false;

  function animateCount(target) {
    if (reduceMotion) {
      dayCount.textContent = String(target);
      return;
    }
    const duration = 1700;
    const started = performance.now();
    function tick(now) {
      const progress = clamp((now - started) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      dayCount.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
      else dayCount.textContent = String(target);
    }
    window.requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const dayObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countStarted) {
            countStarted = true;
            animateCount(814);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.22 }
    );
    dayObserver.observe($("#days"));
  } else {
    dayCount.textContent = "814";
  }

  const dayTease = $("#dayTease");
  const truthNote = $("#truthNote");

  dayTease.addEventListener("click", () => {
    const open = dayTease.getAttribute("aria-expanded") === "true";
    dayTease.setAttribute("aria-expanded", String(!open));
    if (open) {
      truthNote.hidden = true;
    } else {
      truthNote.hidden = false;
      audio.sfx("tap");
      window.setTimeout(() => {
        truthNote.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      }, 80);
    }
  });

  /* =========================================================
     TOAST
     ========================================================= */

  const toastEl = $("#toast");
  let toastTimer = null;

  function toast(message, duration = 3600) {
    toastEl.textContent = message;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-show");
    }, duration);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    toastEl.classList.remove("is-show");
  }

  /* =========================================================
     CONFETTI / PETAL BURSTS
     ========================================================= */

  const CONFETTI_COLORS = ["#f7a6bd", "#e86f98", "#ffc7d8", "#e6bd7a", "#f4d9ab", "#fff1e3", "#c94f7c"];

  function confettiPiece(container, x, y, mode = "fall") {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    const isHeart = Math.random() < 0.34;
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    if (isHeart) {
      piece.textContent = "♥";
      piece.style.color = color;
      piece.style.background = "transparent";
      piece.style.fontSize = `${rand(9, 16)}px`;
      piece.style.lineHeight = "1";
      piece.style.width = "auto";
      piece.style.height = "auto";
    } else {
      piece.style.background = color;
      piece.style.width = `${rand(5, 10)}px`;
      piece.style.height = `${rand(8, 16)}px`;
      piece.style.borderRadius = Math.random() < 0.35 ? "50%" : "2px";
    }

    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    container.appendChild(piece);

    let keyframes;
    let duration;
    if (mode === "page") {
      const angle = -Math.PI / 2 + rand(-0.85, 0.85);
      const force = rand(90, 290);
      const dx = Math.cos(angle) * force;
      const dy = Math.sin(angle) * force;
      const spin = rand(-480, 480);
      keyframes = [
        { transform: "translate3d(0,0,0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${spin * 0.55}deg) scale(0.95)`, opacity: 1, offset: 0.55 },
        { transform: `translate3d(${dx * 1.25}px, ${dy + 330}px, 0) rotate(${spin}deg) scale(0.7)`, opacity: 0 }
      ];
      duration = rand(1900, 3100);
    } else {
      keyframes = [
        { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate3d(${rand(-90, 90)}px, ${rand(200, 430)}px, 0) rotate(${rand(-360, 360)}deg)`, opacity: 0 }
      ];
      duration = rand(1800, 3000);
    }

    const animation = piece.animate(keyframes, {
      duration,
      delay: rand(0, 260),
      easing: "cubic-bezier(0.18, 0.7, 0.32, 1)",
      fill: "forwards"
    });
    animation.onfinish = () => piece.remove();
    return piece;
  }

  function pageBurst(originEl, count = 28) {
    if (!originEl) return;
    const layer = document.createElement("div");
    layer.className = "confetti-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    const rect = originEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height * 0.45;
    for (let i = 0; i < count; i += 1) {
      confettiPiece(layer, x + rand(-24, 24), y + rand(-16, 16), "page");
    }
    window.setTimeout(() => layer.remove(), 3800);
  }

  function cakeBurst(count = 38) {
    const container = $("#cakeConfetti");
    if (!container) return;
    const width = container.clientWidth;
    for (let i = 0; i < count; i += 1) {
      confettiPiece(container, rand(0, width), rand(-30, 40), "fall");
    }
  }

  /* =========================================================
     POND · plant a lotus in the mud
     ========================================================= */

  const pond = $("#pondStage");
  const pondLotuses = $("#pondLotuses");
  const pondNotes = $("#pondNotes");
  const pondCount = $("#pondCount");
  const pondFinal = $("#pondFinal");
  const pondHint = $("#pondHint");
  const plantBtn = $("#plantBtn");
  const pondReset = $("#pondReset");
  const pondPresetX = [17, 37, 58, 78, 48];

  const POND_NOTES = [
    "有些日子是泥，可你从来不是。",
    "我记得你所有的好，也记得你皱眉时，我有多想抱你。",
    "不愉快的那几天没有白过，它们教会我更用力地珍惜你。",
    "你叫烬，是火留下的余温；那我愿意做一直不熄灭的那点火。",
    "生日快乐，我的花。以后泥里也有我陪你。"
  ];

  const POND_PLACEHOLDERS = [
    "第一朵，等你种下。",
    "第二朵，还藏在泥里。",
    "第三朵，慢慢来。",
    "第四朵，别着急。",
    "第五朵，等你亲手种下。"
  ];

  let planted = 0;
  let pondComplete = false;
  let pondGeneration = 0;

  function addRipple(x, y) {
    const ripple = document.createElement("span");
    ripple.className = "pond-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    pond.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 1150);
  }

  function plantLotus(xPct, clientX, clientY) {
    if (planted >= 5) {
      addRipple(
        clientX != null ? clientX - pond.getBoundingClientRect().left : pond.clientWidth * 0.5,
        clientY != null ? clientY - pond.getBoundingClientRect().top : pond.clientHeight * 0.7
      );
      toast("花塘已经开满啦。想换一塘新的，点“重新种一塘”。");
      return;
    }

    const rect = pond.getBoundingClientRect();
    const x = clamp(xPct == null ? 50 : xPct, 11, 89);
    const rippleX = clientX != null ? clientX - rect.left : (rect.width * x) / 100;
    const rippleY = clientY != null ? clientY - rect.top : rect.height * 0.7;
    addRipple(rippleX, rippleY);

    const width = clamp(rect.width * 0.145, 84, 148) * rand(0.88, 1.08);
    const bottom = rand(1, 7);
    const rotation = rand(-6.5, 6.5);
    const index = planted;
    const generation = pondGeneration;

    const lotus = document.createElement("div");
    lotus.className = "pond-lotus";
    lotus.style.left = `${x}%`;
    lotus.style.bottom = `${bottom}%`;
    lotus.style.zIndex = String(6 + index);
    lotus.style.setProperty("--lotus-w", `${width}px`);
    lotus.style.setProperty("--rot", `${rotation}deg`);
    lotus.innerHTML =
      '<svg viewBox="0 0 140 220" aria-hidden="true"><use href="#lotusSymbol"></use></svg>';
    pondLotuses.appendChild(lotus);

    pond.classList.add("has-lotus");
    planted += 1;
    pondCount.textContent = String(planted);
    audio.sfx("plant");

    window.setTimeout(() => {
      if (generation !== pondGeneration) return;
      const note = pondNotes.querySelector(`li[data-note="${index}"]`);
      if (note) {
        const text = note.querySelector("p");
        if (text) text.textContent = POND_NOTES[index];
        note.classList.add("is-bloomed");
      }
    }, 520);

    if (planted === 5) {
      window.setTimeout(() => {
        if (generation !== pondGeneration || pondComplete) return;
        pondComplete = true;
        pondFinal.hidden = false;
        audio.sfx("wish");
        pageBurst(pondFinal, 28);
        toast("五朵莲开好了。烬，岁岁有我。", 4200);
      }, 1300);
    }
  }

  pond.addEventListener("click", (event) => {
    const rect = pond.getBoundingClientRect();
    const xPct = ((event.clientX - rect.left) / rect.width) * 100;
    plantLotus(xPct, event.clientX, event.clientY);
  });

  plantBtn.addEventListener("click", () => {
    if (pondComplete) {
      toast("已经开满五朵啦。要重新种，就点“重新种一塘”。");
      return;
    }
    const x = pondPresetX[planted] != null ? pondPresetX[planted] : 50;
    plantLotus(x, null, null);
  });

  pondReset.addEventListener("click", () => {
    pondGeneration += 1;
    planted = 0;
    pondComplete = false;
    pondLotuses.innerHTML = "";
    pondFinal.hidden = true;
    pond.classList.remove("has-lotus");
    pondCount.textContent = "0";
    $$("#pondNotes li").forEach((li, index) => {
      li.classList.remove("is-bloomed");
      const text = li.querySelector("p");
      if (text) text.textContent = POND_PLACEHOLDERS[index];
    });
    audio.sfx("tap");
    toast("花塘清空了。想再种几朵，我陪你。");
  });

  /* =========================================================
     CAKE · blow out the candles
     ========================================================= */

  const candles = $$(".candle");
  const cakeArt = $("#cakeArt");
  const cakeConfetti = $("#cakeConfetti");
  const blowBtn = $("#blowBtn");
  const blowBtnText = $("#blowBtnText");
  const wishCard = $("#wishCard");
  let celebrating = false;

  function isOut(candle) {
    return candle.classList.contains("is-out");
  }

  function setCandle(candle, out) {
    candle.classList.toggle("is-out", out);
    candle.setAttribute("aria-pressed", String(!out));
    const n = Number(candle.dataset.candle) + 1;
    candle.setAttribute("aria-label", out ? `第 ${n} 根蜡烛已吹灭` : `吹灭第 ${n} 根蜡烛`);
  }

  function allOut() {
    return candles.every(isOut);
  }

  function setCelebrating() {
    if (celebrating) return;
    celebrating = true;
    cakeArt.classList.add("is-celebrating");
    wishCard.classList.add("is-shown");
    blowBtnText.textContent = "再贪心一次，重新点亮";
    audio.sfx("wish");
    cakeBurst(46);
    toast("愿望收到啦。今天剩下的，只管开心。", 4300);
    window.setTimeout(() => cakeArt.classList.remove("is-celebrating"), 1400);
  }

  function relightAll() {
    celebrating = false;
    candles.forEach((candle) => setCandle(candle, false));
    wishCard.classList.remove("is-shown");
    blowBtnText.textContent = "替我吹灭蜡烛";
    cakeArt.classList.remove("is-celebrating");
    audio.sfx("spark");
    toast("蜡烛重新点上了。贪心一点也没关系。");
  }

  function blowAll() {
    if (celebrating) return;
    const lit = candles.filter((candle) => !isOut(candle));
    if (!lit.length) return;
    audio.sfx("blow");
    lit.forEach((candle, index) => {
      window.setTimeout(() => {
        setCandle(candle, true);
        if (index === lit.length - 1) {
          window.setTimeout(() => {
            if (allOut()) setCelebrating();
          }, 220);
        }
      }, index * 115);
    });
  }

  candles.forEach((candle) => {
    candle.addEventListener("click", () => {
      if (celebrating || isOut(candle)) return;
      setCandle(candle, true);
      audio.sfx("blow");
      window.setTimeout(() => {
        if (allOut()) setCelebrating();
      }, 260);
    });
  });

  blowBtn.addEventListener("click", () => {
    if (allOut()) {
      relightAll();
    } else {
      blowAll();
    }
  });

  /* =========================================================
     GALLERY · polaroids + lightbox
     ========================================================= */

  const galleryGrid = $("#galleryGrid");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxCount = $("#lightboxCount");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");
  const lightboxFigure = $(".lightbox__figure");
  let currentPhoto = 0;
  let lightboxOpen = false;
  let lastGalleryFocus = null;
  let touchStartX = 0;

  const tilts = [-1.1, 0.8, -0.6, 1.3, -0.8, 0.5, -1.3, 0.9, -0.4, 1.1, -0.9, 0.6];

  function renderGallery() {
    const markup = PHOTOS.map((photo, index) => {
      const tilt = tilts[index % tilts.length];
      return `
        <button class="polaroid" type="button" data-index="${index}" style="--tilt: ${tilt}deg" aria-label="查看照片 ${index + 1}：${photo.caption}">
          <span class="polaroid__imgwrap" style="aspect-ratio: ${photo.w} / ${photo.h}">
            <img src="assets/thumbs/${photo.n}.jpg" width="${photo.w}" height="${photo.h}" loading="lazy" decoding="async" alt="烬的自拍：${photo.caption}">
          </span>
          <span class="polaroid__caption">
            <span>${photo.caption}</span>
            <i>${pad(index + 1)} / ${PHOTOS.length}</i>
          </span>
        </button>
      `;
    }).join("");
    galleryGrid.innerHTML = markup;
  }

  function preload(index) {
    const photo = PHOTOS[(index + PHOTOS.length) % PHOTOS.length];
    const img = new Image();
    img.src = `assets/photos/${photo.n}.jpg`;
  }

  function showPhoto(index) {
    currentPhoto = (index + PHOTOS.length) % PHOTOS.length;
    const photo = PHOTOS[currentPhoto];
    lightboxImg.style.animation = "none";
    // Force a restart of the little fade so every photo feels newly opened.
    void lightboxImg.offsetWidth;
    lightboxImg.style.animation = "";
    lightboxImg.src = `assets/photos/${photo.n}.jpg`;
    lightboxImg.alt = `烬的自拍：${photo.caption}`;
    lightboxCaption.textContent = photo.caption;
    lightboxCount.textContent = `${pad(currentPhoto + 1)} / ${pad(PHOTOS.length)}`;
    preload(currentPhoto + 1);
    preload(currentPhoto - 1);
  }

  function openLightbox(index, trigger) {
    lastGalleryFocus = trigger || document.activeElement;
    hideToast();
    showPhoto(index);
    lightboxOpen = true;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
    window.setTimeout(() => lightboxClose.focus({ preventScroll: true }), 70);
  }

  function closeLightbox() {
    if (!lightboxOpen) return;
    lightboxOpen = false;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
    if (lastGalleryFocus && typeof lastGalleryFocus.focus === "function") {
      lastGalleryFocus.focus({ preventScroll: true });
    }
  }

  galleryGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".polaroid");
    if (!card) return;
    openLightbox(Number(card.dataset.index), card);
  });

  $("#randomPhoto").addEventListener("click", (event) => {
    let index = Math.floor(Math.random() * PHOTOS.length);
    if (index === currentPhoto) index = (index + 3) % PHOTOS.length;
    openLightbox(index, event.currentTarget);
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showPhoto(currentPhoto - 1));
  lightboxNext.addEventListener("click", () => showPhoto(currentPhoto + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightboxFigure.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightboxFigure.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 48) return;
      if (delta < 0) showPhoto(currentPhoto + 1);
      else showPhoto(currentPhoto - 1);
    },
    { passive: true }
  );

  renderGallery();

  /* =========================================================
     LETTER
     ========================================================= */

  const letterModal = $("#letterModal");
  const letterPaper = $("#letterPaper");
  const envelope = $("#envelope");
  const openLetterBtn = $("#openLetterBtn");
  const closeLetterBtn = $("#closeLetterBtn");
  let letterOpen = false;
  let lastLetterFocus = null;

  function openLetter(trigger) {
    if (letterOpen) return;
    letterOpen = true;
    lastLetterFocus = trigger || document.activeElement;
    hideToast();
    letterPaper.scrollTop = 0;
    letterModal.classList.add("is-open");
    letterModal.setAttribute("aria-hidden", "false");
    envelope.setAttribute("aria-expanded", "true");
    body.classList.add("no-scroll");
    audio.sfx("paper");
    window.setTimeout(() => closeLetterBtn.focus({ preventScroll: true }), 150);
  }

  function closeLetter() {
    if (!letterOpen) return;
    letterOpen = false;
    letterModal.classList.remove("is-open");
    letterModal.setAttribute("aria-hidden", "true");
    envelope.setAttribute("aria-expanded", "false");
    body.classList.remove("no-scroll");
    if (lastLetterFocus && typeof lastLetterFocus.focus === "function") {
      lastLetterFocus.focus({ preventScroll: true });
    }
  }

  envelope.addEventListener("click", () => openLetter(envelope));
  openLetterBtn.addEventListener("click", () => openLetter(openLetterBtn));
  closeLetterBtn.addEventListener("click", closeLetter);
  $("[data-close-letter]").addEventListener("click", closeLetter);

  /* =========================================================
     FOOTER SECRET
     ========================================================= */

  const secretLotus = $("#secretLotus");
  const SECRETS = [
    "李明达喜欢烬，今天比昨天多一点。",
    "昨天也比前天多一点。",
    "别摸了，再摸就露馅了：我真的很爱你。",
    "好啦，再摸下去，莲花都要脸红了。"
  ];
  let secretClicks = 0;

  secretLotus.addEventListener("click", () => {
    const message = SECRETS[Math.min(secretClicks, SECRETS.length - 1)];
    secretClicks += 1;
    pageBurst(secretLotus, 24);
    audio.sfx("spark");
    toast(message, 4200);
  });

  /* =========================================================
     KEYBOARD
     ========================================================= */

  document.addEventListener("keydown", (event) => {
    if (lightboxOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPhoto(currentPhoto - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showPhoto(currentPhoto + 1);
      }
      return;
    }

    if (letterOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLetter();
      } else if (event.key === "Tab") {
        event.preventDefault();
        closeLetterBtn.focus();
      }
      return;
    }

    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      menuBtn.focus();
    }
  });

  /* =========================================================
     INIT
     ========================================================= */

  syncSound();
  window.addEventListener("load", onScroll);

  // A quiet debug entrance used for previews/screenshots.
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("nointro")) {
    entered = true;
    body.classList.add("entered");
    body.classList.remove("is-locked");
    intro.style.display = "none";
    intro.setAttribute("aria-hidden", "true");
    $$(".reveal").forEach((el) => el.classList.add("is-visible"));
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) {
      window.setTimeout(() => target.scrollIntoView({ behavior: "auto", block: "start" }), 120);
    }
  }

  // __JS_END__
})();
