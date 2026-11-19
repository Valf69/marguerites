/* Les Marguerites du Vieux : moteur physique partagé (jeu + vérificateur de niveaux). */
(function (root) {
  'use strict';
  const T = 32;
  const P = {
    grav: 0.62, maxFall: 14,
    run: 5.2, acc: 0.3, accAir: 0.17, accIce: 0.035,
    jump: 12.6, jump2: 11.4, cut: -4.2, spring: 17.6,
    coyote: 7, buffer: 8,
    ropeRange: 275, ropeMin: 44, ropeMax: 290,
    w: 22, h: 50
  };
  const TILES = '#=I^~CQqThBJw'; // B : boue (VTT), J : caisse à monture, w : vasque (canyoning)

  function parseLevel(def) {
    const h = def.rows.length;
    const w = Math.max.apply(null, def.rows.map(r => r.length));
    const grid = [], ents = [];
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        let c = def.rows[y][x] || '.';
        if (c === '.') c = ' ';
        // p / , : page ou pâquerette cachée derrière un passage secret
        if (c === 'p') { ents.push({ c: 'P', tx: x, ty: y, hidden: true }); c = 'h'; }
        else if (c === ',') { ents.push({ c: '*', tx: x, ty: y, hidden: true }); c = 'h'; }
        else if (c !== ' ' && TILES.indexOf(c) < 0) { ents.push({ c, tx: x, ty: y }); c = ' '; }
        row.push(c);
      }
      grid.push(row);
    }
    return { def, w, h, grid, ents, crumb: new Map(), pw: w * T, ph: h * T };
  }

  function tile(L, tx, ty) {
    if (tx < 0 || tx >= L.w) return '#';
    if (ty < 0 || ty >= L.h) return ' ';
    return L.grid[ty][tx];
  }
  function solidC(L, c, tx, ty) {
    if (c === '#' || c === 'I' || c === 'Q' || c === 'q' || c === 'B' || c === 'J') return true;
    if (c === 'C') { const s = L.crumb.get(ty * L.w + tx); return !(s && s.gone); }
    return false;
  }
  function solid(L, tx, ty) { return solidC(L, tile(L, tx, ty), tx, ty); }
  function boxSolid(L, x, y, w, h) {
    for (let tx = Math.floor(x / T); tx <= Math.floor((x + w - 0.01) / T); tx++)
      for (let ty = Math.floor(y / T); ty <= Math.floor((y + h - 0.01) / T); ty++)
        if (solid(L, tx, ty)) return true;
    return false;
  }
  /* Le joueur touche-t-il une case de ce type ? (boîte réduite pour rester juste) */
  function touches(L, b, ch, inset) {
    const i = inset || 4;
    for (let tx = Math.floor((b.x + i) / T); tx <= Math.floor((b.x + b.w - i) / T); tx++)
      for (let ty = Math.floor((b.y + i) / T); ty <= Math.floor((b.y + b.h - 2) / T); ty++)
        if (ch.indexOf(tile(L, tx, ty)) >= 0) return true;
    return false;
  }

  function moveX(L, b, dx) {
    b.x += dx; b.wall = 0;
    const y0 = Math.floor(b.y / T), y1 = Math.floor((b.y + b.h - 0.01) / T);
    if (dx > 0) {
      const tx = Math.floor((b.x + b.w - 0.01) / T);
      for (let ty = y0; ty <= y1; ty++) if (solid(L, tx, ty)) { b.x = tx * T - b.w; b.vx = 0; b.wall = 1; break; }
    } else if (dx < 0) {
      const tx = Math.floor(b.x / T);
      for (let ty = y0; ty <= y1; ty++) if (solid(L, tx, ty)) { b.x = (tx + 1) * T; b.vx = 0; b.wall = -1; break; }
    }
  }
  function moveY(L, b, dy, kayak) {
    const prevBottom = b.y + b.h;
    b.y += dy; b.onGround = false; b.gTile = null; b.bump = null;
    const x0 = Math.floor(b.x / T), x1 = Math.floor((b.x + b.w - 0.01) / T);
    if (dy > 0) {
      const ty = Math.floor((b.y + b.h - 0.01) / T), top = ty * T;
      for (let tx = x0; tx <= x1; tx++) {
        const c = tile(L, tx, ty);
        const oneWay = (c === '=' || c === 'T' || c === 'w' || (kayak && c === '~')) && prevBottom <= top + 0.01;
        if (solidC(L, c, tx, ty) || oneWay) {
          b.y = top - b.h; b.vy = 0; b.onGround = true; b.gTile = c; b.gx = tx; b.gy = ty;
          break;
        }
      }
    } else if (dy < 0) {
      const ty = Math.floor(b.y / T);
      for (let tx = x0; tx <= x1; tx++) if (solid(L, tx, ty)) { b.y = (ty + 1) * T; b.vy = 0; b.bump = { tx, ty }; break; }
    }
  }

  function newPlayer(x, y, mode) {
    const swim = mode === 'swim';
    return { x, y: swim ? y + P.h - 24 : y, w: swim ? 44 : P.w, h: swim ? 24 : P.h, vx: 0, vy: 0, onGround: false, face: 1, coy: 0, buf: 0,
      canDouble: false, jumping: false, rope: null, gTile: null, ev: [], spin: 0 };
  }

  function tryAttach(p, env) {
    let best = null, bd = P.ropeRange;
    const hx = p.x + p.w / 2, hy = p.y;
    for (const a of env.anchors || []) {
      const dx = hx - a.x, dy = hy - a.y;
      if (dy < 16) continue;
      const d = Math.hypot(dx, dy);
      if (d < bd) { best = a; bd = d; }
    }
    if (!best) return false;
    const len = Math.max(P.ropeMin, Math.min(P.ropeMax, bd));
    const ang = Math.atan2(hx - best.x, hy - best.y);
    const av = (p.vx * Math.cos(ang) - p.vy * Math.sin(ang)) / len;
    p.rope = { a: best, ax: best.x, ay: best.y, len, ang, av: Math.max(-0.08, Math.min(0.08, av)) };
    p.jumping = false; p.ev.push('attach');
    return true;
  }

  function stepRope(L, p, inp, env) {
    const r = p.rope;
    r.av += -P.grav / r.len * Math.sin(r.ang);
    const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
    r.av += dir * 0.0018 * Math.cos(r.ang);
    r.av *= 0.996;
    if (inp.u) r.len = Math.max(P.ropeMin, r.len - 2.4);
    if (inp.d) r.len = Math.min(P.ropeMax, r.len + 2.6);
    const oldAng = r.ang;
    r.ang += r.av;
    let nx = r.ax + Math.sin(r.ang) * r.len - p.w / 2, ny = r.ay + Math.cos(r.ang) * r.len;
    if (boxSolid(L, nx, ny, p.w, p.h)) {
      r.ang = oldAng; r.av *= -0.35;
      nx = r.ax + Math.sin(r.ang) * r.len - p.w / 2; ny = r.ay + Math.cos(r.ang) * r.len;
      if (boxSolid(L, nx, ny, p.w, p.h)) { r.len = Math.max(P.ropeMin, r.len - 3); nx = p.x; ny = p.y; }
    }
    p.vx = Math.max(-11, Math.min(11, nx - p.x)); p.vy = ny - p.y;
    p.x = nx; p.y = ny;
    if (Math.abs(r.av) > 0.004) p.face = r.av * Math.cos(r.ang) > 0 ? 1 : -1;
    if (p.buf > 0) {
      p.rope = null; p.buf = 0;
      p.vy = Math.max(-16, Math.min(p.vy, 0) - P.jump * 0.92); p.vx *= 1.1; p.jumping = true;
      p.canDouble = !!env.hasPoles; p.coy = 0; p.ev.push('release');
    } else if (inp.actionPressed) {
      p.rope = null; p.canDouble = !!env.hasPoles; p.coy = 0; p.ev.push('drop');
    }
  }

  /* Colonnes d'air chaud (parapente) : entités Y */
  function liftFn(L) {
    const cols = L.ents.filter(e => e.c === 'Y').map(e => e.tx * T + T / 2);
    return (x, y) => {
      for (const cx of cols) if (Math.abs(x - cx) < 80) return y > 3 * T ? -3.2 : -0.2;
      return 0;
    };
  }

  function stepFly(L, p, inp, env) {
    const d = inp.d ? 1 : 0, u = inp.u ? 1 : 0;
    const tx = 3.3 + (inp.r ? 1.7 : 0) - (inp.l ? 1.5 : 0) + d * 1.1 - u * 1.2;
    p.vx += (tx - p.vx) * 0.04; p.face = 1;
    const lift = env.lift ? env.lift(p.x + p.w / 2, p.y + p.h / 2) : 0;
    const wind = env.wind ? env.wind(p.x + p.w / 2, p.y + p.h / 2) : 0;
    const ty = 1.0 + d * 1.6 - u * 0.35 + (inp.r ? 0.45 : 0) + lift;
    p.vy += (ty - p.vy) * 0.06;
    // chaque appui sur la touche action donne un coup de voile vers le haut
    if (inp.actionPressed) { p.vy = Math.max(-5.5, p.vy - 3.2); p.ev.push('flap'); }
    moveX(L, p, p.vx + wind);
    moveY(L, p, p.vy, false);
    if (p.y < 0) { p.y = 0; if (p.vy < 0) p.vy = 0; }
    if (p.onGround) p.ev.push('touch');
    return p.ev;
  }

  function stepSwim(L, p, inp, env) {
    const ax = (inp.r ? 1 : 0) - (inp.l ? 1 : 0), ay = (inp.d ? 1 : 0) - ((inp.u || inp.jumpHeld) ? 1 : 0);
    const n = Math.hypot(ax, ay) || 1, sp = inp.actionHeld ? 5 : 3.3;
    p.vx += (ax / n * sp - p.vx) * 0.08;
    p.vy += (ay / n * sp - p.vy) * 0.08 + 0.004;
    if (ax) p.face = ax;
    const cur = env.wind ? env.wind(p.x + p.w / 2, p.y + p.h / 2) : 0;
    moveX(L, p, p.vx + cur);
    moveY(L, p, p.vy, false);
    const top = env.surface || 0;
    if (p.y < top) { p.y = top; if (p.vy < 0) p.vy = 0; }
    return p.ev;
  }

  /* Un pas de simulation (1/60 s). inp = {l,r,u,d,jumpPressed,jumpHeld,actionPressed,actionHeld} */
  function stepPlayer(L, p, inp, env) {
    p.ev.length = 0;
    if (env.mode === 'fly') return stepFly(L, p, inp, env);
    if (env.mode === 'swim') return stepSwim(L, p, inp, env);
    if (inp.jumpPressed) p.buf = P.buffer; else if (p.buf > 0) p.buf--;
    if (p.rope) { stepRope(L, p, inp, env); return p.ev; }
    if (env.hasRope && inp.actionPressed && env.mode === 'walk' && tryAttach(p, env)) { stepRope(L, p, { l: 0, r: 0 }, env); return p.ev; }

    const mode = env.mode || 'walk';
    const ice = p.onGround && p.gTile === 'I';
    if (mode === 'walk') {
      const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
      const max = P.run * (env.speedMul || 1);
      const acc = p.onGround ? (ice && !env.hasCrampons ? P.accIce : P.acc) : P.accAir;
      p.vx += (dir * max - p.vx) * acc;
      if (dir) p.face = dir;
    } else if (mode === 'bike') {
      let target = 5.0 + (inp.r ? 3.2 : 0) - (inp.l ? 3.4 : 0);
      if (p.onGround && p.gTile === 'B' && !env.hasTires) target *= 0.45;
      p.vx += (target - p.vx) * (p.onGround ? 0.08 : 0.02);
      p.face = 1;
    } else {
      const k = mode === 'kayak';
      let target = (k ? 4.4 : 6.0) + (inp.r ? (k ? 2 : 2.6) : 0) - (inp.l ? (k ? 2 : 2.8) : 0);
      if (!k && ice) target += 2.6;
      p.vx += (target - p.vx) * (p.onGround ? 0.07 : 0.025);
      p.face = 1;
    }
    if (p.onGround) { p.coy = P.coyote; p.canDouble = !!env.hasPoles && mode === 'walk'; }
    else if (p.coy > 0) p.coy--;

    if (p.buf > 0) {
      if (p.coy > 0) {
        p.vy = -P.jump * (env.jumpMul || 1); p.coy = 0; p.buf = 0; p.jumping = true; p.onGround = false; p.ev.push('jump');
      } else if (p.canDouble) {
        p.vy = -P.jump2 * (env.jumpMul || 1); p.canDouble = false; p.buf = 0; p.jumping = true; p.ev.push('jump2');
      }
    }
    if (p.jumping && !inp.jumpHeld && p.vy < P.cut) p.vy = P.cut;
    if (p.vy >= 0) p.jumping = false;
    p.vy = Math.min(P.maxFall, p.vy + P.grav);

    const wind = env.wind ? env.wind(p.x + p.w / 2, p.y + p.h / 2) : 0;
    const wasGround = p.onGround, vx0 = p.vx;
    moveX(L, p, p.vx + wind);
    // trail : on franchit les marches d'une case sans sauter
    if (env.autoStep && p.wall && wasGround && p.wall === Math.sign(vx0) && !boxSolid(L, p.x + p.wall * 3, p.y - T, p.w, p.h)) {
      p.y -= T; p.vx = vx0; moveX(L, p, p.wall * 3); p.ev.push('step');
    }
    moveY(L, p, p.vy, mode === 'kayak');
    // en snowboard, passer sur un tremplin suffit à décoller
    if ((mode === 'snow' || mode === 'ski' || mode === 'bike') && p.onGround && touches(L, p, 'T', 2)) { p.onGround = false; p.gTile = 'T'; p.vy = 0; p.ev.push('kick'); }
    if ((p.onGround && p.gTile === 'T') || p.ev[p.ev.length - 1] === 'kick') {
      if (p.ev[p.ev.length - 1] === 'kick') p.ev.pop();
      p.vy = -P.spring; p.onGround = false; p.jumping = false; p.coy = 0;
      p.canDouble = !!env.hasPoles && mode === 'walk'; p.ev.push('spring');
    }
    if (p.onGround && !wasGround) p.ev.push('land');
    return p.ev;
  }

  root.Core = { T, P, liftFn, parseLevel, tile, solid, solidC, boxSolid, touches, moveX, moveY, newPlayer, stepPlayer, tryAttach };
})(typeof window !== 'undefined' ? window : globalThis);
