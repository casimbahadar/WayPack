# WayPack

A creature-collecting game played on the real map. Every 500 m square of the world is a route with its own creatures; nine routes make a domain, nine domains a region with eight gyms and a League. You walk to things. The same spot is the same route for every player.

WayPack is an engine. It ships with no creature content. Everything you see, from species and sprites to gym leaders and badges, comes from a **pack** you load, so the app itself carries no franchise material.

**Play now:** open the game on GitHub Pages (`index.html`), tap Menu, load a pack, and walk. On iPhone, add the page to the Home Screen. On Android, an installable app with background walking is built from `waypack-android/`.

## What the game has

- A world laid out by coordinates: routes, domains, regions with generated names and lore, eight typed gyms and a League per region, three layouts and two route sizes.
- Wild encounters per route family, catching with three tiers of catch item, eggs found by walking, shinies, regional variants, forms and evolutions by the pack's own rules.
- Battles with type matchups, wind-ups you can read and guard, per-species move sets, TMs, held items, Mega Evolution in battle, and stats shaped by each species.
- Gyms whose leaders grow with your badges, an Elite Four and Champion, title defence by leaders, elites, strong trainers, former champions and other players, and a League that can be lost and taken back.
- Legends: three per region per month, one on a route each day once you are Champion, catchable, with a stay-or-roam rule when they escape.
- Landmarks from OpenStreetMap: quiet places to visit for coins, and each week an evil team with its own name, motive and boss holding some of them.
- Post-game: a rival, master rematches for gold badges, region mastery, Champion's Road, daily quests, a weekly shiny hunt, weekend tournaments and a monthly legend gauntlet.
- A walking economy: coins per 25 m, a daily shop with drifting prices, paid healing.
- Online, no account needed: ghosts of other players walking your region as trainers, friends by code, leaderboards, live battles by room code, trades and egg gifts by code, shared weekly evil teams, cloud saves.
- Area music from the Musical Forge engine, sound effects, a team photo mode, a dex, achievements, a weekly report, pins for your own places, a full in-game guide (Menu → How to play).

## Packs

Two formats load from Menu → Pack:

- **GMS `.bin`**: a GPS Monster Scouter pack, loaded as is.
- **WayPack folder**: `pack.json` plus sprites, built by hand or with the tools in this repo.

Each pack keeps its own save. A pack may also carry its own music, and a badge-pool folder gives gyms varied badge art. The full format is in [PACK-FORMAT.md](PACK-FORMAT.md).

Tools: `pack-build.mjs` (CSV → pack) and `pokeapi-to-pack.mjs` (PokéAPI CSV dump → full-battle pack).

## Privacy

Most of the game lives on the phone: save, pins, photos, settings. Online play is opt-in and needs no email or password; you pick a name and get a friend code. What leaves the phone when you play online is your trainer name, your team, your counts, and which region you are in, named to the same 3 km square everyone shares. Never your exact position, never your pins or photos. Tables in the backend are locked (row-level security, no direct access); the only door is a fixed set of server functions keyed by your own token. Delete my online data, in the Online sheet, removes everything about you from the server. Details are in [WAYPACK.md](WAYPACK.md).

## Repository layout

```
index.html               the game, one file, no build step
waypack.tests.mjs        the harness: node waypack.tests.mjs
forge-engine.js          Musical Forge engine, keep it beside the HTML
badge-pool/              badges.png + badges.json, optional badge art
pack-build.mjs, pokeapi-to-pack.mjs   pack tools
waypack-android/         Capacitor Android project and CI workflow
WAYPACK.md               design and decisions
PACK-FORMAT.md           pack authoring guide
EVIL-TEAMS.md            one generated profile per evil-team motive
screenshots/             for sharing
```

## Running the harness

```
node waypack.tests.mjs
```

It extracts the engine from the shipped HTML and runs a few hundred checks against it, including the real pack when `poke9_data_v1_6_gmsdp2.bin` is present. Every rule in the game has a check; balance claims are measured, not asserted.

## Android app

`waypack-android/` wraps the same file in a native shell for background walking, notifications with the app closed, haptics and durable saves. Move its `.github/workflows/android.yml` into the repo's `.github/workflows/` and push; the workflow copies the game from the repo root, builds `app-debug.apk` on GitHub's runner and attaches it to the run. Install it over the previous one and the save carries over. See `waypack-android/SHIP.md`.

## Credits

Built by Casim Bahadar. The world model, layouts and rules are original. Map data © OpenStreetMap contributors. Landmark lookups through the Overpass API. GMS pack format by Tankenka, whose GPS Monster Scouter this began as a study of. Music engine from Musical Forge Studio (MIT). Base-stat table from PokéAPI. Franchise packs are the property of their owners and are not part of this repository.

## Licence

Engine: MIT. Packs you load are governed by their own owners' terms.
