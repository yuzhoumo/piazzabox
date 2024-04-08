# Piazzabox

Piazza course archiver and viewer

![screenshot](screenshot.png)

- archive: archive courses to json, relies on unofficial piazza-api
- viewer: work in progress, renders archived piazza courses

Quick Start:

1. Run `python3 archive.py` to archive piazza courses.
2. Move the resulting `posts.json` into the `viewer` directory.
3. Run `python3 -m http.server` in the `viewer` directory (alternatively, host
this directory somewhere).
4. Go to `localhost:8000` in your favorite web browser.

TODO:
- support multiple posts.json
- source images
- search posts
- usernames
- profile pictures
