# Art direction

How the approved look was produced, so it can be reproduced.

## The style

Flat cel-shaded illustration that looks printed on heavy cream paper.

- Bold, confident dark ink outlines.
- Flat colour fills with a single hard-edged shadow tone.
- A limited palette per image: charcoal, rust orange, moss green, cream and pale gold as the base. Each gear set adds its own accent.
- Fine, subtle paper grain.
- Refined serif type, thin hand-inked hairline frames, sparing gold accents.
- Generous empty space.
- Matte. No glow, bloom, gradients, lens effects, 3D rendering or photorealism.

Dark scenes use deep charcoal paper where things show only as thin faint grey outlines. Light reveals cream paper and full colour.

## The reference image

Every approved image was generated with the lantern-head wizard as a style and character reference.

| Thing | Value |
|---|---|
| Service | Higgsfield |
| Image model | `gpt_image_2_6`, quality `high` |
| Reference job | `f75efc95-f9f6-44bd-8da6-aa661b7925b0`, passed with the role `image_references` |
| Saved copy | `art/wizard/lantern-head-reference.jpg` |
| Cost | About 1.25 credits per image |

## Prompt opening that worked

For characters:

> Character design sheet in exactly the art style of the reference image: flat cel-shaded illustration with bold confident dark ink outlines, flat colour fills with a single hard-edged shadow tone, single full-body figure centered on plain flat cream paper with fine subtle grain. Matte, no glow, no bloom, no gradients, no 3D render, no text. The same tall thin lantern-head wizard as the reference, same proportions, ...

For screens:

> Full-screen portrait mobile app screenshot, no device frame, no hands. Art style matches the reference image exactly: flat cel-shaded illustration with bold confident dark ink outlines, flat colour fills with a single hard-edged shadow tone, limited palette of charcoal, rust orange, moss green, cream and pale gold. Everything looks printed on heavy cream paper with fine subtle paper grain, like a luxury illustrated book or premium board game. Super premium feel: generous empty space, refined elegant serif typography in charcoal ink, thin hand-inked hairline frames, sparing gold accents. Matte, no glow, no bloom, no gradients, no 3D render, no photorealism. SCREEN: ...

Ending a prompt with "All text spelled exactly as given, crisp and legible, and no other text anywhere" kept the lettering clean.

## Cut-out pieces

Tested and working. Adding `background: "transparent"` and `output_format: "png"` to a request, and opening the prompt with "isolated on a fully transparent background with nothing behind it: no paper, no ground, no shadow, no text", returns a clean cut-out.

- The first four pieces are in `assets/art/stage1/`: `taper-idle.png`, `tree-bare.png`, `leaves-sheet.png`, `forest-floor.png`.
- Layered together on cream paper they match the look of the mockups.
- The solid areas come back at 253 or 254 out of 255 opacity, not fully solid. Snap anything above 240 to fully solid when loading.
- A sheet of several small items on one image works; slice it into separate sprites in code.

## Music

| Thing | Value |
|---|---|
| Model | `elevenlabs_music_v2_5`, instrumental |
| Approved track | `assets/audio/forest-theme.mp3`, 90 seconds |
| Job | `85c7bda7-fc17-4d3d-831d-e92e6254dcb2` |
| Cost | About 13 credits for 90 seconds |

The prompt asked for slow plucked notes on a zither-like string instrument, a low breathy wooden flute that enters rarely, a very soft warm drone, lots of silence, no drums, percussion, vocals or synth pads, and an ending as quiet as the beginning so it can loop.

## What the images are

Everything in `art/` is concept art. The app needs separate pieces that code assembles:

- The wizard's body in one fixed pose, with each gear slot as its own layer.
- Tree parts, leaves and blossoms.
- Scene backgrounds in layers.
- Shades and keepers as their own sprites.

Interface text and buttons are drawn by code, never baked into images.

## Folder index

| Folder | Contents |
|---|---|
| `art/wizard/` | The lantern-head reference |
| `art/screens/` | Six sample app screens |
| `art/sets/` | The twelve gear sets |
| `art/loot/` | Lantern designs, the Blue Torch set, the loot drop screen |
| `art/dark/` | Two gameplay mockups, the shade sheet, the light-pattern sheet |
