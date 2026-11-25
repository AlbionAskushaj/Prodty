# Browser checks

Scripts that drive the built app in a headless browser and save screenshots. They are how the app was checked during the first session.

Build and serve the app first, from `app/`:

```bash
npm run build
```

```bash
npx vite preview --port 4173 --strictPort
```

Then run a check from this folder, giving it a folder for screenshots:

```bash
node walkthrough.cjs /path/to/shots
```

| Script | What it checks |
|---|---|
| `walkthrough.cjs` | The whole first-use flow at phone size with the stand-in, then at desktop size with a simulated Claude reply. Reports errors, sideways scrolling and whether the font loaded |
| `features.cjs` | The flying ember (count waits until it lands), his poses, travellers, constellations, sound files loading |
| `capture.cjs` | That a task keeps its note, deadline and original words, and that the stand-in notice shows |
| `motion.cjs` | That animations are running, by counting them and comparing consecutive frames |

A simulated Claude is injected by defining `window.claude` before the page loads. Real Claude only runs inside the hosted preview, on the viewer's account.
