# Handoff

Written at the end of the first working session, for whoever picks this up next. Read this first, then `plan.md`.

## Where things stand

Prodty is a productivity app for someone who cannot follow a schedule. They type whatever is on their mind to a lantern-headed wizard, and he sorts it onto trees at his camp.

Stage 1 of `plan.md` is built as a hosted preview. The owner's verdict: the look is right, but stage 1 is not complete, because the wizard does not yet understand them reliably. **The agreed next focus is the AI, before stage 2 or loot.**

## Read in this order

| File | What it gives you |
|---|---|
| `docs/handoff.md` | This file: state, how to work, what is next |
| `docs/plan.md` | Every decision in one table, how it is built, the build stages |
| `docs/design.md` | How the app behaves, the Long Dusk, what each thing on the home screen means |
| `docs/lore.md` | The story of Taper and Wick |
| `docs/loot-pools.md`, `docs/the-dark.md` | Later stages, fully designed, not built |
| `docs/art-direction.md` | The art style and exactly how to reproduce it |
| `app/README.md` | How to run the app and where things are in the code |

## What is built and checked

All of this was driven in a headless browser at phone and desktop sizes with no errors. See `tools/checks/`.

- The dark opening: tap the lantern, the light blooms, name the wizard.
- The camp: a night clearing, a pool of light that grows with embers, animated flames, sparks, steam, fireflies, stars.
- Brain dump to trees, with the wizard asking before planting.
- A tree up close: tap a leaf for its deadline, details and original words; Done, Let it go, Not yet.
- Finishing sends an ember from the blossom to the lantern; the count and light grow when it lands.
- His three seated poses: resting, sipping, speaking.
- Travellers arriving at 40, 100, 200, 350, 550 and 800 embers.
- Constellations: one bright star per day anything is finished, seven to a shape.
- Music, campfire and cricket loops, with a mute button.
- His words as subtitles, letter by letter with blips.
- A history log of every event, kept from day one for the network to learn from.

**Not checked:** how real Claude performs. In the preview it runs only on the owner's account in their browser, so every Claude test so far used a simulated reply. Sounds were never heard, only confirmed to load.

## The hosted preview

- Address: https://claude.ai/artifact/FY3VB23PG6byPQkGSv9Di7 (private to the owner).
- It is the built app published as a page with the `sample` capability, which lets the page ask Claude on the viewer's account.
- Adding `#reset` to the address starts over from the dark opening.

To republish after a change:

1. `npm run build` in `app/`.
2. `python3 tools/preview_page.py <page file path>` from the repository root. It writes the page file and prints the files to send.
3. Publish that page file to the address above with `root` set to `app/dist` and the printed files. From a new conversation, read the artifact first and pass its address as `url`, or a second page is created.
4. Pass old hashed `assets/index-*.css` and `.js` names as `null` to remove them.

Things that broke the hosted page before, now handled:

- The host sets its own font on `body`, so the app sets the font on `body` too, not only on `:root`.
- Fonts must travel inside the stylesheet. `vite.config.ts` inlines them.
- All asset paths are relative (`art/...`, not `/art/...`), and `base` is `./`.
- Reading the clipboard is refused there, so the paste button hides itself after one failure.
- Only a plain `#name` reaches the page, never a query string.

## The AI as it stands

| Piece | File | State |
|---|---|---|
| The shell's contract | `app/src/brain/types.ts` | The app only ever calls `brain.interpret`. Replies carry speech plus proposed changes |
| Character bible | `app/src/brain/bible.ts` | Who he is, how he speaks, how to turn a message into changes. Holds none of the story's secrets |
| Claude for the preview | `app/src/brain/hosted.ts` | Calls `claude-sonnet-5-5` through the page. Checks every proposed change against the real forest before it is applied |
| Stand-in | `app/src/brain/standin.ts` | Simple rules. Poor at natural sentences by design. Also answers plain yes or no instantly |
| Applying changes | `app/src/state/store.ts` | All rules about what a change is worth live here, not in the model |

Every reply records which one answered (`via`) and why the stand-in took over (`fault`). The app shows a line on screen when the stand-in answers.

## Next: make the AI solid

The owner chose this over stage 2. In order:

1. **Confirm the key is present** with `echo ${ANTHROPIC_API_KEY:+set}`. Never print its value. The owner added it to this cloud environment's variables at the end of the first session; it was not visible in that session because variables are read at start.
2. **Pull the shell into one shared module.** Move `describe`, `toReply` and the turn-building out of `hosted.ts` so the preview, the server and the tests all use the same code.
3. **Build a small server** that calls Claude Sonnet 5.5 with the official TypeScript SDK and a reply format the API enforces. Load the `claude-api` skill before writing any of it; the request rules for this model changed recently.
4. **Build the test set.** Forty to sixty brain dumps with expected results (tasks, notes, deadlines, trees, things marked done or dropped, when to ask a question, when to add nothing), a scorer, and voice checks: under about 220 characters, no exclamation marks, no guilt. Re-score after every prompt change.
5. **Memory.** People, places and habits he has learned, kept by the app and given back to him. "What do you know about me?" and forgetting.
6. **Task ratings:** effort, dread and stakes, pulled forward from stage 2 because the network needs them.
7. **The PyTorch network** in a new `brain/` folder: trained first on Claude's ratings, then on logged history, compared honestly against a plain baseline, plus the "Taper's mind" screen. PyTorch is not installed in the cloud container.

Test runs spend the owner's money. Tell them the estimate before each run.

## Waiting on the owner

- **An example of lost details.** They said details were not being captured. Asked what they typed and what came out; not yet answered. Tasks kept only a title at the time, which is now fixed, but the stand-in silently answering is the other possible cause.
- **About ten real brain dumps**, typed the way they really type, for the test set.
- **Loot or stage 2** after the AI work. Loot was offered early with simple drop rules.

## Known gaps

- Saving is in the browser only. The preview can forget.
- Eyes at the edge of the light appear only for tasks two days old, so a fresh preview shows none.
- The beacon is always dark until keepers exist.
- With five or six trees on day one, the outer ones start beyond the light and stay dark until it grows.
- A tree up close has no scenery, only an arch of light.
- Finishing a task in the tree view has no animated flame on the standing wizard, only a small pulse.
- The campfire and cricket recordings have an unchecked licence for shipping in a released app.
- Before any public release: check the licence on generated art and audio, and give the Watcher's eye and the general's backstory their own twist.
- The Trailwalker set image needs redoing at stage 3, and separate gear pieces that fit one body are untested.

## Art

- Generated with Higgsfield in one style, always passing the lantern-head image as a reference. Details and the exact prompt openings are in `art-direction.md`.
- Raw pieces go in `assets/art/stage1/`. `python3 tools/prepare_art.py` turns them into the app's sprites and `app/src/data/art.json`.
- New poses of an existing sprite work best as an edit: pass the existing piece as the reference and ask to change one thing. The three seated poses were made this way and line up exactly.
- Higgsfield allows four jobs at once and rejects the rest, so send batches of three or four.
- About 134 credits were left at the end of the first session. An image costs about 1.25, ninety seconds of music about 13. In the first session 58 credits were spent by something other than that session; the owner was told.

## How the owner likes to work

- Shows them pictures. They decide from what they see, and react strongly to both good and bad.
- Multiple-choice questions with three options suit them for confirming details.
- They want the app to feel premium, alive and intentional, and they ask of every screen: what is this place in the story?
- They are direct when something misses. Take it at face value and fix the cause.
- They are interested in machine learning and want the network to be something they can show.
- Plain language. They are not reading code.
