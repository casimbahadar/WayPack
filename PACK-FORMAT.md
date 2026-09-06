# WayPack pack format guide

WayPack ships with no creature content. Everything you see on the map comes from a pack you load. This guide is for people making packs. Two formats load:

- **GMS `.bin`** — Tankenka's GPS Monster Scouter pack. If you already have one, load it as is (Menu → Pack → Load .bin). The engine ignores the trailing signature.
- **scouter-pack/1** — WayPack's own format: a `pack.json` plus a folder of sprites. Simpler, and the only one that supports full turn-based battles.

Both compile to the same model inside the engine, so everything below about how data is used applies to both.

## What a pack needs to say

| Concept | GMS `.bin` | scouter-pack/1 | Used for |
|---|---|---|---|
| Types + chart | `data.types` (each type's entry holds multipliers against other types, plus `trainers`, `trainersImages`, `badges`, `tiles`, `items`) | `types` and `typeChart` (full mode only; light mode uses `families` as types) | Gym types, type effectiveness, leader name pools, badge art |
| Creatures | `data.monsters` — id → `{ forms: [...], evolutions: [...], growth, dexEntry }` | `species` — `{ id, name, family, stage, types, evolvesTo, evolveLevel, sprite, legendary }` | Everything |
| Families | `data.families` — `{ members: [{ id, range: [min,max] }], diffusion, eggFrequency, eggCycles, eggSpecies, items, basicTypes }` | derived from `family` + `stage` + `evolveLevel` | Route habitats, encounter levels, eggs, item drops |
| Rare families | `data.rarefamilies` — `{ members: [{ id, minlvl }] }` | species with `legendary: true` (minlvl 50) | Legendaries |
| Items | `data.items` — id → `{ icon, desc }` | none (engine supplies healing and catch items) | Shop, evolutions, held forms |
| TMs | `data.typesTMs` — item id → type | none | Second-attack replacement (light mode) |
| Trainer classes | `data.trainerClasses` — `{ conditions, prob, appearances: [{ name, icon, image }] }` | none (generic "Trainer") | Route trainers, challengers |
| Images | `images` — filename → base64 | files in the folder, referenced by `sprite` | Sprites, icons, leader portraits, badges, items |
| Sounds | `sounds` — `rare.wav`, `shiny.mp3` | none | Legendary and shiny cues |
| Keywords | `data.keywords.monster`, `catchitem` | none ("monster", "Snare") | Copy: "Pokéball I", "wild Pokémon" |

## scouter-pack/1 in full

```json
{
  "format": "scouter-pack/1",
  "name": "My Pack", "author": "you", "version": "1",
  "battle": { "mode": "light" },
  "families": [ { "id": "fire", "name": "Fire", "color": "#e0603a" } ],
  "species": [
    { "id": "0004", "name": "Cindrel", "family": "fire", "stage": 1,
      "evolvesTo": ["0005"], "evolveLevel": 16, "sprite": "0004.png", "legendary": false }
  ],
  "leaders": ["Blaise", "Ember"],
  "naming": { "prefixes": ["Kan","Sol"], "middles": [], "suffixes": ["to","ia"], "blocklist": [] }
}
```

Rules the validator enforces (it tells you exactly what is wrong): at least 8 families (a region needs 8 distinct gyms); every species has a known family and a stage 1–3; every family has a non-legendary stage-1 species; `evolvesTo` ids exist; colours are `#rrggbb`. Optional `naming` needs at least 4 prefixes and 4 suffixes.

For **full battles** add `"battle": { "mode": "full" }`, `types`, `typeChart` (attacker → defender → multiplier, 1 when missing), `moves` (`id, name, type, category physical|special|status, power, accuracy 1–100 or null, pp`), and per species `types` (1–2), `stats` (hp, atk, def, spa, spd, spe as integers) and `learnset` (`[{ level, move }]`, with a damaging move by level 5). `pokeapi-to-pack.mjs` builds all of this from the PokéAPI CSV dump; `pack-build.mjs` builds a light pack from two CSVs.

## How the engine uses the data

- **Routes and encounters.** Each route hosts one family, weighted by `diffusion`, with 35% of a domain's routes favouring families of the gym's type. The wild's level is 0.8 × your team level + 2 × badges (±3), then clamped into a member's `range`; the member is chosen among those whose range contains it. Families must cover levels 1–100 between their members (the official pack does).
- **Gyms.** Gym types are your `types` (GMS) or `families` (scouter). Leader names come from the type's `trainers`; pools under 20 are topped up by the engine's per-type names. Badges from the type's `badges`; a loaded badge pool overrides the art.
- **Forms.** A creature shows the last listed form whose `conditions` match: `gene` (0 normal, 1 regional variant; assigned at catch, 15% where the species has any gene form), `gender` (0/1, assigned at catch), `item` (held; hold from the team panel), `hour` (`day`/`night` by the phone's clock), `season`, `level`. Forms change name, types, power and sprites. `lastOutcome`, `battles` and `battlesRNG` conditions never match.
- **Evolutions.** On level-up, the last listed evolution whose conditions match fires. Supported: `level`, `gene`, `gender`, `hour`, `season`, `happiness` (5 km walked with the creature on your team), `distance` (km walked), `tm` (a taught TM), `coins`; `item` evolutions are offered as Use buttons; `orientation` and `consume` do not block; a list is OR.
- **Power.** −1 to 4. Scales light-mode stats (×1.0 at −1 up to ×1.75 at 4) and picks the signature move: ≤0 Quick Jab, 1–2 Heavy Blow, ≥3 or legendary Unleash.
- **Items.** `families[].items` and `types[].items` drop at their `prob` (percent) above `minlvl`. Evolution and form items and TMs appear in the shop. Item `desc` may reference species as `<<id>>`; the engine substitutes names.
- **Trainers.** Classes are tried in order; a class fits if the trainer's level ≥ `minlvl`, gender matches, `maintype` is the team's first type, and any species/type keys are present; `prob` is the chance to take it. Put your strongest classes first.
- **Eggs.** `eggFrequency` weights which family's egg turns up in a domain; `eggCycles` × 150 m to hatch; `eggSpecies` names what hatches (else the lowest-range member).
- **Sounds.** `rare.wav` and `shiny.mp3` play as cues. Music is optional: `area_<type>.mp3` (or ogg/wav/m4a) per type, `area.mp3` as a fallback, `battle.mp3`, `league.mp3`. When present they play instead of the app's composed themes. Only include music you have the rights to distribute.

## Ignored today

Mega evolution as a battle-time transformation (held Mega Stones are permanent forms instead), held-item battle effects, `lastOutcome`/`battles` forms, move learnsets in light mode (light mode derives moves from types and power), `compatibleBackups` and `compatibleMultiplayer` headers.

## Testing a pack

1. Load it. The validator's message lists every problem for scouter packs; a GMS pack is checked for at least 8 types and members that exist.
2. Reset the save for that pack (saves are per pack ID) and pick a starter: the three offered are low-level, power ≤ 0, non-legendary members.
3. Walk (or use the simulator) and scan a few routes; open Team → Regions → Details to see the eight gyms and the lore built from your data.
4. For a full-mode pack, fight a wild: all four move slots should fill from the learnset by level 5.

Badge pool (optional, separate from the pack): `badges.png` with one row per type and `badges.json` `{ "cell": 48, "cols": N, "types": [...], "counts": [...] }`, loaded from Menu → Badge pool.
