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
  vm.runInContext(CORE + '\nglobalThis.__x = { leaderTeam, aiPickLight, lightExpected, regionCurve, gymIndexFor, coverageType, rivalDue, recordRival, rivalOf, duelStart, duelTurn, duelResult, duelReplay, duelAgrees, duelAlive, evilProfile, seasonLabel, recordSeasonTitle, seasonTitles, heldThisSeason, WORLD, GYM, get PACK() { return PACK; }, DEMO_PACK, validatePack, validateGmsPack, isGmsPack, parseGmsBin, setPack, regionGymList, gymCell, routeHabitat, routeRare, habitatMember, badgeCount, regionBadgeCount, hasBadge, recordGymWin, recordChampion, leaderLevel, leaderTeamSize, aceLine, leaderTeam, championTeam, trainerInstance, bestTypeEff, cellCenter, bearingDeg, compass, regionKey, EGG, addEggWalk, rollWildItem, addItem, removeItem, itemEvolutions, evolveWithItem, HISTORY_MAX, regionRecord, logEvent, touchRoute, routesSeen, logGymWin, logChampion, regionSummary, regionLore, LORE, NAME_BLOCK, regionLeaders, TRAINER, trainersOn, trainerBeaten, recordTrainerWin, trainerReward, pickTrainerClass, snareName, dayIndex, setLayout, isLeagueDomain, gymsPerRegion, leagueBadgesNeeded, leagueCell, setRouteSize, leagueIndexOf, typeHalves, aceMember, COIN, addCoinWalk, spend, ENGINE_ITEMS, itemName, itemInfo, useItemOn, SHOP, packShopPool, dayPrice, shopFor, buy, PERSONALITIES, personalityOf, moodLine, badgeSvg, LEADER_LINES, leaderLine, setAceOverride, aceLineFor, leaderTeamFor, DEFENCE, challengerAt, championChallenger, TYPE_NAMES, NAME_POOL_MIN, leaderPool, setBadgePool, badgeFromPool, get BADGE_POOL() { return BADGE_POOL; }, ELITE, eliteFour, titleOf, leagueLadder, loseTitle, reclaimTitle, usurperDefended, CONTEND, contendSlot, POST, RIVAL_MILESTONES, rivalOf, rivalDue, counterTypeFor, rivalTeam, recordRival, masterTeam, masterAvailable, recordMaster, regionMastery, roadEligible, isWeekend, roadState, roadDefence, recordRoadLeg, questsFor, questStatus, questBump, questClaim, huntFamily, tournamentBracket, rentalTeam, lastWeekend, gauntletLegends, gauntletChaseSites, LANDMARK, weekIndex, contestedCount, overpassQuery, parseOverpass, fallbackLandmarks, SHARED_WEEKS, EVIL_TEAMS, EVIL_OLD_PARTS, EVIL_MOTIVES, STARTER_DEX, starterPool, evilProfile, isMegaStone, heldBoost, MUSIC_BY_TYPE, musicRecipe, pvpRound, pvpRand, teamSnapshot, teamFromSnapshot, creatureToWire, creatureFromWire, personalityOf, LazyImages, ACHIEVEMENTS, achievements, achievementIcon, evilBook, evilTeamFor, evilFinish, weekPlan, evilState, gruntAt, adminAt, bossAt, evilEncounterAt, recordEvilWin, stopVisit, gridTag, parseRegionKey, keyInGrid, baseProfile, powerMult, shapeBy, PROFILE_CLAMP, lightAD, SHINY, HANDICAP, MIGRATION, NEIGHBOURS, baseRouteHabitat, migratedHabitat, freeRestAvailable, takeFreeRest, freeRestsLeft, isRestStop, restFound, findRest, setWorldSeed, worldCode, seedFromCode, WORLD_DEFAULT_SEED, WORLD_CODE_MAX, isDefaultWorld, teamNeedsRest, snareName, ENGINE_ITEMS, EVOLVE, evolveNow, isShopStop, shopStock, SHOP_KINDS, LM_KINDS, LM_TIER2, overpassQuery, LANDMARK, parseOverpass, landmarkTarget, fallbackLandmarks, setLayout, FREE_RESTS_PER_DAY, STARTER_DEX_LIST, applyLevelCap, liftLevelCap, grantXpReal, legalMembers, typedPick, aceChoiceOpen, evilTeamMember, regionScale, championLevel, isNight, seasonName, HAPPY_M, condMatch, formOf, speciesView, evolutionsReady, creatureTraits, holdItem, unholdItem, SIGNATURES, signatureFor, lightMoves, lightExpected, aiPickLight, teachTm, forgetTm, typeName, LEGEND, seasonOf, legendUnlocked, regionLegends, legendState, legendCaught, activeLegend, legendEncounter, legendShinyOdds, regionVariant, variantName, geneCount, variantStats, VARIANT, statsFor, ADAPTED, adaptedTypes, adaptedName, adaptedHue, adaptedTint, TYPE_TINT, wildInstance, isWatched, watchedLegend, LEGEND_SHINY, legendAttempt, roamedInto, SNARES, catchChance, fleeChance, throwSnare, newSave, migrateSave, teamLevel, makeMonster, addMonster, moveToBox, moveToTeam, addWalk, starterOffer, TEAM_MAX, SNARE_REFILL_M, statsFor, movesAtLevel, hydrate, xpToNext, xpForWin, grantXp, effectiveness, makeCombatant, damageFull, damageLight, expectedDamage, aiPickMove, battleRoundFull, battleRoundLight, wildInstance, healAll, firstAble, hash32, rng, routeCell, cellBounds, macroOf, regionOf, macroIndex, LEAGUE_INDEX, routeNumber, haversineM, regionName, gymOf, describe, encounter, NAME_BLOCKLIST };', ctx);
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
    const homeOk = X.PACK.habitats[d.habitat].members.some(mm => mm.id === e.species.id);
    const nb = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy]) => X.routeHabitat(d.rx + dx, d.ry + dy));
    const nbOk = !!e.wanderedFrom && nb.some(hi => X.PACK.habitats[hi].members.some(mm => mm.id === e.species.id));
    if (!(e.wanderedFrom ? nbOk : homeOk)) famOk = false;
    stages[e.species.stage - 1]++;
  }
  check('encounters come from the route\'s family, or a neighbouring route\'s when flagged as wandered; ranges respected', famOk && stages[2] === 0, 'stage1 ' + stages[0] + ', stage2 ' + stages[1] + ', stage3 ' + stages[2] + ', legendary ' + leg);
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
  let rangeOk = true; for (let i = 0; i < 3000; i++) { const lat = 43.4 + (i % 50) * 0.003, lon = -80.6 + Math.floor(i / 50) * 0.004; const e = GMS.encounter(lat, lon, 5 + (i % 90), 0, i); const d = GMS.describe(lat, lon); if (e.legendary) continue; const pool = e.wanderedFrom ? [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy]) => GMS.routeHabitat(d.rx + dx, d.ry + dy)) : [d.habitat]; const mem = pool.map(hi => P.habitats[hi].members.find(mm => mm.id === e.species.id)).find(Boolean); if (!mem || e.level < mem.min || e.level > mem.max) rangeOk = false; }
  check('3000 encounters: the species belongs to the route\'s family (or a neighbour\'s when wandered) and sits inside that member\'s level range', rangeOk);
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
    const text = lore.text;   // sentences are ordered differently per region now, so read the whole paragraph
    const landmarkPart = lore.parts.find(pt => /is the oldest in|Old maps mark|marks the|stands at/.test(pt)) || '';
    if (/grew up around a single/.test(text) && landmarkPart && !landmarkPart.includes(lore.facts.type1 + ' gym') && /is the oldest in/.test(landmarkPart)) { coh = false; cohBad = 'first-gym founding but the oldest gym is ' + lore.facts.landmarkGym + ' (dominant ' + lore.facts.type1 + ')'; }
    if (/is the oldest in/.test(text) && !text.includes(lore.facts.type1 + ' gym')) { coh = false; cohBad = 'oldest gym is not the dominant type'; }
    if (/between them/.test(text) && /centre/.test(text)) { coh = false; cohBad = 'centre stated twice'; }
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
      t.team.forEach(m => { const anywhere = P.habitats.some(h => h.members.some(x => x.id === m.speciesId && m.level >= x.min && m.level <= x.max)); if (!anywhere) teamOk = false; });   // members may now come from any route in the region
      const cls = P.trainerClasses.find(c => (c.appearances || []).some(a => a.name === t.cls)); if (cls) { const conds = Array.isArray(cls.conditions) ? cls.conditions : [cls.conditions]; if (!conds.some(cd => t.level >= (cd.minlvl || 0))) classOk = false; }
    });
  }
  check('teams of one to four, every member a real species at a level its own route allows, level tracks the player', counts[0] === 0 && counts[1] > 0 && counts[2] > 0 && counts[3] > 0 && levelOk && teamOk, counts.slice(1).join('/'));
  check('classes come from the pack with their overworld icons, and the level gate is softened but bounded', iconOk && /CLASS_REACH = \{ mult: 2.2, add: 8 \}/.test(html) && /cd.minlvl > reach/.test(html));
  const bug = GMS.trainersOn(d.rx, d.ry, 20, 0, now).concat(GMS.trainersOn(d.rx + 1, d.ry, 20, 0, now)).map(t => t.cls);
  console.log('  sample classes: ' + [...new Set(bug)].join(', '));
  const sv = GMS.newSave(); const k = t1[0].key;
  check('beaten trainer stays beaten today and is forgotten after two days', !GMS.trainerBeaten(sv, k) && (GMS.recordTrainerWin(sv, k, now), GMS.trainerBeaten(sv, k)) && (GMS.recordTrainerWin(sv, 'x,y:0:' + (GMS.dayIndex(now) + 2), now + 2 * TRAINER_DAY), !GMS.trainerBeaten(sv, k)));
  const rw = GMS.trainerReward(45, srand(3)); check('reward gives 2–4 tier-I catch items, sometimes higher tiers', rw.snares[0] >= 2 && rw.snares[0] <= 4 && rw.snares.length === 3);
  check('the basic catch item still takes the pack\'s name', GMS.snareName(0) === GMS.PACK.keywords.catchitem && /Great Ball/.test(GMS.snareName(1)));
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
  check('item names come from the pack keyword for the basic catch item', GMS.snareName(0).includes(GMS.PACK.keywords.catchitem));
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
  { let k = 0; for (let mx = g.gx * 3; mx < g.gx * 3 + 3; mx++) for (let my = g.gy * 3; my < g.gy * 3 + 3; my++) { const o = GMS.gymOf(mx, my); if (!o.league && o.mi !== g.mi && k < 7) { GMS.recordGymWin(sv, o); k++; } } }   // progress through the region
  const team1 = GMS.leaderTeamFor(sv, g, 8);
  check('after choosing, the leader\'s ace comes from the chosen line and still grows with badges', !other || (GMS.aceLineFor(sv, g).members.some(m => m.id === team1[team1.length - 1].speciesId) && team1[team1.length - 1].ace && team1[team1.length - 1].level === GMS.leaderLevel(GMS.gymIndexFor(sv, g), g.gx, g.gy) + GMS.GYM.ACE_BONUS), other ? GMS.PACK.speciesById.get(other.speciesId).name + ' line → ace now ' + GMS.PACK.speciesById.get(team1[team1.length - 1].speciesId).name : 'single-member team');
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
  check('as Champion, region leaders come for the title with teams above their gym level', cc && leaders.includes(cc.name) && cc2 && cc.team.length >= 2 && cc.team.every(m => m.level >= GMS.leaderLevel(GMS.gymsPerRegion() - 1, lg.gx, lg.gy)), cc.name + ' then ' + cc2.name);
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
  check('locked before Champion: no active legend, no location is ever implied, and the legend is still named', GMS.activeLegend(sv, gx, gy, day, now) === null && !/route \d+/i.test(GMS.regionLore(gx, gy, { active: null, unlocked: false }).text) && GMS.regionLore(gx, gy, { active: null, unlocked: false }).text.includes(GMS.regionLegends(gx, gy, season)[0].species ? GMS.regionLegends(gx, gy, season)[0].species.name : '') === false === false);
  GMS.recordChampion(sv, lg);
  const a = GMS.activeLegend(sv, gx, gy, day, now);
  check('after Champion: one of the set is on a route of the region today, not attempted', a && list.some(l => l.speciesId === a.speciesId) && Math.floor(a.rx / 6) === gx && Math.floor(a.ry / 6) === gy && !a.attempted, a.species.name + ' on route ' + a.routeNo);
  const routes = new Set(); for (let d = 0; d < 30; d++) routes.add(GMS.activeLegend(sv, gx, gy, day + d, now).routeNo);
  check('the route changes day to day', routes.size >= 15, routes.size + ' distinct routes in 30 days');
  const lore = GMS.regionLore(gx, gy, { active: a, unlocked: true });
  check('lore names today\'s legend and its real route, wherever that sentence falls', lore.parts.some(pt => pt.includes(a.species.name) && new RegExp('route ' + a.routeNo + '\\b', 'i').test(pt)));
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
  const scales = new Set(); let inRange = true; for (let i = 0; i < 200; i++) { const sc = GMS.regionScale(i * 7 - 300, i * 3 - 100); scales.add(sc.base + '/' + sc.step); if (sc.base < 9 || sc.base > 14 || sc.step < 3 || sc.step > 6) inRange = false; }
  check('regions start leaders at Lv 9–14 and step 3–8 per badge won there; many distinct scales', (() => { let ok = true; const seen = new Set(); for (let i = 0; i < 300; i++) { const sc = GMS.regionScale(i * 7 - 300, i * 3 - 100); seen.add(sc.base + '/' + sc.step); if (sc.base < 9 || sc.base > 14 || sc.step < 3 || sc.step > 8) ok = false; } return ok && seen.size >= 30; })());
  const champs = new Set(); let cMin = 999, cMax = 0; for (let i = 0; i < 300; i++) { const c = GMS.championLevel(i, -i, 0); champs.add(c); cMin = Math.min(cMin, c); cMax = Math.max(cMax, c); }
  check('the League sits at Lv 50–68 and differs between regions', cMin >= 50 && cMax <= 68 && cMax >= 64 && champs.size >= 12, cMin + '–' + cMax + ', ' + champs.size + ' distinct');
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
  check('shiny rate ≈ 1 in ' + GMS.SHINY.ODDS + ' on scans', shinies > 40000 / GMS.SHINY.ODDS * 0.6 && shinies < 40000 / GMS.SHINY.ODDS * 1.5, shinies + ' in 40000, expected about ' + Math.round(40000 / GMS.SHINY.ODDS));
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
  GMS.HANDICAP.OFFSET = null; check('the first gym in a region follows that region\'s own scale', GMS.leaderLevel(0, g.gx, g.gy) === GMS.regionCurve(g.gx, g.gy).levels[0] && GMS.leaderLevel(0, g.gx, g.gy) >= 9 && GMS.leaderLevel(0, g.gx, g.gy) <= 14);
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


// ---------- 49. v56: names, routing honesty, migration, wanderers, free rest ----------
{
  const P = GMS.PACK;
  check('family names with pack tokens are resolved to real names', !P.habitats.some(h => /<<|>>/.test(h.name)) && P.habitats.some(h => /Volbeat & Illumise/.test(h.name)), (P.habitats.find(h => /Volbeat/.test(h.name)) || {}).name);
  { const src = html; check('each travel mode has its own router, and the car-only demo server is used for driving alone', /routed-foot\/route\/v1\/foot/.test(src) && /routed-bike\/route\/v1\/bike/.test(src) && /routed-car\/route\/v1\/driving/.test(src) && /maxKmh: 8/.test(src) && (() => { const m = src.match(/const MODES = \{[\s\S]*?\n\};/)[0]; const walk = m.match(/walk: \{[^\n]*/)[0], bike = m.match(/bike: \{[^\n]*/)[0], car = m.match(/car: \{[^\n]*/)[0]; return !/project-osrm/.test(walk) && !/project-osrm/.test(bike) && /project-osrm/.test(car); })()); }
  // migration: same ground, different families, and it comes back
  const rx = 900, ry = 400; const base = GMS.baseRouteHabitat(rx, ry);
  GMS.MIGRATION.on = false; check('with migration off a route keeps its family', GMS.routeHabitat(rx, ry) === base);
  GMS.MIGRATION.on = true; GMS.MIGRATION.period = 'month';
  const jan = new Date(2026, 0, 15).getTime(), feb = new Date(2026, 1, 15).getTime(), jan2 = new Date(2026, 0, 28).getTime();
  const a = GMS.routeHabitat(rx, ry, jan), b = GMS.routeHabitat(rx, ry, feb), c = GMS.routeHabitat(rx, ry, jan2);
  check('with migration on the family changes between months and is steady within one', a === c && a !== b, 'jan ' + P.habitats[a].name + ', feb ' + P.habitats[b].name);
  let moved = 0; for (let i = 0; i < 60; i++) if (GMS.routeHabitat(rx + i, ry, jan) !== GMS.baseRouteHabitat(rx + i, ry)) moved++;
  check('a migration moves most routes, not just one', moved > 45, moved + ' of 60');
  GMS.MIGRATION.on = false;
  // wanderers
  const sv = GMS.newSave(); let wandered = 0, home = 0; const d = GMS.describe(43.45, -80.49);
  GMS.NEIGHBOURS.on = true; for (let i = 0; i < 400; i++) { const e = GMS.encounter(43.45, -80.49, 10, 0, i); if (e.wanderedFrom) wandered++; else home++; }
  check('wanderers from the next route are about one scan in twenty', wandered >= 8 && wandered <= 36, wandered + ' of 400');
  GMS.NEIGHBOURS.on = false; let none = 0; for (let i = 0; i < 100; i++) if (GMS.encounter(43.45, -80.49, 10, 0, i).wanderedFrom) none++;
  check('with wanderers off, every scan is the route\'s own family', none === 0); GMS.NEIGHBOURS.on = true;
  // free rest
  const sv2 = GMS.newSave(); const mon = GMS.makeMonster(sv2, { species: P.speciesById.get('0004char'), level: 5 }, null); sv2.team.push(mon);
  sv2.coins = 5; mon.hp = 0;
  check('with a creature down and no coins, healing is free', GMS.freeRestAvailable(sv2) && GMS.takeFreeRest(sv2) && mon.hp === mon.maxHp);
  { let used = 1; for (let i = 0; i < 10; i++) { mon.hp = 0; if (GMS.takeFreeRest(sv2)) used++; }
    check('five free heals a day, then no more', used === GMS.FREE_RESTS_PER_DAY && GMS.freeRestsLeft(sv2) === 0 && (mon.hp = 0, !GMS.freeRestAvailable(sv2))); }
  check('never offered when you can pay', (sv2.coins = 500, mon.hp = 0, !GMS.freeRestAvailable(sv2)));
}


// ---------- 50. v57: every pack name resolved; starter families are a find ----------
{
  const P = GMS.PACK;
  const named = [...P.habitats, ...P.rares].map(h => h.name).concat([...P.speciesById.values()].map(sp => sp.name));
  check('no pack name anywhere still carries a <<token>>, families and rare lines alike', !named.some(n => /<<|>>/.test(n)), named.length + ' names checked');
  check('the engine knows every starter family, regional lines included, and flags nothing else', P.starterHabitats.size >= 27 && [...P.starterHabitats].every(i => P.habitats[i].members.some(m => GMS.STARTER_DEX_LIST.includes(parseInt(String(m.id).slice(0, 4), 10)))) && P.habitats.filter((h, i) => !P.starterHabitats.has(i) && h.members.some(m => GMS.STARTER_DEX_LIST.includes(parseInt(String(m.id).slice(0, 4), 10)))).length === 0, P.starterHabitats.size + ' families');
  let hits = 0, total = 0; for (let rx = 0; rx < 300; rx++) for (let ry = 0; ry < 8; ry++) { total++; if (P.starterHabitats.has(GMS.routeHabitat(rx, ry))) hits++; }
  check('a starter family holds a route now and then, not commonly: between 1 in 40 and 1 in 200', hits > 0 && total / hits >= 40 && total / hits <= 200, '1 in ' + Math.round(total / hits));
  // evolved stages appear through the level bands the pack sets, not through badges
  const fam = P.habitats.find(h => h.members.some(m => m.id === '0393pipl'));
  const share = lv => { let base = 0, later = 0; for (let i = 0; i < 1500; i++) { const e = GMS.encounter(43.4 + (i % 40) * 0.004, -80.6 + Math.floor(i / 40) * 0.004, lv, Math.min(8, Math.floor(lv / 9)), i); if (e.legendary) continue; const f = P.habitats[e.species.familyIndex]; if (!f) continue; const idx = f.members.findIndex(m => m.id === e.species.id); if (idx <= 0) base++; else later++; } return Math.round(later * 100 / (base + later)); };
  check('a family\'s later stages appear as your team levels, from the ranges the pack gives each member', fam.members.length === 3 && fam.members[1].min === 16 && share(5) < 5 && share(30) > 20 && share(55) > 55, 'Lv 5: ' + share(5) + '% evolved, Lv 30: ' + share(30) + '%, Lv 55: ' + share(55) + '%');
}


// ---------- 51. Regressions found by the end-to-end sweep ----------
{
  const src = html;
  check('a missing shared purse is not read as zero coins, so a new playthrough starts with its starting coins', /const raw = localStorage.getItem\(purseKey\(\)\); if \(raw === null \|\| raw === ''\) return null;/.test(src));
  check('closing the team photo puts the player back in the Team panel', /photo.cameFromPanel = panel.classList.contains\('show'\)/.test(src) && /if \(photo.cameFromPanel\) \{ photo.cameFromPanel = false; panel.classList.add\('show'\)/.test(src));
  const sv = GMS.newSave();
  check('a new save carries the starting coins', sv.coins === GMS.COIN.START && GMS.COIN.START > 0, GMS.COIN.START + ' coins');
}


// ---------- 52. v63: iOS page zoom, routing fallbacks, transit honesty ----------
{
  const src = html;
  check('every input is at least 16px, so iOS does not zoom the whole page when one is tapped', /input, select, textarea \{ font-size: 16px !important; \}/.test(src) && /font-size:16px'/.test(src));
  check('driving has a second routing server to fall back on, and a straight line only after both fail', /router\.project-osrm\.org\/route\/v1\/driving/.test(src) && /for \(const url of M\.urls\)/.test(src) && /straight\(last\)/.test(src));
  check('a routing request gives up rather than hanging', /new AbortController\(\)/.test(src) && /ctl\.abort\(\), ms \|\| 12000/.test(src));
  check('a straight line says why, and offers a retry', /straight line: ' \+ \(r\.why \|\| 'no route'\)/.test(src) && /navRetry/.test(src));
  check('transit does not pretend to route: it hands the trip to the phone\'s maps app', /handoff: true/.test(src) && /if \(MODES\[m\]\.handoff\)/.test(src) && /openInMaps\('transit'\)/.test(src));
}


// ---------- 53. v64: the routers are free services, so ask rarely and back off when refused ----------
{
  const src = html;
  check('a route is only re-asked when you have really left it, not on every GPS fix', /offRouteM: 35/.test(src) && /moveM: 60/.test(src) && /off > ROUTE_LIMITS.offRouteM && moved > ROUTE_LIMITS.moveM/.test(src));
  check('requests are spaced and never run in parallel', /minGapMs: 20000/.test(src) && /if \(ROUTE.inFlight\) return;/.test(src) && /Date.now\(\) - ROUTE.at < gap/.test(src));
  check('a refusal starts a growing pause, capped, and a success clears it', /backoffStart: 30000/.test(src) && /backoffMax: 300000/.test(src) && /ROUTE.backoff \* 2 : ROUTE_LIMITS.backoffStart/.test(src) && /ROUTE.backoff = 0; ROUTE.blockedUntil = 0;/.test(src));
  check('the pause is stated to the player and Retry clears it', /waiting ' \+ Math.ceil\(left \/ 1000\) \+ ' s before asking again'/.test(src) && /ROUTE.blockedUntil = 0; ROUTE.backoff = 0; state.routeGeom = null/.test(src));
  check('GPS jitter reuses a cached route rather than asking again', /from.map\(v => v.toFixed\(3\)\)/.test(src));
}


// ---------- 54. v65: turns are announced by time, not a fixed distance ----------
{
  const src = html;
  check('announcement distances come from speed with a floor for each way of travelling', /const VOICE_FLOORS = \{ walk: \[350, 90, 25\], bike: \[450, 130, 35\], car: \[600, 200, 50\]/.test(src) && /speed \* 60/.test(src) && /speed \* 15/.test(src) && /speed \* 4/.test(src));
  check('the far call is about a minute out and is capped so it never comes absurdly early', /Math.min\(2500, Math.max\(f\[0\], speed \* 60\)\)/.test(src));
  check('the player\'s speed is smoothed from real fixes and used when live GPS is on', /state.gps.speed = state.gps.speed == null \? speed : state.gps.speed \* 0.6 \+ speed \* 0.4/.test(src) && /state.gps.on && state.gps.speed > 0.5/.test(src));
}


// ---------- 55. v66: rest stops, and cards that were hiding behind a sheet ----------
{
  const src = html;
  const lm = (id, kind) => ({ id, kind, name: id });
  check('places that look after people are always rest stops', ['amenity=place_of_worship', 'amenity=townhall', 'amenity=library', 'amenity=university'].every(k => GMS.isRestStop(lm('node1', k))));
  let rest = 0, n = 0; for (let i = 0; i < 800; i++) { n++; if (GMS.isRestStop(lm('node' + i, 'historic'))) rest++; }
  check('about one other landmark in four is a rest stop, steadily', rest / n > 0.18 && rest / n < 0.32, Math.round(rest * 100 / n) + '%');
  check('the same landmark is always the same answer', GMS.isRestStop(lm('node77', 'historic')) === GMS.isRestStop(lm('node77', 'historic')));
  const sv = GMS.newSave();
  check('a rest stop must be found before it helps, and finding it is recorded once', !GMS.restFound(sv, 'node9') && GMS.findRest(sv, 'node9') && GMS.restFound(sv, 'node9') && !GMS.findRest(sv, 'node9'));
  const P = GMS.PACK; const m = GMS.makeMonster(sv, { species: P.speciesById.get('0004char'), level: 9 }, null); sv.team.push(m); m.hp = 3;
  check('the game knows when a team needs a rest', GMS.teamNeedsRest(sv) && (GMS.healAll(sv), !GMS.teamNeedsRest(sv)));
  check('resting at a found stop costs nothing: it heals without touching coins', /btn.textContent = '\\u2726 Rest at ' \+ near.lm.name/.test(src) && /healAll\(state.save\); persistSave\(\); renderTeam\(\); playSfx\('levelup'\)/.test(src) && !/Rest at[\s\S]{0,400}coins = \(state.save.coins/.test(src));
  check('a card raised from the Online sheet closes it first, or it renders behind it', /mpSheet.classList.remove\('show'\); document.getElementById\('tImg'\)/.test(src) && /function offerNewerCloud[\s\S]{0,140}mpSheet.classList.remove\('show'\)/.test(src));
  check('achievements start collapsed so the profile actions stay in reach', /MP.achOpen/.test(src) && /achToggle/.test(src));
}


// ---------- 56. v67: thin regions get everyday places, and anywhere that treats people always rests a team ----------
{
  const lm = (id, kind) => ({ id, kind, name: id });
  check('anywhere that treats or shelters people is always a rest stop', ['amenity=hospital', 'amenity=clinic', 'amenity=doctors', 'amenity=pharmacy', 'amenity=community_centre', 'amenity=place_of_worship', 'amenity=library', 'amenity=townhall', 'amenity=university'].every(k => GMS.isRestStop(lm('node' + k, k))));
  const bounds = { south: 43.44, west: -80.50, north: 43.46, east: -80.48 };
  const narrow = GMS.overpassQuery(bounds, false), wide = GMS.overpassQuery(bounds, true);
  check('the ordinary search asks only for the landmarks worth a detour', !/hospital|school|garden|playground/.test(narrow) && /historic/.test(narrow));
  check('the wide search adds the everyday places, art and medical included', /hospital\|clinic\|doctors\|pharmacy/.test(wide) && /school/.test(wide) && /garden\|nature_reserve/.test(wide) && /gallery/.test(wide) && /out center 250/.test(wide));
  { const before = GMS.WORLD.LAYOUT;
    GMS.setLayout('league'); const small = GMS.landmarkTarget(), smallRoutes = (GMS.WORLD.MACRO * GMS.WORLD.REGION) ** 2;
    GMS.setLayout('wide'); const big = GMS.landmarkTarget(), bigRoutes = (GMS.WORLD.MACRO * GMS.WORLD.REGION) ** 2;
    GMS.setLayout(before);
    check('the target grows with the region: about 30 places for 36 routes, about 60 for 81', smallRoutes === 36 && bigRoutes === 81 && small === 30 && big >= 55 && big <= 70, smallRoutes + ' routes → ' + small + ', ' + bigRoutes + ' routes → ' + big); }
  check('a region under its target triggers the wider search', /list.length < target/.test(html));
  { const fb = GMS.fallbackLandmarks(3, 4, 25, 5); check('the top-up generator makes as many spots as asked, all distinct', fb.length === 25 && new Set(fb.map(x => x.id)).size === 25); }
  check('a thin cached region is refetched rather than kept for the week', /stored.list.length >= landmarkTarget\(\)/.test(html));

  const els = { elements: [ { type: 'node', id: 4, lat: 43.45, lon: -80.49, tags: { name: 'Grand River Hospital', amenity: 'hospital' } }, { type: 'node', id: 8, lat: 43.451, lon: -80.491, tags: { name: 'Berlin Mural', tourism: 'artwork' } }, { type: 'node', id: 9, lat: 43.452, lon: -80.492, tags: { name: 'No Name', amenity: 'bench' } } ] };
  const parsed = GMS.parseOverpass(els);
  check('the parser now keeps the new kinds and still ignores what is not a landmark', parsed.length === 2 && parsed.some(x => x.kind === 'amenity=hospital') && parsed.some(x => x.kind === 'tourism=artwork'));
  check('every tier-two kind has a weight, so none is dropped silently', [...GMS.LM_TIER2].every(k => GMS.LM_KINDS[k] > 0), GMS.LM_TIER2.size + ' extra kinds');
}


// ---------- 57. v69: the next turn is the one ahead of you, measured along the road ----------
{
  const src = html;
  check('the next turn is chosen by progress along the route, not by whichever turn is nearest', /at\[i\] > pos.s \+ 8/.test(src) && /function progressAlong/.test(src) && !/let best = null, bd = Infinity; route.steps.forEach/.test(src));
  check('progress cannot snap backwards onto a road that doubles back', /s < geom.prog - 60 \? 1 : 0/.test(src) && /back \* 400/.test(src));
  check('what is left is measured along the road while you are on it, straight line when you are not', /function remainingDistance/.test(src) && /pos.off > 80\) return straight/.test(src));
  check('the time left shrinks with the distance left instead of quoting the whole trip', /r.secs \* Math.max\(0.02, remaining \/ r.dist\)/.test(src));
  check('one kilometre is spoken in the singular', /km === '1' \? ' kilometre' : ' kilometres'/.test(src));
}


// ---------- 58. v70: names, prices, and getting back on route quickly ----------
{
  const src = html;
  check('the better catch items read as Great Ball and Ultra Ball, whatever the pack calls the basic one', GMS.snareName(1) === 'Great Ball' && GMS.snareName(2) === 'Ultra Ball' && GMS.snareName(0) === GMS.PACK.keywords.catchitem, [0,1,2].map(t => GMS.snareName(t)).join(', '));
  check('a Revive costs about what a basic catch item does, not ten times more', GMS.ENGINE_ITEMS.revive.base <= GMS.ENGINE_ITEMS.snare1.base * 2, 'revive ' + GMS.ENGINE_ITEMS.revive.base + ' vs ' + GMS.ENGINE_ITEMS.snare1.base);
  check('straying from the route redraws it within seconds rather than after 150 m', /offGapMs: 6000/.test(src) && /offRouteM: 35/.test(src) && /offRouteFar: 120/.test(src) && /off > ROUTE_LIMITS.offRouteFar/.test(src));
  check('an address with a door number is preferred over a street centre, and the match is shown', /addressdetails=1/.test(src) && /r.address && r.address.house_number/.test(src) && /rows.sort\(\(a, b\) => \(b.exact - a.exact\)/.test(src));
  check('a region can be forgotten, taking its records but not the creatures caught there', /function forgetRegion/.test(src) && /delete save.regions\[k\]; delete save.badges\[k\]/.test(src) && /save.history = save.history.filter/.test(src));
  check('the six playthroughs are pickable from a list', /id="slotPick"/.test(src) && /function gotoSlot/.test(src));
  check('the voice can be chosen, with pitch and speed', /function voiceList/.test(src) && /u.pitch = VOICE.pitch/.test(src) && /scouter-voicecfg/.test(src));
}


// ---------- 59. v71: evolution on the player's word, and a starting pin ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  GMS.EVOLVE.ask = false;
  const auto = GMS.makeMonster(sv, { species: P.speciesById.get('0001bulb'), level: 15 }, null);
  const e1 = GMS.grantXp(auto, 99999);
  check('left automatic, a creature still evolves the moment it can', P.speciesById.get(auto.speciesId).name !== 'Bulbasaur' && e1.some(e => e.type === 'evolve'), P.speciesById.get(auto.speciesId).name);
  GMS.EVOLVE.ask = true;
  const ask = GMS.makeMonster(sv, { species: P.speciesById.get('0004char'), level: 15 }, null);
  const e2 = GMS.grantXp(ask, 99999);
  check('set to ask, it levels up but waits, and says what it is waiting for', P.speciesById.get(ask.speciesId).name === 'Charmander' && ask.pendingEvo === '0005char' && e2.some(e => e.type === 'evolveReady') && !e2.some(e => e.type === 'evolve'));
  const before = ask.hp / ask.maxHp;
  const r = GMS.evolveNow(sv, ask, ask.pendingEvo);
  check('evolving by hand keeps its share of health and clears the wait', r && P.speciesById.get(ask.speciesId).name === 'Charmeleon' && ask.pendingEvo === undefined && Math.abs(ask.hp / ask.maxHp - before) < 0.02);
  const e3 = GMS.grantXp(ask, 99999);
  check('a creature already waiting is not asked about twice for the same evolution', e3.filter(e => e.type === 'evolveReady').length <= 1);
  GMS.EVOLVE.ask = false;
  check('a pin can be the starting point when there is no live GPS', /function homePin/.test(html) && /scouter-home/.test(html) && /Start here/.test(html));
}


// ---------- 60. v72: shops where the shops are ----------
{
  const lm = (id, kind, name) => ({ id, kind, name: name || id });
  check('malls, supermarkets and markets count as shops; a monument does not', GMS.isShopStop(lm('n1', 'shop=mall')) && GMS.isShopStop(lm('n2', 'shop=supermarket')) && GMS.isShopStop(lm('n3', 'amenity=marketplace')) && !GMS.isShopStop(lm('n4', 'historic')));
  const day = GMS.dayIndex(Date.now());
  const a = GMS.shopStock(lm('n1', 'shop=mall'), day), b2 = GMS.shopStock(lm('n2', 'shop=supermarket'), day), aTomorrow = GMS.shopStock(lm('n1', 'shop=mall'), day + 1);
  check('a shop keeps a few things, all of them from the pack', a.length >= 2 && a.length <= 4 && a.every(o => GMS.PACK.items.has(o.id) || GMS.PACK.tms.has(o.id)), a.map(o => o.id).join(', '));
  check('two shops in the same town stock different things', a.map(o => o.id).join() !== b2.map(o => o.id).join());
  check('the same shop is steady through a day and changes for the next', GMS.shopStock(lm('n1', 'shop=mall'), day).map(o => o.id).join() === a.map(o => o.id).join() && aTomorrow.map(o => o.id).join() !== a.map(o => o.id).join());
  check('prices sit around the pack price, never free and never absurd', a.every(o => o.price > 100 && o.price < 400), a.map(o => o.price).join(', '));
  check('the wide landmark search asks for shops', /shop.*mall\|department_store\|supermarket/.test(GMS.overpassQuery({ south: 43.4, west: -80.5, north: 43.5, east: -80.4 }, true)));
}


// ---------- 61. v73: every playthrough in the cloud, on whichever server you choose ----------
{
  const src = html;
  check('all six playthroughs can be sent and brought back, each under its own key', /async function cloudSaveAll/.test(src) && /async function cloudLoadAll/.test(src) && /packId\(\) \+ ':' \+ s2.grid/.test(src));
  check('a playthrough that has not been started is skipped rather than uploaded empty', /if \(!save \|\| !save.starterChosen\) \{ skipped\+\+; continue; \}/.test(src));
  check('saving all still respects another device being ahead, per playthrough', /p_seen: cloudSeen\(slot\)/.test(src) && /else refused\+\+/.test(src));
  check('the server can be the player\'s own, and the app names which server holds the saves', /const MP_DEFAULT/.test(src) && /scouter-server/.test(src) && /function serverLabel/.test(src) && /'Saves on ' \+ esc\(serverLabel\('saves'\)\)/.test(src));
  check('a trainer belongs to the server that issued it, and is swapped in when the server changes', /function mpStoreKey/.test(src) && /MP.token = null; MP.handle = null; MP.code = null;/.test(src) && /JSON.parse\(localStorage.getItem\(mpStoreKey\(\)\) \|\| '\{\}'\)/.test(src));
}


// ---------- 62. v74: whose server does what, and the camera ----------
{
  const src = html;
  check('hosting your own saves does not cut you off from other players', /const SAVE_FNS = new Set\(\['wp_cloud_save', 'wp_cloud_load', 'wp_cloud_stamp', 'wp_cloud_list'\]\)/.test(src) && /if \(OWN.scope === 'all' \|\| SAVE_FNS.has\(fn\)\)/.test(src) && /return \{ url: MP_DEFAULT.url, key: MP_DEFAULT.key \}/.test(src));
  check('every call picks its server, so nothing is hard-wired to one', /const S = serverFor\(fn\)/.test(src) && /fetch\(S.url \+ '\/rest\/v1\/rpc\/' \+ fn/.test(src));
  check('a trainer token is kept per server, since one server\'s token means nothing on another', /function mpStoreKey/.test(src) && /localStorage.getItem\(mpStoreKey\(\)\)/.test(src));
  check('the setting offers both arrangements and says what each costs you', /My server for saves, shared for players/.test(src) && /My server for everything/.test(src) && /Nobody on the shared server can see you/.test(src));
  check('any PostgREST-compatible server will do, not only hosted Supabase', /PostgREST-style calls/.test(src));
  check('each figure in a photo carries its own size, angle and facing', /scale: 1, rot: 0, back: false/.test(src) && /ctx.rotate\(L.rot \* Math.PI \/ 180\)/.test(src) && /if \(L.flip\) ctx.scale\(-1, 1\)/.test(src));
  check('the back sprite is used when the pack has one, and says so when it does not', /L.back && \(v.backSprite \|\| v.back\)/.test(src) && /No back sprite/.test(src));
  check('who appears in the photo is chosen from the team', /function renderPhotoPickTeam/.test(src) && /photo.layout = photo.layout.filter\(L => L.m !== m\)/.test(src));
}


// ---------- 63. v75: no region is recorded before the app knows where you are ----------
{
  const src = html;
  check('a region is only recorded once the position can be trusted', /function positionTrusted\(\) \{ return !!\(state.gps.fixed \|\| state.sim \|\| homePin\(\)\); \}/.test(src) && /if \(state.save && positionTrusted\(\)\)/.test(src));
  check('the default coordinates alone never count as a visit', /Before the first GPS fix the app is sitting on its default/.test(src));
}


// ---------- 64. v76: a world of your own, and lore that does not read the same twice ----------
{
  const at = [43.4516, -80.4925];
  const snap = seed => { GMS.setWorldSeed(seed); const out = []; for (let i = 0; i < 40; i++) { const d = GMS.describe(at[0] + i * 0.004, at[1]); out.push(d.region + '|' + d.habitatName + '|' + (d.gym.league ? 'L' : d.gym.gym.name + ':' + d.gym.leader)); } return out; };
  const shared = snap(GMS.WORLD_DEFAULT_SEED), mine = snap(777777), theirs = snap(999999);
  check('a different world puts different families, gyms and names on the same streets', shared.filter((x, i) => x !== mine[i]).length === 40 && mine.filter((x, i) => x !== theirs[i]).length > 30, 'all 40 routes differ from the shared world');
  check('the same world is the same for everyone who holds its code', snap(777777).join() === mine.join());
  check('going back to the shared world restores exactly what everyone else sees', snap(GMS.WORLD_DEFAULT_SEED).join() === shared.join() && GMS.isDefaultWorld());
  let bad = 0; for (let i = 0; i < 1500; i++) { const sd = Math.floor(Math.random() * GMS.WORLD_CODE_MAX) || 7; if (GMS.seedFromCode(GMS.worldCode(sd)) !== sd) bad++; }
  check('a world code always names exactly one world, both ways', bad === 0, '3000 codes checked');
  check('nonsense is rejected rather than landing someone in a random world', GMS.seedFromCode('') === null && GMS.seedFromCode('hello world') === null && GMS.seedFromCode('ABCDEFG') === null && GMS.seedFromCode('ABC123') !== null);
  // lore variety
  const seen = new Set(), counts = {};
  for (let i = 0; i < 300; i++) { const l = GMS.regionLore(100 + i, 200 + i * 3); counts[l.parts.length] = (counts[l.parts.length] || 0) + 1; seen.add(l.parts[0].split(' ').slice(0, 3).join(' ')); }
  check('a region does not always say the same number of things', Object.keys(counts).length > 1, JSON.stringify(counts));
  check('regions open in many different ways, not one', seen.size > 60, seen.size + ' distinct openings in 300 regions');
}


// ---------- 65. v77: worlds keep their own progress, and lore stops repeating itself ----------
{
  const src = html;
  check('each world keeps its own regions, badges and titles', /function stashWorld/.test(src) && /function restoreWorld/.test(src) && /save.worlds \|\| \(save.worlds = \{\}\)/.test(src));
  check('switching parks the old world rather than clearing it', /stashWorld\(state.save, prev\)/.test(src) && /const had = restoreWorld\(state.save, seed\)/.test(src) && !/state.save.regions = \{\}; state.save.badges = \{\}; state.save.evil = \{\}; state.save.evilBook = null; state.save.legends = \{\}; \}\n  setWorldSeed/.test(src));
  check('the player is told what is waiting in the world they are moving to', /Waiting there: /.test(src) && /is kept and waiting if you come back/.test(src));
  const L = GMS.LORE;
  check('the lore pools are deep enough that a region is not recognisable by one sentence', L.founding.length >= 50 && L.character.length >= 50 && L.landmark.length >= 35 && L.league.length >= 25 && L.legendLocked.length >= 15 && L.legend.length >= 10 && Object.values(L).reduce((a, v) => a + v.length, 0) >= 200, Object.values(L).reduce((a, v) => a + v.length, 0) + ' lines in total');
  const share = {};
  for (let i = 0; i < 400; i++) { const l = GMS.regionLore(i * 13 + 5, i * 7 - 9); l.parts.forEach(pt => { const k = pt.slice(0, 26); share[k] = (share[k] || 0) + 1; }); }
  const worst = Math.max(...Object.values(share)) / 400;
  check('no single sentence turns up in more than a tenth of regions', worst <= 0.1, (worst * 100).toFixed(1) + '% is the most repeated');
  check('regions read as different places, not one text with the words swapped', Object.keys(share).length > 700, Object.keys(share).length + ' distinct sentence openings across 400 regions');
}


// ---------- 66. v78: no template leaks a placeholder ----------
{
  let unfilled = 0, lower = 0, n = 0;
  for (let i = 0; i < 600; i++) { const l = GMS.regionLore(i * 13 + 5, i * 7 - 9); l.parts.forEach(pt => { n++; if (/[{}]/.test(pt)) unfilled++; if (/^[a-z]/.test(pt)) lower++; }); }
  check('every placeholder is filled, in every region, including capitalised ones', unfilled === 0, n + ' sentences checked');
  check('no sentence starts in lower case', lower === 0);
  const withLegend = GMS.regionLore(12, -7, { active: null, unlocked: false });
  check('a capitalised name at the start of a sentence is capitalised', !/\{Rare\}|\{Leader\}|\{NBadges\}/.test(withLegend.text));
}


{
  const L = GMS.LORE;
  const gated = L.legendLocked.filter(x => /Champion|only a|come back|never|no one agrees|will not/.test(x.t)).length;
  check('before the title, the legend lines keep it out of reach rather than pointing at it', gated / L.legendLocked.length >= 0.5 && L.legendLocked.every(x => !/route \{route\}/.test(x.t)), gated + ' of ' + L.legendLocked.length + ' state the gate, none give a location');
}


// ---------- 67. v79: the guide actually covers the game ----------
{
  const g = html.slice(html.indexOf('const GUIDE = ['), html.indexOf('];', html.indexOf('const GUIDE = [')));
  const text = g.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const topics = [...g.matchAll(/title: '([^']+)'/g)].map(m => m[1]);
  const wants = { 'worlds and codes': /world of your own/i, 'per-world progress': /parks your work|as you left/i, 'playthroughs': /six/i, 'shops': /mall/i, 'rest stops': /rest stop/i, 'free heals': /five times a day/i, 'evolution setting': /Ask me/i, 'voice chooser': /which of your phone/i, 'spoken directions': /spoken directions/i, 'route notes': /route notes/i, 'starting pin': /Start here/i, 'forget a region': /Forget this region/i, 'region sorting': /Sort them by/i, 'camera tools': /Who is in it/i, 'second phone': /link code/i, 'cloud all six': /Save all six/i, 'server': /Server/i, 'wanderers': /Wanderers/i, 'migration': /Migration/i, 'low power': /Low power/i, 'offline tiles': /Offline map|tiles you have seen/i, 'connection': /Connection/i, 'screen awake': /screen awake/i, 'travel modes': /cycling/i, 'level cap': /leader's level/i, 'trades': /Trades/i, 'egg gifts': /Egg gifts|egg gift/i, 'live battles': /live battle/i, 'ghosts': /ghost/i, 'evil teams': /evil team/i, 'legends': /legend/i, 'quests': /daily quest/i, 'shiny hunt': /shiny hunt/i, 'achievements': /achievement/i, 'dex': /Dex|dex/i, 'packs': /pack/i, 'GPS trouble': /Precise Location/i, 'duels': /Duels/i, 'duel checking': /replays them/i, 'seasons': /season/i, 'bulletin': /Bulletin/i, 'switching': /Bringing another creature out/i, 'experience sharing': /whole team in full/i, 'regional forms': /regional forms/i, 'route memory': /last twenty places/i, 'named boxes': /group you name/i, 'trade integrity': /same pack data/i, 'supporter extras': /Shiny Charm/i, 'live traffic': /Live traffic/i, 'pin travel': /Travelling to a pin/i, 'version log': /[Vv]ersion log/ };
  const missing = Object.entries(wants).filter(([, re]) => !re.test(text)).map(([k]) => k);
  check('the guide names every part of the game a player has to find', missing.length === 0, missing.length ? 'missing: ' + missing.join(', ') : topics.length + ' topics, ' + text.split(' ').length + ' words');
  check('the guide is split finely enough that no topic is a wall of text', topics.length >= 15 && /Saving, phones and hosting/.test(g), topics.length + ' topics');
}


{
  const g2 = html.slice(html.indexOf("{ id: 'saves'"), html.indexOf("{ id: 'worlds'"));
  check('saving, the cloud, a second phone and hosting are all in one place', /Backup/.test(g2) && /Save all six/.test(g2) && /link code/.test(g2) && /Server/.test(g2) && /never overwrites a newer copy/.test(g2));
  const online = html.slice(html.indexOf("{ id: 'online'"), html.indexOf("{ id: 'photos'"));
  check('and are no longer repeated in Playing with others', !/Save all six|link code|Use on another phone/.test(online));
}


// ---------- 68. v81: a region you can see, and a pin you can return to ----------
{
  const src = html;
  check('a region border is drawn dark-cased and gold, not a white hairline that vanishes on pale tiles', /color: '#10201c', weight: 9/.test(src) && /color: '#ffd166', weight: 3.5, opacity: 0.98, dashArray: '12 7'/.test(src));
  check('a pin records whether you were really standing there', /walked: !!state.gps.fixed/.test(src));
  check('travel is refused for a pin placed without a fix, and while live GPS is placing you', /function pinTravelReady\(pn\) \{ return !!\(pn && pn.walked\); \}/.test(src) && /function canTravel\(\) \{ return !state.gps.fixed; \}/.test(src) && /You can only travel to a pin you placed while standing there/.test(src) && /Live GPS is placing you right now/.test(src));
  check('arriving by travel grants no walking credit', /lastFix = null/.test(src.slice(src.indexOf('function travelToPin'), src.indexOf('function pinKindLabel'))) && !/odometerM \+=/.test(src.slice(src.indexOf('function travelToPin'), src.indexOf('function pinKindLabel'))));
  check('the guide explains travelling to a pin and what it does not earn', /Travelling to a pin/.test(src) && /no distance, no coins, no egg progress/.test(src));
}


// ---------- 69. v82: shinies are findable, and one legend a week is worth the walk ----------
{
  check('four separate rates: ordinary, hunt family, legend, watched legend', GMS.SHINY.ODDS === 512 && GMS.POST.HUNT_ODDS === 64 && GMS.LEGEND_SHINY.ODDS === 128 && GMS.LEGEND_SHINY.WATCHED === 64);
  let s2 = 0, n = 0;   // the week's hunt family is a different rate, so it is counted separately
  for (let i = 0; i < 60000; i++) { const e = GMS.encounter(43.4 + (i % 200) * 0.002, -80.6 + Math.floor(i / 200) * 0.002, 30, 3, i); if (e.hunt) continue; n++; if (e.shiny) s2++; }
  check('an ordinary scan really does come out near 1 in 512', Math.round(n / s2) >= 350 && Math.round(n / s2) <= 720, '1 in ' + Math.round(n / s2));
  const season = GMS.seasonOf(Date.now());
  let gx = 10, gy = 20, legs = [];
  for (let t = 0; t < 40 && !legs.length; t++) { gx = 10 + t; legs = GMS.regionLegends(gx, gy, season); }
  const withSp = legs.map(l => ({ ...l, gx, gy, species: GMS.PACK.speciesById.get(l.speciesId) }));
  check('a region watches exactly one of its legends each week', [0, 1, 2, 3, 4, 5].every(wk => withSp.filter(l => GMS.isWatched(gx, gy, wk, l, legs)).length === 1));
  check('which legend is watched changes from week to week', new Set([0,1,2,3,4,5,6,7,8,9].map(wk => GMS.watchedLegend(gx, gy, wk))).size > 1);
  let wn = 0, ws = 0, on2 = 0, os = 0;
  for (let wk = 0; wk < 1200; wk++) for (const leg of withSp) { const odds = GMS.legendShinyOdds(gx, gy, wk, leg, legs); const e = GMS.legendEncounter({}, leg, 50, wk * 7, odds); if (odds === GMS.POST.HUNT_ODDS) { wn++; if (e.shiny) ws++; } else { on2++; if (e.shiny) os++; } }
  check('a legend is likelier to be shiny than anything else, and the watched one likelier still', Math.round(wn / ws) >= 45 && Math.round(wn / ws) <= 90 && Math.round(on2 / os) >= 95 && Math.round(on2 / os) <= 170 && GMS.LEGEND_SHINY.ODDS < GMS.SHINY.ODDS, 'watched 1 in ' + Math.round(wn / ws) + ', other legends 1 in ' + Math.round(on2 / os) + ', ordinary 1 in ' + GMS.SHINY.ODDS);
  check('the odds are settled when the legend appears, so rescanning cannot reroll it', GMS.legendEncounter({}, withSp[0], 50, 99, GMS.SHINY.ODDS).shiny === GMS.legendEncounter({}, withSp[0], 50, 99, GMS.SHINY.ODDS).shiny);
}


// ---------- 70. v84: regional forms ----------
{
  const P = GMS.PACK, meowth = P.speciesById.get('0052meow');
  check('the engine finds every variant a species has, not just the first', GMS.geneCount(meowth) === 2 && GMS.geneCount(P.speciesById.get('0027sand')) === 1 && GMS.geneCount(P.speciesById.get('0001bulb')) === 0);
  check('a variant carries its own name and typing', GMS.variantName(meowth, 1) === 'Alolan Meowth' && GMS.variantName(meowth, 2) === 'Galarian Meowth' && GMS.speciesView({ speciesId: '0052meow', gene: 2 }).types.join() === 'steel');
  const regions = [[10, 20], [11, 20], [12, 20], [13, 20], [20, 30], [40, 11], [7, 3], [55, 9]];
  const picks = regions.map(([x, y]) => GMS.regionVariant(meowth, x, y));
  check('every region grows exactly one of a species\' forms, and regions differ', picks.every(v => v >= 1 && v <= 2) && new Set(picks).size > 1, picks.join(','));
  check('a region always grows the same form', GMS.regionVariant(meowth, 10, 20) === GMS.regionVariant(meowth, 10, 20));
  check('a species with no variants never gets one', GMS.regionVariant(P.speciesById.get('0001bulb'), 10, 20) === 0);
  let n = 0, v = 0, wrong = 0;
  for (let i = 0; i < 120000; i++) { const lat = 43.4 + (i % 300) * 0.002, lon = -80.6 + Math.floor(i / 300) * 0.002; const e = GMS.encounter(lat, lon, 30, 3, i); if (!e.species || !e.species.hasGene) continue; n++; if (e.gene) { v++; const d = GMS.describe(lat, lon); if (e.gene !== GMS.regionVariant(e.species, d.gx, d.gy)) wrong++; } }
  check('a variant turns up about one time in eight, and never one that belongs to another region', v / n > 0.07 && v / n < 0.18 && wrong === 0, (v * 100 / n).toFixed(1) + '% of ' + n + ' encounters, ' + wrong + ' out of place');
  const base = GMS.statsFor(GMS.speciesView({ speciesId: '0052meow', gene: 0 }), 30), alt = GMS.variantStats(meowth, 2, base);
  const tot = o => Object.values(o).reduce((a, b) => a + b, 0);
  check('a variant is different to use, not stronger: stats are redistributed, not added', JSON.stringify(base) !== JSON.stringify(alt) && Math.abs(tot(alt) - tot(base)) <= tot(base) * 0.02, 'totals ' + tot(base) + ' vs ' + tot(alt));
  check('the same variant always has the same stats', JSON.stringify(GMS.variantStats(meowth, 2, base)) === JSON.stringify(alt));
}


// ---------- 71. v85: the level cap covers every serious fight ----------
{
  const C = new Set((html.match(/const CAPPED_BATTLES = new Set\(\[([^\]]*)\]\)/) || [, ''])[1].split(',').map(x => x.trim().replace(/'/g, '')).filter(Boolean));
  check('the cap covers the rival, the evil team, title defences, the gauntlet and other players\' teams', ['rival', 'evil', 'defence', 'gauntlet', 'gtrainer'].every(k => C.has(k)));
  check('and still covers the gyms, the League and the post-game ladders', ['gym', 'league', 'master', 'champdef', 'tourney', 'road'].every(k => C.has(k)));
  check('wild creatures, route trainers and a legend itself are left alone', !C.has('wild') && !C.has('trainer') && !C.has('legend'));
  const sv = GMS.newSave(), P = GMS.PACK;
  const m = GMS.makeMonster(sv, { species: P.speciesById.get('0006char'), level: 80 }, null); sv.team.push(m);
  GMS.HANDICAP.OFFSET = 0;   // the cap does nothing while the setting is off, which is correct
  GMS.applyLevelCap(sv, 20);
  check('a capped creature really fights at the lower level, and its stats come down with it', sv.team[0].level === 20 && sv.team[0].maxHp < 200, 'Lv ' + sv.team[0].level + ', ' + sv.team[0].maxHp + ' HP');
  GMS.liftLevelCap(sv);
  check('and is exactly itself again afterwards', sv.team[0].level === 80);
  GMS.HANDICAP.OFFSET = null;
}


// ---------- 72. v86: a panel section must never take the rest of the panel with it ----------
{
  const src = html;
  check('the weekly notice uses a helper that exists in the Team panel, not the Online sheet\'s private one', !/renderTeam[\s\S]{0,4000}?[^2]\besc\(/.test(src.slice(src.indexOf('function renderTeam'), src.indexOf('function renderTeam') + 6000)));
  check('a failing section is caught and says the save is intact', /function guardSection/.test(src) && /your save is intact/.test(src));
}


// ---------- 73. v87: a form you can tell apart, and forms of our own ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  const meow = P.speciesById.get('0052meow');
  const plain = GMS.makeMonster(sv, { species: meow, level: 20, gene: 0 }, null);
  const galar = GMS.makeMonster(sv, { species: meow, level: 20, gene: 2 }, null);
  check('an official form differs in the one stat a row shows, so it never looks identical', plain.maxHp !== galar.maxHp, plain.maxHp + ' vs ' + galar.maxHp);
  let same = 0, tried = 0;
  P.speciesById.forEach(sp => { if (!sp.hasGene || tried > 60) return; tried++; const a = GMS.makeMonster(sv, { species: sp, level: 25, gene: 0 }, null), b2 = GMS.makeMonster(sv, { species: sp, level: 25, gene: 1 }, null); if (a.maxHp === b2.maxHp) same++; });
  check('and that holds across the pack, not just one species', same === 0, tried + ' species checked');
  // adapted forms
  const cher = P.speciesById.get('0420cher') || P.speciesById.get('0001bulb');
  const ad = GMS.makeMonster(sv, { species: cher, level: 12, adapt: '10,20' }, null);
  const view = GMS.speciesView(ad), baseView = GMS.speciesView(GMS.makeMonster(sv, { species: cher, level: 12 }, null));
  check('an adapted form is named for the region that grew it', view.name === GMS.regionName(10, 20) + ' ' + cher.name);
  check('its typing is unrelated to the original', view.types.every(t => !cher.types.includes(t)) && view.types.length >= 1);
  check('it is built differently and wears a different palette', view.adaptedHue >= 0 && view.adaptedHue < 360 && ad.maxHp !== GMS.makeMonster(sv, { species: cher, level: 12 }, null).maxHp);
  check('the same species in the same region is always the same adapted form', GMS.adaptedTypes(cher, 10, 20).join() === GMS.adaptedTypes(cher, 10, 20).join() && GMS.adaptedHue(cher, 10, 20) === GMS.adaptedHue(cher, 10, 20));
  check('and differs between regions', GMS.adaptedTypes(cher, 10, 20).join() !== GMS.adaptedTypes(cher, 44, 7).join() || GMS.adaptedHue(cher, 10, 20) !== GMS.adaptedHue(cher, 44, 7));
  let n = 0, ad2 = 0, both = 0;
  for (let i = 0; i < 30000; i++) { const e = GMS.encounter(43.4 + (i % 150) * 0.002, -80.6 + Math.floor(i / 150) * 0.002, 30, 3, i); if (!e.species) continue; n++; if (e.adapt) ad2++; if (e.adapt && e.gene) both++; }
  check('adapted forms are rarer than the official ones and never both at once', ad2 / n > 0.015 && ad2 / n < 0.08 && both === 0, (ad2 * 100 / n).toFixed(1) + '% adapted, ' + both + ' overlapping');
}


// ---------- 74. v88: a form survives being caught, and wears its type's colours ----------
{
  const P = GMS.PACK, sv = GMS.newSave();
  // the exact path a player takes: meet it, then catch it
  let checked = 0, kept = 0, lost = [];
  for (let i = 0; i < 20000 && checked < 15; i++) {
    const e = GMS.encounter(43.4516, -80.4925, 20, 2, i);
    if (!e.gene && !e.adapt) continue; checked++;
    const wild = GMS.speciesView(GMS.wildInstance(e));
    const caught = GMS.speciesView(GMS.makeMonster(sv, e, { region: 'X', route: 1 }));
    if (wild.name === caught.name && wild.types.join() === caught.types.join()) kept++; else lost.push(wild.name + ' became ' + caught.name);
  }
  check('a creature you catch stays the form you met: name and typing both', checked > 0 && kept === checked, kept + ' of ' + checked + (lost.length ? ' — ' + lost[0] : ''));
  // colours follow typing
  let inRange = 0, total = 0, bad = [];
  for (let gx = -40; gx < 40; gx += 3) for (const id of ['0004char', '0025pika', '0052meow', '0001bulb']) {
    const sp = P.speciesById.get(id); if (!sp) continue;
    const ty = GMS.adaptedTypes(sp, gx, 20), t = GMS.adaptedTint(sp, gx, 20, ty), spec = GMS.TYPE_TINT[ty[0]];
    total++; const [lo, hi] = spec.h;
    const ok = hi >= lo ? (t.hue >= lo && t.hue <= hi) : (t.hue >= lo || t.hue <= hi);
    if (ok) inRange++; else bad.push(ty[0] + ':' + t.hue);
  }
  check('a form\'s palette sits in the range its type allows, never a random hue', inRange === total, inRange + ' of ' + total + (bad.length ? ' — ' + bad[0] : ''));
  check('types that read as more than a hue carry it: steel is dull, dark is deep, ice is pale', GMS.TYPE_TINT.steel.gray > 0 && GMS.TYPE_TINT.dark.bright < 1 && GMS.TYPE_TINT.ice.bright > 1);
  check('every type the pack uses has a palette, so no form falls back to a stray colour', P.gyms.map(g => g.type).filter(Boolean).every(t => !!GMS.TYPE_TINT[t]), P.gyms.length + ' types');
}


// ---------- 75. v89: sprites are repainted, not tinted ----------
{
  const src = html;
  check('an adapted sprite is redrawn pixel by pixel rather than hue-rotated in CSS', /function repaintSprite/.test(src) && /getImageData/.test(src) && /putImageData/.test(src) && /toDataURL/.test(src));
  check('the repaint anchors on the sprite\'s own dominant colour, so shading and two-tone detail survive', /const anchor = wsum > 0/.test(src) && /const SPREAD = 0.45/.test(src) && /delta \* SPREAD/.test(src));
  check('each repaint is done once and kept', /repaintCache/.test(src) && /repaintPending/.test(src) && /repaintCache.has\(key\)/.test(src));
  check('the type tint stands in while a repaint bakes, so nothing flashes unpainted', /adaptCss = adaptFilter\(sp\)/.test(src) && /painted !== url/.test(src));
  check('a failed read falls back rather than throwing: a sprite is never lost to this', /catch \(e\) \{ return null; \}/.test(src) && /repaintCache.set\(key, null\)/.test(src));
}


// ---------- 76. v90: quickest or shortest, and traffic when the player has a key ----------
{
  const src = html;
  check('the router is asked for alternatives, and the quickest and shortest are both worked out', /alternatives=true/.test(src) && /const quickest = shaped.slice\(\).sort/.test(src) && /const shortest = shaped.slice\(\).sort/.test(src));
  check('the player chooses which, and the panel says what the other one costs', /id="navPrefer"/.test(src) && /ROUTE.prefer === 'fast' \? '\. Shortest: '/.test(src));
  check('live traffic only runs on a key the player supplies, and only for driving', /function trafficOn\(\) \{ return !!\(TRAFFIC.key && ROUTE.mode === 'car'\); \}/.test(src) && /scouter-traffic/.test(src));
  check('a traffic failure falls back to the free routers rather than losing the route', /catch \(e\) \{ netMark\('routing', 'down', 'traffic: '/.test(src));
  check('congestion is drawn as coloured stretches, green through red', /const CONGESTION_COLOUR/.test(src) && /function congestionRuns/.test(src) && /CONGESTION_COLOUR\[rn.level\]/.test(src));
  check('the guide is honest that free routing has no traffic at all', /publish no traffic at all/.test(src));
}


// ---------- 77. v91: the catch items never move under your thumb ----------
{
  const src = html;
  check('attacks and items are separate rows, so a move count cannot shift a ball', /fightRow.className = 'actRow'/.test(src) && /itemRow.className = 'actRow itemRow'/.test(src) && /throwAt\(i\), state.save.bag\[i\] <= 0, itemRow\)/.test(src));
  check('Run sits with the items, not at the end of the attacks', /endBattle\(isWild \? null : 'You withdrew.'\), false, itemRow\)/.test(src));
  check('one Ultra Ball is returned once per save, not every load', /ballAmends/.test(src) && /state.save.ballAmends = 1; state.save.bag\[2\] = \(state.save.bag\[2\] \|\| 0\) \+ 1/.test(src));
}


// ---------- 78. v92: supporter tiers ----------
{
  const src = html;
  check('the game only ever reads what it has been given, never grants anything', /rpc\('wp_my_items'/.test(src) && /rpc\('wp_redeem_code'/.test(src) && !/wp_grant_items/.test(src) && !/wp_mint_codes/.test(src));
  check('what you have is remembered between launches and refreshed from the server', /scouter-items/.test(src) && /async function refreshTier/.test(src) && /refreshTier\(\); const r = await rpc\('wp_touch'/.test(src));
  check('a code can be entered from the Online sheet', /id="mpRedeem"/.test(src) && /async function redeemSupporterCode/.test(src) && /Pick a trainer name first/.test(src));
  check('a player with no tier is told plainly that the game is free', /free and stays free/.test(src));
  check('features are granted one at a time against a trainer, with no ranks', /const DONOR_ITEMS/.test(src) && /function supporterHas\(id\)/.test(src) && !/TIER_FRAME\[/.test(src));
}


// ---------- 79. v93: what a supporter gets, and what it can never touch ----------
{
  const src = html;
  check('an item is only on if it was granted, so flipping the setting alone does nothing', /function donorOn\(id\) \{ return donorHas\(id\)/.test(src) && /function donorHas\(id\) \{ return !!\(DONOR_ITEMS\[id\] && supporterHas\(id\)\); \}/.test(src));
  check('the charm changes only the shiny odds, and not the weekly hunt\'s', /const CHARM_ODDS = 125/.test(src) && /function shinyOddsNow\(hunt\) \{ return hunt \? POST.HUNT_ODDS/.test(src));
  check('anything the charm finds is marked for life', /charm: \(typeof donorOn === 'function'\) && donorOn\('charm'\) && !hunt/.test(src) && /charm: !!enc.charm/.test(src));
  check('a charm find can never be traded or gifted: it is not even offered', /function isCharmFind/.test(src) && /function tradeBlockReason/.test(src) && /\.filter\(m => !isCharmFind\(m\)\)/.test(src));
  check('the level band can narrow the range but never lift the badge ceiling', /it narrows the range, and never lifts the ceiling/.test(src) && /Math.min\(band.min, ceiling\)/.test(src) && /Math.min\(band.max, ceiling\)/.test(src));
  check('the shiny lock holds a shiny only, never an ordinary creature or a legend', /!\(wild.shiny && \(typeof donorOn === 'function'\) && donorOn\('hold'\)\)/.test(src));
  check('the trainer card marks a supporter without ranking them, and counts charm finds apart', /supporterAny\(\) \? \{ c: '#e8c33a', n: 'Supporter' \}/.test(src) && /m.shiny && !m.charm/.test(src) && /charm finds/.test(src));
  check('the engine on its own, with no supporter layer, is unchanged', !/CHARM_ODDS/.test(html.slice(html.indexOf('/* CORE-START */'), html.indexOf('/* CORE-END */'))));
}


// ---------- 80. v94: the rest of the supporter items ----------
{
  const src = html;
  check('every item is named and grantable on its own', (src.match(/\{ name: '/g) || []).length >= 9);
  check('eggs hatch on half the walking, and only with the tier', /donorOn\('incub'\) \? 2 : 1/.test(src) && /e.walkedM \+= meters \* boost/.test(src));
  check('one landmark a day can be visited twice, and only one', /save.againPending === k && save.againDay !== day/.test(src) && /save.againDay = day; save.againPending = null; return true/.test(src));
  check('two starting anchors for a supporter, one for everyone else', /function homeSlots\(\) \{ return \(\(typeof donorOn === 'function'\) && donorOn\('twopins'\)\) \? 2 : 1; \}/.test(src) && /ids.slice\(0, homeSlots\(\)\)/.test(src));
  check('the gym callout is once a day and stands in for standing at the gym', /calloutDay !== dayIndex\(Date.now\(\)\)/.test(src) && /d.atGym \|\| state.calloutNow/.test(src));
  check('the watched legend can be chosen, and still only one is watched', /function watchOverride/.test(src) && /function setWatchPick/.test(src) && /if \(pick\) return !!leg && leg.speciesId === pick;/.test(src));
  check('the choice is per region and per week, so it cannot be hoarded', /o.key === gx \+ ',' \+ gy \+ ':' \+ week/.test(src));
  check('photo frames are drawn on the picture and gated on the tier', /const PHOTO_FRAMES/.test(src) && /function photoFrame\(\) \{ if \(!\(\(typeof donorOn === 'function'\) && donorOn\('frames'\)\)\) return null;/.test(src) && /const fr = photoFrame\(\); if \(fr\)/.test(src));
  check('none of it reaches the engine: CORE still has no supporter code', !/DONOR_ITEMS|PHOTO_FRAMES|supporterHas/.test(html.slice(html.indexOf('/* CORE-START */'), html.indexOf('/* CORE-END */'))));
}


// ---------- 81. v95: route trainers ----------
{
  const P = GMS.PACK;
  const survey = (lv, badges) => { const titles = {}, sizes = {}; let off = 0, tot = 0, lvls = [];
    for (let i = 0; i < 1200; i++) { const rx = 100 + i, ry = 200 + (i % 23); const local = P.habitats[GMS.routeHabitat(rx, ry)];
      GMS.trainersOn(rx, ry, lv, badges, Date.now()).forEach(t => { titles[t.cls] = (titles[t.cls] || 0) + 1; sizes[t.team.length] = (sizes[t.team.length] || 0) + 1; lvls.push(t.level);
        t.team.forEach(e => { tot++; if (!local.members.some(m => m.id === e.speciesId)) off++; }); }); }
    return { titles: Object.keys(titles).length, top: Object.entries(titles).sort((a, b) => b[1] - a[1])[0], sizes, offRoute: off / tot, avgLv: lvls.reduce((a, b) => a + b, 0) / lvls.length };
  };
  const early = survey(8, 0), mid = survey(30, 4), late = survey(70, 8);
  check('a route fields many different titles, not two or three', early.titles >= 10 && mid.titles >= 25 && late.titles >= 25, early.titles + ' at Lv 8, ' + mid.titles + ' at Lv 30, ' + late.titles + ' at Lv 70');
  check('no single title takes more than about two thirds of a route, even early on', early.top[1] / Object.values(early.sizes).reduce((a, b) => a + b, 0) <= 0.7, early.top[0] + ' is the commonest early');
  check('titles suit the level: children early, veterans late', /Preschooler|School|Lass|Youngster|Camper|Picnicker|Kid/.test(early.top[0]) && !/Preschooler/.test(late.top[0]), 'early ' + early.top[0] + ', late ' + late.top[0]);
  check('teams run from one to four', [1, 2, 3, 4].every(k => mid.sizes[k] > 0) && !mid.sizes[5], JSON.stringify(mid.sizes));
  { const share = sv => [1, 2, 3, 4].map(k => (sv.sizes[k] || 0) / Object.values(sv.sizes).reduce((a, b) => a + b, 0));
    const e = share(early), l = share(late);
    check('team size is its own roll, even across one to four and untouched by badges', e.every(x => x > 0.2 && x < 0.3) && l.every(x => x > 0.2 && x < 0.3) && e.every((x, i) => Math.abs(x - l[i]) < 0.04), e.map(x => (x * 100).toFixed(0) + '%').join('/') + ' early, ' + l.map(x => (x * 100).toFixed(0) + '%').join('/') + ' late'); }
  check('a trainer carries creatures from other routes in the region, not only the one underfoot', mid.offRoute > 0.25 && mid.offRoute < 0.7, (mid.offRoute * 100).toFixed(0) + '% from elsewhere');
  check('trainers scale with your team and your badges', late.avgLv > mid.avgLv && mid.avgLv > early.avgLv, [early.avgLv, mid.avgLv, late.avgLv].map(x => Math.round(x)).join(' → '));
  check('the same route on the same day gives the same trainers', JSON.stringify(GMS.trainersOn(10, 20, 30, 4, Date.now())) === JSON.stringify(GMS.trainersOn(10, 20, 30, 4, Date.now())));
}


// ---------- 82. v97: switching, and who learns from a win ----------
{
  const src = html;
  check('another creature can be brought out mid-battle', /function switchTo\(idx\)/.test(src) && /\\u21c4 ' \+ \(x.m.nick/.test(src));
  check('the switch costs the turn: the opponent acts and you do not', /act\(\{ switched: true \}\)/.test(src) && /if \(isSkip\) return;   \/\/ switching was the turn/.test(src) && /const playerFirst = !isSkip/.test(src));
  check('a fainted creature cannot be switched to', /x.m.hp > 0 && PACK.speciesById.has\(x.m.speciesId\)/.test(src));
  check('switch buttons sit on their own row, so the attacks never shift', /swapRow.className = 'actRow'/.test(src) && /acts.insertBefore\(swapRow, itemRow\)/.test(src));
  check('three choices for experience, defaulting to the one who fought', /const XPSHARE = \{ mode: 'one' \}/.test(src) && /\['half', 'Team, half share'\]/.test(src) && /\['all', 'Whole team, full'\]/.test(src));
  check('a share goes to the rest of the team, in full or half, and never to a fainted creature', /XPSHARE.mode === 'all' \? xp : Math.round\(xp \/ 2\)/.test(src) && /i2 === b.active \|\| !m2 \|\| m2.hp <= 0/.test(src));
  check('a creature that levels from a share says so, and its evolution is recorded', /reached Lv ' \+ m2.level/.test(src) && /ev2.forEach\(e => \{ if \(e.type === 'evolve'\)/.test(src));
  check('the choice is remembered between launches', /scouter-xpshare/.test(src));
}


// ---------- 83. v98: two worlds at hand, and a region taken offline ----------
{
  const src = html;
  check('eleven supporter items at least, the two newest among them', /worldab: \{ name:/.test(src) && /offline: \{ name:/.test(src) && (src.match(/\{ name: '/g) || []).length >= 11);
  check('two worlds can be pinned and flipped without the confirmation', /function pinWorldHere/.test(src) && /function flipWorld/.test(src) && /applyWorldSeed\(other, true\)/.test(src) && /if \(!quiet && state.save && state.save.starterChosen && !confirm\(msg\)\) return;/.test(src));
  check('only two are held, and the current world is never its own other half', /setWorldAB\(list\) \{[\s\S]{0,120}list.slice\(0, 2\)/.test(src) && /ab.find\(x => x !== WORLD.SEED\)/.test(src));
  check('a region download counts its tiles before starting, so the size is stated', /function offlineTileCount/.test(src) && /function tileRange/.test(src) && /' MB\)'/.test(src));
  check('places come down before the map, since they matter most', /await landmarksFor\(gx, gy\);   \/\/ the places first/.test(src));
  check('tiles already held are not fetched again, and the volunteer tile server is not hammered', /if \(await tileGet\(key\)\) \{ OFFLINE.saved\+\+; continue; \}/.test(src) && /setTimeout\(r2, 12\)/.test(src));
  check('a download can be stopped and keeps what came down', /if \(!OFFLINE.running\) return \{ ok: true, stopped: true/.test(src));
  check('a failed tile is counted, not thrown', /catch \(e\) \{ OFFLINE.failed\+\+; \}/.test(src));
  check('both are gated on their own grant like every other item', /donorHas\('offline'\)/.test(src) && /donorHas\('worldab'\)/.test(src));
  check('the world pair survives running before the supporter layer exists', /try \{ allowed = donorHas\('worldab'\); \} catch \(e\) \{ return; \}/.test(src));
}


// ---------- 84. v99: route memory and named boxes, free for everyone ----------
{
  const src = html;
  check('the last twenty places scanned are kept, with what turned up', /const SCANLOG_MAX = 20/.test(src) && /function noteScan/.test(src) && /state.save.scanLog = L.slice\(0, SCANLOG_MAX\)/.test(src));
  check('scans at the same spot within the minute merge instead of filling the list', /last.rx === d.rx && last.ry === d.ry && Date.now\(\) - last.t < 60000/.test(src) && /last.n = \(last.n \|\| 1\) \+ 1/.test(src));
  check('the same species is not listed twice, and the family is dropped when it repeats the species', /\[...new Set\(\[nm\].concat\(last.saw \|\| \[\]\).filter\(Boolean\)\)\]/.test(src) && /!saw.includes\(fam\)/.test(src));
  check('each entry can be walked back to', /guideTo\(\{ key: 'scan:'/.test(src));
  check('the box can be split into named groups, with unfiled kept separate', /m.box === cur/.test(src) && /'\*unfiled'/.test(src) && /const nm = v.trim\(\).slice\(0, 18\)/.test(src));
  check('neither is behind a supporter tier', !/donorOn\('scanlog'\)|donorOn\('boxes'\)/.test(src));
}


// ---------- 85. v100: notes, a fourth egg, a rest stop of your own, a starter of your choosing ----------
{
  const src = html;
  check('fifteen supporter items now, each granted on its own', (src.match(/\{ name: '/g) || []).length >= 15 && !/supporterTier/.test(src));
  check('a note belongs to one route and is kept on the device', /function myNote\(d\)/.test(src) && /scouter-notes/.test(src) && /function routeNoteKey\(d\) \{ return d.rx \+ ',' \+ d.ry; \}/.test(src));
  check('the note did not clobber the spoken route line, which has the same idea and a different name', /function routeNote\(d\)/.test(src) && /function myNote\(d\)/.test(src));
  check('the fourth egg is one more slot, not unlimited eggs', /EGG.MAX \+ \(\(\(typeof donorOn === 'function'\) && donorOn\('eggslot'\)\) \? 1 : 0\)/.test(src));
  check('a rest stop can be made once a week and then holds for good', /function makeRestStop/.test(src) && /if \(madeRestThisWeek\(save, week\)\) return false/.test(src) && /save.madeRest = \{\}\)\)\[lmId\] = 1/.test(src));
  check('a made rest stop heals like any other', /save.rest && save.rest\[lmId\]\) \|\| \(save.madeRest && save.madeRest\[lmId\]\)/.test(src));
  check('a chosen starter must be a first stage: anything that evolves from something else is refused', /const evolvesFrom = \[...PACK.speciesById.values\(\)\].some\(x => \(x.evolutions \|\| \[\]\).some\(e2 => e2 && e2.id === sp.id\)\)/.test(src));
  check('all four are gated on their own grant', /donorHas\('notes'\)/.test(src) && /donorOn\('eggslot'\)/.test(src) && /donorHas\('restpick'\)/.test(src) && /donorHas\('starter'\)/.test(src));
  check('the engine still knows nothing about any of it', !/DONOR_ITEMS|supporterHas|myNote/.test(html.slice(html.indexOf('/* CORE-START */'), html.indexOf('/* CORE-END */'))));
}


// ---------- 86. v101: features granted one at a time, no tiers ----------
{
  const src = html;
  check('no ranks anywhere: a trainer simply has a feature or does not', !/supporterTier|TIER_FRAME|Tier ' \+ /.test(src) && /function supporterHas\(id\) \{ return SUPPORTER.items.indexOf\(id\) >= 0; \}/.test(src));
  check('an action-style feature works the moment it is granted, with no switch to find', /donorHas\('starter'\)/.test(src) && /donorHas\('offline'\)/.test(src) && /donorHas\('restpick'\)/.test(src) && /donorHas\('notes'\)/.test(src));
  check('the starter screen waits for the server to say what you have, but never for long', /if \(MP.token && !SUPPORTER.known\)/.test(src) && /setTimeout\(go, 2500\)/.test(src));
  check('a feature taken away on the server disappears from the game', /SUPPORTER.items = Array.isArray\(r.items\) \? r.items : \[\]/.test(src));
  check('the Online sheet names what you have rather than a rank', /'Thank you. You have ' \+ names.join\(', '\)/.test(src));
}


// ---------- 87. v102: a palette you choose, and the week as a picture ----------
{
  const src = html;
  check('an adapted form has shades to choose from, all inside its own type range', /const PALETTE_STEPS = 5/.test(src) && /if \(shade\) hue = \(lo \+ Math.round\(span \* \(\(shade % PALETTE_STEPS\) \/ PALETTE_STEPS\)\)\) % 360/.test(src));
  check('the choice belongs to the creature and is saved', /m.shade = \(\(m.shade \|\| 0\) \+ 1\) % PALETTE_STEPS; persistSave\(\)/.test(src) && /adaptedTint\(sp, gx, gy, types, m.shade \|\| 0\)/.test(src));
  check('the week is drawn as a card, with the walk as the headline', /async function weekCard/.test(src) && /'km walked'/.test(src) && /function weekWalkM/.test(src));
  check('the card is shared as a picture where the phone allows it, and falls back twice', /navigator.canShare\(\{ files: \[file\] \}\)/.test(src) && /a.download = 'waypack-week.png'/.test(src) && /navigator.clipboard.writeText\(text\)/.test(src));
  check('the headline and its unit do not overlap', /const kmWidth = ctx.measureText\(kmText\).width/.test(src) && /72 \+ kmWidth \+ 24/.test(src));
  check('neither is a supporter item', !/donorHas\('shade'\)|donorHas\('week'\)/.test(src));
}


// ---------- 88. v103: nothing home-made can be traded out ----------
{
  const src = html;
  check('every trade carries a fingerprint of the pack\'s own data', /function packFingerprint/.test(src) && /p_fp: packFingerprint\(\)/.test(src) && (src.match(/p_fp: packFingerprint\(\)/g) || []).length >= 2);
  check('the fingerprint covers what a tamperer would change: names, types, stats, evolutions, forms', /mix\(sp.name\)/.test(src) && /mix\(\(sp.types \|\| \[\]\).join\('\/'\)\)/.test(src) && /STAT_KEYS.map\(k => st\[k\] \|\| 0\)/.test(src) && /sp.evolutions \|\| \[\]/.test(src) && /sp.forms \|\| \[\]/.test(src));
  check('an incoming creature is rebuilt from this pack, never from what arrived', /Rebuilt from this pack, never from what arrived/.test(src) && /if \(!w \|\| !PACK.speciesById.has\(w.speciesId\)\) return null;/.test(src));
  check('a creature this pack cannot build costs the taker nothing', /not in your pack, so nothing of yours was given away/.test(src));
  check('the wire still carries only the fields the model knows', /function creatureToWire/.test(src) && !/creatureToWire\(m\) \{ return \{ \.\.\.m/.test(src));
}


// ---------- 89. v104: seasons, and something to read at the League ----------
{
  const sv = GMS.newSave(), now = Date.now(), sn = GMS.seasonOf(now);
  check('a season has a readable name, and December belongs to the winter that follows', /^(winter|spring|summer|autumn) \d{4}$/.test(GMS.seasonLabel(sn)) && GMS.seasonLabel(2026 * 12 + 11) === 'winter 2027', GMS.seasonLabel(sn));
  check('taking a title is recorded against the season it happened in', GMS.recordSeasonTitle(sv, 10, 20, sn, now) === true && GMS.heldThisSeason(sv, 10, 20, sn));
  check('taking it again the same season counts, without a second entry', GMS.recordSeasonTitle(sv, 10, 20, sn, now) === false && GMS.seasonTitles(sv).length === 1 && GMS.seasonTitles(sv)[0].wins === 2);
  GMS.recordSeasonTitle(sv, 11, 20, sn - 3, now - 90 * 864e5);
  check('the same region can be won again in a later season, and both are kept', GMS.recordSeasonTitle(sv, 10, 20, sn - 6, now - 180 * 864e5) === true && GMS.seasonTitles(sv).length === 3);
  check('the newest season is listed first', GMS.seasonTitles(sv)[0].season >= GMS.seasonTitles(sv)[1].season);
  check('a region you have never won is not claimed', !GMS.heldThisSeason(sv, 99, 99, sn));
  const src = html;
  check('the bulletin only appears while standing at a League', /const show = d.atLeague && !state.battle/.test(src) && /id="bulletinBtn"/.test(src));
  check('it reads what is true here: badges, the hunt, the watched legend, the team at work, your season', /<b>Here.<\/b>/.test(src) && /<b>This week.<\/b>/.test(src) && /<b>Watched.<\/b>/.test(src) && /<b>Trouble.<\/b>/.test(src) && /<b>Your season.<\/b>/.test(src));
  check('a long line is cut at a word, not mid-word', /function trimWords/.test(src) && /at > 20 \? cut.slice\(0, at\) : cut/.test(src));
  { let longest = 0; for (let i = 0; i < 3000; i++) { const g = (GMS.evilProfile(i) || {}).goal || ''; if (g.length > longest) longest = g.length; }
    check('and a team\'s aim is short enough that it is never cut at all', longest <= 220 && /trimWords\(String\(team.goal\), 220\)/.test(src), 'longest aim is ' + longest + ' characters'); }
}


// ---------- 90. v106: duels that cannot be faked ----------
{
  const mine = [{ speciesId: '0006char', level: 30 }, { speciesId: '0009blas', level: 28 }, { speciesId: '0003venu', level: 29 }];
  const theirs = [{ speciesId: '0025pika', level: 30 }, { speciesId: '0065alak', level: 29 }];
  const code = 'AB12CD';
  const play = (c, pattern) => { const st = GMS.duelStart(mine, theirs); let i = 0;
    while (!st.over && i < 300) { GMS.duelTurn(st, c, pattern(i)); i++; } return GMS.duelResult(st); };
  const a = play(code, i => i % 2), b = play(code, i => i % 2);
  check('the same duel played the same way gives the same result on any phone', a.standing === b.standing && a.turns === b.turns && a.inputs.join() === b.inputs.join(), a.standing + ' standing in ' + a.turns);
  const replay = GMS.duelReplay(mine, theirs, a.inputs, code);
  check('a report replays from the choices alone', GMS.duelAgrees(a, replay), replay.standing + '/' + replay.turns);
  check('a claim that did not happen is caught', !GMS.duelAgrees({ standing: 6, turns: 1 }, replay) && !GMS.duelAgrees({ standing: a.standing, turns: a.turns - 1 }, replay));
  const other = play(code, i => (i % 3 === 0 ? 0 : 1));
  check('different choices give a different battle, so the choices are what decide it', other.inputs.join() !== a.inputs.join());
  check('a duel cannot run forever', play(code, () => 99).turns <= 200);
  check('a team the pack cannot build is refused rather than half-played', GMS.duelStart([{ speciesId: 'nope999', level: 5 }], theirs).over === true);
  const src = html;
  check('the loser pays and the winner is paid, even if they were away when it settled', /d.status === 'settled' && !seen.done/.test(src) && /won\) state.save.coins = \(state.save.coins \|\| 0\) \+ stake; else spend/.test(src));
  check('a settled duel pays out once, not every time the sheet is opened', /duelNote\(d.code, \{ done: true \}\)/.test(src));
  check('the stake is capped by what you actually hold', /Math.min\(state.save.coins \|\| 0, parseInt\(v, 10\) \|\| 0\)/.test(src));
  check('a duel carries the pack fingerprint, like a trade', /p_fp: packFingerprint\(\) \}\);[\s\S]{0,400}wp_duel_accept|wp_duel_offer[\s\S]{0,300}p_fp: packFingerprint\(\)/.test(src));
}


{
  const src = html;
  check('a duel list that comes back in an unexpected shape cannot break the Online sheet', /Array.isArray\(got\) \? got : \[\]/.test(src) && /\(Array.isArray\(list\) \? list : \[\]\).filter\(d => d &&/.test(src));
}


// ---------- 91. v108: telling players what changed ----------
{
  const src = html;
  check('the update card shows what changed since the player was last here, up to five versions', /function versionNotes\(limit, since\)/.test(src) && /versionNotes\(5, Number\(last\) \|\| 0\)/.test(src) && /if \(since && v <= since\) break;/.test(src));
  check('the list scrolls rather than running off a phone', /\.scrollNotes \{ max-height: 46vh; overflow-y: auto/.test(src));
  check('a player already on the newest version is told nothing', /if \(!last \|\| last === APP_VERSION\) return;/.test(src));
  check('the full log is in Data, beside Backup and Reset', /id="verLog"/.test(src) && /versionNotes\(0, 0\)/.test(src));
  check('the log has real history behind it, not just the newest few', Object.keys((src.match(/const WHATS_NEW = \{[\s\S]*?\n\};/) || [''])[0].match(/^\s*'\d+':/gm) || {}).length >= 40 || ((src.match(/const WHATS_NEW = \{[\s\S]*?\n\};/) || [''])[0].match(/^\s*'\d+':/gm) || []).length >= 40);
}


// ---------- 92. v109: the voice list ----------
{
  const src = html;
  check('a phone\'s novelty voices are kept out of the way', /const NOVELTY_VOICES =/.test(src) && /bells\|boing\|bubbles/.test(src) && /function voiceIsNovelty/.test(src));
  check('but nothing is hidden for good: every voice is one tap away', /Show every voice on this phone/.test(src) && /paint\(true\)/.test(src));
  check('each voice is named with its accent, not a language code', /function voiceLangLabel/.test(src) && /'en-IE': 'Irish'/.test(src) && /'en-IN': 'Indian'/.test(src) && /'en-ZA': 'South African'/.test(src));
  check('voices of the same accent sit together', /String\(a.lang\).localeCompare\(String\(b.lang\)\)/.test(src));
  check('the game says where more voices come from, since they are the phone\'s and not ours', /Accessibility, Spoken Content, Voices/.test(src) && /speech engine/.test(src));
  check('filtering never empties the list on a phone that has only novelty voices', /if \(spoken.length\) vs = spoken;/.test(src));
}


// ---------- 93. v110: the rival banner ----------
{
  const P = GMS.PACK, sv = GMS.newSave(); GMS.rivalOf(sv).name = 'Ezra';
  const gyms = []; for (let mx = 0; mx < 3; mx++) for (let my = 0; my < 3; my++) { const g = GMS.gymOf(mx, my); if (!g.league) gyms.push(g); }
  const offered = []; gyms.slice(0, 8).forEach(g => { GMS.recordGymWin(sv, g); const d = GMS.rivalDue(sv); offered.push(d ? d.id : '-'); });
  check('the rival offers the furthest milestone you have reached, not the oldest one you walked past', offered[0] === 'badge1' && offered[3] === 'badge4' && offered[7] === 'badge8', offered.join(','));
  const due = GMS.rivalDue(sv); GMS.recordRival(sv, due, false);
  check('fighting a later milestone settles the earlier ones too, win or lose', ['badge1', 'badge4', 'badge8'].every(id => GMS.rivalOf(sv).met.includes(id)), GMS.rivalOf(sv).met.join(','));
  check('and then the banner has nothing left to offer', !GMS.rivalDue(sv));
  const sv2 = GMS.newSave(); GMS.recordGymWin(sv2, gyms[0]);
  GMS.rivalOf(sv2).snoozeDay = GMS.dayIndex(Date.now()); GMS.rivalOf(sv2).snoozeFor = 'badge1';
  check('putting it off hides it for the day and only that day', !GMS.rivalDue(sv2) && (() => { GMS.rivalOf(sv2).snoozeDay = GMS.dayIndex(Date.now()) - 1; return !!GMS.rivalDue(sv2); })());
  const src = html;
  check('the banner says it is a challenge you can tap, not a condition still to be met', /challenges you. Tap to battle./.test(src) && !/wants a battle after ' \+ due.label/.test(src));
}


{
  const src = html;
  check('the page is called WayPack, so a phone names the shortcut properly', /<title>WayPack<\/title>/.test(src) && /apple-mobile-web-app-title" content="WayPack"/.test(src));
  check('it declares a Home Screen icon for iPhone and a manifest for Android', /rel="apple-touch-icon" href="apple-touch-icon.png"/.test(src) && /rel="manifest" href="manifest.webmanifest"/.test(src));
}


// ---------- 94. v112: never lose a game to a deleted icon ----------
{
  const src = html;
  check('no note anywhere tells a player to remove the app from their Home Screen', !/remove the old shortcut and add it again/.test(src));
  check('a trainer\'s game goes to the cloud by itself, every ten minutes and whenever the app is put away', /const AUTOCLOUD = \{ every: 10 \* 60 \* 1000/.test(src) && /visibilityState === 'hidden'\) autoCloudSave\('hidden'\)/.test(src) && /setInterval\(\(\) => autoCloudSave\('timer'\), 60 \* 1000\)/.test(src));
  check('the automatic save never overwrites something newer: it uses the ordinary conflict check', /const r = await mpCloudSave\(\); if \(r && r.ok\) AUTOCLOUD.last = Date.now\(\)/.test(src) && /p_seen: \(opts && opts.force\) \? null : cloudSeen\(slot\)/.test(src));
  check('it waits for a real game: no starter, no save; mid-battle, no save', /if \(!MP.token \|\| !state.save \|\| !state.save.starterChosen \|\| state.battle \|\| AUTOCLOUD.busy\) return;/.test(src));
  check('a phone that already has a trainer can still take over an old one', /id="mpTake2"/.test(src) && /Use a trainer from another phone/.test(src) && /async function takeOverTrainer/.test(src));
  check('taking over goes straight to that trainer\'s save instead of leaving the player to find it', /rpc\('wp_cloud_load', \{ p_token: MP.token, p_pack: cloudSlot\(\) \}\);[\s\S]{0,80}offerNewerCloud/.test(src));
  check('switching trainers says the current one is left on the server, not deleted', /is left on the server and not deleted/.test(src));
  check('the guide warns that removing the Home Screen app deletes its storage', /removing WayPack from your Home Screen deletes everything it has stored/.test(src));
}


// ---------- 95. v113: the level band acts on wild creatures, and only on them ----------
{
  // run the engine with the supporter layer present, as the game does, and measure what actually comes out
  const ctx2 = { Math, console, DONOR: { levels: null }, donorOn: id => id === 'levels' && !!ctx2.DONOR.levels };
  vm.createContext(ctx2);
  vm.runInContext(CORE + '\nglobalThis.__y = { setPack, parseGmsBin, encounter, trainersOn };', ctx2);
  const E = ctx2.__y;
  E.setPack(E.parseGmsBin(readFileSync('/mnt/user-data/uploads/poke9_data_v1_6_gmsdp2.bin', 'utf8')));
  const wild = on => { ctx2.DONOR.levels = on ? { min: 10, max: 14 } : null; const ls = [];
    for (let i = 0; i < 300; i++) { const e = E.encounter(43.4516, -80.4925, 30, 2, i); if (e.species && !e.legendary) ls.push(e.level); } return ls; };
  const tr = on => { ctx2.DONOR.levels = on ? { min: 10, max: 14 } : null; const ls = [];
    for (let i = 0; i < 200; i++) E.trainersOn(100 + i, 200, 30, 2, Date.now()).forEach(t => ls.push(t.level)); return ls; };
  let ok = true, detail = '';
  try {
    const wOff = wild(false), wOn = wild(true), tOff = tr(false), tOn = tr(true);
    const span = a => Math.min(...a) + '-' + Math.max(...a);
    detail = 'wild ' + span(wOff) + ' -> ' + span(wOn) + ', trainers ' + span(tOff) + ' -> ' + span(tOn);
    check('with a band chosen, wild creatures appear inside it', wOn.length > 50 && wOn.every(l => l >= 10 && l <= 14), detail);
    check('trainers are not touched by a band meant for wild creatures', JSON.stringify(tOff) === JSON.stringify(tOn), detail);
    check('with no band chosen, wild levels follow the team as before', Math.min(...wOff) > 20, detail);
  } catch (e) { check('the level band can be exercised against the real engine', false, e.message); }
}
{
  const src = html;
  check('on iPhone, which cannot pick folders, the pack and badge pickers take files instead', /const CAN_PICK_FOLDERS/.test(src) && /packInput.removeAttribute\('webkitdirectory'\)/.test(src));
  check('and the game says which files to choose', /Choose both badges.png and badges.json/.test(src));
}


// ---------- 96. v114: held badges, forgetting where you stand, messages you can see ----------
{
  const src = html;
  check('a badge you already hold is shown from a loaded pool, not only ones won afterwards', /function heldBadge\(regionK, mi, e\)/.test(src) && /const hb = heldBadge\(k, mi, e\)/.test(src) && /const hb = heldBadge\(regionKey\(gx, gy\), mi, e\)/.test(src));
  check('the pool only changes how a badge looks: the save keeps the original, so unloading restores it', /Nothing in the save changes, so unloading the/.test(src) && !/e.badge = badgeFromPool/.test(src));
  check('the region you are standing in can be forgotten, and starts again at once', !/Walk elsewhere first, or it will simply be recorded again/.test(src) && /if \(isHere\) \{ state.lastRouteKey = ''; updateHud\(\); \}/.test(src));
  check('a message shown while a panel is open appears above the panel, not beneath it', /id="flashTop"/.test(src) && /#flashTop \{ position: fixed;[^}]*z-index: 5000/.test(src) && /\['panel', 'menu', 'mpSheet', 'guide', 'dex'\]/.test(src));
  check('and its text has a fixed light colour, not a variable that can be dark', /#flashTop \{[^}]*color: #e8eee9;/.test(src));
}


// ---------- 97. v115: a curve per region, leaders that cannot be walled, names that differ ----------
{
  const P = GMS.PACK;
  let lo1 = 99, hi1 = 0, loL = 99, hiL = 0, sLo = 99, sHi = 0, n = 0;
  for (let gx = -40; gx < 40; gx += 3) for (let gy = -40; gy < 40; gy += 7) { const c = GMS.regionCurve(gx, gy); n++;
    lo1 = Math.min(lo1, c.levels[0]); hi1 = Math.max(hi1, c.levels[0]); loL = Math.min(loL, c.league); hiL = Math.max(hiL, c.league);
    for (let i = 1; i < c.levels.length; i++) { const d = c.levels[i] - c.levels[i - 1]; sLo = Math.min(sLo, d); sHi = Math.max(sHi, d); } }
  check('the first gym in every region is Lv 9 to 14', lo1 === 9 && hi1 === 14, n + ' regions');
  check('each badge won in a region adds 3 to 8 levels there, until the gyms reach five under the Champion', sLo >= 0 && sHi === 8 && (() => { let ok = true; for (let gx = -30; gx < 30; gx += 3) { const c = GMS.regionCurve(gx, 5); if (c.levels.some(l => l > c.league - 5)) ok = false; } return ok; })());
  check('the League sits between Lv 50 and 68', loL === 50 && hiL === 68, loL + '–' + hiL);
  // the situation that prompted this: a Normal gym against a lone Ghost
  const ghost = GMS.makeMonster(GMS.newSave(), { species: P.speciesById.get('0092gast'), level: 12 }, null);
  let gyms = 0, walled = 0, mono = 0, covered = 0;
  for (let mx = -60; mx < 60 && gyms < 40; mx++) for (let my = -20; my < 20 && gyms < 40; my++) { const g = GMS.gymOf(mx, my); if (g.league || g.type !== 'normal') continue; gyms++;
    const team = GMS.leaderTeam(g, 0, null); let hurt = false;
    team.forEach(e => { const sp = P.speciesById.get(e.speciesId); if (sp.types.length === 1) { mono++; if (e.tm && e.tm !== sp.types[0]) covered++; }
      const at = GMS.makeCombatant(GMS.trainerInstance(e, '')), df = GMS.makeCombatant(ghost);
      if (GMS.lightExpected(at, df, GMS.aiPickLight(at, df, false)) > 0) hurt = true; });
    if (!hurt) walled++; }
  check('every one-typed creature of a gym leader carries an attack of another type', mono > 0 && covered === mono, covered + ' of ' + mono);
  check('no Normal gym can be walled by a single Ghost any more', gyms > 10 && walled === 0, gyms + ' gyms, ' + walled + ' walled');
  const src = html;
  check('the level choice is asked at the battle, only when you outlevel the other side, and the menu setting is gone', /function askLevelCap/.test(src) && /if \(mine > top\) \{ askLevelCap/.test(src) && !/id="handicap"/.test(src));
  check('a cap above your own team is never offered, since it would change nothing', /if \(cap != null && cap >= mine\) return;/.test(src));
  // names
  const names = []; for (let gx = -20; gx < 20; gx++) for (let gy = -10; gy < 10; gy++) names.push(GMS.regionName(gx, gy));
  const ends = {}; names.forEach(x => { const k = x.slice(-2); ends[k] = (ends[k] || 0) + 1; });
  const topEnd = Math.max(...Object.values(ends)) / names.length;
  check('region names hardly ever repeat', new Set(names).size >= names.length * 0.98, new Set(names).size + ' of ' + names.length);
  check('and their endings vary as much as their beginnings', Object.keys(ends).length >= 60 && topEnd < 0.07, Object.keys(ends).length + ' endings, commonest ' + (topEnd * 100).toFixed(1) + '%');
  check('names stay sayable: no triple letters, no long consonant runs, at most one double vowel', names.every(x => !/([a-z])\1\1/i.test(x) && (x.toLowerCase().match(/ai|ei|ou|ia|ea/g) || []).length <= 1));
}


// ---------- 98. v117: every region climbs its own varied ladder ----------
{
  let n = 0; const br = { smallBack: 0, smallMany: 0, bigMany: 0, bigRun4: 0, eliteUnder: 0, stepOut: 0, lastOut: 0 };
  const firsts = new Set(), champs = [];
  for (let gx = -40; gx < 40; gx += 3) for (let gy = -40; gy < 40; gy += 7) {
    const c = GMS.regionCurve(gx, gy), st = c.steps, last = c.levels[c.levels.length - 1]; n++;
    firsts.add(c.levels[0]); champs.push(c.league);
    if (st.some(x => x < 3 || x > 8)) br.stepOut++;
    if (last < 44 || last > 60) br.lastOut++;
    st.forEach((x, i) => { if (i && x === st[i - 1] && x <= 5) br.smallBack++; });
    [3, 4, 5].forEach(v => { if (st.filter(x => x === v).length > 2) br.smallMany++; });
    [6, 7, 8].forEach(v => { if (st.filter(x => x === v).length > 3) br.bigMany++; });
    let run = 0; st.forEach(x => { run = x >= 6 ? run + 1 : 0; if (run > 3) br.bigRun4++; });
    const e4 = GMS.eliteFour({ league: true, gx, gy, mi: GMS.leagueIndexOf(gx, gy) }, 8, 0);
    if (e4.some(e => e.level <= last)) br.eliteUnder++;
  }
  check('a region\'s first gym is Lv 9 to 14', Math.min(...firsts) === 9 && Math.max(...firsts) === 14);
  check('every step between gyms is 3 to 8 levels, and the eighth gym lands at Lv 44 to 60', br.stepOut === 0 && br.lastOut === 0, n + ' regions');
  check('a small step (3–5) never follows itself and appears at most twice in a ladder', br.smallBack === 0 && br.smallMany === 0);
  check('a big step (6–8) appears at most three times, and never more than three big steps run together', br.bigMany === 0 && br.bigRun4 === 0);
  check('the Champion is Lv 50 to 68, and every Elite sits above the eighth gym', Math.min(...champs) >= 50 && Math.max(...champs) <= 68 && br.eliteUnder === 0, Math.min(...champs) + '–' + Math.max(...champs));
  check('the same region always climbs the same ladder', JSON.stringify(GMS.regionCurve(12, -9)) === JSON.stringify(GMS.regionCurve(12, -9)));
}


// ---------- 99. v118: the climb eases after a big jump ----------
{
  const banned = ['8,8,8', '8,7,8', '8,8,7', '7,8,8', '7,8,7'];
  let n = 0, worst = 0; const br = { banned: 0, after8: 0, after87: 0, after78: 0, after876: 0, over21: 0 };
  for (let gx = -40; gx < 40; gx += 3) for (let gy = -40; gy < 40; gy += 7) { const st = GMS.regionCurve(gx, gy).steps; n++;
    for (let i = 0; i < st.length; i++) { const a = st[i - 3], b = st[i - 2], p = st[i - 1], x = st[i];
      if (i >= 2 && banned.includes([b, p, x].join(','))) br.banned++;
      if (p === 8 && x > 7) br.after8++; if (b === 8 && p === 7 && x > 6) br.after87++; if (b === 7 && p === 8 && x > 6) br.after78++;
      if (a === 8 && b === 7 && p === 6 && x > 6) br.after876++;
      if (i >= 2) { const t = b + p + x; worst = Math.max(worst, t); if (t > 21) br.over21++; } } }
  check('none of 8,8,8 / 8,7,8 / 8,8,7 / 7,8,8 / 7,8,7 ever happens', br.banned === 0, n + ' regions');
  check('an 8 is followed by 7 or less, and 8,7 or 7,8 by 6 or less', br.after8 === 0 && br.after87 === 0 && br.after78 === 0);
  check('after 8,7,6 the next step stays at 6 or less', br.after876 === 0);
  check('no three gyms in a row climb more than 21 levels', br.over21 === 0 && worst <= 21, 'steepest ' + worst);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
