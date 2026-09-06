// Build a full-mode scouter-pack/1 from the PokéAPI CSV dump (github.com/PokeAPI/pokeapi → data/v2/csv/).
// Usage: node pokeapi-to-pack.mjs <csvdir> <outdir> [--gen 1] [--vg 20] [--nonlevel-evo 36] [--name "…"]
//   --gen N            include species from generations 1..N (default: all)
//   --vg ID            version_group_id for level-up learnsets (default: per species, the newest group that has data)
//   --nonlevel-evo N   give item/trade/friendship evolutions a level so the engine can evolve them (default: leave null = never evolves in-engine)
// Sprites are NOT produced. Each species gets sprite "<national id>.png"; drop your own files into <outdir>.
// The app ships none of this data; this converter is for building a personal pack from official data.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const [csvdir, outdir, ...rest] = process.argv.slice(2);
if (!csvdir || !outdir) { console.error('usage: node pokeapi-to-pack.mjs <csvdir> <outdir> [--gen N] [--vg ID] [--nonlevel-evo N] [--name "…"]'); process.exit(2); }
const opt = {}; for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, '')] = rest[i + 1];
const maxGen = opt.gen ? Number(opt.gen) : 99, fixedVg = opt.vg ? Number(opt.vg) : null, nonLevelEvo = opt['nonlevel-evo'] ? Number(opt['nonlevel-evo']) : null;

function csv(name) {
  const text = readFileSync(join(csvdir, name + '.csv'), 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.length);
  const head = lines[0].split(',');
  return lines.slice(1).map(l => { const cells = []; let cur = '', q = false; for (const ch of l) { if (ch === '"') q = !q; else if (ch === ',' && !q) { cells.push(cur); cur = ''; } else cur += ch; } cells.push(cur); const o = {}; head.forEach((h, i) => o[h] = cells[i] ?? ''); return o; });
}
const N = x => (x === '' || x == null) ? null : Number(x);

// ---- types & chart ----
const TYPE_COLORS = { normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#f7d02c', grass: '#7ac74c', ice: '#96d9d6', fighting: '#c22e28', poison: '#a33ea1', ground: '#e2bf65', flying: '#a98ff3', psychic: '#f95587', bug: '#a6b91a', rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746', steel: '#b7b7ce', fairy: '#d685ad' };
const types = csv('types').filter(t => Number(t.id) <= 18);
const typeName = new Map(csv('type_names').filter(r => r.local_language_id === '9').map(r => [r.type_id, r.name]));
const typeIdent = new Map(types.map(t => [t.id, t.identifier]));
const typeChart = {};
for (const e of csv('type_efficacy')) { const a = typeIdent.get(e.damage_type_id), d = typeIdent.get(e.target_type_id); if (!a || !d) continue; const f = Number(e.damage_factor) / 100; if (f !== 1) (typeChart[a] ||= {})[d] = f; }

// ---- moves ----
const moveName = new Map(csv('move_names').filter(r => r.local_language_id === '9').map(r => [r.move_id, r.name]));
const CLASS = { 1: 'status', 2: 'physical', 3: 'special' };
let fixedPower = 0;
const movesRaw = csv('moves').filter(m => Number(m.id) < 10000 && typeIdent.has(m.type_id));
const moves = movesRaw.map(m => {
  let category = CLASS[m.damage_class_id] || 'status', power = N(m.power);
  if (category !== 'status' && !(power > 0)) { power = 50; fixedPower++; }   // fixed-damage moves (Seismic Toss, Night Shade…) get a flat 50 for now
  return { id: m.identifier, name: moveName.get(m.id) || m.identifier, type: typeIdent.get(m.type_id), category, power: category === 'status' ? null : power, accuracy: N(m.accuracy) || null, pp: N(m.pp) || 1 };   // accuracy 0 or blank in the dump = never misses
});
const moveIdent = new Map(movesRaw.map(m => [m.id, m.identifier]));

// ---- species ----
const speciesRows = csv('pokemon_species').filter(s => Number(s.generation_id) <= maxGen);
const speciesById = new Map(speciesRows.map(s => [s.id, s]));
const enName = new Map(csv('pokemon_species_names').filter(r => r.local_language_id === '9').map(r => [r.pokemon_species_id, r.name]));
const defaultPokemon = new Map(csv('pokemon').filter(p => p.is_default === '1').map(p => [p.species_id, p.id]));
const statsByPokemon = new Map(); for (const r of csv('pokemon_stats')) (statsByPokemon.get(r.pokemon_id) || statsByPokemon.set(r.pokemon_id, {}).get(r.pokemon_id))[r.stat_id] = Number(r.base_stat);
const typesByPokemon = new Map(); for (const r of csv('pokemon_types')) (typesByPokemon.get(r.pokemon_id) || typesByPokemon.set(r.pokemon_id, []).get(r.pokemon_id)).push([Number(r.slot), typeIdent.get(r.type_id)]);
const levelUp = new Map(); // pokemon_id → vg → [{level, move}]
for (const r of csv('pokemon_moves')) { if (r.pokemon_move_method_id !== '1') continue; const byVg = levelUp.get(r.pokemon_id) || levelUp.set(r.pokemon_id, new Map()).get(r.pokemon_id); (byVg.get(r.version_group_id) || byVg.set(r.version_group_id, []).get(r.version_group_id)).push({ level: Math.max(1, Number(r.level)), move: moveIdent.get(r.move_id), order: Number(r.order) || 0 }); }
const evo = new Map(); for (const r of csv('pokemon_evolution')) { if (!evo.has(r.evolved_species_id)) evo.set(r.evolved_species_id, r); }
const children = new Map(); for (const s of speciesRows) if (s.evolves_from_species_id) (children.get(s.evolves_from_species_id) || children.set(s.evolves_from_species_id, []).get(s.evolves_from_species_id)).push(s.id);
const stageOf = id => { let d = 1, s = speciesById.get(id); while (s && s.evolves_from_species_id && speciesById.has(s.evolves_from_species_id)) { d++; s = speciesById.get(s.evolves_from_species_id); } return Math.min(3, d); };

const patched = [], noLearnset = [], species = [];
for (const s of speciesRows) {
  const pid = defaultPokemon.get(s.id); if (!pid) continue;
  const st = statsByPokemon.get(pid); const ty = (typesByPokemon.get(pid) || []).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  if (!st || !ty.length) continue;
  const byVg = levelUp.get(pid) || new Map();
  const vg = fixedVg != null ? String(fixedVg) : [...byVg.keys()].sort((a, b) => Number(b) - Number(a))[0];
  let ls = (byVg.get(vg) || []).filter(l => l.move).sort((a, b) => a.level - b.level || a.order - b.order);
  const seen = new Set(); ls = ls.filter(l => !seen.has(l.move) && seen.add(l.move)).map(l => ({ level: l.level, move: l.move }));
  if (!ls.length) { noLearnset.push(s.identifier); continue; }
  const damagingById = new Set(moves.filter(m => m.category !== 'status').map(m => m.id));
  if (!ls.some(l => l.level <= 5 && damagingById.has(l.move))) { ls.unshift({ level: 1, move: 'tackle' }); patched.push(s.identifier); }
  const kids = (children.get(s.id) || []);
  const kidEvo = kids.map(k => evo.get(k)).filter(Boolean);
  const levelTrig = kidEvo.find(e => e.evolution_trigger_id === '1' && e.minimum_level);
  const evolveLevel = kids.length ? (levelTrig ? Number(levelTrig.minimum_level) : nonLevelEvo) : null;
  species.push({ id: String(s.id).padStart(4, '0'), name: enName.get(s.id) || s.identifier, family: ty[0], stage: stageOf(s.id), evolvesTo: kids.map(k => String(k).padStart(4, '0')), evolveLevel, sprite: s.id + '.png',
    legendary: s.is_legendary === '1' || s.is_mythical === '1', types: ty, stats: { hp: st[1], atk: st[2], def: st[3], spa: st[4], spd: st[5], spe: st[6] }, learnset: ls });
}
// families = primary types actually used
const famUsed = new Set(species.map(s => s.family));
const pack = { format: 'scouter-pack/1', name: opt.name || ('Pokémon pack (gen ≤ ' + (maxGen === 99 ? 'all' : maxGen) + ')'), author: 'PokéAPI data; personal use', version: new Date().toISOString().slice(0, 10),
  battle: { mode: 'full' }, types: types.map(t => ({ id: t.identifier, name: typeName.get(t.id) || t.identifier })), typeChart, moves,
  families: types.map(t => t.identifier).filter(t => famUsed.has(t)).map(t => ({ id: t, name: typeName.get(types.find(x => x.identifier === t).id) || t, color: TYPE_COLORS[t] || '#888888' })), species };

// validate with the shipped engine
const html = readFileSync(new URL('./scouter-world-v39.html', import.meta.url), 'utf8');
const CORE = html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//)[1];
const ctx = { Math, console }; vm.createContext(ctx); vm.runInContext(CORE + '\nglobalThis.validatePack = validatePack;', ctx);
const v = ctx.validatePack(pack);
if (!v.ok) { console.error('Pack invalid (' + v.errors.length + '):\n - ' + v.errors.slice(0, 30).join('\n - ')); process.exit(1); }
mkdirSync(outdir, { recursive: true });
writeFileSync(join(outdir, 'pack.json'), JSON.stringify(pack));
console.log(`wrote ${join(outdir, 'pack.json')}: ${pack.families.length} families, ${pack.types.length} types, ${moves.length} moves, ${species.length} species (${species.filter(s => s.legendary).length} legendary/mythical)`);
console.log(`fixed-damage moves given power 50: ${fixedPower}`);
console.log(`species given Tackle at Lv1 because no damaging move by Lv5: ${patched.length}${patched.length ? ' (' + patched.slice(0, 12).join(', ') + (patched.length > 12 ? ', …' : '') + ')' : ''}`);
console.log(`non-level evolutions ${nonLevelEvo == null ? 'left at null (never evolve in-engine; pass --nonlevel-evo N)' : 'set to Lv ' + nonLevelEvo}: ${species.filter(s => s.evolvesTo.length && s.evolveLevel === nonLevelEvo && nonLevelEvo != null).length || species.filter(s => s.evolvesTo.length && s.evolveLevel == null).length}`);
if (noLearnset.length) console.log(`skipped (no level-up learnset): ${noLearnset.join(', ')}`);
console.log(`sprites expected in ${outdir}: <id>.png (e.g. 1.png … ${species[species.length - 1].id.replace(/^0+/, '')}.png)`);
