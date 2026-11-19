/* Les Marguerites du Vieux : carte illustrée de la Grande Traversée. */
(function (R) {
  'use strict';
  const W = 960, H = 540;
  const { poly, circle, rrect, rnd } = R;
  let cache = null, cacheDpr = 0;

  // Courbe lisse passant par des points (Catmull-Rom)
  function smoothPath(ctx, pts) {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
    }
  }
  function blob(ctx, cx, cy, rx, ry, seed, color, n) {
    ctx.fillStyle = color; ctx.beginPath();
    n = n || 14;
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, k = 0.82 + rnd(seed + i * 1.7) * 0.3;
      const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }
  function mountain(ctx, x, y, w, h, base, shade, snow, seed) {
    const peak = [x + (rnd(seed) - 0.5) * w * 0.15, y - h];
    poly(ctx, [[x - w / 2, y], peak, [x + w / 2, y]], base);
    poly(ctx, [peak, [x + w / 2, y], [peak[0] + w * 0.06, y]], shade);
    // arêtes
    ctx.strokeStyle = shade; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(peak[0], peak[1]); ctx.lineTo(peak[0] - w * 0.12, peak[1] + h * 0.45); ctx.lineTo(peak[0] - w * 0.2, y); ctx.stroke();
    ctx.globalAlpha = 1;
    if (snow) {
      const s = h * 0.34;
      poly(ctx, [[peak[0] - s * 0.55, peak[1] + s], peak, [peak[0] + s * 0.6, peak[1] + s * 1.05], [peak[0] + s * 0.25, peak[1] + s * 0.75], [peak[0] + s * 0.02, peak[1] + s * 1.0], [peak[0] - s * 0.25, peak[1] + s * 0.7]], '#ffffff');
      poly(ctx, [peak, [peak[0] + s * 0.6, peak[1] + s * 1.05], [peak[0] + s * 0.25, peak[1] + s * 0.75], [peak[0] + s * 0.1, peak[1] + s * 0.4]], '#dfe9f1');
    }
  }
  function decidTree(ctx, x, y, s, c1, c2) {
    ctx.fillStyle = '#00000022'; ctx.beginPath(); ctx.ellipse(x + 3 * s, y + 2 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b5236'; ctx.fillRect(x - 1.2 * s, y - 6 * s, 2.4 * s, 7 * s);
    circle(ctx, x, y - 11 * s, 8 * s, c1); circle(ctx, x - 3 * s, y - 13 * s, 5 * s, c2);
  }
  function pineTree(ctx, x, y, s, c) {
    ctx.fillStyle = '#00000022'; ctx.beginPath(); ctx.ellipse(x + 3 * s, y + 1 * s, 7 * s, 2.4 * s, 0, 0, Math.PI * 2); ctx.fill();
    poly(ctx, [[x, y - 20 * s], [x - 7 * s, y], [x + 7 * s, y]], c);
    poly(ctx, [[x, y - 20 * s], [x + 7 * s, y], [x + 1 * s, y]], '#00000022');
  }

  function buildStatic(dpr) {
    const cv = document.createElement('canvas'); cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    // papier
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#efe4c4'); g.addColorStop(1, '#e2d2a6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // terre
    const land = ctx.createLinearGradient(0, 0, 0, H); land.addColorStop(0, '#d9dcb0'); land.addColorStop(1, '#b8c98e');
    ctx.fillStyle = land; ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 330);
    ctx.bezierCurveTo(880, 360, 800, 372, 740, 362); ctx.bezierCurveTo(680, 352, 640, 372, 615, 405);
    ctx.bezierCurveTo(590, 440, 560, 470, 540, 540); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // mer
    const sea = ctx.createLinearGradient(560, 360, 900, 540); sea.addColorStop(0, '#7cc6dc'); sea.addColorStop(1, '#2d84b6');
    ctx.fillStyle = sea; ctx.beginPath();
    ctx.moveTo(W, 330); ctx.bezierCurveTo(880, 360, 800, 372, 740, 362); ctx.bezierCurveTo(680, 352, 640, 372, 615, 405);
    ctx.bezierCurveTo(590, 440, 560, 470, 540, 540); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    // écume de la côte
    for (const [off, a] of [[0, 0.9], [9, 0.45], [18, 0.2]]) {
      ctx.strokeStyle = 'rgba(255,255,255,' + a + ')'; ctx.lineWidth = off ? 1.5 : 3; ctx.beginPath();
      ctx.moveTo(W, 330 + off); ctx.bezierCurveTo(880, 360 + off, 800, 372 + off, 740, 362 + off); ctx.bezierCurveTo(680, 352 + off, 640 + off, 372 + off, 615 + off, 405 + off);
      ctx.bezierCurveTo(590 + off, 440, 560 + off, 470, 540 + off, 540); ctx.stroke();
    }
    ctx.strokeStyle = '#ffffff55'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 26; i++) { const x = 600 + rnd(i * 3) * 340, y = 410 + rnd(i * 5) * 120; if (x < 560 + (y - 400) * -0.3 + 40) continue; ctx.beginPath(); ctx.arc(x, y, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.arc(x + 11, y, 6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    // calanques
    poly(ctx, [[586, 392], [606, 352], [628, 346], [646, 372], [626, 400]], '#f2ead6');
    poly(ctx, [[606, 352], [628, 346], [646, 372], [630, 368]], '#d9cdb0');
    poly(ctx, [[640, 380], [660, 360], [676, 366], [668, 384]], '#f2ead6');
    // lignes de niveau
    ctx.strokeStyle = '#8a7a5226'; ctx.lineWidth = 1;
    for (const [cx, cy, rx, ry] of [[440, 150, 150, 80], [780, 170, 190, 100], [250, 170, 90, 50]]) for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.ellipse(cx, cy, rx * k / 3.2, ry * k / 3.2, -0.1, 0, Math.PI * 2); ctx.stroke(); }
    // collines
    blob(ctx, 210, 330, 210, 90, 3, '#a7bd7f'); blob(ctx, 420, 300, 150, 70, 9, '#b0c385'); blob(ctx, 120, 470, 170, 80, 15, '#9fb878');
    // montagnes : falaises et Kilomètre Vertical (roche), puis glaciers
    mountain(ctx, 300, 200, 150, 95, '#b9987a', '#94765d', false, 1);
    mountain(ctx, 400, 232, 190, 150, '#b08f72', '#8a6d55', false, 2);
    mountain(ctx, 500, 190, 170, 160, '#a98a70', '#86684f', true, 3);
    mountain(ctx, 600, 170, 150, 110, '#bccbd6', '#9fb1c0', true, 4);
    mountain(ctx, 700, 250, 210, 190, '#c6d6e2', '#a5b9c9', true, 5);
    mountain(ctx, 800, 190, 190, 170, '#d3e1ea', '#afc3d2', true, 6);
    mountain(ctx, 900, 230, 170, 150, '#c9d8e3', '#a8bccb', true, 7);
    mountain(ctx, 760, 300, 160, 90, '#bfcfda', '#9fb3c2', true, 8);
    // glacier (langue de glace)
    ctx.globalAlpha = 0.55; ctx.fillStyle = '#e6f1f8'; ctx.beginPath(); ctx.moveTo(668, 150); ctx.bezierCurveTo(690, 190, 676, 230, 700, 262); ctx.lineTo(724, 258); ctx.bezierCurveTo(706, 220, 716, 186, 700, 146); ctx.fill();
    ctx.globalAlpha = 1;
    // lacs
    for (const [cx, cy, rx, ry, s] of [[132, 268, 58, 20, 21], [612, 252, 42, 14, 33]]) {
      blob(ctx, cx, cy + 2, rx + 4, ry + 4, s, '#8fb17a', 16);
      blob(ctx, cx, cy, rx, ry, s, '#6fb3cf', 16);
      ctx.strokeStyle = '#ffffff80'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(cx - rx * 0.2, cy - ry * 0.2, rx * 0.5, ry * 0.3, 0, Math.PI * 1.1, Math.PI * 1.8); ctx.stroke();
    }
    // rivière turquoise jusqu'à la mer
    const river = [{ x: 612, y: 262 }, { x: 572, y: 290 }, { x: 530, y: 318 }, { x: 548, y: 352 }, { x: 590, y: 372 }, { x: 610, y: 396 }];
    for (const [w, c] of [[11, '#8fb17a'], [8, '#49aac0'], [3, '#a8e6f0']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); smoothPath(ctx, river); ctx.stroke(); }
    // grotte
    poly(ctx, [[244, 162], [256, 138], [282, 134], [292, 160]], '#8e7a66');
    ctx.fillStyle = '#2a2530'; ctx.beginPath(); ctx.ellipse(268, 158, 11, 13, 0, Math.PI, 0); ctx.fill();
    // forêts : feuillus d'automne et verts, sapins vers la montagne
    const trees = [];
    for (let i = 0; i < 70; i++) { const x = 20 + rnd(i * 2.3) * 420, y = 300 + rnd(i * 4.1) * 230; if (y > 520 || (x > 380 && y > 470)) continue; trees.push([x, y, i]); }
    for (let i = 0; i < 26; i++) { const x = 230 + rnd(i * 7.7) * 260, y = 200 + rnd(i * 3.3) * 90; trees.push([x, y, 1000 + i]); }
    trees.sort((a, b) => a[1] - b[1]);
    for (const [x, y, i] of trees) {
      if (i >= 1000) pineTree(ctx, x, y, 0.75, i % 2 ? '#5f8a62' : '#6f9a6c');
      else if (x < 230) decidTree(ctx, x, y, 0.8, i % 3 ? '#d08a3c' : '#b8642c', i % 3 ? '#e3a552' : '#cc7a3a');
      else decidTree(ctx, x, y, 0.8, i % 2 ? '#6f9a5a' : '#5e8a4e', '#86b06a');
    }
    // village et station de ski
    for (let i = 0; i < 4; i++) { const hx = 868 + i * 20, hy = 300 + (i % 2) * 6; ctx.fillStyle = ['#c78b5f', '#a86e4f', '#d7a874', '#b77a55'][i]; ctx.fillRect(hx - 8, hy, 16, 13); poly(ctx, [[hx - 10, hy + 1], [hx, hy - 8], [hx + 10, hy + 1]], '#f5f9fb'); ctx.fillStyle = '#ffd88a'; ctx.fillRect(hx - 3, hy + 4, 5, 5); }
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(880, 296); ctx.lineTo(838, 150); ctx.stroke();
    for (let i = 1; i < 5; i++) { const t = i / 5; ctx.fillStyle = '#e2683a'; ctx.fillRect(880 - 42 * t - 2, 296 - 146 * t, 4, 5); }
    // rose des vents
    const cx = 455, cy = 470;
    circle(ctx, cx, cy, 30, '#f5ecd2'); ctx.strokeStyle = '#8a7a52'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.stroke();
    poly(ctx, [[cx, cy - 26], [cx - 6, cy], [cx + 6, cy]], '#aa471f'); poly(ctx, [[cx, cy + 26], [cx - 6, cy], [cx + 6, cy]], '#5a4a32');
    poly(ctx, [[cx - 26, cy], [cx, cy - 5], [cx, cy + 5]], '#8a7a52'); poly(ctx, [[cx + 26, cy], [cx, cy - 5], [cx, cy + 5]], '#8a7a52');
    ctx.fillStyle = '#5a4a32'; ctx.font = 'bold 11px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('N', cx, cy - 33); ctx.textAlign = 'left';
    // grain du papier et vignette
    for (let i = 0; i < 900; i++) { ctx.fillStyle = rnd(i * 9.1) > 0.5 ? '#ffffff12' : '#5a4a3210'; ctx.fillRect(rnd(i) * W, rnd(i + 0.5) * H, 1.5, 1.5); }
    const v = ctx.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 640); v.addColorStop(0, '#00000000'); v.addColorStop(1, '#3a2a1240');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    return cv;
  }

  /* Pictogrammes d'activité (blancs, dans les médaillons) */
  R.actIcon = function (ctx, id, x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const L = pts => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); };
    switch (id) {
      case 'torrent': poly(ctx, [[-8, -7], [-1, -7], [0, 2], [8, 5], [8, 8], [-8, 8]], col); break; // chaussure
      case 'brume': ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); poly(ctx, [[0, -7], [3, 0], [0, 7], [-3, 0]], col); break; // boussole
      case 'lac': poly(ctx, [[-9, 7], [0, -8], [9, 7]], col); ctx.strokeStyle = '#00000055'; L([[0, -8], [0, 7]]); break; // tente
      case 'grotte': circle(ctx, 0, 1, 6, col); ctx.beginPath(); ctx.ellipse(0, 1, 10, 4, 0, 0, Math.PI * 2); ctx.stroke(); break; // frontale
      case 'vtt': ctx.beginPath(); ctx.arc(-6, 4, 4.5, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(6, 4, 4.5, 0, 7); ctx.stroke(); L([[-6, 4], [-1, -4], [5, -4], [6, 4]]); L([[-1, -4], [0, 4]]); break;
      case 'falaises': ctx.beginPath(); ctx.ellipse(0, 0, 5, 9, 0.4, 0, Math.PI * 2); ctx.stroke(); L([[2, -6], [5, -3]]); break; // mousqueton
      case 'kv': L([[-9, 8], [-3, 2], [1, 5], [9, -8]]); poly(ctx, [[9, -8], [3, -7], [8, -2]], col); break; // dénivelé
      case 'parapente': ctx.beginPath(); ctx.arc(0, 0, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); L([[-7, -3], [0, 8], [7, -3]]); circle(ctx, 0, 8, 2, col); break;
      case 'riviere': L([[-9, 7], [9, -7]]); ctx.beginPath(); ctx.ellipse(-8, 6, 3, 5, 0.8, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(8, -6, 3, 5, 0.8, 0, 7); ctx.fill(); break; // pagaie
      case 'plongee': rrect(ctx, -9, -4, 18, 9, 4, col); ctx.fillStyle = '#00000055'; ctx.fillRect(-1, -4, 2, 9); L([[9, -1], [11, -1], [11, -9]]); break; // masque
      case 'glacier': L([[-6, 8], [4, -8]]); L([[-1, -8], [9, -6]]); break; // piolet
      case 'arete': poly(ctx, [[2, -9], [-6, 1], [0, 1], [-2, 9], [7, -2], [1, -2]], col); break; // éclair
      case 'slalom': L([[-6, 9], [-2, -9]]); L([[2, 9], [6, -9]]); poly(ctx, [[-2, -9], [6, -9], [5, -4], [-3, -4]], col); break; // porte
      case 'descente': ctx.save(); ctx.rotate(-0.6); rrect(ctx, -3.5, -10, 7, 20, 3.5, col); ctx.restore(); break; // snowboard
      default: R.flower(ctx, 0, 0, 0.8, true);
    }
    ctx.restore();
  };

  /* Carte complète : s = { nodes, levels, shop, done(i), open(i), sel, best, gold, tick, pos, title, sub, xpBar, nextTitle, stats } */
  R.worldMap = function (ctx, s) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (!cache || cacheDpr !== dpr) { cache = buildStatic(dpr); cacheDpr = dpr; }
    ctx.drawImage(cache, 0, 0, W, H);
    const t = s.tick;
    // nuages qui passent (ombres)
    for (let i = 0; i < 3; i++) { const x = ((t * 0.12 + i * 380) % 1300) - 200, y = 90 + i * 120; ctx.fillStyle = '#ffffff55'; ctx.beginPath(); ctx.ellipse(x, y, 70, 18, 0, 0, Math.PI * 2); ctx.ellipse(x + 40, y - 10, 44, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    // bateau et oiseaux
    const bx = 760 + Math.sin(t * 0.005) * 60; poly(ctx, [[bx - 14, 470], [bx + 14, 470], [bx + 9, 478], [bx - 9, 478]], '#f5f5f0'); ctx.fillStyle = '#5a4a3a'; ctx.fillRect(bx - 1, 452, 2, 18); poly(ctx, [[bx + 1, 452], [bx + 12, 466], [bx + 1, 466]], '#ffffff');
    ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.4; for (let i = 0; i < 3; i++) { const a = t * 0.02 + i * 2, x = 560 + Math.cos(a) * 30, y = 212 + Math.sin(a) * 8; ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.quadraticCurveTo(x - 2, y - 3, x, y); ctx.quadraticCurveTo(x + 2, y - 3, x + 5, y); ctx.stroke(); }
    // chemin
    const pts = [s.shop, ...s.nodes];
    let lastOpen = 0; s.nodes.forEach((n, k) => { if (s.open(k)) lastOpen = k + 1; });
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#00000022'; ctx.lineWidth = 7; ctx.beginPath(); smoothPath(ctx, pts.map(p => ({ x: p.x + 2, y: p.y + 3 }))); ctx.stroke();
    ctx.strokeStyle = '#fbf6e9'; ctx.lineWidth = 6; ctx.beginPath(); smoothPath(ctx, pts); ctx.stroke();
    ctx.setLineDash([2, 9]); ctx.strokeStyle = '#a99d84'; ctx.lineWidth = 3; ctx.beginPath(); smoothPath(ctx, pts); ctx.stroke(); ctx.setLineDash([]);
    if (lastOpen > 0) { ctx.strokeStyle = '#c4572a'; ctx.lineWidth = 4; ctx.beginPath(); smoothPath(ctx, pts.slice(0, lastOpen + 1)); ctx.stroke(); }
    // boutique
    const S = s.shop;
    ctx.fillStyle = '#00000025'; ctx.beginPath(); ctx.ellipse(S.x + 3, S.y + 6, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
    rrect(ctx, S.x - 26, S.y - 26, 52, 30, 3, '#20382c');
    for (let i = 0; i < 4; i++) poly(ctx, [[S.x - 30 + i * 15, S.y - 30], [S.x - 15 + i * 15, S.y - 30], [S.x - 22 + i * 15, S.y - 19]], i % 2 ? '#e9a44c' : '#fff4dc');
    ctx.fillStyle = '#f6c277'; ctx.fillRect(S.x - 20, S.y - 14, 12, 12); ctx.fillRect(S.x + 8, S.y - 14, 12, 12);
    R.flower(ctx, S.x, S.y - 8, 0.6);
    label(ctx, S.x, S.y + 22, 'La boutique', s.sel === -1);
    if (s.sel === -1) ring(ctx, S.x, S.y - 12, 36, t);
    // étapes
    s.nodes.forEach((n, k) => {
      const done = s.done(k), open = s.open(k), sel = k === s.sel, cur = open && !done;
      const lift = cur ? Math.sin(t * 0.08) * 2 : 0, y = n.y + lift;
      ctx.fillStyle = '#00000030'; ctx.beginPath(); ctx.ellipse(n.x + 2, n.y + 18, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
      circle(ctx, n.x, y, 21, '#fbf6e9');
      circle(ctx, n.x, y, 18, done ? '#2f6a48' : cur ? '#e2683a' : '#a49a86');
      if (open) R.actIcon(ctx, s.levels[k].id, n.x, y, 0.95, '#ffffff');
      else { rrect(ctx, n.x - 6, y - 2, 12, 9, 2, '#f1ece0'); ctx.strokeStyle = '#f1ece0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n.x, y - 3, 4, Math.PI, 0); ctx.stroke(); }
      // numéro
      circle(ctx, n.x - 15, y - 15, 8, '#20382c'); ctx.fillStyle = '#fff4dc'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(k + 1), n.x - 15, y - 11.5); ctx.textAlign = 'left';
      const b = s.best[k];
      if (b) { for (let q = 0; q < 3; q++) R.flower(ctx, n.x - 12 + q * 12, y + 26, 0.45, q < b.stars); if (b.medal) { circle(ctx, n.x + 16, y - 15, 6.5, ['', '#c08a5a', '#c9d2da', '#f2c230'][b.medal]); ctx.strokeStyle = '#fbf6e9'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(n.x + 16, y - 15, 6.5, 0, 7); ctx.stroke(); } }
      if (s.gold(k)) R.flower(ctx, n.x + 19, y + 10, 0.42, true);
      if (s.clean && s.clean(k)) { ctx.save(); ctx.translate(n.x - 20, y + 9); ctx.rotate(-0.6); ctx.fillStyle = '#3f9a5c'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#e8f5d8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 6); ctx.stroke(); ctx.restore(); }
      if (sel || cur) label(ctx, n.x, y + (b ? 44 : 36), s.levels[k].name.replace(/^(Le |La |Les |L')/, ''), sel);
      if (sel) ring(ctx, n.x, y, 28, t);
    });
    // le Vieux
    R.vieux(ctx, 8, s.pos.x + 30, s.pos.y + 8 - Math.abs(Math.sin(t * 0.15)) * 4, 58, { flip: true });
    // cartouche du titre
    rrect(ctx, 14, 12, 404, 70, 12, '#20382ce8');
    ctx.fillStyle = '#e9a44c'; ctx.font = '800 10px system-ui'; ctx.fillText(s.sub.toUpperCase(), 30, 32);
    ctx.fillStyle = '#fff8e8'; ctx.font = 'bold 22px Georgia, serif'; ctx.fillText(s.title, 30, 56);
    rrect(ctx, 30, 66, 170, 6, 3, '#ffffff22'); rrect(ctx, 30, 66, 170 * s.xpBar, 6, 3, '#e9a44c');
    ctx.fillStyle = '#cdd8c3'; ctx.font = '11px system-ui'; ctx.fillText(s.stats, 210, 72);
  };
  function label(ctx, x, y, text, strong) {
    ctx.font = (strong ? 'bold ' : '600 ') + '12px system-ui';
    const w = ctx.measureText(text).width + 16;
    rrect(ctx, x - w / 2, y - 12, w, 20, 10, strong ? '#20382c' : '#fbf6e9ee');
    ctx.fillStyle = strong ? '#fff4dc' : '#3a2e20'; ctx.textAlign = 'center'; ctx.fillText(text, x, y + 2); ctx.textAlign = 'left';
  }
  function ring(ctx, x, y, r, t) {
    ctx.strokeStyle = '#c4572a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, r + Math.sin(t * 0.1) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(x, y, r + 6 + (t % 40) / 4, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }
})(window.R);
