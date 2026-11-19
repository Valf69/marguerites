/* Les Marguerites du Vieux : boucle de jeu, états, entités, interface. */
(function () {
  'use strict';
  const { T, P } = Core;
  const W = 960, H = 540;
  const $ = id => document.getElementById(id);
  const canvas = $('view'), ctx = canvas.getContext('2d');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(typeof r === 'number' ? r : 0, w / 2, h / 2);
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
    };
  }
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize(); window.addEventListener('resize', resize);

  /* ───────── Sauvegarde ───────── */
  const KEY = 'paquerettes-du-vieux-v4'; // clé conservée pour garder les sauvegardes existantes
  try { Object.keys(localStorage).filter(k => k.startsWith('pdv-ghost-')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
  const fresh = () => ({ done: [], best: {}, pages: [], bank: 0, spent: 0, shop: [], seenIntro: [], seenOutro: [], prologue: false, finished: false, finished2: false, muted: false,
    animals: [], dailyDone: {}, dailyCount: 0, quiz: {}, codes: [], region2Intro: false, ach: [], stats: {}, gold: {}, clean: {}, eteIntro: false, finishedEte: false });
  let save = fresh();
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') save = Object.assign(fresh(), s); } catch (e) {}
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
  const hasGear = id => {
    if (id === 'boots' || id === 'rope') return true; // la corde fait partie de l'équipement de départ
    if (id === 'carnet') return save.pages.length >= DATA.pages.length;
    if (id === 'medaille') return save.done.includes(FINAL);
    const i = DATA.levels.findIndex(l => l.gear === id);
    return i >= 0 && save.done.includes(i);
  };
  const owns = id => save.shop.includes(id);
  const FINAL = Math.max(0, LEVELS.findIndex(l => l.id === 'descente')); // fin de la Grande Traversée
  const NPAGES = () => DATA.pages.length;
  const unlocked = i => i === 0 || save.done.includes(i - 1);
  const bank = () => save.bank - save.spent;
  const maxHearts = () => 3 + (owns('gourde') ? 1 : 0) + (owns('trousse') ? 1 : 0);
  Snd.setMuted(!!save.muted);

  /* ───────── Entrées : clavier, manette, tactile ───────── */
  const KEYS = { ArrowLeft: 'l', KeyA: 'l', KeyQ: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', KeyZ: 'u', ArrowDown: 'd', KeyS: 'd',
    Space: 'jump', KeyK: 'jump', KeyC: 'jump', KeyX: 'act', ShiftLeft: 'act', ShiftRight: 'act', KeyJ: 'act', KeyE: 'act',
    Enter: 'ok', NumpadEnter: 'ok', Escape: 'pause', KeyP: 'pause', KeyM: 'mute', KeyR: 'restart', Tab: 'region' };
  const held = new Set(), pressed = new Set(), padHeld = new Set();
  function anyOverlay() { return document.querySelector('.ov:not([hidden])'); }
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const a = KEYS[e.code]; if (!a) return;
    Snd.init();
    if (a === 'mute') { toggleMute(); return; }
    const ov = anyOverlay();
    if (ov) {
      if (a === 'pause') { e.preventDefault(); const back = ov.querySelector('[data-back]'); if (back) back.click(); }
      return;
    }
    e.preventDefault();
    if (!held.has(a)) pressed.add(a);
    held.add(a);
  });
  document.addEventListener('keyup', e => { const a = KEYS[e.code]; if (a) held.delete(a); });
  window.addEventListener('blur', () => { held.clear(); if (state === 'play') openPause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'play') openPause(); });
  function pollPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && Array.from(pads).find(p => p);
    if (!pad) return;
    const b = i => pad.buttons[i] && pad.buttons[i].pressed;
    const now = new Set();
    if (b(14) || pad.axes[0] < -0.4) now.add('l');
    if (b(15) || pad.axes[0] > 0.4) now.add('r');
    if (b(12) || pad.axes[1] < -0.5) now.add('u');
    if (b(13) || pad.axes[1] > 0.5) now.add('d');
    if (b(0)) now.add('jump');
    if (b(1) || b(2)) now.add('act');
    if (b(9)) now.add('pause');
    for (const a of now) if (!padHeld.has(a)) { pressed.add(a); if (a === 'jump') pressed.add('ok'); }
    for (const a of padHeld) held.delete(a);
    for (const a of now) held.add(a);
    padHeld.clear(); for (const a of now) padHeld.add(a);
  }
  document.querySelectorAll('[data-act]').forEach(btn => {
    const a = btn.dataset.act;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); Snd.init(); btn.setPointerCapture(e.pointerId); if (!held.has(a)) pressed.add(a); held.add(a); btn.classList.add('on'); });
    const up = () => { held.delete(a); btn.classList.remove('on'); };
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
  });
  window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') document.body.classList.add('touch'); }, { passive: true });

  /* ───────── État général ───────── */
  let state = 'title', tick = 0, G = null, cut = null, mapSel = 0, endT = 0, menuBack = 'title';
  const parts = []; // particules hors niveau (titre)

  /* ───────── Construction d'un niveau ───────── */
  function buildLevel(i) {
    const def = LEVELS[i], meta = DATA.levels[i], L = Core.parseLevel(def);
    const g = {
      i, def, meta, L, mode: def.legs ? def.legs[0].mode : def.mode === 'trail' ? 'walk' : (def.mode || 'walk'), trail: def.legs ? !!def.legs[0].trail : def.mode === 'trail', theme: def.theme,
      legs: def.legs || null, leg: 0, swimLeg: !!(def.legs && def.legs[0].swim), mounts: [], ride: null, fish: [], catches: 0, fouls: 0, shot: null, poolDone: new Set(),
      p: null, cam: { x: 0, y: 0 }, look: 0,
      flowers: [], pages: [], cairns: [], enemies: [], plats: [], anchors: [], rocks: [], spawners: [], icicles: [], hazards: [],
      decor: [], signs: [], gourdes: [], falling: [], part: [], weather: [],
      hearts: maxHearts(), collected: 0, total: 0, pageFound: [false, false, false], deaths: 0, time: 0,
      checkpoint: null, safe: [], invuln: 0, shake: 0, flash: 0, dialog: null, toast: null, notice: null, finish: null, dying: 0,
      iris: { r: 0, target: 1, cb: null }, reveal: new Map(), revealed: new Set(), combo: 0, comboT: 0,
      anim: { sx: 1, sy: 1, rot: 0, phase: 0, bob: 0, flip: 0, smoke: 0, step: 0 }, windT: 0, windNow: 0, windSign: 1, lean: 0,
      bolt: null, boltT: 160, av: null, springs: new Map(), hiddenSeen: false,
      walkers: [], gates: [], thermals: [], clouds: [], ravitos: [], airs: [], jellies: [], trash: [], trashGot: 0, hits: 0,
      sta: 100, tired: false, air: 100, elan: 100, penalty: 0, gyp: null, seenNow: new Set()
    };
    for (const e of L.ents) {
      const cx = e.tx * T + T / 2, cy = e.ty * T + T / 2, bottom = (e.ty + 1) * T;
      switch (e.c) {
        case 'S': g.start = { x: cx - P.w / 2, y: bottom - P.h }; break;
        case 'E': g.exit = { x: cx, y: bottom }; break;
        case '*': g.flowers.push({ x: cx, y: cy, taken: false, hidden: !!e.hidden, ph: Math.random() * 6 }); break;
        case 'P': g.pages.push({ x: cx, y: cy, taken: false, hidden: !!e.hidden }); break;
        case '+': g.gourdes.push({ x: cx, y: cy, taken: false }); break;
        case 'K': g.cairns.push({ x: cx, y: bottom, active: false, raise: 0 }); break;
        case '!': { const s = (def.signs || []).find(s => s.x === e.tx && s.y === e.ty); g.signs.push({ x: cx, y: bottom, t: s ? s.t : '' }); break; }
        case 'r': g.enemies.push({ type: 'r', x: cx - 14, y: bottom - 26, w: 28, h: 26, vx: -1.1, vy: 0, dead: 0, roll: 0 }); break;
        case 'b': g.enemies.push({ type: 'b', x0: cx, y0: cy, x: cx, y: cy, ph: Math.random() * 6, dead: 0 }); break;
        case 'i': g.icicles.push({ x: cx, y: e.ty * T, state: 0, t: 0, fy: 0, vy: 0 }); break;
        case 'f': g.spawners.push({ x: cx, y: cy, t: 60 + Math.random() * 80 }); break;
        case 'M': case 'V': g.plats.push({ kind: e.c, x0: e.tx * T, y0: e.ty * T, x: e.tx * T, y: e.ty * T, px: e.tx * T, py: e.ty * T, w: 96, ph: g.plats.length * 1.7 }); break;
        case 'o': g.anchors.push({ x: cx, y: cy }); break;
        case 'R': g.hazards.push({ x: cx, y: bottom }); break;
        case 'm': g.decor.push({ type: 'm', x: cx, y: bottom, up: 1, hid: 0, whistled: false }); break;
        case 'g': g.decor.push({ type: 'g', x: cx, y: bottom }); break;
        case 'x': g.decor.push({ type: 'x', x: cx, y: bottom }); break;
        case 'Z': case 'X': g.decor.push({ type: e.c, x: cx, y: bottom }); break;
        case 'H': case 'e': case 'c': case 'k': case 'O': case 'U': g.decor.push({ type: e.c, x: cx, y: e.c === 'k' || e.c === 'U' ? cy : bottom }); break;
        case 'W': g.decor.push({ type: 'W', x: cx, y: cy }); break;
        case 'w': g.walkers.push({ x: cx, y: bottom, vx: 1.2, style: g.walkers.length % 2 ? 'rando2' : 'rando1', aside: false }); break;
        case 'G': g.gates.push({ x: cx, y: cy, state: 0, color: g.gates.length % 2 ? '#1e6fd0' : '#d0302f' }); break;
        case 'Y': g.thermals.push({ x: cx, bottom }); break;
        case 'n': g.clouds.push({ x: cx, y: cy }); break;
        case 'u': g.ravitos.push({ x: cx, y: bottom, used: false }); break;
        case 'a': g.airs.push({ x: cx, y: cy, cd: 0 }); break;
        case 'j': g.jellies.push({ x: cx, y0: cy, y: cy, ph: Math.random() * 6 }); break;
        case 'D': g.trash.push({ x: cx, y: cy, taken: false }); break;
        case 'F': case 'l': g.fish.push({ x0: cx, y0: cy, x: cx, y: cy, kind: ['sar', 'daurade', 'loup'][g.fish.length % 3], small: e.c === 'l', ph: Math.random() * 6, dir: 1, caught: false, flee: 0 }); break;
      }
    }
    const vis = g.flowers.filter(f => !f.hidden);
    if (vis.length) { const gf = vis[Math.floor(vis.length * 0.73)]; gf.gold = true; gf.got = !!save.gold[def.id]; }
    g.pages.sort((a, b) => a.x - b.x || a.y - b.y).forEach((pg, k) => { pg.idx = k; pg.gid = i * 3 + k; pg.known = save.pages.includes(pg.gid); });
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) if (L.grid[y][x] === 'Q') g.total += 5;
    g.total += g.flowers.length;
    g.p = Core.newPlayer(g.start.x, g.start.y, g.mode);
    g.surface = (def.surface || 0) * T; R.surfaceY = g.surface;
    g.lift = Core.liftFn(L);
    g.staMax = hasGear('trail') ? 140 : 100; g.sta = g.staMax;
    g.airMax = 100 * (hasGear('masque') ? 1.3 : 1) * (hasGear('neoprene') ? 1.25 : 1); g.air = g.airMax;
    g.par = parTimes(i);
    if (['fly', 'cliff', 'alpage', 'glacier'].includes(g.mode === 'fly' ? 'fly' : def.theme) && Math.random() < 0.6) g.gypAt = 600 + Math.random() * 1800;
    g.cam.x = clamp(g.p.x - W / 2, 0, L.pw - W); g.cam.y = clamp(g.p.y - H * 0.55, Math.min(0, L.ph - H), L.ph - H);
    if (meta.npc) g.npc = { who: meta.npc, x: g.exit.x + 70, y: g.exit.y - (meta.exit === 'kayak' ? 6 : 0) };
    for (let k = 0; k < 60; k++) g.weather.push({ x: Math.random() * W, y: Math.random() * H, s: Math.random(), ph: Math.random() * 6 });
    return g;
  }
  function env() {
    return {
      mode: G.mode, anchors: G.anchors,
      hasPoles: hasGear('poles'), hasRope: hasGear('rope'), hasCrampons: hasGear('axe'), hasTires: hasGear('pneus'),
      speedMul: (owns('sac') ? 1.07 : 1) * (hasGear('trifonction') ? 1.05 : 1) * (G.trail ? (G.tired ? 0.55 : (G.sprint ? 1.35 : 1)) : 1) * (G.ride ? 1.3 : 1) * (G.p.onGround && G.p.gTile === 'w' ? 0.6 : 1),
      jumpMul: G.ride ? 1.2 : 1, autoStep: G.trail,
      wind: G.def.winds ? windAt : null, lift: G.lift, surface: G.surface
    };
  }
  function parTimes(i) {
    if (DATA.levels[i].par) return DATA.levels[i].par;
    const def = LEVELS[i], m = def.mode || 'walk';
    const sp = { walk: 5.2, trail: 5.2, kayak: 5, snow: 7, ski: 7, bike: 6.5, fly: 3.6, swim: 3.3 }[m];
    const dist = Math.max(def.w, def.h * 1.4) * T, base = dist / (sp * 60);
    const k = m === 'walk' ? [2.0, 2.8, 3.8] : m === 'trail' ? [1.25, 1.55, 2] : m === 'swim' ? [1.7, 2.3, 3.2] : [1.08, 1.25, 1.5];
    return k.map(v => Math.ceil(base * v / 5) * 5);
  }
  function medalOf(i, secs) { const p = parTimes(i); return secs <= p[0] ? 3 : secs <= p[1] ? 2 : secs <= p[2] ? 1 : 0; }
  const MEDALS = ['', 'Bronze', 'Argent', 'Or'], MEDAL_COL = ['', '#c08a5a', '#c9d2da', '#f2c230'];
  function windAt(x) {
    for (const z of G.def.winds) if (x >= z.x0 * T && x <= z.x1 * T) return G.windNow * z.f * (z.flip ? G.windSign : 1) * (hasGear('jacket') ? 0.5 : 1);
    return 0;
  }
  function inWind(x) { return G.def.winds && G.def.winds.some(z => x >= z.x0 * T && x <= z.x1 * T); }

  /* ───────── Démarrage / fin de niveau ───────── */
  function startLevel(i, fromCheckpoint, daily) {
    const keep = fromCheckpoint && G && G.i === i ? G : null;
    if (keep) {
      // reprise au dernier cairn : on garde ce qui a été ramassé
      G.hearts = maxHearts(); G.dying = 0; G.invuln = 90; G.p = Object.assign(Core.newPlayer(G.checkpoint.x, G.checkpoint.y, G.mode), { y: G.checkpoint.y }); G.air = G.airMax; G.sta = G.staMax; G.tired = false;
      G.safe = []; G.bolt = null; G.p.face = 1; if (G.av) G.av.x = G.p.x - 820;
      G.iris = { r: 0, target: 1 };
    } else { G = buildLevel(i); G.daily = daily || null; }
    state = 'play'; hideAll();
    Snd.music(G.meta.music);
    if (!keep && !save.seenIntro.includes(i)) {
      G.pendingIntro = true;
    }
  }
  function openDialog(lines, cb) {
    G.dialog = { lines, i: 0, chars: 0, cb, names: DATA.names };
  }
  function touchExit() {
    if (G.finish) return;
    G.finish = { t: 0, hops: 0, lastHop: 0, done: false };
    G.p.vx *= 0.3;
    Snd.sfx.win();
    burst(G.exit.x, G.exit.y - 60, 30, ['#ffe08a', '#fffaf0', '#e9a44c'], 6);
  }
  /* Fête de victoire : le Vieux saute de joie, feux d'artifice et pluie de fleurs */
  function updateCelebration(p, L) {
    const f = G.finish; f.t++;
    p.vx *= 0.85;
    if (G.mode !== 'swim' && G.mode !== 'fly') {
      Core.moveY(L, p, Math.min(8, p.vy += 0.6), G.mode === 'kayak');
      if (p.onGround && f.t > 14 && f.hops < 3 && f.t - f.lastHop > 30) {
        f.hops++; f.lastHop = f.t; p.vy = G.mode === 'walk' ? -10 : -7; p.onGround = false;
        if (f.hops === 2 && G.mode === 'walk' && !G.ride) G.anim.flip = 1;
        G.anim.sy = 1.25; G.anim.sx = 0.8; Snd.sfx.jump(); dust(p.x + 11, p.y + p.h, 5);
      }
    } else { p.vy *= 0.85; G.anim.rot = Math.sin(f.t * 0.2) * 0.3; }
    if (G.mode === 'walk' && f.t % 36 === 18) p.face = -p.face;
    if (G.anim.flip) { G.anim.flip++; if (G.anim.flip > 20) G.anim.flip = 0; }
    G.anim.sx += (1 - G.anim.sx) * 0.18; G.anim.sy += (1 - G.anim.sy) * 0.18;
    const cols = [['#ffe08a', '#f2c230', '#fff'], ['#e2683a', '#ffb070', '#fff'], ['#7dd36a', '#c9f0b0', '#fff'], ['#7fd6ff', '#e8fbff', '#fff']];
    if (f.t % 16 === 4 && f.t < 140) {
      const fx = G.cam.x + rand(140, W - 140), fy = G.cam.y + rand(70, 210), c = cols[(f.t >> 4) % cols.length];
      for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2, sp = rand(3, 5.5); G.part.push({ x: fx, y: fy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 46, ml: 46, s: rand(1.8, 3), c: c[k % 3], g: 0.06, type: 'dot' }); }
      Snd.sfx.flower(3 + (f.t >> 4) % 6);
    }
    if (f.t % 3 === 0 && f.t < 150) G.part.push({ x: G.cam.x + rand(0, W), y: G.cam.y - 10, vx: rand(-0.6, 0.6), vy: rand(1.2, 2.4), l: 200, ml: 200, s: rand(0.4, 0.7), c: '#fff', g: 0.004, type: 'flower', r: Math.random() * 6 });
    if (f.t === 40) Snd.sfx.medal();
    const cx2 = p.x + p.w / 2 - W / 2, cy2 = p.y + p.h / 2 - H * 0.62;
    G.cam.x += (cx2 - G.cam.x) * 0.08; G.cam.y += (cy2 - G.cam.y) * 0.08;
    G.cam.x = clamp(G.cam.x, 0, L.pw - W); G.cam.y = clamp(G.cam.y, Math.min(0, L.ph - H), L.ph - H);
    if (!f.done && (f.t >= 160 || (f.t > 50 && (pressed.has('jump') || pressed.has('ok') || pressed.has('click'))))) { f.done = true; finishFlow(); }
  }
  function finishFlow() {
    const first = !save.seenOutro.includes(G.i);
    const after = () => {
      if (first) { save.seenOutro.push(G.i); }
      showResults();
    };
    if (first) {
      if (G.meta.outroScene) {
        state = 'cutscene';
        cut = { panels: [{ scene: G.meta.outroScene, caption: 'Au refuge d\'hiver.', lines: G.meta.outro }], pi: 0, cb: () => { state = 'play'; after(); } };
        cut.dialog = { lines: G.meta.outro, i: 0, chars: 0, names: DATA.names, cb: cutNext };
      } else openDialog(G.meta.outro, after);
    } else after();
  }

  /* ───────── Résultats ───────── */
  function showResults() {
    state = 'results';
    const i = G.i, prev = save.best[i] || { flowers: 0, time: 0, pages: [false, false, false], stars: 0 };
    const firstClear = !save.done.includes(i);
    const pages = prev.pages.map((v, k) => v || G.pageFound[k]);
    const newPages = G.pages.filter(pg => pg.taken && !save.pages.includes(pg.gid)).length;
    for (const pg of G.pages) if (pg.taken && !save.pages.includes(pg.gid)) save.pages.push(pg.gid);
    const pct = G.collected / Math.max(1, G.total);
    const stars = 1 + (G.pageFound.every(Boolean) ? 1 : 0) + (pct >= 0.9 ? 1 : 0);
    const gain = Math.max(0, G.collected - prev.flowers);
    save.bank += gain;
    const comboBonus = G.comboBonus || 0; save.bank += comboBonus;
    let goldMsg = '';
    if (G.goldGot && !save.gold[G.def.id]) { save.gold[G.def.id] = true; save.bank += DATA.goldReward; goldMsg = ' <em>pâquerette d\'or +' + DATA.goldReward + '</em>'; }
    const secs = G.time / 60, medal = medalOf(i, secs), xpBefore = xp();
    const record = !prev.time || secs < prev.time;
    let cleanMsg = '';
    if (G.trash.length && G.trashGot === G.trash.length && !save.clean[G.def.id]) { save.clean[G.def.id] = true; save.bank += DATA.cleanReward; cleanMsg = ' <em>étape propre ! +' + DATA.cleanReward + ' ✿</em>'; }
    else if (save.clean[G.def.id] && G.trash.length) cleanMsg = ' <em>étape déjà nettoyée</em>';
    save.best[i] = { flowers: Math.max(prev.flowers, G.collected), time: prev.time ? Math.min(prev.time, secs) : secs, pages, stars: Math.max(prev.stars, stars), medal: Math.max(prev.medal || 0, medal) };
    // défi du jour
    let dailyMsg = '';
    if (G.daily) {
      const ok = { nohit: G.hits === 0, flowers: pct >= 0.8, silver: secs <= parTimes(i)[1], pages: G.pageFound.every(Boolean) }[G.daily.id];
      if (ok && !save.dailyDone[G.daily.date]) { save.dailyDone[G.daily.date] = true; save.dailyCount++; save.bank += DATA.dailyReward; dailyMsg = 'Défi du jour réussi ! <em>+' + DATA.dailyReward + ' ✿</em>'; }
      else if (ok) dailyMsg = 'Défi du jour déjà réussi aujourd\'hui';
      else dailyMsg = 'Défi du jour raté : ' + DATA.daily.find(d => d.id === G.daily.id).text + '. Appuie sur R pour réessayer !';
    }
    if (firstClear) save.done.push(i);
    persist();
    const gear = firstClear && G.meta.gear ? DATA.cards.find(c => c.id === G.meta.gear) : null;
    const el = $('ovResults');
    el.querySelector('.kicker').textContent = G.meta.activity + ' · Étape ' + (i + 1);
    el.querySelector('h2').textContent = G.meta.name;
    const st = el.querySelector('.stars'); st.innerHTML = '';
    const labels = ['Étape terminée', 'Les 3 pages', '90 % des pâquerettes'];
    for (let k = 0; k < 3; k++) { const s = document.createElement('div'); s.className = 'star' + (k < stars ? ' on' : ''); s.style.animationDelay = (0.3 + k * 0.25) + 's'; s.innerHTML = '<span>✿</span><small>' + labels[k] + '</small>'; st.append(s); }
    el.querySelector('.stats').innerHTML =
      row('Pâquerettes', G.collected + ' / ' + G.total + (gain ? ' <em>+' + gain + ' pour la boutique</em>' : '') + goldMsg) +
      (comboBonus ? row('Bonus combo', 'meilleur enchaînement : ' + G.bestCombo + ' <em>+' + comboBonus + ' ✿</em>') : '') +
      row('Pages du carnet', G.pageFound.filter(Boolean).length + ' / 3' + (newPages ? ' <em>' + newPages + ' nouvelle' + (newPages > 1 ? 's' : '') + '</em>' : '')) +
      row('Temps', fmt(secs) + (record && prev.time ? ' <em>nouveau record !</em>' : ' <em>record ' + fmt(save.best[i].time) + '</em>')) +
      row('Médaille', medal ? '<span class="medal m' + medal + '">' + MEDALS[medal] + '</span>' : 'aucune <em>or en ' + fmt(parTimes(i)[0]) + '</em>') +
      (G.mode === 'ski' ? row('Portes', G.gates.filter(q => q.state === 1).length + ' / ' + G.gates.length + (G.penalty ? ' <em>+' + G.penalty + ' s de pénalité</em>' : '')) : '') +
      (G.trash.length ? row('Déchets ramassés', G.trashGot + ' / ' + G.trash.length + cleanMsg) : '') +
      (G.fish.length ? row('Prises', G.catches + (G.fouls ? ' <em>' + G.fouls + ' erreur' + (G.fouls > 1 ? 's' : '') + '</em>' : ' <em>pêche responsable</em>')) : '') +
      (G.mode === 'bike' ? row('Randonneurs prévenus', G.walkers.filter(w => w.aside).length + ' / ' + G.walkers.length) : '') +
      row('Cartes Club perdues', String(G.hits)) +
      (dailyMsg ? row('Défi du jour', dailyMsg) : '');
    if (medal >= 2) Snd.sfx.medal();
    // succès de fin d'étape
    award('premier');
    if (G.hits === 0) award('nohit');
    const golds = Object.values(save.best).filter(b => b.medal === 3).length;
    if (golds >= 1) award('or1'); if (golds >= 7) award('or7');
    if (Object.keys(save.gold).length >= 1) award('pepite1'); if (Object.keys(save.gold).length >= LEVELS.length) award('pepite14');
    if (G.mode === 'bike' && G.walkers.every(w => w.aside) && G.hits === 0) award('poli');
    if (G.def.id === 'plongee' && G.trashGot === G.trash.length) award('eco');
    if (G.trash.length && G.trashGot === G.trash.length) award('propre');
    if (Object.keys(save.clean).length >= LEVELS.length) award('propreAll');
    if (G.fish.length && G.catches >= 6 && !G.fouls) award('pecheur');
    if (G.ride) award('monture');
    if (G.mode === 'ski' && G.gates.every(q => q.state === 1)) award('slalom');
    if (save.pages.length >= NPAGES()) award('carnet');
    if (i === FINAL) award('fin');
    if (i === LEVELS.length - 1 && LEVELS.length - 1 !== FINAL) award('ete');
    const got = (G.achQueue || []).splice(0);
    el.querySelector('.achs').innerHTML = got.map(a => '<div class="ach"><span>★</span><div><b>' + a.name + '</b><small>' + a.desc + '</small></div></div>').join('');
    confetti(medal === 3 ? 70 : got.length ? 30 : 0);
    // titre
    const before = titleOf(xpBefore), after = titleOf(xp());
    el.querySelector('.levelup').hidden = before === after;
    el.querySelector('.levelup').innerHTML = 'Nouveau titre : <b>' + after + '</b>';
    el.querySelector('.quiz').hidden = true; // plus de question en fin d'étape : place à la fête
    $('resShare').onclick = () => shareImage(i, secs, stars, medal);
    const gc = el.querySelector('.newgear');
    gc.hidden = !gear;
    if (gear) { gc.querySelector('strong').textContent = gear.name; gc.querySelector('p').textContent = gear.power; gc.querySelector('small').textContent = gear.from; drawGearCanvas(gc.querySelector('canvas'), gear.id, true); }
    const end1 = i === FINAL && !save.finished, end3 = i === LEVELS.length - 1 && i !== FINAL && !save.finishedEte;
    $('resNext').textContent = end1 || end3 ? 'Rentrer à la boutique →' : 'Retour à la carte →';
    $('resNext').onclick = () => { Snd.sfx.click(); if (end1) playEnding(); else if (end3) playEnding3(); else openMap(Math.min(i + 1, LEVELS.length - 1)); };
    $('resRetry').onclick = () => { Snd.sfx.click(); startLevel(i); };
    show('ovResults');
    Snd.music('map');
  }
  const row = (a, b) => '<div><span>' + a + '</span><b>' + b + '</b></div>';
  function xp() {
    let v = 0;
    for (const b of Object.values(save.best)) v += b.flowers + b.stars * 25 + (b.medal || 0) * 10;
    return v + save.pages.length * 40 + save.animals.length * 30 + save.dailyCount * 50 + Object.keys(save.quiz).length * 15;
  }
  function titleOf(v) { let t = DATA.titles[0][1]; for (const [n, name] of DATA.titles) if (v >= n) t = name; return t; }
  function nextTitle(v) { return DATA.titles.find(([n]) => n > v); }
  function renderQuiz(box, i) {
    const q = DATA.quiz[i]; box.innerHTML = '';
    if (!q) { box.hidden = true; return; }
    box.hidden = false;
    const done = save.quiz[i];
    box.innerHTML = '<div class="kicker">La question du Vieux' + (done ? ' · déjà réussie' : ' · +15 ✿') + '</div><p></p><div class="opts"></div>';
    box.querySelector('p').textContent = q[0];
    const opts = [1, 2, 3].sort(() => Math.random() - 0.5);
    for (const k of opts) {
      const b = document.createElement('button'); b.className = 'alt'; b.textContent = q[k];
      b.onclick = () => {
        box.querySelectorAll('button').forEach(x => { x.disabled = true; if (x.textContent === q[1]) x.classList.add('good'); });
        if (k === 1) { b.classList.add('good'); if (!save.quiz[i]) { save.quiz[i] = true; save.bank += 15; persist(); } Snd.sfx.cairn(); if (Object.keys(save.quiz).length >= DATA.quiz.length) { award('quiz'); } }
        else { b.classList.add('bad'); Snd.sfx.hurt(); }
      };
      box.querySelector('.opts').append(b);
    }
  }
  function shareImage(i, secs, stars, medal, noSprite) {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 630; const x = c.getContext('2d');
    const g2 = x.createLinearGradient(0, 0, 0, 630); g2.addColorStop(0, '#20382c'); g2.addColorStop(1, '#2d4d3b'); x.fillStyle = g2; x.fillRect(0, 0, 1200, 630);
    if (!noSprite) { x.save(); x.scale(1.25, 1.25); R.vieux(x, DATA.levels[i].id === 'parapente' ? 12 : 8, 760, 470, 330, { flip: true }); x.restore(); }
    else R.gear(x, DATA.levels[i].gear || 'carnet', 960, 300, 4);
    x.fillStyle = '#e9a44c'; x.font = '800 26px system-ui'; x.fillText('LES MARGUERITES DU VIEUX', 70, 110);
    x.fillStyle = '#fff8e8'; x.font = 'bold 64px Georgia, serif'; x.fillText(DATA.levels[i].name, 70, 200);
    x.font = '600 34px system-ui'; x.fillStyle = '#d8e2cf'; x.fillText(DATA.levels[i].activity, 70, 250);
    x.font = 'bold 120px system-ui'; x.fillStyle = '#fff8e8'; x.fillText(fmt(secs), 70, 400);
    for (let k = 0; k < 3; k++) R.flower(x, 100 + k * 70, 470, 2.6, k < stars);
    if (medal) { R.circle(x, 340, 470, 34, MEDAL_COL[medal]); x.fillStyle = '#20382c'; x.font = 'bold 20px system-ui'; x.textAlign = 'center'; x.fillText(MEDALS[medal], 340, 477); x.textAlign = 'left'; }
    x.fillStyle = '#e9a44c'; x.font = '600 26px system-ui'; x.fillText('Tu fais mieux ?', 70, 570);
    try { c.toDataURL(); } catch (err) { if (!noSprite) shareImage(i, secs, stars, medal, true); return; }
    c.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'marguerites-du-vieux.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: 'Les Marguerites du Vieux' }).catch(() => {});
      else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'marguerites-du-vieux.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
    });
  }
  function confetti(n) {
    const box = $('confetti'); box.innerHTML = '';
    const cols = ['#e9a44c', '#f2c230', '#2f9e6f', '#1e8bc3', '#e2683a', '#fff4dc'];
    for (let k = 0; k < n; k++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = cols[k % cols.length]; s.style.animationDelay = Math.random() * 0.8 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; s.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'; box.append(s); }
    setTimeout(() => { box.innerHTML = ''; }, 4500);
  }
  function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dailyChallenge() {
    const date = today(); let h = 0; for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const pool = []; for (let i = 0; i < LEVELS.length; i++) if (save.done.includes(i)) pool.push(i);
    if (!pool.length) return null;
    const lv = pool[h % pool.length], c = DATA.daily[(h >>> 7) % DATA.daily.length];
    return { level: lv, id: c.id, text: c.text, date, done: !!save.dailyDone[date] };
  }
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

  function die(reason) {
    if (G.dying) return;
    G.dying = 1; G.deaths++; G.p.vx = 0; G.p.vy = -9; G.reason = reason;
    Snd.sfx.fail(); G.shake = 16;
  }
  function showFail() {
    state = 'fail';
    const el = $('ovFail');
    el.querySelector('h2').textContent = G.reason === 'avalanche' ? 'L\'avalanche t\'a rattrapé !' : 'Plus de carte Club !';
    el.querySelector('p').textContent = G.reason === 'avalanche' ? 'Garde de la vitesse et évite les barrières : chaque choc te ralentit.' : 'Ton assurance a bien servi. Au dernier cairn, tu repars avec toutes tes cartes Club.';
    $('failCairn').hidden = !G.checkpoint;
    show('ovFail');
  }

  /* ───────── Effets ───────── */
  function burst(x, y, n, colors, sp, type) {
    for (let k = 0; k < n; k++) G.part.push({ x, y, vx: rand(-1, 1) * sp, vy: rand(-1.2, 0.4) * sp, l: 30 + Math.random() * 20, ml: 50, s: rand(1.5, 3.5), c: colors[k % colors.length], g: 0.15, type: type || 'dot', r: Math.random() * 6 });
  }
  function dust(x, y, n, k) {
    const col = { forest: '#c9b48a', lake: '#b9a98a', cave: '#8d88a0', cliff: '#d6b894', river: '#ffffff', glacier: '#ffffff', storm: '#e8eef2', snow: '#ffffff' }[G.theme];
    for (let j = 0; j < n; j++) G.part.push({ x: x + rand(-8, 8), y, vx: rand(-1.4, 1.4) * (k || 1), vy: rand(-1.5, -0.2), l: 22, ml: 22, s: rand(3, 6), c: col, g: -0.02, type: 'smoke' });
  }
  function floatText(x, y, s, c) { G.part.push({ x, y, vx: 0, vy: -0.8, l: 60, ml: 60, s: 0, c: c || '#fff8e6', g: 0, type: 'text', text: s }); }
  function notice(text) { G.notice = { text, t: 150 }; }
  function toast(title, text) { G.toast = { title, text, t: 420 }; }

  function hurt(dir, kind) {
    if (G.invuln > 0 || G.dying || G.finish) return;
    if (G.ride) { // comme Yoshi : la monture s'enfuit, mais tu ne perds pas de carte Club
      G.mounts.push({ kind: G.ride.kind, x: G.p.x, y: G.p.y + G.p.h - 28, w: 30, h: 28, vx: (dir || -G.p.face) * -3.5, vy: -5, flee: true, t: 0 });
      G.ride = null; G.invuln = 100; G.shake = 8; Snd.sfx.hurt(); G.p.vy = -8; G.p.vx = (dir || -G.p.face) * 3;
      floatText(G.p.x + 11, G.p.y - 14, 'Ta monture s\'est sauvée !', '#ffd0c8'); return;
    }
    if (kind === 'rock' && hasGear('casque') && !G.helmetUsed) {
      G.helmetUsed = true; G.invuln = 100; G.shake = 6; Snd.sfx.land();
      floatText(G.p.x + 11, G.p.y - 14, 'Le casque t\'a protégé !', '#c9f0b0'); return;
    }
    G.hearts--; G.invuln = 100; G.shake = 10; Snd.sfx.hurt();
    burst(G.p.x + 11, G.p.y + 20, 10, ['#e8505b', '#fff'], 3);
    G.hits++;
    if (G.mode === 'walk') { G.p.vx = (dir || -G.p.face) * 5; if (!G.p.rope) G.p.vy = -7; }
    else if (G.mode === 'swim') { G.p.vx = (dir || -G.p.face) * 3; G.p.vy = -1.5; }
    else G.p.vx *= 0.45;
    G.heartPulse = 20; floatText(G.p.x + 11, G.p.y - 14, '-1 carte Club', '#ffd0c8');
    if (G.hearts <= 0) die(kind);
  }
  function fallOut(water) {
    if (G.dying || G.finish) return;
    if (G.ride) { G.ride = null; notice('Ta monture est restée sur la berge'); }
    const vest = water && hasGear('vest');
    if (water) { Snd.sfx.splash(); burst(G.p.x + 11, G.p.y + G.p.h, 16, ['#ffffff', '#bfe9f2'], 3.5); }
    if (!vest) {
      G.hearts--; G.hits++; G.heartPulse = 20; Snd.sfx.hurt(); notice('-1 carte Club');
      if (G.hearts <= 0) { die('fall'); return; }
    } else notice('Le gilet de Théo t\'a ramené sur la rive');
    let s = G.safe.length ? G.safe[G.safe.length - 1] : (G.checkpoint || G.start);
    if (G.mode !== 'walk') {
      // en descente, on repart bien avant le trou, déjà lancé
      const back = G.safe.filter(q => q.x < G.p.x - 360);
      s = back.length ? back[back.length - 1] : (G.checkpoint || G.start);
    }
    const v0 = { walk: 0, kayak: 4.4, bike: 5, fly: 3, swim: 0 }[G.mode] ?? 6;
    G.p = Object.assign(Core.newPlayer(s.x, s.y, G.mode), { y: s.y, face: 1, vx: v0, onGround: G.mode !== 'fly' && G.mode !== 'swim' });
    G.invuln = 90; G.flash = 8; G.safe = G.safe.filter(q => q.x <= s.x);
    if (G.av) G.av.x = Math.min(G.av.x, G.p.x - 700);
  }

  /* ───────── Mise à jour du jeu ───────── */
  function readInput() {
    if (window.__bot) return window.__bot(G, Core); // point d'entrée pour les tests automatiques
    const rope = G.p.rope;
    return {
      actionHeld: held.has('act'),
      l: held.has('l'), r: held.has('r'), u: held.has('u'), d: held.has('d'),
      jumpPressed: pressed.has('jump') || (!rope && pressed.has('u')),
      jumpHeld: held.has('jump') || (!rope && held.has('u')),
      actionPressed: pressed.has('act')
    };
  }
  function overlap(a, bx, by, bw, bh) { return a.x < bx + bw && a.x + a.w > bx && a.y < by + bh && a.y + a.h > by; }

  function switchLeg(k) {
    const lg = G.legs[k]; G.leg = k; G.mode = lg.mode; G.trail = !!lg.trail; G.swimLeg = !!lg.swim; G.ride = null; G.sprint = false;
    G.p = Object.assign(Core.newPlayer(lg.sx * T + (T - P.w) / 2, (lg.sy + 1) * T - P.h, G.mode), { face: 1, vx: lg.mode === 'bike' ? 3 : 0, onGround: true });
    G.checkpoint = { x: G.p.x, y: G.p.y }; G.safe = []; G.look = 0;
    Snd.sfx.cairn(); notice(lg.msg || 'Transition !'); burst(G.p.x + 11, G.p.y, 20, ['#ffe08a', '#fffaf0', '#7fd6ff'], 4);
  }
  function updatePlay() {
    if (G.legs && !G.finish && !G.dying && !G.dialog) { const nl = G.legs[G.leg + 1]; if (nl && G.p.x + G.p.w / 2 >= nl.x0 * T) switchLeg(G.leg + 1); }
    const p = G.p, L = G.L;
    if (G.iris.r < 1) G.iris.r = Math.min(1, G.iris.r + 0.035);
    if (G.pendingIntro && G.iris.r > 0.7) { G.pendingIntro = false; save.seenIntro.push(G.i); persist(); openDialog(G.meta.intro, null); }
    updateParticles();
    if (G.toast && --G.toast.t <= 0) G.toast = null;
    if (G.notice && --G.notice.t <= 0) G.notice = null;
    if (G.dialog) { updateDialog(G.dialog); return; }
    if (pressed.has('pause')) { openPause(); return; }
    if (pressed.has('restart') && !G.finish) { startLevel(G.i, false, G.daily); return; }
    if (G.dying) {
      G.dying++; p.vy += 0.5; p.y += p.vy; G.anim.rot += 0.12;
      if (G.dying > 70) showFail();
      return;
    }
    if (G.finish) { updateCelebration(p, L); return; }
    G.time++;
    if (G.invuln > 0) G.invuln--;
    if (G.shake > 0) G.shake--;
    if (G.flash > 0) G.flash--;
    if (G.heartPulse > 0) G.heartPulse--;
    if (G.comboT > 0 && --G.comboT === 0) G.combo = 0;

    // vent
    if (G.def.winds) {
      G.windT++;
      const cyc = 330, ph = G.windT % cyc;
      if (ph === 0) G.windSign *= -1;
      const env1 = ph < 90 ? 0.15 : ph < 150 ? 0.15 + (ph - 90) / 60 * 0.25 : ph < 260 ? 0.4 + 0.6 * Math.sin((ph - 150) / 110 * Math.PI) : 0.15 + 0.25 * (1 - (ph - 260) / 70);
      G.windNow = env1;
      const z = G.def.winds.find(z => p.x >= z.x0 * T && p.x <= z.x1 * T);
      const target = z ? (ph > 80 && ph < 270 ? env1 : 0.1) * Math.sign(z.f * (z.flip ? G.windSign : 1)) : 0;
      G.lean += (target - G.lean) * 0.05; R.windLean = G.lean;
      if (z && ph % 4 === 0 && env1 > 0.4) {
        const col = G.theme === 'lake' ? ['#c9873e', '#8aa35a', '#e0b25a'] : ['#ffffff'];
        G.part.push({ x: G.cam.x + (G.lean < 0 ? W + 20 : -20), y: G.cam.y + rand(40, H - 60), vx: G.lean * 14, vy: rand(-0.5, 0.5), l: 90, ml: 90, s: rand(2, 4), c: col[Math.floor(Math.random() * col.length)], g: 0, type: 'leaf', r: Math.random() * 6 });
      }
    } else R.windLean = 0;

    // plateformes mobiles
    for (const pl of G.plats) {
      pl.px = pl.x; pl.py = pl.y;
      const s = Math.sin(G.time * 0.018 + pl.ph) * 96;
      if (pl.kind === 'M') pl.x = pl.x0 + s; else pl.y = pl.y0 + s;
    }
    if (p.plat) { p.x += p.plat.x - p.plat.px; p.y += p.plat.y - p.plat.py; }

    const inp = readInput();
    const oldBottom = p.y + p.h, wasGround = p.onGround, oldVy = p.vy;
    if (wasGround) p.airFrom = p.y;
    // figure en snowboard ou à ski
    if ((G.mode === 'snow' || G.mode === 'ski') && inp.actionPressed && !p.onGround && !p.spinT) { p.spinT = 1; Snd.sfx.release(); }
    // trail : sprint et endurance
    if (G.trail) {
      const moving = Math.abs(p.vx) > 1;
      G.sprint = inp.actionHeld && !G.tired && moving;
      G.sta += G.sprint ? -0.5 : moving ? -0.03 : 0.4;
      if (G.sta <= 0) { G.sta = 0; if (!G.tired) { G.tired = true; notice('À bout de souffle ! Marche un peu pour récupérer.'); } }
      if (G.tired && G.sta >= 40) G.tired = false;
      G.sta = Math.min(G.staMax, G.sta);
      if (G.sprint && G.time % 5 === 0) dust(p.x + 11 - p.face * 10, p.y + p.h, 1, 0.8);
    }
    if (G.mode === 'fly' && inp.actionPressed) {
      if (G.elan >= 9) { G.elan -= 9; Snd.sfx.jump(); for (let k = 0; k < 4; k++) G.part.push({ x: p.x + 11 + rand(-30, 30), y: p.y - 70, vx: rand(-1, 1), vy: 1.5, l: 20, ml: 20, s: 2, c: '#ffffff', g: 0, type: 'dot' }); }
      else { inp.actionPressed = false; if (!G.notice) notice('Plus d\'élan : va dans une colonne d\'air chaud pour recharger'); }
    }
    const ev = Core.stepPlayer(L, p, inp, env());
    p.plat = null;
    if (!p.rope && p.vy >= 0) for (const pl of G.plats) {
      if (p.x + p.w > pl.x + 2 && p.x < pl.x + pl.w - 2 && oldBottom <= pl.py + 3 && p.y + p.h >= pl.y) {
        p.y = pl.y - p.h; p.vy = 0; p.onGround = true; p.gTile = '='; p.plat = pl; break;
      }
    }
    if (p.onGround && !wasGround && p.plat && !ev.includes('land')) ev.push('land');
    for (const e of ev) {
      if (e === 'jump') { Snd.sfx.jump(); G.anim.sy = 1.22; G.anim.sx = 0.82; dust(p.x + 11, p.y + p.h, 5); }
      else if (e === 'jump2') { if (stat('jump2') >= 50) award('double50'); Snd.sfx.jump2(); G.anim.flip = 1; G.anim.sy = 1.15; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; G.part.push({ x: p.x + 11, y: p.y + p.h, vx: Math.cos(a) * 3, vy: Math.sin(a) * 1.2, l: 20, ml: 20, s: 3, c: '#fff6d8', g: 0, type: 'dot' }); } }
      else if (e === 'land') {
        const k = Math.min(1, oldVy / 14); G.anim.sy = 1 - 0.25 * k - 0.05; G.anim.sx = 1 + 0.25 * k + 0.05;
        if (p.gTile === 'w') { // vasque de canyoning
          Snd.sfx.splash(); burst(p.x + 11, p.y + p.h, 10 + Math.round(k * 14), ['#ffffff', '#bff3f0', '#7fd6e0'], 2 + k * 3);
          const drop = p.y - (p.airFrom ?? p.y), key = p.gx + ',' + p.gy;
          if (drop > 4 * T && !G.poolDone.has(key)) { G.poolDone.add(key); const b = drop > 7 * T ? 6 : 3; G.collected += b; floatText(p.x + 11, p.y - 20, (b > 3 ? 'Saut énorme ! +' : 'Beau saut ! +') + b + ' ✿', '#ffe08a'); Snd.sfx.trick(); }
        } else if (oldVy > 4) { dust(p.x + 11, p.y + p.h, 4 + Math.round(k * 6), 1 + k); Snd.sfx.land(); }
        if ((G.mode === 'snow' || G.mode === 'ski') && p.spinT) {
          if (p.spinT >= 26) { if (stat('tricks') >= 10) award('figure10'); G.collected += 3; floatText(p.x + 11, p.y - 10, 'Figure ! +3 ✿', '#ffe08a'); Snd.sfx.trick(); }
          else { p.vx *= 0.4; G.shake = 8; floatText(p.x + 11, p.y - 10, 'Raté !', '#ffd0c8'); Snd.sfx.land(); }
          p.spinT = 0;
        }
      }
      else if (e === 'spring') { Snd.sfx.spring(); G.anim.sy = 1.35; G.anim.sx = 0.75; G.springs.set(p.gx + ',' + p.gy, 12); dust(p.x + 11, p.y + p.h, 6); }
      else if (e === 'attach') { Snd.sfx.attach(); if (G.ride) { G.mounts.push({ kind: G.ride.kind, x: p.x, y: p.y + p.h - 28, w: 30, h: 28, vx: 0, vy: 0, wait: 60, idle: true }); G.ride = null; } }
      else if (e === 'step') { G.anim.stepOff = T; if (G.time % 2 === 0) dust(p.x + 11, p.y + p.h, 2, 0.6); }
      else if (e === 'release' || e === 'drop') { Snd.sfx.release(); }
    }
    if (p.spinT) p.spinT++;
    if (G.anim.flip) { G.anim.flip++; if (G.anim.flip > 20) G.anim.flip = 0; }

    // sol fragile
    if (p.onGround && p.gTile === 'C') for (const tx of [Math.floor((p.x + 2) / T), Math.floor((p.x + p.w - 2) / T)]) {
      const k = p.gy * L.w + tx;
      if (L.grid[p.gy][tx] === 'C' && !L.crumb.has(k)) { L.crumb.set(k, { t: 26, gone: false, back: 0 }); }
    }
    for (const [k, s] of L.crumb) {
      if (!s.gone) { if (--s.t <= 0) { s.gone = true; s.back = 300; Snd.sfx.crumble(); const tx = k % L.w, ty = Math.floor(k / L.w); burst(tx * T + 16, ty * T + 8, 8, ['#b48a5c', '#e9f4fa', '#7a5a3a'], 2); } }
      else if (--s.back <= 0) { const tx = k % L.w, ty = Math.floor(k / L.w); if (!overlap(p, tx * T, ty * T, T, T)) L.crumb.delete(k); else s.back = 20; }
    }
    // caisses
    if (p.bump && L.grid[p.bump.ty][p.bump.tx] === 'Q') {
      L.grid[p.bump.ty][p.bump.tx] = 'q'; G.collected += 5; Snd.sfx.box();
      for (let k = 0; k < 5; k++) G.part.push({ x: p.bump.tx * T + 16, y: p.bump.ty * T, vx: rand(-2, 2), vy: rand(-6, -3), l: 40, ml: 40, s: 0.6, c: '#fff', g: 0.25, type: 'flower', r: Math.random() * 6 });
      floatText(p.bump.tx * T + 16, p.bump.ty * T - 10, '+5 ✿', '#ffe08a');
    }
    if (p.bump && L.grid[p.bump.ty][p.bump.tx] === 'J') {
      L.grid[p.bump.ty][p.bump.tx] = 'q'; Snd.sfx.box(); Snd.sfx.whistle();
      const kind = G.def.mount || (['glacier', 'storm', 'alpage', 'cliff', 'snow', 'snownight'].includes(G.theme) ? 'chamois' : 'marmotte');
      G.mounts.push({ kind, x: p.bump.tx * T + 1, y: p.bump.ty * T - 28, w: 30, h: 28, vx: 1.4, vy: -7, wait: 18 });
      floatText(p.bump.tx * T + 16, p.bump.ty * T - 20, kind === 'chamois' ? 'Un chamois ! Monte dessus !' : 'Une marmotte ! Monte dessus !', '#ffe08a');
    }
    for (const [k, v] of G.springs) { if (v <= 1) G.springs.delete(k); else G.springs.set(k, v - 1); }

    // passages secrets
    if (Core.touches(L, p, 'h', 2)) revealAround(p);
    for (const k of G.revealed) G.reveal.set(k, Math.max(0.22, (G.reveal.get(k) ?? 1) - 0.04));

    // dangers du décor
    if (Core.touches(L, p, '^')) hurt(-p.face);
    if (G.mode !== 'kayak' && G.mode !== 'swim' && Core.touches(L, p, '~', 6)) { fallOut(true); return; }
    if (p.y > L.ph + 60) { fallOut(false); return; }
    // dernière position sûre
    if (p.onGround && !p.plat) {
      const a = Core.tile(L, Math.floor((p.x + 1) / T), p.gy), b = Core.tile(L, Math.floor((p.x + p.w - 1) / T), p.gy);
      const ok = c => c === '#' || c === 'I' || c === 'q' || c === 'w' || (G.mode === 'kayak' && c === '~');
      if (ok(a) && ok(b) && G.time % 15 === 0 && G.invuln < 60) { G.safe.push({ x: p.x, y: p.y }); if (G.safe.length > 24) G.safe.shift(); }
    }

    updateEntities(p, oldBottom, inp);
    if (state !== 'play') return;
    updateSeasons(p, inp, ev);
    if (state !== 'play' || G.finish || G.dying) return;

    // arrivée
    if (G.mode !== 'fly' && G.exit && Math.abs(p.x + p.w / 2 - G.exit.x) < (G.mode === 'walk' ? 34 : 60) && Math.abs(p.y + p.h - G.exit.y) < 70) touchExit();

    // avalanche
    if (G.def.avalanche) {
      const a = G.def.avalanche;
      if (!G.av && p.x > a.from * T) { G.av = { x: p.x - 820 }; Snd.sfx.rumble(); notice('Avalanche ! File droit vers la vallée !'); G.shake = 20; }
      if (G.av) {
        G.av.x += a.speed;
        if (G.time % 50 === 0) Snd.sfx.rumble();
        if (G.av.x + 30 > p.x) { G.av.x = p.x - 30; die('avalanche'); }
      }
    }
    // orage
    if (G.def.lightning) updateLightning(p);

    // animation du Vieux
    const a = G.anim;
    a.sx += (1 - a.sx) * 0.18; a.sy += (1 - a.sy) * 0.18; if (a.stepOff) a.stepOff = a.stepOff < 1 ? 0 : a.stepOff * 0.62;
    if (p.onGround && Math.abs(p.vx) > 0.6 && G.mode === 'walk') {
      a.phase += Math.abs(p.vx) * 0.075; a.bob = Math.abs(Math.sin(a.phase)) * 4; a.rot = Math.sin(a.phase) * 0.05 + p.vx * 0.008;
      if (++a.step % 14 === 0) dust(p.x + 11 - p.face * 8, p.y + p.h, 1, 0.5);
    } else if (!p.onGround) { a.bob = 0; a.rot += (clamp(p.vx * 0.025, -0.2, 0.2) - a.rot) * 0.2; }
    else { a.bob *= 0.8; a.rot *= 0.8; if (++a.smoke % 80 === 0 && G.mode === 'walk' && !p.rope) G.part.push({ x: p.x + 11 + (p.face > 0 ? 18 : -18), y: p.y + 4, vx: p.face * 0.3, vy: -0.6, l: 50, ml: 50, s: 3, c: '#ffffff', g: -0.005, type: 'smoke' }); }
    if (G.mode !== 'walk' && G.mode !== 'fly' && G.mode !== 'swim' && p.onGround && G.time % 6 === 0) dust(p.x, p.y + p.h, 1, 1.4);

    // caméra
    const look = G.mode === 'walk' ? p.face * 70 + p.vx * 8 : G.mode === 'swim' ? p.face * 120 : G.mode === 'fly' ? 300 : 260;
    G.look += (look - G.look) * 0.05;
    const tx = p.x + p.w / 2 - W / 2 + G.look, ty = p.y + p.h / 2 - H * (G.def.h > 30 ? 0.5 : 0.56);
    G.cam.x += (tx - G.cam.x) * 0.12; G.cam.y += (ty - G.cam.y) * 0.1;
    G.cam.x = clamp(G.cam.x, 0, L.pw - W); G.cam.y = clamp(G.cam.y, Math.min(0, L.ph - H), L.ph - H);
  }

  /* Mécaniques du Défi des Saisons et suivi commun (animaux, gypaète) */
  function updateSeasons(p, inp, ev) {
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    // parapente
    if (G.mode === 'fly') {
      const inTh = G.thermals.some(t => Math.abs(t.x - cx) < 80);
      G.elan = Math.min(100, G.elan + (inTh ? 1.4 : 0.1));
      if (G.time % 20 === 0 && p.y < G.L.ph - 7 * T && !G.clouds.some(c => Math.hypot(c.x - cx, c.y - cy) < 160)) { G.safe.push({ x: p.x, y: p.y }); if (G.safe.length > 24) G.safe.shift(); }
      for (const c of G.clouds) if (Math.hypot(c.x - cx, c.y - cy) < 46) { notice('Aspiré par le nuage d\'orage !'); fallOut(false); return; }
      if (G.thermals.some(t => Math.abs(t.x - cx) < 80) && G.time % 6 === 0) G.part.push({ x: cx + rand(-20, 20), y: p.y + p.h + 10, vx: 0, vy: -1.5, l: 30, ml: 30, s: 2, c: '#fff4d0', g: 0, type: 'dot' });
      if (ev.includes('touch')) {
        if (cx >= G.exit.x - 18 * T) {
          const d = Math.abs(cx - G.exit.x), b = d < 40 ? 15 : d < 110 ? 8 : 3;
          G.collected += b; floatText(cx, p.y - 20, (d < 40 ? 'Posé parfait ! ' : d < 110 ? 'Beau posé ! ' : 'Posé ! ') + '+' + b + ' ✿', '#ffe08a');
          G.landBonus = b; if (d < 40) award('pose'); touchExit(); return;
        }
        notice('Atterrissage raté !'); fallOut(false); return;
      }
    }
    // plongée
    if (G.mode === 'swim') {
      const atSurface = p.y <= G.surface + 4;
      G.air += atSurface ? 1.2 : -(inp.actionHeld ? 0.16 : 0.055) * (G.def.apnea ? 1.6 : 1);
      if (G.time % 40 === 0 && !atSurface) G.part.push({ x: cx + p.face * 18, y: p.y + 4, vx: 0, vy: -0.8, l: 70, ml: 70, s: 2.5, c: '#e8fbff', g: -0.01, type: 'dot' });
      for (const a of G.airs) { if (a.cd > 0) { a.cd--; continue; } if (Math.hypot(a.x - cx, a.y - cy) < 34) { G.air = Math.min(G.airMax, G.air + 45); a.cd = 600; Snd.sfx.page(); floatText(a.x, a.y - 20, '+ air', '#e8fbff'); } }
      for (const j of G.jellies) { j.y = j.y0 + Math.sin(G.time * 0.03 + j.ph) * 40; if (Math.abs(j.x - cx) < 26 && Math.abs(j.y + 8 - cy) < 26) hurt(cx < j.x ? -1 : 1); }
      if (G.fish.length) updateFishing(p, inp, cx, cy);
      if (G.air <= 0) { G.air = 60; G.hearts--; G.heartPulse = 20; G.hits++; Snd.sfx.hurt(); notice('Plus d\'air ! -1 carte Club. Remonte plus souvent.'); if (G.hearts <= 0) { die('air'); return; } }
      G.air = Math.min(G.airMax, G.air);
    }
    // VTT : randonneurs et sonnette
    if (G.mode === 'bike') {
      if (inp.actionPressed) {
        Snd.sfx.bell(); floatText(cx, p.y - 16, 'Dring !', '#fff4dc');
        for (const w of G.walkers) if (!w.aside && w.x - cx > 0 && w.x - cx < 460) { w.aside = true; G.collected += 2; floatText(w.x, w.y - 80, 'Merci ! +2 ✿', '#c9f0b0'); }
      }
      for (const w of G.walkers) {
        if (!w.aside) w.x += w.vx;
        if (!w.aside && overlap(p, w.x - 10, w.y - 60, 20, 60)) { hurt(-1); w.aside = true; floatText(w.x, w.y - 80, 'Hé ! Ta sonnette !', '#ffd0c8'); }
      }
    }
    // ski : portes
    if (G.mode === 'ski') for (const gt of G.gates) {
      if (gt.state || cx < gt.x) continue;
      if (Math.abs(cy - gt.y) < 56) { gt.state = 1; G.collected += 1; Snd.sfx.flower(5); floatText(gt.x, gt.y - 60, 'Porte !', '#c9f0b0'); }
      else { gt.state = 2; G.penalty += 3; G.time += 180; Snd.sfx.hurt(); notice('Porte ratée : +3 secondes'); }
    }
    // trail : ravitaillements
    if (G.trail) for (const r of G.ravitos) if (!r.used && Math.abs(r.x - cx) < 40 && Math.abs(r.y - (p.y + p.h)) < 60) {
      r.used = true; G.sta = Math.min(G.staMax, G.sta + 70); G.tired = false; Snd.sfx.cairn(); notice('Ravitaillement : énergie +70');
    }
    // animaux observés
    for (const d of G.decor) {
      const a = DATA.animals.find(x => x.id === d.type);
      if (a && Math.abs(d.x - cx) < 260 && Math.abs(d.y - cy) < 260) seeAnimal(a);
    }
    if (G.gypAt && G.time > G.gypAt && !G.gyp) G.gyp = { x: G.cam.x + W + 100, y: G.cam.y + 70 + Math.random() * 80 };
    if (G.gyp) { G.gyp.x -= 2.2; if (G.gyp.x < G.cam.x + W - 60) seeAnimal(DATA.animals.find(x => x.id === 'gypaete')); if (G.gyp.x < G.cam.x - 200) { G.gyp = null; G.gypAt = 0; } }
  }
  /* Pêche sous-marine : X près d'un poisson. Les petits et le mérou, on n'y touche pas. */
  function updateFishing(p, inp, cx, cy) {
    for (const f of G.fish) {
      if (f.caught) continue;
      if (f.flee > 0) { f.flee--; f.x0 += f.dir * 4; }
      const a = G.time * 0.012 + f.ph, nx = f.x0 + Math.sin(a) * 70;
      f.dir = nx >= f.x ? 1 : -1; f.x = nx; f.y = f.y0 + Math.sin(G.time * 0.03 + f.ph) * 10;
    }
    if (G.shot && --G.shot.t <= 0) G.shot = null;
    if (!inp.actionPressed || G.shot) return;
    let best = null, bd = 130;
    for (const f of G.fish) if (!f.caught && !f.flee) { const d = Math.hypot(f.x - cx, f.y - cy); if (d < bd && (f.x - cx) * p.face > -20) { bd = d; best = f; } }
    for (const d of G.decor) if (d.type === 'U') { const gx = d.x + Math.sin(tick * 0.03) * 20, dd = Math.hypot(gx - cx, d.y - cy); if (dd < bd && (gx - cx) * p.face > -20) { bd = dd; best = { grouper: true, x: gx, y: d.y }; } }
    if (!best) return;
    G.shot = { x: best.x, y: best.y, t: 12 }; Snd.sfx.release();
    if (best.grouper) { notice('Le mérou est protégé : on ne le pêche jamais !'); G.fouls++; hurt(-p.face); return; }
    if (best.small) { best.flee = 50; best.dir = best.x > cx ? 1 : -1; G.fouls++; Snd.sfx.hurt(); floatText(best.x, best.y - 24, 'Trop petit ! On le laisse grandir', '#ffd0c8'); notice('Taille minimale : un poisson trop petit, on le laisse grandir.'); return; }
    best.caught = true; G.catches++; G.collected += 6; Snd.sfx.trick(); stat('catch');
    const name = { sar: 'Sar', daurade: 'Daurade', loup: 'Loup' }[best.kind];
    floatText(best.x, best.y - 24, name + ' ! +6 ✿', '#ffe08a'); burst(best.x, best.y, 12, ['#e8fbff', '#bfe9ff'], 3);
  }
  function award(id) {
    if (!save.ach || save.ach.includes(id)) return;
    const a = DATA.achievements.find(x => x.id === id); if (!a) return;
    save.ach.push(id); persist();
    G && (G.achQueue = G.achQueue || []).push(a);
    Snd.sfx.medal();
  }
  function stat(k, n) { save.stats[k] = (save.stats[k] || 0) + (n || 1); return save.stats[k]; }
  function seeAnimal(a) {
    if (!a || G.seenNow.has(a.id)) return;
    G.seenNow.add(a.id);
    if (!save.animals.includes(a.id)) { save.animals.push(a.id); persist(); toast('Nouvel animal observé : ' + a.name, a.fact); Snd.sfx.page(); if (save.animals.length >= DATA.animals.length) award('nature'); }
  }

  function revealAround(p) {
    const L = G.L, stack = [];
    for (let tx = Math.floor(p.x / T); tx <= Math.floor((p.x + p.w) / T); tx++) for (let ty = Math.floor(p.y / T); ty <= Math.floor((p.y + p.h) / T); ty++)
      if (Core.tile(L, tx, ty) === 'h') stack.push([tx, ty]);
    let fresh = false;
    while (stack.length) {
      const [x, y] = stack.pop(), k = y * L.w + x;
      if (G.revealed.has(k) || Core.tile(L, x, y) !== 'h') continue;
      G.revealed.add(k); fresh = true;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    if (fresh && !G.hiddenSeen) { award('secret'); G.hiddenSeen = true; Snd.sfx.page(); floatText(p.x + 11, p.y - 20, 'Passage secret !', '#ffe08a'); }
  }

  function updateEntities(p, oldBottom, inp) {
    const L = G.L, cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (const f of G.flowers) if (!f.taken && Math.abs(f.x - cx) < 22 && Math.abs(f.y - cy) < 34) {
      f.taken = true; G.collected++; G.combo++; G.comboT = 45; Snd.sfx.flower(G.combo);
      G.bestCombo = Math.max(G.bestCombo || 0, G.combo);
      if (G.combo >= 10) { G.comboBonus = (G.comboBonus || 0) + 1; }
      if (G.combo === 10 || G.combo === 20 || G.combo === 30) { floatText(f.x, f.y - 30, 'COMBO x' + (G.combo / 10 + 1) + ' !', '#ffe08a'); Snd.sfx.trick(); }
      if (G.combo >= 20) award('combo20');
      if (f.gold) {
        G.collected += 0; G.goldGot = true; Snd.sfx.medal(); G.shake = 6; burst(f.x, f.y, 30, ['#ffe08a', '#f2c230', '#fff'], 5);
        toast('Pâquerette d\'or !', f.got ? 'Déjà trouvée, mais toujours aussi belle.' : '+' + DATA.goldReward + ' pâquerettes pour la boutique. Il y en a une par étape.');
      }
      for (let k = 0; k < 6; k++) G.part.push({ x: f.x, y: f.y, vx: rand(-2, 2), vy: rand(-2.5, 0.5), l: 22, ml: 22, s: 2.2, c: k % 2 ? '#fffaf0' : '#f0b432', g: 0.05, type: 'dot' });
    }
    for (const pg of G.pages) if (!pg.taken && Math.abs(pg.x - cx) < 26 && Math.abs(pg.y - cy) < 38) {
      pg.taken = true; G.pageFound[pg.idx] = true; Snd.sfx.page();
      burst(pg.x, pg.y, 24, ['#ffe08a', '#fffaf0', '#f0b432'], 4);
      toast('Page ' + (pg.gid + 1) + ' sur ' + NPAGES() + (pg.known ? ' (déjà dans le carnet)' : ''), DATA.pages[pg.gid]);
    }
    for (const tr of G.trash) if (!tr.taken && Math.abs(tr.x - cx) < 30 && Math.abs(tr.y - cy) < (G.mode === 'swim' ? 30 : 40)) {
      tr.taken = true; G.trashGot++; G.collected += 3; Snd.sfx.box(); stat('trash');
      floatText(tr.x, tr.y - 18, 'Déchet ramassé ! +3 ✿', '#c9f0b0'); burst(tr.x, tr.y, 8, ['#c9f0b0', '#7dd36a'], 2);
      if (G.trashGot === G.trash.length) {
        toast('Étape propre !', 'Tous les déchets sont ramassés. La nature te dit merci ! (+' + DATA.cleanReward + ' ✿ à la fin de l\'étape, la première fois)');
        Snd.sfx.medal(); for (let k = 0; k < 40; k++) G.part.push({ x: p.x + 11 + rand(-200, 200), y: p.y + p.h, vx: rand(-1, 1), vy: rand(-5, -2), l: 70, ml: 70, s: rand(0.5, 0.9), c: '#fff', g: 0.08, type: 'flower', r: Math.random() * 6 });
      }
    }
    for (const m of G.mounts) {
      if (m.flee) { m.t++; m.x += m.vx; m.vy = Math.min(10, m.vy + 0.5); m.y += m.vy; if (Core.solid(L, Math.floor((m.x + 15) / T), Math.floor((m.y + m.h) / T))) { m.y = Math.floor((m.y + m.h) / T) * T - m.h; m.vy = 0; } continue; }
      m.vy = Math.min(12, m.vy + 0.6);
      if (!m.idle) { Core.moveX(L, m, m.vx); if (m.wall) m.vx = -m.vx; }
      Core.moveY(L, m, m.vy, false);
      if (m.y > L.ph) { m.gone = true; continue; }
      if (m.wait > 0) { m.wait--; continue; }
      if (!G.ride && G.mode === 'walk' && !p.rope && overlap(p, m.x, m.y - 6, m.w, m.h + 6)) {
        G.ride = { kind: m.kind }; m.gone = true; Snd.sfx.spring(); p.vy = Math.min(p.vy, -5); G.anim.sy = 1.2;
        burst(p.x + 11, p.y + p.h, 14, ['#ffe08a', '#fffaf0'], 3);
        notice(m.kind === 'chamois' ? 'En selle sur le chamois ! Tu cours plus vite et tu sautes plus haut.' : 'En selle sur la marmotte ! Tu cours plus vite et tu sautes plus haut.');
        if (stat('ride') >= 1) award('monture');
      }
    }
    G.mounts = G.mounts.filter(m => !m.gone && (!m.flee || m.t < 90));
    for (const gd of G.gourdes) if (!gd.taken && Math.abs(gd.x - cx) < 24 && Math.abs(gd.y - cy) < 34 && G.hearts < maxHearts()) {
      gd.taken = true; G.hearts++; G.heartPulse = 20; Snd.sfx.cairn(); floatText(gd.x, gd.y - 20, '+1 carte Club', '#c9f0b0');
    }
    for (const c of G.cairns) {
      if (c.active) { c.raise = Math.min(1, c.raise + 0.04); continue; }
      if (Math.abs(c.x - cx) < 30 && Math.abs(c.y - (p.y + p.h)) < 40) {
        c.active = true; G.checkpoint = { x: c.x - P.w / 2, y: c.y - P.h };
        G.hearts = owns('barres') ? maxHearts() : Math.min(maxHearts(), G.hearts + 1); G.heartPulse = 20;
        Snd.sfx.cairn(); notice('Cairn : point de reprise'); burst(c.x, c.y - 40, 14, ['#e2683a', '#fffaf0'], 3);
      }
    }
    // ennemis
    for (const e of G.enemies) {
      if (e.dead) { e.dead++; continue; }
      if (Math.abs(e.x - G.cam.x - W / 2) > W) continue;
      if (e.type === 'r') {
        const dir = e.vx > 0 ? 1 : -1;
        e.vy = Math.min(12, e.vy + 0.6);
        Core.moveX(L, e, e.vx); if (e.wall) e.vx = -dir * 1.1;
        Core.moveY(L, e, e.vy, false);
        if (e.onGround) {
          const ax = Math.floor((e.vx > 0 ? e.x + e.w + 2 : e.x - 2) / T), ay = Math.floor((e.y + e.h + 2) / T), c = Core.tile(L, ax, ay);
          if (!Core.solid(L, ax, ay) && c !== '=') e.vx = -e.vx;
        }
        e.roll += e.vx * 0.09;
        if (e.y > L.ph) { e.dead = 1; continue; }
        if (overlap(p, e.x + 3, e.y + 2, e.w - 6, e.h - 2)) {
          if (p.vy > 0 && oldBottom <= e.y + 12) stomp(e, e.x + e.w / 2, e.y, inp);
          else hurt(cx < e.x + e.w / 2 ? -1 : 1);
        }
      } else if (e.type === 'b') {
        e.x = e.x0 + Math.sin(G.time * 0.017 + e.ph) * 90; e.y = e.y0 + Math.sin(G.time * 0.05 + e.ph) * 14;
        if (Math.abs(e.x - cx) < 24 && Math.abs(e.y - cy) < 36) {
          if (p.vy > 0 && oldBottom <= e.y + 8) stomp(e, e.x, e.y - 10, inp);
          else hurt(cx < e.x ? -1 : 1);
        }
      }
    }
    G.enemies = G.enemies.filter(e => e.dead < 22);
    // stalactites et glaçons
    for (const ic of G.icicles) {
      if (ic.state === 0) { if (Math.abs(cx - ic.x) < 46 && p.y > ic.y && p.y - ic.y < 420) { ic.state = 1; ic.t = 34; Snd.sfx.crackle(); } }
      else if (ic.state === 1) { if (--ic.t <= 0) { ic.state = 2; ic.fy = ic.y; ic.vy = 0; } }
      else if (ic.state === 2) {
        ic.vy = Math.min(13, ic.vy + 0.55); ic.fy += ic.vy;
        if (overlap(p, ic.x - 7, ic.fy, 14, 30)) hurt(cx < ic.x ? -1 : 1, 'rock');
        if (Core.solid(L, Math.floor(ic.x / T), Math.floor((ic.fy + 30) / T)) || ic.fy > L.ph) { ic.state = 3; ic.t = 420; Snd.sfx.shatter(); burst(ic.x, ic.fy + 28, 10, G.theme === 'cave' ? ['#8d88a0', '#b4afc0'] : ['#dff3fb', '#ffffff'], 3); }
      } else if (--ic.t <= 0) ic.state = 0;
    }
    // chutes de pierres
    for (const s of G.spawners) {
      if (Math.abs(cx - s.x) > 560 || cy < s.y - 260 || cy > s.y + 700) continue;
      if (--s.t <= 0) {
        s.t = 110 + Math.random() * 60;
        const x = s.x + rand(-60, 60);
        let gy = L.ph + 100;
        for (let ty = Math.max(0, Math.floor((G.cam.y) / T)); ty < L.h; ty++) { const c = Core.tile(L, Math.floor(x / T), ty); if (Core.solid(L, Math.floor(x / T), ty) || c === '=') { gy = ty * T; break; } }
        G.falling.push({ x, y: G.cam.y - 40, vy: 1, gy, s: rand(0.9, 1.3) });
      }
    }
    for (const r of G.falling) {
      r.vy = Math.min(9, r.vy + 0.3); r.y += r.vy;
      if (Math.abs(r.x - cx) < 16 * r.s + 8 && Math.abs(r.y - cy) < 14 * r.s + 22) hurt(cx < r.x ? -1 : 1, 'rock');
      if (r.y >= r.gy - 6) { r.dead = true; burst(r.x, r.gy - 4, 10, ['#7a6e62', '#a29383'], 3); Snd.sfx.crumble(); }
    }
    G.falling = G.falling.filter(r => !r.dead);
    // rochers et barrières
    for (const h of G.hazards) if (overlap(p, h.x - 14, h.y - 26, 28, 26)) hurt(cx < h.x ? -1 : 1);
    // marmottes
    for (const d of G.decor) if (d.type === 'm') {
      const near = Math.abs(d.x - cx) < 170;
      if (near && !d.whistled) { d.whistled = true; Snd.sfx.whistle(); floatText(d.x, d.y - 46, '!', '#fffaf0'); }
      if (!near && Math.abs(d.x - cx) > 260) d.whistled = false;
      d.up += ((near ? 0 : 1) - d.up) * (near ? 0.25 : 0.03);
    }
  }
  function stomp(e, x, y, inp) {
    const p = G.p;
    if (e.type === 'r' && stat('stomp') >= 10) award('caillou10');
    e.dead = 1; p.vy = inp.jumpHeld ? -13 : -9; p.jumping = inp.jumpHeld; p.canDouble = hasGear('poles');
    Snd.sfx.stomp(); G.anim.sy = 0.75; G.anim.sx = 1.25;
    burst(x, y, 12, e.type === 'r' ? ['#7c7d6b', '#a3a48b'] : ['#e0b25a', '#ffffff'], 3);
  }
  function updateLightning(p) {
    if (G.bolt) {
      const b = G.bolt; b.t++;
      if (b.t < 80) { if (b.t % 6 === 0) Snd.sfx.crackle(); }
      else if (b.t === 80) {
        Snd.sfx.thunder(); G.flash = 14; G.shake = 12;
        if (Math.abs(p.x + p.w / 2 - b.x) < 40 && Math.abs(p.y + p.h - b.y) < 110) hurt(p.x + 11 < b.x ? -1 : 1);
        burst(b.x, b.y, 18, ['#fff7b0', '#ffffff', '#ffd35a'], 5);
      } else if (b.t > 100) G.bolt = null;
      return;
    }
    if (--G.boltT > 0) return;
    G.boltT = 150 + Math.random() * 90;
    const x = p.x + p.w / 2 + p.vx * 30 + rand(-40, 160);
    const tx = Math.floor(x / T);
    for (let ty = 0; ty < G.L.h; ty++) if (Core.solid(G.L, tx, ty)) { G.bolt = { x: tx * T + 16, y: ty * T, t: 0, seed: Math.random() * 100 }; break; }
  }
  function updateParticles() {
    for (const q of G.part) { q.x += q.vx; q.y += q.vy; q.vy += q.g; q.l--; if (q.type === 'leaf') q.vy += Math.sin(q.l * 0.1) * 0.05; }
    G.part = G.part.filter(q => q.l > 0);
    if (G.part.length > 500) G.part.splice(0, G.part.length - 500);
  }
  function updateDialog(d) {
    const line = d.lines[d.i];
    const before = Math.floor(d.chars);
    d.chars = Math.min(line[1].length, d.chars + 1.3);
    if (Math.floor(d.chars) !== before && Math.floor(d.chars) % 3 === 0 && d.chars < line[1].length) Snd.sfx.talk();
    if (pressed.has('jump') || pressed.has('ok') || pressed.has('act') || pressed.has('click')) {
      if (d.chars < line[1].length) d.chars = line[1].length;
      else if (d.i < d.lines.length - 1) { d.i++; d.chars = 0; Snd.sfx.click(); }
      else { const cb = d.cb; if (G && G.dialog === d) G.dialog = null; Snd.sfx.click(); if (cb) cb(); }
    }
  }

  /* ───────── Dessin du jeu ───────── */
  function drawPlay() {
    const L = G.L, p = G.p, th = G.theme;
    const sh = G.shake ? (Math.random() - 0.5) * G.shake : 0, sv = G.shake ? (Math.random() - 0.5) * G.shake : 0;
    const cam = { x: G.cam.x + sh, y: G.cam.y + sv };
    const prog = clamp(p.x / L.pw, 0, 1);
    R.background(ctx, th, cam, tick, prog, L.ph, G.flash > 0);
    const rotA = { snow: 0.12, ski: 0.12, bike: 0.05 }[G.mode] || 0, rot = rotA > 0;
    ctx.save();
    if (rot) { ctx.translate(W / 2, H / 2); ctx.rotate(rotA); ctx.scale(1 + rotA * 0.8, 1 + rotA * 0.8); ctx.translate(-W / 2, -H / 2); }
    ctx.translate(-Math.round(cam.x), -Math.round(cam.y));
    if (rot) { ctx.fillStyle = R.PAL[th].body; ctx.fillRect(cam.x - 400, L.ph - 2, W + 800, 900); }
    // éléments cachés (derrière les passages secrets)
    for (const f of G.flowers) if (f.hidden && !f.taken) R.flower(ctx, f.x, f.y + Math.sin(tick * 0.07 + f.ph) * 2, 0.9);
    for (const pg of G.pages) if (pg.hidden && !pg.taken) R.page(ctx, pg.x, pg.y, tick);
    // décor de fond
    for (const d of G.decor) if (d.type === 'W') R.wreck(ctx, d.x, d.y);
    for (const t2 of G.thermals) if (Math.abs(t2.x - p.x) < W) R.thermal(ctx, t2.x, 3 * T, t2.bottom, tick);
    if (G.exit) { if (G.meta.exit === 'target') R.target(ctx, G.exit.x, G.exit.y); else if (G.meta.exit === 'boat') R.boat(ctx, G.exit.x, G.exit.y - 4, tick); else R.exit(ctx, G.meta.exit, G.exit.x, G.exit.y, tick); }
    for (const r2 of G.ravitos) R.ravito(ctx, r2.x, r2.y, tick, r2.used);
    for (const s of G.signs) R.sign(ctx, s.x, s.y);
    for (const c of G.cairns) R.cairn(ctx, c.x, c.y, c.active, c.raise, tick);
    for (const d of G.decor) {
      if (d.type === 'm') R.marmot(ctx, d.x, d.y, d.up, tick);
      else if (d.type === 'g') R.ibex(ctx, d.x, d.y, tick);
      else if (d.type === 'x') R.crystal(ctx, d.x, d.y, tick);
      else if (d.type === 'Z' || d.type === 'X') R.balise(ctx, d.x, d.y, d.type === 'Z');
      else if (d.type === 'H') R.owl(ctx, d.x, d.y, tick);
      else if (d.type === 'e') R.squirrel(ctx, d.x, d.y, tick);
      else if (d.type === 'c') R.chamois(ctx, d.x, d.y, tick);
      else if (d.type === 'k') R.fishes(ctx, d.x, d.y, tick);
      else if (d.type === 'O') R.octopus(ctx, d.x, d.y, tick);
      else if (d.type === 'U') R.grouper(ctx, d.x, d.y, tick);
    }
    const near = hasGear('rope') && !p.rope ? nearestAnchor(p) : null;
    for (const a of G.anchors) R.anchor(ctx, a.x, a.y, a === near, tick);
    if (G.npc) R.person(ctx, G.npc.who, G.npc.x, G.npc.y, tick, -1, 1, G.finish || Math.abs(p.x - G.npc.x) < 300);
    // ombres des pierres qui tombent
    for (const r of G.falling) { const k = clamp(1 - (r.gy - r.y) / 500, 0.1, 1); ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * k) + ')'; ctx.beginPath(); ctx.ellipse(r.x, r.gy - 2, 18 * k * r.s, 5 * k, 0, 0, Math.PI * 2); ctx.fill(); }
    R.springPulse = (tx, ty) => (G.springs.get(tx + ',' + ty) || 0) / 12;
    R.tiles(ctx, L, cam, th, tick, (tx, ty) => G.reveal.get(ty * L.w + tx) ?? 1);
    for (const pl of G.plats) R.platform(ctx, pl.x, pl.y, pl.w, th);
    for (const f of G.flowers) if (!f.hidden && !f.taken) {
      if (f.gold) { R.circle(ctx, f.x, f.y, 20 + Math.sin(tick * 0.15) * 4, '#ffe08a44'); R.flower(ctx, f.x, f.y + Math.sin(tick * 0.07) * 3, 1.5, true, tick * 0.02); if (tick % 12 === 0) G.part.push({ x: f.x + rand(-14, 14), y: f.y + rand(-14, 14), vx: 0, vy: -0.4, l: 30, ml: 30, s: 1.6, c: '#fff6c0', g: 0, type: 'dot' }); }
      else R.flower(ctx, f.x, f.y + Math.sin(tick * 0.07 + f.ph) * 2, 0.9);
    }
    for (const pg of G.pages) if (!pg.hidden && !pg.taken) { if (pg.known) ctx.globalAlpha = 0.55; R.page(ctx, pg.x, pg.y, tick); ctx.globalAlpha = 1; }
    for (const gd of G.gourdes) if (!gd.taken) R.gourde(ctx, gd.x, gd.y, tick);
    for (const h of G.hazards) R.hazardRock(ctx, h.x, h.y, th, tick);
    for (const ic of G.icicles) if (ic.state < 2) R.stalactite(ctx, ic, th); else if (ic.state === 2) R.stalactite(ctx, { x: ic.x, y: ic.fy, state: 0 }, th);
    for (const e of G.enemies) { if (e.type === 'r') R.caillou(ctx, e, tick); else R.tourbillon(ctx, e.x, e.y, tick, th, e.dead); }
    for (const r of G.falling) R.rock(ctx, r.x, r.y, r.s, tick);
    for (const w of G.walkers) R.walker(ctx, w, tick);
    for (const gt of G.gates) R.gate(ctx, gt, tick);
    for (const c of G.clouds) R.stormCloud(ctx, c.x, c.y, tick);
    for (const a of G.airs) R.bubbles(ctx, a.x, a.y, tick, a.cd > 0);
    for (const j of G.jellies) R.jelly(ctx, j.x, j.y, tick);
    for (const tr of G.trash) if (!tr.taken) R.trash(ctx, tr.x, tr.y, tick, G.theme);
    for (const m of G.mounts) { if (m.flee) ctx.globalAlpha = Math.max(0, 1 - m.t / 90); R.mountRide(ctx, m.kind, m.x + m.w / 2, m.y + m.h, tick, !m.idle, m.vx < 0 ? -1 : 1, 0.75); ctx.globalAlpha = 1; }
    for (const f of G.fish) if (!f.caught) R.fish(ctx, f.x, f.y, tick, f.kind, f.small ? 0.55 : 1, f.dir);
    if (G.def.apnea) R.diveBuoy(ctx, G.p, G.surface, tick);
    if (G.shot) { ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 2; ctx.globalAlpha = G.shot.t / 12; ctx.beginPath(); ctx.moveTo(G.p.x + G.p.w / 2 + G.p.face * 20, G.p.y + G.p.h / 2); ctx.lineTo(G.shot.x, G.shot.y); ctx.stroke(); ctx.globalAlpha = 1; }
    if (G.gyp) R.gypaete(ctx, G.gyp.x, G.gyp.y, tick, 0.8);
    if (p.rope) { ctx.strokeStyle = '#e8c35a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.rope.ax, p.rope.ay); ctx.lineTo(p.x + p.w / 2, p.y + 4); ctx.stroke(); }
    if (G.bolt) drawBolt(G.bolt);
    drawPlayer();
    drawParts(true);
    R.water(ctx, L, cam, th, tick);
    if (G.av) drawAvalanche();
    if (owns('boussole')) drawCompass(p);
    ctx.restore();
    if (G.def.dark) drawDark(cam);
    if (G.def.fog) drawFog(cam);
    drawWeather(cam);
    if (G.flash) { ctx.fillStyle = 'rgba(255,255,240,' + (G.flash / 20) + ')'; ctx.fillRect(0, 0, W, H); }
    // bulle de panneau
    drawHud();
    drawBottomBar(p);
    if (G.time < 170 && !G.finish) drawTitleCard();
    if (G.finish) R.celebration(ctx, G.finish.t, { time: fmt(G.time / 60), pages: G.pageFound.filter(Boolean).length, trash: G.trash.length ? G.trashGot + ' / ' + G.trash.length : null, flowers: G.collected });
    if (G.iris.r < 1) drawIris((p.x + 11 - G.cam.x), (p.y + 20 - G.cam.y), G.iris.r);
    if (G.dying > 30) { ctx.fillStyle = 'rgba(20,30,25,' + ((G.dying - 30) / 40) + ')'; ctx.fillRect(0, 0, W, H); }
  }
  function nearestAnchor(p) {
    let best = null, bd = P.ropeRange;
    for (const a of G.anchors) { const dy = p.y - a.y; if (dy < 16) continue; const d = Math.hypot(p.x + 11 - a.x, dy); if (d < bd) { bd = d; best = a; } }
    return best;
  }
  function drawPlayer() {
    const p = G.p, a = G.anim, id = G.def.sprite, cx = p.x + p.w / 2, feet = p.y + p.h;
    if (G.invuln > 0 && !G.dying && Math.floor(G.invuln / 4) % 2 === 0) return;
    if (G.mode === 'walk' && !p.rope) {
      let gy = null; for (let ty = Math.floor(feet / T); ty < Math.min(G.L.h, Math.floor(feet / T) + 6); ty++) if (Core.solid(G.L, Math.floor(cx / T), ty) || Core.tile(G.L, Math.floor(cx / T), ty) === '=') { gy = ty * T; break; }
      if (gy !== null) { const k = clamp(1 - (gy - feet) / 200, 0.2, 1); ctx.fillStyle = 'rgba(0,0,0,' + 0.22 * k + ')'; ctx.beginPath(); ctx.ellipse(cx, gy, 16 * k, 4 * k, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    const flip = p.face > 0;
    if (G.mode === 'walk' && G.ride && !p.rope) {
      const dy = (a.stepOff || 0);
      ctx.save(); ctx.translate(cx, feet + dy); ctx.scale(a.sx, a.sy);
      R.mountRide(ctx, G.ride.kind, 0, 0, tick, p.onGround && Math.abs(p.vx) > 0.6, flip ? 1 : -1, 1, p.onGround ? 0 : p.vy);
      R.vieux(ctx, id, flip ? -2 : 2, -36 + 72 * 0.38, 72, { flip, crop: 0.62 });
      ctx.restore(); return;
    }
    if (G.mode === 'kayak' && G.swimLeg) {
      const bob = Math.sin(tick * 0.12) * 1.5, stroke = tick * 0.22;
      ctx.save(); ctx.translate(cx, feet + 13 + bob); ctx.rotate(Math.PI / 2 + (p.onGround ? 0 : clamp(p.vy * 0.03, -0.3, 0.3)));
      R.vieux(ctx, 8, 0, 30, 62, { flip: true });
      ctx.restore();
      R.swimArms(ctx, cx, feet + bob, stroke);
      if (p.onGround && tick % 5 === 0) G.part.push({ x: cx - 30, y: feet - 2, vx: -1.5, vy: -1.2, l: 16, ml: 16, s: 2.4, c: '#ffffff', g: 0.12, type: 'dot' });
      return;
    }
    if (p.rope) {
      ctx.save(); ctx.translate(cx, p.y + 4); ctx.rotate(-p.rope.ang);
      R.vieux(ctx, id, 0, p.h + 10, 72, { flip }); ctx.restore(); return;
    }
    if (G.mode === 'kayak') {
      const bob = Math.sin(tick * 0.12) * 1.5, k = p.onGround ? 0 : clamp(p.vy * 0.02, -0.2, 0.2);
      ctx.save(); ctx.translate(cx, feet - 4 + bob); ctx.rotate(k);
      R.vieux(ctx, 8, 2, 72 - 72 * 0.6 - 6, 72, { flip: true, crop: 0.6 });
      ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.ellipse(2, -8, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
      const pa = Math.sin(tick * 0.18) * 0.9;
      ctx.save(); ctx.translate(2, -26); ctx.rotate(pa);
      ctx.fillStyle = '#d9c39a'; ctx.fillRect(-34, -2, 68, 4); R.rrect(ctx, -44, -5, 14, 10, 4, '#e84a3c'); R.rrect(ctx, 30, -5, 14, 10, 4, '#e84a3c'); ctx.restore();
      R.poly(ctx, [[-46, -8], [44, -8], [56, -14], [36, 2], [-34, 2], [-54, -12]], '#e2683a');
      R.poly(ctx, [[-46, -8], [44, -8], [40, -4], [-42, -4]], '#ffb070');
      ctx.restore(); return;
    }
    if (G.mode === 'bike') {
      const k = p.onGround ? 0 : clamp(p.vy * 0.02, -0.25, 0.25), wr = (G.bikeRot = (G.bikeRot || 0) + p.vx * 0.08);
      ctx.save(); ctx.translate(cx, feet - 13); ctx.rotate(k);
      for (const wx of [-22, 22]) { ctx.strokeStyle = '#222'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, 0, 13, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#999'; ctx.lineWidth = 1; for (let s = 0; s < 4; s++) { const a = wr + s * Math.PI / 4; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(wx - Math.cos(a) * 12, -Math.sin(a) * 12); ctx.stroke(); } }
      ctx.strokeStyle = '#2f9e6f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(-4, -16); ctx.lineTo(16, -16); ctx.lineTo(22, 0); ctx.moveTo(-4, -16); ctx.lineTo(2, 0); ctx.lineTo(-22, 0); ctx.moveTo(16, -16); ctx.lineTo(14, -24); ctx.stroke();
      R.vieux(ctx, 8, 0, -4, 66, { flip: true, crop: 0.66, dy: 0 });
      ctx.fillStyle = '#2f9e6f'; ctx.beginPath(); ctx.arc(4, -62, 11, Math.PI, 0); ctx.fill();
      ctx.restore(); return;
    }
    if (G.mode === 'fly') {
      const sway = Math.sin(tick * 0.05) * 0.06 + clamp(p.vy * 0.03, -0.1, 0.1);
      ctx.save(); ctx.translate(cx, p.y); ctx.rotate(sway);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 16, -78); ctx.lineTo(0, 4); ctx.stroke(); }
      ctx.fillStyle = '#e2683a'; ctx.beginPath(); ctx.ellipse(0, -78, 76, 24, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f2c230'; for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.ellipse(i * 19, -78, 9, 22, 0, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = '#c0501f'; ctx.fillRect(-76, -80, 152, 3);
      R.vieux(ctx, id, 0, p.h + 4, 64, { flip: true });
      ctx.restore(); return;
    }
    if (G.mode === 'swim') {
      const kick = Math.sin(tick * (Math.abs(p.vx) + Math.abs(p.vy) > 1 ? 0.3 : 0.1)) * 0.25;
      ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h / 2); ctx.scale(p.face, 1); ctx.rotate(Math.PI / 2 + clamp(p.vy * 0.06, -0.4, 0.4));
      R.vieux(ctx, 8, 0, 34, 66, { flip: false });
      ctx.fillStyle = '#1b2b3a'; ctx.save(); ctx.translate(-6, 34); ctx.rotate(kick); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(12, 22); ctx.lineTo(-10, 22); ctx.fill(); ctx.restore();
      R.rrect(ctx, -30, -22, 14, 12, 4, '#1b4f6f'); ctx.fillStyle = '#9fd8f0'; ctx.fillRect(-28, -20, 9, 8);
      ctx.fillStyle = '#b8b8b8'; R.rrect(ctx, -2, -6, 26, 10, 5, '#c9c9c9');
      ctx.restore(); return;
    }
    if (G.mode === 'ski') {
      const spin = p.spinT ? Math.min(1, p.spinT / 26) * Math.PI * 2 : 0;
      ctx.save(); ctx.translate(cx, feet - 4); ctx.rotate(spin + (p.onGround ? 0 : clamp(p.vy * 0.02, -0.25, 0.3)));
      R.rrect(ctx, -36, 0, 72, 4, 2, '#d0302f'); R.rrect(ctx, -32, -4, 72, 4, 2, '#1e6fd0');
      ctx.strokeStyle = '#444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(12, -40); ctx.lineTo(-18, 2); ctx.moveTo(18, -38); ctx.lineTo(-6, 2); ctx.stroke();
      R.vieux(ctx, 8, 0, -3, 64, { flip: true, sy: p.onGround ? 0.9 : 1.02 });
      ctx.restore(); return;
    }
    if (G.mode === 'snow') {
      const spin = p.spinT ? Math.min(1, p.spinT / 26) * Math.PI * 2 : 0;
      ctx.save(); ctx.translate(cx, feet - 4); ctx.rotate(spin + (p.onGround ? 0 : clamp(p.vy * 0.02, -0.25, 0.3)));
      R.rrect(ctx, -34, -2, 68, 7, 4, '#1e8bc3'); ctx.fillStyle = '#e2683a'; ctx.fillRect(-6, -2, 4, 7); ctx.fillRect(2, -2, 4, 7);
      R.vieux(ctx, 8, 0, -1, 64, { flip: true, sy: p.onGround ? 0.92 : 1.02 });
      ctx.restore();
      if (p.onGround && p.gTile === 'I') G.part.push({ x: cx - 30, y: feet - 2, vx: -2, vy: -1, l: 14, ml: 14, s: 2, c: '#e5fbff', g: 0, type: 'dot' });
      return;
    }
    const flipRot = a.flip ? (a.flip / 20) * Math.PI * 2 * (flip ? 1 : -1) : 0;
    const dead = G.dying ? a.rot : 0;
    if (flipRot) { ctx.save(); ctx.translate(cx, feet - 35); ctx.rotate(flipRot); R.vieux(ctx, id, 0, 35, 72, { flip }); ctx.restore(); }
    else R.vieux(ctx, id, cx, feet + 3 + (a.stepOff || 0) + (p.onGround && p.gTile === 'w' ? 26 : 0), 72, { flip, sx: a.sx, sy: a.sy, rot: a.rot + dead, dy: -a.bob });
    if (G.def.dark) { R.circle(ctx, cx + (flip ? 14 : -14), p.y + 6, 4, '#fff3c0'); }
  }
  function drawParts() {
    for (const q of G.part) {
      const al = clamp(q.l / q.ml, 0, 1);
      ctx.globalAlpha = q.type === 'smoke' ? al * 0.6 : al;
      if (q.type === 'flower') R.flower(ctx, q.x, q.y, q.s, false, q.r + q.l * 0.1);
      else if (q.type === 'smoke') R.circle(ctx, q.x, q.y, q.s + (1 - al) * 8, q.c);
      else if (q.type === 'text') { ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#20382c'; ctx.fillText(q.text, q.x + 1, q.y + 1); ctx.fillStyle = q.c; ctx.fillText(q.text, q.x, q.y); ctx.textAlign = 'left'; }
      else if (q.type === 'leaf') { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r + q.l * 0.2); ctx.fillStyle = q.c; ctx.fillRect(-q.s, -q.s / 2, q.s * 2, q.s); ctx.restore(); }
      else R.circle(ctx, q.x, q.y, q.s, q.c);
    }
    ctx.globalAlpha = 1;
  }
  function drawBolt(b) {
    if (b.t < 80) {
      const k = b.t / 80;
      ctx.fillStyle = 'rgba(255,240,150,' + (0.15 + 0.35 * k) + ')'; ctx.beginPath(); ctx.ellipse(b.x, b.y, 30 + k * 16, 8, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 3; i++) { const a = Math.random() * Math.PI; ctx.strokeStyle = '#fff7b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(b.x + Math.cos(a) * 20, b.y - 4); ctx.lineTo(b.x + Math.cos(a) * 30, b.y - 14 - Math.random() * 10); ctx.stroke(); }
      if (b.t > 40 && b.t % 10 < 5) { ctx.fillStyle = '#ffd35a'; ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚡', b.x, b.y - 30); ctx.textAlign = 'left'; }
    } else if (b.t < 92) {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.shadowColor = '#fff7b0'; ctx.shadowBlur = 20;
      ctx.beginPath(); let x = b.x + rand(-20, 20), y = G.cam.y - 20; ctx.moveTo(x, y);
      while (y < b.y) { y += rand(30, 60); x += rand(-24, 24); ctx.lineTo(Math.min(y, b.y) === b.y ? b.x : x, Math.min(y, b.y)); }
      ctx.stroke(); ctx.shadowBlur = 0;
    }
  }
  function drawAvalanche() {
    const x = G.av.x, top = G.cam.y - 300, bot = G.L.ph + 300;
    const g = ctx.createLinearGradient(x - 400, 0, x + 40, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(0.85, '#f4f9fc'); g.addColorStop(1, '#f4f9fc00');
    ctx.fillStyle = g; ctx.fillRect(x - 1400, top, 1440, bot - top);
    for (let i = 0; i < 18; i++) { const yy = top + 100 + i * 50 + Math.sin(tick * 0.1 + i) * 10; R.circle(ctx, x + Math.sin(tick * 0.2 + i * 2) * 14, yy, 36 + (i % 3) * 10, '#ffffff'); }
  }
  function drawCompass(p) {
    const left = G.pages.filter(pg => !pg.taken); if (!left.length || G.dialog) return;
    let best = left[0], bd = 1e9; for (const pg of left) { const d = Math.hypot(pg.x - p.x, pg.y - p.y); if (d < bd) { bd = d; best = pg; } }
    if (bd < 80) return;
    const a = Math.atan2(best.y - (p.y + 20), best.x - (p.x + 11)), cx = p.x + 11 + Math.cos(a) * 52, cy = p.y + 20 + Math.sin(a) * 52;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.globalAlpha = 0.85;
    R.poly(ctx, [[10, 0], [-6, -7], [-2, 0], [-6, 7]], '#ffd35a'); ctx.restore(); ctx.globalAlpha = 1;
  }
  const darkC = document.createElement('canvas'); darkC.width = W / 2; darkC.height = H / 2; const dctx = darkC.getContext('2d');
  function drawTitleCard() {
    const t = G.titleT = (G.titleT || 0) + 1, k = Math.min(1, t / 18, (170 - t) / 20);
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - Math.min(1, t / 18)) * -60, 0);
    const y = 150;
    R.rrect(ctx, 0, y, 520, 108, 0, '#20382cdd'); R.poly(ctx, [[520, y], [560, y + 54], [520, y + 108]], '#20382cdd');
    ctx.fillStyle = '#e9a44c'; ctx.font = '800 13px system-ui'; ctx.fillText(('Étape ' + (G.i + 1) + ' sur ' + LEVELS.length + '  ·  ' + G.meta.activity).toUpperCase(), 40, y + 30);
    ctx.fillStyle = '#fff8e8'; ctx.font = 'bold 38px Georgia, serif'; ctx.fillText(G.meta.name, 40, y + 72);
    ctx.fillStyle = '#d8e2cf'; ctx.font = '500 14px system-ui';
    const goal = G.meta.goal ? G.meta.goal + ' · Or en ' + fmt(G.par[0]) : G.meta.npc ? 'Rejoins ' + DATA.names[G.meta.npc].split(',')[0] + ' · Or en ' + fmt(G.par[0]) : 'Or en ' + fmt(G.par[0]);
    ctx.fillText(goal, 40, y + 96);
    ctx.restore();
  }
  function drawFog(cam) {
    const k = 0.5, p = G.p;
    dctx.globalCompositeOperation = 'source-over'; dctx.fillStyle = 'rgba(226,228,222,0.86)'; dctx.fillRect(0, 0, W * k, H * k);
    dctx.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r) => { const sx = (x - cam.x) * k, sy = (y - cam.y) * k; const g2 = dctx.createRadialGradient(sx, sy, 0, sx, sy, r * k); g2.addColorStop(0, 'rgba(0,0,0,1)'); g2.addColorStop(0.55, 'rgba(0,0,0,0.85)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = g2; dctx.fillRect(sx - r * k, sy - r * k, r * 2 * k, r * 2 * k); };
    hole(p.x + 11 + p.face * 60, p.y + 20, 270);
    for (const d of G.decor) if (d.type === 'Z' && hasGear('topo')) hole(d.x, d.y - 20, 90);
    ctx.drawImage(darkC, 0, 0, W, H);
  }
  function drawDark(cam) {
    const k = 0.5, p = G.p;
    dctx.globalCompositeOperation = 'source-over'; dctx.fillStyle = 'rgba(8,9,18,0.84)'; dctx.fillRect(0, 0, W * k, H * k);
    dctx.globalCompositeOperation = 'destination-out';
    const light = (x, y, r) => { const sx = (x - cam.x) * k, sy = (y - cam.y) * k; if (sx < -r || sx > W * k + r || sy < -r || sy > H * k + r) return; const g = dctx.createRadialGradient(sx, sy, 0, sx, sy, r * k); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.6, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = g; dctx.fillRect(sx - r * k, sy - r * k, r * 2 * k, r * 2 * k); };
    light(p.x + 11, p.y + 10, 210); light(p.x + 11 + p.face * 150, p.y + 20, 180);
    for (const d of G.decor) if (d.type === 'x') light(d.x, d.y - 14, 110);
    for (const c of G.cairns) if (c.active) light(c.x, c.y - 30, 90);
    for (const pg of G.pages) if (!pg.taken && !pg.hidden) light(pg.x, pg.y, 50);
    if (G.exit) light(G.exit.x, G.exit.y - 60, 240);
    if (G.npc) light(G.npc.x, G.npc.y - 40, 90);
    ctx.drawImage(darkC, 0, 0, W, H);
    const sx = p.x + 11 - cam.x + p.face * 60, sy = p.y + 14 - cam.y;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 180); g.addColorStop(0, 'rgba(255,220,140,0.12)'); g.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - 180, sy - 180, 360, 360);
  }
  function drawWeather(cam) {
    const th = G.theme;
    const dx = (G.lastCamX ?? cam.x) - cam.x, dy = (G.lastCamY ?? cam.y) - cam.y; G.lastCamX = cam.x; G.lastCamY = cam.y;
    for (const w of G.weather) {
      w.x += dx * (0.5 + w.s * 0.5); w.y += dy * (0.5 + w.s * 0.5);
      if (th === 'snow' || th === 'glacier') { w.y += 0.6 + w.s * 1.2; w.x += Math.sin(tick * 0.02 + w.ph) * 0.4 - 0.3; ctx.fillStyle = '#ffffffcc'; ctx.beginPath(); ctx.arc(w.x, w.y, 1 + w.s * 1.8, 0, 7); ctx.fill(); }
      else if (th === 'storm') { w.y += 7 + w.s * 4; w.x += G.lean * 6 - 1; ctx.strokeStyle = '#dfe8f0aa'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x - G.lean * 8 + 2, w.y - 12); ctx.stroke(); }
      else if (th === 'cave') { if (w.s > 0.75) { w.y += 3; ctx.fillStyle = '#86d4e6aa'; ctx.fillRect(w.x, w.y, 1.5, 5); } }
      else if (th === 'lake') { const n = clamp((G.p.x / G.L.pw - 0.4) * 2, 0, 1); if (w.s > 0.6 && n > 0) { w.x += Math.sin(tick * 0.02 + w.ph) * 0.5; w.y += Math.cos(tick * 0.017 + w.ph) * 0.4; ctx.globalAlpha = n * (0.5 + 0.5 * Math.sin(tick * 0.08 + w.ph)); R.circle(ctx, w.x, w.y, 2.2, '#ffef9a'); ctx.globalAlpha = 1; } }
      else if (th === 'forest' || th === 'river') { if (w.s > 0.8) { w.x += Math.sin(tick * 0.01 + w.ph) * 0.3 + 0.2; w.y += 0.25; R.circle(ctx, w.x, w.y, 1.4, '#fff6d0aa'); } }
      else if (th === 'cliff') { if (w.s > 0.85) { w.x -= 0.4; w.y += Math.sin(tick * 0.03 + w.ph) * 0.3; R.circle(ctx, w.x, w.y, 1.2, '#fff2d8aa'); } }
      if (w.y > H + 10) { w.y = -10; w.x = Math.random() * W; } if (w.y < -12) w.y = H + 8;
      if (w.x > W + 10) w.x = -10; if (w.x < -12) w.x = W + 8;
    }
  }
  function drawIris(x, y, r) {
    const rad = r * 1150;
    ctx.fillStyle = '#14251c'; ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.arc(x, y, Math.max(0.1, rad), 0, Math.PI * 2, true); ctx.fill('evenodd');
  }
  function drawHud() {
    const pulse = G.heartPulse ? 1 + Math.sin(G.heartPulse * 0.6) * 0.15 : 1;
    const fx = 44 + maxHearts() * 42;
    R.rrect(ctx, 14, 12, fx + (G.trash.length ? 276 : 190), 46, 14, '#14251cb8');
    for (let k = 0; k < maxHearts(); k++) R.carte(ctx, 44 + k * 42, 35, k < G.hearts ? pulse : 1, k < G.hearts);
    R.flower(ctx, fx, 35, 0.85);
    ctx.font = 'bold 18px system-ui'; ctx.fillStyle = '#fff4dc'; ctx.fillText(G.collected + '/' + G.total, fx + 16, 41);
    const px = fx + 104;
    for (let k = 0; k < 3; k++) {
      const pg = G.pages.find(q => q.idx === k), got = G.pageFound[k], known = pg && pg.known;
      R.rrect(ctx, px + k * 22, 24, 16, 22, 2, got ? '#fbf1d8' : known ? '#fbf1d855' : '#ffffff18');
      if (got) { ctx.fillStyle = '#9b8457'; ctx.fillRect(px + k * 22 + 3, 30, 10, 2); ctx.fillRect(px + k * 22 + 3, 35, 8, 2); }
    }
    if (G.trash.length) { const tx0 = px + 76; R.trashIcon(ctx, tx0, 35); ctx.textAlign = 'left'; ctx.font = 'bold 14px system-ui'; ctx.fillStyle = G.trashGot === G.trash.length ? '#c9f0b0' : '#fff4dc'; ctx.fillText(G.trashGot + '/' + G.trash.length, tx0 + 12, 40); }
    R.rrect(ctx, W - 436, 12, 288, 46, 14, '#14251cb8');
    ctx.textAlign = 'right'; ctx.font = 'bold 14px system-ui'; ctx.fillStyle = '#fff4dc';
    ctx.fillText(G.meta.name, W - 162, 32); ctx.font = '13px system-ui'; ctx.fillStyle = '#d8e2cf';
    const secs = G.time / 60, md = medalOf(G.i, secs), nextT = G.par[md === 3 ? 0 : 3 - Math.max(1, md)] || G.par[2];
    ctx.fillText(G.meta.activity + ' · ' + fmt(secs), W - 162, 50);
    if (md > 0) { R.circle(ctx, W - 418, 35, 9, MEDAL_COL[md]); ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff4dc'; ctx.fillText(fmt(G.par[3 - md]), W - 404, 39); ctx.textAlign = 'right'; }
    const gauge = (label, v, max, col, y) => { ctx.textAlign = 'left'; R.rrect(ctx, 14, y, 210, 24, 12, '#14251cb8'); R.rrect(ctx, 70, y + 7, 146 * clamp(v / max, 0, 1), 10, 5, col); ctx.strokeStyle = '#ffffff40'; ctx.lineWidth = 1; ctx.strokeRect(70, y + 7, 146, 10); ctx.font = 'bold 11px system-ui'; ctx.fillStyle = '#fff4dc'; ctx.fillText(label, 24, y + 16); ctx.textAlign = 'right'; };
    const cxo = G.trash.length ? 236 : 170; if (G.combo >= 3) { const cz = 1 + Math.sin(tick * 0.3) * 0.05; ctx.save(); ctx.translate(fx + cxo, 35); ctx.scale(cz, cz); ctx.textAlign = 'left'; ctx.font = 'bold 15px system-ui'; ctx.fillStyle = G.combo >= 10 ? '#f2c230' : '#fff4dc'; ctx.fillText('×' + G.combo, 0, 6); ctx.restore(); ctx.textAlign = 'right'; R.rrect(ctx, fx + cxo - 2, 50, 44 * (G.comboT / 45), 3, 2, '#f2c230'); }
    if (G.trail) gauge(G.tired ? 'À BOUT' : 'ÉNERGIE', G.sta, G.staMax, G.tired ? '#e8505b' : G.sprint ? '#f2c230' : '#7dd36a', 64);
    if (G.mode === 'fly') gauge('ÉLAN', G.elan, 100, G.elan < 18 ? '#e8505b' : '#f2c230', 64);
    if (G.mode === 'swim') gauge(G.def.apnea ? 'APNÉE' : 'AIR', G.air, G.airMax, G.air < 25 ? '#e8505b' : '#7fd6ff', 64);
    if (G.fish.length) { ctx.textAlign = 'left'; R.rrect(ctx, 14, 92, 210, 24, 12, '#14251cb8'); ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#fff4dc'; ctx.fillText('PRISES ' + G.catches + (G.fouls ? '  ·  erreurs ' + G.fouls : '') + '  ·  X pour pêcher', 26, 109); ctx.textAlign = 'right'; }
    if (G.ride) { ctx.textAlign = 'left'; R.rrect(ctx, 14, 64, 150, 24, 12, '#14251cb8'); ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#ffe08a'; ctx.fillText(G.ride.kind === 'chamois' ? 'EN CHAMOIS !' : 'EN MARMOTTE !', 26, 81); ctx.textAlign = 'right'; }
    if (G.mode === 'ski') { ctx.textAlign = 'left'; R.rrect(ctx, 14, 64, 210, 24, 12, '#14251cb8'); ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#fff4dc'; ctx.fillText('PORTES ' + G.gates.filter(q => q.state === 1).length + '/' + G.gates.length + (G.penalty ? '  ·  +' + G.penalty + ' s' : ''), 26, 81); ctx.textAlign = 'right'; }
    ctx.textAlign = 'left';
    if (G.av) {
      const d = clamp((G.p.x - G.av.x) / 900, 0, 1);
      R.rrect(ctx, W / 2 - 110, 18, 220, 14, 7, '#14251cb8'); R.rrect(ctx, W / 2 - 108, 20, 216 * d, 10, 5, d < 0.35 ? '#e8505b' : '#e9a44c');
      ctx.font = 'bold 12px system-ui'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText('AVALANCHE', W / 2, 48); ctx.textAlign = 'left';
    }
  }
  // Bandeau unique en bas de l'écran : dialogue > page trouvée > panneau > info > aide corde
  function drawBottomBar(p) {
    if (G.achQueue && G.achQueue.length && !G.achShow) G.achShow = { a: G.achQueue.shift(), t: 200 };
    if (G.achShow) {
      const k = Math.min(1, (200 - G.achShow.t) / 12, G.achShow.t / 15);
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * -20);
      R.rrect(ctx, W / 2 - 170, 66, 340, 52, 14, '#20382cf0'); R.circle(ctx, W / 2 - 140, 92, 16, '#f2c230');
      ctx.fillStyle = '#20382c'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('★', W / 2 - 140, 98); ctx.textAlign = 'left';
      ctx.fillStyle = '#f2c230'; ctx.font = 'bold 11px system-ui'; ctx.fillText('SUCCÈS DÉBLOQUÉ', W / 2 - 112, 86);
      ctx.fillStyle = '#fff4dc'; ctx.font = 'bold 16px system-ui'; ctx.fillText(G.achShow.a.name, W / 2 - 112, 106);
      ctx.restore();
      if (--G.achShow.t <= 0) G.achShow = null;
    }
    if (G.dialog) { R.dialog(ctx, G.dialog, tick); return; }
    let title = null, text = null, light = true, icon = null, alpha = 1;
    if (G.toast) { const t = G.toast; title = t.title; text = t.text; icon = 'page'; alpha = Math.min(1, (420 - t.t) / 15, t.t / 20); }
    else {
      const s = !G.finish && G.signs.find(s => Math.abs(s.x - (p.x + 11)) < 70 && Math.abs(s.y - (p.y + p.h)) < 90);
      if (s) { text = s.t; icon = 'sign'; }
      else if (G.notice) { text = G.notice.text; light = false; alpha = Math.min(1, G.notice.t / 20); }
      else if (hasGear('rope') && !p.rope && G.mode === 'walk' && nearestAnchor(p)) { text = 'X : s\'accrocher à l\'ancrage'; light = false; }
      else if (p.rope) { text = '← → se balancer · ↑ ↓ monter, descendre · Saut : se lancer'; light = false; }
    }
    if (!text) return;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.font = '500 16px system-ui';
    const maxW = 700, lines = R.wrap(ctx, text, maxW - (icon ? 56 : 30));
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), w = Math.min(maxW, tw + (icon ? 76 : 40));
    const h = 16 + (title ? 18 : 0) + lines.length * 21, x = W / 2 - w / 2, y = H - h - 8;
    R.rrect(ctx, x, y, w, h, 12, light ? '#fffaf0ee' : '#14251cdd');
    if (icon === 'page') R.flower(ctx, x + 24, y + h / 2, 0.8, true);
    else if (icon === 'sign') { R.rrect(ctx, x + 12, y + h / 2 - 12, 24, 24, 5, '#d9b07a'); ctx.fillStyle = '#5a4532'; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('!', x + 24, y + h / 2 + 5); ctx.textAlign = 'left'; }
    const tx = icon ? x + 50 : x + 20;
    let ty = y + 21;
    if (title) { ctx.fillStyle = '#aa471f'; ctx.font = 'bold 12px system-ui'; ctx.fillText(title.toUpperCase(), tx, ty - 2); ty += 18; }
    ctx.font = '500 16px system-ui'; ctx.fillStyle = light ? '#20382c' : '#fff4dc';
    if (!icon) { ctx.textAlign = 'center'; lines.forEach((l, i) => ctx.fillText(l, W / 2, ty + i * 21)); ctx.textAlign = 'left'; }
    else lines.forEach((l, i) => ctx.fillText(l, tx, ty + i * 21));
    ctx.restore();
  }

  /* ───────── Écrans d'histoire ───────── */
  function playCutscene(panels, cb) {
    state = 'cutscene'; hideAll();
    cut = { panels, pi: 0, cb };
    cut.dialog = { lines: panels[0].lines, i: 0, chars: 0, names: DATA.names, cb: cutNext };
  }
  function cutNext() {
    cut.pi++;
    if (cut.pi >= cut.panels.length) { const cb = cut.cb; cut = null; cb && cb(); return; }
    cut.dialog = { lines: cut.panels[cut.pi].lines, i: 0, chars: 0, names: DATA.names, cb: cutNext };
    cut.t0 = tick;
  }
  function drawCutscene() {
    const pn = cut.panels[cut.pi];
    R.scene(ctx, pn.scene, tick);
    if (pn.caption) { ctx.font = 'italic 20px Georgia, serif'; const w = ctx.measureText(pn.caption).width + 40; R.rrect(ctx, 30, 24, w, 40, 8, '#14251cd8'); ctx.fillStyle = '#fff4dc'; ctx.fillText(pn.caption, 50, 51); }
    ctx.font = '12px system-ui'; ctx.fillStyle = '#ffffffaa'; ctx.fillText('Échap : passer', 34, 84);
    R.dialog(ctx, cut.dialog, tick);
  }
  function playEnding2() {
    save.finished2 = true; persist();
    const n = save.pages.filter(g => g >= 24).length;
    const line = n >= 18 ? 'Les dix-huit pages de l\'édition d\'été sont là !' : n + ' pages d\'été sur 18. Il en reste à trouver… je retournerai les chercher.';
    Snd.music('end');
    playCutscene([{ scene: 'festival', caption: 'La fête du Défi des Saisons.', lines: DATA.epilogue2.map(l => [l[0], l[1].replace('{pages}', line)]) }], () => openMap(13));
  }
  function playEnding3() {
    save.finishedEte = true; persist();
    Snd.music('end');
    playCutscene([{ scene: 'festival', caption: 'La fête de l\'été, à la boutique.', lines: DATA.epilogue3 }], () => openMap(LEVELS.length - 1));
  }
  function playEnding() {
    save.finished = true; persist();
    const n = save.pages.filter(g => g < (FINAL + 1) * 3).length, tot = (FINAL + 1) * 3;
    const pagesLine = n >= tot ? 'Les quarante-deux pages sont là. Le carnet est complet !' : n + ' pages sur ' + tot + '. Il en manque encore quelques-unes… Je retournerai les chercher.';
    Snd.music('end');
    playCutscene([{ scene: 'festival', caption: 'De retour à la boutique.', lines: DATA.epilogue.map(l => [l[0], l[1].replace('{pages}', pagesLine)]) }], () => {
      state = 'ending'; endT = tick;
      const el = $('ovEnd');
      el.querySelector('.stats').innerHTML = row('Pages du carnet', save.pages.length + ' / ' + NPAGES()) + row('Pâquerettes', Object.values(save.best).reduce((s, b) => s + b.flowers, 0)) + row('Étoiles', Object.values(save.best).reduce((s, b) => s + b.stars, 0) + ' / ' + LEVELS.length * 3) + row('Titre', titleOf(xp())) + (LEVELS.length - 1 > FINAL ? row('Et maintenant ?', 'Un nouveau chapitre t\'attend sur la carte : l\'Été du Vieux !') : '');
      show('ovEnd');
    });
  }

  /* ───────── Carte ───────── */
  let mapRegion = 0;
  const regionOf = i => 0;
  const nodesOf = r => DATA.map;
  const levelsOf = r => DATA.regions[r].levels;
  const regionOpen = r => true;
  function openMap(sel) {
    state = 'map'; hideAll(); G = null;
    if (sel !== undefined) mapSel = sel;
    if (mapSel >= 0 && !unlocked(mapSel)) mapSel = 0;
    if (mapSel >= 0) mapRegion = regionOf(mapSel);
    $('mapPanel').hidden = false;
    updateMapPanel();
    Snd.music('map');
  }
  function switchRegion(dir, to) {
    const r = to !== undefined ? to : (mapRegion + dir + 2) % 2;
    if (r === mapRegion && to !== undefined) return;
    if (!regionOpen(r)) { Snd.sfx.hurt(); $('mapPanel').querySelector('.info').textContent = 'Termine « Le Sentier du Torrent » pour débloquer le Défi des Saisons.'; return; }
    mapRegion = r; mapSel = levelsOf(r).filter(unlocked).pop(); Snd.sfx.click(); updateMapPanel();
    const N = nodesOf(r)[levelsOf(r).indexOf(mapSel)]; mapPos.x = N.x; mapPos.y = N.y;
    if (r === 1 && !save.region2Intro) { save.region2Intro = true; persist(); playCutscene(DATA.region2Intro, () => openMap(8)); }
  }
  function updateMapPanel() {
    const el = $('mapPanel');
    $('mapRegion').hidden = true;

    const dc = dailyChallenge(), dEl = $('mapDaily');
    if (dc) { dEl.hidden = false; dEl.innerHTML = '<b>Défi du jour' + (dc.done ? ' ✓' : '') + '</b> ' + DATA.levels[dc.level].name + ', ' + dc.text + (dc.done ? '' : ' · +' + DATA.dailyReward + ' ✿'); dEl.onclick = () => { Snd.sfx.click(); startLevel(dc.level, false, { id: dc.id, date: dc.date }); }; }
    else dEl.hidden = true;
    if (mapSel < 0) {
      el.querySelector('.kicker').textContent = 'Paris · Quartier latin';
      el.querySelector('h3').textContent = 'La boutique du Vieux';
      el.querySelector('.info').textContent = 'Échange tes pâquerettes contre de quoi bien partir. Tu as ' + bank() + ' ✿.';
      $('mapPlay').textContent = 'Entrer dans la boutique';
      return;
    }
    const m = DATA.levels[mapSel], b = save.best[mapSel], pt = parTimes(mapSel);
    el.querySelector('.kicker').textContent = 'Étape ' + (mapSel + 1) + ' sur ' + LEVELS.length + ' · ' + m.activity;
    el.querySelector('h3').textContent = m.name;
    el.querySelector('.info').innerHTML = b ? ('✿'.repeat(b.stars) + '<span class="dim">' + '✿'.repeat(3 - b.stars) + '</span> · pages ' + b.pages.filter(Boolean).length + '/3 · record ' + fmt(b.time) + (b.medal ? ' · <span class="medal m' + b.medal + '">' + MEDALS[b.medal] + '</span>' : ' · or en ' + fmt(pt[0]))) : 'Pas encore parcourue. Or en ' + fmt(pt[0]) + '.';
    $('mapPlay').textContent = b ? 'Rejouer l\'étape →' : 'Partir →';
  }
  function mapAction() {
    Snd.sfx.click();
    if (mapSel < 0) openShop();
    else if (mapSel === FINAL + 1 && DATA.eteIntro && !save.eteIntro) { const k = mapSel; playCutscene(DATA.eteIntro, () => { save.eteIntro = true; persist(); startLevel(k); }); }
    else startLevel(mapSel);
  }
  function updateMap() {
    const order = [-1, ...levelsOf(mapRegion)].filter(i => i < 0 || unlocked(i));
    let k = order.indexOf(mapSel); if (k < 0) k = 0;
    if (pressed.has('r') || pressed.has('d')) { k = Math.min(order.length - 1, k + 1); Snd.sfx.click(); }
    if (pressed.has('l') || pressed.has('u')) { k = Math.max(0, k - 1); Snd.sfx.click(); }
    if (order[k] !== mapSel) { mapSel = order[k]; updateMapPanel(); }

    if (pressed.has('ok') || pressed.has('jump')) mapAction();
    if (pressed.has('pause')) openTitle();
  }
  function drawMapArt() {
    const g2 = ctx.createLinearGradient(0, 0, W, H); g2.addColorStop(0, '#f1e3be'); g2.addColorStop(1, '#e3cf9f');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#c9b282'; ctx.lineWidth = 1; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, 40 + i * 44 + Math.sin(i) * 6); ctx.bezierCurveTo(300, 20 + i * 44, 600, 70 + i * 44, W, 40 + i * 44); ctx.stroke(); }
    // mer et calanques
    R.poly(ctx, [[520, 540], [560, 420], [640, 380], [760, 400], [960, 360], [960, 540]], '#5fb0d8');
    ctx.fillStyle = '#ffffff70'; for (let i = 0; i < 8; i++) ctx.fillRect(600 + i * 42, 440 + (i % 3) * 26, 26, 3);
    R.poly(ctx, [[560, 420], [600, 360], [650, 372], [640, 400]], '#efe6d2');
    // collines et forêts
    R.poly(ctx, [[0, 540], [0, 300], [140, 270], [300, 300], [420, 280], [560, 360], [520, 540]], '#b9c99a');
    for (let i = 0; i < 34; i++) { const x = 20 + R.rnd(i) * 360, y = 300 + R.rnd(i + 7) * 220; R.pine(ctx, x, y, 0.4, x < 200 ? (i % 3 ? '#c27a35' : '#8a7a3e') : '#6a8f6a'); }
    // falaises, kilomètre vertical, glaciers
    for (const [x, y, s, c] of [[392, 196, 1.1, '#b08f72'], [470, 150, 1.2, '#a4846a'], [690, 230, 1.3, '#d8e6ee'], [770, 160, 1.4, '#e8f1f5'], [860, 220, 1.2, '#cdd8e0'], [600, 120, 0.9, '#c8d6df']]) {
      R.poly(ctx, [[x - 70 * s, y + 70 * s], [x, y - 40 * s], [x + 70 * s, y + 70 * s]], c);
      R.poly(ctx, [[x - 20 * s, y - 12 * s], [x, y - 40 * s], [x + 22 * s, y - 10 * s], [x + 6 * s, y - 16 * s]], '#ffffff');
    }
    // lacs, grotte, rivière, parapente
    ctx.fillStyle = '#7fb5c9'; ctx.beginPath(); ctx.ellipse(130, 268, 54, 18, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(612, 250, 40, 13, 0.1, 0, Math.PI * 2); ctx.fill();
    R.circle(ctx, 266, 150, 16, '#3a3546'); R.circle(ctx, 266, 150, 9, '#1d1b26');
    ctx.strokeStyle = '#59b3b8'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(600, 255); ctx.bezierCurveTo(540, 290, 520, 330, 560, 380); ctx.lineTo(600, 400); ctx.stroke();
    ctx.fillStyle = '#e2683a'; ctx.beginPath(); ctx.ellipse(520, 74, 24, 8, 0, Math.PI, 0); ctx.fill();
    // village et station
    for (let i = 0; i < 3; i++) { const hx = 880 + i * 26; ctx.fillStyle = ['#c78b5f', '#a86e4f', '#d7a874'][i]; ctx.fillRect(hx - 10, 282, 20, 18); R.poly(ctx, [[hx - 13, 284], [hx, 272], [hx + 13, 284]], '#f3f8fb'); }
  }
  function drawMap() {
    const N = DATA.map, S = DATA.shopNode;
    const tgt = mapSel < 0 ? S : (N[mapSel] || S);
    mapPos.x += (tgt.x - mapPos.x) * 0.15; mapPos.y += (tgt.y - mapPos.y) * 0.15;
    const v = xp(), nt = nextTitle(v), cur = DATA.titles.filter(([n]) => n <= v).pop();
    R.worldMap(ctx, {
      nodes: N, levels: DATA.levels, shop: S, sel: mapSel, tick, pos: mapPos,
      done: k => save.done.includes(k), open: k => unlocked(k), best: N.map((_, k) => save.best[k]), gold: k => !!save.gold[DATA.levels[k].id], clean: k => !!save.clean[DATA.levels[k].id],
      title: 'La Grande Traversée du Vieux', sub: titleOf(v) + ' · ' + v + ' XP',
      xpBar: nt ? (v - cur[0]) / (nt[0] - cur[0]) : 1,
      stats: 'Pages ' + save.pages.length + '/' + NPAGES() + ' · ' + save.ach.length + ' succès · ✿ ' + bank()
    });
  }
  const mapPos = { x: 150, y: 400 };
  canvas.addEventListener('click', e => {
    Snd.init();
    const rc = canvas.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * W, y = (e.clientY - rc.top) / rc.height * H;
    if (state === 'map') {
      if (Math.hypot(x - DATA.shopNode.x, y - DATA.shopNode.y + 12) < 34) { if (mapSel === -1) mapAction(); else { mapSel = -1; updateMapPanel(); Snd.sfx.click(); } return; }
      nodesOf(mapRegion).forEach((n, k) => { const i = levelsOf(mapRegion)[k]; if (Math.hypot(x - n.x, y - n.y) < 28 && unlocked(i)) { if (mapSel === i) mapAction(); else { mapSel = i; updateMapPanel(); Snd.sfx.click(); } } });
    } else if (state === 'cutscene' || (state === 'play' && G && G.dialog)) pressed.add('click');
  });

  /* ───────── Écran titre ───────── */
  function openTitle() {
    state = 'title'; hideAll(); G = null;
    const any = save.done.length || save.prologue;
    $('tPlay').textContent = any ? 'Continuer →' : 'Commencer l\'aventure →';
    $('tNew').hidden = !any;
    show('ovTitle'); Snd.music('title');
  }
  function drawTitle() {
    const cam = { x: tick * 1.6, y: 4 };
    R.background(ctx, 'forest', cam, tick, 0, 544);
    ctx.fillStyle = '#7a6549'; ctx.fillRect(0, 440, W, 100); ctx.fillStyle = '#5b8a4a'; ctx.fillRect(0, 440, W, 10); ctx.fillStyle = '#a9bb64'; ctx.fillRect(0, 440, W, 3);
    for (let i = 0; i < 30; i++) { const x = ((i * 41 - tick * 1.6) % 1240 + 1240) % 1240 - 40; R.flower(ctx, x, 436, 0.35); }
    const ph = tick * 0.14;
    R.vieux(ctx, 8, 700, 446 - Math.abs(Math.sin(ph)) * 5, 150, { flip: true, rot: Math.sin(ph) * 0.05 });
    if (tick % 70 === 0) parts.push({ x: 742, y: 330, vx: 0.4, vy: -0.6, l: 60, ml: 60, s: 4 });
    for (const q of parts) { q.x += q.vx - 1.6 * 0.3; q.y += q.vy; q.l--; ctx.globalAlpha = q.l / q.ml * 0.6; R.circle(ctx, q.x, q.y, q.s + (1 - q.l / q.ml) * 10, '#fff'); }
    ctx.globalAlpha = 1;
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].l <= 0) parts.splice(i, 1);
    for (let i = 0; i < 16; i++) { const fx = (R.rnd(i) * W + tick * 0.4 * (1 + R.rnd(i + 1))) % (W + 40) - 20, fy = ((R.rnd(i + 2) * H + tick * (0.6 + R.rnd(i + 3))) % (H + 40)) - 20; R.flower(ctx, fx, fy, 0.5 + R.rnd(i) * 0.4, i % 6 === 0, tick * 0.02 + i); }
  }

  /* ───────── Superpositions HTML ───────── */
  function show(id) { const el = $(id); el.hidden = false; const b = el.querySelector('button:not([hidden])'); if (b) setTimeout(() => b.focus({ preventScroll: true }), 30); }
  function hideAll() { document.querySelectorAll('.ov').forEach(o => o.hidden = true); $('mapPanel').hidden = true; }
  function openPause() {
    if (state !== 'play') return;
    state = 'pause'; held.clear(); show('ovPause');
  }
  function resume() { $('ovPause').hidden = true; state = 'play'; pressed.clear(); held.clear(); }
  function toggleMute() { save.muted = !save.muted; Snd.setMuted(save.muted); persist(); document.querySelectorAll('.muteLabel').forEach(e => e.textContent = save.muted ? 'Son : coupé' : 'Son : activé'); }
  document.querySelectorAll('.muteLabel').forEach(e => e.textContent = save.muted ? 'Son : coupé' : 'Son : activé');

  function drawGearCanvas(cv, id, owned) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.width = 120 * dpr, h = cv.height = 100 * dpr, c = cv.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, 120, 100);
    if (!owned) { c.globalAlpha = 0.18; }
    R.gear(c, id, 60, 52, 0.95);
    if (!owned) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = '#20382c'; c.fillRect(0, 0, 120, 100); }
  }
  function openCarnet(tab) {
    const back = state === 'menu' ? menuBack : state; menuBack = back; state = 'menu';
    const el = $('ovCarnet');
    const grid = el.querySelector('.cards'); grid.innerHTML = '';
    for (const c of DATA.cards) {
      const own = hasGear(c.id), lvl = DATA.levels.findIndex(l => l.gear === c.id);
      const art = document.createElement('article'); art.className = 'card' + (own ? '' : ' locked');
      const cv = document.createElement('canvas'); art.append(cv); drawGearCanvas(cv, c.id, own);
      const b = document.createElement('strong'); b.textContent = own ? c.name : 'Carte à découvrir'; art.append(b);
      const s = document.createElement('small'); s.textContent = own ? c.from : (c.id === 'carnet' ? 'Retrouve les ' + NPAGES() + ' pages.' : c.id === 'medaille' ? 'Termine la Grande Traversée.' : 'Termine : ' + DATA.levels[lvl].name); art.append(s);
      if (own) { const pw = document.createElement('p'); pw.textContent = c.power; art.append(pw); const tp = document.createElement('p'); tp.className = 'tip'; tp.textContent = '« ' + c.tip + ' »'; art.append(tp);
        const q = DATA.shopLinks[c.id]; if (q) { const a = document.createElement('a'); a.href = 'https://www.auvieuxcampeur.fr/catalogsearch/result/?q=' + encodeURIComponent(q); a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Voir sur le site ↗'; art.append(a); } }
      grid.append(art);
    }
    const list = el.querySelector('.pages'); list.innerHTML = '';
    DATA.levels.forEach((l, li) => {
      const h = document.createElement('h4'); h.textContent = (li + 1) + '. ' + l.name; list.append(h);
      for (let k = 0; k < 3; k++) {
        if (!DATA.pages[li * 3 + k]) continue;
        const gid = li * 3 + k, got = save.pages.includes(gid), d = document.createElement('div');
        d.className = 'pg' + (got ? '' : ' missing'); d.innerHTML = '<span>' + (gid + 1) + '</span>';
        const tx = document.createElement('p'); tx.textContent = got ? DATA.pages[gid] : 'Page à retrouver dans « ' + l.name + ' ».'; d.append(tx); list.append(d);
      }
    });
    const ac = el.querySelector('.achlist'); ac.innerHTML = '';
    for (const a of DATA.achievements) { const d = document.createElement('div'), on = save.ach.includes(a.id); d.className = 'animal' + (on ? '' : ' missing'); d.innerHTML = '<strong></strong><p></p>'; d.querySelector('strong').textContent = (on ? '★ ' : '☆ ') + a.name; d.querySelector('p').textContent = a.desc; ac.append(d); }
    const an = el.querySelector('.animals'); an.innerHTML = '';
    for (const a of DATA.animals) { const d = document.createElement('div'), seen = save.animals.includes(a.id); d.className = 'animal' + (seen ? '' : ' missing'); d.innerHTML = '<strong></strong><p></p>'; d.querySelector('strong').textContent = seen ? a.name : '???'; d.querySelector('p').textContent = seen ? a.fact : 'Ouvre l\'œil pendant tes sorties…'; an.append(d); }
    el.querySelector('.count').textContent = save.pages.length + ' / ' + NPAGES() + ' pages · ' + save.ach.length + ' / ' + DATA.achievements.length + ' succès · ' + save.animals.length + ' / ' + DATA.animals.length + ' animaux · ' + DATA.cards.filter(c => hasGear(c.id)).length + ' / ' + DATA.cards.length + ' cartes';
    setTab(tab || 'gear');
    $('carnetClose').onclick = () => { Snd.sfx.click(); el.hidden = true; state = back; if (state === 'pause') show('ovPause'); else if (state === 'title') show('ovTitle'); else if (state === 'map') { $('mapPanel').hidden = false; } };
    $('ovPause').hidden = true; $('ovTitle').hidden = true;
    show('ovCarnet');
  }
  function setTab(t) {
    document.querySelectorAll('#ovCarnet [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
    $('ovCarnet').querySelector('.cards').hidden = t !== 'gear'; $('ovCarnet').querySelector('.pages').hidden = t !== 'pages'; $('ovCarnet').querySelector('.animals').hidden = t !== 'animals'; $('ovCarnet').querySelector('.achlist').hidden = t !== 'ach';
  }
  document.querySelectorAll('#ovCarnet [data-tab]').forEach(b => b.onclick = () => { Snd.sfx.click(); setTab(b.dataset.tab); });
  function redeem(raw) {
    const code = String(raw || '').trim().toUpperCase(), c = DATA.codes[code];
    if (!c) return 'Code inconnu.';
    if (save.codes.includes(code)) return 'Code déjà utilisé.';
    save.codes.push(code); save.bank += c.reward; persist(); Snd.sfx.buy();
    return c.label + ' : +' + c.reward + ' ✿ !';
  }
  try { const u = new URLSearchParams(location.search).get('code'); if (u) setTimeout(() => { $('ovTitle').querySelector('.kicker').textContent = redeem(u); }, 300); } catch (e) {}
  function openShop() {
    const el = $('ovShop'), list = el.querySelector('.items');
    const render = () => {
      el.querySelector('.bank').textContent = bank() + ' ✿';
      list.innerHTML = '';
      for (const it of DATA.shop) {
        const own = owns(it.id), lock = it.needs && !owns(it.needs), poor = bank() < it.price;
        const d = document.createElement('div'); d.className = 'item' + (own ? ' own' : '');
        d.innerHTML = '<div><strong></strong><p></p></div>';
        d.querySelector('strong').textContent = it.name; d.querySelector('p').textContent = it.desc + (lock ? ' (il faut d\'abord : ' + DATA.shop.find(s => s.id === it.needs).name + ')' : '');
        const b = document.createElement('button');
        b.textContent = own ? 'Dans ton sac' : it.price + ' ✿'; b.disabled = own || lock || poor;
        b.onclick = () => { if (bank() >= it.price && !owns(it.id)) { save.spent += it.price; save.shop.push(it.id); persist(); Snd.sfx.buy(); render(); updateMapPanel(); } };
        d.append(b); list.append(d);
      }
    };
    render(); state = 'menu'; menuBack = 'map'; $('mapPanel').hidden = true;
    $('codeMsg').textContent = '';
    $('codeForm').onsubmit = e => { e.preventDefault(); const r2 = redeem($('codeIn').value); $('codeMsg').textContent = r2; $('codeIn').value = ''; render(); };
    $('shopClose').onclick = () => { Snd.sfx.click(); el.hidden = true; openMap(-1); };
    show('ovShop');
  }

  // boutons
  $('tPlay').onclick = () => {
    Snd.init(); Snd.sfx.click();
    if (!save.prologue) playCutscene(DATA.prologue, () => { save.prologue = true; persist(); Snd.sfx.page(); openMap(0); });
    else openMap(Math.max(0, Math.min(LEVELS.length - 1, save.done.length)));
  };
  $('tNew').onclick = () => {
    Snd.init();
    if (!confirmNew) { confirmNew = true; $('tNew').textContent = 'Sûr ? Tout sera effacé. Cliquer encore'; return; }
    const muted = save.muted; save = fresh(); save.muted = muted; persist(); confirmNew = false; $('tNew').textContent = 'Nouvelle partie'; $('tPlay').click();
  };
  let confirmNew = false;
  $('tCarnet').onclick = () => { Snd.init(); Snd.sfx.click(); openCarnet(); };
  document.querySelectorAll('.muteBtn').forEach(b => b.onclick = () => { Snd.init(); toggleMute(); });
  $('pResume').onclick = () => { Snd.sfx.click(); resume(); };
  $('pRestart').onclick = () => { Snd.sfx.click(); startLevel(G.i); };
  $('pMap').onclick = () => { Snd.sfx.click(); openMap(G.i); };
  $('pCarnet').onclick = () => { Snd.sfx.click(); openCarnet(); };
  $('btnPause').onclick = () => { Snd.init(); if (state === 'play') openPause(); else if (state === 'pause') resume(); };
  $('failCairn').onclick = () => { Snd.sfx.click(); startLevel(G.i, true); };
  $('failRestart').onclick = () => { Snd.sfx.click(); startLevel(G.i); };
  $('failMap').onclick = () => { Snd.sfx.click(); openMap(G.i); };
  $('mapPlay').onclick = mapAction;
  $('mapCarnet').onclick = () => { Snd.sfx.click(); openCarnet(); };
  $('mapShop').onclick = () => { Snd.sfx.click(); mapSel = -1; openShop(); };
  $('mapTitle').onclick = () => { Snd.sfx.click(); openTitle(); };
  $('mapRegion').onclick = () => switchRegion(1);


  $('endMap').onclick = () => { Snd.sfx.click(); openMap(Math.min(FINAL + 1, LEVELS.length - 1)); };
  // Plein écran : API standard, préfixe webkit (Safari), sinon plein écran simulé (iPhone, iframe)
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  function setPseudoFull(on) {
    $('game').classList.toggle('pseudoFull', on); document.body.classList.toggle('pseudoFullOn', on);
    window.scrollTo(0, 0);
  }
  $('btnFull').onclick = () => {
    Snd.init();
    const st = $('game');
    if (st.classList.contains('pseudoFull')) { setPseudoFull(false); return; }
    if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    const req = st.requestFullscreen || st.webkitRequestFullscreen;
    if (!req || !(document.fullscreenEnabled || document.webkitFullscreenEnabled)) { setPseudoFull(true); return; }
    try {
      const pr = req.call(st);
      if (pr && pr.then) pr.then(() => { try { const l = screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape'); if (l && l.catch) l.catch(() => {}); } catch (e) {} }).catch(() => setPseudoFull(true));
    } catch (e) { setPseudoFull(true); }
  };

  /* ───────── Boucle principale ───────── */
  let last = performance.now(), acc = 0, lastState = '';
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    while (acc >= 1000 / 60) {
      pollPad();
      tick++;
      if (state === 'play') updatePlay();
      else if (state === 'cutscene') {
        if (pressed.has('pause')) { const cb = cut.cb; cut = null; cb && cb(); }
        else updateDialog(cut.dialog);
      } else if (state === 'map') updateMap();
      else if (state === 'pause' && pressed.has('pause')) resume();
      pressed.clear();
      acc -= 1000 / 60;
    }
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    if (state !== lastState) { lastState = state; document.body.classList.toggle('playing', state === 'play'); }
    const bg = state === 'menu' ? menuBack : state;
    if ((bg === 'play' || bg === 'pause' || bg === 'results' || bg === 'fail') && G) drawPlay();
    else if (bg === 'cutscene' && cut) drawCutscene();
    else if (bg === 'map') drawMap();
    else if (bg === 'ending') R.scene(ctx, 'festival', tick);
    else drawTitle();
    requestAnimationFrame(frame);
  }

  // démarrage
  window.__game = { get state() { return state; }, get G() { return G; }, startLevel, openMap, save: () => save, set: s => { save = Object.assign(fresh(), s); persist(); } };
  R.loadSprites([4, 5, 8, 12, 16, 24, 'carte'], () => {});
  openTitle();
  requestAnimationFrame(frame);
})();
