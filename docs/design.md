# Prodty design

Decisions settled in brainstorming. Loot is in `loot-pools.md`, the optional game in `the-dark.md` and the story in `lore.md`.

Prodty is the name of the app and of the world the wizard lives in.

## What it is

A productivity app for someone who cannot follow a schedule. A wizard companion sorts your thoughts into a forest, and real tasks earn loot for him. Built for one person first.

## The core rule

You never maintain it.

- You never edit a list. You tell the wizard what happened and he works out what changes.
- Doing something differently counts as done.
- Dropping a task is a first-class action with no guilt.
- Nothing is ever shown as overdue.
- The wizard comes to you, and ignored tasks fall quietly.
- No streaks. Nothing is lost by being away.
- Nothing is bought. Top rewards come only from real feats.

## Platform and look

- Web app in TypeScript, 2D, wrapped for the App Store and Google Play.
- Flat ink-on-paper illustration: bold outlines, flat colour, limited palette, cream paper, refined serif type.
- Art generated with Higgsfield. In the app, text and buttons are drawn by code and art arrives as separate pieces.
- The camera glides over scenes and you tap things.

## The wizard

- A tall, thin figure with a lantern for a head. The flame shows mood.
- Character modelled on a warm mentor: easygoing on top and sharp underneath, offers and never orders, gentle corny humour, enjoys tea and rest, forgives instantly, has a past he rarely mentions.
- All lines are original. At most one wise saying a day.
- Typed text only, shown letter by letter with old-game blips.
- Three questions at the start set his tone, and he drifts with how you talk to him. Full gear sets layer their own voice on top.
- He speaks when you open the app, to explain what changed and to teach one new thing at a time.

### What he does

- Without asking: files tasks onto trees, rates them, marks things done when told, merges duplicates.
- Asks first: planting a tree, letting a task go, changing a date.
- When unsure where something goes, he guesses and says so in one line.
- He believes you. There is no proof of completion.
- He learns patterns, names and preferences. You can ask what he knows and make him forget any of it.

### Growth

- Ranks: Spark, Candle, Lantern, Beacon, Lighthouse, with levels inside each.
- Abilities unlock with level: spotting patterns, breaking big tasks down unprompted, seeing dodging coming.
- Each level adds a little base Spark, Fortune and Grit.

## The forest

- One tree per area of life. Trees are fully custom and each has an affinity that sets its loot.
- Branches are projects and leaves are tasks.
- Finishing a task makes its leaf bloom and pays embers.
- Ignored tasks fall to the ground under their tree and can be picked back up.
- A tree with nothing happening goes quiet and misty, never dead.
- Each tree has a hollow in its trunk that holds its notes.
- Lists are scrolls whose words vanish as they are crossed off.

## Getting things in

- One input bar takes anything: a task, a thought, a pasted block, a link. He decides what it is.
- A paste button on the bar, a home-screen widget with only the bar, and "share to the wizard" from other apps.
- Long pastes become a page with a title and summary, and he offers any tasks found inside.
- Notes are found by asking him, not by browsing.

## A day

- Opening shows the forest, a line from him, and the input bar. No dashboard.
- Two check-ins a day at most, each one question answerable inside the notification.
- Three ignored check-ins and he goes quiet for a few days, then sends one gentle line.
- "What now?" offers one task. After three skips he asks what is in the way or offers the smallest first step.
- Nothing is required at the end of the day.
- On coming back he asks about three things at most, one at a time.

## How rewards are judged

He rates each task when it is written down, on three things shown as small marks on the leaf:

- **Effort:** how long it takes.
- **Dread:** how long it has been avoided and how often it was skipped.
- **Stakes:** whether a deadline or something important hangs on it.

Embers scale with all three, drop chance with effort, loot tier with dread and stakes. You can argue a rating and he adjusts, but he remembers how past claims turned out.

A task that keeps being dodged becomes a bounty whose reward grows.

### Against spam

- Pay is limited by real time passed: you cannot be paid for more work than the clock allows.
- Small tasks earn at most three oil flasks a day.
- The best loot needs age: bounties, bosses and Mythic ladders cannot be rushed.
- Tasks split into tiny steps are merged into one leaf and paid once.
- If tasks called huge keep finishing in minutes, his ratings of similar ones drop.
- Reporting something after doing it counts in full.

## Showing up

- **Days lit:** a count of every day anything was done. It never resets. Rewards at 7, 30 and 100.
- **Rested flame:** time away banks a bonus for the first tasks back.
- **Errands:** three optional challenges built from real tasks. They never expire and swap when finished.
- Small rewards for answering a check-in and for telling him what really happened.

## Deadlines

- A task can carry a date. There is no calendar view.
- A big deadline becomes a boss at the forest's edge. He splits it into phases with you, its health is the real work, and it walks closer as the date nears.
- Beating it early pays better loot.
- A missed small deadline costs only the better loot.
- A missed big deadline makes his flame gutter and closes the Dark until you settle it: done late, a new date, or let go.

## Repeating things

You tell him once. He does not read your calendar.

| Shape | Examples | How it works |
|---|---|---|
| Bells | Classes, weekly meetings | Fixed time. A bell on the tree rings beforehand. Reminders only: they are not tasks and pay nothing. |
| Fruit | Gym three times a week | A branch grows that many fruit each week. Pick one whenever you go. Unpicked fruit drops with no penalty. |
| Regrowth | Laundry, haircut | The leaf grows back a set number of days after it was last done. |

- He learns when you tend to do flexible things and nudges around then.
- No streaks: a running total, plus a small bonus for hitting the week's count.
- After a long gap, the first one back pays double.
- If you keep doing fewer than the target, he asks whether to lower it.
- Bells shape "What now?": he will not offer a long task just before one.

## The first five minutes

To be tried and adjusted in play.

- No sign-up wall. You open into a small clearing with one sapling and a dim lantern on the ground.
- You tap the lantern and he wakes.
- You name him, and three questions set his tone.
- He asks what is on your mind, you type anything, and your first leaves appear.
- He picks the smallest thing and asks if you can do it now. First bloom, first embers and a guaranteed first parcel follow.
- Bounties, the vault, the Dark and bosses are each introduced the first time they become relevant.

## Still open

- The wizard's true name.
- Other worlds and when they unlock.
- Sound and motion.
- Accounts, privacy, running cost.
