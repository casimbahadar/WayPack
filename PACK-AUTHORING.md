# Making a pack from nothing

WayPack ships with no creatures. Everything you meet on the map comes from a **pack**, and a pack can be
about anything: your own creatures, folklore, robots, birds of Ontario. This guide takes you from an empty
folder to something you can walk around in. It assumes no code beyond running one command.

If you only want the field-by-field reference, that is [PACK-FORMAT.md](PACK-FORMAT.md). This is the
walkthrough.

## What you will end up with

A folder holding two spreadsheets, one image per creature, and a `pack.json` built from them:

```
my-pack/
  families.csv     8 or more groups, one per route type
  species.csv      your creatures
  ember01.png      one image per creature, 64x64 or so
  …
  pack.json        built, not written by hand
```

Load it with Menu → Pack → Load folder, and pick the folder.

## The one idea you need first: families

A **family** is a group of related creatures that shares a habitat. Every route in the world is assigned
one family, and that is what you meet there. So families are the unit of variety on a walk, and you need
**at least eight** because a region has eight gyms and needs eight distinct types to build them from.

Eight is the floor, not the target. A pack with 8 families feels repetitive after a few kilometres; 20 to
30 makes a city interesting. Start with eight, walk with it, then add.

## Step 1: the starter kit

Copy `pack-starter/` and rename it. It holds eight families and seventeen creatures of no particular
origin, with placeholder art, and it loads and plays as it stands. Change it piece by piece rather than
starting from a blank file: that way it is always loadable, and you always know what you broke.

## Step 2: families.csv

```csv
id,name,color
emberfen,Emberfen,#e07a2f
tidewrack,Tidewrack,#4f93b0
```

- **id** — short, lower case, no spaces. Never change it later: saves refer to it.
- **name** — what a player reads, as in "Emberfen family here".
- **color** — the route's tint on the map. Pick colours that differ from each other; families are told
  apart at a glance by colour long before anyone reads the name.

## Step 3: species.csv

```csv
id,name,family,stage,evolvesTo,evolveLevel,sprite,legendary
ember01,Fennik,emberfen,1,ember02,16,ember01.png,false
ember02,Fenhound,emberfen,2,ember03,34,ember02.png,false
ember03,Fenwarden,emberfen,3,,,ember03.png,false
```

- **stage** — 1 is what you catch in the wild. 2 and 3 are what it becomes. Every family needs at least
  one stage 1, or nothing can be caught there.
- **evolvesTo / evolveLevel** — leave both blank for a final form. Several ids separated by `;` gives a
  branching evolution.
- **sprite** — a filename in the same folder.
- **legendary** — `true` puts it in the rare pool: one per region, once a day, only after the title. Two
  or three across the whole pack is plenty.

Levels: a creature's catchable range is derived from its stage, so you do not set it per creature.

## Step 4: art

64x64 PNG with transparency is the sweet spot. The game scales them, so consistency of size matters more
than resolution, and a transparent background matters more than either.

No art yet? Generate placeholders so you can walk immediately:

```
node make-placeholder-sprites.mjs my-pack
```

That writes one coloured shape per creature, distinct per id, so you can test the whole pack before you
have drawn anything. Replace them one file at a time.

## Step 5: build and check

```
node pack-build.mjs my-pack --name "My Pack" --author "you" --version 1
node pack-check.mjs my-pack
```

`pack-build` writes `pack.json` and refuses to write a pack the game would reject. `pack-check` then
reports what a validator cannot see: art referenced but missing, art in the folder nothing uses,
evolutions pointing at ids that do not exist, families nothing can be caught in, duplicate names, names
too long for a phone. It exits non-zero on anything fatal, so you can put it in a release script.

Both need a copy of the game (`index.html` or `scouter-world-vNN.html`) beside them, since they validate
with the same code the game uses. That is deliberate: a pack that passes cannot fail differently in play.

## Step 6: walk

Load the folder and go outside. The things you will only learn on foot:

- whether your families are visually distinct on a real map at arm's length
- whether the names survive being read on a phone in sunlight
- whether eight families is enough for your neighbourhood

## What a pack cannot do

- **No stats, moves or type chart in this format.** A `scouter-pack/1` pack plays in *light mode*: battles
  use a simple strike and guard model derived from each creature's family and stage. Full turn-based
  battles with stats, moves and a type chart need the richer GMS `.bin` format, which is documented in
  PACK-FORMAT.md but is considerably more work to author.
- **No trainers of your own.** Route trainer titles and their sprites come from the pack in `.bin` format
  only; a `scouter-pack/1` pack gets generic trainers.
- **No sounds or music.** The game supplies those.

## Trading, and why your edits stay yours

Every trade carries a fingerprint of the pack's data: ids, names, types, stats, evolutions and forms. Two
players can only trade if their packs match exactly. This is not a restriction on making packs, it is what
makes packs safe to share: your pack is fully playable and fully tradeable **among people using it**, and a
creature from it can never turn up in someone else's game as something their pack has never heard of.

The practical consequence for you as an author: publish a version, and let people trade on that version. If
you change a creature's data, bump the version and say so, because anyone on the old files will no longer be
able to trade with anyone on the new ones.

## Naming, and other people's work

Use your own names and your own art, or art you have the right to use. A pack full of somebody else's
creatures is theirs, not yours, and cannot be distributed. WayPack itself takes no position on what you make
for yourself; sharing is where it becomes their business rather than yours.
