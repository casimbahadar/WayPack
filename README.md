# WayPack

A creature-collecting game played on the real map. Every square of the world you walk is a route with its own family of creatures. Nine routes make a domain, and nine domains make a region with eight gyms and a League. Walk to find creatures, walk to reach the gym, walk to get anywhere at all.

It is one HTML file. No build step, no install, no account.

**Play now:** open the game on GitHub Pages (`index.html`), tap Menu, load a pack, and walk. Add it to your Home Screen: it keeps the whole screen, and on iPhone a Home Screen copy gets its own location permission when a browser tab will not. A web page only receives your position while it is on screen, so turn on *Keep the screen awake* for a long walk. For background walking with the phone locked, the Android shell in `waypack-android/` is the only route.

## What is in it

- **The world from the map.** Routes, domains and regions are derived from coordinates, so the same square is the same route every time you stand on it. Named landmarks come from OpenStreetMap, and where a region is thin on them the search widens so there is always somewhere to walk to.
- **Gyms, badges and a League** in every region, with leaders who grow as you do, an ace you choose after your first win, title defences, master rematches, tournaments and Champion's Road. Titles are recorded by **season**, so a region can be taken again as the seasons turn.
- **Battles** where you pick moves, guard, or bring another creature out at the cost of your turn. Experience is paid the moment each opponent falls, to whoever did the work, and you choose whether the rest of the team shares it: not at all, at half, or in full.
- **Route trainers** with dozens of titles that suit their level, teams of one to four, and creatures drawn from anywhere in the region, so beating one is often how you first meet a family you have not walked to.
- **Regional forms.** Some species look and fight differently depending on where they live, and a region can also grow a form of its own: typed unlike the original, built differently, and repainted pixel by pixel to suit its typing.
- **Directions to anywhere:** an address, a place name, coordinates, or the gyms, League, legend, landmarks, pins and friends' regions the game already knows. Walking, cycling and driving each use their own router, with spoken turns, an arrow at the screen edge, and a choice between the quickest and the shortest route. Live traffic is available if you supply a key for it.
- **Rest stops and shops.** Hospitals, libraries, places of worship and a quarter of other landmarks heal your team for nothing once found. Malls, supermarkets and markets stock evolution items, stones and TMs, different at every shop and changed daily.
- **Six playthroughs per pack**, each its own team, box, badges and history on the same streets, sharing only the coin purse. Cloud saves cover all six.
- **A world of your own, or the shared one.** Take your own and the families, gym types, leaders, region names and evil teams all change on the same streets. Worlds have six-character codes, so friends can play yours, and every world keeps its own regions, badges and titles.
- **Evil teams** that hold landmarks for a week, **legendaries** that appear a route at a time once you are Champion, **eggs**, **shinies**, a weekly hunt, daily quests and 21 achievements.
- **Playing with others:** friends by code, ghost teams that walk your routes, trades, egg gifts, live battles by room code, **async duels** with a stake of coins, leaderboards, trainer cards, and photos with your team or a friend's.
- **Things to find your way back to:** the last twenty places you scanned with what appeared there, a box you can split into named groups, pins you can travel to, and a week you can share as a picture.

## Packs

All creatures, types, items and art come from a **pack**. Two formats load: a GMS `.bin` file, or a `scouter-pack/1` folder. Nothing about the game assumes any particular pack, and names in the game follow the pack's own words.

Making one is documented properly now. **[PACK-AUTHORING.md](PACK-AUTHORING.md)** walks from an empty folder to something you can walk around in, `pack-starter/` is a working eight-family pack you can edit rather than starting blank, `make-placeholder-sprites.mjs` draws stand-in art so a pack can be played before anything is drawn, `pack-build.mjs` builds it, and `pack-check.mjs` reports what a validator cannot see. [PACK-FORMAT.md](PACK-FORMAT.md) is the field-by-field reference.

## Trading, and why your copy stays yours

Every trade and duel carries a fingerprint of the pack's data: ids, names, typing, stats, evolutions and forms. Two players can only trade if their packs match exactly, and a creature that does arrive is rebuilt from your own pack rather than from what was sent. Change your copy however you like, and those changes stay in it.

## Privacy

Online play is opt-in and needs no email or password. You pick a name and get a friend code, which lets someone see which region you are in, never where you are in it. Your pins, notes and photos never leave the phone. Coordinates are never stored on the server. Data sits behind row-level security with no direct access, and the only door is a fixed set of server functions keyed by your own token. A second phone takes over the same trainer with a one-time link code, and a cloud save never silently overwrites a newer copy.

**Hosting.** Cloud saves are almost all of the running cost, so the Server setting lets you put yours on a server of your own while friends, ghosts, trades and leaderboards stay on the shared one, which leaves online play untouched. You can also run everything on your own server. Any server answering PostgREST-style calls with the WayPack functions works.

**Supporters.** The game is free and stays free. Anyone who chips in towards the server can have individual extras switched on against their trainer name and friend code: no tiers, no bundles. Anything found with the Shiny Charm is marked and can never be traded, which is what keeps a paid advantage inside the payer's own game. See [SUPPORTERS.md](SUPPORTERS.md).

Details of everything are in [WAYPACK.md](WAYPACK.md).

## Repository layout

```
index.html               the game
forge-engine.js          the music engine (Musical Forge Studio, MIT)
waypack.tests.mjs        engine harness: node waypack.tests.mjs
waypack-sweep.cjs        end-to-end browser sweep (Playwright + a local server)
WAYPACK.md               how everything works, and why
PACK-AUTHORING.md        making a pack from nothing
PACK-FORMAT.md           the pack format
SUPPORTERS.md            switching extras on for a supporter
EVIL-TEAMS.md            the evil-team generator
SHIP-ANDROID.md          building the Android app
pack-starter/            a working pack to start from
waypack-android/         the Capacitor project
```

## Testing

```
node waypack.tests.mjs
```

It extracts the engine from the shipped HTML and runs 588 checks against it, including the real pack when one is present. Every rule in the game has a check, and balance claims are measured rather than asserted.

`waypack-sweep.cjs` is the other half: it drives the whole app in a headless browser, 24 steps covering battles, catching, every panel and tab, directions, slot switching, export and import, reset and reload, and fails on any JavaScript or console error. It has caught real bugs on its first run more than once, including one the same week this was written.

Both run with the network mocked. Real GPS, the live routing and landmark services, a real camera and two phones meeting over the backend are only ever proven on a phone.

## Android app (optional)

`waypack-android/` wraps the same file with Capacitor for background walking with the screen off, which a web page cannot do. `SHIP-ANDROID.md` covers building it.

## Credits

Map data © OpenStreetMap contributors. Routing by the FOSSGIS OSRM instances, address search by Nominatim. Music engine from Musical Forge Studio (MIT). Creature data and art come from whichever pack you load and belong to their authors.
