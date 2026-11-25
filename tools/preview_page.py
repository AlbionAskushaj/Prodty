"""Write the page file for the hosted preview and list the files that go with it.

The preview is the built app published as a private page. Run this after `npm run build` in app/,
from the repository root:

    python3 tools/preview_page.py <where to write the page file>

It prints the map of published paths to pass as `files` when publishing, with `root` set to app/dist.
"""

import glob
import json
import os
import sys

DIST = "app/dist"


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    css = os.path.relpath(glob.glob(f"{DIST}/assets/index-*.css")[0], DIST)
    js = os.path.relpath(glob.glob(f"{DIST}/assets/index-*.js")[0], DIST)
    # The host wraps this in its own document, so it holds only what goes inside the body.
    page = (
        "<title>Prodty</title>\n"
        '<meta name="claude:viewport-fit-sides" content="cover">\n'
        '<meta name="theme-color" content="#12142b">\n'
        f'<link rel="stylesheet" href="{css}">\n'
        '<div id="root"></div>\n'
        f'<script type="module" src="{js}"></script>\n'
    )
    with open(sys.argv[1], "w") as f:
        f.write(page)

    files = {}
    for root, _, names in os.walk(DIST):
        for name in names:
            rel = os.path.relpath(os.path.join(root, name), DIST)
            if rel != "index.html":
                files[rel] = rel
    print(json.dumps(files, indent=2))


if __name__ == "__main__":
    main()
