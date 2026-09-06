// Build a scouter-pack/1 pack.json from two CSVs, validated by the SAME validator the app ships.
// Usage: node pack-build.mjs <packdir> --name "My Pack" [--author X] [--version 1]
// <packdir>/families.csv : id,name,color
// <packdir>/species.csv  : id,name,family,stage,evolvesTo,evolveLevel,sprite,legendary
//                          evolvesTo = ids separated by ';' (blank for none); legendary = true/false; sprite = filename in packdir
// Writes <packdir>/pack.json and reports sprites referenced but missing from the folder.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const [dir, ...rest] = process.argv.slice(2);
if (!dir) { console.error('usage: node pack-build.mjs <packdir> --name "Pack name" [--author A] [--version V]'); process.exit(2); }
const opt = {}; for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];

const html = readFileSync(new URL('./scouter-world-v39.html', import.meta.url), 'utf8');
const CORE = html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//)[1];
const ctx = { Math, console }; vm.createContext(ctx);
vm.runInContext(CORE + '\nglobalThis.validatePack = validatePack;', ctx);

function csv(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(l => l.trim());
  const head = lines[0].split(',').map(s => s.trim());
  return lines.slice(1).map(l => { const cells = l.split(',').map(s => s.trim()); const o = {}; head.forEach((h, i) => o[h] = cells[i] ?? ''); return o; });
}
const families = csv(join(dir, 'families.csv')).map(f => ({ id: f.id, name: f.name, color: f.color }));
const species = csv(join(dir, 'species.csv')).map(s => ({
  id: s.id, name: s.name, family: s.family, stage: Number(s.stage),
  evolvesTo: s.evolvesTo ? s.evolvesTo.split(';').map(x => x.trim()).filter(Boolean) : [],
  evolveLevel: s.evolveLevel ? Number(s.evolveLevel) : null,
  sprite: s.sprite || null, legendary: /^true$/i.test(s.legendary),
}));
const pack = { format: 'scouter-pack/1', name: opt.name || 'Untitled pack', author: opt.author || '', version: opt.version || '1', families, species };

const v = ctx.validatePack(pack);
if (!v.ok) { console.error('Pack invalid:\n - ' + v.errors.join('\n - ')); process.exit(1); }
const present = new Set(readdirSync(dir));
const missing = species.filter(s => s.sprite && !present.has(s.sprite)).map(s => s.id + ' → ' + s.sprite);
writeFileSync(join(dir, 'pack.json'), JSON.stringify(pack, null, 1));
console.log(`wrote ${join(dir, 'pack.json')}: ${families.length} families, ${species.length} species` + (missing.length ? `\n${missing.length} sprite(s) referenced but not in folder:\n - ` + missing.join('\n - ') : ''));
