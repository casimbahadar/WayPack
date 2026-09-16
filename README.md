# WayPack

A creature-collecting game played on the real map. Every square of the world you walk is a route with its own family of creatures. Nine routes make a domain, and nine domains make a region with eight gyms and a League. Walk to find creatures, walk to reach the gym, walk to get anywhere at all.

It is one HTML file. No build step, no install, no account.

**Play now:** open the game on GitHub Pages (`index.html`), tap Menu, load a pack, and walk. Add it to your Home Screen: it keeps the whole screen, and on iPhone a Home Screen copy gets its own location permission when a browser tab will not. A web page only receives your position while it is on screen, so turn on *Keep the screen awake* for a long walk. For background walking with the phone locked, the Android shell in `waypack-android/` is the only route.

## What is in it

- **The world from the map.** Routes, domains and regions are derived from coordinates, so the same square is the same route every time you stand on it. Named landmarks come from OpenStreetMap, and where a region is thin on them the search widens to everyday places so there is always somewhere to walk to.
- **Gyms, badges and a League** in every region, with leaders who grow as you do, an ace you choose after your first win, title defences, master rematches, tournaments and Champion's Road.
- **Directions to anywhere:** an address, a place name, coordinates, or the gyms, League, legend, landmarks, pins and friends' regions the game already knows. Walking, cycling and driving each use their own router, with distance, duration, arrival clock, spoken turns and an arrow on the screen edge when the destination is beyond it.
- **Rest stops and shops.** Hospitals, clinics, libraries, places of worship and a quarter of other landmarks heal your team for nothing once you have found them. Malls, supermarkets and markets stock evolution items, stones and TMs, different at every shop and changed daily.
- **Six playthroughs per pack.** Each region layout and route size is its own team, box, badges and history on the same streets, sharing only the coin purse. Cloud saves cover all six.
- **Evolution on your terms.** Leave it automatic, or be asked after the battle and evolve when you choose.
- **A world of your own, or the shared one.** The shared world is the same for everybody. Take a world of your own and the families, gym types, leaders, region names and evil teams all change on the same streets, so a creature you cannot find may be common on a friend's routes. Worlds have six-character codes, so friends can play yours, and each world keeps its own regions, badges and titles: moving between them parks your work rather than losing it. Your creatures, coins, items and dex follow you everywhere.
- **Regions that read as places.** Each one tells you where it came from, how its trainers fight, which gym is worth the walk and what it says about its legend, drawn from over two hundred written lines so no two regions sound alike.
- **Evil teams** that hold landmarks for a week, with 432 profiles, motives, creeds and bosses. **Legendaries** that appear a route at a time once you are Champion. **Eggs**, **shinies**, a weekly hunt, daily quests and 21 achievements.
- **Playing with others:** friends by code, ghost teams that walk your routes, trades, egg gifts, live battles by room code, leaderboards, trainer cards with QR codes, and photos with your team, a friend's team, or a creature you just beat.
- **Spoken route notes and directions**, in whichever of your phone's voices you like, at whatever pitch and speed.
- **Offline map tiles**, a low-power mode for long walks, and a connection panel that says which services are reachable.

## Packs

All creatures, types, items and art come from a **pack**. Two formats load: a GMS `.bin` file, or a `scouter-pack/1` folder. Nothing about the game assumes any particular pack. It reads families, types, gyms, moves, items and images from what you give it, and names in the game follow the pack's own words. Each pack keeps its own six playthroughs.

`pokeapi-to-pack.mjs` and `pack-build.mjs` build packs, and `PACK-FORMAT.md` documents the format.

## Privacy

Online play is opt-in and needs no email or password. You pick a name and get a friend code. A friend code lets someone see which region you are in, never where you are in it. Your pins and photos never leave the phone. Coordinates are never stored on the server. Data sits behind row-level security with no direct access, and the only door is a fixed set of server functions keyed by your own token. A second phone can take over the same trainer with a one-time link code, since a friend code alone must never hand over an account, and a cloud save never silently overwrites a newer copy from another device. Delete my online data, in the Online sheet, removes everything about you from the server.

**Hosting.** Cloud saves are almost all of the running cost, so the Server setting lets you put yours on a server of your own while friends, ghosts, trades and leaderboards stay on the shared one, which leaves online play untouched. You can also run everything on your own server, with the honest consequence that only people using it can see you. Any server answering PostgREST-style calls at `/rest/v1/rpc/…` with the WayPack functions works. Supabase, hosted or on your own machine, is the easiest. The schema is in this repository.

Details are in [WAYPACK.md](WAYPACK.md).

## Repository layout

```
index.html               the game
forge-engine.js          the music engine (Musical Forge Studio, MIT)
waypack.tests.mjs        engine harness: node waypack.tests.mjs
waypack-sweep.cjs        end-to-end browser sweep (Playwright + a local server)
WAYPACK.md               how everything works, and why
PACK-FORMAT.md           the pack format
EVIL-TEAMS.md            the evil-team generator
SHIP-ANDROID.md          building the Android app
waypack-android/         the Capacitor project
```

## Testing

```
node waypack.tests.mjs
```

It extracts the engine from the shipped HTML and runs 427 checks against it, including the real pack when `poke9_data_v1_6_gmsdp2.bin` is present. Every rule in the game has a check, and balance claims are measured rather than asserted.

`waypack-sweep.cjs` is the other half: it drives the whole app in a headless browser (battles, catching, every panel and tab, directions, slot switching, export and import, reset, reload) and fails on any JavaScript or console error. It has found real bugs on its first run more than once. Serve the folder and run it with Playwright installed.

Both run against a headless browser with the network mocked. Real GPS, the live routing and landmark services, a real camera and two phones meeting over the backend are only ever proven on a phone.

## Android app (optional)

`waypack-android/` wraps the same file with Capacitor for background walking with the screen off, which a web page cannot do. `SHIP-ANDROID.md` covers building it. The browser version is unaffected by any of it.

## Credits

Map data © OpenStreetMap contributors. Routing by the FOSSGIS OSRM instances, address search by Nominatim. Music engine from Musical Forge Studio (MIT). Creature data and art come from whichever pack you load and belong to their authors.
