/* Les Marguerites du Vieux : dessins de l'Été du Vieux (montures, pêche, triathlon, canyoning, fête de victoire). */
(function (R) {
  'use strict';
  const W = 960, H = 540, T = 32;
  const { poly, circle, rrect, rnd } = R;

  /* ───── Palette du canyon ───── */
  R.PAL.canyon = { sky: ['#7fc0dc', '#f2e4c8'], sky2: ['#5a9cc8', '#e8d6b8'], sun: '#fff3c8', far: '#b9a28c', mid: '#b48a6c', hill: '#9d7258', tree: ['#5f8a5a', '#6f9a64'],
    body: '#a8714f', body2: '#955f42', top: '#7aa858', topL: '#c2d47a', ledge: '#8d6b47', water: '#1fa6a6', waterTop: '#b8f4ec', spike: '#6d5443', ice: '#c9e6f0', deco: 'grass' };

  const baseBg = R.background;
  R.background = function (ctx, theme, cam, t, prog, lvH, flash) {
    if (theme !== 'canyon') return baseBg(ctx, theme, cam, t, prog, lvH, flash);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#86c6e0'); g.addColorStop(0.7, '#f2e4c8'); g.addColorStop(1, '#e8d2b0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    circle(ctx, 770 - cam.x * 0.02, 80, 44, '#fff3c855'); circle(ctx, 770 - cam.x * 0.02, 80, 34, '#fff3c8');
    const vy = Math.max(-200, Math.min(400, (lvH - H) - cam.y));
    // parois du canyon en couches ocre
    for (const [k, base, col, col2] of [[0.15, 300, '#c9a07c', '#d9b892'], [0.3, 360, '#b5825f', '#c7966f'], [0.5, 420, '#9b6a4c', '#ad7a58']]) {
      const off = cam.x * k;
      for (let i = -1; i < 9; i++) {
        const x = i * 160 - (off % 160), s = i + Math.floor(off / 160), top = base - 140 - rnd(s * 3.1) * 120 + vy * k * 0.5;
        poly(ctx, [[x - 20, H + 50], [x - 10, top + 30], [x + 30, top], [x + 120, top + 10], [x + 150, top + 50], [x + 180, H + 50]], col);
        ctx.fillStyle = col2; for (let j = 0; j < 4; j++) ctx.fillRect(x - 10 + j * 8, top + 40 + j * 36, 170 - j * 16, 6);
      }
    }
    // cascade au loin
    const wx = ((420 - cam.x * 0.3) % 1400 + 1400) % 1400 - 200;
    ctx.fillStyle = '#e8fbffaa'; ctx.fillRect(wx, 150 + vy * 0.15, 26, 260);
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) ctx.fillRect(wx + 4 + i * 4, 150 + vy * 0.15 + ((t * 3 + i * 40) % 260), 2, 18);
    for (let i = 0; i < 5; i++) circle(ctx, wx + 13 + Math.sin(t * 0.1 + i) * 14, 410 + vy * 0.15, 10 + i * 2, '#ffffff66');
  };

  /* ───── Tuiles nouvelles : caisse à monture (J) et vasque (w) ───── */
  R.mountBox = function (ctx, x, y, t) {
    rrect(ctx, x + 1, y + 1, T - 2, T - 2, 4, '#5fa04a');
    ctx.strokeStyle = '#2f6a2f'; ctx.lineWidth = 2; ctx.strokeRect(x + 4, y + 4, T - 8, T - 8);
    const b = Math.sin(t * 0.12) * 1.2;
    // empreinte de sabot
    ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.ellipse(x + 12, y + 16 + b, 4, 7, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 20, y + 16 + b, 4, 7, 0.2, 0, Math.PI * 2); ctx.fill();
  };

  /* ───── Montures : chamois et marmotte (dir 1 = vers la droite) ───── */
  R.mountRide = function (ctx, kind, x, feet, t, run, dir, scale, vy) {
    const s = scale || 1, air = vy && Math.abs(vy) > 0.5;
    ctx.save(); ctx.translate(x, feet); ctx.scale((dir || 1) * s, s);
    const ph = run ? t * 0.38 : 0, sw = a => air ? 0.5 : Math.sin(ph + a) * 0.55;
    ctx.fillStyle = '#00000025'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
    if (kind === 'chamois') {
      const leg = (lx, a, c) => { ctx.save(); ctx.translate(lx, -16); ctx.rotate(sw(a)); ctx.fillStyle = c; ctx.fillRect(-2, 0, 4, 16); ctx.fillStyle = '#2a1d14'; ctx.fillRect(-2, 13, 4, 3); ctx.restore(); };
      leg(-14, Math.PI, '#5d3f28'); leg(12, 0, '#5d3f28');
      rrect(ctx, -22, -34, 44, 20, 10, '#8a5f3a');
      ctx.fillStyle = '#6b4a30'; ctx.fillRect(-20, -22, 40, 3);
      leg(-10, 0, '#6b4a30'); leg(16, Math.PI, '#6b4a30');
      poly(ctx, [[-22, -30], [-28, -34], [-24, -24]], '#5d3f28');
      const hb = run ? Math.sin(ph * 2) * 1.5 : Math.sin(t * 0.04) * 1.5;
      rrect(ctx, 14, -50 + hb, 13, 22, 5, '#8a5f3a');
      rrect(ctx, 20, -48 + hb, 12, 9, 4, '#8a5f3a');
      ctx.fillStyle = '#efe6d6'; ctx.fillRect(16, -46 + hb, 15, 3);
      ctx.strokeStyle = '#1b1410'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(18, -50 + hb); ctx.lineTo(18, -59 + hb); ctx.quadraticCurveTo(16, -63 + hb, 13, -60 + hb); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(23, -50 + hb); ctx.lineTo(23, -59 + hb); ctx.quadraticCurveTo(21, -63 + hb, 18, -60 + hb); ctx.stroke();
      circle(ctx, 25, -46 + hb, 1.6, '#1b1410');
    } else {
      const leg = (lx, a) => { ctx.save(); ctx.translate(lx, -8); ctx.rotate(sw(a) * 0.8); rrect(ctx, -3, 0, 7, 9, 3, '#7a5a3e'); ctx.restore(); };
      leg(-12, Math.PI); leg(10, 0);
      ctx.fillStyle = '#7a5a3e'; ctx.beginPath(); ctx.ellipse(-25, -16 + (run ? Math.sin(ph) * 2 : 0), 8, 5, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9a7350'; ctx.beginPath(); ctx.ellipse(0, -18, 24, 15, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c9a27a'; ctx.beginPath(); ctx.ellipse(4, -12, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
      leg(-6, 0); leg(14, Math.PI);
      const hb = run ? Math.sin(ph * 2) * 1.2 : 0;
      circle(ctx, 22, -26 + hb, 11, '#9a7350'); circle(ctx, 16, -35 + hb, 3.5, '#7a5a3e'); circle(ctx, 25, -36 + hb, 3.5, '#7a5a3e');
      ctx.fillStyle = '#c9a27a'; ctx.beginPath(); ctx.ellipse(28, -22 + hb, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
      circle(ctx, 33, -24 + hb, 2, '#4a2f20'); circle(ctx, 25, -29 + hb, 1.6, '#1b1410');
      ctx.fillStyle = '#fff'; ctx.fillRect(30, -20 + hb, 3, 3);
    }
    ctx.restore();
  };

  /* ───── Poissons de la pêche sous-marine ───── */
  R.fish = function (ctx, x, y, t, kind, scale, dir) {
    ctx.save(); ctx.translate(x, y); ctx.scale((dir || 1) * scale, scale);
    const wag = Math.sin(t * 0.25) * 3;
    const body = kind === 'loup' ? '#9aa8b4' : kind === 'daurade' ? '#c8cfd6' : '#c9d2da', len = kind === 'loup' ? 26 : 20, hgt = kind === 'loup' ? 7 : 10;
    poly(ctx, [[-len + 4, 0], [-len - 10, -9 + wag], [-len - 8, 0], [-len - 10, 9 + wag]], body);
    ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, len, hgt, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00000022'; ctx.beginPath(); ctx.ellipse(0, -hgt * 0.45, len * 0.9, hgt * 0.45, 0, Math.PI, 0); ctx.fill();
    if (kind === 'sar') { ctx.fillStyle = '#2b2b2b'; for (const bx of [-6, 4]) ctx.fillRect(bx, -hgt + 2, 3, hgt * 2 - 4); circle(ctx, -len + 6, 0, 3, '#1b1b1b'); }
    if (kind === 'daurade') { ctx.fillStyle = '#f2c230'; ctx.fillRect(len - 10, -6, 3, 8); }
    poly(ctx, [[-6, -hgt + 1], [2, -hgt - 6], [8, -hgt + 1]], body);
    circle(ctx, len - 6, -2, 2.4, '#fff'); circle(ctx, len - 5.5, -2, 1.2, '#111');
    ctx.restore();
  };
  /* Bouée de signalisation reliée au plongeur (obligatoire en chasse sous-marine) */
  R.diveBuoy = function (ctx, p, surfaceY, t) {
    const bx = p.x + p.w / 2 - p.face * 46, by = surfaceY + Math.sin(t * 0.08) * 2;
    ctx.strokeStyle = '#f4f4f4aa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, by + 6); ctx.quadraticCurveTo(bx, (by + p.y) / 2 + 30, p.x + p.w / 2 - p.face * 16, p.y + p.h / 2); ctx.stroke();
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(bx - 1, by - 34, 2, 30);
    // pavillon Alpha : « plongeur en dessous »
    poly(ctx, [[bx + 1, by - 34], [bx + 10, by - 34], [bx + 10, by - 20], [bx + 1, by - 20]], '#ffffff');
    poly(ctx, [[bx + 10, by - 34], [bx + 24, by - 34], [bx + 17, by - 27], [bx + 24, by - 20], [bx + 10, by - 20]], '#1e4fa0');
    circle(ctx, bx, by, 10, '#ff7a1a'); circle(ctx, bx - 3, by - 3, 3, '#ffc08a');
  };

  /* ───── Nageur du triathlon : bras qui moulinent et bonnet ───── */
  R.swimArms = function (ctx, cx, y, st) {
    ctx.strokeStyle = '#f0c39b'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const o of [0, Math.PI]) {
      const a = st + o, hx = cx + 16 + Math.cos(a) * 22, hy = y + 4 + Math.sin(a) * 16;
      ctx.beginPath(); ctx.moveTo(cx + 12, y + 4); ctx.lineTo(hx, hy); ctx.stroke();
      if (Math.sin(a) > 0.7) circle(ctx, hx, y + 2, 4, '#ffffffcc');
    }
    circle(ctx, cx + 30, y + 4, 9, '#ff7a1a'); ctx.fillStyle = '#ffffff'; ctx.fillRect(cx + 24, y + 1, 12, 2);
  };

  /* ───── Déchets : bouteille, canette, sac (selon la position) ───── */
  const baseTrash = R.trash;
  R.trash = function (ctx, x, y, t, theme) {
    if (theme === 'sea') return baseTrash(ctx, x, y, t);
    const k = Math.floor(x / 32) % 3, b = Math.sin(t * 0.06 + x) * 1.5;
    circle(ctx, x, y + 4, 17 + Math.sin(t * 0.1 + x) * 2, '#ffffff22');
    ctx.save(); ctx.translate(x, y + 6 + b);
    if (k === 0) { ctx.rotate(1.2); rrect(ctx, -6, -14, 12, 26, 4, '#8fc7b5dd'); rrect(ctx, -3, -19, 6, 6, 2, '#3a6a8a'); ctx.fillStyle = '#ffffff66'; ctx.fillRect(-4, -10, 2, 16); }
    else if (k === 1) { ctx.rotate(1.5); rrect(ctx, -7, -11, 14, 22, 3, '#d0302f'); ctx.fillStyle = '#e9e9e9'; ctx.fillRect(-7, -11, 14, 3); ctx.fillRect(-7, 8, 14, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(-2, -5, 4, 10); }
    else { ctx.fillStyle = '#f2f2ee'; ctx.beginPath(); ctx.moveTo(-12, 8); ctx.quadraticCurveTo(-14, -8, -4, -10); ctx.quadraticCurveTo(4, -16, 10, -6); ctx.quadraticCurveTo(16, 4, 8, 9); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c9c9c0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(2, 2); ctx.moveTo(4, -8); ctx.lineTo(6, 4); ctx.stroke(); }
    ctx.restore();
  };
  R.trashIcon = function (ctx, x, y) {
    rrect(ctx, x - 7, y - 8, 14, 17, 3, '#5fa04a'); ctx.fillStyle = '#3f7a32'; ctx.fillRect(x - 9, y - 10, 18, 3); ctx.fillRect(x - 3, y - 13, 6, 3);
    ctx.strokeStyle = '#e8f5d8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y + 1, 4, 0.3, Math.PI * 1.7); ctx.stroke();
  };

  /* ───── Fête de victoire (bandeau au-dessus du jeu) ───── */
  R.celebration = function (ctx, t, info) {
    const k = Math.min(1, Math.max(0, (t - 4) / 14)), pop = 1 + Math.max(0, 1 - (t - 4) / 16) * 0.5 * Math.sin(Math.min(1, (t - 4) / 16) * Math.PI);
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, 128); ctx.scale(pop, pop);
    rrect(ctx, -250, -58, 500, 132, 22, '#20382cee');
    poly(ctx, [[-250, -10], [-290, 4], [-270, 20], [-290, 36], [-250, 50]], '#aa471f'); poly(ctx, [[250, -10], [290, 4], [270, 20], [290, 36], [250, 50]], '#aa471f');
    ctx.textAlign = 'center';
    ctx.font = 'bold 66px Georgia, serif'; ctx.lineWidth = 8; ctx.strokeStyle = '#14251c'; ctx.strokeText('BRAVO !', 0, 14);
    const g = ctx.createLinearGradient(0, -40, 0, 14); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#f2b830'); ctx.fillStyle = g; ctx.fillText('BRAVO !', 0, 14);
    for (let i = 0; i < 2; i++) R.flower(ctx, i ? 190 : -190, -8 + Math.sin(t * 0.15 + i) * 4, 1.1, true, t * 0.05);
    ctx.font = '600 16px system-ui'; ctx.fillStyle = '#fff4dc';
    const bits = ['⏱ ' + info.time, '✿ ' + info.flowers, 'Pages ' + info.pages + ' / 3'];
    if (info.trash) bits.push('Déchets ' + info.trash);
    ctx.fillText(bits.join('   ·   '), 0, 50);
    ctx.restore();
    if (t > 55 && Math.floor(t / 20) % 2 === 0) { ctx.textAlign = 'center'; ctx.font = '600 13px system-ui'; ctx.fillStyle = '#ffffffcc'; ctx.fillText('Espace pour continuer', W / 2, 228); }
    ctx.textAlign = 'left';
  };

  /* ───── Matériel de l'Été ───── */
  const baseGear = R.gear;
  R.gear = function (ctx, id, cx, cy, s) {
    if (!{ casque: 1, neoprene: 1, trifonction: 1, bouee: 1 }[id]) return baseGear(ctx, id, cx, cy, s);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (id === 'casque') {
      ctx.fillStyle = '#efe9d8'; ctx.beginPath(); ctx.arc(0, 8, 32, Math.PI, 0); ctx.fill(); ctx.fillRect(-36, 6, 72, 7);
      ctx.fillStyle = '#d8d0b8'; for (const dx of [-14, 0, 14]) ctx.fillRect(dx - 2, -18, 4, 10);
      rrect(ctx, -10, -10, 20, 14, 4, '#3b3b3b'); circle(ctx, 0, -3, 5, '#ffe9a6');
      ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-26, 12); ctx.quadraticCurveTo(0, 36, 26, 12); ctx.stroke();
    } else if (id === 'neoprene') {
      poly(ctx, [[-14, -36], [14, -36], [24, -26], [34, 10], [24, 12], [18, -12], [18, 36], [4, 36], [0, 8], [-4, 36], [-18, 36], [-18, -12], [-24, 12], [-34, 10], [-24, -26]], '#1f2a33');
      ctx.fillStyle = '#1fa6a6'; ctx.fillRect(-18, -18, 36, 4); ctx.fillRect(-30, 4, 8, 3); ctx.fillRect(22, 4, 8, 3);
      ctx.fillStyle = '#555'; ctx.fillRect(-1, -34, 2, 30);
    } else if (id === 'trifonction') {
      poly(ctx, [[-12, -36], [-4, -30], [4, -30], [12, -36], [20, -30], [18, 6], [20, 30], [4, 30], [0, 16], [-4, 30], [-20, 30], [-18, 6], [-20, -30]], '#1e8bc3');
      ctx.fillStyle = '#f2c230'; ctx.fillRect(-18, -6, 36, 6); ctx.fillStyle = '#e2683a'; ctx.fillRect(-18, 0, 36, 3);
      R.flower(ctx, 0, -16, 0.6, true);
    } else if (id === 'bouee') {
      ctx.fillStyle = '#4a4a4a'; ctx.fillRect(-2, -44, 3, 30);
      poly(ctx, [[1, -44], [14, -44], [14, -24], [1, -24]], '#ffffff'); poly(ctx, [[14, -44], [34, -44], [24, -34], [34, -24], [14, -24]], '#1e4fa0');
      circle(ctx, 0, 0, 22, '#ff7a1a'); circle(ctx, -6, -7, 6, '#ffc08a'); ctx.fillStyle = '#c95a10'; ctx.fillRect(-22, 2, 44, 4);
    }
    ctx.restore();
  };

  /* ───── Arrivées de l'Été ───── */
  const baseExit = R.exit;
  R.exit = function (ctx, kind, x, y, t) {
    if (kind === 'arch') {
      ctx.fillStyle = '#e8e8e8'; ctx.fillRect(x - 80, y - 120, 10, 120); ctx.fillRect(x + 70, y - 120, 10, 120);
      rrect(ctx, x - 90, y - 140, 180, 30, 6, '#1e8bc3');
      ctx.fillStyle = '#fff'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('ARRIVÉE', x, y - 119); ctx.textAlign = 'left';
      for (let i = 0; i < 9; i++) { const fx = x - 72 + i * 18; poly(ctx, [[fx, y - 110], [fx + 14, y - 110], [fx + 7, y - 98 + Math.sin(t * 0.15 + i) * 2]], ['#e2683a', '#f2c230', '#2f9e6f'][i % 3]); }
      ctx.fillStyle = '#2b2b2b'; for (let i = 0; i < 8; i++) ctx.fillRect(x - 70 + i * 18, y - 3, 9, 3);
      return;
    }
    if (kind === 'canyon') {
      ctx.fillStyle = '#6e5440'; ctx.fillRect(x - 2, y - 70, 5, 70);
      rrect(ctx, x - 50, y - 84, 104, 28, 4, '#d9b07a'); ctx.strokeStyle = '#8a6a48'; ctx.lineWidth = 2; ctx.strokeRect(x - 50, y - 84, 104, 28);
      ctx.fillStyle = '#5a4532'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.fillText('SORTIE DU', x + 2, y - 72); ctx.fillText('CANYON', x + 2, y - 60); ctx.textAlign = 'left';
      return;
    }
    return baseExit(ctx, kind, x, y, t);
  };

  /* ───── Personnages supplémentaires ───── */
  Object.assign(R.PEOPLE, {
    lou: { skin: '#e8b48a', hair: '#2b1d17', hairType: 'curly', top: '#1f2a33', pants: '#1f2a33', helmet: '#e2683a' }
  });

  /* ───── Pictogrammes de la carte ───── */
  const baseIcon = R.actIcon;
  R.actIcon = function (ctx, id, x, y, s, col) {
    if (!{ canyon: 1, triathlon: 1, peche: 1 }[id]) return baseIcon(ctx, id, x, y, s, col);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
    if (id === 'canyon') { ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(-8, 8); ctx.moveTo(8, -8); ctx.lineTo(8, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(-5, 2, 0, 4); ctx.quadraticCurveTo(5, 2, 0, -9); ctx.fill(); ctx.fillRect(-6, 6, 12, 2); }
    else if (id === 'triathlon') { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-6 + i * 6, -2 + (i % 2) * 5, 4, 0, Math.PI * 2); ctx.stroke(); } }
    else if (id === 'peche') { ctx.beginPath(); ctx.ellipse(1, 0, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill(); poly(ctx, [[-6, 0], [-11, -5], [-11, 5]], col); }
    ctx.restore();
  };
})(window.R);
