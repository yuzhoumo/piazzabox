# Piazzabox

Piazzabox is an archiver for Piazza courses. Piazzabox saves posts and linked
assets from Piazza and generates a static site for local viewing.

Built with Python and Alpine.js + Tailwind.

![screenshot](screenshot.png)

### Usage

1. Rename the `secrets.template.json` file to `secrets.json` and fill in your
   email and password for Piazza.
2. Run `python3 piazzabox.py` and choose Piazza courses to archive.
3. Open the generated html found in the `/archive` folder (alternatively,
   host this somewhere).

If Piazzabox fails due to network errors or is otherwise interrupted while
archiving, restart the program and it will pick up where it left off.

### Installation

```sh
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt
```

### Development

There is no need to install dev dependencies for the viewer unless you are
making changes to it. Use the following to install dev dependencies:

```sh
cd viewer
pnpm install
# Important: Run after making changes to re-build tailwind css
# pnpm run build
```
