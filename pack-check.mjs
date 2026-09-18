// Check a pack before handing it to anyone: the same validator the game uses, plus the things a validator
// cannot see, such as sprites that are referenced but missing, or a family nothing can be caught in.
// Usage: node pack-check.mjs <packdir-or-pack.json>
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import vm from 'node:vm';

const arg = process.argv[2];
if (!arg) { console.error('usage: node pack-check.mjs <packdir or pack.json>'); process.exit(2); }
const jsonPath = statSync(arg).isDirectory() ? join(arg, 'pack.json') : arg;
const dir = dirname(jsonPath);
const pack = JSON.parse(readFileSync(jsonPath, 'utf8'));

const here = new URL('./', import.meta.url);
const builds = readdirSync(here).filter(f => /^(index|scouter-world-v\d+)\.html$/.test(f))
  .sort((a, b) => (+(b.match(/\d+/) || [0])[0]) - (+(a.match(/\d+/) || [0])[0]));
if (!builds.length) { console.error('no build beside this script to check against'); process.exit(2); }
const html = readFileSync(new URL('./' + builds[0], import.meta.url), 'utf8');
const core = html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//)[1];
const ctx = { Math, console }; vm.createContext(ctx);
vm.runInContext(core + '\nglobalThis.A = { validatePack, setPack, compilePack: (typeof compilePack === "function" ? compilePack : null) };', ctx);

const fail = [], warn = [];
{ const v = ctx.A.validatePack(pack) || {}; (v.errors || []).forEach(e => fail.push(String(e))); }

// sprites: referenced but absent, or present but never used
const files = new Set(readdirSync(dir).filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f)));
const used = new Set();
(pack.species || []).forEach(sp => {
  ['sprite', 'icon', 'shinySprite', 'backSprite'].forEach(k => { if (sp[k]) { used.add(sp[k]);
    if (!files.has(sp[k])) fail.push('sprite missing: ' + sp[k] + ' (' + (sp.name || sp.id) + ')'); } });
  if (!sp.sprite) warn.push('no sprite named for ' + (sp.name || sp.id));
});
[...files].filter(f => !used.has(f) && f !== 'egg.png').forEach(f => warn.push('sprite in the folder that nothing uses: ' + f));

// evolutions that point nowhere, and families nothing lives in
const ids = new Set((pack.species || []).map(s => s.id));
(pack.species || []).forEach(sp => (sp.evolvesTo ? [].concat(sp.evolvesTo) : []).forEach(to => {
  if (to && !ids.has(to)) fail.push((sp.name || sp.id) + ' evolves into "' + to + '", which is not in this pack');
  if (to && !sp.evolveLevel) warn.push((sp.name || sp.id) + ' evolves but names no level');
}));
const byFamily = {};
(pack.species || []).forEach(sp => { (byFamily[sp.family] = byFamily[sp.family] || []).push(sp); });
(pack.families || []).forEach(f => {
  const mem = byFamily[f.id] || [];
  if (!mem.length) fail.push('family "' + f.id + '" has no creatures');
  else if (!mem.some(s => (s.stage | 0) <= 1)) fail.push('family "' + f.id + '" has no first stage, so nothing can be caught in it');
});
Object.keys(byFamily).filter(k => !(pack.families || []).some(f => f.id === k))
  .forEach(k => fail.push('creatures name family "' + k + '", which is not declared'));

// names people will actually read
const seen = new Map();
(pack.species || []).forEach(sp => { const k = (sp.name || '').toLowerCase();
  if (seen.has(k)) warn.push('two creatures share the name "' + sp.name + '"'); else seen.set(k, sp.id);
  if ((sp.name || '').length > 18) warn.push('"' + sp.name + '" is long and will be cut off on a phone'); });

console.log(basename(dir) + ': ' + (pack.species || []).length + ' creatures, ' + (pack.families || []).length + ' families, ' + files.size + ' images');
if (fail.length) { console.log('\nWill not load:'); fail.forEach(x => console.log('  ✗ ' + x)); }
if (warn.length) { console.log('\nWorth fixing:'); warn.slice(0, 20).forEach(x => console.log('  · ' + x));
  if (warn.length > 20) console.log('  · and ' + (warn.length - 20) + ' more'); }
if (!fail.length && !warn.length) console.log('\nNothing to report. This pack is ready.');
else if (!fail.length) console.log('\nThis pack will load.');
process.exit(fail.length ? 1 : 0);
