# Prodty plan

Everything from the brainstorm in one place, and the order to build it in. Detail lives in the other files in this folder.

| File | Covers |
|---|---|
| `design.md` | Every settled decision about how the app behaves |
| `loot-pools.md` | Gear rules, the twelve sets, loose gear |
| `the-dark.md` | The optional five-minute game |
| `lore.md` | The story of Taper and Wick |
| `art-direction.md` | The art style and how to reproduce it |
| `art/` | Approved concept images |

## In one paragraph

Prodty is a productivity app for someone who cannot follow a schedule. You type whatever is on your mind to a lantern-headed wizard, and he sorts it onto trees in a forest. Finishing real tasks makes leaves bloom, feeds his flame, and drops randomly rolled gear for him. That gear changes how he looks, talks and plays in an optional five-minute game called the Dark. Underneath runs a story about a general who lost his apprentice and now teaches gently because of it.

## The rules that never bend

1. You never maintain it. You talk; he keeps the forest true.
2. No guilt. Nothing is overdue, nothing resets, nothing is lost by being away.
3. There is always something you want and have not got yet.
4. Nothing is bought. Power comes only from real tasks; top rewards only from real feats.
5. The game never eats the day. Runs need oil from real tasks and stop at five minutes.

## What we decided

| Area | Decision |
|---|---|
| Who it is for | You first, other people later |
| Platform | Web app in TypeScript, 2D, later wrapped for the App Store and Google Play |
| Look | Flat ink on cream paper, bold outlines, limited palette, refined serif type |
| The wizard | Lantern for a head; warm, patient mentor; typed text with old-game blips |
| His name | You name him. His true name, Taper, is revealed after Wick is released |
| The forest | One custom tree per area of life; branches are projects, leaves are tasks |
| Getting things in | One bar takes tasks, thoughts, pastes and links; also a widget and share-from-other-apps |
| Notes | Kept in a hollow in the tree they relate to; found by asking him |
| Daily rhythm | He speaks when you open; two check-ins a day; "What now?" offers one task |
| Ignored tasks | Fall to the ground under their tree and can be picked back up |
| Task ratings | Effort, dread and stakes, rated by him when the task is written down |
| Bounties | A dodged task grows in reward instead of going overdue |
| Repeating things | Bells (reminders only), fruit (so many a week, any time), regrowth (days since last done) |
| Deadlines | Big ones are bosses that walk closer; a missed big one closes the Dark until settled |
| Showing up | Days lit that never reset, a bonus for coming back, optional errands. No streaks |
| Spam | Pay is limited by real time passed; small tasks capped; best loot needs age |
| Currency | Embers, for rerolling, upgrading and levelling him |
| Loot | Random drops with rolled stats and traits; five tiers; six slots |
| Stats | Spark, Fortune, Grit |
| Sets | Twelve, each with a bonus and a transformation; full Mythic is possible |
| His growth | Ranks from Spark to Lighthouse; abilities and base stats unlock with level |
| Worlds | Six, grown into as a tree grows; each is home to a hermit you can talk to |
| The Dark | Walk to see, stand to strike; oil is timer and health; nine shades; thirteen lanterns |
| Story | Taper, his apprentice Wick, the Bridge; ends with Wick released |
| Final reward | Wick's Lantern, which casts shadow |
| Sound | Sparse music, paper sounds, page-turn transitions; all from Higgsfield |
| Practical | No account at first; private switch on notes; works offline except talking to him |

## How it is built

| Part | Choice |
|---|---|
| Language | TypeScript everywhere |
| Interface | React, built with Vite |
| Scenes and the Dark | A 2D canvas library (PixiJS) |
| Text and buttons | Drawn by code, never baked into images |
| Storage | On the phone first, with a backup to a small private server |
| The wizard's mind | An AI model called from that server, so the key never sits on the phone |
| When the AI is called | Only for typed messages and check-ins. Taps, parcels and the Dark run without it |
| Phone app | The same web code wrapped with Capacitor |

The AI model is chosen at the start of stage 1, with a real running-cost estimate.

## Build stages

Each stage ends with something usable on a phone browser.

### Stage 1: the core loop

- The forest with custom trees.
- The input bar and the wizard's dialogue box with typewriter blips.
- A brain dump becomes leaves on the right trees.
- Tapping a leaf makes it bloom and pays embers.
- Telling him what happened: done, done differently, changed, dropped.
- Planting a tree.
- The first five minutes, including naming him.
- Saved on the phone. Forest music playing.

**Art needed:** the wizard in starting gear in a few poses, tree parts, leaf and blossom, forest ground, interface frames.

**Done when:** you have used it for a week of real tasks and want to keep opening it. If it does not pull you back, fix that before building anything else.

### Stage 2: his judgement

- Effort, dread and stakes marks on leaves.
- "What now?" and what happens after three skips.
- Fallen leaves and bounties.
- Bells, fruit and regrowth.
- Notes, tree hollows, paste, long pastes as pages, lists as scrolls.
- The anti-spam rules.
- Days lit, rested flame, errands.
- Ranks, and abilities that unlock with level.
- "What do you know about me?" and forgetting.

**Done when:** a normal week needs no manual tidying at all.

### Stage 3: loot

- Parcels and drop rules.
- Six gear slots with mix-and-match pieces.
- Stats, traits, rerolling, dismantling, the Hoard.
- The vault.
- Sets, set bonuses and transformations, including voice changes.
- Mythic ladders.

**Art needed:** about 90 separate gear pieces on one fixed body pose. Test one full set first to confirm the pieces line up before generating the rest.

**Done when:** a drop makes you want to equip it straight away.

### Stage 4: the phone app

- Wrapped with Capacitor and installed on your phone.
- Check-in notifications answerable without opening the app.
- Bell reminders.
- Home-screen widget and share-from-other-apps.
- Backup server and sign-in.

**Done when:** the app reaches you on days you forget it exists.

### Stage 5: deadlines and bosses

- Dates on tasks.
- Bosses with phases that walk closer.
- Early-finish rewards and the consequences of missing.

### Stage 6: worlds and hermits

- Trees transforming their surroundings into the six worlds.
- Six hermits to talk to.

### Stage 7: the Dark

- The Thicket first, with all nine shades and all thirteen lanterns.
- Oil, the Flare, flames, staff casts, personal bests.
- Then the other zones and their keepers, one at a time.

### Stage 8: the story

- Letters found in the Dark, keepers' last words, Wick speaking to you.
- The Bridge, the ending, the name reveal, Wick's Lantern.

## Things to watch

- **The pull:** whether you come back is the whole point, and only stage 1 can answer it.
- **Gear pieces lining up:** generated art has not been tested for separate pieces that must fit one body.
- **The Dark's size:** it is roughly as much work as the rest of the app.
- **Him getting things wrong:** he will misfile things sometimes. Correcting him must always be one sentence.
- **Running cost:** unknown until the AI model is chosen.
- **Numbers:** every drop chance, ladder and cap is a guess until played.
- **Before any public release:** check the licence on generated art and audio, and give the Watcher's eye and the general's backstory their own twist.

## Drafts not yet confirmed

These were filled in during the brainstorm and have not been explicitly approved.

- The war title "the General of the Thousand Lanterns".
- The flame effect and staff cast for each set, and the four lanterns added beyond the nine shown.
- The keeper for each zone, which lost comrade keeps which, and the empty armour in the Eyeless Deep.
- The hermits each holding a different view of Taper.
- What counts as "after dark" for the Night Moth set.
- The three questions that set his tone.
- The Trailwalker image needs redoing: it kept the default lantern.
