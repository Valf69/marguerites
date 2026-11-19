/* Les Marguerites du Vieux : dessins de la région « Défi des Saisons ». */
(function (R) {
  'use strict';
  const W = 960, H = 540, T = 32;
  const { poly, circle, rrect, rnd } = R;

  Object.assign(R.PAL, {
    autumn: { sky: ['#a9b3ad', '#e6dcc6'], sun: '#f4e6c4', far: '#9aa29c', mid: '#a59c88', hill: '#8f8a62', tree: ['#b0662e', '#c98a33'],
      body: '#6f5a45', body2: '#5f4c3a', top: '#8a7a3e', topL: '#c79b45', ledge: '#7d5c3c', water: '#4d7d8c', waterTop: '#c4dfe4', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass' },
    spring: { sky: ['#9fd3ea', '#f3f6d8'], sun: '#fff6cf', far: '#9cb7b5', mid: '#a7c39b', hill: '#7fb06a', tree: ['#3f7d4c', '#4f9156'],
      body: '#7a5f43', body2: '#694f37', top: '#5fa04a', topL: '#b5d567', ledge: '#8d6b47', water: '#3f93ab', waterTop: '#c4eaf0', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass', mud: '#5a4129' },
    alpage: { sky: ['#7fb7e0', '#eef6e6'], sky2: ['#3c6fb0', '#cfe3f3'], sun: '#fff6cf', far: '#a7b5c4', mid: '#9fb59a', hill: '#8eb276', tree: ['#5f8a64', '#6f9a70'],
      body: '#857256', body2: '#75634a', top: '#7aa858', topL: '#c2d47a', ledge: '#8d6b47', water: '#3f93ab', waterTop: '#c4eaf0', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass' },
    sky: { sky: ['#5fa6e0', '#dff0fb'], sun: '#fffbe6', far: '#9fbad0', mid: '#a9c7b1', hill: '#86ad74', tree: ['#4f7f58', '#5f9064'],
      body: '#7f6a50', body2: '#6f5c44', top: '#6aa152', topL: '#b6d36c', ledge: '#8d6b47', water: '#3a8fb8', waterTop: '#cdeefa', spike: '#5e4a33', ice: '#c9e6f0', deco: 'grass' },
    sea: { sky: ['#1f7fb0', '#0b3550'], sun: '#fffbe6', body: '#c7b48a', body2: '#b29f76', top: '#d9c89c', topL: '#efe2bd', ledge: '#8d6b47', water: '#1a6f9a', waterTop: '#bfe9ff', spike: '#2b2433', ice: '#c9e6f0', deco: 'weed' },
    snownight: { sky: ['#0e1a33', '#3b4f7a'], sun: '#f2f0d8', far: '#4f6286', mid: '#6a7ea3', hill: '#9fb2cc', tree: ['#2d4a5a', '#36566a'],
      body: '#bcd0e0', body2: '#aac1d4', top: '#eef5fb', topL: '#ffffff', ledge: '#8d6b47', water: '#3d7fa6', waterTop: '#d2f2ff', spike: '#9b432e', ice: '#9fd3ea', iceTop: '#dff6ff', deco: 'snow' }
  });

  // Décors propres à certains thèmes ; renvoie true si le fond est entièrement dessiné
  const baseBg = R.background;
  R.background = function (ctx, theme, cam, t, prog, lvH, flash) {
    if (theme === 'sea') {
      const g = ctx.createLinearGradient(0, -cam.y, 0, lvH - cam.y);
      g.addColorStop(0, '#2a9ad0'); g.addColorStop(0.25, '#16709f'); g.addColorStop(1, '#06233a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sy = (R.surfaceY || 96) - cam.y;
      if (sy > 0) { const s = ctx.createLinearGradient(0, 0, 0, sy); s.addColorStop(0, '#8fd0f0'); s.addColorStop(1, '#d8f1fb'); ctx.fillStyle = s; ctx.fillRect(0, 0, W, sy); }
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 7; i++) { const x = ((i * 170 - cam.x * 0.3 + Math.sin(t * 0.01 + i) * 30) % 1200 + 1200) % 1200 - 120; poly(ctx, [[x, Math.max(0, sy)], [x + 60, Math.max(0, sy)], [x + 220, H], [x + 120, H]], '#e6fbff'); }
      ctx.globalAlpha = 1;
      for (let i = -1; i < 12; i++) { const off = cam.x * 0.4, x = i * 110 - (off % 110), k = i + Math.floor(off / 110); poly(ctx, [[x - 60, H], [x, H - 90 - rnd(k) * 120 - cam.y * 0.1 + 200], [x + 70, H]], '#0c3a55'); }
      if (sy > 0) { ctx.fillStyle = '#e8f8ff'; for (let x = 0; x < W; x += 16) ctx.fillRect(x, sy + Math.sin(t * 0.08 + x * 0.05) * 2 - 1, 10, 3); }
      return;
    }
    if (theme === 'snownight') {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1530'); g.addColorStop(1, '#40557f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 120; i++) { ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.03 + i)); circle(ctx, (rnd(i) * W * 1.2 - cam.x * 0.02 + W) % W, rnd(i + 7) * 300, rnd(i + 3) * 1.4 + 0.4, '#ffffff'); }
      ctx.globalAlpha = 0.18; for (let i = 0; i < 3; i++) { ctx.strokeStyle = ['#7dffb0', '#7fd6ff', '#c8a6ff'][i]; ctx.lineWidth = 26; ctx.beginPath(); for (let x = -20; x <= W + 20; x += 30) ctx.lineTo(x, 90 + i * 26 + Math.sin(x * 0.01 + t * 0.01 + i) * 24); ctx.stroke(); }
      ctx.globalAlpha = 1;
      circle(ctx, 780, 90, 34, '#f2f0d8'); circle(ctx, 795, 82, 30, '#0f1a35');
      baseBg.call(R, ctx, 'snownightHills', cam, t, prog, lvH, flash);
      return;
    }
    baseBg(ctx, theme, cam, t, prog, lvH, flash);
    if (theme === 'autumn') for (let i = 0; i < 14; i++) { const x = ((i * 97 - cam.x * 0.6 + t * 0.3) % 1100 + 1100) % 1100 - 60, y = (i * 61 + t * 0.6) % 560 - 20; ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.03 + i); ctx.fillStyle = i % 2 ? '#c96f2e' : '#e0a33a'; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
  };
  // Les collines nocturnes : on réutilise le fond « snow » assombri
  R.PAL.snownightHills = { sky: ['#00000000', '#00000000'], far: '#3d4f72', mid: '#566a90', hill: '#8ea2bf', tree: ['#203646', '#29404f'], sun: '#00000000' };

  /* ───── Personnages ───── */
  Object.assign(R.PEOPLE, {
    odile: { skin: '#e9b98f', hair: '#7a4a2a', hairType: 'bun', top: '#5f6f3c', pants: '#6b5a3c', beanie: '#7a8a46' },
    lea: { skin: '#f1c7a0', hair: '#c9772f', hairType: 'pony', top: '#e2683a', pants: '#2b3540', helmet: '#2f9e6f' },
    karim: { skin: '#a8714a', hair: '#1d1410', hairType: 'short', top: '#1e8bc3', pants: '#232a33', beard: '#1d1410' },
    yann: { skin: '#e8b48a', hair: '#5a3b24', hairType: 'short', top: '#f2c230', pants: '#3a3a44', helmet: '#e84a3c' },
    maud: { skin: '#d49a72', hair: '#2b1d17', hairType: 'braid', top: '#1b4f6f', pants: '#1b4f6f' },
    bastien: { skin: '#f0c39b', hair: '#d9b45a', hairType: 'short', top: '#c0392b', pants: '#1f2f3a', beanie: '#ffffff' },
    rando1: { skin: '#e8b48a', hair: '#6b4a2a', hairType: 'short', top: '#7a3fa0', pants: '#3d4a3f', beanie: '#e9a44c' },
    rando2: { skin: '#b07a52', hair: '#1d1410', hairType: 'pony', top: '#2f7d8c', pants: '#4b3b5a' }
  });

  /* ───── Matériel ───── */
  const baseGear = R.gear;
  R.gear = function (ctx, id, cx, cy, s) {
    const extra = { topo: 1, pneus: 1, trail: 1, voile: 1, masque: 1, skis: 1, medaille: 1 };
    if (!extra[id]) return baseGear(ctx, id, cx, cy, s);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineCap = 'round';
    if (id === 'topo') {
      poly(ctx, [[-34, -26], [-12, -32], [12, -26], [34, -32], [34, 26], [12, 32], [-12, 26], [-34, 32]], '#f3ecd2');
      ctx.strokeStyle = '#b9ad86'; ctx.lineWidth = 1.5; for (const x of [-12, 12]) { ctx.beginPath(); ctx.moveTo(x, x < 0 ? -32 : -26); ctx.lineTo(x, x < 0 ? 26 : 32); ctx.stroke(); }
      ctx.strokeStyle = '#c99b5c'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(4, 0, 24 - i * 6, 16 - i * 4, 0.3, 0, Math.PI * 2); ctx.stroke(); }
      ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(-28, 20); ctx.quadraticCurveTo(-4, 10, 4, 0); ctx.stroke(); ctx.setLineDash([]);
    } else if (id === 'pneus') {
      for (const dx of [-14, 14]) { ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(dx, 0, 22, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#555'; ctx.lineWidth = 3; for (let a = 0; a < 16; a++) { const r = a / 16 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(dx + Math.cos(r) * 22, Math.sin(r) * 22); ctx.lineTo(dx + Math.cos(r) * 28, Math.sin(r) * 28); ctx.stroke(); } }
    } else if (id === 'trail') {
      poly(ctx, [[-30, -6], [-6, -22], [10, -18], [30, 2], [32, 12], [-32, 12]], '#1e8bc3');
      poly(ctx, [[-32, 8], [32, 8], [30, 16], [-30, 16]], '#e9a44c');
      for (let i = 0; i < 6; i++) poly(ctx, [[-28 + i * 10, 16], [-24 + i * 10, 22], [-20 + i * 10, 16]], '#2b2b2b');
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(8, -8); ctx.stroke();
    } else if (id === 'voile') {
      ctx.fillStyle = '#e2683a'; ctx.beginPath(); ctx.ellipse(0, -14, 40, 16, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f2c230'; for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.ellipse(i * 10, -14, 5, 15, 0, Math.PI, 0); ctx.fill(); }
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 9, -14); ctx.lineTo(0, 26); ctx.stroke(); }
      rrect(ctx, -6, 24, 12, 10, 3, '#2b2b2b');
    } else if (id === 'masque') {
      rrect(ctx, -30, -14, 60, 28, 12, '#1b4f6f'); rrect(ctx, -24, -9, 22, 18, 7, '#9fd8f0'); rrect(ctx, 2, -9, 22, 18, 7, '#9fd8f0');
      ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(30, -4); ctx.lineTo(38, -4); ctx.lineTo(38, -38); ctx.stroke();
    } else if (id === 'skis') {
      for (const dx of [-8, 8]) { ctx.save(); ctx.translate(dx, 0); ctx.rotate(-0.4); rrect(ctx, -5, -42, 10, 84, 5, dx < 0 ? '#c0392b' : '#1e8bc3'); rrect(ctx, -6, -6, 12, 12, 3, '#2b2b2b'); ctx.restore(); }
    } else if (id === 'medaille') {
      poly(ctx, [[-14, -40], [-4, -10], [4, -10], [14, -40], [4, -40], [0, -24], [-4, -40]], '#c0392b');
      circle(ctx, 0, 8, 24, '#e9b44c'); circle(ctx, 0, 8, 18, '#f6d27a'); R.flower(ctx, 0, 8, 1.2, true);
    }
    ctx.restore();
  };

  /* ───── Entités ───── */
  R.balise = function (ctx, x, y, good) {
    rrect(ctx, x - 14, y - 34, 28, 34, 6, '#8c8a80'); rrect(ctx, x - 12, y - 32, 24, 30, 5, '#a29f94');
    if (good) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 8, y - 24, 16, 5); ctx.fillStyle = '#d0302f'; ctx.fillRect(x - 8, y - 19, 16, 5); }
    else { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 7, y - 26); ctx.lineTo(x + 7, y - 12); ctx.stroke(); ctx.strokeStyle = '#d0302f'; ctx.beginPath(); ctx.moveTo(x + 7, y - 26); ctx.lineTo(x - 7, y - 12); ctx.stroke(); }
  };
  R.owl = function (ctx, x, y, t) {
    const blink = (t % 200) < 10;
    rrect(ctx, x - 12, y - 30, 24, 30, 11, '#8a6a4a'); rrect(ctx, x - 8, y - 18, 16, 16, 7, '#c9a77e');
    circle(ctx, x - 5, y - 22, 5, '#f3e2b0'); circle(ctx, x + 5, y - 22, 5, '#f3e2b0');
    if (!blink) { circle(ctx, x - 5, y - 22, 2.3, '#1b1410'); circle(ctx, x + 5, y - 22, 2.3, '#1b1410'); }
    poly(ctx, [[x - 2, y - 18], [x + 2, y - 18], [x, y - 14]], '#d98b2b');
    poly(ctx, [[x - 12, y - 28], [x - 8, y - 36], [x - 5, y - 29]], '#8a6a4a'); poly(ctx, [[x + 12, y - 28], [x + 8, y - 36], [x + 5, y - 29]], '#8a6a4a');
  };
  R.squirrel = function (ctx, x, y, t) {
    const hop = Math.abs(Math.sin(t * 0.08)) * 3;
    ctx.fillStyle = '#c0601f'; ctx.beginPath(); ctx.ellipse(x - 8, y - 18 - hop, 7, 13, -0.4, 0, Math.PI * 2); ctx.fill();
    rrect(ctx, x - 4, y - 16 - hop, 12, 14, 6, '#c96a28'); circle(ctx, x + 6, y - 18 - hop, 5, '#c96a28');
    poly(ctx, [[x + 4, y - 22 - hop], [x + 6, y - 28 - hop], [x + 8, y - 22 - hop]], '#a9501a'); circle(ctx, x + 8, y - 19 - hop, 1.2, '#1b1410');
  };
  R.chamois = function (ctx, x, y, t) {
    const hb = Math.sin(t * 0.04) * 2;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#6b4a30'; ctx.fillRect(-12, -14, 3, 14); ctx.fillRect(-5, -14, 3, 14); ctx.fillRect(5, -14, 3, 14); ctx.fillRect(10, -14, 3, 14);
    rrect(ctx, -16, -26, 32, 14, 7, '#8a5f3a'); rrect(ctx, 12, -38 + hb, 10, 15, 4, '#8a5f3a');
    ctx.fillStyle = '#efe6d6'; ctx.fillRect(14, -32 + hb, 8, 3);
    ctx.strokeStyle = '#1b1410'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(15, -38 + hb); ctx.lineTo(15, -46 + hb); ctx.quadraticCurveTo(13, -50 + hb, 10, -47 + hb); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(19, -38 + hb); ctx.lineTo(19, -46 + hb); ctx.quadraticCurveTo(17, -50 + hb, 14, -47 + hb); ctx.stroke();
    ctx.restore();
  };
  R.walker = function (ctx, w, t) {
    if (w.aside) { ctx.globalAlpha = 0.55; R.person(ctx, w.style, w.x, w.y - 4, t, -1, 0.8, true); ctx.globalAlpha = 1; return; }
    R.person(ctx, w.style, w.x, w.y, t * 2, 1, 0.95, false);
    ctx.fillStyle = '#5a422c'; ctx.fillRect(w.x - 14, w.y - 46, 12, 20);
  };
  R.thermal = function (ctx, x, top, bottom, t) {
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 9; i++) { const yy = bottom - ((t * 1.6 + i * 60) % (bottom - top)); ctx.strokeStyle = '#fff4d0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 0.05 + i) * 20, yy, 26 + i % 3 * 8, 6, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const a = t * 0.03 + i * 2.1, bx = x + Math.cos(a) * 50, by = top + 40 + Math.sin(a) * 14; ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 8, by - 2); ctx.quadraticCurveTo(bx - 4, by - 6, bx, by); ctx.quadraticCurveTo(bx + 4, by - 6, bx + 8, by - 2); ctx.stroke(); }
    ctx.fillStyle = '#ffffffcc'; ctx.beginPath(); ctx.ellipse(x, top + 6, 54, 16, 0, 0, Math.PI * 2); ctx.ellipse(x + 30, top - 4, 34, 16, 0, 0, Math.PI * 2); ctx.ellipse(x - 26, top, 30, 13, 0, 0, Math.PI * 2); ctx.fill();
  };
  R.stormCloud = function (ctx, x, y, t) {
    ctx.fillStyle = '#3d4552'; ctx.beginPath(); ctx.ellipse(x, y, 60, 30, 0, 0, Math.PI * 2); ctx.ellipse(x + 34, y - 18, 40, 26, 0, 0, Math.PI * 2); ctx.ellipse(x - 30, y - 10, 36, 22, 0, 0, Math.PI * 2); ctx.fill();
    if ((t % 120) < 6) { ctx.strokeStyle = '#fff7b0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x - 8, y + 40); ctx.lineTo(x + 4, y + 44); ctx.lineTo(x - 6, y + 70); ctx.stroke(); }
  };
  R.ravito = function (ctx, x, y, t, used) {
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(x - 22, y - 22, 4, 22); ctx.fillRect(x + 18, y - 22, 4, 22);
    rrect(ctx, x - 26, y - 26, 52, 6, 2, '#efe2c8');
    if (!used) { for (let i = 0; i < 3; i++) rrect(ctx, x - 18 + i * 13, y - 38, 9, 12, 2, '#e9a44c'); circle(ctx, x + 14, y - 32, 5, '#f2c230'); }
    rrect(ctx, x - 20, y - 64, 40, 16, 3, '#e2683a'); ctx.fillStyle = '#fff'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('RAVITO', x, y - 53); ctx.textAlign = 'left';
    ctx.fillStyle = '#5a422c'; ctx.fillRect(x - 1, y - 48, 2, 22);
  };
  R.bubbles = function (ctx, x, y, t, used) {
    if (used) { ctx.globalAlpha = 0.3; }
    for (let i = 0; i < 7; i++) { const yy = y - ((t * 0.9 + i * 14) % 90); circle(ctx, x + Math.sin(t * 0.05 + i) * 8, yy, 3 + i % 3 * 2, '#e8fbffaa'); }
    circle(ctx, x, y, 12, '#d8f6ff66'); ctx.strokeStyle = '#e8fbff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  };
  R.jelly = function (ctx, x, y, t) {
    const p = Math.sin(t * 0.12) * 3;
    ctx.fillStyle = '#f2a7d8cc'; ctx.beginPath(); ctx.ellipse(x, y, 16 + p * 0.5, 12 - p * 0.3, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#f2a7d8aa'; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 6, y); ctx.quadraticCurveTo(x + i * 6 + Math.sin(t * 0.1 + i) * 6, y + 14, x + i * 5, y + 26 + p); ctx.stroke(); }
  };
  R.fishes = function (ctx, x, y, t) {
    for (let i = 0; i < 14; i++) {
      const a = t * 0.02 + i * 0.45, fx = x + Math.cos(a) * (40 + (i % 4) * 8), fy = y + Math.sin(a * 1.3) * 22 + (i % 3) * 6, d = -Math.sin(a) >= 0 ? 1 : -1;
      ctx.fillStyle = '#c9d6dd'; ctx.beginPath(); ctx.ellipse(fx, fy, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      poly(ctx, [[fx - d * 6, fy], [fx - d * 11, fy - 3], [fx - d * 11, fy + 3]], '#c9d6dd'); ctx.fillStyle = '#e9c34a'; ctx.fillRect(fx - 4, fy - 1, 8, 1);
    }
  };
  R.octopus = function (ctx, x, y, t) {
    const c = ['#c0603a', '#b5835a', '#8a6a52'][Math.floor(t / 90) % 3];
    circle(ctx, x, y - 16, 12, c);
    ctx.strokeStyle = c; ctx.lineWidth = 4; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 8 + i * 3, y - 8); ctx.quadraticCurveTo(x - 14 + i * 6 + Math.sin(t * 0.08 + i) * 4, y, x - 16 + i * 6.5, y + 2); ctx.stroke(); }
    circle(ctx, x - 4, y - 17, 2.5, '#fff'); circle(ctx, x + 4, y - 17, 2.5, '#fff'); circle(ctx, x - 4, y - 17, 1.2, '#111'); circle(ctx, x + 4, y - 17, 1.2, '#111');
  };
  R.grouper = function (ctx, x, y, t) {
    const sw = Math.sin(t * 0.03) * 20, d = Math.cos(t * 0.03) >= 0 ? 1 : -1;
    ctx.save(); ctx.translate(x + sw, y); ctx.scale(d, 1);
    ctx.fillStyle = '#6b5a4a'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2); ctx.fill();
    poly(ctx, [[-26, 0], [-42, -12], [-42, 12]], '#6b5a4a');
    ctx.fillStyle = '#8c7a62'; for (let i = 0; i < 5; i++) circle(ctx, -14 + i * 7, -4 + (i % 2) * 6, 3, '#8c7a62');
    circle(ctx, 18, -4, 3, '#f1e6c8'); circle(ctx, 18.5, -4, 1.5, '#111');
    ctx.strokeStyle = '#3d3229'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(26, 4, 6, 0.2, 1.6); ctx.stroke();
    ctx.restore();
  };
  R.trash = function (ctx, x, y, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.6 + Math.sin(t * 0.03) * 0.1);
    rrect(ctx, -6, -14, 12, 26, 4, '#7fb7a3cc'); rrect(ctx, -3, -19, 6, 6, 2, '#3a6a8a');
    ctx.restore(); circle(ctx, x, y, 16, '#ffffff18');
  };
  R.gate = function (ctx, g, t) {
    const c = g.color, top = g.y - 48, bot = g.y + 48;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(g.x - 22, top, 4, bot - top); ctx.fillRect(g.x + 18, top, 4, bot - top);
    ctx.globalAlpha = g.state === 2 ? 0.35 : 1;
    rrect(ctx, g.x - 22, top, 44, 20, 3, c); ctx.fillStyle = '#ffffff'; ctx.fillRect(g.x - 18, top + 8, 36, 3);
    ctx.globalAlpha = 1;
    if (g.state === 1) { ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(g.x - 8, top - 10); ctx.lineTo(g.x - 2, top - 4); ctx.lineTo(g.x + 10, top - 16); ctx.stroke(); }
  };
  R.wreck = function (ctx, x, y) {
    ctx.globalAlpha = 0.5;
    poly(ctx, [[x - 220, y + 260], [x - 190, y + 40], [x + 170, y + 20], [x + 260, y + 240]], '#3a2e2a');
    ctx.fillStyle = '#4a3a33'; ctx.fillRect(x - 40, y - 120, 14, 150); ctx.fillRect(x + 60, y - 80, 10, 110);
    for (let i = 0; i < 4; i++) circle(ctx, x - 140 + i * 70, y + 90, 12, '#1d2730');
    ctx.globalAlpha = 1;
  };
  R.target = function (ctx, x, y) {
    for (const [r, c] of [[96, '#ffffff'], [72, '#e2683a'], [48, '#ffffff'], [24, '#e2683a']]) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y - 2, r, r * 0.18, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x + 120, y - 70, 3, 70); poly(ctx, [[x + 123, y - 70], [x + 160, y - 64 + Math.sin(Date.now() * 0.005) * 3], [x + 123, y - 56]], '#e2683a');
  };
  R.boat = function (ctx, x, y, t) {
    const b = Math.sin(t * 0.05) * 2;
    poly(ctx, [[x - 70, y - 20 + b], [x + 80, y - 20 + b], [x + 60, y + 8 + b], [x - 56, y + 8 + b]], '#f2f2f2');
    ctx.fillStyle = '#1b4f6f'; ctx.fillRect(x - 64, y - 14 + b, 138, 5);
    rrect(ctx, x - 20, y - 52 + b, 50, 32, 4, '#e8eef2'); ctx.fillStyle = '#9fd8f0'; ctx.fillRect(x - 12, y - 46 + b, 34, 12);
    ctx.fillStyle = '#c0c6cc'; ctx.fillRect(x - 60, y - 20 + b, 3, 50); ctx.fillRect(x - 48, y - 20 + b, 3, 50); for (let i = 0; i < 5; i++) ctx.fillRect(x - 60, y - 14 + i * 10 + b, 15, 2);
    ctx.fillStyle = '#e84a3c'; ctx.fillRect(x + 4, y - 72 + b, 2, 22); poly(ctx, [[x + 6, y - 72 + b], [x + 26, y - 66 + b], [x + 6, y - 60 + b]], '#e84a3c');
  };
  R.gypaete = function (ctx, x, y, t, s) {
    const f = Math.sin(t * 0.05) * 6; s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    poly(ctx, [[-70, -4 + f], [-20, -8], [0, 0], [20, -8], [70, -4 + f], [20, 4], [0, 8], [-20, 4]], '#3a302a');
    poly(ctx, [[0, -2], [-30, 18], [30, 18]], '#2e2621'); ctx.fillStyle = '#e4b37a'; ctx.beginPath(); ctx.ellipse(22, -4, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  /* ───── Fête finale du Défi des Saisons ───── */
  const baseScene = R.sceneInner;
  R.sceneInner = function (ctx, kind, t) {
    if (kind !== 'festival') return baseScene(ctx, kind, t);
    baseScene(ctx, 'shopday', t);
    const who = ['odile', 'lea', 'karim', 'yann', 'maud', 'bastien'];
    who.forEach((w, i) => R.person(ctx, w, 70 + i * 165 + (i > 2 ? 40 : 0), 548, t + i * 25, i < 3 ? 1 : -1, 1.05, (t + i * 50) % 260 < 50));
    for (let i = 0; i < 8; i++) { const x = 100 + i * 110; ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x + 110, 300); ctx.stroke(); poly(ctx, [[x + 20, 300], [x + 40, 300], [x + 30, 318]], ['#e2683a', '#f2c230', '#2f9e6f', '#1e8bc3'][i % 4]); poly(ctx, [[x + 70, 300], [x + 90, 300], [x + 80, 318]], ['#f2c230', '#2f9e6f', '#1e8bc3', '#e2683a'][i % 4]); }
  };
})(window.R);
