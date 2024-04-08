# Piazzabox

Piazza course archiver and statically hostable viewer

- archive: archive courses to json (forked from 64bitpandas)
- viewer: renders archived piazza courses. built with alpine.js + tailwind.

![screenshot](screenshot.png)

### usage

1. run `python3 archive.py` to archive piazza courses.
2. move the resulting `posts.json` into the `viewer` directory.
3. run `python3 -m http.server` in the `viewer` directory (alternatively, host
this directory somewhere).
4. go to `localhost:8000` in your favorite web browser.

### development

run `pnpm run build` after making viewer changes to rebuild tailwind css and format.

### todo

- support multiple posts.json
- source images
- search posts
- usernames
- profile pictures
