/* Les Marguerites du Vieux : dessin (décors, tuiles, personnages, matériel, interface du canevas). */
(function () {
  'use strict';
  const T = 32, W = 960, H = 540;
  const R = {};
  const rnd = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
  const hash = (x, y) => rnd(x * 7.13 + y * 113.7);
  const lerp = (a, b, t) => a + (b - a) * t;
  function mix(c1, c2, t) {
    const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    const r = Math.round(lerp(a >> 16, b >> 16, t)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
  R.mix = mix; R.rnd = rnd;

  /* ───────── Palettes ───────── */
  const PAL = {
    forest: { sky: ['#97c3d3', '#f6e7bf'], sun: '#fff3c8', far: '#8fa9ab', mid: '#9fb9a3', hill: '#86a97f', tree: ['#5c8264', '#6c9171'],
      body: '#7a6549', body2: '#6c5940', top: '#5b8a4a', topL: '#a9bb64', ledge: '#8d6b47', water: '#3f93ab', waterTop: '#c4eaf0', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass' },
    lake: { sky: ['#86aed0', '#f5d4a5'], sky2: ['#24304f', '#e0876a'], sun: '#ffe2b0', far: '#7a809d', mid: '#8d86a2', hill: '#5f7d72', tree: ['#3e5e57', '#4a6c62'],
      body: '#6c5a49', body2: '#5f4f40', top: '#4f7b55', topL: '#91a868', ledge: '#80603f', water: '#4a6f97', waterTop: '#c7d8ef', spike: '#4a3d33', ice: '#c9e6f0', deco: 'grass' },
    cave: { sky: ['#191c28', '#232838'], body: '#4a4658', body2: '#403c4e', top: '#6c6880', topL: '#8c88a0', ledge: '#6a5a4c', water: '#2b6c86', waterTop: '#86d4e6', spike: '#7d7890', ice: '#9fd8e6', deco: 'pebble' },
    cliff: { sky: ['#7db0d8', '#f4dcc0'], sky2: ['#3f6fae', '#bcd6ef'], sun: '#fff0cc', far: '#a8a1b1', mid: '#b49a8c', hill: '#9d7f6a', tree: ['#7b6a5c', '#8a776a'],
      body: '#9c775b', body2: '#8b6950', top: '#c69d76', topL: '#e3c29b', ledge: '#8d6b47', water: '#3f93ab', waterTop: '#c4eaf0', spike: '#6d5443', ice: '#c9e6f0', deco: 'pebble' },
    river: { sky: ['#8ccbe3', '#eaf5d9'], sun: '#fff6cf', far: '#93aeb0', mid: '#a49882', hill: '#7f9a6b', tree: ['#4f7a5a', '#5d8963'],
      body: '#8a7a64', body2: '#7a6b57', top: '#6f9a58', topL: '#b6c56f', ledge: '#8d6b47', water: '#24a3a8', waterTop: '#b3f0e8', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass' },
    glacier: { sky: ['#86b2d8', '#eff7fb'], sun: '#fffbe6', far: '#b6cde0', mid: '#cddfeb', hill: '#a9c4d6', tree: ['#88a9bf', '#9bbccf'],
      body: '#8e9aa6', body2: '#7e8995', top: '#eef6fb', topL: '#ffffff', ledge: '#8d6b47', water: '#3d7fa6', waterTop: '#d2f2ff', spike: '#b8e2f2', ice: '#bfe1ef', iceTop: '#f2fbff', deco: 'snow' },
    storm: { sky: ['#2c3644', '#5d6776'], sun: '#9aa6b4', far: '#46505e', mid: '#56606e', hill: '#3e4753', tree: ['#2f3943', '#37414c'],
      body: '#4e5460', body2: '#454a55', top: '#dfe6ec', topL: '#ffffff', ledge: '#6a5a4c', water: '#3d5f7a', waterTop: '#a9c8dc', spike: '#a9b3bd', ice: '#c4d9e6', deco: 'snow' },
    snow: { sky: ['#78a3c1', '#e6f1f4'], sun: '#fff8dc', far: '#a2bccd', mid: '#bdd2dd', hill: '#d3e3eb', tree: ['#557d83', '#628b90'],
      body: '#cfe1ea', body2: '#c2d7e2', top: '#f3fafc', topL: '#ffffff', ledge: '#8d6b47', water: '#3d7fa6', waterTop: '#d2f2ff', spike: '#9b432e', ice: '#9fd3ea', iceTop: '#dff6ff', deco: 'snow' }
  };
  R.PAL = PAL;

  /* ───────── Formes de base ───────── */
  function poly(ctx, pts, color) {
    ctx.fillStyle = color; ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath(); ctx.fill();
  }
  function circle(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function rrect(ctx, x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
  R.poly = poly; R.circle = circle; R.rrect = rrect;

  function flower(ctx, x, y, s, gold, rot) {
    ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = gold ? '#ffe08a' : '#fffaf0';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.beginPath(); ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 4.6, 2.6, a, 0, Math.PI * 2); ctx.fill();
    }
    circle(ctx, 0, 0, 4, gold ? '#e08a1e' : '#f0b432');
    circle(ctx, -1.2, -1.2, 1.4, '#ffe9a0');
    ctx.restore();
  }
  R.flower = flower;

  function heart(ctx, x, y, s, color, outline) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 6);
    ctx.bezierCurveTo(-10, -2, -8, -11, 0, -5); ctx.bezierCurveTo(8, -11, 10, -2, 0, 6);
    ctx.fillStyle = color; ctx.fill();
    if (outline) { ctx.lineWidth = 2 / s; ctx.strokeStyle = outline; ctx.stroke(); }
    ctx.restore();
  }
  R.heart = heart;
  R.carte = function (ctx, x, y, s, on) {
    const im = R.sprites.carte, w = 38 * s, h = 24 * s;
    ctx.save();
    if (!on) ctx.globalAlpha = 0.28;
    if (im && im.naturalWidth) { if (!on && 'filter' in ctx) ctx.filter = 'grayscale(1)'; ctx.drawImage(im, x - w / 2, y - h / 2, w, h); }
    else { rrect(ctx, x - w / 2, y - h / 2, w, h, 3, '#efe9dd'); ctx.fillStyle = '#1f9a3a'; ctx.fillRect(x - w / 2, y + h / 6, w, h / 3); circle(ctx, x - w / 4, y, h / 4, '#ef7d1a'); }
    ctx.restore();
  };

  /* ───────── Décors en parallaxe ───────── */
  function ridge(ctx, off, baseY, color, cap, spacing, hMin, hMax, seed) {
    const start = Math.floor(off / spacing) - 1;
    for (let i = start; i < start + W / spacing + 3; i++) {
      const x = i * spacing - off, r = rnd(i * 3.1 + seed), h = hMin + r * (hMax - hMin), wd = spacing * (0.8 + rnd(i + seed * 2) * 0.5);
      poly(ctx, [[x - wd, baseY], [x, baseY - h], [x + wd, baseY]], color);
      if (cap) poly(ctx, [[x - wd * 0.28, baseY - h * 0.72], [x, baseY - h], [x + wd * 0.3, baseY - h * 0.7], [x + wd * 0.1, baseY - h * 0.78], [x - wd * 0.06, baseY - h * 0.7], [x - wd * 0.16, baseY - h * 0.77]], cap);
    }
  }
  function pine(ctx, x, y, s, c) {
    ctx.fillStyle = '#5d5240'; ctx.fillRect(x - 2 * s, y - 14 * s, 4 * s, 14 * s);
    for (let i = 0; i < 3; i++) poly(ctx, [[x, y - (66 - i * 14) * s], [x - (15 + i * 5) * s, y - (30 - i * 11) * s], [x + (15 + i * 5) * s, y - (30 - i * 11) * s]], c);
  }
  R.pine = pine;
  function hills(ctx, off, baseY, amp, color, seed) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, baseY + amp * Math.sin((x + off) / 140 + seed) + amp * 0.6 * Math.cos((x + off) / 67 + seed * 2));
    ctx.lineTo(W, H); ctx.fill();
  }

  R.background = function (ctx, theme, cam, t, prog, lvH, flash) {
    const P = PAL[theme];
    const vy = Math.max(-200, Math.min(400, (lvH - H) - cam.y)); // hauteur relative au bas du niveau
    let sky = P.sky;
    if (theme === 'lake') sky = [mix(P.sky[0], P.sky2[0], prog), mix(P.sky[1], P.sky2[1], prog)];
    if (theme === 'cliff') { const k = Math.min(1, vy / 2400); sky = [mix(P.sky[0], P.sky2[0], k), mix(P.sky[1], P.sky2[1], k)]; }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, sky[0]); g.addColorStop(0.8, sky[1]); g.addColorStop(1, sky[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (theme === 'cave') {
      for (let i = -1; i < 14; i++) {
        const off = cam.x * 0.25, x = i * 90 - (off % 90), h = 30 + rnd(i + Math.floor(off / 90)) * 90;
        poly(ctx, [[x - 40, 0], [x + 40, 0], [x + 6, h], [x - 4, h + 18]], '#262a39');
        poly(ctx, [[x - 30 + 45, H], [x + 40 + 45, H], [x + 52, H - h * 0.8]], '#20242f');
      }
      return;
    }
    const night = theme === 'lake' ? Math.max(0, (prog - 0.55) / 0.45) : theme === 'storm' ? 0.5 : 0;
    if (night > 0) for (let i = 0; i < 70; i++) {
      const x = (rnd(i) * W * 1.3 - cam.x * 0.02) % W, y = rnd(i + 9) * H * 0.5;
      ctx.globalAlpha = night * (0.5 + 0.5 * Math.sin(t * 0.05 + i)); circle(ctx, (x + W) % W, y, rnd(i + 3) * 1.4 + 0.4, '#fff'); ctx.globalAlpha = 1;
    }
    if (theme !== 'storm') {
      const sy = theme === 'lake' ? 90 + prog * 260 : 92;
      circle(ctx, 760 - cam.x * 0.02, sy + vy * 0.05, 46, P.sun + '55');
      circle(ctx, 760 - cam.x * 0.02, sy + vy * 0.05, 36, P.sun);
    } else {
      for (let i = 0; i < 6; i++) { ctx.fillStyle = '#1f2833' + (flash ? 'aa' : 'cc'); ctx.beginPath(); ctx.ellipse((i * 230 - cam.x * 0.08) % 1300 - 100, 60 + rnd(i) * 60, 190, 50, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    // nuages
    if (theme !== 'storm' && theme !== 'cave') for (let i = 0; i < 5; i++) {
      const x = ((i * 300 - cam.x * 0.05 - t * 0.15) % 1400 + 1400) % 1400 - 200, y = 50 + rnd(i * 4) * 90 + vy * 0.06;
      ctx.fillStyle = '#ffffff70'; ctx.beginPath(); ctx.ellipse(x, y, 70, 16, 0, 0, Math.PI * 2); ctx.ellipse(x + 40, y - 10, 46, 18, 0, 0, Math.PI * 2); ctx.fill();
    }
    const capC = theme === 'storm' ? '#c5ccd4' : '#f1f2ea';
    ridge(ctx, cam.x * 0.12, 380 + vy * 0.1, P.far, capC, 210, 150, 260, 1);
    ridge(ctx, cam.x * 0.22, 410 + vy * 0.18, P.mid, theme === 'glacier' || theme === 'snow' || theme === 'storm' ? capC : null, 170, 90, 180, 7);
    if (theme === 'cliff') {
      for (let i = -1; i < 9; i++) {
        const off = cam.x * 0.35, x = i * 150 - (off % 150), y = 200 + rnd(i + Math.floor(off / 150)) * 120 + vy * 0.3;
        poly(ctx, [[x - 70, H + 200], [x, y], [x + 44, y - 30], [x + 90, H + 200]], i % 2 ? '#ad8a74' : '#9d806f');
        poly(ctx, [[x, H + 200], [x + 44, y - 30], [x + 90, H + 200]], '#c3a189');
      }
      return;
    }
    hills(ctx, cam.x * 0.35, 330 + vy * 0.3, 22, P.hill, theme.length);
    if (theme === 'glacier' || theme === 'snow' || theme === 'storm') {
      for (let i = -1; i < 22; i++) {
        const off = cam.x * 0.5, x = i * 52 - (off % 52), k = i + Math.floor(off / 52);
        if (theme === 'glacier') poly(ctx, [[x - 22, 400 + vy * 0.5], [x - 8, 330 + rnd(k) * 40 + vy * 0.5], [x + 14, 340 + rnd(k + 1) * 30 + vy * 0.5], [x + 26, 400 + vy * 0.5]], i % 2 ? '#d7e8f1' : '#c6dcea');
        else if (rnd(k) > 0.35) pine(ctx, x, 380 + rnd(k * 2) * 26 + vy * 0.5, 0.55 + rnd(k) * 0.35, i % 2 ? P.tree[0] : P.tree[1]);
      }
    } else {
      for (let i = -1; i < 24; i++) {
        const off = cam.x * 0.5, x = i * 46 - (off % 46), k = i + Math.floor(off / 46);
        if (rnd(k * 1.7) > 0.25) pine(ctx, x, 372 + rnd(k * 2) * 26 + vy * 0.5, 0.55 + rnd(k) * 0.45, i % 2 ? P.tree[0] : P.tree[1]);
      }
    }
    if (theme === 'lake') { ctx.fillStyle = '#e6b18a30'; ctx.fillRect(0, 410 + vy * 0.5, W, 4); }
  };

  /* ───────── Tuiles ───────── */
  function isSolidCh(c) { return c === '#' || c === 'I' || c === 'Q' || c === 'q' || c === 'h' || c === 'C' || c === 'B' || c === 'J'; }
  R.tiles = function (ctx, L, cam, theme, t, hiddenAlpha) {
    const P = PAL[theme];
    const x0 = Math.max(0, Math.floor(cam.x / T) - 3), x1 = Math.min(L.w - 1, Math.floor((cam.x + W) / T) + 3);
    const y0 = Math.max(0, Math.floor(cam.y / T) - 3), y1 = Math.min(L.h - 1, Math.floor((cam.y + H) / T) + 3);
    const g = (x, y) => (x < 0 || x >= L.w || y < 0 || y >= L.h) ? ' ' : L.grid[y][x];
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const c = L.grid[ty][tx];
      if (c === ' ' || c === '~' || c === 'w') continue;
      if (c === 'J') { R.mountBox(ctx, tx * T, ty * T, t); continue; }
      const x = tx * T, y = ty * T, hs = hash(tx, ty);
      if (c === '#' || c === 'h') {
        if (c === 'h') { const a = hiddenAlpha(tx, ty); if (a <= 0.02) continue; ctx.globalAlpha = a; }
        const above = g(tx, ty - 1), open = !isSolidCh(above);
        ctx.fillStyle = P.body; ctx.fillRect(x, y, T, T);
        if (ty % 3 === 0) { ctx.fillStyle = '#00000010'; ctx.fillRect(x, y + 22, T, 3); }
        if (hs > 0.55) { ctx.fillStyle = P.body2; ctx.beginPath(); ctx.ellipse(x + 6 + hs * 20, y + 8 + (hs * 97 % 1) * 16, 5 + hs * 3, 3 + hs * 2, 0, 0, Math.PI * 2); ctx.fill(); }
        if (hs < 0.12) { ctx.fillStyle = '#ffffff16'; ctx.fillRect(x + 6, y + 14, 9, 3); }
        if (!isSolidCh(g(tx - 1, ty))) { ctx.fillStyle = '#00000022'; ctx.fillRect(x, y, 3, T); }
        if (!isSolidCh(g(tx + 1, ty))) { ctx.fillStyle = '#00000022'; ctx.fillRect(x + T - 3, y, 3, T); }
        if (!isSolidCh(g(tx, ty + 1)) && g(tx, ty + 1) !== '~') { ctx.fillStyle = '#00000030'; ctx.fillRect(x, y + T - 4, T, 4); }
        if (open) {
          ctx.fillStyle = P.top; ctx.fillRect(x, y, T, 10);
          ctx.fillStyle = P.topL; ctx.fillRect(x, y, T, 3);
          if (P.deco === 'grass') {
            ctx.fillStyle = P.top;
            for (let i = 0; i < 3; i++) { const gx = x + 4 + i * 10 + hs * 4, sway = Math.sin(t * 0.04 + tx + i) * 1.5 + (R.windLean || 0) * 4; poly(ctx, [[gx, y + 1], [gx + 2 + sway, y - 6 - hs * 4], [gx + 4, y + 1]], P.top); }
            if (hs > 0.82 && theme !== 'cave') flower(ctx, x + 16, y - 3, 0.32);
          } else if (P.deco === 'snow') {
            ctx.fillStyle = P.topL; ctx.beginPath(); ctx.ellipse(x + 16, y + 1, 18, 4, 0, 0, Math.PI * 2); ctx.fill();
          } else if (P.deco === 'weed') {
            if (hs > 0.35) for (let i = 0; i < 3; i++) { const gx = x + 6 + i * 10, sw = Math.sin(t * 0.04 + tx + i) * 4; ctx.strokeStyle = i % 2 ? '#2f7d4c' : '#3f9a5c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, y + 2); ctx.quadraticCurveTo(gx + sw, y - 12, gx + sw * 1.6, y - 22 - hs * 10); ctx.stroke(); }
          } else if (hs > 0.7) { circle(ctx, x + 8 + hs * 12, y - 1, 3, P.topL); }
        }
        if (c === 'h') { ctx.globalAlpha = 1; if (hs > 0.5) { ctx.strokeStyle = '#00000030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 8, y + 6); ctx.lineTo(x + 14, y + 16); ctx.lineTo(x + 10, y + 26); ctx.stroke(); } }
      } else if (c === 'B') {
        ctx.fillStyle = P.body; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = P.mud || '#5a4129'; ctx.fillRect(x, y, T, 12);
        ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(x + 16, y + 3, 14, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff30'; ctx.fillRect(x + 6 + hs * 10, y + 2, 8, 2);
      } else if (c === 'I') {
        const open = !isSolidCh(g(tx, ty - 1));
        ctx.fillStyle = P.ice; ctx.fillRect(x, y, T, T);
        if (hs > 0.6) { ctx.fillStyle = '#ffffff30'; ctx.fillRect(x + hs * 14, y + 12, 10, 3); }
        ctx.strokeStyle = '#ffffff70'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4 + hs * 10, y + T - 4); ctx.lineTo(x + 14 + hs * 10, y + 8); ctx.stroke();
        if (!isSolidCh(g(tx - 1, ty))) { ctx.fillStyle = '#5d8ea833'; ctx.fillRect(x, y, 3, T); }
        if (open) { ctx.fillStyle = P.iceTop || '#eefaff'; ctx.fillRect(x, y, T, 7); ctx.fillStyle = '#ffffff'; ctx.fillRect(x, y, T, 2); }
      } else if (c === '=') {
        if (theme === 'cave' || theme === 'cliff' || theme === 'glacier' || theme === 'storm') {
          ctx.fillStyle = theme === 'glacier' ? '#cfe5f0' : P.top; ctx.fillRect(x, y, T, 9);
          ctx.fillStyle = '#00000030'; ctx.fillRect(x, y + 9, T, 4);
        } else {
          ctx.fillStyle = P.ledge; ctx.fillRect(x, y, T, 11);
          ctx.fillStyle = '#c99b66'; ctx.fillRect(x, y, T, 3);
          ctx.fillStyle = '#5a422c'; ctx.fillRect(x + 30, y + 1, 2, 10);
          if (!isSolidCh(g(tx, ty + 1)) && g(tx - 1, ty) !== '=') { ctx.fillStyle = '#5a422c'; ctx.fillRect(x + 4, y + 11, 4, 10); }
          if (g(tx + 1, ty) !== '=') { ctx.fillStyle = '#5a422c'; ctx.fillRect(x + 24, y + 11, 4, 10); }
        }
      } else if (c === 'C') {
        const st = L.crumb.get(ty * L.w + tx);
        if (st && st.gone) { if (st.back > 0 && st.back < 40) { ctx.globalAlpha = 1 - st.back / 40; } else continue; }
        const sh = st && st.t > 0 && !st.gone ? (Math.random() - 0.5) * 3 : 0;
        const col = theme === 'glacier' || theme === 'snow' ? ['#e9f4fa', '#b9d3e2'] : theme === 'cave' ? ['#7a7488', '#575264'] : ['#b48a5c', '#7a5a3a'];
        ctx.fillStyle = col[0]; ctx.fillRect(x + sh, y, T, 12);
        ctx.fillStyle = col[1]; ctx.fillRect(x + sh, y + 12, T, 6);
        ctx.strokeStyle = col[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 6 + sh, y); ctx.lineTo(x + 12 + sh, y + 8); ctx.lineTo(x + 20 + sh, y + 4); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (c === 'Q' || c === 'q') {
        rrect(ctx, x + 1, y + 1, T - 2, T - 2, 4, c === 'Q' ? '#c78b4f' : '#8a6a4c');
        ctx.strokeStyle = '#6b4a2c'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, T - 8, T - 8);
        if (c === 'Q') flower(ctx, x + 16, y + 16 + Math.sin(t * 0.1) * 1, 0.8);
        else { ctx.fillStyle = '#6b4a2c'; ctx.fillRect(x + 10, y + 14, 12, 4); }
      } else if (c === 'T') {
        if (theme === 'snow') {
          poly(ctx, [[x - 6, y + T], [x + T + 4, y + 6], [x + T + 4, y + T]], '#ffffff');
          poly(ctx, [[x + T - 2, y + 8], [x + T + 4, y + 6], [x + T + 4, y + T], [x + T - 2, y + T]], '#cfe0ea');
        } else {
          const sq = Math.max(0, R.springPulse(tx, ty));
          ctx.fillStyle = '#6b5a45'; ctx.fillRect(x + 6, y + 20, 20, 12);
          ctx.strokeStyle = '#3d3d3d'; ctx.lineWidth = 3; ctx.beginPath();
          for (let i = 0; i < 4; i++) { ctx.moveTo(x + 8, y + 20 - i * (4 - sq * 2)); ctx.lineTo(x + 24, y + 18 - i * (4 - sq * 2)); }
          ctx.stroke();
          rrect(ctx, x + 2, y + 2 + sq * 8, T - 4, 8, 4, '#e2683a'); flower(ctx, x + 16, y + 6 + sq * 8, 0.45);
        }
      } else if (c === '^') {
        if (theme === 'cave' || theme === 'glacier' || theme === 'storm') {
          for (let i = 0; i < 3; i++) poly(ctx, [[x + i * 11, y + T], [x + i * 11 + 5, y + 6 + hash(tx, i) * 8], [x + i * 11 + 11, y + T]], P.spike);
        } else {
          ctx.strokeStyle = P.spike; ctx.lineWidth = 3; ctx.beginPath();
          for (let i = 0; i < 3; i++) { ctx.moveTo(x + 4 + i * 11, y + T); ctx.quadraticCurveTo(x + 12 + i * 8, y + 4, x + 18 + i * 6, y + 14); }
          ctx.stroke();
          ctx.fillStyle = '#8a2a2a'; for (let i = 0; i < 4; i++) circle(ctx, x + 6 + i * 7, y + 12 + (i % 2) * 6, 2.4, '#a8303a');
        }
      }
    }
  };
  R.water = function (ctx, L, cam, theme, t) {
    const P = PAL[theme];
    const x0 = Math.max(0, Math.floor(cam.x / T) - 3), x1 = Math.min(L.w - 1, Math.floor((cam.x + W) / T) + 3);
    const y0 = Math.max(0, Math.floor(cam.y / T) - 3), y1 = Math.min(L.h - 1, Math.floor((cam.y + H) / T) + 3);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const wc = L.grid[ty][tx]; if (wc !== '~' && wc !== 'w') continue;
      const x = tx * T, y = ty * T, top = ty === 0 || (L.grid[ty - 1][tx] !== '~' && L.grid[ty - 1][tx] !== 'w');
      let depth = 0; for (let k = ty - 1; k >= 0 && (L.grid[k][tx] === '~' || L.grid[k][tx] === 'w'); k--) depth++;
      ctx.fillStyle = top ? P.water + 'e6' : mix(P.water, '#0d2a3a', Math.min(0.55, depth * 0.12)); ctx.fillRect(x, y + (top ? 6 : 0), T, top ? T - 6 : T);
      if (top) {
        ctx.fillStyle = P.waterTop;
        const w1 = Math.sin(t * 0.08 + tx * 0.9) * 2;
        ctx.beginPath(); ctx.moveTo(x, y + 6 + w1);
        ctx.quadraticCurveTo(x + 16, y + 2 - w1, x + T, y + 6 + Math.sin(t * 0.08 + (tx + 1) * 0.9) * 2);
        ctx.lineTo(x + T, y + 10); ctx.lineTo(x, y + 10); ctx.fill();
        if (hash(tx, Math.floor(t / 20)) > 0.8) { ctx.fillStyle = '#ffffffaa'; ctx.fillRect(x + hash(tx, 3) * 24, y + 14, 6, 2); }
      }
    }
  };
  R.springPulse = () => 0;

  /* ───────── Le Vieux (sprites) ───────── */
  R.sprites = {};
  R.loadSprites = function (list, done) {
    let n = list.length;
    list.forEach(id => {
      const im = new Image(); im.onload = im.onerror = () => { if (--n === 0 && done) done(); };
      im.src = (window.ART && window.ART[id]) || (id + '.png'); R.sprites[id] = im;
    });
  };
  // flip : regarde vers la droite (les dessins regardent à gauche)
  R.vieux = function (ctx, id, x, feet, h, o) {
    const im = R.sprites[id]; if (!im || !im.naturalWidth) return;
    o = o || {};
    const w = h * im.naturalWidth / im.naturalHeight;
    ctx.save(); ctx.translate(x, feet + (o.dy || 0));
    if (o.rot) ctx.rotate(o.rot);
    ctx.scale((o.flip ? -1 : 1) * (o.sx || 1), o.sy || 1);
    if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
    if (o.crop) ctx.drawImage(im, 0, 0, im.naturalWidth, im.naturalHeight * o.crop, -w / 2, -h, w, h * o.crop);
    else ctx.drawImage(im, -w / 2, -h, w, h);
    ctx.restore();
  };
  R.vieuxHead = function (ctx, cx, cy, r) {
    const im = R.sprites[8]; if (!im || !im.naturalWidth) return;
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#d9e4cf'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.translate(cx, cy); ctx.scale(-1, 1);
    const s = r * 2 / 130; ctx.drawImage(im, 55, 0, 150, 160, -75 * s, -62 * s, 150 * s, 160 * s);
    ctx.restore();
  };

  /* ───────── Les amis de la montagne ───────── */
  const PEOPLE = {
    margot: { skin: '#f0c39b', hair: '#9aa0a8', hairType: 'bun', top: '#b8452e', pants: '#3d4a3f', apron: '#efe2c8' },
    nina: { skin: '#c98d62', hair: '#2b1d17', hairType: 'pony', top: '#2f7d8c', pants: '#4b3b5a', beanie: '#e9a44c' },
    jules: { skin: '#f2c7a5', hair: '#c46a2b', hairType: 'short', top: '#e0b13a', pants: '#e0b13a', helmet: '#efe9d8', lamp: true, beard: '#c46a2b' },
    sacha: { skin: '#8d5a3b', hair: '#1b1310', hairType: 'curly', top: '#7a3fa0', pants: '#2d3640', helmet: '#ff8a3d', rope: true },
    theo: { skin: '#e8b48a', hair: '#e3c26a', hairType: 'short', top: '#2f5f8f', pants: '#1f2f3a', vest: '#e84a3c', paddle: true },
    ines: { skin: '#d7a17a', hair: '#3a2a20', hairType: 'braid', top: '#2c5aa0', pants: '#2b2b2b', helmet: '#f2f2f2', axe: true }
  };
  R.PEOPLE = PEOPLE;
  R.person = function (ctx, who, x, feet, t, face, scale, wave) {
    const s = PEOPLE[who]; if (!s) return;
    const k = scale || 1, bob = Math.sin(t * 0.06) * 1.2, blink = (t % 220) < 8;
    ctx.save(); ctx.translate(x, feet); ctx.scale(k * (face < 0 ? -1 : 1), k);
    ctx.fillStyle = '#00000025'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    // jambes
    rrect(ctx, -9, -28, 8, 26, 3, s.pants); rrect(ctx, 1, -28, 8, 26, 3, s.pants);
    rrect(ctx, -11, -6, 11, 6, 3, '#2a2420'); rrect(ctx, 0, -6, 11, 6, 3, '#2a2420');
    ctx.translate(0, bob);
    if (s.paddle) { ctx.fillStyle = '#d9c39a'; ctx.fillRect(14, -76, 3, 64); rrect(ctx, 11, -84, 9, 18, 4, '#e84a3c'); rrect(ctx, 11, -20, 9, 18, 4, '#e84a3c'); }
    // buste
    rrect(ctx, -13, -54, 26, 30, 7, s.top);
    if (s.apron) rrect(ctx, -9, -44, 18, 22, 3, s.apron);
    if (s.vest) { rrect(ctx, -14, -53, 28, 22, 6, s.vest); ctx.fillStyle = '#ffffff'; ctx.fillRect(-14, -44, 28, 3); }
    if (s.rope) { ctx.strokeStyle = '#e8c35a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(2, -42, 11, 13, 0.5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#00000020'; ctx.fillRect(-1, -52, 2, 26);
    // bras
    const sw = Math.sin(t * 0.06) * 0.15;
    ctx.save(); ctx.translate(-12, -50); ctx.rotate(0.15 + sw); rrect(ctx, -4, 0, 8, 22, 4, s.top); circle(ctx, 0, 23, 4, s.skin); ctx.restore();
    ctx.save(); ctx.translate(12, -50); ctx.rotate(wave ? -2.4 + Math.sin(t * 0.25) * 0.4 : -0.15 - sw);
    rrect(ctx, -4, 0, 8, 22, 4, s.top); circle(ctx, 0, 23, 4, s.skin);
    if (s.axe && !wave) { ctx.fillStyle = '#555'; ctx.fillRect(-1, 18, 3, 26); ctx.fillRect(-7, 40, 14, 3); }
    ctx.restore();
    // tête
    ctx.fillStyle = s.skin; ctx.fillRect(-4, -60, 8, 7);
    circle(ctx, 0, -68, 12, s.skin);
    if (s.hairType === 'bun') { circle(ctx, 0, -73, 11, s.hair); circle(ctx, -9, -78, 6, s.hair); ctx.fillStyle = s.skin; ctx.beginPath(); ctx.arc(2, -66, 10, -0.2, Math.PI + 0.6); ctx.fill(); }
    else if (s.hairType === 'pony') { circle(ctx, 0, -72, 12, s.hair); rrect(ctx, -16, -72, 7, 22, 4, s.hair); ctx.fillStyle = s.skin; ctx.beginPath(); ctx.arc(2, -65, 10, -0.3, Math.PI + 0.3); ctx.fill(); }
    else if (s.hairType === 'curly') { for (let i = 0; i < 7; i++) circle(ctx, -10 + i * 3.5, -77 + Math.sin(i * 2) * 3, 5, s.hair); circle(ctx, -11, -68, 5, s.hair); }
    else if (s.hairType === 'braid') { circle(ctx, 0, -73, 11, s.hair); ctx.fillStyle = s.skin; ctx.beginPath(); ctx.arc(2, -66, 10, -0.2, Math.PI + 0.3); ctx.fill(); for (let i = 0; i < 4; i++) circle(ctx, -11, -62 + i * 6, 3.5, s.hair); }
    else { circle(ctx, 0, -74, 10, s.hair); ctx.fillStyle = s.skin; ctx.beginPath(); ctx.arc(2, -67, 10, -0.1, Math.PI + 0.1); ctx.fill(); }
    if (s.beard) { ctx.fillStyle = s.beard; ctx.beginPath(); ctx.arc(1, -63, 9, 0.2, Math.PI - 0.2); ctx.fill(); }
    if (s.beanie) { rrect(ctx, -12, -86, 24, 12, 6, s.beanie); circle(ctx, 0, -88, 4, '#fff3dc'); ctx.fillStyle = '#00000020'; ctx.fillRect(-12, -77, 24, 3); }
    if (s.helmet) { ctx.fillStyle = s.helmet; ctx.beginPath(); ctx.arc(0, -72, 13, Math.PI, 0); ctx.fill(); ctx.fillRect(-14, -73, 28, 3); if (s.lamp) { circle(ctx, 9, -77, 4, '#ffe9a6'); circle(ctx, 9, -77, 2, '#fff'); } }
    // visage (regarde à droite)
    if (!blink) { circle(ctx, 4, -69, 1.8, '#2a2420'); circle(ctx, 9, -69, 1.8, '#2a2420'); }
    else { ctx.fillStyle = '#2a2420'; ctx.fillRect(2.5, -69, 3.5, 1); ctx.fillRect(7.5, -69, 3.5, 1); }
    circle(ctx, 2, -64, 2.2, '#ff9b8a55'); circle(ctx, 12, -64, 2.2, '#ff9b8a55');
    ctx.strokeStyle = '#7a3b2a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(7, -64, 3, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  };
  R.portrait = function (ctx, who, cx, cy, r, t) {
    if (who === 'vieux') { R.vieuxHead(ctx, cx, cy, r); return; }
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#d9e4cf'; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    R.person(ctx, who, cx - 2, cy + r * 2.6, t, 1, r / 26);
    ctx.restore();
  };

  /* ───────── Matériel (cartes du carnet) ───────── */
  R.gear = function (ctx, id, cx, cy, s) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const line = (c, w, pts) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
    switch (id) {
      case 'boots':
        for (const dx of [-14, 12]) {
          ctx.save(); ctx.translate(dx, 0);
          poly(ctx, [[-14, -26], [4, -26], [6, -6], [22, 2], [22, 12], [-16, 12], [-16, -20]], '#7a4b2a');
          poly(ctx, [[-16, 8], [22, 8], [22, 14], [-16, 14]], '#2b2420');
          line('#e9c27a', 2, [[-6, -20], [2, -20]]); line('#e9c27a', 2, [[-6, -14], [3, -14]]); line('#e9c27a', 2, [[-6, -8], [5, -8]]);
          ctx.restore();
        }
        break;
      case 'poles':
        line('#2f3d4a', 4, [[-14, -34], [-4, 34]]); line('#2f3d4a', 4, [[14, -34], [4, 34]]);
        rrect(ctx, -19, -40, 10, 16, 4, '#1f1f1f'); rrect(ctx, 9, -40, 10, 16, 4, '#1f1f1f');
        line('#e2683a', 4, [[-12, -20], [-11, -14]]); line('#e2683a', 4, [[12, -20], [11, -14]]);
        circle(ctx, -5, 28, 5, '#555'); circle(ctx, 5, 28, 5, '#555');
        break;
      case 'lamp':
        ctx.strokeStyle = '#2f7d8c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 30, 20, 0, 0, Math.PI * 2); ctx.stroke();
        rrect(ctx, -14, -32, 28, 22, 6, '#3b3b3b'); circle(ctx, 0, -21, 8, '#ffe9a6'); circle(ctx, 0, -21, 4, '#fff');
        ctx.fillStyle = '#ffe9a640'; poly(ctx, [[0, -21], [-30, -60], [30, -60]], '#ffe9a640');
        break;
      case 'rope':
        ctx.strokeStyle = '#e8c35a'; ctx.lineWidth = 5;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-4 + i * 3, 0, 22 - i * 2, 28 - i * 2, 0.3, 0, Math.PI * 2); ctx.stroke(); }
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-2, 0, 20, 26, 0.3, 0, Math.PI * 2); ctx.stroke();
        rrect(ctx, 14, 8, 18, 6, 3, '#777'); ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(28, 20, 7, 10, 0, 0, Math.PI * 2); ctx.stroke();
        break;
      case 'axe':
        line('#3b3b3b', 5, [[-6, 36], [8, -26]]);
        poly(ctx, [[-14, -30], [26, -28], [28, -24], [-10, -22]], '#8a8f96'); poly(ctx, [[22, -28], [34, -16], [24, -24]], '#8a8f96');
        rrect(ctx, -6, 26, 6, 10, 2, '#e2683a');
        for (let i = 0; i < 5; i++) poly(ctx, [[-30 + i * 6, 34], [-27 + i * 6, 44], [-24 + i * 6, 34]], '#b7bcc2');
        ctx.fillStyle = '#b7bcc2'; ctx.fillRect(-32, 30, 30, 4);
        break;
      case 'vest':
        poly(ctx, [[-22, -30], [-8, -34], [-4, -20], [4, -20], [8, -34], [22, -30], [24, 30], [-24, 30]], '#e84a3c');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-24, 4, 48, 5); ctx.fillRect(-24, 16, 48, 3);
        ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-1, -20, 2, 50);
        break;
      case 'jacket':
        poly(ctx, [[-20, -30], [-8, -34], [0, -26], [8, -34], [20, -30], [34, 10], [24, 14], [20, -4], [20, 32], [-20, 32], [-20, -4], [-24, 14], [-34, 10]], '#2c5aa0');
        ctx.strokeStyle = '#1e3f72'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-20, -14 + i * 11); ctx.lineTo(20, -14 + i * 11); ctx.stroke(); }
        ctx.fillStyle = '#d8d8d8'; ctx.fillRect(-1, -26, 2, 58);
        break;
      case 'board':
        ctx.rotate(-0.5); rrect(ctx, -12, -42, 24, 84, 12, '#1e8bc3');
        ctx.fillStyle = '#e2683a'; ctx.fillRect(-12, -6, 24, 4); ctx.fillRect(-12, 2, 24, 4);
        rrect(ctx, -9, -24, 18, 10, 3, '#2b2b2b'); rrect(ctx, -9, 14, 18, 10, 3, '#2b2b2b');
        break;
      case 'carnet':
        rrect(ctx, -26, -32, 52, 64, 5, '#3f5a3a'); rrect(ctx, -22, -28, 44, 56, 3, '#f3e3bf');
        flower(ctx, 0, -6, 1.3); ctx.fillStyle = '#3f5a3a'; ctx.fillRect(-14, 14, 28, 3); ctx.fillRect(-10, 20, 20, 3);
        ctx.fillStyle = '#c0392b'; ctx.fillRect(14, -32, 5, 30);
        break;
    }
    ctx.restore();
  };

  /* ───────── Objets du niveau ───────── */
  R.page = function (ctx, x, y, t) {
    const b = Math.sin(t * 0.07) * 4;
    ctx.save(); ctx.translate(x, y + b); ctx.rotate(Math.sin(t * 0.05) * 0.15);
    circle(ctx, 0, 0, 22 + Math.sin(t * 0.1) * 2, '#ffe9a630');
    rrect(ctx, -11, -14, 22, 28, 2, '#fbf1d8'); ctx.strokeStyle = '#c9a66b'; ctx.lineWidth = 1.5; ctx.strokeRect(-11, -14, 22, 28);
    ctx.fillStyle = '#9b8457'; for (let i = 0; i < 4; i++) ctx.fillRect(-7, -8 + i * 5, 12 - (i % 2) * 4, 1.6);
    flower(ctx, 6, 8, 0.35, true);
    ctx.restore();
  };
  R.cairn = function (ctx, x, y, active, raise, t) {
    const st = [[0, 0, 15, 8], [1, -9, 12, 7], [-1, -17, 10, 6], [1, -24, 7, 5]];
    for (const [dx, dy, rx, ry] of st) { ctx.fillStyle = active ? '#9d9585' : '#8a8478'; ctx.beginPath(); ctx.ellipse(x + dx, y + dy - 4, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x + 4, y - 64, 3, 38);
    const fy = y - 36 - raise * 26, wav = Math.sin(t * 0.2) * 3;
    poly(ctx, [[x + 7, fy - 12], [x + 30, fy - 8 + wav], [x + 7, fy]], active ? '#e2683a' : '#9a9a8c');
    if (active) flower(ctx, x + 14, fy - 6, 0.35);
  };
  R.sign = function (ctx, x, y) {
    ctx.fillStyle = '#6e5440'; ctx.fillRect(x - 2, y - 40, 5, 40);
    rrect(ctx, x - 16, y - 46, 34, 22, 3, '#d9b07a'); ctx.strokeStyle = '#8a6a48'; ctx.lineWidth = 2; ctx.strokeRect(x - 16, y - 46, 34, 22);
    ctx.fillStyle = '#5a4532'; ctx.font = 'bold 15px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('!', x + 1, y - 29); ctx.textAlign = 'left';
  };
  R.anchor = function (ctx, x, y, glow, t) {
    if (glow) circle(ctx, x, y, 14 + Math.sin(t * 0.15) * 3, '#ffe08a55');
    ctx.fillStyle = '#7a7f86'; ctx.fillRect(x - 3, y - 12, 6, 10);
    ctx.strokeStyle = glow ? '#ffd35a' : '#b9bec4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 3, 6, 0, Math.PI * 2); ctx.stroke();
  };
  R.caillou = function (ctx, e, t) {
    const x = e.x + e.w / 2, y = e.y + e.h, sq = e.dead ? Math.max(0.2, 1 - e.dead / 12) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 + (1 - sq) * 0.6, sq);
    ctx.fillStyle = '#00000025'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
    const r = e.roll || 0;
    ctx.save(); ctx.translate(0, -14); ctx.rotate(r);
    poly(ctx, [[-15, 2], [-12, -10], [-2, -15], [11, -12], [16, 0], [12, 12], [-4, 14], [-14, 10]], '#7c7d6b');
    poly(ctx, [[-10, -8], [-2, -13], [9, -10], [6, -4], [-6, -3]], '#a3a48b');
    ctx.restore();
    const d = e.vx > 0 ? 1 : -1;
    circle(ctx, d * 4 - 3, -17, 4, '#fbf0d6'); circle(ctx, d * 4 + 6, -17, 4, '#fbf0d6');
    circle(ctx, d * 5.5 - 3, -16.5, 1.8, '#2a2420'); circle(ctx, d * 5.5 + 6, -16.5, 1.8, '#2a2420');
    ctx.fillStyle = '#4b4a3e'; ctx.fillRect(d * 4 - 7, -23, 6, 2); ctx.fillRect(d * 4 + 3, -23, 6, 2);
    ctx.restore();
  };
  R.tourbillon = function (ctx, x, y, t, theme, dead) {
    const col = theme === 'lake' || theme === 'forest' ? ['#c9873e', '#e0b25a', '#8aa35a'] : ['#ffffff', '#dceaf2', '#b9cfdc'];
    ctx.save(); ctx.translate(x, y); if (dead) { ctx.globalAlpha = Math.max(0, 1 - dead / 20); ctx.scale(1 + dead / 10, 1 + dead / 10); }
    for (let i = 0; i < 10; i++) {
      const a = t * 0.25 + i * 0.63, r = 6 + i * 1.6, yy = -14 + i * 3;
      ctx.fillStyle = col[i % 3]; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r, yy, 4, 2.2, a, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#ffffff60'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0, t * 0.2, t * 0.2 + 3); ctx.stroke();
    circle(ctx, -4, -4, 2.2, '#2a2420'); circle(ctx, 4, -4, 2.2, '#2a2420');
    ctx.restore();
  };
  R.stalactite = function (ctx, e, theme) {
    const sh = e.state === 1 ? (Math.random() - 0.5) * 3 : 0;
    const c = theme === 'cave' ? ['#8d88a0', '#6c6880'] : ['#dff3fb', '#a9d6ea'];
    poly(ctx, [[e.x - 9 + sh, e.y], [e.x + 9 + sh, e.y], [e.x + sh, e.y + 30]], c[0]);
    poly(ctx, [[e.x + 2 + sh, e.y], [e.x + 9 + sh, e.y], [e.x + sh, e.y + 30]], c[1]);
  };
  R.rock = function (ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.1);
    poly(ctx, [[-12 * s, -4 * s], [-6 * s, -12 * s], [8 * s, -10 * s], [13 * s, 2 * s], [5 * s, 12 * s], [-9 * s, 9 * s]], '#7a6e62');
    poly(ctx, [[-6 * s, -10 * s], [8 * s, -9 * s], [4 * s, -2 * s], [-5 * s, -3 * s]], '#a29383');
    ctx.restore();
  };
  R.hazardRock = function (ctx, x, y, theme, t) {
    if (theme === 'snow') {
      ctx.fillStyle = '#9b432e'; ctx.fillRect(x - 18, y - 26, 36, 24);
      for (let dx = -14; dx < 16; dx += 12) poly(ctx, [[x + dx, y - 26], [x + dx + 6, y - 26], [x + dx - 2, y - 2], [x + dx - 8, y - 2]], '#ffe6b8');
      ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - 16, y - 2, 4, 6); ctx.fillRect(x + 12, y - 2, 4, 6);
      poly(ctx, [[x - 9, y - 30], [x, y - 44], [x + 9, y - 30]], '#e98d4d');
    } else {
      poly(ctx, [[x - 17, y + 4], [x - 13, y - 14], [x - 2, y - 24], [x + 12, y - 18], [x + 18, y + 4]], '#6f6a62');
      poly(ctx, [[x - 10, y - 14], [x - 2, y - 22], [x + 9, y - 17], [x + 2, y - 10]], '#9a9389');
      ctx.fillStyle = '#ffffffb0'; ctx.fillRect(x - 22 + Math.sin(t * 0.2) * 2, y + 2, 10, 2); ctx.fillRect(x + 14 - Math.sin(t * 0.2) * 2, y + 1, 9, 2);
    }
  };
  R.marmot = function (ctx, x, y, up, t) {
    ctx.fillStyle = '#4b3a2c'; ctx.beginPath(); ctx.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    if (up <= 0.02) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20, y - 40, 40, 40); ctx.clip();
    const yy = y + (1 - up) * 30;
    rrect(ctx, x - 8, yy - 26, 16, 26, 8, '#9a7350'); circle(ctx, x, yy - 28, 7, '#9a7350');
    rrect(ctx, x - 5, yy - 18, 10, 14, 5, '#c9a27a');
    circle(ctx, x - 2.5, yy - 30, 1.4, '#1b1410'); circle(ctx, x + 2.5, yy - 30, 1.4, '#1b1410');
    circle(ctx, x, yy - 26, 1.6, '#4a2f20'); circle(ctx, x - 6, yy - 34, 2.5, '#7a5a3e'); circle(ctx, x + 6, yy - 34, 2.5, '#7a5a3e');
    ctx.restore();
  };
  R.ibex = function (ctx, x, y, t) {
    const hb = Math.sin(t * 0.03) * 2;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#7a6046';
    ctx.fillRect(-14, -16, 4, 16); ctx.fillRect(-6, -16, 4, 16); ctx.fillRect(6, -16, 4, 16); ctx.fillRect(12, -16, 4, 16);
    rrect(ctx, -18, -30, 38, 18, 9, '#8d6f52');
    rrect(ctx, 14, -44 + hb, 12, 18, 5, '#8d6f52');
    ctx.strokeStyle = '#5d4a36'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(18, -42 + hb); ctx.quadraticCurveTo(4, -62 + hb, -6, -48 + hb); ctx.stroke();
    circle(ctx, 22, -38 + hb, 1.6, '#1b1410');
    ctx.restore();
  };
  R.crystal = function (ctx, x, y, t) {
    circle(ctx, x, y - 10, 18 + Math.sin(t * 0.05) * 2, '#7fd6e022');
    poly(ctx, [[x - 9, y], [x - 6, y - 18], [x - 2, y]], '#7fd6e0'); poly(ctx, [[x - 3, y], [x + 1, y - 26], [x + 5, y]], '#a4e8f0'); poly(ctx, [[x + 3, y], [x + 8, y - 15], [x + 10, y]], '#6cc2d4');
  };
  R.gourde = function (ctx, x, y, t) {
    const b = Math.sin(t * 0.08) * 3;
    rrect(ctx, x - 8, y - 10 + b, 16, 22, 6, '#2f7d8c'); rrect(ctx, x - 4, y - 15 + b, 8, 6, 2, '#c0c6cc');
    R.heart(ctx, x, y + 2 + b, 0.55, '#e8505b');
  };
  R.platform = function (ctx, x, y, w, theme) {
    if (theme === 'lake' || theme === 'forest' || theme === 'river') {
      rrect(ctx, x, y, w, 14, 3, '#8d6b47'); ctx.fillStyle = '#c99b66'; ctx.fillRect(x, y, w, 3);
      for (let i = 1; i < 4; i++) { ctx.fillStyle = '#5a422c'; ctx.fillRect(x + i * w / 4, y + 2, 2, 11); }
    } else { rrect(ctx, x, y, w, 14, 4, '#8b8696'); ctx.fillStyle = '#b4afc0'; ctx.fillRect(x, y, w, 3); }
  };

  /* Arrivées dessinées selon le niveau */
  R.exit = function (ctx, kind, x, y, t) {
    if (kind === 'refuge' || kind === 'winter') {
      const snow = kind === 'winter';
      ctx.fillStyle = snow ? '#6b5444' : '#845c40'; ctx.fillRect(x - 70, y - 90, 140, 90);
      poly(ctx, [[x - 90, y - 84], [x, y - 140], [x + 90, y - 84]], snow ? '#e8eef2' : '#4c5440');
      ctx.fillStyle = '#f6c277'; ctx.fillRect(x - 52, y - 66, 26, 24); ctx.fillRect(x + 28, y - 66, 26, 24);
      ctx.fillStyle = '#513a2d'; ctx.fillRect(x - 14, y - 56, 30, 56);
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x + 40, y - 150, 14, 40);
      for (let i = 0; i < 3; i++) circle(ctx, x + 47 + Math.sin(t * 0.03 + i) * 6, y - 160 - i * 14 - (t * 0.5 % 14), 6 + i * 2, '#ffffff50');
      ctx.fillStyle = '#efe2c8'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText(snow ? 'REFUGE D\'HIVER' : 'REFUGE', x, y - 96); ctx.textAlign = 'left';
    } else if (kind === 'tent') {
      poly(ctx, [[x - 50, y], [x - 8, y - 62], [x + 40, y]], '#e9a44c'); poly(ctx, [[x - 20, y], [x - 8, y - 40], [x + 6, y]], '#5d5643');
      ctx.strokeStyle = '#3b3b3b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 8, y - 62); ctx.lineTo(x + 60, y); ctx.stroke();
      // petit feu de camp (réchaud)
      rrect(ctx, x + 50, y - 12, 14, 12, 3, '#555'); circle(ctx, x + 57, y - 18 + Math.sin(t * 0.3), 5, '#ffb347');
    } else if (kind === 'cave') {
      const g = ctx.createRadialGradient(x, y - 60, 10, x, y - 60, 120); g.addColorStop(0, '#fff6d8'); g.addColorStop(1, '#fff6d800');
      ctx.fillStyle = g; ctx.fillRect(x - 120, y - 180, 240, 200);
    } else if (kind === 'summit') {
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x, y - 90, 4, 90);
      poly(ctx, [[x + 4, y - 90], [x + 50, y - 80 + Math.sin(t * 0.2) * 4], [x + 4, y - 66]], '#e2683a'); flower(ctx, x + 20, y - 79, 0.5);
    } else if (kind === 'kayak') {
      ctx.fillStyle = '#6e5440'; ctx.fillRect(x - 60, y - 6, 120, 8);
      for (let i = 0; i < 5; i++) ctx.fillRect(x - 56 + i * 28, y, 5, 40);
      poly(ctx, [[x - 30, y - 6], [x - 26, y - 70], [x + 30, y - 70], [x + 34, y - 6]], '#2f5f8f');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('BASE', x + 2, y - 36); ctx.textAlign = 'left';
    } else if (kind === 'village') {
      for (let i = 0; i < 3; i++) {
        const hx = x - 80 + i * 90;
        ctx.fillStyle = ['#c78b5f', '#a86e4f', '#d7a874'][i]; ctx.fillRect(hx - 30, y - 70, 60, 70);
        poly(ctx, [[hx - 40, y - 66], [hx, y - 110], [hx + 40, y - 66]], '#f3f8fb');
        ctx.fillStyle = '#ffd88a'; ctx.fillRect(hx - 18, y - 52, 14, 14); ctx.fillRect(hx + 6, y - 52, 14, 14);
      }
    }
  };

  /* ───────── Bulles, dialogues ───────── */
  function wrap(ctx, text, maxW) {
    const words = text.split(' '), lines = []; let cur = '';
    for (const w of words) { const test = cur ? cur + ' ' + w : w; if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
    if (cur) lines.push(cur); return lines;
  }
  R.wrap = wrap;
  R.bubble = function (ctx, x, y, text) {
    ctx.font = '600 15px system-ui, sans-serif';
    const lines = wrap(ctx, text, 300), w = Math.min(330, Math.max(...lines.map(l => ctx.measureText(l).width)) + 28), h = lines.length * 20 + 18;
    let bx = Math.max(8, Math.min(W - w - 8, x - w / 2)), by = y - h - 16;
    if (by < 50) by = 50;
    ctx.fillStyle = '#00000030'; ctx.beginPath(); ctx.roundRect(bx + 3, by + 4, w, h, 10); ctx.fill();
    rrect(ctx, bx, by, w, h, 10, '#fffaf0');
    poly(ctx, [[Math.max(bx + 14, Math.min(bx + w - 14, x)) - 8, by + h], [Math.max(bx + 14, Math.min(bx + w - 14, x)) + 8, by + h], [x, by + h + 12]], '#fffaf0');
    ctx.fillStyle = '#20382c'; lines.forEach((l, i) => ctx.fillText(l, bx + 14, by + 24 + i * 20));
  };
  R.dialog = function (ctx, d, t) {
    const line = d.lines[d.i], name = d.names[line[0]] || '';
    ctx.font = '500 18px system-ui, sans-serif';
    const lines = wrap(ctx, line[1], 700);
    const w = 860, h = Math.max(78, 26 + lines.length * 24), x = (W - w) / 2, y = H - h - 8;
    ctx.fillStyle = '#00000040'; ctx.beginPath(); ctx.roundRect(x + 3, y + 4, w, h, 14); ctx.fill();
    rrect(ctx, x, y, w, h, 14, '#fffaf0f2');
    ctx.strokeStyle = '#20382c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.stroke();
    circle(ctx, x + 44, y + h / 2, 32, '#20382c');
    R.portrait(ctx, line[0], x + 44, y + h / 2, 29, t);
    ctx.font = 'bold 13px Georgia, serif'; ctx.fillStyle = '#aa471f'; ctx.fillText(name, x + 92, y + 20);
    ctx.font = '500 18px system-ui, sans-serif'; ctx.fillStyle = '#20382c';
    let left = Math.floor(d.chars);
    lines.forEach((l, i) => { if (left <= 0) return; ctx.fillText(l.slice(0, left), x + 92, y + 44 + i * 24); left -= l.length + 1; });
    if (d.chars >= line[1].length) {
      ctx.fillStyle = '#aa471f'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'right';
      ctx.fillText('Espace ▸', x + w - 16 + Math.sin(t * 0.15) * 2, y + h - 12); ctx.textAlign = 'left';
    }
  };

  /* ───────── Scènes d'histoire ───────── */
  R.scene = function (ctx, kind, t) {
    const shift = { shop: -120, wind: -120, shopday: -140, map: -100, board: -110 }[kind] || 0;
    const base = { shop: '#56606a', wind: '#56606a', shopday: '#56606a', map: '#9db7a5', board: '#5a4434' }[kind] || '#14251c';
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(0, shift); R.sceneInner(ctx, kind, t); ctx.restore();
  };
  R.sceneInner = function (ctx, kind, t) {
    const sk = (a, b) => { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    if (kind === 'shop' || kind === 'wind' || kind === 'shopday') {
      const day = kind === 'shopday';
      sk(day ? '#a9d0e0' : '#1d2742', day ? '#f6e6c4' : '#4a4f72');
      if (!day) for (let i = 0; i < 50; i++) circle(ctx, rnd(i) * W, rnd(i + 5) * 200, rnd(i + 2) * 1.3 + 0.3, '#ffffffaa');
      else circle(ctx, 800, 80, 40, '#fff3c8');
      // immeubles parisiens
      for (let i = 0; i < 6; i++) {
        const bx = -40 + i * 180, bh = 300 + rnd(i) * 80;
        ctx.fillStyle = day ? '#e7dcc6' : '#3a3d55'; ctx.fillRect(bx, H - 60 - bh, 170, bh);
        ctx.fillStyle = day ? '#6f7d8c' : '#262840'; poly(ctx, [[bx - 6, H - 60 - bh], [bx + 20, H - 100 - bh], [bx + 150, H - 100 - bh], [bx + 176, H - 60 - bh]], day ? '#6f7d8c' : '#262840');
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = day ? '#9fb6c6' : (rnd(i * 20 + r * 4 + c) > 0.5 ? '#f6c277' : '#1f2135'); ctx.fillRect(bx + 18 + c * 38, H - 40 - bh + 40 + r * 62, 20, 34); }
      }
      // la boutique
      const sx = 250;
      ctx.fillStyle = '#20382c'; ctx.fillRect(sx, 250, 460, 230);
      rrect(ctx, sx - 10, 230, 480, 46, 6, '#2d4d3b');
      ctx.fillStyle = '#fff4dc'; ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('AU VIEUX CAMPEUR', sx + 230, 263);
      flower(ctx, sx + 22, 253, 0.9); flower(ctx, sx + 438, 253, 0.9);
      ctx.textAlign = 'left';
      for (let i = 0; i < 9; i++) poly(ctx, [[sx + i * 52, 276], [sx + i * 52 + 52, 276], [sx + i * 52 + 26, 300]], i % 2 ? '#e9a44c' : '#fff4dc');
      ctx.fillStyle = day ? '#cfe3e6' : '#f6c277'; ctx.fillRect(sx + 20, 310, 160, 140); ctx.fillRect(sx + 280, 310, 160, 140);
      ctx.fillStyle = '#4a3a2c'; ctx.fillRect(sx + 195, 320, 70, 160);
      // vitrine : matériel
      R.gear(ctx, 'boots', sx + 70, 410, 0.7); R.gear(ctx, 'rope', sx + 140, 400, 0.6);
      R.gear(ctx, 'board', sx + 330, 395, 0.6); R.gear(ctx, 'axe', sx + 400, 400, 0.6);
      ctx.fillStyle = '#56606a'; ctx.fillRect(0, 480, W, 200); ctx.fillStyle = '#6c7680'; ctx.fillRect(0, 476, W, 6);
      if (kind === 'wind') {
        for (let i = 0; i < 24; i++) {
          const p = (t * 0.012 + i * 0.09) % 1.4, px = sx + 100 + p * 700 + Math.sin(i + t * 0.05) * 30, py = 330 - p * 260 + Math.sin(i * 3 + t * 0.08) * 40;
          ctx.save(); ctx.translate(px, py); ctx.rotate(t * 0.1 + i); rrect(ctx, -9, -12, 18, 24, 2, '#fbf1d8'); ctx.fillStyle = '#9b8457'; ctx.fillRect(-5, -6, 10, 2); ctx.fillRect(-5, 0, 8, 2); ctx.restore();
        }
        for (let i = 0; i < 30; i++) { ctx.strokeStyle = '#ffffff40'; ctx.lineWidth = 2; const yy = (i * 37 + t * 3) % 520; ctx.beginPath(); ctx.moveTo((t * 9 + i * 80) % 1100 - 100, yy); ctx.lineTo((t * 9 + i * 80) % 1100 - 40, yy - 8); ctx.stroke(); }
      }
      if (day) {
        const who = ['margot', 'nina', 'jules', 'sacha', 'theo', 'ines'];
        who.forEach((w, i) => R.person(ctx, w, 120 + i * 140 + (i > 2 ? 60 : 0), 500, t + i * 30, i < 3 ? 1 : -1, 1.25, (t + i * 40) % 300 < 60));
        R.vieux(ctx, 12, 480, 505, 150, { flip: true, sy: 1 + Math.sin(t * 0.06) * 0.01 });
        for (let i = 0; i < 30; i++) { const fx = rnd(i) * W, fy = ((t * (1 + rnd(i + 1)) + rnd(i + 2) * 600) % 640) - 60; flower(ctx, fx + Math.sin(t * 0.03 + i) * 20, fy, 0.6, i % 5 === 0, t * 0.03 + i); }
      } else R.vieux(ctx, kind === 'wind' ? 12 : 12, 480, 485, 140, { flip: true, rot: kind === 'wind' ? Math.sin(t * 0.2) * 0.05 : 0 });
    } else if (kind === 'map') {
      sk('#b9d5d8', '#f2e2bd');
      ridge(ctx, t * 0.3, 470, '#8fa9ab', '#f1f2ea', 160, 160, 300, 3);
      ridge(ctx, t * 0.6, 510, '#9db7a5', null, 120, 80, 160, 9);
      R.vieux(ctx, 8, 300 + Math.sin(t * 0.03) * 4, 520, 190, { flip: true, rot: Math.sin(t * 0.18) * 0.04, dy: -Math.abs(Math.sin(t * 0.18)) * 5 });
      for (let i = 0; i < 10; i++) { const p = (t * 0.004 + i * 0.1) % 1; ctx.save(); ctx.translate(500 + p * 460, 260 - p * 180 + Math.sin(i + t * 0.04) * 30); ctx.rotate(t * 0.04 + i); rrect(ctx, -7, -9, 14, 18, 2, '#fbf1d8'); ctx.restore(); }
    } else if (kind === 'board') {
      sk('#3c4a5c', '#8a98a8');
      ctx.fillStyle = '#5a4434'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#6b5240';
      for (let i = 0; i < 12; i++) ctx.fillRect(0, i * 46, W, 4);
      ctx.fillStyle = '#9fc3d8'; ctx.fillRect(620, 80, 220, 160); ctx.strokeStyle = '#3d2e22'; ctx.lineWidth = 8; ctx.strokeRect(620, 80, 220, 160);
      for (let i = 0; i < 20; i++) circle(ctx, 620 + rnd(i) * 220, 80 + ((rnd(i + 1) * 160 + t * 0.8) % 160), 2, '#fff');
      ctx.save(); ctx.translate(300, 300); ctx.rotate(-0.25 + Math.sin(t * 0.02) * 0.02); R.gear(ctx, 'board', 0, 0, 2.2); ctx.restore();
      R.vieux(ctx, 24, 560, 500, 210, { flip: false, sy: 1 + Math.sin(t * 0.05) * 0.01 });
    }
  };

  R.W = W; R.H = H; R.T = T;
  window.R = R;
})();
