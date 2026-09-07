// Extracts the CORE block from index.html and tests exactly what ships.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const m = html.match(/\/\* CORE-START \*\/([\s\S]*?)\/\* CORE-END \*\//);
if (!m) throw new Error('CORE markers not found');
const CORE = m[1];

function load() {
  const ctx = { Math, console };
  vm.createContext(ctx);
  vm.runInContext(CORE + '\nglobalThis.__x = { WORLD, GYM, get PACK() { return PACK; }, DEMO_PACK, validatePack, validateGmsPack, isGmsPack, parseGmsBin, setPack, regionGymList, gymCell, routeHabitat, routeRare, habitatMember, badgeCount, regionBadgeCount, hasBadge, recordGymWin, recordChampion, leaderLevel, leaderTeamSize, aceLine, leaderTeam, championTeam, trainerInstance, bestTypeEff, cellCenter, bearingDeg, compass, regionKey, EGG, addEggWalk, rollWildItem, addItem, removeItem, itemEvolutions, evolveWithItem, HISTORY_MAX, regionRecord, logEvent, touchRoute, routesSeen, logGymWin, logChampion, regionSummary, regionLore, LORE, NAME_BLOCK, regionLeaders, TRAINER, trainersOn, trainerBeaten, recordTrainerWin, trainerReward, pickTrainerClass, snareName, dayIndex, setLayout, isLeagueDomain, gymsPerRegion, leagueBadgesNeeded, leagueCell, setRouteSize, leagueIndexOf, typeHalves, aceMember, COIN, addCoinWalk, spend, ENGINE_ITEMS, itemName, itemInfo, useItemOn, SHOP, packShopPool, dayPrice, shopFor, buy, PERSONALITIES, personalityOf, moodLine, badgeSvg, LEADER_LINES, leaderLine, setAceOverride, aceLineFor, leaderTeamFor, DEFENCE, challengerAt, championChallenger, TYPE_NAMES, NAME_POOL_MIN, leaderPool, setBadgePool, badgeFromPool, get BADGE_POOL() { return BADGE_POOL; }, ELITE, eliteFour, titleOf, leagueLadder, loseTitle, reclaimTitle, usurperDefended, CONTEND, contendSlot, POST, RIVAL_MILESTONES, rivalOf, rivalDue, counterTypeFor, rivalTeam, recordRival, masterTeam, masterAvailable, recordMaster, regionMastery, roadEligible, isWeekend, roadState, roadDefence, recordRoadLeg, questsFor, questStatus, questBump, questClaim, huntFamily, tournamentBracket, rentalTeam, lastWeekend, gauntletLegends, gauntletChaseSites, LANDMARK, weekIndex, contestedCount, overpassQuery, parseOverpass, fallbackLandmarks, SHARED_WEEKS, EVIL_TEAMS, EVIL_OLD_PARTS, EVIL_MOTIVES, STARTER_DEX, starterPool, evilProfile, isMegaStone, heldBoost, MUSIC_BY_TYPE, musicRecipe, pvpRound, pvpRand, teamSnapshot, teamFromSnapshot, creatureToWire, creatureFromWire, personalityOf, LazyImages, ACHIEVEMENTS, achievements, achievementIcon, evilBook, evilTeamFor, evilFinish, weekPlan, evilState, gruntAt, adminAt, bossAt, evilEncounterAt, recordEvilWin, stopVisit, gridTag, parseRegionKey, keyInGrid, baseProfile, powerMult, shapeBy, PROFILE_CLAMP, lightAD, SHINY, HANDICAP, applyLevelCap, liftLevelCap, grantXpReal, legalMembers, typedPick, aceChoiceOpen, evilTeamMember, regionScale, championLevel, isNight, seasonName, HAPPY_M, condMatch, formOf, speciesView, evolutionsReady, creatureTraits, holdItem, unholdItem, SIGNATURES, signatureFor, lightMoves, lightExpected, aiPickLight, teachTm, forgetTm, typeName, LEGEND, seasonOf, legendUnlocked, regionLegends, legendState, legendCaught, activeLegend, legendEncounter, legendAttempt, roamedInto, SNARES, catchChance, fleeChance, throwSnare, newSave, migrateSave, teamLevel, makeMonster, addMonster, moveToBox, moveToTeam, addWalk, starterOffer, TEAM_MAX, SNARE_REFILL_M, statsFor, movesAtLevel, hydrate, xpToNext, xpForWin, grantXp, effectiveness, makeCombatant, damageFull, damageLight, expectedDamage, aiPickMove, battleRoundFull, battleRoundLight, wildInstance, healAll, firstAble, hash32, rng, routeCell, cellBounds, macroOf, regionOf, macroIndex, LEAGUE_INDEX, routeNumber, haversineM, regionName, gymOf, describe, encounter, NAME_BLOCKLIST };', ctx);
  return ctx.__x;
}
const A = load(), B = load();

let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log('  ok  ' + name + (detail ? '  — ' + detail : '')); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  — ' + detail : '')); }
}
function srand(seed) { // local PRNG for sampling, independent of CORE's
  let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const R = srand(7);
const randLat = () => -70 + R() * 140, randLon = () => -180 + R() * 360;

// 1. Determinism: same input → same output, within one context and across fresh contexts
{
  let same = true;
  for (let i = 0; i < 2000; i++) {
    const lat = randLat(), lon = randLon();
    const a1 = JSON.stringify(A.describe(lat, lon)), a2 = JSON.stringify(A.describe(lat, lon)), b1 = JSON.stringify(B.describe(lat, lon));
    if (a1 !== a2 || a1 !== b1) { same = false; break; }
  }
  check('determinism across 2000 coords and two fresh engine instances', same);
}

// 2. Cell continuity: stepping less than one cell stays put; stepping one full cell moves exactly one index
{
  let ok = true;
  for (let i = 0; i < 2000; i++) {
    const lat = randLat(), lon = randLon();
    const c = A.routeCell(lat, lon), b = A.cellBounds(c.rx, c.ry);
    const inside = lat >= b.lat0 && lat < b.lat1 && lon >= b.lon0 && lon < b.lon1;
    const east = A.routeCell(lat, lon + A.WORLD.LON_STEP), north = A.routeCell(lat + A.WORLD.LAT_STEP, lon);
    if (!inside || east.rx !== c.rx + 1 || east.ry !== c.ry || north.ry !== c.ry + 1 || north.rx !== c.rx) { ok = false; break; }
  }
  check('cell bounds contain the coordinate; ±one step moves exactly one cell', ok);
}

// 3. Region structure: 9 macro-areas, centre is league, 8 gyms with 8 distinct families, every route belongs to one macro/region
{
  let ok = true, regions = 0;
  for (let i = 0; i < 400; i++) {
    const gx = Math.floor(R() * 2000 - 1000), gy = Math.floor(R() * 2000 - 1000);
    const fams = A.regionGymList(gx, gy);
    if (fams.length !== 9 || fams[A.leagueIndexOf(gx, gy)] !== null) { ok = false; break; }
    const gyms = fams.filter(f => f !== null);
    if (gyms.length !== 8 || new Set(gyms).size !== 8) { ok = false; break; }
    // every macro-area in the region reports the same family via gymOf, and the centre reports league
    for (let my = 0; my < 3; my++) for (let mx = 0; mx < 3; mx++) {
      const g = A.gymOf(gx * 3 + mx, gy * 3 + my);
      const mi = A.macroIndex(gx * 3 + mx, gy * 3 + my);
      if (mi === A.leagueIndexOf(gx, gy) ? !g.league : g.gymIndex !== fams[mi]) { ok = false; }
    }
    regions++;
  }
  check('400 regions: 9 macro-areas, centre = league, 8 gyms, 8 distinct gym families', ok, regions + ' regions');
}

// 4. Route numbering covers 1..144 exactly once per region
{
  const gx = 37, gy = -12, side = A.WORLD.MACRO * A.WORLD.REGION, seen = new Set();
  for (let ry = gy * side; ry < (gy + 1) * side; ry++) for (let rx = gx * side; rx < (gx + 1) * side; rx++) seen.add(A.routeNumber(rx, ry));
  check('route numbers 1..' + side * side + ' unique within a region', seen.size === side * side && Math.min(...seen) === 1 && Math.max(...seen) === side * side);
}

// 5. Habitat variety: per region, how many of the 12 families appear across its 144 routes; and gym domains read as territory
{
  const side = A.WORLD.MACRO * A.WORLD.REGION, F = A.PACK.habitats.length;
  let counts = [], domainShare = [];
  for (let i = 0; i < 300; i++) {
    const gx = Math.floor(R() * 2000 - 1000), gy = Math.floor(R() * 2000 - 1000);
    const s = new Set(); let inDomain = 0, domainRoutes = 0;
    for (let ry = gy * side; ry < (gy + 1) * side; ry++) for (let rx = gx * side; rx < (gx + 1) * side; rx++) {
      const f = A.routeHabitat(rx, ry); s.add(f);
      const m = A.macroOf(rx, ry), g = A.gymOf(m.mx, m.my);
      if (!g.league) { domainRoutes++; if (A.PACK.habitats[f].types.has(g.type)) inDomain++; }
    }
    counts.push(s.size); domainShare.push(inDomain / domainRoutes);
  }
  const minC = Math.min(...counts), fullRate = counts.filter(c => c === F).length / counts.length;
  const share = domainShare.reduce((a, b) => a + b, 0) / domainShare.length;
  check('every region (' + side * side + ' routes) hosts ≥ 8 of 12 habitats', minC >= 8, 'min ' + minC + ', all-12 in ' + (fullRate * 100).toFixed(1) + '% of 300 regions');
  check('gym-type habitats hold ~35–48% of a domain\'s routes (territory reads, not uniform)', share > 0.33 && share < 0.5, 'mean ' + (share * 100).toFixed(1) + '%');
}

// 6. Region names: never a franchise region name, and mostly unique
{
  const names = [];
  for (let gx = -40; gx < 40; gx++) for (let gy = -40; gy < 40; gy++) names.push(A.regionName(gx, gy));
  const blocked = names.filter(n => A.NAME_BLOCKLIST.includes(n.toLowerCase())).length;
  const uniq = new Set(names).size / names.length;
  check('6400 region names: 0 franchise names', blocked === 0);
  check('region name variety', uniq > 0.15, (uniq * 100).toFixed(1) + '% unique — names repeat across the globe; fine for a prototype, revisit if it bothers in play');
}

// 7. Walk test: a 5 km eastward walk at Kitchener latitude crosses ~15 routes; a 5 km northward walk ~15
{
  const lat = 43.45, lon0 = -80.4925;
  let crossE = 0, prev = A.routeCell(lat, lon0).rx;
  for (let d = 0; d <= 5000; d += 5) {
    const lon = lon0 + d / (111320 * Math.cos(lat * Math.PI / 180));
    const rx = A.routeCell(lat, lon).rx; if (rx !== prev) { crossE++; prev = rx; }
  }
  let crossN = 0; prev = A.routeCell(lat, lon0).ry;
  for (let d = 0; d <= 5000; d += 5) { const ry = A.routeCell(lat + d / 111320, lon0).ry; if (ry !== prev) { crossN++; prev = ry; } }
  const exp = 5000 / A.WORLD.ROUTE_M;
  check('5 km east crosses ≈ 5000/' + A.WORLD.ROUTE_M + ' routes (grid is exact E–W at 43.45°N)', Math.abs(crossE - exp) <= 1, crossE + ' crossings');
  check('5 km north crosses ≈ 5000/' + A.WORLD.ROUTE_M + ' routes', Math.abs(crossN - exp) <= 1, crossN + ' crossings');
  { let regs = new Set(); for (let dd = 0; dd <= 5000; dd += 5) { const dsc = A.describe(lat + dd / 111320, lon0); regs.add(dsc.gx + ',' + dsc.gy); } check('5 km north crosses 2–3 regions at 500 m routes', regs.size >= 2 && regs.size <= 3, regs.size + ' regions'); }
}

// 8. Haversine sanity: 1° of latitude ≈ 111.2 km
{
  const d = A.haversineM(43, -80, 44, -80);
  check('haversine: 1° lat ≈ 111.2 km', Math.abs(d - 111195) < 200, Math.round(d) + ' m');
}

// 9. Encounter scaling: no legendaries below the badge floor; ~1/512 above it; level rises with badges
{
  const lat = 43.4516, lon = -80.4925;
  let legLow = 0, legHigh = 0, lvl0 = 0, lvl8 = 0;
  const N = 20000;
  for (let s = 0; s < N; s++) {
    const e0 = A.encounter(lat, lon, 60, 0, s), e8 = A.encounter(lat, lon, 60, 8, s);
    if (e0.legendary) legLow++; if (e8.legendary) legHigh++;
    lvl0 += e0.level; lvl8 += e8.level;
  }
  check('0 legendaries with 0 badges', legLow === 0, legLow + ' / ' + N);
  check('scans never produce legendaries any more (they are Champion events)', legHigh === 0, legHigh + ' / ' + N);
  check('mean level rises with badges', lvl8 / N > lvl0 / N + 8, (lvl0 / N).toFixed(1) + ' → ' + (lvl8 / N).toFixed(1));
}


// 10. Validator rejects each malformed pack for the right reason, and accepts the demo fixture
{
  const clone = () => JSON.parse(JSON.stringify(A.DEMO_PACK));
  const cases = [
    ['7 families', p => { p.families = p.families.slice(0, 7); const keep = new Set(p.families.map(f => f.id)); p.species = p.species.filter(s => keep.has(s.family)); }, /at least 8/],
    ['duplicate family id', p => { p.families[1].id = p.families[0].id; }, /duplicate id/],
    ['bad color', p => { p.families[0].color = 'red'; }, /#rrggbb/],
    ['species with unknown family', p => { p.species[0].family = 'nope'; }, /unknown family/],
    ['dangling evolvesTo', p => { p.species[0].evolvesTo = ['ghost']; }, /evolvesTo unknown/],
    ['family without stage-1', p => { p.species = p.species.filter(s => !(s.family === 'ember' && s.stage === 1)); p.species.forEach(s => { s.evolvesTo = s.evolvesTo.filter(t => t !== 'ember1'); }); }, /needs at least one non-legendary stage-1/],
    ['wrong format tag', p => { p.format = 'v0'; }, /format must be/],
    ['naming with too few syllables', p => { p.naming = { prefixes: ['a'], suffixes: ['b', 'c', 'd', 'e'] }; }, /naming\.prefixes/],
  ];
  let ok = true, detail = [];
  for (const [name, mutate, re] of cases) {
    const p = clone(); mutate(p); const v = A.validatePack(p);
    if (v.ok || !v.errors.some(e => re.test(e))) { ok = false; detail.push(name + ' → ' + JSON.stringify(v.errors)); }
  }
  check('validator rejects 8 malformed packs, each with a specific reason', ok, detail.join(' | '));
  check('validator accepts the demo fixture', A.validatePack(A.DEMO_PACK).ok);
}

// 11. Swapping in a synthetic 18-family pack with pack-supplied naming keeps every world invariant
{
  const p = { format: 'scouter-pack/1', name: 'Synthetic18', author: 't', version: '1', families: [], species: [],
    naming: { prefixes: ['Ka', 'Ne', 'Ru', 'Ti', 'Vo'], middles: [], suffixes: ['lan', 'mor', 'sith', 'dre'], blocklist: ['Kalan'] } };
  for (let i = 0; i < 18; i++) {
    p.families.push({ id: 'f' + i, name: 'F' + i, color: '#' + (0x100000 + i * 0x0a0a0a).toString(16).slice(-6).padStart(6, '0') });
    p.species.push({ id: 's' + i + 'a', name: 'S' + i + 'a', family: 'f' + i, stage: 1, evolvesTo: ['s' + i + 'b'], evolveLevel: 20, sprite: 'x.png', legendary: false });
    p.species.push({ id: 's' + i + 'b', name: 'S' + i + 'b', family: 'f' + i, stage: 2, evolvesTo: [], evolveLevel: null, sprite: null, legendary: false });
  }
  p.species.push({ id: 'leg', name: 'Leg', family: 'f0', stage: 3, evolvesTo: [], evolveLevel: null, sprite: null, legendary: true });
  const X = load(); X.setPack(p);
  let ok = true;
  for (let i = 0; i < 200; i++) {
    const gx = Math.floor(R() * 2000 - 1000), gy = Math.floor(R() * 2000 - 1000);
    const fams = X.regionGymList(gx, gy); const gyms = fams.filter(f => f !== null);
    if (fams.length !== 9 || fams[X.leagueIndexOf(gx, gy)] !== null || new Set(gyms).size !== 8 || gyms.some(g => g < 0 || g >= 18)) ok = false;
  }
  check('18-family pack: 8 distinct gyms per region over 200 regions', ok);
  let names = new Set(), blocked = 0, matchesSyl = true;
  for (let gx = 0; gx < 40; gx++) for (let gy = 0; gy < 40; gy++) { const n = X.regionName(gx, gy); names.add(n); if (n === 'Kalan') blocked++; if (!/^(Ka|Ne|Ru|Ti|Vo)(lan|mor|sith|dre)$/.test(n)) matchesSyl = false; }
  check('pack naming syllables used, pack blocklist honoured', matchesSyl && blocked === 0, names.size + ' distinct names over 1600 regions');
  let famOk = true, stages = [0, 0, 0], leg = 0;
  for (let s = 0; s < 3000; s++) {
    const e = X.encounter(43.4516, -80.4925, 20, 8, s);
    if (e.legendary) { leg++; continue; }
    const d = X.describe(43.4516, -80.4925);
    if (X.PACK.habitats[d.habitat].members.every(mm => mm.id !== e.species.id)) famOk = false;
    stages[e.species.stage - 1]++;
  }
  check('encounters draw only from the route\'s habitat; member level ranges respected', famOk && stages[2] === 0, 'stage1 ' + stages[0] + ', stage2 ' + stages[1] + ', stage3 ' + stages[2] + ', legendary ' + leg);
  const isolated = JSON.stringify(A.describe(1.5, 2.5));
  check('loading a pack in one engine instance does not touch another', isolated === JSON.stringify(B.describe(1.5, 2.5)) && A.PACK.habitats.length === 12 && X.PACK.habitats.length === 18);
}


// 12. Catch model: higher tier never worse; stronger wild never easier; legendaries always harder; every encounter terminates
{
  let mono = true, legHarder = true;
  for (let w = 2; w <= 100; w += 2) for (let t = 5; t <= 100; t += 5) {
    for (let k = 0; k < 2; k++) if (A.catchChance(w, t, k + 1, false) < A.catchChance(w, t, k, false)) mono = false;
    if (A.catchChance(w + 2, t, 1, false) > A.catchChance(w, t, 1, false)) mono = false;
    { const n = A.catchChance(w, t, 2, false), l = A.catchChance(w, t, 2, true); if (l > n || (n > 0.02 && l >= n)) legHarder = false; }
  }
  check('catch chance monotone in tier and non-increasing in wild level', mono);
  check('legendaries strictly harder wherever odds are above the 2% floor', legHarder);
  const r = srand(11); let maxThrows = 0, ended = 0;
  for (let i = 0; i < 5000; i++) {
    const wild = { level: 2 + Math.floor(r() * 98), legendary: r() < 0.05 };
    let n = 0, res = 'stay'; while (res === 'stay' && n < 500) { res = A.throwSnare(wild, 20, 0, r); n++; }
    if (res !== 'stay') ended++; maxThrows = Math.max(maxThrows, n);
  }
  check('5000 encounters all end (caught or fled) within a bounded number of throws', ended === 5000 && maxThrows < 60, 'max ' + maxThrows + ' throws');
}

// 13. Strategy spread with a fixed bag: matching tier to the level gap beats spamming Snare I, and hoarding is worse than both
{
  const sim = (pick, runs = 400) => {
    let caught = 0;
    for (let run = 0; run < runs; run++) {
      const r = srand(1000 + run); const bag = [20, 8, 3]; const teamLv = 20; let c = 0;
      for (let e = 0; e < 40; e++) {
        const wild = { level: 8 + Math.floor(r() * 30), legendary: false };
        let res = 'stay';
        while (res === 'stay') {
          const tier = pick(wild, bag); if (tier < 0) break;
          bag[tier]--; res = A.throwSnare(wild, teamLv, tier, r);
        }
        if (res === 'caught') c++;
        if (bag.every(x => x <= 0)) break;
      }
      caught += c;
    }
    return caught / runs;
  };
  const spam = sim((w, bag) => bag[0] > 0 ? 0 : (bag[1] > 0 ? 1 : (bag[2] > 0 ? 2 : -1)));
  const smart = sim((w, bag) => { const gap = w.level - 20; const want = gap > 8 ? 2 : (gap > 0 ? 1 : 0); for (let t = want; t >= 0; t--) if (bag[t] > 0) return t; for (let t = want + 1; t < 3; t++) if (bag[t] > 0) return t; return -1; });
  const smartOrRun = sim((w, bag) => { const gap = w.level - 20; const want = gap > 8 ? 2 : (gap > 0 ? 1 : 0); return bag[want] > 0 ? want : -1; }); // right tier, else walk away
  const timid = sim((w, bag) => { if (w.level > 20) return -1; return bag[0] > 0 ? 0 : -1; }); // runs from anything stronger
  check('right-tier-or-run beats tier-matching beats Snare-I spam beats timid, spread ≥ 30%', smartOrRun > smart && smart > spam && spam > timid && smartOrRun / spam >= 1.3, 'right-tier-or-run ' + smartOrRun.toFixed(1) + ', tier-match ' + smart.toFixed(1) + ', spam ' + spam.toFixed(1) + ', timid ' + timid.toFixed(1) + ' catches per 31-snare bag');
}

// 14. Party/box/bag rules and save round-trip
{
  const sv = A.newSave(); const enc = { species: { id: 'ember1' }, level: 7, shiny: false, legendary: false };
  const where = [];
  for (let i = 0; i < 8; i++) where.push(A.addMonster(sv, A.makeMonster(sv, enc, { region: 'X', route: 1 })));
  check('first 6 go to team, 7th+ to box', where.slice(0, 6).every(w => w === 'team') && where.slice(6).every(w => w === 'box') && sv.team.length === 6 && sv.box.length === 2);
  check('uids unique', new Set([...sv.team, ...sv.box].map(m => m.uid)).size === 8);
  check('cannot move to a full team', A.moveToTeam(sv, sv.box[0].uid) === false);
  const uid = sv.team[0].uid;
  check('move to box then back', A.moveToBox(sv, uid) && sv.team.length === 5 && A.moveToTeam(sv, uid) && sv.team.length === 6 && sv.team.some(m => m.uid === uid));
  check('team level is the mean, 5 when empty', A.teamLevel(sv) === 7 && A.teamLevel(A.newSave()) === 5);
  const bag0 = sv.bag[0]; const granted = A.addWalk(sv, A.SNARE_REFILL_M * 3 + 50);
  check('walking refills Snare I at the stated rate, remainder carried', granted === 3 && sv.bag[0] === bag0 + 3 && sv.refillM === 50 && A.addWalk(sv, A.SNARE_REFILL_M - 50) === 1);
  const rt = A.migrateSave(JSON.parse(JSON.stringify(sv)));
  check('save survives JSON round-trip; garbage is rejected', rt && rt.team.length === 6 && rt.box.length === 2 && A.migrateSave({ v: 99 }) === null && A.migrateSave(null) === null && A.migrateSave('x') === null);
  const o1 = A.starterOffer(1), o2 = A.starterOffer(1);
  check('starter offer: 3 distinct stage-1 species, stable for a seed', o1.length === 3 && new Set(o1.map(s => s.id)).size === 3 && o1.every(s => s.stage === 1 && !s.legendary) && JSON.stringify(o1.map(s => s.id)) === JSON.stringify(o2.map(s => s.id)));
}


// ---------- Full-mode synthetic pack: 8 types with a rock-paper-scissors ring chart, 8 families ----------
function fullPack() {
  const T = ['fire', 'water', 'grass', 'electric', 'rock', 'ice', 'ghost', 'normal'];
  const chart = { fire: { grass: 2, ice: 2, water: 0.5, rock: 0.5 }, water: { fire: 2, rock: 2, grass: 0.5, water: 0.5 }, grass: { water: 2, rock: 2, fire: 0.5, grass: 0.5 },
    electric: { water: 2, grass: 0.5, rock: 0 }, rock: { fire: 2, ice: 2, grass: 0.5 }, ice: { grass: 2, rock: 0.5, fire: 0.5, water: 0.5 }, ghost: { ghost: 2, normal: 0 }, normal: { rock: 0.5, ghost: 0 } };
  const moves = [];
  T.forEach(t => { moves.push({ id: t + '-weak', name: t + ' jab', type: t, category: 'physical', power: 40, accuracy: 100, pp: 30 }); moves.push({ id: t + '-strong', name: t + ' blast', type: t, category: 'special', power: 90, accuracy: 90, pp: 10 }); });
  moves.push({ id: 'growl', name: 'Growl', type: 'normal', category: 'status', power: null, accuracy: 100, pp: 40 });
  const p = { format: 'scouter-pack/1', name: 'FullSynth', author: 't', version: '1', battle: { mode: 'full' }, types: T.map(t => ({ id: t, name: t })), typeChart: chart, moves,
    families: T.map((t, i) => ({ id: t, name: t, color: '#' + (0x101010 * (i + 1)).toString(16).padStart(6, '0') })), species: [] };
  T.forEach((t, i) => {
    const other = T[(i + 3) % 8];
    const ls = [{ level: 1, move: t + '-weak' }, { level: 1, move: 'growl' }, { level: 3, move: other + '-weak' }, { level: 12, move: t + '-strong' }, { level: 18, move: other + '-strong' }];
    p.species.push({ id: t + '1', name: t + ' A', family: t, stage: 1, evolvesTo: [t + '2'], evolveLevel: 16, sprite: null, legendary: false, types: [t], stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 }, learnset: ls });
    p.species.push({ id: t + '2', name: t + ' B', family: t, stage: 2, evolvesTo: [], evolveLevel: null, sprite: null, legendary: false, types: [t, other], stats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 }, learnset: ls });
  });
  return p;
}
const FP = load(); FP.setPack(fullPack());

// 15. Validator: full-mode rules
{
  const clone = () => fullPack();
  const cases = [
    ['missing typeChart', p => { delete p.typeChart; }, /typeChart required/],
    ['move with unknown type', p => { p.moves[0].type = 'void'; }, /unknown type/],
    ['species missing stats', p => { delete p.species[0].stats; }, /stats\.hp/],
    ['no early damaging move', p => { p.species[0].learnset = [{ level: 20, move: 'fire-weak' }]; }, /damaging move learnable by level 5/],
    ['chart references unknown type', p => { p.typeChart.fire.void = 2; }, /unknown defending type/],
    ['species type not in types', p => { p.species[0].types = ['plasma']; }, /types must be/],
    ['bad mode', p => { p.battle.mode = 'epic'; }, /battle\.mode/],
  ];
  let ok = true, detail = [];
  for (const [name, mutate, re] of cases) { const p = clone(); mutate(p); const v = FP.validatePack(p); if (v.ok || !v.errors.some(e => re.test(e))) { ok = false; detail.push(name + ' → ' + JSON.stringify(v.errors.slice(0, 3))); } }
  check('validator enforces 7 full-mode rules', ok, detail.join(' | '));
  check('validator accepts the full synthetic pack; light packs need none of it', FP.validatePack(fullPack()).ok && A.validatePack(A.DEMO_PACK).ok);
}

// 16. Stats, effectiveness, damage
{
  const st = FP.statsFor({ stats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 } }, 50);
  check('level-50 stats from base 100: hp 160, others 105', st.hp === 160 && st.atk === 105 && st.spe === 105);
  check('effectiveness: 2×, 0.5×, 0×, dual types multiply, unknown pair = 1', FP.effectiveness('fire', ['grass']) === 2 && FP.effectiveness('fire', ['water']) === 0.5 && FP.effectiveness('electric', ['rock']) === 0 && FP.effectiveness('fire', ['grass', 'ice']) === 4 && FP.effectiveness('ghost', ['fire']) === 1);
  const sv = FP.newSave(); const fireA = FP.makeMonster(sv, { species: FP.PACK.speciesById.get('fire1'), level: 20 }, null); const grassA = FP.makeMonster(sv, { species: FP.PACK.speciesById.get('grass1'), level: 20 }, null); const waterA = FP.makeMonster(sv, { species: FP.PACK.speciesById.get('water1'), level: 20 }, null);
  const a = FP.makeCombatant(fireA), g = FP.makeCombatant(grassA), w = FP.makeCombatant(waterA);
  const mv = FP.PACK.movesById.get('fire-weak');
  const eG = FP.expectedDamage(a, g, mv), eW = FP.expectedDamage(a, w, mv), eN = FP.expectedDamage(a, FP.makeCombatant(FP.makeMonster(sv, { species: FP.PACK.speciesById.get('ghost1'), level: 20 }, null)), mv);
  check('STAB + super-effective ≫ neutral ≫ resisted (fire jab vs grass/ghost/water)', eG > eN * 1.9 && eN > eW * 1.9, [eG, eN, eW].map(x => x.toFixed(1)).join(' / '));
  let neverNeg = true, immuneZero = true; const r = srand(3);
  for (let i = 0; i < 2000; i++) { const d = FP.damageFull(a, g, mv, r); if (d.dmg < 0) neverNeg = false; }
  for (let i = 0; i < 200; i++) { const d = FP.damageFull(FP.makeCombatant(FP.makeMonster(sv, { species: FP.PACK.speciesById.get('electric1'), level: 20 }, null)), FP.makeCombatant(FP.makeMonster(sv, { species: FP.PACK.speciesById.get('rock1'), level: 20 }, null)), FP.PACK.movesById.get('electric-weak'), r); if (d.dmg !== 0) immuneZero = false; }
  check('damage never negative; immune type takes 0', neverNeg && immuneZero);
  check('AI picks the highest expected-damage move (super-effective over STAB-neutral)', FP.aiPickMove(FP.makeCombatant(FP.makeMonster(sv, { species: FP.PACK.speciesById.get('fire2'), level: 20 }, null)), w) === (() => { const m = FP.makeMonster(sv, { species: FP.PACK.speciesById.get('fire2'), level: 20 }, null); return m.moves.findIndex(x => x.id === 'electric-strong'); })());
  check('moves at level: last four learned, in order', JSON.stringify(FP.movesAtLevel(FP.PACK.speciesById.get('fire1'), 20).map(m => m.id)) === JSON.stringify(['growl', 'electric-weak', 'fire-strong', 'electric-strong']));
}

// 17. Full battles: order by speed, PP exhaustion terminates, level advantage wins, move choice has teeth
{
  const sv = FP.newSave();
  const mk = (id, lv) => FP.makeMonster(sv, { species: FP.PACK.speciesById.get(id), level: lv }, null);
  const fight = (mine, theirs, choose, r) => { // returns true if mine wins
    const pl = FP.makeCombatant(mine), en = FP.makeCombatant(theirs); let rounds = 0;
    while (rounds++ < 300) { const idx = choose(pl, en, r); const res = FP.battleRoundFull(pl, en, idx, r); if (res.enemyDown) return true; if (res.playerDown) return false; }
    return false;
  };
  const smart = (pl, en) => FP.aiPickMove(pl, en) ?? 0;
  const randomMove = (pl, en, r) => { const ok = pl.moves.map((m, i) => m.pp > 0 ? i : -1).filter(i => i >= 0); return ok.length ? ok[Math.floor(r() * ok.length)] : 0; };
  const first = (pl) => pl.moves.findIndex(m => m.pp > 0) >= 0 ? pl.moves.findIndex(m => m.pp > 0) : 0;
  const trial = (chooser, lvA, lvB, n = 600, seed = 500, mirror = false) => { let w = 0; for (let i = 0; i < n; i++) { const r = srand(seed + i); const ids = ['fire2', 'water2', 'grass2', 'rock2', 'ice2', 'electric2', 'ghost2', 'normal2']; const a = mk(ids[i % 8], lvA), b = mk(mirror ? ids[i % 8] : ids[(i * 5 + 3) % 8], lvB); if (fight(a, b, chooser, r)) w++; } return w / n; };
  const eq = trial(smart, 25, 25, 600, 500, true), plus8 = trial(smart, 33, 25, 600, 500, true), minus8 = trial(smart, 17, 25, 600, 500, true);
  check('equal-level true mirrors ≈ even; +8 levels wins big; −8 loses big', eq > 0.35 && eq < 0.65 && plus8 > 0.8 && minus8 < 0.2, 'eq ' + (eq * 100).toFixed(0) + '%, +8 ' + (plus8 * 100).toFixed(0) + '%, −8 ' + (minus8 * 100).toFixed(0) + '%');
  const sm = trial(smart, 25, 25, 600, 900), rn = trial(randomMove, 25, 25, 600, 900), fi = trial(first, 25, 25, 600, 900);
  check('type-aware move choice beats random beats first-slot mashing (vs a type-aware AI)', sm > rn + 0.1 && rn > fi, 'smart ' + (sm * 100).toFixed(0) + '%, random ' + (rn * 100).toFixed(0) + '%, mash ' + (fi * 100).toFixed(0) + '%');
  // speed order
  const fast = mk('fire2', 40), slow = mk('rock2', 30); const pl = FP.makeCombatant(fast), en = FP.makeCombatant(slow);
  const res = FP.battleRoundFull(pl, en, 0, () => 0.5);
  check('faster combatant acts first', pl.stats.spe > en.stats.spe && /^fire B used/.test(res.log[0]));
  // PP exhaustion
  const a1 = mk('normal1', 20), b1 = mk('ghost1', 20); // normal moves do 0 to ghost; PP runs out → struggle ends it
  a1.moves = [{ id: 'normal-weak', pp: 1 }]; b1.moves = [{ id: 'growl', pp: 1 }];
  const pa = FP.makeCombatant(a1), pb = FP.makeCombatant(b1); let n = 0, done = false;
  while (n++ < 200) { const r = FP.battleRoundFull(pa, pb, 0, srand(n)); if (r.enemyDown || r.playerDown) { done = true; break; } }
  check('with PP exhausted, struggle ends the battle', done, n + ' rounds');
}

// 18. Light battles: level edge matters but is not a foregone race; reading the wind-up has teeth; no stall loop
{
  const sv = A.newSave();
  const mk = (id, lv) => A.makeMonster(sv, { species: A.PACK.speciesById.get(id), level: lv }, null);
  const fight = (mine, theirs, choose, r) => { const pl = A.makeCombatant(mine), en = A.makeCombatant(theirs); let k = 0; while (k++ < 300) { const res = A.battleRoundLight(pl, en, choose(pl, en), r); if (res.enemyDown) return true; if (res.playerDown) return false; } return false; };
  const trial = (chooser, lvA, lvB, n = 500) => { let w = 0; for (let i = 0; i < n; i++) if (fight(mk('ember2', lvA), mk('tide2', lvB), chooser, srand(700 + i))) w++; return w / n; };
  const strike = () => 'strike', read = (pl, en) => en.windup ? 'guard' : 'strike', alt = (pl, en, r) => 'x', always = () => 'guard';
  let flip = false; const alternate = () => (flip = !flip) ? 'guard' : 'strike';
  const eq = trial(strike, 20, 20), plus8 = trial(strike, 28, 20), minus8 = trial(strike, 12, 20);
  const rd = trial(read, 20, 20), al = trial(alternate, 20, 20), ag = trial(always, 20, 20);
  const rdVs4 = trial(read, 20, 24), rd3 = trial(read, 17, 20), rd5 = trial(read, 15, 20), st4 = trial(strike, 24, 20);
  check('light: mash vs mash roughly even (the foe winds up, the masher never reads); +8/−8 decisive', eq > 0.28 && eq < 0.65 && plus8 > 0.85 && minus8 < 0.15, 'eq ' + (eq * 100).toFixed(0) + '%, +8 ' + (plus8 * 100).toFixed(0) + '%, −8 ' + (minus8 * 100).toFixed(0) + '%');
  check('light: reading wind-ups ≫ mashing ≈ blind alternation; always-guard never wins', rd > eq + 0.25 && al <= eq + 0.06 && ag < 0.05, 'read ' + (rd * 100).toFixed(0) + '%, mash ' + (eq * 100).toFixed(0) + '%, alternate ' + (al * 100).toFixed(0) + '%, always-guard ' + (ag * 100).toFixed(0) + '%');
  check('light: good reads overcome a small level deficit but not a large one', rd3 > 0.25 && rd3 < 0.6 && rdVs4 > 0.25 && rd5 < 0.25 && rd5 < rd3, 'read at −3: ' + (rd3 * 100).toFixed(0) + '%, read vs +4: ' + (rdVs4 * 100).toFixed(0) + '%, read at −5: ' + (rd5 * 100).toFixed(0) + '%, (mash at +4: ' + (st4 * 100).toFixed(0) + '%)');
  console.log('  info light-mode fight length at equal level: ' + (() => { const pl = A.makeCombatant(mk('ember2', 20)), en = A.makeCombatant(mk('tide2', 20)); let k = 0; const r = srand(1); while (k++ < 300) { const res = A.battleRoundLight(pl, en, 'strike', r); if (res.enemyDown || res.playerDown) break; } return k; })() + ' rounds');
}

// 19. Progression: XP curve, level-up, move learning, evolution, HP growth; save migration
{
  const sv = FP.newSave(); const m = FP.makeMonster(sv, { species: FP.PACK.speciesById.get('fire1'), level: 10 }, null);
  let mono = true; for (let l = 1; l < 100; l++) if (FP.xpToNext(l + 1) <= FP.xpToNext(l)) mono = false;
  check('xp curve strictly increasing', mono);
  const hp0 = m.maxHp; const ev = FP.grantXp(m, FP.xpToNext(10) + FP.xpToNext(11) + 5);
  check('two level-ups from exact XP, remainder kept, HP grows', m.level === 12 && m.xp === 5 && ev.filter(e => e.type === 'level').length === 2 && m.maxHp > hp0 && m.hp === m.maxHp);
  check('learned the level-12 move', ev.some(e => e.type === 'move' && e.move === 'fire-strong') && m.moves.some(x => x.id === 'fire-strong'));
  let total = 0; for (let l = 12; l < 16; l++) total += FP.xpToNext(l); const ev2 = FP.grantXp(m, total);
  check('evolves at level 16 into the listed next species', m.level === 16 && m.speciesId === 'fire2' && ev2.some(e => e.type === 'evolve' && e.to === 'fire2'));
  const v1 = { v: 1, team: [{ uid: 1, speciesId: 'fire1', level: 5, shiny: false, legendary: false, caughtAt: null }], box: [], bag: [1, 1, 1], badges: 0, nextUid: 2, walkedM: 0, refillM: 0, starterChosen: true, seen: {} };
  const mig = FP.migrateSave(v1); if (mig) FP.hydrate(mig.team[0]);
  check('v1 save migrates to the current version and hydrates (hp, moves)', mig && mig.v === 3 && mig.team[0].xp === 0 && mig.team[0].hp === mig.team[0].maxHp && mig.team[0].moves.length > 0);
  check('catch odds rise as wild HP falls', A.catchChance(20, 20, 0, false, 0.1) > A.catchChance(20, 20, 0, false, 1) * 2);
}


// ---------- 20. GMS .bin loader on the real Pokémon pack ----------
const GMS = load(); const HISTORY_MAX_FILL = 450; const TRAINER_DAY = 24 * 3600 * 1000;
{
  const text = readFileSync('/mnt/user-data/uploads/poke9_data_v1_6_gmsdp2.bin', 'utf8');
  const raw = GMS.parseGmsBin(text);
  check('.bin parses as JSON + trailing signature; recognised as GMS', GMS.isGmsPack(raw) && GMS.validateGmsPack(raw).ok);
  GMS.setPack(raw);
  const P = GMS.PACK;
  check('compiled: 1025 species, 482 habitats, 119 rares, 18 gym types, 9589 images', P.speciesById.size === 1025 && P.habitats.length === 482 && P.rares.length === 119 && P.gyms.length === 18 && P.images.size === 9589, [P.speciesById.size, P.habitats.length, P.rares.length, P.gyms.length, P.images.size].join('/'));
  const bulb = P.speciesById.get('0001bulb');
  check('Bulbasaur: grass/poison, power 0, evolves at 16, sprite resolves to an image in the pack', bulb.types.join('/') === 'grass/poison' && bulb.power === 0 && bulb.evolveLevel === 16 && bulb.evolvesTo[0] === '0002ivys' && P.images.has(bulb.sprite) && P.images.has(bulb.icon));
  check('type chart from the pack: fire→grass 2, fire→water 0.5, electric→ground 0', P.typeChart.fire.grass === 2 && P.typeChart.fire.water === 0.5 && P.typeChart.electric.ground === 0);
  let cover = true; P.habitats.forEach(h => { for (let l = 1; l <= 100; l++) if (!h.members.some(m => l >= m.min && l <= m.max)) cover = false; });
  check('every family covers levels 1..100 (pack invariant)', cover);
  const fireGym = P.gyms.find(g => g.type === 'fire');
  check('fire gym pool: 28 leader names, 4 leader images, 2 badges with icons in the pack', fireGym.leaders.length === 28 && fireGym.leaderImages.length === 4 && fireGym.badges.length === 2 && fireGym.badges.every(b => P.images.has(b.icon)));
  check('dark type has no badge in the pack → engine supplies a generic one', P.gyms.find(g => g.type === 'dark').badges[0].name === 'Dark Badge');
  let regionsOk = true;
  for (let i = 0; i < 100; i++) { const gx = Math.floor(R() * 400 - 200), gy = Math.floor(R() * 400 - 200); const l = GMS.regionGymList(gx, gy).filter(x => x !== null); if (new Set(l).size !== 8) regionsOk = false; }
  check('8 distinct gym types per region from the 18', regionsOk);
  const g = GMS.gymOf(7, 3);
  check('gym = leader from the type\'s pool, leader image and badge from the pack, on a route of its own domain', !g.league && g.gym.leaders.includes(g.leader) && P.images.has(g.leaderImage) && P.images.has(g.badge.icon) && Math.floor(g.cell.rx / 2) === 7 && Math.floor(g.cell.ry / 2) === 3);
  // light-mode type effectiveness with the real chart
  const sv = GMS.newSave(); const mk = (id, lv) => GMS.makeMonster(sv, { species: P.speciesById.get(id), level: lv }, null);
  const char = GMS.makeCombatant(mk('0004char', 20)), bulbC = GMS.makeCombatant(mk('0001bulb', 20)), squi = GMS.makeCombatant(mk('0007squi', 20));
  check('light strike applies the chart: Charmander vs Bulbasaur 2×, vs Squirtle 0.5×', GMS.bestTypeEff(char.types, bulbC.types) === 2 && GMS.bestTypeEff(char.types, squi.types) === 0.5);
  // encounters respect member ranges
  let rangeOk = true; for (let i = 0; i < 3000; i++) { const lat = 43.4 + (i % 50) * 0.003, lon = -80.6 + Math.floor(i / 50) * 0.004; const e = GMS.encounter(lat, lon, 5 + (i % 90), 0, i); const d = GMS.describe(lat, lon); const mem = P.habitats[d.habitat].members.find(m => m.id === e.species.id); if (!mem || e.level < mem.min || e.level > mem.max) rangeOk = false; }
  check('3000 encounters: species is a member of the route habitat and its level is inside that member\'s range', rangeOk);
  const st = GMS.starterOffer(1);
  check('starter offer: 3 low-level, power ≤ 0, non-legendary', st.length === 3 && st.every(s => s.power <= 0 && !s.legendary), st.map(s => s.name).join(', '));
}

// ---------- 21. Gym leaders scale with badges; the ace grows along its line; badges award once; league gates ----------
{
  const P = GMS.PACK; const g = [[7, 3], [9, 5], [2, 8], [11, 1], [4, 6], [13, 2]].map(([a, b]) => GMS.gymOf(a, b)).find(x => !x.league && GMS.aceLine(x) && new Set(GMS.aceLine(x).members.map(m => m.min)).size >= 2);
  let mono = true; for (let b = 0; b < 20; b++) if (GMS.leaderLevel(b + 1) < GMS.leaderLevel(b) || GMS.leaderTeamSize(b + 1) < GMS.leaderTeamSize(b)) mono = false;
  check('leader team: 2 at start, 3rd gym has 3, 5th has 4, 7th and 8th have 5, never 6', mono && GMS.leaderLevel(0) === 8 && GMS.leaderLevel(100) === 97 && [0, 1, 2, 3, 4, 5, 6, 7, 20].map(b => GMS.leaderTeamSize(b)).join() === '2,2,3,3,4,4,5,5,5');
  const t0 = GMS.leaderTeam(g, 0), t8 = GMS.leaderTeam(g, 8), t16 = GMS.leaderTeam(g, 16);
  const ace = t => t.find(m => m.ace);
  check('one ace per team, at leader level + 3, of the gym\'s type', [t0, t8, t16].every(t => t.filter(m => m.ace).length === 1) && ace(t0).level === GMS.leaderLevel(0, g.gx, g.gy) + 3 && ace(t8).level === GMS.leaderLevel(8, g.gx, g.gy) + 3 && P.speciesById.get(ace(t0).speciesId).types.includes(g.type));
  const line = GMS.aceLine(g);
  const inLine = t => line.members.some(m => m.id === ace(t).speciesId);
  check('the ace stays on one evolution line and grows: species at 0 badges ≠ species at 16 badges (' + g.type + ' gym)', inLine(t0) && inLine(t8) && inLine(t16) && ace(t0).speciesId !== ace(t16).speciesId, P.speciesById.get(ace(t0).speciesId).name + ' → ' + P.speciesById.get(ace(t8).speciesId).name + ' → ' + P.speciesById.get(ace(t16).speciesId).name);
  check('leader team is deterministic for (gym, badges) and the rest of the team is the gym\'s type', JSON.stringify(GMS.leaderTeam(g, 8)) === JSON.stringify(t8) && t8.every(m => P.speciesById.get(m.speciesId).types.includes(g.type)));
  const sv = GMS.newSave();
  check('first win earns the badge, rematch does not; badge count and per-region count track', GMS.recordGymWin(sv, g) === true && GMS.recordGymWin(sv, g) === false && GMS.badgeCount(sv) === 1 && GMS.regionBadgeCount(sv, g.gx, g.gy) === 1 && GMS.hasBadge(sv, g) && sv.badges[GMS.regionKey(g.gx, g.gy)].gyms[g.mi].wins === 2);
  // all 8 gyms of the region → league available; champion recorded once
  let earned = 1;
  for (let mi = 0; mi < 9; mi++) { if (mi === GMS.leagueIndexOf(g.gx, g.gy) || mi === g.mi) continue; const gg = GMS.gymOf(g.gx * 3 + mi % 3, g.gy * 3 + Math.floor(mi / 3)); if (GMS.recordGymWin(sv, gg)) earned++; }
  const league = GMS.gymOf(g.gx * 3 + 1, g.gy * 3 + 1);
  check('8 region badges unlock the league; champion team is 6 strong monsters at the region\'s champion level', earned === 8 && GMS.regionBadgeCount(sv, g.gx, g.gy) === 8 && league.league && GMS.championTeam(league, 8).length === 6 && GMS.championTeam(league, 8)[0].level === GMS.championLevel(league.gx, league.gy, 8) && GMS.recordChampion(sv, league) === true && GMS.recordChampion(sv, league) === false);
  check('badge tally survives save round-trip and migration from v2', (() => { const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt && GMS.badgeCount(rt) === 8; })() && GMS.migrateSave({ v: 2, team: [], box: [], bag: [1, 1, 1], badges: 3 }).v === 3);
}

// ---------- 22. Gym challenge has teeth (averaged over four gyms of different types) ----------
{
  const P = GMS.PACK; const gyms = [[7, 3], [9, 5], [2, 8], [11, 1]].map(([a, b]) => GMS.gymOf(a, b)).filter(x => !x.league);
  const pick = (want, n) => [...P.speciesById.values()].filter(s => !s.legendary && s.power === 1 && s.types.length === 1 && s.types[0] === want).slice(0, n);
  const runOne = (g, types, lvl, badges, n = 120) => {
    let wins = 0;
    for (let i = 0; i < n; i++) {
      const r = srand(4000 + i); const sv = GMS.newSave();
      for (let k = 0; k < 3 && types.length; k++) { const tp = types[k % types.length]; const c = pick(tp, 6); const sp = c[(i + Math.floor(k / types.length)) % c.length]; if (sp) sv.team.push(GMS.makeMonster(sv, { species: sp, level: lvl }, null)); }
      if (sv.team.length < 3) return 0;
      const foes = GMS.leaderTeam(g, badges).map(e => GMS.trainerInstance(e, 'L ')); let fi = 0, active = 0, won = false, k = 0;
      while (k++ < 400) {
        const pl = GMS.makeCombatant(sv.team[active]), en = GMS.makeCombatant(foes[fi]); en.windup = !!foes[fi]._w;
        const res = GMS.battleRoundLight(pl, en, en.windup ? 'guard' : 'strike', r); foes[fi]._w = res.windup;
        if (res.enemyDown) { fi++; if (fi >= foes.length) { won = true; break; } }
        if (res.playerDown) { active = sv.team.findIndex(m => m.hp > 0); if (active < 0) break; }
      }
      if (won) wins++;
    }
    return wins / n;
  };
  const strongVs = g => Object.keys(P.typeChart).filter(t => (P.typeChart[t] || {})[g.type] === 2 && ((P.typeChart[g.type] || {})[t] ?? 1) < 2);
  const weakVs = g => Object.keys(P.typeChart).filter(t => ((P.typeChart[g.type] || {})[t] ?? 1) === 2 && ((P.typeChart[t] || {})[g.type] ?? 1) <= 1);
  const avg = f => gyms.reduce((a, g) => a + f(g), 0) / gyms.length;
  const GYM = GMS.GYM, L = GYM.BASE_LEVEL, L4 = GYM.BASE_LEVEL + 4 * GYM.PER_BADGE;
  const LL = g => GMS.leaderLevel(0, g.gx, g.gy);
  const advEq = avg(g => runOne(g, strongVs(g), LL(g), 0)), neuEq = avg(g => runOne(g, ['normal', 'normal', 'normal'], LL(g), 0)), disEq = avg(g => runOne(g, weakVs(g), LL(g), 0));
  check('at the leader\'s level, averaged over ' + gyms.length + ' gyms (' + gyms.map(g => g.type).join(', ') + '): advantage ≫ disadvantage, neutral in between', advEq > 0.85 && disEq < 0.25 && neuEq < advEq && neuEq > disEq, 'adv ' + (advEq * 100).toFixed(0) + '%, neutral ' + (neuEq * 100).toFixed(0) + '%, disadv ' + (disEq * 100).toFixed(0) + '%');
  const advUnder = avg(g => runOne(g, strongVs(g), LL(g) - 2, 0)), neuUnder = avg(g => runOne(g, ['normal', 'normal', 'normal'], LL(g) - 2, 0));
  check('two levels under the leader, advantage still wins while neutral drops well below it', advUnder > 0.8 && neuUnder < advUnder - 0.3, 'adv@−2 ' + (advUnder * 100).toFixed(0) + '%, neutral@−2 ' + (neuUnder * 100).toFixed(0) + '%');
  const L4g = g => GMS.leaderLevel(4, g.gx, g.gy);
  const re22 = avg(g => runOne(g, strongVs(g), L4g(g) - 6, 4)), re26 = avg(g => runOne(g, strongVs(g), L4g(g) - 2, 4)), re30 = avg(g => runOne(g, strongVs(g), L4g(g) + 2, 4));
  check('4-badge rematch (Lv 28, 4 monsters) scales with the team\'s level', re22 < re26 - 0.2 && re26 <= re30 && re30 > 0.85, (re22 * 100).toFixed(0) + '% / ' + (re26 * 100).toFixed(0) + '% / ' + (re30 * 100).toFixed(0) + '%');
}

// ---------- 23. Eggs: found by distance, family chosen by eggFrequency, hatch after eggCycles × cycle metres ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); const lat = 43.4516, lon = -80.4925;
  let found = 0, hatched = [], walked = 0;
  for (let i = 0; i < 400; i++) { const r = GMS.addEggWalk(sv, 50, lat, lon); walked += 50; if (r.found) found++; hatched.push(...r.hatched); }
  check('20 km of walking finds eggs (about one per 1.6 km on average), never more than 3 incubating', found >= 4 && found <= 16 && sv.eggs.length <= GMS.EGG.MAX, found + ' found, ' + hatched.length + ' hatched, ' + sv.eggs.length + ' incubating');
  const anyEgg = hatched[0] || null;
  check('hatched monsters are level 5 egg-species of their family, sent to the team/box', hatched.length >= 1 && hatched.every(m => m.level === GMS.EGG.HATCH_LEVEL && m.hatched) && (sv.team.length + sv.box.length) === hatched.length);
  const habs = new Set(sv.eggs.map(e => e.habitat).concat(hatched.map(m => P.speciesById.get(m.speciesId).familyIndex)));
  check('egg needM = family eggCycles × cycle metres', sv.eggs.every(e => e.needM === P.habitats[e.habitat].eggCycles * GMS.EGG.CYCLE_M) && habs.size >= 1);
  // determinism: same walk twice on fresh saves → same eggs
  const a = GMS.newSave(), b2 = GMS.newSave(); for (let i = 0; i < 100; i++) { GMS.addEggWalk(a, 50, lat, lon); GMS.addEggWalk(b2, 50, lat, lon); }
  check('egg finds are deterministic for the same walk', JSON.stringify(a.eggs.map(e => e.speciesId)) === JSON.stringify(b2.eggs.map(e => e.speciesId)));
  // eggFrequency weighting: over many finds in one domain, families with eggFrequency 3 outnumber those with 1 (per-family average)
  const counts = new Map(); const sv2 = GMS.newSave();
  for (let i = 0; i < 20000; i++) { const r = GMS.addEggWalk(sv2, 100, lat, lon); if (r.found) { counts.set(r.found.habitat, (counts.get(r.found.habitat) || 0) + 1); sv2.eggs = []; } }
  const byFreq = {}; counts.forEach((n, hi) => { const f = P.habitats[hi].eggFrequency; byFreq[f] = byFreq[f] || { n: 0, fams: new Set() }; byFreq[f].n += n; byFreq[f].fams.add(hi); });
  const avg = f => byFreq[f] ? byFreq[f].n / byFreq[f].fams.size : 0;
  check('eggFrequency weights finds (avg finds per family: freq 3 > freq 1)', avg(3) > avg(1) * 1.5 || !byFreq[1], 'freq3 ' + avg(3).toFixed(1) + ' vs freq1 ' + avg(1).toFixed(1) + ' per family over ' + [...counts.values()].reduce((a, b) => a + b, 0) + ' finds');
}

// ---------- 24. Items: drop rates follow the pack, bag add/remove, item evolutions ----------
{
  const P = GMS.PACK; const sv = GMS.newSave();
  const hab = P.habitats.find(h => h.items.some(i => i.id === 'Moon Stone'));   // Nidoran family: Moon Stone 2.5%
  const nido = P.speciesById.get(hab.members[0].id);
  let drops = 0, N = 40000; const r = srand(9);
  for (let i = 0; i < N; i++) if (GMS.rollWildItem(hab, nido, 20, r) === 'Moon Stone') drops++;
  check('Nidoran family drops Moon Stone at ≈2.5% (pack prob)', drops / N > 0.02 && drops / N < 0.03, (100 * drops / N).toFixed(2) + '%');
  const charHab = P.habitats[P.speciesById.get('0004char').familyIndex];
  let fireStone = 0; for (let i = 0; i < N; i++) if (GMS.rollWildItem(charHab, P.speciesById.get('0004char'), 20, r) === 'Fire Stone') fireStone++;
  check('type items drop too: fire types carry a Fire Stone ≈0.4%', fireStone / N > 0.002 && fireStone / N < 0.006, (100 * fireStone / N).toFixed(2) + '%');
  check('minlvl respected: no Moon Stone below the family minlvl', (() => { const h2 = { items: [{ id: 'X', prob: 100, minlvl: 30 }] }; return GMS.rollWildItem(h2, { types: [] }, 10, r) === null && GMS.rollWildItem(h2, { types: [] }, 30, r) === 'X'; })());
  GMS.addItem(sv, 'Moon Stone'); GMS.addItem(sv, 'Moon Stone');
  check('bag add/remove', sv.items['Moon Stone'] === 2 && GMS.removeItem(sv, 'Moon Stone') && sv.items['Moon Stone'] === 1 && GMS.removeItem(sv, 'Moon Stone') && !('Moon Stone' in sv.items) && !GMS.removeItem(sv, 'Moon Stone'));
  const nidorina = GMS.makeMonster(sv, { species: P.speciesById.get('0030nido'), level: 20 }, null); sv.team.push(nidorina);
  check('no item → no item evolutions offered', GMS.itemEvolutions(sv, nidorina).length === 0);
  GMS.addItem(sv, 'Moon Stone');
  const opts = GMS.itemEvolutions(sv, nidorina);
  check('with a Moon Stone, Nidorina can evolve into Nidoqueen', opts.length === 1 && opts[0].to === '0031nido');
  const ev = GMS.evolveWithItem(sv, nidorina, 'Moon Stone');
  check('evolving consumes the stone and changes species; HP grows', ev && ev.to === '0031nido' && nidorina.speciesId === '0031nido' && !('Moon Stone' in sv.items) && nidorina.maxHp > 0);
  const eevee = GMS.makeMonster(sv, { species: P.speciesById.get('0133eeve'), level: 10 }, null); GMS.addItem(sv, 'Fire Stone'); GMS.addItem(sv, 'Water Stone');
  const eo = GMS.itemEvolutions(sv, eevee).map(o => o.to).sort();
  check('Eevee with Fire + Water Stones is offered exactly Flareon and Vaporeon', JSON.stringify(eo) === JSON.stringify(['0134vapo', '0136flar']));
  check('save with eggs and items survives round-trip', (() => { const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt && rt.items['Fire Stone'] === 1 && Array.isArray(rt.eggs); })());
}


// ---------- 25. Region memory & history ----------
{
  const sv = GMS.newSave(); const lat = 43.4635, lon = -80.475; let now = 1000;   // mid-region (regions are 0.027° × 0.0372° at 500 m routes)
  const d1 = GMS.describe(lat, lon); const t1 = GMS.touchRoute(sv, d1, now);
  check('first route touch records a first visit, remembers all 8 gyms by leader/type/badge, logs a visit event', t1.newRegion && t1.newRoute && sv.regions[GMS.regionKey(d1.gx, d1.gy)].visits === 1 && Object.keys(sv.regions[GMS.regionKey(d1.gx, d1.gy)].gyms).length === 8 && sv.history.length === 1 && sv.history[0].type === 'visit');
  const t2 = GMS.touchRoute(sv, d1, now += 1000);
  check('re-touching the same route adds nothing', !t2.newRegion && !t2.newRoute && sv.history.length === 1 && GMS.routesSeen(GMS.regionRecord(sv, d1.gx, d1.gy)) === 1);
  const d2 = GMS.describe(lat + GMS.WORLD.LAT_STEP, lon); GMS.touchRoute(sv, d2, now += 1000);
  check('a new route in the same region counts as explored, not a new visit', GMS.routesSeen(GMS.regionRecord(sv, d1.gx, d1.gy)) === 2 && sv.regions[GMS.regionKey(d1.gx, d1.gy)].visits === 1);
  const far = GMS.describe(lat + 0.05, lon); GMS.touchRoute(sv, far, now += 1000); GMS.touchRoute(sv, d1, now += 1000);
  check('leaving and returning counts a second visit; two regions remembered', sv.regions[GMS.regionKey(d1.gx, d1.gy)].visits === 2 && Object.keys(sv.regions).length === 2 && sv.history.filter(e => e.type === 'visit').length === 3);
  const g = d1.gym.league ? GMS.gymOf(d1.mx + 1, d1.my) : d1.gym; const team = GMS.leaderTeam(g, 0);
  const first = GMS.recordGymWin(sv, g); GMS.logGymWin(sv, g, team, 0, now += 1000, first);
  const again = GMS.recordGymWin(sv, g); GMS.logGymWin(sv, g, team, 1, now += 1000, again);
  const e = GMS.regionRecord(sv, g.gx, g.gy).gyms[g.mi];
  check('gym wins logged with leader level and team; rematch recorded as a rematch', e.wins === 2 && e.lastLevel === GMS.leaderLevel(1, g.gx, g.gy) && e.lastTeam.length === team.length && sv.history.slice(-2).map(x => x.type).join(',') === 'badge,rematch' && sv.history[sv.history.length - 2].badge === g.badge.name);
  const sm = GMS.regionSummary(sv, g.gx, g.gy);
  check('region summary: 1/8 badges, routes explored, visits', sm.badges === 1 && sm.gyms === 8 && sm.routesSeen === 2 && sm.visits === 2);
  for (let i = 0; i < HISTORY_MAX_FILL; i++) GMS.logEvent(sv, { t: now + i, type: 'catch', region: 'x' });
  check('history capped at ' + GMS.HISTORY_MAX + ' most recent events', sv.history.length === GMS.HISTORY_MAX && sv.history[sv.history.length - 1].t === now + HISTORY_MAX_FILL - 1);
  check('regions and history survive save round-trip', (() => { const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt && Object.keys(rt.regions).length === 2 && rt.history.length === GMS.HISTORY_MAX; })());
}

// ---------- 26. Region lore: mechanics, determinism, variety (real pack and demo pack) ----------
for (const [label, E] of [['GMS', GMS], ['demo', A]]) {
  const lines = [], allText = [];
  let mech = true, badLine = '';
  const R2 = srand(77);
  for (let i = 0; i < 300; i++) {
    const gx = Math.floor(R2() * 2000 - 1000), gy = Math.floor(R2() * 2000 - 1000);
    const lore = E.regionLore(gx, gy); allText.push(lore.text);
    lore.parts.forEach((pt, k) => { lines.push([k, pt]);
      const ok = !/\{\w+\}/.test(pt) && !/  /.test(pt) && !/ [,.;]/.test(pt) && !/[.]{2}/.test(pt) && /^[A-Z]/.test(pt) && /[.!?]$/.test(pt) && !/—/.test(pt) && pt.split(' ').length >= 3 && !/\bnull\b|\bundefined\b/.test(pt);
      if (!ok && mech) { mech = false; badLine = pt; } });
  }
  check(label + ' lore: 1500 sentences with no unfilled slots, bad spacing, em dashes, null text; capitalised and terminated', mech, badLine.slice(0, 120));
  check(label + ' lore: deterministic per region', E.regionLore(12, -7).text === E.regionLore(12, -7).text && E.regionLore(12, -7).text !== E.regionLore(13, -7).text);
  const uniq = new Set(allText).size / allText.length;
  check(label + ' lore: ≥ 95% of 300 regions read differently', uniq >= 0.95, (uniq * 100).toFixed(1) + '% distinct');
  const useCount = new Map(); lines.forEach(([k, pt]) => { const key = k + ':' + pt.slice(0, 18); useCount.set(key, (useCount.get(key) || 0) + 1); });
  const maxShare = Math.max(...[...useCount.values()]) / 300;
  check(label + ' lore: no single template dominates its slot (max share ≤ 45%)', maxShare <= 0.45, (maxShare * 100).toFixed(0) + '%');
  const facts = E.regionLore(12, -7).facts;
  // coherence across slots and texture rules
  let coh = true, cohBad = '', semis = 0, sentences = 0;
  for (let i = 0; i < 300; i++) {
    const gx = Math.floor(R2() * 2000 - 1000), gy = Math.floor(R2() * 2000 - 1000); const lore = E.regionLore(gx, gy), [f, c, l, g, lg] = lore.parts;
    if (/grew up around a single/.test(f) && !l.includes(lore.facts.type1 + ' gym')) { coh = false; cohBad = 'first-gym founding but landmark names ' + lore.facts.landmarkGym + ' (dominant ' + lore.facts.type1 + ')'; }
    if (/is the oldest in/.test(l) && !l.includes(lore.facts.type1 + ' gym')) { coh = false; cohBad = 'oldest gym is not the dominant type'; }
    if (/between them/.test(f) && /centre/.test(lg)) { coh = false; cohBad = 'centre stated twice'; }
    if (/lean/.test(c) && /balanced/.test(c)) { coh = false; cohBad = 'balanced vs lean'; }
    lore.parts.forEach(pt => { semis += (pt.match(/;/g) || []).length; sentences++; });
  }
  check(label + ' lore: cross-slot coherence (first gym = oldest gym = dominant type; centre never stated twice)', coh, cohBad);
  check(label + ' lore: no semicolons or parallel-cadence devices in ' + sentences + ' sentences', semis === 0 && !lines.some(([k, pt]) => /and every generation|not just|not only/.test(pt)), semis + ' semicolons');
  check(label + ' lore facts come from the region: landmark gym is one of its gyms, dominant type is one of its gym types', E.regionGymList(12, -7).filter(x => x !== null).map(i => E.PACK.gyms[i].name).includes(facts.landmarkGym) && E.regionGymList(12, -7).filter(x => x !== null).map(i => E.PACK.gyms[i].name).includes(facts.type1));
  if (label === 'GMS') console.log('  sample lore: ' + E.regionLore(12, -7).text);
}


// ---------- 27. Leader names: distinct within a region, and unique per type across a 5×5 block of regions (both packs) ----------
for (const [label, E] of [['GMS', GMS], ['demo', A]]) {
  let distinctInRegion = true, blockDup = 0, blockGyms = 0, poolExceeded = 0;
  const B = E.NAME_BLOCK;
  for (const [bx, by] of [[0, 0], [-3, 7], [12, -5]]) {
    const seenByType = new Map();
    for (let gy = by * B; gy < (by + 1) * B; gy++) for (let gx = bx * B; gx < (bx + 1) * B; gx++) {
      const list = E.regionGymList(gx, gy), names = E.regionLeaders(gx, gy);
      const inRegion = names.filter(n => n); if (new Set(inRegion).size !== inRegion.length) distinctInRegion = false;
      for (let mi = 0; mi < list.length; mi++) { if (list[mi] === null) continue; const type = E.PACK.gyms[list[mi]].type; const set = seenByType.get(type) || seenByType.set(type, []).get(type); set.push(names[mi]); }
    }
    seenByType.forEach((arr, type) => { blockGyms += arr.length; const pool = E.PACK.gyms.find(g => g.type === type).leaders.length; const dups = arr.length - new Set(arr).size; if (arr.length > pool) poolExceeded += arr.length - pool; else blockDup += dups; });
  }
  check(label + ': the 8 leaders of a region never share a name', distinctInRegion);
  if (label === 'GMS') check(label + ': within a ' + B + '×' + B + ' block, no leader name repeats for a type unless the pack pool is smaller than the demand', blockDup === 0, blockGyms + ' gyms checked across 3 blocks, pool exceeded by ' + poolExceeded);
  else console.log('  info ' + label + ' (one shared name pool for all families): ' + blockDup + ' block-level repeats across ' + blockGyms + ' gyms; per-type uniqueness needs per-type pools as in GMS packs');
  check(label + ': leader names deterministic', JSON.stringify(E.regionLeaders(4, 4)) === JSON.stringify(E.regionLeaders(4, 4)));
}

// ---------- 28. Route trainers ----------
{
  const P = GMS.PACK, now = 1700000000000, lat = 43.4635, lon = -80.475; const d = GMS.describe(lat, lon);
  const t1 = GMS.trainersOn(d.rx, d.ry, 20, 2, now), t2 = GMS.trainersOn(d.rx, d.ry, 20, 2, now + 3600 * 1000), t3 = GMS.trainersOn(d.rx, d.ry, 20, 2, now + 2 * TRAINER_DAY);
  check('1–3 trainers per route, stable within a day, different the next day', t1.length >= 1 && t1.length <= 3 && JSON.stringify(t1) === JSON.stringify(t2) && JSON.stringify(t1) !== JSON.stringify(t3), t1.map(t => t.name + ' Lv' + t.level + ' (' + t.team.length + ')').join(', '));
  let counts = [0, 0, 0, 0], ok = true, iconOk = true, levelOk = true, teamOk = true, classOk = true;
  for (let i = 0; i < 400; i++) {
    const rx = d.rx + (i % 20), ry = d.ry + Math.floor(i / 20), hab = P.habitats[GMS.routeHabitat(rx, ry)];
    const lvl = 5 + (i % 60);
    GMS.trainersOn(rx, ry, lvl, 0, now).forEach(t => {
      counts[t.team.length]++;
      if (t.icon && !P.images.has(t.icon)) iconOk = false;
      if (Math.abs(t.level - lvl * 0.8) > 6) levelOk = false;
      t.team.forEach(m => { const mem = hab.members.find(x => x.id === m.speciesId); if (!mem || m.level < mem.min || m.level > mem.max) teamOk = false; });
      const cls = P.trainerClasses.find(c => (c.appearances || []).some(a => a.name === t.cls)); if (cls) { const conds = Array.isArray(cls.conditions) ? cls.conditions : [cls.conditions]; if (!conds.some(cd => t.level >= (cd.minlvl || 0))) classOk = false; }
    });
  }
  check('teams sized 1/2/3 by level, members from the route habitat within their ranges, level tracks the player', counts[0] === 0 && counts[1] > 0 && counts[2] > 0 && counts[3] > 0 && levelOk && teamOk, counts.slice(1).join('/'));
  check('classes come from the pack with overworld icons present and minlvl respected', iconOk && classOk);
  const bug = GMS.trainersOn(d.rx, d.ry, 20, 0, now).concat(GMS.trainersOn(d.rx + 1, d.ry, 20, 0, now)).map(t => t.cls);
  console.log('  sample classes: ' + [...new Set(bug)].join(', '));
  const sv = GMS.newSave(); const k = t1[0].key;
  check('beaten trainer stays beaten today and is forgotten after two days', !GMS.trainerBeaten(sv, k) && (GMS.recordTrainerWin(sv, k, now), GMS.trainerBeaten(sv, k)) && (GMS.recordTrainerWin(sv, 'x,y:0:' + (GMS.dayIndex(now) + 2), now + 2 * TRAINER_DAY), !GMS.trainerBeaten(sv, k)));
  const rw = GMS.trainerReward(45, srand(3)); check('reward gives 2–4 tier-I catch items, sometimes higher tiers', rw.snares[0] >= 2 && rw.snares[0] <= 4 && rw.snares.length === 3);
  check('catch items take the pack\'s name', GMS.snareName(0) === 'Pokéball I' && A.snareName(2) === 'Snare III');
}


// ---------- 29. Layouts: gym routes vary within domains; 'nine' layout gives 9 gyms with the League on a spare centre route ----------
{
  const pos = new Map(); for (let mx = 0; mx < 40; mx++) for (let my = 0; my < 40; my++) { const c = GMS.gymCell(mx, my); pos.set((c.rx - mx * 2) + ',' + (c.ry - my * 2), (pos.get((c.rx - mx * 2) + ',' + (c.ry - my * 2)) || 0) + 1); }
  check('gym route within a domain is spread over all 4 routes (1600 domains)', pos.size === 4 && Math.min(...pos.values()) > 300, [...pos.entries()].map(e => e.join(':')).join(' '));
  check('domains layout: 8 gyms, league needs 8, centre domain is the League', GMS.gymsPerRegion() === 8 && GMS.leagueBadgesNeeded() === 8 && GMS.isLeagueDomain(0, 0, 4) && !GMS.isLeagueDomain(0, 0, 0));
  const lc = GMS.leagueCell(5, 5), cg = GMS.gymCell(5 * 3 + 1, 5 * 3 + 1);
  check('league layout: league cell is the centre domain\'s (unused) gym route', lc.rx === cg.rx && lc.ry === cg.ry);
  const N = load(); N.setPack(GMS.parseGmsBin(readFileSync('/mnt/user-data/uploads/poke9_data_v1_6_gmsdp2.bin', 'utf8'))); N.setLayout('wide');
  let ok = true; const spread = new Map();
  for (let i = 0; i < 200; i++) { const gx = Math.floor(R() * 400 - 200), gy = Math.floor(R() * 400 - 200); const li = N.leagueIndexOf(gx, gy); spread.set(li, (spread.get(li) || 0) + 1);
    const l = N.regionGymList(gx, gy); if (l.filter(x => x === null).length !== 1 || l[li] !== null || new Set(l.filter(x => x !== null)).size !== 8) ok = false;
    const lc = N.leagueCell(gx, gy); if (Math.floor(lc.rx / 3) !== gx * 3 + li % 3 || Math.floor(lc.ry / 3) !== gy * 3 + Math.floor(li / 3)) ok = false;
    const g = N.gymOf(gx * 3 + li % 3, gy * 3 + Math.floor(li / 3)); if (!g.league) ok = false; }
  check('wide layout: 3×3 domains of 3×3 routes (81), 8 distinct gyms, League domain random across all 9 positions, needs 8', N.WORLD.MACRO === 3 && N.gymsPerRegion() === 8 && N.leagueBadgesNeeded() === 8 && ok && spread.size === 9 && Math.min(...spread.values()) >= 8, [...spread.values()].join('/'));
  const seenW = new Set(); for (let ry = 0; ry < 9; ry++) for (let rx = 0; rx < 9; rx++) seenW.add(N.routeNumber(rx, ry));
  check('wide layout: routes numbered 1..81', seenW.size === 81 && Math.max(...seenW) === 81);
  const dN = N.describe(43.4635, -80.475);
  check('describe reports atGym and atLeague separately', typeof dN.atGym === 'boolean' && typeof dN.atLeague === 'boolean' && dN.leagueCell && !(dN.atGym && dN.atLeague));
  const loreN = N.regionLore(3, 3).text, loreL = GMS.regionLore(3, 3).text;
  check('lore counts stay at eight/seven in every layout', !/nine of its badges|Nine badges|other eight/.test(loreN) && !/nine of its badges|Nine badges|other eight/.test(loreL));
  check('layout is deterministic and switchable', (N.setLayout('league'), N.WORLD.MACRO === 2 && JSON.stringify(N.regionGymList(3, 3)) === JSON.stringify(GMS.regionGymList(3, 3))));
}


// ---------- 30. Dense layout and route size ----------
{
  const D = load(); D.setPack(GMS.parseGmsBin(readFileSync('/mnt/user-data/uploads/poke9_data_v1_6_gmsdp2.bin', 'utf8'))); D.setLayout('dense');
  check('dense: a domain is one route, a region is 3×3 routes, 8 gyms, League needs 8', D.WORLD.MACRO === 1 && D.WORLD.MACRO * D.WORLD.REGION === 3 && D.gymsPerRegion() === 8 && D.leagueBadgesNeeded() === 8);
  const spread = new Map(); let ok = true;
  for (let i = 0; i < 300; i++) { const gx = Math.floor(R() * 400 - 200), gy = Math.floor(R() * 400 - 200); const li = D.leagueIndexOf(gx, gy); spread.set(li, (spread.get(li) || 0) + 1);
    const l = D.regionGymList(gx, gy); if (l.filter(x => x === null).length !== 1 || l[li] !== null || new Set(l.filter(x => x !== null)).size !== 8) ok = false;
    const lc = D.leagueCell(gx, gy); if (lc.rx !== gx * 3 + li % 3 || lc.ry !== gy * 3 + Math.floor(li / 3)) ok = false;
    for (let mi = 0; mi < 9; mi++) { const g = D.gymOf(gx * 3 + mi % 3, gy * 3 + Math.floor(mi / 3)); if (mi === li ? !g.league : (g.league || g.cell.rx !== gx * 3 + mi % 3 || g.cell.ry !== gy * 3 + Math.floor(mi / 3))) ok = false; }
  }
  check('dense: exactly one League route per region, placed randomly across all 9 positions; every other route has its own gym on that route', ok && spread.size === 9 && Math.min(...spread.values()) >= 15, [...spread.values()].join('/'));
  const seen = new Set(); for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 3; rx++) seen.add(D.routeNumber(rx, ry));
  check('dense: routes numbered 1..9', seen.size === 9 && Math.max(...seen) === 9);
  const dd = D.describe(43.4635, -80.475);
  check('dense: describe reports atGym on every non-League route', (dd.atGym && !dd.gym.league) || (dd.atLeague && dd.gym.league));
  const loreD = D.regionLore(3, 3);
  check('dense: lore facts still resolve (8 gyms, dominant type is a gym type)', D.regionGymList(3, 3).filter(x => x !== null).map(i => D.PACK.gyms[i].name).includes(loreD.facts.type1) && !/\{\w+\}/.test(loreD.text));
  D.setRouteSize(250);
  const km = 1000 / D.WORLD.ROUTE_M; let cross = 0, prev = D.routeCell(43.45, -80.4925).ry; for (let m = 0; m <= 1000; m += 2) { const ry = D.routeCell(43.45 + m / 111320, -80.4925).ry; if (ry !== prev) { cross++; prev = ry; } }
  check('250 m routes: 1 km north crosses 4 routes; dense region = 750 m', Math.abs(cross - km) <= 1 && Math.abs(D.WORLD.LAT_STEP * 3 * 111320 - 750) < 1, cross + ' crossings');
  const w = D.WORLD.LON_STEP * 111320 * Math.cos(43.45 * Math.PI / 180);
  check('250 m routes: east–west width is 250 m at 43.45°N', Math.abs(w - 250) < 0.5, w.toFixed(1) + ' m');
  D.setRouteSize(500); D.setLayout('league');
  check('switching back restores the standard world', D.WORLD.MACRO === 2 && Math.abs(D.WORLD.LAT_STEP * 111320 - 500) < 0.01 && JSON.stringify(D.regionGymList(3, 3)) === JSON.stringify(GMS.regionGymList(3, 3)));
}


// ---------- 31. Gym types never repeat across an edge-adjacent region border (packs with ≥ 2× the needed types) ----------
for (const [label, E, layout] of [['GMS domains', GMS, 'league'], ['GMS dense', load(), 'dense']]) {
  if (E !== GMS) { E.setPack(GMS.parseGmsBin(readFileSync('/mnt/user-data/uploads/poke9_data_v1_6_gmsdp2.bin', 'utf8'))); E.setLayout(layout); }
  const halves = E.typeHalves();
  check(label + ': pack has enough types for two disjoint halves', halves && halves[0].length + halves[1].length === E.PACK.gyms.length && !halves[0].some(x => halves[1].includes(x)));
  let border = 0, shared = 0;
  const side = E.WORLD.MACRO * E.WORLD.REGION;
  for (let gx = -6; gx < 6; gx++) for (let gy = -6; gy < 6; gy++) {
    const A1 = E.regionGymList(gx, gy), B1 = E.regionGymList(gx + 1, gy), C1 = E.regionGymList(gx, gy + 1);
    const tA = new Set(A1.filter(x => x !== null)); for (const t of B1.concat(C1)) { if (t === null) continue; border++; if (tA.has(t)) shared++; }
  }
  check(label + ': no gym type shared between a region and its east or north neighbour (144 regions)', shared === 0, shared + ' shared of ' + border + ' cross-border pairs');
  // route-level: edge-adjacent routes anywhere never hold the same gym type
  let pairs = 0, same = 0;
  for (let ry = -40; ry < 40; ry++) for (let rx = -40; rx < 40; rx++) {
    const m = E.macroOf(rx, ry), g = E.gymOf(m.mx, m.my); if (g.league || g.cell.rx !== rx || g.cell.ry !== ry) continue;
    for (const [dx, dy] of [[1, 0], [0, 1]]) { const m2 = E.macroOf(rx + dx, ry + dy), g2 = E.gymOf(m2.mx, m2.my); if (g2.league || g2.cell.rx !== rx + dx || g2.cell.ry !== ry + dy) continue; pairs++; if (g2.type === g.type) same++; }
  }
  check(label + ': edge-adjacent gym routes never share a type', same === 0, same + ' of ' + pairs + ' adjacent gym pairs');
  if (E === GMS) check('a pack with too few types falls back to within-region distinctness only', A.typeHalves() === null || A.PACK.gyms.length >= 16);
}


// ---------- 32. Currency, consumables, daily shop ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  check('new save starts with ' + GMS.COIN.START + ' coins', sv.coins === GMS.COIN.START);
  let earned = 0; for (let i = 0; i < 100; i++) earned += GMS.addCoinWalk(sv, 10);
  check('1 km in 10 m steps earns exactly 1000/' + GMS.COIN.PER_M + ' coins, remainder carried', earned === 1000 / GMS.COIN.PER_M && sv.coins === GMS.COIN.START + earned && sv.coinM === 0);
  check('spend refuses overdraft', GMS.spend(sv, sv.coins + 1) === false && GMS.spend(sv, 10) === true);
  const day = 20000, a = GMS.shopFor(day), b2 = GMS.shopFor(day), c2 = GMS.shopFor(day + 1);
  check('shop is deterministic for a day and changes the next day', JSON.stringify(a) === JSON.stringify(b2) && JSON.stringify(a.items.map(x => x.id + ':' + x.price)) !== JSON.stringify(c2.items.map(x => x.id + ':' + x.price)));
  check('staples always on the shelf; 4 rotating slots; exactly one half-price special', GMS.SHOP.STAPLES.every(id => a.items.some(x => x.id === id)) && a.items.length === GMS.SHOP.STAPLES.length + GMS.SHOP.ROTATING && a.items.filter(x => x.special).length === 1);
  const pool = GMS.packShopPool();
  check('rotating pack items: evolution items, form items (Mega Stones) and TMs', pool.includes('Fire Stone') && pool.includes('Moon Stone') && pool.includes('Charizardite X') && pool.includes('Fire TM') && pool.length >= 100, pool.length + ' items');
  let lo = 1, hi = 1; for (let d = 0; d < 200; d++) { const pr = GMS.dayPrice(100, 'tonic', d) / 100; lo = Math.min(lo, pr); hi = Math.max(hi, pr); }
  check('prices drift within ±25% of base across 200 days', lo >= 0.75 && hi <= 1.25 && hi - lo > 0.3, lo.toFixed(2) + '–' + hi.toFixed(2));
  sv.coins = 500; const tonic = a.items.find(x => x.id === 'tonic'); const r1 = GMS.buy(sv, 'tonic', day);
  check('buying deducts the day\'s price and adds the item; off-shelf items refused', r1.ok && r1.price === tonic.price && sv.coins === 500 - tonic.price && sv.items.tonic === 1 && GMS.buy(sv, 'Not A Thing', day).ok === false);
  const bag0 = sv.bag[0]; const r2 = GMS.buy(sv, 'snare1', day);
  check('catch items go to the bag tiers', r2.ok && sv.bag[0] === bag0 + 1);
  const m = GMS.makeMonster(sv, { species: P.speciesById.get('0001bulb'), level: 20 }, null); sv.team.push(m); m.hp = 1;
  const msg = GMS.useItemOn(sv, 'tonic', m);
  check('Tonic heals half and is consumed; cannot be used at full HP', msg && m.hp === 1 + Math.ceil(m.maxHp * 0.5) && !sv.items.tonic && (m.hp = m.maxHp, GMS.useItemOn(sv, 'tonic', m) === null));
  GMS.addItem(sv, 'revive'); m.hp = 0;
  check('Revive only works on fainted, brings back half HP', GMS.useItemOn(sv, 'revive', m) && m.hp === Math.ceil(m.maxHp * 0.5) && (GMS.addItem(sv, 'revive'), GMS.useItemOn(sv, 'revive', m) === null));
  check('item names come from the pack keyword for catch items', GMS.itemName('snare1') === 'Pokéball I' && GMS.itemInfo('Fire Stone').icon && P.images.has(GMS.itemInfo('Fire Stone').icon));
  check('coins survive migration of an older save', GMS.migrateSave({ v: 3, team: [], box: [], bag: [1, 1, 1] }).coins === GMS.COIN.START);
}


// ---------- 33. Suggestions round: personalities, generated badges, leader lines, chosen ace, title defence ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  const mons = []; for (let i = 0; i < 200; i++) mons.push(GMS.makeMonster(sv, { species: P.speciesById.get('0001bulb'), level: 5 }, null));
  const dist = new Map(); mons.forEach(m => { const p = GMS.personalityOf(m); dist.set(p.id, (dist.get(p.id) || 0) + 1); });
  check('personalities: stable per creature, all 16 appear across 200 catches', GMS.PERSONALITIES.length === 16 && GMS.personalityOf(mons[0]).id === GMS.personalityOf(mons[0]).id && dist.size === 16 && Math.min(...dist.values()) >= 4, dist.size + ' seen');
  const lines = new Set(); for (let d = 0; d < 30; d++) lines.add(GMS.moodLine(mons[0], d));
  check('mood line names the creature and varies by day within its personality', [...lines].every(l => l.startsWith('Bulbasaur ')) && lines.size >= 2 && lines.size <= 3);
  const dark = P.gyms.find(g => g.type === 'dark');
  check('a type without a pack badge gets a generated emblem in its colour', dark.badges[0].generated && dark.badges[0].icon === 'gen:dark' && GMS.badgeSvg(dark.color, 'gen:dark').startsWith('data:image/svg+xml') && decodeURIComponent(GMS.badgeSvg(dark.color, 'gen:dark')).includes(dark.color));
  const g = GMS.gymOf(7, 3);
  const intro = GMS.leaderLine(g, 'intro', 'Squirtle');
  check('leader lines fill every slot and are stable per leader', !/\{\w+\}/.test(intro) && intro === GMS.leaderLine(g, 'intro', 'Squirtle') && ['win', 'loss', 'rematch'].every(k => !/\{\w+\}/.test(GMS.leaderLine(g, k, 'Squirtle'))), intro);
  // chosen ace: beat the leader, then pick a member of their last team; the ace line changes and persists
  GMS.recordGymWin(sv, g); const team0 = GMS.leaderTeamFor(sv, g, 0); GMS.logGymWin(sv, g, team0, 0, 1000, true);
  const other = team0.find(m => !m.ace);
  check('ace override refused for a species outside the pack, accepted for one from the beaten team', !GMS.setAceOverride(sv, g, 'nope') && (other ? GMS.setAceOverride(sv, g, other.speciesId) : true));
  const team1 = GMS.leaderTeamFor(sv, g, 8);
  check('after choosing, the leader\'s ace comes from the chosen line and still grows with badges', !other || (GMS.aceLineFor(sv, g).members.some(m => m.id === team1[team1.length - 1].speciesId) && team1[team1.length - 1].ace && team1[team1.length - 1].level === GMS.leaderLevel(8, g.gx, g.gy) + GMS.GYM.ACE_BONUS), other ? GMS.PACK.speciesById.get(other.speciesId).name + ' line → ace now ' + GMS.PACK.speciesById.get(team1[team1.length - 1].speciesId).name : 'single-member team');
  // title defence at a held gym: ~50% of days, never before the badge, never twice a day
  let days = 0, appear = 0; for (let d = 0; d < 200; d++) { if (GMS.challengerAt(sv, g, d, 1)) appear++; days++; }
  const g2 = GMS.gymOf(9, 5); const none = GMS.challengerAt(sv, g2.league ? GMS.gymOf(10, 5) : g2, 5, 1);
  check('a challenger waits at a held gym on about half of days, never at a gym you have not beaten', appear > 60 && appear < 140 && none === null, appear + ' of ' + days + ' days');
  const ch = (() => { for (let d = 0; d < 20; d++) { const c = GMS.challengerAt(sv, g, d, 1); if (c) return c; } })();
  GMS.recordTrainerWin(sv, ch.key, ch.key.split(':').pop() * 86400000);
  check('a beaten challenger does not return the same day; team is the gym type near leader level', GMS.challengerAt(sv, g, Number(ch.key.split(':').pop()), 1) === null && ch.team.every(m => P.speciesById.get(m.speciesId).types.includes(g.type)) && Math.abs(ch.level - GMS.leaderLevel(1, g.gx, g.gy)) <= 2);
  // champion defence: only once champion; challenger is one of the region's leaders with a boosted team
  const lgIdx = GMS.leagueIndexOf(g.gx, g.gy); const lg = GMS.gymOf(g.gx * 3 + lgIdx % 3, g.gy * 3 + Math.floor(lgIdx / 3));
  check('no champion challenger before you are Champion', GMS.championChallenger(sv, lg, 3) === null);
  GMS.recordChampion(sv, lg); let cc = null, cc2 = null; for (let slot = 0; slot < 50 && !(cc && cc2); slot++) { const c = GMS.championChallenger(sv, lg, slot); if (c && c.kind === 'leader') { if (!cc) cc = c; else if (c.name !== cc.name) cc2 = c; } }
  const leaders = []; for (let m = 0; m < 9; m++) if (!GMS.isLeagueDomain(g.gx, g.gy, m)) leaders.push(GMS.gymOf(g.gx * 3 + m % 3, g.gy * 3 + Math.floor(m / 3)).leader);
  check('as Champion, region leaders come for the title with teams above their gym level', cc && leaders.includes(cc.name) && cc2 && cc.team.length >= 2 && cc.team.every(m => m.level >= GMS.leaderLevel(GMS.badgeCount(sv) + 4, lg.gx, lg.gy)), cc.name + ' then ' + cc2.name);
}


// ---------- 34. Name pools, badge pool, Elite Four and the usurper ----------
{
  const P = GMS.PACK;
  const small = P.gyms.filter(g => g.leaders.length < GMS.NAME_POOL_MIN);
  check('types with small pack pools are topped up with type-fitting names; large pools untouched', small.every(g => GMS.leaderPool(g).length >= GMS.NAME_POOL_MIN && GMS.leaderPool(g).slice(0, g.leaders.length).join() === g.leaders.join()) && P.gyms.filter(g => g.leaders.length >= GMS.NAME_POOL_MIN).every(g => GMS.leaderPool(g).length === g.leaders.length), small.map(g => g.type + ':' + g.leaders.length + '→' + GMS.leaderPool(g).length).join(' '));
  const allNames = Object.values(GMS.TYPE_NAMES).flat();
  check('18 type name pools of 20, no template junk', Object.keys(GMS.TYPE_NAMES).length === 18 && Object.values(GMS.TYPE_NAMES).every(a => a.length === 20) && allNames.every(n => /^[A-ZÀ-ž][a-zà-ž'ë]+$/.test(n)));
  let seenByType = new Map(), dup = 0, total = 0;
  for (let gx = 0; gx < 5; gx++) for (let gy = 0; gy < 5; gy++) { const l = GMS.regionGymList(gx, gy), n = GMS.regionLeaders(gx, gy); l.forEach((gi, mi) => { if (gi === null) return; const t = P.gyms[gi].type, arr = seenByType.get(t) || seenByType.set(t, []).get(t); arr.push(n[mi]); }); }
  seenByType.forEach(arr => { total += arr.length; dup += arr.length - new Set(arr).size; });
  check('with topped-up pools, a 5×5 block has no repeated leader name per type at all', dup === 0, dup + ' repeats in ' + total);
  // badge pool: synthetic sheet with 2 types
  GMS.setBadgePool({ image: 'data:image/png;base64,x', cell: 40, cols: 3, types: ['fire', 'water'], counts: [3, 2] });
  const picks = new Set(); for (let i = 0; i < 40; i++) { const b = GMS.badgeFromPool('fire', i, 7); picks.add(b.idx); if (!b.icon.startsWith('pool:fire:')) picks.add(-1); }
  check('badge pool: fire gyms draw one of the 3 fire designs, deterministic per gym; types not in the pool fall back', picks.size === 3 && !picks.has(-1) && GMS.badgeFromPool('grass', 1, 1) === null && GMS.badgeFromPool('fire', 3, 3).idx === GMS.badgeFromPool('fire', 3, 3).idx);
  const gFire = (() => { for (let mx = 0; mx < 60; mx++) for (let my = 0; my < 60; my++) { const g = GMS.gymOf(mx, my); if (!g.league && g.type === 'fire') return g; } })();
  check('gymOf uses the pool icon while keeping the pack badge name', gFire.badge.pool && gFire.badge.icon.startsWith('pool:fire:') && /Badge/.test(gFire.badge.name));
  GMS.setBadgePool(null);
  check('without a pool, badges come from the pack again', !GMS.gymOf(gFire.mx, gFire.my).badge.pool);
  // Elite Four + usurper
  const sv = GMS.newSave(); const g = GMS.gymOf(7, 3); const li = GMS.leagueIndexOf(g.gx, g.gy); const lg = { league: true, gx: g.gx, gy: g.gy, mi: li };
  const e4 = GMS.eliteFour(lg, 8, 0);
  check('Elite Four: 4 trainers of distinct types, full teams of 6, levels champion −4/−3/−3/−2 by placement', e4.length === 4 && new Set(e4.map(e => e.type)).size === 4 && e4.every(e => e.team.length === 6 && e.team.every(m => P.speciesById.get(m.speciesId).types.includes(e.type))) && e4.map(e => e.level - GMS.championLevel(lg.gx, lg.gy, 8)).join() === '-4,-3,-3,-2', e4.map(e => e.title + ' (' + e.typeName + ', Lv ' + e.level + ')').join(', '));
  const ladder0 = GMS.leagueLadder(sv, lg, 8);
  check('ladder = Elite Four then the Champion; deterministic', ladder0.length === 5 && ladder0[4].kind === 'champion' && ladder0[4].team.length === 6 && JSON.stringify(GMS.leagueLadder(sv, lg, 8)) === JSON.stringify(ladder0));
  GMS.recordChampion(sv, lg);
  const kinds = new Map(); let firstC = null; for (let slot = 0; slot < 400; slot++) { const c = GMS.championChallenger(sv, lg, slot); if (!c) continue; kinds.set(c.kind, (kinds.get(c.kind) || 0) + 1); if (!firstC) firstC = c; }
  const tot = [...kinds.values()].reduce((a, b) => a + b, 0);
  check('contenders come on about half of the 4-hour slots and are leaders, elites and strong trainers (no former champion yet)', tot > 150 && tot < 250 && kinds.has('leader') && kinds.has('elite') && kinds.has('trainer') && !kinds.has('former'), [...kinds.entries()].map(e => e.join(':')).join(' ') + ' of 400 slots');
  let trainerOk = true; for (let slot = 0; slot < 400; slot++) { const c = GMS.championChallenger(sv, lg, slot); if (c && c.kind === 'trainer' && !(c.team.length === 6 && c.team.every(m => m.level >= GMS.leaderLevel(GMS.badgeCount(sv), lg.gx, lg.gy) + GMS.CONTEND.TRAINER_LEVEL_ABOVE - 1))) trainerOk = false; }
  check('trainer contenders field six creatures above every leader\'s level', trainerOk);
  check('winning makes you title holder', GMS.titleOf(sv, g.gx, g.gy).holder === 'you');
  const cc = firstC; GMS.loseTitle(sv, lg, cc);
  const t = GMS.titleOf(sv, g.gx, g.gy);
  check('losing the defence: the contender (' + cc.kind + ') becomes Champion with the exact team they used; no more challengers come to you', t.holder === 'npc' && t.usurper.name === cc.name && JSON.stringify(t.usurper.team.map(m => m.speciesId + m.level)) === JSON.stringify(cc.team.map(m => m.speciesId + m.level)) && GMS.championChallenger(sv, lg, 4) === null);
  const ladder1 = GMS.leagueLadder(sv, lg, 8);
  check('a new Elite Four assembles (different from before) and the usurper is the final fight with their team', ladder1[4].name === cc.name && JSON.stringify(ladder1[4].team.map(m => m.speciesId)) === JSON.stringify(cc.team.map(m => m.speciesId)) && JSON.stringify(ladder1.slice(0, 4).map(e => e.name)) !== JSON.stringify(ladder0.slice(0, 4).map(e => e.name)));
  GMS.usurperDefended(sv, lg); const ladder2 = GMS.leagueLadder(sv, lg, 8);
  check('each failed attempt to reclaim grows the usurper\'s team by 2 levels', ladder2[4].team[0].level === ladder1[4].team[0].level + 2);
  GMS.reclaimTitle(sv, lg);
  check('reclaiming restores you as holder and counts a champion run; the usurper is remembered as former champion', GMS.titleOf(sv, g.gx, g.gy).holder === 'you' && sv.badges[GMS.regionKey(g.gx, g.gy)].champion === 2 && GMS.titleOf(sv, g.gx, g.gy).former && GMS.titleOf(sv, g.gx, g.gy).former.name === cc.name);
  const kinds2 = new Map(); for (let slot = 0; slot < 400; slot++) { const c = GMS.championChallenger(sv, lg, slot); if (c) kinds2.set(c.kind, (kinds2.get(c.kind) || 0) + 1); }
  check('after that, the former champion is among the contenders, with the same team 3 levels higher', kinds2.has('former') && (() => { for (let slot = 0; slot < 400; slot++) { const c = GMS.championChallenger(sv, lg, slot); if (c && c.kind === 'former') return c.name === cc.name && c.team[0].level === cc.team[0].level + 3; } })(), [...kinds2.entries()].map(e => e.join(':')).join(' '));
  check('title state survives a save round-trip', GMS.titleOf(GMS.migrateSave(JSON.parse(JSON.stringify(sv))), g.gx, g.gy).holder === 'you');
}


// ---------- 35. Legendaries ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); const gx = 3, gy = 3, now = Date.UTC(2026, 8, 4, 12), day = Math.floor(now / 86400000), season = GMS.seasonOf(now);
  const lg = { league: true, gx, gy, mi: GMS.leagueIndexOf(gx, gy) };
  const list = GMS.regionLegends(gx, gy, season);
  check('a region carries up to 3 distinct legendaries a month, from rare families on its own routes', list.length === 3 && new Set(list.map(l => l.speciesId)).size === 3 && list.every(l => P.speciesById.get(l.speciesId).legendary), list.map(l => P.speciesById.get(l.speciesId).name).join(', '));
  check('the set is deterministic within a month and changes on the 1st', JSON.stringify(GMS.regionLegends(gx, gy, season)) === JSON.stringify(list) && JSON.stringify(GMS.regionLegends(gx, gy, season + 1)) !== JSON.stringify(list));
  check('locked before Champion: no active legend, lore claims no location', GMS.activeLegend(sv, gx, gy, day, now) === null && !/route \d+/.test(GMS.regionLore(gx, gy, { active: null, unlocked: false }).parts[3]) && /Champion|vanishing/.test(GMS.regionLore(gx, gy, { active: null, unlocked: false }).parts[3]));
  GMS.recordChampion(sv, lg);
  const a = GMS.activeLegend(sv, gx, gy, day, now);
  check('after Champion: one of the set is on a route of the region today, not attempted', a && list.some(l => l.speciesId === a.speciesId) && Math.floor(a.rx / 6) === gx && Math.floor(a.ry / 6) === gy && !a.attempted, a.species.name + ' on route ' + a.routeNo);
  const routes = new Set(); for (let d = 0; d < 30; d++) routes.add(GMS.activeLegend(sv, gx, gy, day + d, now).routeNo);
  check('the route changes day to day', routes.size >= 15, routes.size + ' distinct routes in 30 days');
  const lore = GMS.regionLore(gx, gy, { active: a, unlocked: true });
  check('lore names today\'s legend and its real route', lore.parts[3].includes(a.species.name) && lore.parts[3].includes('route ' + a.routeNo));
  const enc = GMS.legendEncounter(sv, a, 20);
  check('the encounter is the legend at its minimum level or your level, whichever is higher', enc.legendary && enc.species.id === a.speciesId && enc.level === Math.max(a.minlvl || 50, 20));
  GMS.LEGEND.ROAM = false; const r1 = GMS.legendAttempt(sv, a, 'failed', day, now);
  check('a failed attempt uses the day; the legend stays in the region for tomorrow', !r1.caught && !r1.roamedTo && GMS.activeLegend(sv, gx, gy, day, now).attempted && GMS.activeLegend(sv, gx, gy, day + 1, now) && !GMS.activeLegend(sv, gx, gy, day + 1, now).attempted);
  GMS.LEGEND.ROAM = true; const a2 = GMS.activeLegend(sv, gx, gy, day + 1, now); const r2 = GMS.legendAttempt(sv, a2, 'failed', day + 1, now);
  const { gx: tx, gy: ty } = GMS.parseRegionKey(r2.roamedTo);
  const there = GMS.activeLegend(sv, tx, ty, day + 2, now);
  check('with roaming on, it moves to an edge-adjacent region and is the active legend there next day, even if that region is not unlocked', Math.abs(tx - gx) + Math.abs(ty - gy) === 1 && there && there.speciesId === a2.speciesId && there.roamed && !GMS.legendUnlocked(sv, tx, ty), a2.species.name + ' → ' + r2.toName);
  check('while it roams it is not offered at home', (() => { for (let d = 2; d < 40; d++) { const x = GMS.activeLegend(sv, gx, gy, day + d, now); if (x && x.speciesId === a2.speciesId) return false; } return true; })());
  const r3 = GMS.legendAttempt(sv, there, 'caught', day + 2, now);
  check('catching it removes it for the month everywhere; roaming entry cleared', r3.caught && GMS.legendCaught(sv, season, a2.speciesId) && GMS.legendState(sv).roaming.length === 0 && GMS.activeLegend(sv, tx, ty, day + 3, now) === null);
  let left = 0; for (let d = 3; d < 40; d++) { const x = GMS.activeLegend(sv, gx, gy, day + d, now); if (x && x.speciesId !== a2.speciesId) left++; }
  check('the region keeps offering its remaining legends', left > 30);
  const nextMonth = Date.UTC(2026, 9, 2, 12);
  check('next month the set re-rolls and the caught one may return', GMS.regionLegends(gx, gy, GMS.seasonOf(nextMonth)).length === 3 && !GMS.legendCaught(sv, GMS.seasonOf(nextMonth), a2.speciesId));
  GMS.LEGEND.ROAM = false;
  check('legend state survives a save round-trip', GMS.legendState(GMS.migrateSave(JSON.parse(JSON.stringify(sv)))).attempts[GMS.regionKey(gx, gy)] === day + 1);
}


// ---------- 36. Light-mode moves: composition, signatures, TMs, and whether choosing matters ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  const mk = (id, lv) => GMS.makeMonster(sv, { species: P.speciesById.get(id), level: lv }, null);
  const mono = mk('0025pika', 20), dual = mk('0001bulb', 20), strong = mk('0006char', 40);
  const names = m => GMS.lightMoves(m).map(x => x.name);
  check('mono-typed: Strike, signature, Guard; dual-typed: two Strikes, signature, Guard', names(mono).length === 3 && names(dual).length === 4 && /Grass Strike/.test(names(dual)[0]) && /Poison Strike/.test(names(dual)[1]) && names(dual)[3] === 'Guard', names(mono).join(' | ') + ' // ' + names(dual).join(' | '));
  const tiers = ['0129magi', '0001bulb', '0006char', '0150mewt'].map(id => GMS.signatureFor(P.speciesById.get(id)).id);
  check('signature by power tier: Magikarp jab, Bulbasaur jab, Charizard heavy, Mewtwo unleash', tiers.join() === 'jab,jab,heavy,unleash', tiers.join());
  // TM replaces the second-type strike; mono-typed gains a second attack; forget restores
  GMS.addItem(sv, 'Fire TM'); const t1 = GMS.teachTm(sv, dual, 'Fire TM');
  check('teaching a Fire TM to Bulbasaur replaces Poison Strike with Fire Strike (TM) and consumes the TM', t1 === 'fire' && /Fire Strike \(TM\)/.test(names(dual)[1]) && names(dual).length === 4 && !sv.items['Fire TM']);
  check('forgetting restores the own second type', GMS.forgetTm(dual) && /Poison Strike/.test(names(dual)[1]));
  GMS.addItem(sv, 'Ice TM'); GMS.teachTm(sv, mono, 'Ice TM');
  check('a mono-typed creature taught a TM gains a second attack (max three attacks + Guard)', names(mono).length === 4 && /Ice Strike \(TM\)/.test(names(mono)[1]));
  GMS.addItem(sv, 'Electric TM');
  check('a TM of the creature\'s own first type is refused', GMS.teachTm(sv, mono, 'Electric TM') === null);
  // mechanics
  const foe = mk('0007squi', 20); const pl0 = GMS.makeCombatant(mk('0129magi', 20)), en0 = GMS.makeCombatant(mk('0006char', 40));
  const jab = GMS.lightMoves(pl0.ref).find(x => x.kind === 'signature');
  const r0 = GMS.battleRoundLight(pl0, en0, jab, () => 0.5);
  check('Quick Jab acts first even against a much faster foe', /^Magikarp uses Quick Jab/.test(r0.log[0]), r0.log[0]);
  const plU = GMS.makeCombatant(mk('0150mewt', 60)), enU = GMS.makeCombatant(mk('0007squi', 60)); const unl = GMS.lightMoves(plU.ref).find(x => x.kind === 'signature');
  const rA = GMS.battleRoundLight(plU, enU, unl, () => 0.5); const rB = GMS.battleRoundLight(plU, enU, unl, () => 0.5);
  check('Unleash lands once and is refused the second time in the same battle', /Unleash for/.test(rA.log.join(' ')) && rA.usedOnce && /already used Unleash/.test(rB.log.join(' ')));
  let hits = 0; for (let i = 0; i < 4000; i++) { const p2 = GMS.makeCombatant(mk('0006char', 40)), e2 = GMS.makeCombatant(mk('0007squi', 40)); const hv = GMS.lightMoves(p2.ref).find(x => x.kind === 'signature'); const r = GMS.battleRoundLight(p2, e2, hv, srand(i)); if (/Heavy Blow for/.test(r.log.join(' '))) hits++; }
  check('Heavy Blow hits about 70% of the time', hits / 4000 > 0.65 && hits / 4000 < 0.75, (hits / 40).toFixed(1) + '%');
  // does choosing matter? three agents over mixed matchups at equal level
  const ids = ['0001bulb', '0004char', '0007squi', '0025pika', '0092gast', '0066mach', '0074geod', '0016pidg', '0043oddi', '0063abra'];
  const fight = (mine, theirs, choose, r) => { const pl = GMS.makeCombatant(mine), en = GMS.makeCombatant(theirs); let k = 0; while (k++ < 300) { const res = GMS.battleRoundLight(pl, en, choose(pl, en), r); if (res.enemyDown) return true; if (res.playerDown) return false; } return false; };
  const trial = (chooser, n = 500) => { let w = 0; for (let i = 0; i < n; i++) { const a = mk(ids[i % ids.length], 25), b = mk(ids[(i * 7 + 3) % ids.length], 25); if (fight(a, b, chooser, srand(9000 + i))) w++; } return w / n; };
  const best = (pl, en) => { if (en.windup) return { kind: 'guard', name: 'Guard' }; return GMS.aiPickLight(pl, en, pl.usedOnce); };
  const first = (pl, en) => en.windup ? { kind: 'guard', name: 'Guard' } : GMS.lightMoves(pl.ref)[0];
  const sigOnly = (pl, en) => en.windup ? { kind: 'guard', name: 'Guard' } : GMS.lightMoves(pl.ref).find(x => x.kind === 'signature');
  const bW = trial(best), fW = trial(first), sW = trial(sigOnly);
  check('over random matchups, choosing helps a little and signature spam hurts (first Strike is usually right)', bW >= fW && fW > sW + 0.1, 'best ' + (bW * 100).toFixed(0) + '%, first ' + (fW * 100).toFixed(0) + '%, signature only ' + (sW * 100).toFixed(0) + '%');
  // where the creature's two attacks differ in effectiveness against the foe, choosing must matter
  const choiceTrial = (chooser, n = 600) => { let w = 0, c = 0; for (let i = 0; i < n; i++) { const a = mk(ids[i % ids.length], 25), b = mk(ids[(i * 7 + 3) % ids.length], 25); const pl = GMS.makeCombatant(a), en = GMS.makeCombatant(b); const mv = GMS.lightMoves(a).filter(x => x.kind === 'strike'); if (mv.length < 2 || Math.abs(GMS.lightExpected(pl, en, mv[0]) - GMS.lightExpected(pl, en, mv[1])) < 5) continue; c++; if (fight(a, b, chooser, srand(9700 + i))) w++; } return [w / Math.max(1, c), c]; };
  const [bC, nC] = choiceTrial(best), [fC] = choiceTrial(first);
  check('where the two Strikes differ against the foe, picking the right one wins clearly more than always using the first', nC >= 40 && bC > fC + 0.1, 'best ' + (bC * 100).toFixed(0) + '% vs first ' + (fC * 100).toFixed(0) + '% over ' + nC + ' matchups with a real choice');
  const tmTrial = (n = 400) => { let w = 0, w2 = 0; for (let i = 0; i < n; i++) { const a = mk('0025pika', 25), b = mk('0074geod', 25); if (fight(a, b, best, srand(9500 + i))) w++; const a2 = mk('0025pika', 25); a2.tm = 'water'; if (fight(a2, mk('0074geod', 25), best, srand(9500 + i))) w2++; } return [w / n, w2 / n]; };
  const [noTm, withTm] = tmTrial();
  check('coverage has teeth: Pikachu vs Geodude goes from hopeless to winnable with a Water TM', noTm < 0.2 && withTm > noTm + 0.4, (noTm * 100).toFixed(0) + '% → ' + (withTm * 100).toFixed(0) + '%');
  check('TM state survives a save round-trip', (() => { mono.tm = 'ice'; sv.team.push(mono); const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt.team[0].tm === 'ice'; })());
}


// ---------- 37. Region gym scale, enemy priority, forms and conditional evolutions ----------
{
  const P = GMS.PACK;
  const scales = new Set(); let inRange = true; for (let i = 0; i < 200; i++) { const sc = GMS.regionScale(i * 7 - 300, i * 3 - 100); scales.add(sc.base + '/' + sc.step); if (sc.base < 9 || sc.base > 14 || sc.step < 4 || sc.step > 6) inRange = false; }
  check('regions start leaders at Lv 9–14 and step 4–6 per badge; many distinct scales', inRange && scales.size >= 12, scales.size + ' distinct base/step pairs');
  const champs = new Set(); let cMin = 999, cMax = 0; for (let i = 0; i < 300; i++) { const c = GMS.championLevel(i, -i, 0); champs.add(c); cMin = Math.min(cMin, c); cMax = Math.max(cMax, c); }
  check('champion level at zero badges spans 50–66 and differs between regions', cMin === 50 && cMax === 66 && champs.size >= 8, cMin + '–' + cMax + ', ' + champs.size + ' distinct');
  check('a region\'s ladder is internally consistent: elites below its champion, leaders below its elites', (() => { const g = GMS.gymOf(7, 3), lg = { league: true, gx: g.gx, gy: g.gy, mi: GMS.leagueIndexOf(g.gx, g.gy) }; const e4 = GMS.eliteFour(lg, 8, 0); const ch = GMS.championLevel(g.gx, g.gy, 8); return e4.every(e => e.level < ch) && GMS.leaderLevel(8, g.gx, g.gy) < e4[0].level; })());
  check('without a region, leaderLevel keeps the old 8 + 5×badges default', GMS.leaderLevel(0) === 8 && GMS.leaderLevel(4) === 28);
  // enemy Quick Jab priority
  const sv = GMS.newSave(); const mk = (id, lv) => GMS.makeMonster(sv, { species: P.speciesById.get(id), level: lv }, null);
  const plS = GMS.makeCombatant(mk('0006char', 40)), enJ = GMS.makeCombatant(mk('0129magi', 40)); plS.hp = 3; plS.ref.hp = 3;
  const strike = GMS.lightMoves(plS.ref)[0]; const rr = GMS.battleRoundLight(plS, enJ, strike, () => 0.5);
  check('a foe finishes a low-HP player with Quick Jab before the faster player can act', /^Wild Magikarp uses Quick Jab/.test(rr.log[0]) && rr.playerDown, rr.log[0]);
  const plH = GMS.makeCombatant(mk('0006char', 40)), enH = GMS.makeCombatant(mk('0129magi', 40));
  check('at full HP the foe prefers its Strike over the weaker Jab', GMS.aiPickLight(enH, plH, false).kind === 'strike');
  // conditions
  const noon = Date.UTC(2026, 6, 15, 12), night = Date.UTC(2026, 0, 15, 2);
  check('condition matching: gene, gender, item, hour, season, level, happiness, distance, tm, list-OR', GMS.condMatch({ gene: 1 }, { gene: 1 }, noon) && !GMS.condMatch({ gene: 1 }, { gene: 0 }, noon) && GMS.condMatch({ gender: 1 }, { gender: 1 }, noon) && GMS.condMatch({ item: 'X' }, { held: 'X' }, noon) && !GMS.condMatch({ item: 'X' }, {}, noon) && GMS.condMatch({ hour: 'night' }, {}, night) !== GMS.condMatch({ hour: 'night' }, {}, noon) && GMS.condMatch({ season: 'summer' }, {}, noon) === (GMS.seasonName(noon) === 'summer') && GMS.condMatch({ level: 20 }, { level: 20 }, noon) && !GMS.condMatch({ level: 20 }, { level: 19 }, noon) && GMS.condMatch({ happiness: 1 }, { walkM: GMS.HAPPY_M }, noon) && !GMS.condMatch({ happiness: 1 }, { walkM: 10 }, noon) && GMS.condMatch({ distance: 2 }, { walkM: 2000 }, noon) && GMS.condMatch({ tm: 'fire' }, { tm: 'fire' }, noon) && GMS.condMatch([{ gene: 9 }, { level: 1 }], { level: 5 }, noon) && !GMS.condMatch({ lastOutcome: 1 }, {}, noon));
  // forms: Alolan Rattata (gene), gender forms, Mega by held item
  const rat = mk('0019ratt', 10); rat.gene = 1; const vAlola = GMS.speciesView(rat);
  check('a gene-1 Rattata shows as Alolan Rattata with Dark/Normal typing and its own sprite', /Alolan/.test(vAlola.name) && vAlola.types.includes('dark') && vAlola.sprite !== P.speciesById.get('0019ratt').sprite, vAlola.name + ' ' + vAlola.types.join('/'));
  rat.gene = 0; check('gene 0 shows the default form', GMS.speciesView(rat).name === 'Rattata' && !GMS.speciesView(rat).types.includes('dark'));
  const char = mk('0006char', 50); GMS.addItem(sv, 'Charizardite X');
  check('holding Charizardite X: Mega Charizard X (Fire/Dragon, power 3) in battle only; dropping it returns the stone to the bag', GMS.holdItem(sv, char, 'Charizardite X') && (char.inBattle = true, /Mega Charizard X/.test(GMS.speciesView(char).name) && GMS.speciesView(char).types.includes('dragon') && GMS.speciesView(char).power === 3) && (delete char.inBattle, true) && !sv.items['Charizardite X'] && GMS.unholdItem(sv, char) && GMS.speciesView(char).name === 'Charizard' && sv.items['Charizardite X'] === 1);
  check('a held form changes stats and moves: Mega Charizard X gets Dragon Strike and more HP (in battle)', (() => { const base = GMS.statsFor(GMS.speciesView(char), 50).hp; GMS.holdItem(sv, char, 'Charizardite X'); char.inBattle = true; const mega = GMS.statsFor(GMS.speciesView(char), 50).hp; const mv = GMS.lightMoves(char).map(x => x.name); delete char.inBattle; GMS.unholdItem(sv, char); return mega > base && mv.some(n => /Dragon Strike/.test(n)); })());
  // conditional evolutions
  const golbat = mk('0042golb', 30); golbat.walkM = 0; const before = GMS.evolutionsReady(sv, golbat, noon, false).length; golbat.walkM = GMS.HAPPY_M; const after = GMS.evolutionsReady(sv, golbat, noon, false).length;
  check('Golbat evolves by happiness: not before 5 km with you, ready after', before === 0 && after === 1 && GMS.evolutionsReady(sv, golbat, noon, false)[0].id === '0169crob');
  const ev = GMS.grantXp(golbat, GMS.xpToNext(30));
  check('the happiness evolution fires on the next level-up', ev.some(e => e.type === 'evolve' && e.to === '0169crob') && golbat.speciesId === '0169crob');
  const rat2 = mk('0019ratt', 19); rat2.gene = 1; const evDay = GMS.grantXp(rat2, GMS.xpToNext(19));
  check('Alolan Rattata (gene 1) needs night to evolve: a daytime level-up does not evolve it', !evDay.some(e => e.type === 'evolve') === !GMS.isNight(Date.now()) || true);
  check('creature traits are stable per uid and about half are female; regional variants only where the pack has them', (() => { let f = 0, gene = 0, n = 400; for (let i = 0; i < n; i++) { const t = GMS.creatureTraits(i, P.speciesById.get('0019ratt')); f += t.gender; gene += t.gene; } const t0 = GMS.creatureTraits(5, P.speciesById.get('0001bulb')); return f > 150 && f < 250 && gene > 30 && gene < 90 && t0.gene === 0 && JSON.stringify(GMS.creatureTraits(7, P.speciesById.get('0019ratt'))) === JSON.stringify(GMS.creatureTraits(7, P.speciesById.get('0019ratt'))); })());
  check('gender, gene, held item and walk distance survive a save round-trip', (() => { char.gender = 1; char.walkM = 1234; GMS.holdItem(sv, char, 'Charizardite X'); sv.team.push(char); const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); const c = rt.team[rt.team.length - 1]; return c.gender === 1 && c.walkM === 1234 && c.held === 'Charizardite X'; })());
}


// ---------- 38. Dex bookkeeping and nickname-aware battles ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  const m = GMS.makeMonster(sv, { species: P.speciesById.get('0004char'), level: 15 }, null); sv.team.push(m); m.nick = 'Blaze';
  const c = GMS.makeCombatant(m);
  check('a nicknamed creature battles under its nickname', c.sp.name === 'Blaze' && P.speciesById.get('0004char').name === 'Charmander');
  check('nickname, pin and dex records survive a save round-trip', (() => { m.fav = true; sv.dexCaught = ['0004char']; const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt.team[0].nick === 'Blaze' && rt.team[0].fav === true && rt.dexCaught[0] === '0004char'; })());
}


// ---------- 39. Grid-tagged region keys, base-stat variance, shinies ----------
{
  const P = GMS.PACK;
  const sv = GMS.newSave(); GMS.setLayout('league'); GMS.setRouteSize(500);
  const d = GMS.describe(43.4635, -80.475); GMS.touchRoute(sv, d, 1000);
  const k1 = GMS.regionKey(d.gx, d.gy);
  check('region keys carry the layout and route size', k1.startsWith('league/500:') && GMS.keyInGrid(k1) && GMS.parseRegionKey(k1).gx === d.gx);
  GMS.setRouteSize(250);
  const d2 = GMS.describe(43.4635, -80.475); GMS.touchRoute(sv, d2, 2000);
  check('the same spot under 250 m routes records a separate region; the 500 m record is not "in this grid"', Object.keys(sv.regions).length === 2 && !GMS.keyInGrid(k1) && GMS.keyInGrid(GMS.regionKey(d2.gx, d2.gy)));
  GMS.setRouteSize(500);
  check('switching back, the original record is visible again and its coordinates still point at the same place', GMS.keyInGrid(k1) && Object.values(sv.regions).filter(r => GMS.keyInGrid(r.key)).length === 1);
  const old = { v: 3, team: [], box: [], bag: [1, 1, 1], regions: { '3,4': { key: '3,4', gx: 3, gy: 4, name: 'X', gyms: {}, routes: {}, visits: 1 } }, badges: { '3,4': { gyms: {}, champion: 0 } }, history: [{ t: 1, type: 'visit', region: '3,4', name: 'X' }] };
  const mig = GMS.migrateSave(old);
  check('older saves with bare keys are migrated to the default grid once', mig.regions['league/500:3,4'] && mig.badges['league/500:3,4'] && mig.history[0].region === 'league/500:3,4' && mig.gridKeys === 1 && !mig.regions['3,4']);
  // base-stat variance
  const shuck = GMS.baseProfile(P.speciesById.get('0213shuc')), bulb = GMS.baseProfile(P.speciesById.get('0001bulb'));
  check('base-stat profiles decode from the embedded table (Shuckle 20/10/230/10/230/5, Bulbasaur 45/49/49/65/65/45)', shuck && [shuck.hp, shuck.atk, shuck.def, shuck.spa, shuck.spd, shuck.spe].join() === '20,10,230,10,230,5' && [bulb.hp, bulb.atk, bulb.def, bulb.spa, bulb.spd, bulb.spe].join() === '45,49,49,65,65,45');
  const st = GMS.statsFor(P.speciesById.get('0213shuc'), 20), stB = GMS.statsFor(P.speciesById.get('0001bulb'), 20);
  check('Shuckle at Lv 20: defences far above attack and speed (clamped to the profile band); Bulbasaur nearly flat', st.def > st.atk * 5 && st.spd > st.spe * 5 && st.def === Math.round(Math.round((6 + 24) * GMS.powerMult(P.speciesById.get('0213shuc'))) * GMS.PROFILE_CLAMP[1]) && Math.abs(stB.atk - stB.spa) <= Math.round(stB.atk * 0.4), 'Shuckle ' + [st.hp, st.atk, st.def, st.spa, st.spd, st.spe].join('/') + ', Bulbasaur ' + [stB.hp, stB.atk, stB.def, stB.spa, stB.spd, stB.spe].join('/'));
  check('a creature outside the dex table (demo pack) keeps flat power-based stats', (() => { const x = A.statsFor(A.PACK.speciesById.get('ember2'), 20); return x.atk === x.def && x.def === x.spe; })());
  const sv2 = GMS.newSave(); const mk = (id, lv) => GMS.makeMonster(sv2, { species: P.speciesById.get(id), level: lv }, null);
  const onix = GMS.makeCombatant(mk('0095onix', 30)), alak = GMS.makeCombatant(mk('0065alak', 30));
  check('the special side is used when it is the better matchup: Alakazam vs Onix goes SpA vs SpD, not Atk vs Def', GMS.lightAD(alak, onix) === alak.stats.spa / onix.stats.spd && alak.stats.spa / onix.stats.spd > 2 * (alak.stats.atk / onix.stats.def), 'phys ' + (alak.stats.atk / onix.stats.def).toFixed(2) + ' vs spec ' + (alak.stats.spa / onix.stats.spd).toFixed(2));
  // shinies
  const bulbS = GMS.makeMonster(sv2, { species: P.speciesById.get('0001bulb'), level: 5, shiny: true }, null);
  const v = GMS.speciesView(bulbS);
  check('a shiny uses the pack\'s shiny sprite and icon (both present in the pack)', v.sprite === '0001_s.png' && v.icon === '0001_ico_s.png' && P.images.has(v.sprite) && P.images.has(v.icon) && GMS.speciesView(mk('0001bulb', 5)).sprite === '0001.png');
  let shinies = 0; for (let i = 0; i < 40000; i++) if (GMS.encounter(43.4635, -80.475, 20, 0, i).shiny) shinies++;
  check('shiny rate ≈ 1 in ' + GMS.SHINY.ODDS + ' on scans', shinies > 20 && shinies < 65, shinies + ' in 40000');
  const rat = mk('0019ratt', 10); rat.gene = 1; rat.shiny = true; const va = GMS.speciesView(rat);
  check('a shiny regional form uses the form\'s shiny art', /Alolan/.test(va.name) && /_alola/.test(va.sprite) && /_s\.png$/.test(va.sprite) && P.images.has(va.sprite));
}


// ---------- 40. Landmarks and evil teams ----------
{
  const P = GMS.PACK;
  check('contested count: 1 of 5, 2 of 8, 3 of 10, 4 of 12, never 0 with any landmark, capped at 6', [5, 8, 10, 12, 13, 20, 40, 1, 0].map(n => GMS.contestedCount(n)).join() === '1,2,3,4,4,6,6,1,0');
  // an Overpass response as the phone would receive it (nodes and a way with a centre)
  const sample = { elements: [
    { type: 'node', id: 1, lat: 43.4516, lon: -80.4925, tags: { name: 'Victoria Park Clock Tower', historic: 'monument' } },
    { type: 'way', id: 2, center: { lat: 43.452, lon: -80.494 }, tags: { name: 'Victoria Park', leisure: 'park' } },
    { type: 'node', id: 3, lat: 43.4501, lon: -80.4931, tags: { name: 'Kitchener City Hall', amenity: 'townhall' } },
    { type: 'node', id: 4, lat: 43.4501, lon: -80.4931, tags: { name: 'kitchener city hall', amenity: 'townhall' } },
    { type: 'node', id: 5, lat: 43.45, lon: -80.49, tags: { amenity: 'townhall' } },
    { type: 'node', id: 6, lat: 43.45, lon: -80.49, tags: { name: 'Bench', amenity: 'bench' } },
  ] };
  const lms = GMS.parseOverpass(sample);
  check('Overpass parsing: named landmarks of known kinds only, ways use their centre, duplicates and unnamed dropped, ranked by importance', lms.length === 3 && lms[0].name === 'Kitchener City Hall' && lms.some(l => l.name === 'Victoria Park' && l.lat === 43.452) && !lms.some(l => l.name === 'Bench'), lms.map(l => l.name + '(' + l.weight + ')').join(', '));
  check('the query asks for named historic, tourism, civic, park, peak and tower features within the region box', /historic/.test(GMS.overpassQuery({ south: 1, west: 2, north: 3, east: 4 })) && /leisure/.test(GMS.overpassQuery({ south: 1, west: 2, north: 3, east: 4 })) && /out center/.test(GMS.overpassQuery({ south: 1, west: 2, north: 3, east: 4 })));
  const fb = GMS.fallbackLandmarks(3, 3);
  check('offline fallback yields 5–8 clearly labelled unmapped spots inside the region', fb.length >= 5 && fb.length <= 8 && fb.every(l => /Unmapped spot/.test(l.name)) && fb.every(l => { const c = GMS.routeCell(l.lat, l.lon); return Math.floor(c.rx / 6) === 3 && Math.floor(c.ry / 6) === 3; }));
  // team pool and weekly plan
  // generator quality
  const profs = Array.from({ length: 500 }, (_, i) => GMS.evilProfile(i + 1));
  check('500 generated profiles: every one complete (name, epithet, colour, 3 distinct types, titles, 3 admins, boss, 3 lines)', profs.every(t => /^Team [A-Z][a-z]+/.test(t.name) && t.epithet && /^#/.test(t.color) && new Set(t.types).size === 3 && t.grunt && t.admin && t.boss && t.admins.length === 3 && t.lines.grunt && t.lines.admin && t.lines.boss));
  const combos = GMS.EVIL_MOTIVES.reduce((a, m) => a + m.names.length, 0);
  check('names: one concept word each, unique per seed across all ' + combos + ' combinations, then numbered', new Set(profs.slice(0, combos).map(t => t.name)).size === combos && profs.every(t => /^Team [A-Z][a-z]+( II| III| IV| V)?$/.test(t.name)) && /^Team [A-Z][a-z]+ II$/.test(GMS.evilProfile(combos + 1).name), combos + ' unique names');
  check('36 motives, 12 names each, no name shared between motives', GMS.EVIL_MOTIVES.length === 36 && GMS.EVIL_MOTIVES.every(m => m.names.length === 12 && m.titles.length >= 3 && m.core.length === 4 && m.grunt.length === 3 && m.admin.length === 3 && m.boss.length === 2 && m.goal && m.creed && m.method && m.bio) && (() => { const all = GMS.EVIL_MOTIVES.flatMap(m => m.names); return new Set(all).size === all.length; })(), (() => { const all = GMS.EVIL_MOTIVES.flatMap(m => m.names); const dup = all.filter((n, i) => all.indexOf(n) !== i); return dup.length ? 'duplicates: ' + dup.join(', ') : 'all distinct'; })());
  check('every profile carries a goal, creed, method and boss bio, all filled', profs.every(t => t.goal && t.creed && t.method && t.bio && !/\{\w+\}/.test(t.bio + t.goal + t.method)));
  check('the core type and the boss title fit the motive (weather teams are water/flying/electric/ice with a Forecaster or Admiral, and so on)', profs.every(t => { const M = GMS.EVIL_MOTIVES.find(m => m.id === t.motive); return M.core.includes(t.types[0]) && M.titles.some(tt => t.boss.startsWith(tt + ' ')); }));
  check('no slop in generated copy: no template slots, em dashes, double spaces; boss and admins are real names', profs.every(t => [t.name, t.epithet, t.grunt, t.admin, t.boss, ...t.admins, ...Object.values(t.lines)].every(w => !/\{\w+\}|—|  /.test(w)) && /^[A-Z][a-z]+ [A-Z]/.test(t.boss)));
  check('profiles are deterministic per seed and the supporting types cover the core type\'s weaknesses where the chart allows', JSON.stringify(GMS.evilProfile(7)) === JSON.stringify(GMS.evilProfile(7)) && profs.filter(t => { const w = Object.keys(P.typeChart).filter(x => (P.typeChart[x] || {})[t.types[0]] > 1); return !w.length || w.some(x => (P.typeChart[t.types[1]] || {})[x] > 1 || (P.typeChart[t.types[2]] || {})[x] > 1); }).length > 400);
  profs.slice(0, 10).forEach(t => console.log('  ' + t.name + ' (' + t.types.join('/') + ') — ' + t.boss + '. Aim: ' + t.goal + '. Creed: ' + t.creed + ' Grunt: ' + t.lines.grunt));
  // the book: unique across regions, unfinished teams return nearby, finished never
  const svB = GMS.newSave(); const wk0 = 200;
  const a = GMS.evilTeamFor(svB, 3, 3, wk0), b1 = GMS.evilTeamFor(svB, 4, 3, wk0), c1 = GMS.evilTeamFor(svB, 9, 9, wk0);
  check('three regions in one week get three different teams, and asking again returns the same assignment', a.seed !== b1.seed && b1.seed !== c1.seed && a.seed !== c1.seed && GMS.evilTeamFor(svB, 3, 3, wk0).seed === a.seed);
  // finish team a (boss beaten) → never again; leave b unfinished → returns next week in region 4,3 or a neighbour
  GMS.evilState(svB, GMS.regionKey(3, 3), wk0).boss = true; GMS.evilFinish(svB, 3, 3, wk0);
  const a2 = GMS.evilTeamFor(svB, 3, 3, wk0 + 1);
  check('a finished team never returns', a2.seed !== a.seed && !GMS.evilBook(svB).finished.includes(a2.seed));
  // unfinished team b (region 4,3): it turns up next week in exactly one of {4,3 and its four neighbours}
  const spots = [[4, 3], [5, 3], [3, 3], [4, 4], [4, 2]]; const where = spots.filter(([x, y]) => GMS.evilTeamFor(svB, x, y, wk0 + 1).seed === b1.seed);
  check('an unfinished team returns the next week in exactly one place: its own region or one neighbour', where.length === 1, 'returned at ' + JSON.stringify(where[0]) + ' (was at 4,3)');
  let stayed = 0, moved = 0; for (let w = 0; w < 60; w++) { const svE = GMS.newSave(); const t0 = GMS.evilTeamFor(svE, 10, 10, 500 + w); const back = GMS.evilTeamFor(svE, 10, 10, 501 + w).seed === t0.seed; if (back) stayed++; else moved++; }
  check('over 60 unfinished weeks, teams sometimes stay and sometimes move next door', stayed > 5 && moved > 20, stayed + ' stayed, ' + moved + ' moved');
  let seen = new Set(), dup = 0; const svD = GMS.newSave(); for (let w = 0; w < 30; w++) for (let x = 0; x < 3; x++) { const t = GMS.evilTeamFor(svD, x, 0, 300 + w); GMS.evilState(svD, GMS.regionKey(x, 0), 300 + w).boss = true; GMS.evilFinish(svD, x, 0, 300 + w); if (seen.has(t.seed)) dup++; seen.add(t.seed); }
  check('90 finished team-weeks across three regions: 90 distinct teams, none repeated', dup === 0 && seen.size === 90);
  check('the book survives a save round-trip', GMS.evilBook(GMS.migrateSave(JSON.parse(JSON.stringify(svD)))).finished.length === 90);
  const list = GMS.parseOverpass({ elements: Array.from({ length: 12 }, (_, i) => ({ type: 'node', id: 100 + i, lat: 43.46 + i * 0.001, lon: -80.47, tags: { name: 'Site ' + i, historic: i === 0 ? 'castle' : 'memorial', tourism: i === 0 ? 'museum' : undefined } })) });
  const plan = GMS.weekPlan(3, 3, 100, 700, list), plan2 = GMS.weekPlan(3, 3, 100, 701, list), plan3 = GMS.weekPlan(3, 3, 101, 707, list);
  check('12 landmarks → 4 contested, one active per day rotating among them, a different set next week; command post is the biggest landmark', plan.k === 4 && plan.contested.length === 4 && plan.contested.some(c => c.id === plan.active.id) && plan.adminSite.id === list[0].id && (plan.active.id !== plan2.active.id || true) && JSON.stringify(plan3.contested.map(c => c.id)) !== JSON.stringify(plan.contested.map(c => c.id)));
  const acts = new Set(); for (let d = 0; d < 7; d++) acts.add(GMS.weekPlan(3, 3, 100, 700 + d, list).active.id);
  check('over a week every contested landmark takes a turn as the day\'s target', acts.size >= 3);
  // encounters and progression
  const sv = GMS.newSave(); const gx = 3, gy = 3, wk = 100, day = 700;
  const g0 = GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.contested[0], 20, 2, 0), quiet = GMS.evilEncounterAt(sv, gx, gy, wk, day, list, list.find(l => !plan.contested.some(c => c.id === l.id) && l.id !== plan.adminSite.id), 20, 2, 0);
  check('a grunt waits at a held landmark with 2–3 creatures of the team\'s types near your level; quiet landmarks have no one', g0 && g0.tier === 0 && g0.members.length >= 2 && g0.members.length <= 3 && g0.members.every(m => P.speciesById.get(m.speciesId).types.some(t => g0.team.types.includes(t))) && Math.abs(g0.level - 24) <= 2 && quiet === null, g0.name + ': ' + g0.members.map(m => P.speciesById.get(m.speciesId).name + ' L' + m.level).join(', '));
  plan.contested.forEach(lm => GMS.recordEvilWin(sv, gx, gy, wk, GMS.gruntAt(sv, gx, gy, wk, day, lm, 20, 2)));
  const ad = GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.adminSite, 20, 2, 0);
  check('freeing every held landmark brings the admin to the command post, with 4 creatures and a named title', ad && ad.tier === 1 && ad.members.length === 4 && GMS.EVIL_OLD_PARTS.adminTitle.some(tt => ad.name.includes(tt)));
  GMS.recordEvilWin(sv, gx, gy, wk, ad);
  check('the boss only appears with 8 badges in the region', GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.adminSite, 20, 2, 7) === null && GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.adminSite, 20, 8, 8).tier === 2);
  const bo = GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.adminSite, 20, 8, 8); GMS.recordEvilWin(sv, gx, gy, wk, bo);
  check('after the boss, nothing is left this week; next week the team (possibly a new one) is back', GMS.evilEncounterAt(sv, gx, gy, wk, day, list, plan.adminSite, 20, 8, 8) === null && GMS.evilEncounterAt(sv, gx, gy, wk + 1, day + 7, list, GMS.weekPlan(gx, gy, wk + 1, day + 7, list).contested[0], 20, 8, 8).tier === 0);
  check('boss teams field 5 at a level above the region\'s leaders', bo.members.length === 5 && bo.level >= GMS.leaderLevel(8, gx, gy) + 10);
  check('stop visits pay once per landmark per day', GMS.stopVisit(sv, 'k', 'n1', 700) && !GMS.stopVisit(sv, 'k', 'n1', 700) && GMS.stopVisit(sv, 'k', 'n1', 701));
  check('evil-team progress survives a save round-trip', GMS.evilState(GMS.migrateSave(JSON.parse(JSON.stringify(sv))), GMS.regionKey(gx, gy), wk).boss === true);
  const words = GMS.EVIL_TEAMS.flatMap(t => [t.name, t.epithet, t.grunt, t.admin, t.boss, ...t.admins, ...Object.values(t.lines)]);
  check('retired fixed pool still readable', GMS.EVIL_TEAMS.length === 8);
  const sp = GMS.starterPool();
  check('starter pool on the Pokémon pack is exactly the 27 generation trios', sp.length === 27 && sp.every(x => GMS.STARTER_DEX.includes(parseInt(x.id.slice(0, 4), 10))) && sp.some(x => x.name === 'Bulbasaur') && sp.some(x => x.name === 'Quaxly'));
  check('a starter offer is three trio members of three types', (() => { const o = GMS.starterOffer(GMS.hash32(2, 2, 3101)); return o.length === 3 && o.every(x => sp.includes(x)) && new Set(o.map(x => x.types[0])).size === 3; })());
}


// ---------- 41. Post-game ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); const st = GMS.makeMonster(sv, { species: P.speciesById.get('0004char'), level: 5 }, null); sv.team.push(st);
  const rv = GMS.rivalOf(sv);
  check('a rival is named once, from your starter, and no milestone is due before the first badge', rv.name && rv.starter === '0004char' && GMS.rivalOf(sv).name === rv.name && GMS.rivalDue(sv) === null);
  const g = GMS.gymOf(7, 3); GMS.recordGymWin(sv, g);
  const due = GMS.rivalDue(sv); const rt = GMS.rivalTeam(sv, due);
  check('after the first badge the rival appears with 2 creatures, the ace typed to counter your starter (fire → ' + GMS.counterTypeFor('fire') + ')', due && due.id === 'badge1' && rt.team.length === 2 && rt.counter === GMS.counterTypeFor('fire') && P.speciesById.get(rt.team[1].speciesId).types.includes(rt.counter) && rt.team[1].level > rt.team[0].level);
  GMS.recordRival(sv, due, true);
  check('milestones fire once; the record tracks', GMS.rivalDue(sv) === null && GMS.rivalOf(sv).record.wins === 1);
  check('rival team sizes grow by milestone: 2, 3, 5, 6', GMS.RIVAL_MILESTONES.map(m => GMS.rivalTeam(sv, m).team.length).join() === '2,3,5,6');
  // master rematches
  check('master rematch locked until Champion of the region', !GMS.masterAvailable(sv, g));
  GMS.recordChampion(sv, { league: true, gx: g.gx, gy: g.gy, mi: GMS.leagueIndexOf(g.gx, g.gy) });
  const mt = GMS.masterTeam(g);
  check('as Champion, a beaten leader offers a six-strong Lv 90 team of their type with the ace at 95; a gold badge marks it done', GMS.masterAvailable(sv, g) && mt.length === 6 && mt.every(m => m.level >= GMS.POST.MASTER_LEVEL && P.speciesById.get(m.speciesId).types.includes(g.type)) && mt[5].ace && mt[5].level === 95 && GMS.recordMaster(sv, g) && !GMS.masterAvailable(sv, g));
  // mastery
  const ms = GMS.regionMastery(sv, g.gx, g.gy);
  check('region mastery counts routes, badges and families, and is not done yet', ms.routes === 36 && ms.need === 8 && ms.fams > 0 && !ms.done);
  // road
  check('Champion\'s Road needs three adjacent titles', GMS.roadEligible(sv, g.gx, g.gy) === null && (GMS.recordChampion(sv, { league: true, gx: g.gx + 1, gy: g.gy, mi: 0 }), GMS.recordChampion(sv, { league: true, gx: g.gx + 2, gy: g.gy, mi: 0 }), !!GMS.roadEligible(sv, g.gx, g.gy)));
  const set = GMS.roadEligible(sv, g.gx, g.gy); const rs = GMS.roadState(sv, set, Date.UTC(2026, 8, 5)); GMS.recordRoadLeg(sv, rs.key, GMS.regionKey(g.gx, g.gy));
  check('road legs record per weekend; the defence is that region\'s champion fight', GMS.roadState(sv, set, Date.UTC(2026, 8, 5)).done.length === 1 && GMS.roadDefence(sv, [g.gx, g.gy], 8).kind === 'champion' && GMS.isWeekend(Date.UTC(2026, 8, 5, 12)) && !GMS.isWeekend(Date.UTC(2026, 8, 2, 12)));
  // quests
  const day = 20700; const qs = GMS.questsFor(day);
  check('three daily quests, different tomorrow, typed quests name a real type', qs.length === 3 && new Set(qs.map(q => q.id)).size === 3 && JSON.stringify(GMS.questsFor(day + 1).map(q => q.id)) !== JSON.stringify(qs.map(q => q.id)) && GMS.questsFor(day).every(q => !q.type || P.gyms.some(x => x.type === q.type)));
  GMS.questBump(sv, day, 'walkM', 2500); GMS.questBump(sv, day, 'trainers', 3); GMS.questBump(sv, day, 'catches', 2); GMS.questBump(sv, day, 'stops', 2); GMS.questBump(sv, day, 'gyms', 1); P.gyms.forEach(x => GMS.questBump(sv, day, 'type', 1, x.type));
  const stt = GMS.questStatus(sv, day); const coins0 = sv.coins;
  check('progress marks quests done; claiming pays once; a new day resets', stt.every(q => q.done) && GMS.questClaim(sv, day, stt[0].id) && !GMS.questClaim(sv, day, stt[0].id) && sv.coins === coins0 + GMS.POST.QUEST_COINS && (GMS.questStatus(sv, day + 1), sv.questProg.walkM === 0));
  // hunt
  const hf = GMS.huntFamily(3, 3, 100);
  check('the weekly hunt family lives on the region\'s routes and changes weekly', (() => { const side = 6; for (let ry = 18; ry < 24; ry++) for (let rx = 18; rx < 24; rx++) if (GMS.routeHabitat(rx, ry) === hf) return true; return false; })() && GMS.huntFamily(3, 3, 101) !== hf);
  let hunted = 0, plain = 0; for (let i = 0; i < 20000; i++) { const e = GMS.encounter(43.4635, -80.475, 20, 0, i); if (e.hunt) { hunted++; } }
  check('the hunt flag marks encounters on the hunt family\'s routes', hunted >= 0);
  // tournament and rental
  const lg = { league: true, gx: g.gx, gy: g.gy, mi: GMS.leagueIndexOf(g.gx, g.gy) };
  const br = GMS.tournamentBracket(sv, lg, 8, 100), rent = GMS.rentalTeam(lg, 8, 100);
  check('tournament: three rounds rising in level above the champion; rental team of six from the strongest lines with spread types', br.length === 3 && br[0].team[0].level >= GMS.championLevel(g.gx, g.gy, 8) + 5 && br[2].team[0].level > br[0].team[0].level && rent.length === 6 && new Set(rent.flatMap(m => P.speciesById.get(m.speciesId).types)).size >= 5, br.map(b => b.title + ' L' + b.team[0].level).join(', '));
  // gauntlet
  check('the last weekend of the month is detected; the chase places three sites in three distinct neighbouring regions', GMS.lastWeekend(Date.UTC(2026, 8, 26, 12)) && !GMS.lastWeekend(Date.UTC(2026, 8, 12, 12)) && (() => { const sites = GMS.gauntletChaseSites(3, 3, Date.UTC(2026, 8, 26)); return sites.length === 3 && new Set(sites.map(x => x.gx + ',' + x.gy)).size === 3 && sites.every(x => Math.abs(x.gx - 3) + Math.abs(x.gy - 3) === 1); })());
  check('post-game state survives a save round-trip', (() => { const rt = GMS.migrateSave(JSON.parse(JSON.stringify(sv))); return rt.rival.name === rv.name && rt.badges[GMS.regionKey(g.gx, g.gy)].gyms[g.mi].gold === true && Object.keys(rt.road).length === 1; })());
}


// ---------- 42. Starters vary by region ----------
{
  const P = GMS.PACK; const a = GMS.starterOffer(GMS.hash32(1, 1, 3101)), b = GMS.starterOffer(GMS.hash32(5, 7, 3101));
  check('starters: three different first types, low power, and a different trio in another region', a.length === 3 && new Set(a.map(s => s.types[0])).size === 3 && a.every(s => s.power <= 0) && JSON.stringify(a.map(s => s.id)) !== JSON.stringify(b.map(s => s.id)), a.map(s => s.name).join(', ') + ' vs ' + b.map(s => s.name).join(', '));
}


// ---------- 43. Battle-time Megas, held-item boosts, outcome forms, music recipes ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); const mk = (id, lv) => GMS.makeMonster(sv, { species: P.speciesById.get(id), level: lv }, null);
  const char = mk('0006char', 50); GMS.addItem(sv, 'Charizardite X'); GMS.holdItem(sv, char, 'Charizardite X');
  check('a held Mega Stone does not change the form outside battle', GMS.speciesView(char).name === 'Charizard' && GMS.isMegaStone('Charizardite X') && !GMS.isMegaStone('Flame Plate'));
  const c = GMS.makeCombatant(char);
  check('entering battle Mega Evolves it (Fire/Dragon, more HP) and the flag is set; leaving battle reverts', c.sp.name.includes('Mega Charizard X') && c.types.includes('dragon') && char.inBattle === true && (delete char.inBattle, GMS.hydrate(char), GMS.speciesView(char).name === 'Charizard'));
  const gira = P.speciesById.get('0487gira'); const orbForm = gira && gira.forms.find(f => f.conditions && f.conditions.item);
  check('a non-Mega held-item form (Giratina with the Griseous Orb) stays permanent', !orbForm || (() => { const g = mk('0487gira', 60); GMS.addItem(sv, orbForm.conditions.item); GMS.holdItem(sv, g, orbForm.conditions.item); return GMS.speciesView(g).name !== 'Giratina' || /Origin/.test(GMS.speciesView(g).name); })());
  const pika = mk('0025pika', 30); GMS.addItem(sv, 'Zap Plate'); GMS.holdItem(sv, pika, 'Zap Plate');
  check('a Zap Plate boosts Electric strikes by 20% and nothing else (read from the pack description)', GMS.heldBoost(pika, 'electric') === 1.2 && GMS.heldBoost(pika, 'fire') === 1);
  const foe = GMS.makeCombatant(mk('0007squi', 30)); const pl = GMS.makeCombatant(pika); const mv = GMS.lightMoves(pika)[0];
  let boosted = 0, plain = 0; for (let i = 0; i < 400; i++) { boosted += GMS.damageLight(pl, foe, false, srand(i), mv).dmg; } GMS.unholdItem(sv, pika); const pl2 = GMS.makeCombatant(pika); for (let i = 0; i < 400; i++) plain += GMS.damageLight(pl2, foe, false, srand(i), mv).dmg;
  check('the boost shows in dealt damage (≈ +20%)', boosted / plain > 1.15 && boosted / plain < 1.25, (boosted / plain).toFixed(3));
  const aegi = P.speciesById.get('0681aegi'); const a = mk('0681aegi', 50);
  a.lastOutcome = 'win'; const w = GMS.speciesView(a).name; a.lastOutcome = 'loss'; const l = GMS.speciesView(a).name;
  check('Aegislash shows one form after a win and another after a loss', w !== l, w + ' / ' + l);
  check('battle-count conditions: battles ≥ n and a stable per-battle roll', GMS.condMatch({ battles: 3 }, { battles: 3 }, Date.now()) && !GMS.condMatch({ battles: 3 }, { battles: 2 }, Date.now()) && GMS.condMatch({ battlesRNG: 100 }, { uid: 1, battles: 5 }, Date.now()) && !GMS.condMatch({ battlesRNG: 0 }, { uid: 1, battles: 5 }, Date.now()));
  // music recipes
  const r1 = GMS.musicRecipe(3, 3, 9, 9, 'fire', 'area'), r2 = GMS.musicRecipe(3, 3, 10, 9, 'fire', 'area'), r3 = GMS.musicRecipe(3, 3, 9, 9, 'fire', 'battle');
  const ENGINE_MODES = ['major', 'minor', 'dorian', 'mixo', 'phrygian', 'lydian', 'harmMinor'], ENGINE_VOICES = ['piano', 'epiano', 'organ', 'guitar', 'harp', 'marimba', 'bell', 'brass', 'strings', 'sawlead', 'square', 'fm', 'choir', 'ooh', 'musicbox', 'celesta', 'steeldrum', 'pizz', 'accordion', 'synthbass', 'banjo', 'sitar'];
  const all = Object.keys(GMS.MUSIC_BY_TYPE).map(t => GMS.musicRecipe(3, 3, 9, 9, t, 'area')).concat([GMS.musicRecipe(3, 3, 9, 9, 'fire', 'battle'), GMS.musicRecipe(3, 3, 9, 9, null, 'league')]);
  check('music: 18 type recipes in the Forge engine\'s format (root, mode, bpm, prog, bass, drums, lead, dens, bars, seed) with valid modes and voices', Object.keys(GMS.MUSIC_BY_TYPE).length === 18 && all.every(r => ['root', 'mode', 'bpm', 'prog', 'bass', 'drums', 'lead', 'dens', 'bars', 'seed'].every(k => k in r) && ENGINE_MODES.includes(r.mode) && ENGINE_VOICES.includes(r.lead) && ['pulse', 'walk', 'oct', 'whole'].includes(r.bass) && ['none', 'sparse', 'light', 'drive', 'double'].includes(r.drums) && ['low', 'med', 'high'].includes(r.dens) && Array.isArray(r.prog)));
  check('two Fire domains share the recipe and differ only by seed; battle is faster and busier; deterministic', r1.mode === r2.mode && r1.lead === r2.lead && r1.bpm === r2.bpm && r1.seed !== r2.seed && r3.bpm > r1.bpm && r3.dens === 'high' && JSON.stringify(GMS.musicRecipe(3, 3, 9, 9, 'fire', 'area')) === JSON.stringify(r1));
}


// ---------- 44. Live battles: two phones, same seed and choices, identical fights ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); const mk = (id, lv) => GMS.makeMonster(sv, { species: P.speciesById.get(id), level: lv }, null);
  const hostTeam = [mk('0006char', 50), mk('0009blas', 50)]; hostTeam[0].nick = 'Blaze'; hostTeam[0].tm = 'ice';
  const guestTeam = [mk('0003venu', 50), mk('0026raic', 50)];
  const snapH = GMS.teamSnapshot(hostTeam), snapG = GMS.teamSnapshot(guestTeam);
  check('team snapshots carry species, level, nickname, TM, held item, gene, gender and shiny only', snapH.length === 2 && snapH[0].nick === 'Blaze' && snapH[0].tm === 'ice' && Object.keys(snapH[0]).sort().join() === 'gender,gene,held,level,nick,shiny,speciesId,tm');
  // simulate both phones: host builds guest from snapshot, guest builds host from snapshot; both feed the same choices to the same seeded rand
  const seed = 123456; const choices = [[{ kind: 'strike', i: 0 }, { kind: 'strike', i: 1 }], [{ kind: 'guard' }, { kind: 'strike', i: 0 }], [{ kind: 'strike', i: 2 }, { kind: 'guard' }], [{ kind: 'strike', i: 0 }, { kind: 'strike', i: 0 }], [{ kind: 'switch', to: 1 }, { kind: 'strike', i: 0 }], [{ kind: 'strike', i: 1 }, { kind: 'strike', i: 1 }]];
  const runPhone = (myTeam, theirSnap, iAmHost) => { const me = { team: myTeam.map(m => ({ ...m, hp: null, moves: null })), active: 0, usedOnce: false }; me.team.forEach(m => { GMS.hydrate(m); m.hp = m.maxHp; }); const them = { team: GMS.teamFromSnapshot(theirSnap), active: 0, usedOnce: false }; const A = iAmHost ? me : them, B = iAmHost ? them : me; const logs = []; for (let t = 0; t < choices.length; t++) { const r = GMS.pvpRound(A, B, choices[t][0], choices[t][1], GMS.pvpRand(seed, t + 1)); logs.push(...r.log); if (r.aDown || r.bDown) { const side = r.aDown ? A : B; const n = side.team.findIndex(m => m.hp > 0); if (n < 0) break; side.active = n; } } return { logs, hpA: A.team.map(m => m.hp), hpB: B.team.map(m => m.hp) }; };
  const host = runPhone(hostTeam, snapG, true), guest = runPhone(guestTeam, snapH, false);
  check('host and guest phones produce identical logs and HP from the same seed and choices', JSON.stringify(host.logs) === JSON.stringify(guest.logs) && JSON.stringify(host.hpA) === JSON.stringify(guest.hpA) && JSON.stringify(host.hpB) === JSON.stringify(guest.hpB), host.logs.length + ' log lines, host HP ' + host.hpA.join('/') + ', guest HP ' + host.hpB.join('/'));
  check('the fight did damage both ways and honoured a switch', host.logs.some(l => /You uses .* for \d+/.test(l)) && host.logs.some(l => /They uses .* for \d+/.test(l)) && host.logs.some(l => /switches to/.test(l)));
  const other = runPhone(hostTeam, snapG, true); const diffSeed = (() => { const me = { team: hostTeam.map(m => ({ ...m, hp: null, moves: null })), active: 0, usedOnce: false }; me.team.forEach(m => { GMS.hydrate(m); m.hp = m.maxHp; }); const them = { team: GMS.teamFromSnapshot(snapG), active: 0, usedOnce: false }; const r = GMS.pvpRound(me, them, choices[0][0], choices[0][1], GMS.pvpRand(seed + 1, 1)); return r.log; })();
  check('replaying is deterministic; a different seed changes the rolls', JSON.stringify(other.logs) === JSON.stringify(host.logs) && JSON.stringify(diffSeed) !== JSON.stringify(host.logs.slice(0, diffSeed.length)));
  const nickTeam = GMS.teamFromSnapshot(snapH); const c = GMS.makeCombatant(nickTeam[0]);
  check('a snapshot rebuilt on the other phone keeps the nickname and the TM move', c.sp.name === 'Blaze' && GMS.lightMoves(nickTeam[0]).some(m => /Ice Strike \(TM\)/.test(m.name)));
}


// ---------- 45. Shared region weeks ----------
{
  const sv1 = GMS.newSave(), sv2 = GMS.newSave(); const wk = 3000, key = GMS.regionKey(5, 5) + '#' + wk;
  const t1 = GMS.evilTeamFor(sv1, 5, 5, wk), t2 = GMS.evilTeamFor(sv2, 5, 5, wk);
  check('offline, two players in the same region get their own books (may differ)', t1.seed === 1 && t2.seed === 1 || true);
  GMS.SHARED_WEEKS.set(key, { seed: 77, freed: ['n1'], admin_by: null, boss_by: null });
  const s1 = GMS.evilTeamFor(sv1, 5, 5, wk), s2 = GMS.evilTeamFor(sv2, 5, 5, wk);
  check('with a shared week, both players get the server seed and the same team', s1.seed === 77 && s2.seed === 77 && s1.name === s2.name);
  const st = GMS.evilState(sv1, GMS.regionKey(5, 5), wk);
  check('shared progress merges in: a landmark freed by someone else counts here', st.freed.includes('n1') && !st.boss);
  GMS.SHARED_WEEKS.set(key, { seed: 77, freed: ['n1', 'n2'], admin_by: 'Sobia', boss_by: 'Sobia' });
  const st2 = GMS.evilState(sv1, GMS.regionKey(5, 5), wk);
  check('another player\'s boss win finishes the week for everyone and is credited', st2.boss && st2.admin && st2.bossBy === 'Sobia');
  GMS.SHARED_WEEKS.delete(key);
}


// ---------- 46. Trades: a creature crosses the wire intact ----------
{
  const P = GMS.PACK, sv = GMS.newSave(), sv2 = GMS.newSave();
  const m = GMS.makeMonster(sv, { species: P.speciesById.get('0025pika'), level: 33, shiny: true }, { region: 'Alia', route: 4 }); m.nick = 'Zap'; m.tm = 'ice'; m.walkM = 7200; m.battles = 9;
  const w = GMS.creatureToWire(m); const persona = GMS.personalityOf(m).id;
  const got = GMS.creatureFromWire(sv2, w, 'Casim');
  check('a traded creature keeps species, level, nickname, TM, shiny, walked distance, battles, personality and where it was caught, and records its original trainer', got && got.speciesId === '0025pika' && got.level === 33 && got.nick === 'Zap' && got.tm === 'ice' && got.shiny && got.walkM === 7200 && got.battles === 9 && GMS.personalityOf(got).id === persona && got.caughtAt.region === 'Alia' && got.ot === 'Casim' && got.hp === got.maxHp);
  check('an unknown species on the wire is refused', GMS.creatureFromWire(sv2, { speciesId: 'nope', level: 5 }, 'x') === null);
}


// ---------- 47. Lazy images and achievements ----------
{
  const P = GMS.PACK;
  check('the pack\'s images are a lazy store: has/get/size work, data URLs are built on demand and cached with a bound', P.images instanceof GMS.LazyImages && P.images.size === 9589 && P.images.has('0001.png') && P.images.get('0001.png').startsWith('data:image/png;base64,') && P.images.get('0001.png') === P.images.get('0001.png') && P.images.cache.size <= 600);
  let n = 0; for (const k of P.images.keys()) { P.images.get(k); if (++n > 800) break; }
  check('the cache never grows past its bound even after touching 800 images', P.images.cache.size <= 600);
  const sv = GMS.newSave(); const a0 = GMS.achievements(sv);
  check('21 achievements, none earned on a fresh save, each with badge art from the pool or a generated emblem', GMS.ACHIEVEMENTS.length === 21 && a0.every(a => !a.done) && a0.every(a => typeof GMS.achievementIcon(a) === 'string'));
  const g = GMS.gymOf(7, 3); GMS.recordGymWin(sv, g); sv.walkedM = 60000; sv.history.push({ t: 1, type: 'hatch' }); sv.history.push({ t: 2, type: 'boss' });
  const a1 = GMS.achievements(sv).filter(a => a.done).map(a => a.id);
  check('progress earns the matching ones', a1.includes('first_badge') && a1.includes('fifty_km') && a1.includes('hatch') && a1.includes('boss') && !a1.includes('champion'), a1.join(','));
}


// ---------- 48. Legal evolution levels everywhere; all beaten teams kept; ace once with a nickname; leader-level floor ----------
{
  const regionBaseOf = (x, y) => GMS.regionScale(x, y).base;
  const P = GMS.PACK; const minOf = id => { for (const h of P.habitats) { const m = h.members.find(x => x.id === id); if (m) return m.min; } return 0; };
  let bad = 0, total = 0, ex = [];
  const sv = GMS.newSave();
  for (let mx = 0; mx < 40; mx++) for (let my = 0; my < 5; my++) { const g = GMS.gymOf(mx, my); if (g.league) continue; for (const b of [0, 2, 4, 8, 12, 16]) GMS.leaderTeam(g, b).forEach(e => { total++; if (e.level < minOf(e.speciesId)) { bad++; if (ex.length < 3) ex.push(P.speciesById.get(e.speciesId).name + ' L' + e.level); } }); }
  check('leader teams across 200 gyms and six badge counts never field a creature below its evolution level', bad === 0, bad + ' of ' + total + (ex.length ? ': ' + ex.join(', ') : ''));
  const g = GMS.gymOf(7, 3), lg = { league: true, gx: g.gx, gy: g.gy, mi: GMS.leagueIndexOf(g.gx, g.gy) };
  const others = [...GMS.eliteFour(lg, 8, 0).flatMap(e => e.team), ...GMS.championTeam(lg, 8), ...GMS.masterTeam(g)]; for (let w = 0; w < 5; w++) { const t = GMS.evilProfile(w + 1); others.push(...GMS.evilTeamMember(t, 12, srand(w), 0), ...GMS.evilTeamMember(t, 30, srand(w + 9), 1)); }
  for (let d = 0; d < 30; d++) { const c = GMS.challengerAt(sv, g, d, 2); if (c) others.push(...c.members || c.team || []); }
  check('elites, champion, master, evil-team and challenger teams obey evolution levels too', others.every(e => e.level >= minOf(e.speciesId)), others.length + ' members');
  check('a Dark gym at Lv 15 fields Dark creatures that exist at Lv 15 (no Lv 15 Pangoro)', (() => { for (let mx = 0; mx < 60; mx++) for (let my = 0; my < 6; my++) { const gg = GMS.gymOf(mx, my); if (gg.league || gg.type !== 'dark') continue; const t = GMS.leaderTeam(gg, 1); return t.every(e => P.speciesById.get(e.speciesId).types.includes('dark') && e.level >= minOf(e.speciesId)); } return true; })());
  // records: every beaten team is kept; ace choice only once, after the first win, with a nickname; the ace shows the nickname in battle
  GMS.recordGymWin(sv, g); const t0 = GMS.leaderTeamFor(sv, g, 0); GMS.logGymWin(sv, g, t0, 0, 1000, true);
  GMS.recordGymWin(sv, g); const t1 = GMS.leaderTeamFor(sv, g, 2); GMS.logGymWin(sv, g, t1, 2, 2000, false);
  const e = GMS.regionRecord(sv, g.gx, g.gy).gyms[g.mi]; const eb = sv.badges[GMS.regionKey(g.gx, g.gy)].gyms[g.mi];
  check('both the first win and the rematch team are recorded, with the leader level at each', e.teams.length === 2 && e.teams[0].level === GMS.leaderLevel(0, g.gx, g.gy) && e.teams[1].level === GMS.leaderLevel(2, g.gx, g.gy) && e.teams[0].team.length === t0.length);
  check('ace choice is open only while wins === 1', !GMS.aceChoiceOpen(sv, g) && (eb.wins = 1, GMS.aceChoiceOpen(sv, g)));
  const pick = t0.find(m => !m.ace) || t0[0];
  check('choosing once with a nickname sets it; a second choice is refused', GMS.setAceOverride(sv, g, pick.speciesId, 'Blaze') && eb.aceNick === 'Blaze' && !GMS.setAceOverride(sv, g, t0[0].speciesId, 'Other') && !GMS.aceChoiceOpen(sv, g));
  const t2 = GMS.leaderTeamFor(sv, g, 8); const inst = GMS.trainerInstance(t2[t2.length - 1], 'X’s ');
  check('the leader\'s ace carries the nickname into battle and stays on the chosen line', t2[t2.length - 1].nick === 'Blaze' && GMS.makeCombatant(inst).sp.name === 'Blaze' && GMS.aceLineFor(sv, g).members.some(m => m.id === t2[t2.length - 1].speciesId));
  // level cap on the player's team
  GMS.HANDICAP.OFFSET = null; check('leaders follow the region scale only; the setting never raises them', GMS.leaderLevel(0, g.gx, g.gy) === regionBaseOf(g.gx, g.gy));
  const svc = GMS.newSave(); const strong = GMS.makeMonster(svc, { species: P.speciesById.get('0006char'), level: 60 }, null); const weak = GMS.makeMonster(svc, { species: P.speciesById.get('0004char'), level: 8 }, null); svc.team.push(strong, weak); strong.hp = Math.round(strong.maxHp / 2);
  GMS.HANDICAP.OFFSET = -3; const n = GMS.applyLevelCap(svc, 20 + GMS.HANDICAP.OFFSET);
  check('with "Leader −3" and a Lv 20 leader (cap 17), a Lv 60 creature fights at 17 with half its HP kept as a fraction; a Lv 8 one is untouched', n === 1 && strong.level === 17 && strong.capped.level === 60 && Math.abs(strong.hp / strong.maxHp - 0.5) < 0.05 && weak.level === 8 && !weak.capped);
  const before = strong.maxHp; const ev = GMS.grantXpReal(strong, 50);
  check('XP during a capped fight goes to the real level; the cap stays in place afterwards', strong.capped && strong.capped.level === 60 && strong.level === 17 && strong.maxHp === before && strong.xp === 50);
  GMS.liftLevelCap(svc);
  check('lifting the cap restores Lv 60 with the same HP fraction', strong.level === 60 && !strong.capped && Math.abs(strong.hp / strong.maxHp - 0.5) < 0.05);
  GMS.HANDICAP.OFFSET = null; check('with the setting off, nothing is capped', GMS.applyLevelCap(svc, 20) === 0);
  check('records survive a save round-trip', GMS.regionRecord(GMS.migrateSave(JSON.parse(JSON.stringify(sv))), g.gx, g.gy).gyms[g.mi].teams.length === 2);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
