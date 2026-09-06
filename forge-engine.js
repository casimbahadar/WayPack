/*!
 * forge-engine.js — the Musical Forge Studio audio engine, standalone.
 *
 * Pure Web Audio API. No dependencies, no build step. Extracted verbatim from
 * Musical Forge Studio so every project using it produces identical sound —
 * one shared composer, never a parallel one.
 *
 * USAGE
 *   <script src="forge-engine.js"></script>
 *   ForgeEngine.play(recipe);      // start a looping theme
 *   ForgeEngine.stop();            // stop playback
 *   await ForgeEngine.renderWav(recipe);  // -> Blob, for export/download
 *   ForgeEngine.duration(recipe);  // seconds for one pass
 *   ForgeEngine.voices();          // { key: "Label" } of the 22 instruments
 *
 * RECIPE
 *   {
 *     root:  55,             // MIDI note of the tonic (55 = G3)
 *     mode:  "mixo",         // major | minor | harmMinor | phrygian | lydian | dorian | mixo
 *     bpm:   118,
 *     prog:  [0,5,3,4],      // scale degrees, 0 = tonic
 *     bass:  "pulse",        // pulse | walk | oct | whole
 *     drums: "drive",        // none | sparse | light | drive | double
 *     lead:  "brass",        // any key from ForgeEngine.voices()
 *     dens:  "med",          // low | med | high
 *     bars:  12,
 *     seed:  101             // same seed + same recipe = same melody, always
 *   }
 *
 * DETERMINISM
 *   The composition — melody, harmony, rhythm — is fully determined by the recipe
 *   and its seed, so the same recipe always plays the same piece. The reverb
 *   impulse and one vocal-pad detune use Math.random, so two renders of the same
 *   recipe are musically identical but not bit-identical. That is inherited from
 *   the Studio engine and deliberately left as-is: this file must stay the same
 *   engine, not a fork of it.
 *
 * Audio can only start from a user gesture (tap/click) — browsers require it.
 */
(function(){
'use strict';
const PATTERN_HIGH = [[1,.5,.5,.5,.5,1],[.5,.5,1,.5,.5,1],[.5,.5,.5,.5,1,1],[.5,.5,.5,.5,.5,.5,1],[1,1,.5,.5,1]];

const PATTERN_MED  = [[2,1,1],[1,1,2],[1,1,1,1],[1,.5,.5,2],[.5,.5,1,2],[2,.5,.5,1]];

const PATTERN_LOW  = [[4],[2,2],[3,1],[2,1,1],[1,3]];

function pluck(e, t, f, d, damp, cutoff, vol){
  const c = e.ctx;
  const src = c.createBufferSource();
  src.buffer = ksBuffer(c, f, Math.min(d + 0.6, 2.2), damp);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(lp); lp.connect(g); g.connect(e.lead.g);
  src.start(t);
}

const MODES = {
  major:    [0,2,4,5,7,9,11],
  minor:    [0,2,3,5,7,8,10],
  dorian:   [0,2,3,5,7,9,10],
  mixo:     [0,2,4,5,7,9,10],
  phrygian: [0,1,3,5,7,8,10],
  lydian:   [0,2,4,6,7,9,11],
  harmMinor:[0,2,3,5,7,8,11]
};

function mFreq(m){ return 440 * Math.pow(2, (m - 69) / 12); }

function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VOICE_LABEL = {
  piano:"piano", epiano:"e-piano", organ:"organ", guitar:"guitar",
  harp:"harp", marimba:"marimba", bell:"bell", brass:"brass",
  strings:"strings", sawlead:"saw lead", square:"chip square", fm:"flute",
  choir:"choir (aah)", ooh:"voice (ooh)", musicbox:"music box", celesta:"celesta",
  steeldrum:"steel drum", pizz:"pizzicato", accordion:"accordion",
  synthbass:"synth bass", banjo:"banjo", sitar:"sitar"
};

function chordDegrees(d){ return [d % 7, (d + 2) % 7, (d + 4) % 7]; }

function buildExtScale(root, scale){
  const ext = [];
  for (let o = -1; o <= 2; o++)
    for (let i = 0; i < 7; i++)
      ext.push(root + 12 * o + scale[i]);
  return ext;
}

function makeBuffers(ctx){
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  const irLen = Math.floor(ctx.sampleRate * 2.4);
  const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
  for (let c = 0; c < 2; c++){
    const b = ir.getChannelData(c);
    for (let i = 0; i < irLen; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
  }
  return { noise, ir };
}

function buildEnv(ctx, bufs){
  const master = ctx.createBiquadFilter();
  master.type = "lowpass"; master.frequency.value = 6500;
  master.connect(ctx.destination);

  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(master);
  const verb = ctx.createConvolver(); verb.buffer = bufs.ir;
  const wet = ctx.createGain(); wet.gain.value = 0.4;
  verb.connect(wet); wet.connect(out);

  function channel(vol, send){
    const g = ctx.createGain(); g.gain.value = vol;
    const an = ctx.createAnalyser ? ctx.createAnalyser() : null;
    let tail = g;
    if (an){ g.connect(an); tail = an; }
    tail.connect(out);
    const s = ctx.createGain(); s.gain.value = send;
    tail.connect(s); s.connect(verb);
    return { g, an };
  }
  return {
    ctx, bufs, out,
    lead: channel(0.42, 0.55),
    pad:  channel(0.13, 0.9),
    bass: channel(0.5, 0.08),
    drum: channel(0.85, 0.18)
  };
}

function vGuitar(e, t, f, d){ pluck(e, t, f, d, 0.992, 4200, 0.85); }

function vHarp(e, t, f, d){ pluck(e, t, f, d, 0.9975, 6000, 0.6); }

function vMarimba(e, t, f, d){
  const c = e.ctx;
  const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
  const o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 3.93;
  const g2 = c.createGain(); g2.gain.value = 0.22; o2.connect(g2);
  const env = c.createGain(); env.gain.value = 0;
  o1.connect(env); g2.connect(env); env.connect(e.lead.g);
  const decay = f > 500 ? 0.5 : 0.85;
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.9, t + 0.004);
  env.gain.exponentialRampToValueAtTime(0.001, t + decay);
  [o1, o2].forEach(o => { o.start(t); o.stop(t + decay + 0.05); });
}

function vBell(e, t, f, d){
  const c = e.ctx;
  const o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = f;
  const o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = f * 3.01;
  const g2 = c.createGain(); g2.gain.value = 0.18; o2.connect(g2);
  const env = c.createGain(); env.gain.value = 0;
  o1.connect(env); g2.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.8, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.001, t + Math.max(d, 0.25) + 0.4);
  [o1, o2].forEach(o => { o.start(t); o.stop(t + Math.max(d, 0.25) + 0.5); });
}

function vPiano(e, t, f, d){
  const c = e.ctx;
  const env = c.createGain(); env.gain.value = 0;
  const lp = c.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(5200, t);
  lp.frequency.exponentialRampToValueAtTime(1100, t + 1.1);
  lp.connect(env); env.connect(e.lead.g);
  [[1, "triangle", 0.5], [1.0016, "triangle", 0.4], [2, "sine", 0.18]].forEach(sp => {
    const o = c.createOscillator(); o.type = sp[1]; o.frequency.value = f * sp[0];
    const g = c.createGain(); g.gain.value = sp[2];
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t + d + 0.5);
  });
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + 0.005);
  env.gain.exponentialRampToValueAtTime(0.28, t + Math.min(1.0, d + 0.3));
  env.gain.setValueAtTime(Math.min(0.28, 1), t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.35);
}

function vEPiano(e, t, f, d){
  const c = e.ctx;
  const car = c.createOscillator(); car.type = "sine"; car.frequency.value = f;
  const mod = c.createOscillator(); mod.type = "sine"; mod.frequency.value = f;
  const mg = c.createGain();
  mg.gain.setValueAtTime(f * 2.2, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.3);
  mod.connect(mg); mg.connect(car.frequency);
  const tine = c.createOscillator(); tine.type = "sine"; tine.frequency.value = f * 4;
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.09, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
  tine.connect(tg);
  const env = c.createGain(); env.gain.value = 0;
  car.connect(env); tg.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.85, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.3, t + Math.min(0.8, d));
  env.gain.setValueAtTime(0.3, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.25);
  [car, mod, tine].forEach(o => { o.start(t); o.stop(t + d + 0.3); });
}

function vOrgan(e, t, f, d){
  const c = e.ctx;
  const env = c.createGain(); env.gain.value = 0;
  env.connect(e.lead.g);
  const vib = c.createOscillator(); vib.frequency.value = 6;
  const vg = c.createGain(); vg.gain.value = 4; vib.connect(vg);
  [[1, 0.5], [2, 0.32], [3, 0.18], [4, 0.1]].forEach(sp => {
    const o = c.createOscillator(); o.type = "sine"; o.frequency.value = f * sp[0];
    vg.connect(o.detune);
    const g = c.createGain(); g.gain.value = sp[1];
    o.connect(g); g.connect(env);
    o.start(t); o.stop(t + d + 0.12);
  });
  vib.start(t); vib.stop(t + d + 0.12);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.8, t + 0.02);
  env.gain.setValueAtTime(0.8, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.08);
}

function vBrass(e, t, f, d){
  const c = e.ctx;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 2;
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(2600, t + 0.09);
  const env = c.createGain(); env.gain.value = 0;
  lp.connect(env); env.connect(e.lead.g);
  const vib = c.createOscillator(); vib.frequency.value = 4.5;
  const vg = c.createGain(); vg.gain.value = 5; vib.connect(vg);
  [-6, 6].forEach(det => {
    const o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.value = f; o.detune.value = det;
    vg.connect(o.detune);
    const g = c.createGain(); g.gain.value = 0.4;
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t + d + 0.2);
  });
  vib.start(t); vib.stop(t + d + 0.2);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.85, t + 0.05);
  env.gain.setValueAtTime(0.8, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.15);
}

function vStrings(e, t, f, d){
  const c = e.ctx;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1900;
  const env = c.createGain(); env.gain.value = 0;
  lp.connect(env); env.connect(e.lead.g);
  const vib = c.createOscillator(); vib.frequency.value = 5;
  const vg = c.createGain(); vg.gain.value = 5; vib.connect(vg);
  [-7, 7].forEach(det => {
    const o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.value = f; o.detune.value = det;
    vg.connect(o.detune);
    const g = c.createGain(); g.gain.value = 0.4;
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t + d + 0.55);
  });
  vib.start(t); vib.stop(t + d + 0.55);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.8, t + 0.25);
  env.gain.setValueAtTime(0.8, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.5);
}

function vSawLead(e, t, f, d){
  const c = e.ctx;
  const lp = c.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.value = 3200; lp.Q.value = 3;
  const env = c.createGain(); env.gain.value = 0;
  lp.connect(env); env.connect(e.lead.g);
  [-12, 0, 12].forEach(det => {
    const o = c.createOscillator(); o.type = "sawtooth";
    o.frequency.value = f; o.detune.value = det;
    const g = c.createGain(); g.gain.value = 0.28;
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t + d + 0.15);
  });
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.75, t + 0.012);
  env.gain.linearRampToValueAtTime(0.55, t + Math.min(0.12, d * 0.4));
  env.gain.setValueAtTime(0.55, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.12);
}

function vLeadFM(e, t, f, d){
  const c = e.ctx;
  const car = c.createOscillator(); car.type = "sine"; car.frequency.value = f;
  const mod = c.createOscillator(); mod.type = "triangle"; mod.frequency.value = f * 2;
  const mg = c.createGain(); mg.gain.value = f * 1.5;
  mod.connect(mg); mg.connect(car.frequency);
  const vib = c.createOscillator(); vib.frequency.value = 5.2;
  const vg = c.createGain(); vg.gain.value = 6;
  vib.connect(vg); vg.connect(car.detune);
  const env = c.createGain(); env.gain.value = 0;
  car.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + 0.06);
  env.gain.linearRampToValueAtTime(0.7, t + Math.min(0.3, d * 0.5));
  env.gain.setValueAtTime(0.7, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.3);
  [car, mod, vib].forEach(o => { o.start(t); o.stop(t + d + 0.35); });
}

function vLeadSquare(e, t, f, d){
  const c = e.ctx;
  const o = c.createOscillator(); o.type = "square"; o.frequency.value = f;
  const vib = c.createOscillator(); vib.frequency.value = 6;
  const vg = c.createGain(); vg.gain.value = 5;
  vib.connect(vg); vg.connect(o.detune);
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2800;
  const env = c.createGain(); env.gain.value = 0;
  o.connect(lp); lp.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.55, t + 0.015);
  env.gain.linearRampToValueAtTime(0.4, t + Math.min(0.15, d * 0.4));
  env.gain.setValueAtTime(0.4, t + d);
  env.gain.linearRampToValueAtTime(0, t + d + 0.12);
  [o, vib].forEach(x => { x.start(t); x.stop(t + d + 0.15); });
}

function vChoir(e,t,f,d){            // wordless "aah" vocal pad (formant-shaped)
  const c=e.ctx; const env=c.createGain(); env.gain.value=0; env.connect(e.lead.g);
  const formants=[[800,1],[1150,0.5],[2900,0.28]]; // vowel-ish resonances
  [-4,3].forEach(det=>{
    const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=f; o.detune.value=det;
    formants.forEach(fm=>{
      const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=fm[0]; bp.Q.value=8;
      const g=c.createGain(); g.gain.value=fm[1]*0.5; o.connect(bp); bp.connect(g); g.connect(env);
    });
    o.start(t); o.stop(t+d+0.5);
  });
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.7,t+0.18);
  env.gain.setValueAtTime(0.7,t+d); env.gain.linearRampToValueAtTime(0,t+d+0.45);
}

function vMusicBox(e,t,f,d){         // delicate, bright, fast-decaying
  const c=e.ctx; const o1=c.createOscillator(); o1.type="sine"; o1.frequency.value=f;
  const o2=c.createOscillator(); o2.type="sine"; o2.frequency.value=f*4.2;
  const g2=c.createGain(); g2.gain.value=0.3; o2.connect(g2);
  const env=c.createGain(); env.gain.value=0; o1.connect(env); g2.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.7,t+0.004);
  env.gain.exponentialRampToValueAtTime(0.001,t+Math.max(d,0.2)+0.6);
  [o1,o2].forEach(o=>{o.start(t);o.stop(t+Math.max(d,0.2)+0.7);});
}

function vSteelDrum(e,t,f,d){        // metallic, tuned-percussion ping
  const c=e.ctx; const env=c.createGain(); env.gain.value=0; env.connect(e.lead.g);
  [[1,1],[2.8,0.4],[5.4,0.2]].forEach(p=>{
    const o=c.createOscillator(); o.type="sine"; o.frequency.value=f*p[0];
    const g=c.createGain(); g.gain.value=p[1]; o.connect(g); g.connect(env);
    o.start(t); o.stop(t+Math.max(d,0.3)+0.3);
  });
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.75,t+0.006);
  env.gain.exponentialRampToValueAtTime(0.001,t+Math.max(d,0.3)+0.25);
}

function vPizz(e,t,f,d){             // pizzicato strings — short plucked bow
  const c=e.ctx; const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=2600;
  const env=c.createGain(); env.gain.value=0; lp.connect(env); env.connect(e.lead.g);
  [-6,6].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=f; o.detune.value=det;
    const g=c.createGain(); g.gain.value=0.4; o.connect(g); g.connect(lp); o.start(t); o.stop(t+0.35); });
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.8,t+0.006);
  env.gain.exponentialRampToValueAtTime(0.001,t+0.32);
}

function vAccordion(e,t,f,d){        // reedy, buzzy sustain (detuned squares)
  const c=e.ctx; const env=c.createGain(); env.gain.value=0; env.connect(e.lead.g);
  const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=3000; lp.connect(env);
  [-10,0,11].forEach(det=>{ const o=c.createOscillator(); o.type="square"; o.frequency.value=f; o.detune.value=det;
    const g=c.createGain(); g.gain.value=0.22; o.connect(g); g.connect(lp); o.start(t); o.stop(t+d+0.1); });
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.7,t+0.04);
  env.gain.setValueAtTime(0.7,t+d); env.gain.linearRampToValueAtTime(0,t+d+0.08);
}

function vSynthBass(e,t,f,d){        // fat sub bass with a little grit
  const c=e.ctx; const env=c.createGain(); env.gain.value=0; env.connect(e.lead.g);
  const lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.setValueAtTime(1400,t);
  lp.frequency.exponentialRampToValueAtTime(400,t+0.25); lp.connect(env);
  const sub=c.createOscillator(); sub.type="sine"; sub.frequency.value=f/2;
  const sg=c.createGain(); sg.gain.value=0.5; sub.connect(sg); sg.connect(env);
  const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=f;
  const g=c.createGain(); g.gain.value=0.5; o.connect(g); g.connect(lp);
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.85,t+0.01);
  env.gain.setValueAtTime(0.7,t+d); env.gain.linearRampToValueAtTime(0,t+d+0.1);
  [sub,o].forEach(x=>{x.start(t);x.stop(t+d+0.15);});
}

function vCelesta(e,t,f,d){          // glassy bell-piano (bright, medium decay)
  const c=e.ctx; const o1=c.createOscillator(); o1.type="sine"; o1.frequency.value=f;
  const o2=c.createOscillator(); o2.type="triangle"; o2.frequency.value=f*2;
  const g2=c.createGain(); g2.gain.value=0.4; o2.connect(g2);
  const env=c.createGain(); env.gain.value=0; o1.connect(env); g2.connect(env); env.connect(e.lead.g);
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.7,t+0.005);
  env.gain.exponentialRampToValueAtTime(0.001,t+Math.max(d,0.3)+0.5);
  [o1,o2].forEach(o=>{o.start(t);o.stop(t+Math.max(d,0.3)+0.6);});
}

function vOoh(e,t,f,d){              // "ooh" vocal pad — darker formants than choir
  const c=e.ctx; const env=c.createGain(); env.gain.value=0; env.connect(e.lead.g);
  [[400,1],[800,0.4],[2600,0.15]].forEach(fm=>{
    const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=f; o.detune.value=(Math.random()*6-3);
    const bp=c.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=fm[0]; bp.Q.value=9;
    const g=c.createGain(); g.gain.value=fm[1]*0.5; o.connect(bp); bp.connect(g); g.connect(env);
    o.start(t); o.stop(t+d+0.5);
  });
  env.gain.setValueAtTime(0,t); env.gain.linearRampToValueAtTime(0.65,t+0.2);
  env.gain.setValueAtTime(0.65,t+d); env.gain.linearRampToValueAtTime(0,t+d+0.5);
}

function vBanjo(e,t,f,d){            // bright, twangy, fast pluck (Karplus, low damping)
  pluck(e,t,f,d,0.986,5200,0.8);
}

function vSitar(e,t,f,d){            // buzzy sustained pluck with shimmer
  const c=e.ctx; pluck(e,t,f,d,0.9965,4000,0.6);
  const o=c.createOscillator(); o.type="triangle"; o.frequency.value=f*2.01;
  const g=c.createGain(); g.gain.value=0; o.connect(g); g.connect(e.lead.g);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.08,t+0.05);
  g.gain.exponentialRampToValueAtTime(0.001,t+Math.max(d,0.4)+0.4);
  o.start(t); o.stop(t+Math.max(d,0.4)+0.5);
}

const LEADS = {
  piano: vPiano, epiano: vEPiano, organ: vOrgan, guitar: vGuitar,
  harp: vHarp, marimba: vMarimba, bell: vBell, brass: vBrass,
  strings: vStrings, sawlead: vSawLead, square: vLeadSquare, fm: vLeadFM,
  choir: vChoir, ooh: vOoh, musicbox: vMusicBox, celesta: vCelesta,
  steeldrum: vSteelDrum, pizz: vPizz, accordion: vAccordion,
  synthbass: vSynthBass, banjo: vBanjo, sitar: vSitar
};

function vPad(e, t, midis, d){
  const c = e.ctx;
  midis.forEach(m => {
    const f = mFreq(m);
    [-11, 0, 11].forEach(det => {
      const o = c.createOscillator(); o.type = "sawtooth";
      o.frequency.value = f; o.detune.value = det;
      const env = c.createGain(); env.gain.value = 0;
      o.connect(env); env.connect(e.pad.g);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.33, t + 0.9);
      env.gain.setValueAtTime(0.33, t + d);
      env.gain.linearRampToValueAtTime(0, t + d + 1.2);
      o.start(t); o.stop(t + d + 1.3);
    });
  });
}

function vBass(e, t, f, d){
  const c = e.ctx;
  const o = c.createOscillator(); o.type = "triangle"; o.frequency.value = f;
  const lp = c.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(520, t);
  lp.frequency.exponentialRampToValueAtTime(180, t + Math.min(0.4, d));
  const env = c.createGain(); env.gain.value = 0;
  o.connect(lp); lp.connect(env); env.connect(e.bass.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(1, t + 0.02);
  env.gain.setValueAtTime(0.85, t + d * 0.8);
  env.gain.linearRampToValueAtTime(0, t + d);
  o.start(t); o.stop(t + d + 0.05);
}

function vArp(e, t, f, d){
  const c = e.ctx;
  const o = c.createOscillator(); o.type = "square"; o.frequency.value = f;
  const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2200;
  const env = c.createGain(); env.gain.value = 0;
  o.connect(lp); lp.connect(env); env.connect(e.pad.g);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(0.5, t + 0.008);
  env.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.start(t); o.stop(t + d + 0.02);
}

function vKick(e, t){
  const c = e.ctx;
  const o = c.createOscillator(); o.type = "sine";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  const env = c.createGain();
  env.gain.setValueAtTime(1, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  o.connect(env); env.connect(e.drum.g);
  o.start(t); o.stop(t + 0.4);
}

function vSnare(e, t){
  const c = e.ctx;
  const src = c.createBufferSource(); src.buffer = e.bufs.noise;
  const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 0.9;
  const env = c.createGain();
  env.gain.setValueAtTime(0.5, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  src.connect(bp); bp.connect(env); env.connect(e.drum.g);
  src.start(t); src.stop(t + 0.2);
}

function vHat(e, t){
  const c = e.ctx;
  const src = c.createBufferSource(); src.buffer = e.bufs.noise;
  const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 8000;
  const env = c.createGain();
  env.gain.setValueAtTime(0.12, t);
  env.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  src.connect(hp); hp.connect(env); env.connect(e.drum.g);
  src.start(t); src.stop(t + 0.06);
}

function fold(m, lo, hi){
  while (m < lo) m += 12;
  while (m > hi) m -= 12;
  return m;
}

function ksBuffer(ctx, f, dur, damp){
  const rate = ctx.sampleRate;
  const N = Math.max(2, Math.round(rate / f));
  const len = Math.floor(rate * dur);
  const out = new Float32Array(len);
  const dl = new Float32Array(N);
  for (let i = 0; i < N; i++) dl[i] = Math.random() * 2 - 1;
  let j = 0;
  for (let i = 0; i < len; i++){
    const cur = dl[j], nxt = dl[(j + 1) % N];
    out[i] = cur;
    dl[j] = damp * 0.5 * (cur + nxt);
    j = (j + 1) % N;
  }
  const buf = ctx.createBuffer(1, len, rate);
  buf.getChannelData(0).set(out);
  return buf;
}

function compose(tr){
  const rng = mulberry32(tr.seed);
  const rng2 = mulberry32((tr.seed ^ 0x5f356495) >>> 0); // separate stream: opening/pickup only
  const riff = tr.drums === "drive" || tr.drums === "double"; // action tracks get a battle intro
  const scale = MODES[tr.mode];
  const ext = buildExtScale(tr.root, scale);
  const totalBars = 2 + tr.bars;

  const degs = [];
  for (let b = 0; b < totalBars; b++)
    degs.push(b < 2 ? tr.prog[0] : tr.prog[(b - 2) % tr.prog.length]);
  if (riff) degs[1] = tr.prog[tr.prog.length - 1]; // pickup bar leans on the dominant

  const padChords = degs.map(d =>
    chordDegrees(d).map(cd => fold(tr.root + scale[cd], 50, 66)));
  const bassRoots = degs.map(d => fold(tr.root + scale[d], 36, 47));

  const pats = tr.dens === "high" ? PATTERN_HIGH : tr.dens === "low" ? PATTERN_LOW : PATTERN_MED;
  const restP = tr.dens === "low" ? 0.16 : 0.1;
  const center = ext.reduce((best, m, i) =>
    Math.abs(m - (tr.root + 12)) < Math.abs(ext[best] - (tr.root + 12)) ? i : best, 0);
  let pos = Math.max(2, Math.min(ext.length - 3,
    center + Math.floor(rng2() * 9) - 4)); // seeded opening register
  let firstIdx = -1;
  const melody = [];
  for (let bar = 2; bar < totalBars; bar++){
    const last = bar === totalBars - 1;
    const cd = chordDegrees(degs[bar]);
    const pat = last ? [2,2] : pats[Math.floor(rng() * pats.length)];
    pat.forEach((dur, i) => {
      if (!last && i > 0 && rng() < restP){ melody.push({m:null, d:dur}); return; }
      if (i === 0 || rng() < 0.35 || last){
        const want = last && i === pat.length - 1 ? [0] : cd;
        let bestI = pos, bestD = 99;
        for (let off = -7; off <= 7; off++){
          const j = pos + off;
          if (j < 2 || j >= ext.length - 2) continue;
          if (want.indexOf(j % 7) === -1) continue;
          const dd = Math.abs(off) + (last ? Math.abs(ext[j] - (tr.root + 12)) * 0.1 : 0);
          if (dd < bestD){ bestD = dd; bestI = j; }
        }
        pos = bestI;
      } else {
        const steps = [-2,-1,-1,1,1,2];
        pos += steps[Math.floor(rng() * steps.length)];
        pos = Math.max(center - 9, Math.min(center + 9, pos));
      }
      if (firstIdx < 0) firstIdx = pos;
      melody.push({m: ext[pos], d: dur});
    });
  }
  const fi = Math.max(3, firstIdx);
  const pickup = [ext[fi - 3], ext[fi - 2], ext[fi - 1], ext[fi]]; // ascending run into the melody
  return { degs, padChords, bassRoots, melody, totalBars, scale, riff, pickup };
}

function trackDuration(tr){
  if (tr.stinger)
    return tr.notes.reduce((m, n) => Math.max(m, n[1] + n[2]), 0) + 1.6;
  return (2 + tr.bars) * 4 * (60 / tr.bpm);
}

function scheduleTrack(env, tr, t0){
  if (tr.stinger){
    const fn = LEADS[tr.voice] || vBell;
    tr.notes.forEach(n => fn(env, t0 + n[1], mFreq(tr.root + n[0]), n[2]));
    return t0 + trackDuration(tr);
  }
  const comp = compose(tr);
  const spb = 60 / tr.bpm, barLen = 4 * spb;
  const leadFn = LEADS[tr.lead] || vLeadFM;

  comp.padChords.forEach((chord, i) => {
    if (comp.riff && i < 2) return; // battle intro: pad sits out, band hits at bar 2
    vPad(env, t0 + i * barLen, chord, barLen * 0.95);
  });

  comp.bassRoots.forEach((r, i) => {
    const t = t0 + i * barLen, root = mFreq(r), fifth = mFreq(r + 7);
    if (comp.riff && i === 0) return; // silence under the opening drum fill
    if (comp.riff && i === 1){       // pickup bar: driving octaves on the dominant
      for (let ei = 0; ei < 8; ei++)
        vBass(env, t + ei * 0.5 * spb, ei % 2 ? mFreq(r + 12) : root, spb * 0.42);
      return;
    }
    if (tr.bass === "whole"){
      vBass(env, t, root, barLen * 0.92);
    } else if (tr.bass === "walk"){
      vBass(env, t, root, spb * 1.8);
      vBass(env, t + 2 * spb, fifth, spb * 0.9);
      vBass(env, t + 3 * spb, root, spb * 0.9);
    } else if (tr.bass === "oct"){
      for (let ei = 0; ei < 8; ei++)
        vBass(env, t + ei * 0.5 * spb, ei % 2 ? mFreq(r + 12) : root, spb * 0.42);
    } else { // pulse
      vBass(env, t, root, spb * 1.3);
      vBass(env, t + 1.5 * spb, root, spb * 0.4);
      vBass(env, t + 2 * spb, fifth, spb * 0.9);
      vBass(env, t + 3 * spb, root, spb * 0.9);
    }
  });

  if (comp.riff){
    const tA = t0;                 // bar 0: drum fill announces the fight
    vKick(env, tA); vKick(env, tA + 2 * spb);
    [1, 2.5, 3, 3.5].forEach(b => vSnare(env, tA + b * spb));
    for (let ei = 0; ei < 8; ei++) vHat(env, tA + ei * 0.5 * spb);
    const tB = t0 + barLen;        // bar 1: four-on-the-floor + snare roll + lead run
    for (let b = 0; b < 4; b++) vKick(env, tB + b * spb);
    [3, 3.25, 3.5, 3.75].forEach(b => vSnare(env, tB + b * spb));
    for (let ei = 0; ei < 8; ei++) vHat(env, tB + ei * 0.5 * spb);
    comp.pickup.forEach((mn, k) =>
      leadFn(env, tB + (2 + k * 0.5) * spb, mFreq(mn), 0.4 * spb));
  }

  for (let bar = 2; bar < comp.totalBars; bar++){
    const t = t0 + bar * barLen;
    if (tr.drums === "drive"){
      vKick(env, t); vKick(env, t + 2 * spb);
      vSnare(env, t + spb); vSnare(env, t + 3 * spb);
      for (let ei = 0; ei < 8; ei++) vHat(env, t + ei * 0.5 * spb);
    } else if (tr.drums === "double"){
      for (let b = 0; b < 4; b++) vKick(env, t + b * spb);
      vSnare(env, t + spb); vSnare(env, t + 3 * spb);
      vSnare(env, t + 3.5 * spb);
      for (let ei = 0; ei < 8; ei++) vHat(env, t + ei * 0.5 * spb);
    } else if (tr.drums === "light"){
      vKick(env, t); vSnare(env, t + 2 * spb);
      [0.5, 1.5, 2.5, 3.5].forEach(b => vHat(env, t + b * spb));
    } else if (tr.drums === "sparse"){
      vKick(env, t);
      [1, 2, 3].forEach(b => vHat(env, t + b * spb));
    }
    if (tr.arp){
      const tones = chordDegrees(comp.degs[bar])
        .map(cd => fold(tr.root + comp.scale[cd], 62, 78));
      for (let ei = 0; ei < 8; ei++)
        vArp(env, t + ei * 0.5 * spb, mFreq(tones[ei % 3]), 0.5 * spb * 0.85);
    }
  }

  let cursor = t0 + 2 * barLen;
  comp.melody.forEach(ev => {
    if (ev.m !== null) leadFn(env, cursor, mFreq(ev.m), ev.d * spb * 0.92);
    cursor += ev.d * spb;
  });

  return t0 + comp.totalBars * barLen;
}

function encodeWav(buf){
  const nCh = buf.numberOfChannels, len = buf.length, rate = buf.sampleRate;
  const bytes = 44 + len * nCh * 2;
  const ab = new ArrayBuffer(bytes), v = new DataView(ab);
  function wstr(o, s){ for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
  wstr(0, "RIFF"); v.setUint32(4, bytes - 8, true); wstr(8, "WAVE");
  wstr(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, nCh, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * nCh * 2, true); v.setUint16(32, nCh * 2, true);
  v.setUint16(34, 16, true); wstr(36, "data"); v.setUint32(40, len * nCh * 2, true);
  const chans = [];
  for (let c = 0; c < nCh; c++) chans.push(buf.getChannelData(c));
  let off = 44;
  for (let i = 0; i < len; i++)
    for (let c = 0; c < nCh; c++){
      const s = Math.max(-1, Math.min(1, chans[c][i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  return new Blob([ab], { type: "audio/wav" });
}

/* ---------- public API ---------- */
(function(){
  var actx = null, env = null, timers = [], playing = false;

  function ctx(){
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    return actx;
  }

  function play(recipe, opts){
    opts = opts || {};
    stop();
    var c = ctx();
    if (c.state === "suspended") c.resume();
    env = buildEnv(c, makeBuffers(c));
    playing = true;
    var dur = trackDuration(recipe);
    var start = c.currentTime + 0.08;
    scheduleTrack(env, recipe, start);
    if (opts.loop !== false){
      var cycle = 1;
      var pump = function(){
        if (!playing) return;
        var next = start + cycle * dur;
        if (next - c.currentTime < 1.6){ scheduleTrack(env, recipe, next); cycle++; }
        timers.push(setTimeout(pump, 200));
      };
      pump();
    } else {
      timers.push(setTimeout(function(){ stop(); }, dur * 1000 + 400));
    }
    return dur;
  }

  function stop(){
    playing = false;
    timers.forEach(clearTimeout); timers = [];
    if (env){
      try { env.out.gain.setTargetAtTime(0, actx.currentTime, 0.05); } catch(e){}
      env = null;
    }
  }

  function duration(recipe){ return trackDuration(recipe); }

  /* Render offline to a WAV Blob.
     opts.passes  - how many times to repeat the loop (default 1)
     opts.peak    - target peak, 0..1 (default 0.89). Dense recipes can sum past
                    full scale; without this the encoder hard-clamps and the file
                    audibly distorts. Scaling is uniform, so the mix balance is kept.
                    Pass null to skip and get the raw (possibly clipping) render. */
  async function renderWav(recipe, opts){
    opts = opts || {};
    var passes = opts.passes || 1;
    var ceil = (opts.peak === null) ? null : (opts.peak || 0.89);
    var one = trackDuration(recipe);
    var total = one * passes + 2.2;
    var octx = new OfflineAudioContext(2, Math.ceil(total * 44100), 44100);
    var e = buildEnv(octx, makeBuffers(octx));
    for (var i = 0; i < passes; i++) scheduleTrack(e, recipe, 0.05 + i * one);
    var rendered = await octx.startRendering();
    if (ceil !== null){
      var truePeak = 0, ci, k, d;
      for (ci = 0; ci < rendered.numberOfChannels; ci++){
        d = rendered.getChannelData(ci);
        for (k = 0; k < d.length; k++){ var a = d[k] < 0 ? -d[k] : d[k]; if (a > truePeak) truePeak = a; }
      }
      if (truePeak > 0.0001 && truePeak > ceil){
        var g = ceil / truePeak;
        for (ci = 0; ci < rendered.numberOfChannels; ci++){
          d = rendered.getChannelData(ci);
          for (k = 0; k < d.length; k++) d[k] *= g;
        }
      }
    }
    return encodeWav(rendered);
  }

  function voices(){ var o = {}; for (var k in VOICE_LABEL) o[k] = VOICE_LABEL[k]; return o; }
  function isPlaying(){ return playing; }

  window.ForgeEngine = {
    play: play, stop: stop, duration: duration,
    renderWav: renderWav, voices: voices, isPlaying: isPlaying,
    MODES: MODES
  };
})();

})();
