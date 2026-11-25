"""Turn raw generated cut-outs into web-ready sprites.

Reads PNGs from assets/art/stage1, cleans their transparency, crops them,
slices the leaf sheet into separate sprites, and writes WebP files to
app/public/art plus a JSON file of sizes and anchor points for the app.

Run from the repository root:  python3 tools/prepare_art.py
"""

import json
import os

import numpy as np
from PIL import Image

SRC = "assets/art/stage1"
OUT = "app/public/art"
DATA = "app/src/data/art.json"

LEAF_NAMES = ["leaf-rust", "leaf-moss", "leaf-gold", "leaf-fallen", "blossom", "bud"]
TREE_ANCHOR_COUNT = 18


def load_clean(name: str) -> Image.Image:
    """Load a cut-out and snap near-solid and near-empty alpha to exact values."""
    im = Image.open(os.path.join(SRC, name)).convert("RGBA")
    arr = np.array(im)
    alpha = arr[..., 3]
    alpha[alpha >= 240] = 255
    alpha[alpha <= 8] = 0
    return Image.fromarray(arr)


def crop_to_content(im: Image.Image, pad: int = 4) -> Image.Image:
    box = im.getchannel("A").getbbox()
    if box is None:
        return im
    left, top, right, bottom = box
    return im.crop(
        (max(left - pad, 0), max(top - pad, 0), min(right + pad, im.width), min(bottom + pad, im.height))
    )


def save(im: Image.Image, name: str, max_side: int) -> dict:
    scale = min(1.0, max_side / max(im.size))
    if scale < 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=92, method=6)
    return {"w": im.width, "h": im.height}


def runs(mask: np.ndarray, min_gap: int) -> list[tuple[int, int]]:
    """Find stretches of True values separated by gaps of at least min_gap."""
    found, start, gap = [], None, 0
    for i, on in enumerate(mask):
        if on:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                found.append((start, i - gap + 1))
                start, gap = None, 0
    if start is not None:
        found.append((start, len(mask)))
    return found


def slice_sheet(im: Image.Image) -> list[Image.Image]:
    """Cut a sheet of separate items into one image per item, row by row."""
    alpha = np.array(im.getchannel("A")) > 0
    pieces = []
    for top, bottom in runs(alpha.any(axis=1), min_gap=12):
        band = alpha[top:bottom]
        for left, right in runs(band.any(axis=0), min_gap=12):
            pieces.append(crop_to_content(im.crop((left, top, right, bottom)), pad=2))
    return pieces


def tree_points(im: Image.Image) -> dict:
    """Pick spread-out points on the branches for leaves, and the trunk's foot."""
    alpha = np.array(im.getchannel("A")) > 128
    h, w = alpha.shape
    ys, xs = np.nonzero(alpha[: int(h * 0.60)])
    pts = np.stack([xs, ys], axis=1).astype(float)[::7]

    trunk_row = alpha[int(h * 0.72)]
    trunk_x = float(np.median(np.nonzero(trunk_row)[0]))

    # Farthest-point sampling: start at the top, then keep taking the point
    # farthest from everything chosen so far, so leaves spread over the crown.
    chosen = [int(np.argmin(pts[:, 1]))]
    dist = np.linalg.norm(pts - pts[chosen[0]], axis=1)
    while len(chosen) < TREE_ANCHOR_COUNT:
        nxt = int(np.argmax(dist))
        chosen.append(nxt)
        dist = np.minimum(dist, np.linalg.norm(pts - pts[nxt], axis=1))

    anchors = [{"x": round(pts[i, 0] / w, 4), "y": round(pts[i, 1] / h, 4)} for i in chosen]
    return {"anchors": anchors, "foot": {"x": round(trunk_x / w, 4), "y": 0.955}}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    data: dict = {}

    for source, name, max_side in [
        ("taper-idle.png", "taper-idle", 900),
        ("taper-talking.png", "taper-talking", 900),
        ("forest-floor.png", "forest-floor", 1200),
        ("lantern-unlit.png", "lantern-unlit", 600),
    ]:
        if os.path.exists(os.path.join(SRC, source)):
            data[name] = save(crop_to_content(load_clean(source)), name, max_side)

    tree = crop_to_content(load_clean("tree-bare.png"))
    data["tree-bare"] = {**save(tree, "tree-bare", 1000), **tree_points(tree)}

    pieces = slice_sheet(load_clean("leaves-sheet.png"))
    if len(pieces) != len(LEAF_NAMES):
        raise SystemExit(f"expected {len(LEAF_NAMES)} items on the leaf sheet, found {len(pieces)}")
    for piece, name in zip(pieces, LEAF_NAMES):
        data[name] = save(piece, name, 300)

    with open(DATA, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    print(json.dumps({k: (v["w"], v["h"]) for k, v in data.items()}))


if __name__ == "__main__":
    main()
