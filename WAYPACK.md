# WayPack

GPS creature-collecting game engine for the phone: real map, live GPS, the world as a fixed grid of routes; all creature content comes from loadable packs. Current build: `index.html` in the repo (development name `scouter-world-v55.html`; needs `forge-engine.js` beside it for music) (single file, no build step, Leaflet + OpenStreetMap tiles). Harness: `waypack.tests.mjs`, 325 checks against the shipped file, including the real Pokémon pack.

Name chosen 2026-09-04: **WayPack** (waypoints + packs). Rejected: Wayfarer (Niantic's mapping platform, a live AR exploration game, and several store apps share it), Wanderlands (a Play Store app, a dormant studio, a Roblox game). WayPack not yet searched for collisions; do that before any store listing.

## Pillars

1. The world is where you are. Routes, domains, regions and gyms are fixed to the real map; you walk to things.
2. The app owns no creature IP. Packs do. The engine ships clean; packs load from files or URLs.
3. Every rule is proven by the harness before it ships, and balance claims are measured, not asserted.

## World model (settled)

| Term | Meaning |
|---|---|
| Route | One grid square, 500 m or 250 m (toggle). Exact north–south; east–west exact at 43.45°N (Kitchener), drifts elsewhere. One habitat family, one rare family, 1–3 trainers per day. Numbered within its region. |
| Domain | A block of routes sharing a gym type. Holds one gym on a random route of the domain. |
| Region | 3×3 domains. Named (generated, franchise names blocklisted). 8 gyms + a League. Own history, lore, legends. |

Layouts (menu, per device): **Domains** = domains are 2×2 routes, League domain at the centre. **Wide** = domains are 3×3 routes, League domain placed at random. **Dense** = a region is 3×3 routes, every route a gym except one random League route. All layouts ask for 8 badges.

Gym types: distinct within a region, and never shared with an edge-adjacent region (the type pool is split into two halves by checkerboard parity; packs with fewer than 16 types fall back to within-region distinctness). Leader names: distinct within a region and per type across a 5×5 block of regions; pack pools under 20 names are topped up with the engine's per-type name pools.

## Systems (settled)

**Battles.** Pack decides the mode. `light` (the official GMS pack): each creature has at most three attacks plus Guard, from pack data: Strike in its first type (STAB 1.2), Strike in its second type if dual-typed (a taught TM replaces this slot; a mono-typed creature gains it), and a signature by power tier (power ≤0 Quick Jab 0.7× always first; 1–2 Heavy Blow 1.6× at 70%; ≥3 or legendary Unleash 2.2× once per battle). The AI picks by expected damage. Measured: where the two Strikes differ against the foe, picking the right one wins 27% vs 2%; a Water TM takes Pikachu vs Geodude from 0% to 96%. Wind-ups as before: the wild sometimes winds up (2.5× next hit); guarding a wind-up cuts damage to 25% and arms a 2× counter; 92% hit, 10% crit. Measured: reading wind-ups 93% vs mashing 37% at equal level; reads win about a third of −3 fights. `full` (PokéAPI-built packs): standard level-scaled stats, physical/special, STAB, chart, PP, speed order, AI by expected damage.

**Gyms.** Each region has its own scale: leaders start at Lv 9–14 and gain 4–6 per badge you hold (hashed per region); the Champion is max(50, base + step × 8 + 4) + 2 × badges, so 50–66 at zero badges. The scale is not shown to the player; they discover it at the gym door, where the leader's current level appears in the header and on the challenge button, and in their own records of beaten leaders. Team = 2 + badges/2, cap 5 (2,2,3,3,4,4,5,5). Every generated team obeys the pack's evolution levels: a member is legal only at or above its range floor, type is applied after legality, and a family with no legal on-type member at that level is skipped for another (no Lv 15 Pangoro). One ace, +3 levels, on a fixed evolution line whose base member carries the gym's type, evolving as badges grow. After the first win only, the player may choose the ace's line from the team they beat and give it a nickname, which the leader's ace then carries into every rematch. Badge once; rematches unlimited, and every beaten team is kept in the gym's record with the leader's level at the time. A menu setting, Battle at the leader's level (Off, Equal, Leader −1, −3, −5), caps the player's own creatures for gym, League, master, defence, tournament and road battles to the leader's level plus the offset: stats and HP scale down for the fight (HP kept as a fraction), XP still goes to the real level, and the cap lifts when the battle ends or the app reloads. Leaders themselves always follow the region's scale. Leaders have intro/win/loss/rematch lines.

**League.** Elite Four (distinct types, six each, champion −4/−3/−3/−2 by placement) then the Champion (six, level 45 + 3 × badges). Becoming Champion unlocks the region's legends.

**Title defence.** Every 4-hour slot, 50% chance a contender waits at the League while you hold the title: a region leader (35%), a current Elite (25%), a strong trainer above every leader's level (25%), or the former champion with the same team +3 levels (15%). Lose and they become Champion with the exact team they used; a new Elite Four assembles; each failed reclaim adds 2 levels to the usurper. Held gyms also draw challengers (50% of days) for the badge; defending pays coins, losing costs nothing but the day.

**Legends.** Up to 3 per region per month from the rare families on its routes; re-rolled on the 1st, caught ones out for the month. One is on a route each day (marker + header line); one attempt per region per day; fixed fight at max(pack minimum level, team level). After a flee/run/wipe the menu setting decides: **Stay** (same region tomorrow) or **Roam** (edge-adjacent region, keeps moving until caught). Lore names a legend's route only when it is there today. Random scans no longer produce legendaries.

**Environment.** The app detects iOS, which browser it is in (Chrome, Firefox, Edge, Opera, Safari), whether it is running from the Home Screen, and whether it is the native shell. On iOS every browser is WebKit but each keeps its own location permission, and a Home Screen copy asks for its own; when no fix arrives the advice names the actual browser and offers the Home Screen route, which is what fixed it on Casim's phone. iPhone players in a tab see the Home Screen suggestion once, and it stays available in the menu. Cards never interrupt each other or a battle: they queue until the screen is free.

**GPS honesty.** `watchPosition` carries a 20 s timeout and a 30 s watchdog, so a phone that never delivers a fix is reported rather than silently leaving the player on the default start coordinates. The pill states the truth (GPS off, finding you, the reason it failed, ±N m, or rough) and retries when tapped; the player dot is faded until a real fix lands. Fixes worse than 60 m are held back for 25 s in case a better one arrives, then used for the map only, with walking credit suspended and a note on turning on Precise Location; a sharp fix restores it. This replaces the old rule that discarded every fix over 60 m, which froze the dot on phones with imprecise location.

**Walking.** 1 coin per 25 m. +1 Pokéball I per 300 m. Eggs found about every 1.6 km (cap 3), hatch after the pack's cycles × 150 m, weighted by the pack's `eggFrequency`. Walking credit only below 7 m/s; position follows any fix under 60 m/s; fixes worse than 60 m ignored.

**Shop.** Staples (Pokéball I/II, Tonic, Revive) + 4 rotating slots from Pokéball III, Full Tonic and the pack's evolution items; prices ±25% daily, one half-price item. Heal-all costs 30 coins.

**Items and forms.** Wild drops per pack probabilities; evolution items usable from the team panel. Creatures carry gender, gene (regional variant, 15% where the pack has one), a held item and walked distance; the pack's forms resolve from those plus the clock (Alolan variants, gender forms, Mega forms by held stone, hour/season forms), changing name, types, power, sprite, stats and moves. Conditional evolutions: level, gene, gender, hour, season, happiness (5 km walked together), distance, TM, coins; item evolutions as Use buttons. Shop sells evolution items, form items and TMs.

**Trainers.** 1–3 per route per day from the pack's trainer classes with their conditions; overworld icons on the map, battle sprite as portrait; teams from the route family at the player's level; 1.5× XP and 2–4 catch items.

**Offline and power.** Every tile drawn is kept in IndexedDB (cap 4,000) and served when the network is gone, proven by a reload with the tile server unreachable: all visible tiles drew from the cache with zero requests. **Low power** takes a fix about every 20 s instead of continuously, stops fetching tiles, pauses music and online checks. **Connection** in the menu names each outside service (tiles, landmarks, directions, address search, online play) as answering, not reachable or not used, with the session's minutes, kilometres and map data. Every outside call reports through one status layer, and a service going down says once what still works instead of failing quietly. **What changed** appears once after a version bump, with a link into the guide.

**Map.** The route fit measures the overlays (trainer chips above, neighbour strip and buttons below) and fits the whole square between them, re-fitting when chips appear; while a guide destination is set, the map instead frames you, the path and the destination together. Pinch-zoom is free; the map fits to the route only until you zoom, then follows at your zoom; Follow me restores.

**Directions.** One control on the map: a round ◈ button, which becomes a gold pill naming the destination while one is set and clears it when tapped again. It opens with a search box: an address, a place name, or `lat, lon`, geocoded by OpenStreetMap's Nominatim biased to your surroundings, with the nearest matches listed by distance; a pick becomes the destination. Below it, the known targets: the nearest unbeaten gym, the League, today's legend, the contested landmark and the nearest quiet one, your pins, and friends' regions. It asks OSRM's public walking router for a street route (drawn solid, with distance and minutes) and shows the next turn in the header ("Turn right onto Queen Street in 282 m"); the route refreshes when you stray 40 m or after 90 s. If the router is unreachable, the straight line and crow-flies distance stand in. Nothing about the request identifies you beyond the two coordinates it needs. Below zoom 12.5 every region in view is drawn, named, with your badge count where visited.

**Memory.** Per-region record: visits, routes explored, all 8 gyms by name/type/badge, wins with the leader's level and team, champion runs, title holder. History log (cap 400). Region lore: five sentences from typed templates with cross-slot coherence rules and a slop check in the harness. Visited regions drawn on the map below zoom 12.5.

**Stats (light mode).** Power sets the total; for Pokémon packs the six stats are shaped by the species' base-stat profile (embedded table, national dex 1–1025, ratios clamped to 0.35–2.5×), so Shuckle is a wall that cannot hit; attackers use whichever of Atk/Def or SpA/SpD is the better matchup. Packs without a profile keep flat stats.

**Shinies.** 1 in 1024 on scans, eggs and legends; the pack's shiny sprites and icons are used (forms too); the dex counts them.

**Landmarks.** Real places from OpenStreetMap (historic, museums, viewpoints, artworks, places of worship, town halls, libraries, theatres, universities, parks, peaks, lighthouses, towers), fetched per region from the Overpass API and cached for a week; offline, clearly labelled "unmapped spots" keep the system alive. Standing within 60 m: quiet landmarks pay 15 coins and a 20% item once a day; contested ones hold a grunt.

**Evil teams.** Motive-first generator: 36 hand-written motives (weather, relics, debt, purity, signal, wild, crown, night, forge, mask, greed, silence, speed, memory, fame, harvest, ascent, clock, wager, border, catalyst, meteor, ash, arena, famine, poverty, caste, faith, election, excess, contagion, labour, espionage, automaton, tradition, chaos), each with a goal, creed, method, boss bio, motive-bound boss titles, matching core types, and grunt/admin/boss lines; 12 single-word names per motive in the Rocket/Plasma style, no name shared between motives (432 unique teams, then numbered). Supporting types cover the core's weaknesses; admin and boss names come from the type's name pool. Region details show the team's aim, method, creed and boss bio. A per-player book assigns one team per region per week: a team is finished only when its boss falls that week and is then never seen again; an unfinished team returns the next week in its own region or one named neighbour (decided deterministically), and no two regions share a team in a week. They hold max(1, ⌊(n − 2) / 2.5⌋) of the region's n landmarks (cap 6), one being the day's target; free them all and the admin appears at the biggest landmark; beat the admin and, with 8 badges there, the boss (five creatures above the leaders); beat the boss and they leave for the rest of the week. Grunt 30, admin 100, boss 300 coins plus an item.

**Post-game.** Rival named from your starter, appearing at first badge, four, eight and the title, with a team whose ace counters your starter's type, growing 2 → 6. Master rematches once Champion: each beaten leader offers Lv 90 (ace 95) for a gold badge. Region mastery: all routes, all badges, every family on its routes caught. Champion's Road: hold three adjacent titles and defend all three in one weekend for 500 coins. Daily quests: three a day (walk 2 km, beat 3 trainers, catch 2, catch a named type, visit 2 landmarks, win a gym), 40 coins each. Weekly shiny hunt: one family per region at 1 in 64. Weekend tournaments at your League with your live team or a rental of six, three rising rounds, 250 coins. Monthly legend gauntlet on the last weekend: fight all three at the League at champion +20, or chase them across three neighbouring regions, 400 coins.

**Starters.** The pool is the 27 grass/fire/water starters of generations 1–9 (by national dex); three are offered per starting region, one of each type. Other packs fall back to base-stage grass/fire/water creatures.

**Pins.** Personal pins (home, work, exercise, school, other with a name) placed at your current spot, per device, shown on the map and listed in the menu with distance and bearing.

**Held items and battle forms.** Mega Stones Mega Evolve the holder for the duration of a battle (announced on the card, reverted after, HP scaled); other held-item forms (Griseous Orb, Plates on Arceus) are permanent while held. Held items whose pack description says they boost a type give that type's strikes ×1.2, in both battle modes. Creatures track battles fought and last outcome, so Aegislash and Minior change forms by result.

**Music.** `forge-engine.js` (the Musical Forge Studio engine, MIT, shipped beside the app) plays recipes in its own format: root, mode, bpm, prog, bass, drums, lead, dens, bars, seed. One recipe per gym type; a domain differs from another of the same type only by seed; battle variants raise bpm and density, the League is harmonic minor strings at 132. Audio starts on the first tap (browser rule); no volume control in the engine, so the toggle is on/off. A pack may carry its own music (`sounds` entries `area_<type>.mp3`, `area.mp3`, `battle.mp3`, `league.mp3`, also ogg/wav/m4a), or a folder of such files can be attached for a session from the pack loader; pack audio plays ahead of composed themes. Music from other apps is never extracted or shipped. Sound effects (hits, crits, guard, miss, wind-up, faint, catch, fled, level-up, coin, badge) are synthesized inline in raw Web Audio; a wind-up also vibrates where the phone allows.

**Multiplayer (casim-games Supabase project, `wp_` tables).** Auth-free per the backend canon: `wp_register` issues a player token and an 8-character friend code; every other call is a `SECURITY DEFINER` RPC keyed by that token; tables carry RLS with zero policies and revoked grants (anon cannot select them directly, verified by impersonation). Three tiers: (1) ghosts, one team snapshot per player per pack with region, level, badges and title. Ghosts reach you three ways so a small player base still meets people: nearby (within three regions), friends (anywhere, via `wp_friend_ghosts`), and travelling ghosts (the most recent anywhere, via `wp_recent_ghosts`, fetched when fewer than four others are known). Friends and travellers walk your region as trainers, one route per day each, drawn as translucent hovering figures (their lead creature with their name, ✈ for travellers) on both the map and the grid, dimmed once beaten that day; any ghost may come for your title at the League. (2) friends by code and leaderboards per pack (badges, regions, mastery, tournaments, shinies); stats publish after gym, League, defence and tournament wins. (3) live battles: a room code and a shared seed; both phones run the same deterministic `pvpRound` and exchange only per-turn choices (moves, guard, switches) through `wp_submit_choice`, polling every 1.5 s; the harness proves two simulated phones produce identical logs and HP. Shared region weeks (`wp_region_weeks`): when online, the first player to enter a region in a week sets its evil team's seed for everyone, freed landmarks merge across players, and the first admin and boss wins are credited by name in the region's details. Friends' regions show on the zoomed-out map (blue outline, or a blue marker with their name when out of view). "Delete my online data" (`wp_delete_me`) removes the player, ghost, stats and friendships. Client is plain fetch, no library. The Online sheet is four tabs (You: card, scan, ghost, rename, delete, achievements, cloud save; Friends: add by code, friends' stats, leaderboards, who is in your region today; Battle: live rooms; Trade: trades and egg gifts), with the last tab remembered. Privacy audit (2026-09-05): no `wp_` column stores latitude, longitude or accuracy; ghosts carry a region index and name only; pins and photos never leave the phone; only the publishable key ships in the client; every table has RLS with zero policies and no grants to anon; all 27 callable functions are SECURITY DEFINER with a pinned `search_path` and all but `wp_register` and `wp_leaderboard` require the caller's token. Fixed in the same pass: the leaderboard no longer returns friend codes, since a code is an invitation that reveals the holder's region. Handle, token and code live in localStorage (export the save to keep them).

**Creatures.** 16 MBTI-keyed personalities with mood lines. XP bar and stats on every team row and in the battle card. Nicknames (used in battle) and a pin that blocks boxing.

**How to play.** Menu → How to play: thirteen topics behind a picker (getting started, reading the map, directions, scanning and catching, battles and moves, gyms and the League, walking and the shop, legends, landmarks and evil teams, after the title, playing with others, photos and achievements, settings and packs), with Previous/Next and the last topic remembered. Rewritten in full at v52 to cover directions, the level cap, ace choice and records, ghost trainers, trades and gifts, cloud saves, photos, achievements and the six playthrough slots. Landmark markers answer a tap with name and status.

**Cloud save.** `wp_cloud_save`/`wp_cloud_load`: the whole save under the trainer token, per pack; auto-saved after gym and League wins (at most every 10 minutes) and on demand; load replaces the local save after a confirmation.

**Trades by code.** `wp_trade_offer` gives a six-letter code and removes the creature from your box; a taker gives one of theirs and receives yours; you collect theirs from the Online sheet; cancel returns yours. The wire carries species, level, XP, nickname, TM, held item, gene, gender, shiny, walked distance, battles, personality, where it was caught and the original trainer; the receiver sees "from Casim".

**Weekly report.** The Team panel sums the last seven days from history (km, catches, badges, titles, defences, trainers, landmarks, bosses, tournaments, eggs), the regions visited and this week's team, with a Share button (Web Share or clipboard).

**Map readability.** Your lead creature walks beside your dot facing the direction of travel; a gold ripple marks a catch; wind-ups vibrate.

**Camera and community.** Group photos: any friend's ghost team can be brought into your photo, tagged with their name, and the caption names everyone. Sightings: after beating a friend's or traveller's ghost on your route, a photo with their creature large in frame, captioned with route and date. Trainer cards: a generated 1080×1350 image with name, team, counts, achievement art and a QR code of a card link (`?add=CODE&name=…`), produced by an in-page QR encoder (byte mode, EC L, versions 1–6, verified by an independent decoder); scanning uses the phone's built-in detector where it exists (Android), otherwise the code is typed, and opening a card link pre-fills the friend code. Weekly photo challenge per region: stand at a named landmark or have a member of the hunt family on your team when you take a photo, for 60 coins; three completions earn the Photographer achievement. Photos still never leave the phone except through the share sheet by your choice.

**Team photo.** Team panel → Open camera: live camera (front or back) or a plain backdrop, your team's sprites in the frame and draggable, capture to JPEG with your name and region, shared via the system sheet or saved. Photos never leave the phone.

**First run.** Three cards before the first starter pick (the map is the game; walk, scan, catch; then the world answers), skippable, shown once per device.

**Achievements.** Twenty, computed from the save (first badge, full set, champion, defender, reclaimer, gold badge, region master, conference, legend catcher, gauntlet, team breaker, five down, bracket, shine, glitter, collector, walker, hatcher, rivalry, traveller), each drawn with badge-pool art of a fitting type; shown on the Online profile, counted in stats and as a leaderboard.

**Egg gifts.** Send an incubating egg to a friend by code (`wp_gift_offer`/`wp_gift_take`); the receiver walks the remaining distance; nothing comes back.

**Performance.** Pack images stay as raw base64 in a lazy store; data URLs are built on first draw and kept in a 600-entry cache. The 15.7 MB Pokémon pack loads in about 130 ms after parsing with an idle heap near 58 MB in the test browser.

**Native shell (Android).** `waypack-android/`: a Capacitor 6 project with the same `www/index.html`, app ID `io.github.casimbahadar.waypack`, plugins for background geolocation (foreground service while the screen is off), local notifications, haptics, preferences (durable save mirror; newer copy wins on start) and app state; permissions in the manifest; icons at every density; a GitHub Actions workflow that builds a debug APK on push (and a signed AAB once keystore secrets exist); SHIP.md with the sideload and Play Store paths. The HTML detects the shell and routes alerts, haptics, saves and background fixes through it; the browser build is unchanged. Copies to keep in sync: the vNN HTML, `www/index.html`, `forge-engine.js`. No Mac in the pipeline; the Pages build on the Home Screen remains the iPhone channel.

**Region details.** A two-line digest (this week's team and how many landmarks it holds, today's legend and route, families caught) above six tabs: Overview (title, mastery), Gyms, This week, Legends, Lore, History; the last tab is remembered.

**Team panel.** Four tabs (Team, Collection, Progress, World) with the last tab remembered; creature rows are compact (name, level, HP and XP bars) and expand on tap to stats, moves, origin and actions. The card link is `https://casimbahadar.github.io/WayPack/`.

**Quality of life.** Save export/import (JSON, per pack). Dex per pack with completion. Guide line on the map to the nearest unbeaten gym, the League or today's legend. Auto-battle for route trainers (plays the AI's choice). Large-text and high-contrast modes. Alerts (Web Notifications) for a contender or a legend while the app is open; background alerts need the Capacitor wrap.

**Badges.** Pack badges first; `badge-pool/badges.png` + `badges.json` (466 designs, 18 types, from region-forge) loads via Menu → Badge pool and gives each gym a deterministic design; types without pack art get a generated emblem.

## Packs

- **GMS .bin** (Tankenka's format): JSON + base64 images + trailing signature the engine ignores. Loads directly; 1,025 Pokémon, 482 families, trainer classes, leader pools, badges, egg data, items.
- **scouter-pack/1** (this project's JSON + sprite folder): supports `light` or `full` battles; `pokeapi-to-pack.mjs` builds a full-mode pack from the PokéAPI CSV dump; `pack-build.mjs` builds from CSVs.
- Saves are per pack **and grid**: the three layouts × two route sizes are six independent playthroughs of the same ground, each with its own team, box, badges, dex, items and history. Coins are the one shared thing (a purse per pack). Switching layout or route size swaps slots, offering a starter in a fresh one and reporting what waits in a used one; the menu lists all six with their team size, level and badges. An older single-slot save migrates once into Domains 500 m. Reset wipes only the current slot and keeps the purse. Cloud saves, exports and imports carry the grid. region, badge, legend and history records are keyed by layout + route size as well, so switching settings hides (never mislabels) records made under other settings, and switching back restores them.

## Distribution plan (decided 2026-09-04, not legal advice)

A store build cannot contain franchise packs (Apple IP/copycat rules, Google Play flagging, Nintendo/TPC takedowns; pointing at a URL you host for that purpose reads the same to reviewers). Plan:

1. **Store build = WayPack + an original starter pack + loaders.** The app must be a complete game without external content. The original pack comes from Lumoria's creatures when Lumoria is ready (region-forge is Pokémon-bound and cannot supply it); badge art from the region-forge pool is Casim's own.
2. **Franchise packs stay outside the store**, hosted on Discord/GitHub by whoever makes them (Tankenka's model). Engine keeps file loading and gains **load from a user-typed URL**; a pack-format guide for community authors is an engineering job.
3. **GitHub Pages build** stays the playground: no review, anything Casim is willing to host; no background GPS (that needs the Capacitor wrap, which is a store build).

## Open items

- Original starter pack (Casim).
- URL pack loader. (Pack-format guide: PACK-FORMAT.md, done.)
- Capacitor wrap for background GPS; App Store review approach.
- WayPack collision search before listing.
- Balance is stub-level throughout (5 levels per badge, wild scaling 0.8 × team + 2 × badges, legendary 6% base catch); needs phone playtests.
- Map suggestions parked for Casim: set-the-zoom instead of toggling; a larger multi-region overview.
- Not doable in this build: online/friend-code battles (needs a backend); battle music (the pack carries only legendary and shiny cues).

## Decisions log

- 2026-09-03 Pack-format-first; no original creatures in the engine (later revised: an original starter pack is needed for a store build).
- 2026-09-03 Battle mode is a pack property: full for PokéAPI packs, light for others.
- 2026-09-04 Live GPS on a real map is the default; grid is a mode; simulator is opt-in.
- 2026-09-04 Layouts Domains/Wide/Dense; route size 500/250 m; gyms random within domains; League random except in Domains.
- 2026-09-04 Leader name uniqueness per type per 5×5 block; gym types distinct across region borders.
- 2026-09-04 Region history, world memory, lore (no location claims unless accurate).
- 2026-09-04 Economy: coins per 25 m, daily shop, paid heal.
- 2026-09-04 Community suggestions adopted: title defence, chosen ace, leader lines, personalities (16), generated badges, sound cues; map suggestions left to Casim; no pack-creator option controls.
- 2026-09-04 Leader team sizes 2→5; Elite Four full teams at −4/−3/−3/−2; contenders of any kind every 4 h; losing the title hands it to the winner with their team.
- 2026-09-04 Legends: monthly sets, daily route events, one attempt per day, Stay/Roam setting, unlock on Champion.
- 2026-09-04 Name: WayPack. Distribution plan as above.
- 2026-09-06 Browser-aware location advice and a Home Screen prompt (a Chrome iOS tab gave no fix; the Home Screen copy did).
- 2026-09-06 GPS fixed: timeout and watchdog, honest pill and dot, rough fixes usable for position only (found on Casim's iPhone showing ±? and a wrong location).
- 2026-09-06 Offline tile cache, low-power mode, connection panel, what's-new note.
- 2026-09-06 How to play rewritten and extended to thirteen topics.
- 2026-09-06 Online sheet reorganised into tabs; achievements explain themselves; leaderboard rows no longer print an empty code.
- 2026-09-06 Six save slots per pack (layout × route size) with a shared coin purse.
- 2026-09-06 Guide reduced to a compass icon when idle.
- 2026-09-06 Map frames the whole path while guiding; guide label truncated.
- 2026-09-06 Address and place search (Nominatim) as Guide destinations.
- 2026-09-06 Street directions via OSRM with turn-by-turn; route fit clear of overlays; more guide targets.
- 2026-09-06 Level cap corrected to the player's side: the team is capped to the leader's level, leaders unchanged.
- 2026-09-06 Legal evolution levels in every generated team; on-type ace lines; all beaten teams recorded; ace chosen once with a nickname; leader-level floor setting.
- 2026-09-06 Gym scale hidden from the player (a discovery, not a stat).
- 2026-09-06 Region details reorganised into tabs with a digest.
- 2026-09-06 Team panel reorganised into tabs with expandable rows.
- 2026-09-06 Camera and community: group photos with friends' teams, ghost sightings, trainer cards with QR, weekly photo challenge.
- 2026-09-05 Privacy audit against the Discord feedback; leaderboard friend codes removed; guide states what leaves the phone.
- 2026-09-05 Capacitor Android project scaffolded with CI, plugins and the app-side bridge; sideload first, store later.
- 2026-09-05 First-run cards, achievements, egg gifts, lazy image store.
- 2026-09-05 Ghost figures on map and grid; friends' regions on the grid overview.
- 2026-09-05 Duplicate menu entry removed; pack-supplied music support; original pack sourced from Lumoria, not region-forge.
- 2026-09-05 Forge engine wired; SFX; lead creature on the map; cloud save; trades by code; weekly report; team photo.
- 2026-09-05 Shared region weeks, friends on the map, delete my online data.
- 2026-09-05 Online button on the bar; Heal moved to the Team panel; friend and travelling ghosts as daily route trainers.
- 2026-09-05 Guide rewritten to the prose standard; grid view fixed (canvas pinned to 0 px while hidden at startup).
- 2026-09-05 How to play guide; tappable landmark markers.
- 2026-09-05 Multiplayer tiers 1–3 on casim-games (ghosts, friends and leaderboards, live seeded battles).
- 2026-09-05 36 motives; battle-time Megas, held-item boosts, outcome/battle-count forms; music recipes with a Forge-engine hook.
- 2026-09-05 Starters = the nine generations' trios; evil teams renamed motive-first (Team Tempest, Team Ledger, Team Eclipse…) with goals, creeds, methods and bios.
- 2026-09-05 Evil-team generator with a per-player book (unique across regions, unfinished teams return nearby); regional starters; map pins.
- 2026-09-05 Landmarks (Overpass) with a weekly evil-team profile per region, variable contested count, team leaves for the week after the boss; post-game: rival, master rematches, region mastery, Champion's Road, daily quests, shiny hunt, tournaments live and rental, monthly gauntlet with fight or chase.
- 2026-09-05 Grid-tagged region keys (fixes regions shown thousands of km away after switching settings); base-stat shaped stats; real shiny art.
- 2026-09-05 Levels: first gym 9–14, champion 50–66 at zero badges. Recommendations 1, 2, 4, 5, 6, 7, 8 adopted and built (onboarding declined).
- 2026-09-04 Region-specific gym scale (base 6–14, step 4–6); free zoom with nearby-region overview; enemy priority; forms and conditional evolutions; PACK-FORMAT.md.
- 2026-09-04 Moves (light mode): TM replaces the second-type Strike; signature tiers at power ≤0 / 1–2 / ≥3 or legendary. TMs sold in the shop's rotating slots.
