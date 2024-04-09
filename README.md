# Piazzabox

Piazza course archiver and statically hostable viewer

![screenshot](screenshot.png)

- archive: Archive courses to json and download assets
- viewer: Renders archived piazza courses. Built with Alpine.js + Tailwind.

### Usage

1. Use `python3 archive.py` to archive a Piazza course.
2. Move the resulting `assets/` and `posts.json` into the `viewer/src` directory.
3. Run `python3 -m http.server` in the `viewer/src` directory to view it
   locally at `localhost:8000` (alternatively, host this directory somewhere).

### Installation

Archiver:

```sh
cd archive
python3 -m venv archive-venv
source ./archive-venv/bin/activate
pip install -r requirements.txt
```

Viewer:

The viewer is static and can be hosted as-is. Install dev dependencies only if
you are planning to make changes.

```sh
cd viewer
pnpm install
# Important: Run after making changes to re-build tailwind css
# pnpm run build
```

### TODO

- support multiple posts.json
- search posts
