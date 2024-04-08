# Piazzabox - Piazza Archive Viewer

archiver - forked from Ben Cuan, relies on piazza-api (unofficial)
viewer - work in progress, renders archived json posts

To use:

1. Run `python3 archive.py` to archive piazza courses
2. Run `python3 -m http.server` in the `viewer` directory (alternatively, host
this directory somewhere)
3. Viewer will render `viewer/posts.json` (json archive of posts)

TODO:
- archive images
- render markdown
- render followup discussions
- search posts
- support multiple posts.json
