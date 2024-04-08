# Piazzabox

Piazza course archiver and lightweight static viewer

![screenshot](screenshot.png)

- archive: archive courses to json (forked from 64bitpandas)
- viewer: renders archived piazza courses. built with alpine.js + tailwind.

Quick Start:

1. Run `python3 archive.py` to archive piazza courses.
2. Move the resulting `posts.json` into the `viewer` directory.
3. Run `python3 -m http.server` in the `viewer` directory (alternatively, host
this directory somewhere).
4. Go to `localhost:8000` in your favorite web browser.

To regenerate optimized css: `npx tailwindcss -o assets/tailwind.css --minify`

TODO:
- support multiple posts.json
- source images
- search posts
- usernames
- profile pictures
