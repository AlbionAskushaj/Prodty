# Prodty

A productivity app for someone who cannot follow a schedule. They tell a lantern-headed wizard what is on their mind and he sorts it onto trees at his camp.

**Start by reading `docs/handoff.md`.** It says what is built, what is checked, and what comes next.

## Layout

- `app/`: the web app (TypeScript, React, Vite). See `app/README.md`.
- `docs/`: the design. `plan.md` is the overview.
- `assets/`: raw generated art and audio.
- `tools/`: art preparation, the preview page builder, and browser checks.

## Commands

Run from `app/`:

```bash
npm install
```

```bash
npm run build
```

```bash
npx vite preview --port 4173 --strictPort
```

From the repository root, after adding or changing art in `assets/art/stage1/`:

```bash
python3 tools/prepare_art.py
```

## Rules for this project

- The app owns the facts. A model proposes changes; the app's code checks and applies them, and decides what anything is worth.
- Never guilt the person. Nothing is overdue, nothing resets, and the light never shrinks.
- Every screen must answer: what is this place in the story, and what does it show about the person?
- Text and buttons are drawn by code. Art arrives as separate cut-out pieces.
- After any change to how the app looks, run the checks in `tools/checks/` and look at the screenshots before saying it works.
- After a change the owner should see, republish the hosted preview. The steps are in `docs/handoff.md`.
- `ANTHROPIC_API_KEY` is set in the cloud environment. Never print it, log it or commit it.
- Load the `claude-api` skill before writing any code that calls Claude.
- Tell the owner the estimated cost before any run that spends their API credit or Higgsfield credits beyond a few images.
- Write to the owner in plain language. They decide from pictures and results, not code.
