/* Les Marguerites du Vieux : sons et musiques synthétisés (aucun fichier audio). */
(function () {
  'use strict';
  let ac = null, master, sfxBus, musBus, echo, noiseBuf, muted = false, musicOn = true;
  let seq = null, timer = null;
  const A = {};

  A.init = function () {
    if (ac) { if (ac.state !== 'running') ac.resume().catch(() => {}); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.85; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    musBus = ac.createGain(); musBus.gain.value = 0.0; musBus.connect(master);
    echo = ac.createDelay(1); echo.delayTime.value = 0.32;
    const fb = ac.createGain(); fb.gain.value = 0.32; echo.connect(fb); fb.connect(echo);
    const wet = ac.createGain(); wet.gain.value = 0.5; echo.connect(wet); wet.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (seq) A.music(seq.name, true);
  };
  A.setMuted = function (m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.85, ac.currentTime, 0.05); };
  A.isMuted = () => muted;

  function tone(f, dur, type, vol, slide, when, bus, wetSend) {
    if (!ac || ac.state !== 'running') return;
    const t = (when || ac.currentTime), o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || sfxBus); if (wetSend) g.connect(echo);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, freq, when, bus, q) {
    if (!ac || ac.state !== 'running') return;
    const t = when || ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 0.8;
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || sfxBus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);

  A.sfx = {
    jump: () => tone(280, 0.14, 'square', 0.08, 560),
    jump2: () => { tone(420, 0.12, 'square', 0.07, 900); noise(0.12, 0.08, 3000); },
    land: () => noise(0.07, 0.06, 400),
    flower: n => tone(midi(76 + [0, 2, 4, 7, 9, 12, 14][n % 7]), 0.12, 'triangle', 0.16),
    page: () => { [0, 4, 7, 12, 16].forEach((s, i) => tone(midi(72 + s), 0.3, 'triangle', 0.14, 0, ac && ac.currentTime + i * 0.07)); },
    hurt: () => { tone(220, 0.25, 'sawtooth', 0.12, 90); noise(0.15, 0.12, 600); },
    stomp: () => { tone(180, 0.12, 'square', 0.12, 420); noise(0.1, 0.1, 900); },
    spring: () => tone(200, 0.32, 'sine', 0.2, 900),
    cairn: () => { [0, 7, 12].forEach((s, i) => tone(midi(67 + s), 0.25, 'triangle', 0.13, 0, ac && ac.currentTime + i * 0.09)); },
    attach: () => { tone(900, 0.06, 'square', 0.06); noise(0.08, 0.08, 4000); },
    release: () => tone(330, 0.16, 'triangle', 0.12, 700),
    box: () => { tone(520, 0.08, 'square', 0.1); tone(780, 0.14, 'triangle', 0.12, 0, ac && ac.currentTime + 0.06); },
    win: () => { [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => tone(midi(67 + s), 0.32, 'triangle', 0.13, 0, ac && ac.currentTime + i * 0.11)); },
    fail: () => { [7, 4, 0, -5].forEach((s, i) => tone(midi(64 + s), 0.35, 'triangle', 0.12, 0, ac && ac.currentTime + i * 0.16)); },
    thunder: () => { noise(1.4, 0.5, 120, 0, 0, 0.5); noise(0.4, 0.3, 900); },
    crackle: () => noise(0.05, 0.05, 5000),
    splash: () => { noise(0.4, 0.2, 700); tone(500, 0.2, 'sine', 0.06, 200); },
    click: () => tone(660, 0.05, 'square', 0.05),
    whistle: () => { tone(1800, 0.12, 'sine', 0.06, 2300); tone(2300, 0.1, 'sine', 0.05, 1900, ac && ac.currentTime + 0.14); },
    crumble: () => noise(0.25, 0.08, 300),
    shatter: () => { noise(0.18, 0.12, 2500); tone(1400, 0.1, 'triangle', 0.05, 2000); },
    trick: () => { [0, 5, 9, 12].forEach((s, i) => tone(midi(74 + s), 0.12, 'square', 0.06, 0, ac && ac.currentTime + i * 0.05)); },
    buy: () => { tone(988, 0.08, 'square', 0.07); tone(1319, 0.2, 'square', 0.07, 0, ac && ac.currentTime + 0.08); },
    talk: () => tone(500 + Math.random() * 160, 0.03, 'square', 0.025),
    rumble: () => noise(0.5, 0.15, 90, 0, 0, 0.4),
    bell: () => { tone(2100, 0.25, 'sine', 0.1); tone(2100, 0.25, 'sine', 0.08, 0, ac && ac.currentTime + 0.12); },
    medal: () => { [0, 7, 12, 16, 19, 24].forEach((s, i) => tone(midi(72 + s), 0.25, 'triangle', 0.12, 0, ac && ac.currentTime + i * 0.06)); }
  };

  /* ───── Musique : séquenceur à pas ───── */
  const THEMES = {
    title:   { bpm: 92,  root: 55, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], arp: 'up', hat: 0, wave: 'triangle' },
    map:     { bpm: 88,  root: 55, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], arp: 'updown', hat: 0, wave: 'triangle' },
    forest:  { bpm: 104, root: 55, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 4, 0, 5, 3, 4, 4], arp: 'up', hat: 1, wave: 'triangle' },
    lake:    { bpm: 84,  root: 50, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 6, 4], arp: 'updown', hat: 0, wave: 'sine' },
    cave:    { bpm: 70,  root: 45, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], arp: 'sparse', hat: 0, wave: 'sine', echo: 1 },
    cliff:   { bpm: 108, root: 52, scale: [0, 2, 4, 5, 7, 9, 10], prog: [0, 6, 3, 0], arp: 'up', hat: 1, wave: 'triangle' },
    river:   { bpm: 124, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3], arp: 'up', hat: 2, wave: 'square' },
    glacier: { bpm: 82,  root: 54, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6], arp: 'updown', hat: 0, wave: 'sine', echo: 1 },
    storm:   { bpm: 132, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 0, 5, 6], arp: 'up', hat: 2, wave: 'sawtooth' },
    snow:    { bpm: 144, root: 57, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3], arp: 'up', hat: 2, wave: 'square' },
    end:     { bpm: 96,  root: 55, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3, 0, 3, 4, 0], arp: 'updown', hat: 1, wave: 'triangle' }
  };
  function chordNotes(th, deg) {
    const sc = th.scale, n = sc.length;
    return [0, 2, 4, 6].map(k => { const i = deg + k; return th.root + sc[i % n] + 12 * Math.floor(i / n); });
  }
  A.music = function (name, force) {
    if (!force && seq && seq.name === name) return;
    seq = { name, step: 0, next: ac ? ac.currentTime + 0.1 : 0 };
    if (!ac) return;
    musBus.gain.cancelScheduledValues(ac.currentTime);
    musBus.gain.setTargetAtTime(musicOn ? 0.13 : 0, ac.currentTime, 0.3);
    if (timer) clearInterval(timer);
    timer = setInterval(schedule, 30);
  };
  A.stopMusic = function () { if (timer) clearInterval(timer); timer = null; seq = null; if (musBus) musBus.gain.setTargetAtTime(0, ac.currentTime, 0.2); };
  function schedule() {
    if (!ac || !seq || ac.state !== 'running') return;
    const th = THEMES[seq.name] || THEMES.map, sp = 60 / th.bpm / 4;
    while (seq.next < ac.currentTime + 0.12) {
      const s = seq.step, bar = Math.floor(s / 16), pos = s % 16, ch = chordNotes(th, th.prog[bar % th.prog.length]);
      const t = seq.next, wet = !!th.echo;
      if (pos === 0 || pos === 8 || (th.hat === 2 && (pos === 6 || pos === 14))) tone(midi(ch[0] - 12), sp * 3.5, 'triangle', 0.5, 0, t, musBus);
      let note = null;
      if (th.arp === 'up' && pos % 2 === 0) note = ch[(pos / 2) % 4] + 12;
      else if (th.arp === 'updown' && pos % 2 === 0) note = ch[[0, 1, 2, 3, 2, 1, 0, 1][(pos / 2) % 8]] + 12;
      else if (th.arp === 'sparse' && (pos === 0 || pos === 6 || pos === 10)) note = ch[(pos / 2) % 4] + 12;
      if (note) tone(midi(note), sp * 2.2, th.wave, th.wave === 'square' || th.wave === 'sawtooth' ? 0.12 : 0.3, 0, t, musBus, wet);
      if (pos % 16 === 0 && bar % 2 === 0) tone(midi(ch[2] + 24), sp * 6, 'sine', 0.12, 0, t, musBus, true);
      if (th.hat && pos % 4 === 2) noise(0.04, th.hat === 2 ? 0.18 : 0.1, 7000, t, musBus, 1.5);
      if (th.hat === 2 && pos % 8 === 4) noise(0.12, 0.3, 1800, t, musBus, 0.9);
      seq.step++; seq.next += sp;
    }
  }
  window.Snd = A;
})();
