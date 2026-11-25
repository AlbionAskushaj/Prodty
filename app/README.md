# Prodty app

The web app. Stage 1 of `docs/plan.md`.

## Run it

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints. Add `?reset` to the address to start over from the unlit lantern.

To try it on a phone on the same Wi-Fi:

```bash
npm run dev -- --host
```

## Where things are

| Path | What it holds |
|---|---|
| `src/App.tsx` | The screen: forest or one tree, Taper's speech, the input bar |
| `src/brain/` | The shell around Taper's thinking. `standin.ts` is the rule-based stand-in |
| `src/state/store.ts` | Saved state, the rules for what a change is worth, and the history log |
| `src/components/` | The forest, a tree up close, the speech box, the input bar |
| `src/lib/sound.ts` | Text blips, the bloom chime, the music |
| `src/data/art.json` | Sprite sizes and leaf positions, written by `tools/prepare_art.py` |
| `public/art/` | Sprites, written by `tools/prepare_art.py` from `assets/art/stage1/` |

## Art

After adding or changing a cut-out in `assets/art/stage1/`, from the repository root:

```bash
python3 tools/prepare_art.py
```
