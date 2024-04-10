import grequests # IMPORTANT: Must be imported before "requests"

from piazza_api import Piazza, exceptions
from piazza_api.network import Network
from collections import namedtuple
from typing import Generator, Optional
from urllib.parse import unquote
from tqdm import tqdm
import requests
import time
import json
import pathlib
import os
import re

PIAZZA_RATE_LIMIT = 1
MAX_PBAR_DESC_LEN = 40
SECRETS_FILENAME = "secrets.json"
STARTUP_BANNER = \
"""
██████╗ ██╗ █████╗ ███████╗███████╗ █████╗ ██████╗  ██████╗ ██╗  ██╗
██╔══██╗██║██╔══██╗╚══███╔╝╚══███╔╝██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝
██████╔╝██║███████║  ███╔╝   ███╔╝ ███████║██████╔╝██║   ██║ ╚███╔╝
██╔═══╝ ██║██╔══██║ ███╔╝   ███╔╝  ██╔══██║██╔══██╗██║   ██║ ██╔██╗
██║     ██║██║  ██║███████╗███████╗██║  ██║██████╔╝╚██████╔╝██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝

 █████╗ ██████╗  ██████╗██╗  ██╗██╗██╗   ██╗███████╗██████╗
██╔══██╗██╔══██╗██╔════╝██║  ██║██║██║   ██║██╔════╝██╔══██╗
███████║██████╔╝██║     ███████║██║██║   ██║█████╗  ██████╔╝
██╔══██║██╔══██╗██║     ██╔══██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗
██║  ██║██║  ██║╚██████╗██║  ██║██║ ╚████╔╝ ███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
"""


class Color:
    MAGENTA   = "\033[95m"
    BLUE      = "\033[94m"
    CYAN      = "\033[96m"
    GREEN     = "\033[92m"
    WARNING   = "\033[93m"
    FAIL      = "\033[91m"
    NC        = "\033[0m"
    BOLD      = "\033[1m"
    UNDERLINE = "\033[4m"


class ClassInfo(namedtuple("ClassInfo", ["num", "term", "id", "json"])):
    __slots__ = ()
    def __str__(self):
        return f"{self.num} {self.term} ({self.id})"


def gen_dict_extract(key: str, var: dict) -> Generator:
    """Yield all nested keys of name `key` from dict `var`."""
    if hasattr(var, "items"):
        for k, v in var.items():
            if k == key:
                yield v
            if isinstance(v, dict):
                for result in gen_dict_extract(key, v):
                    yield result
            elif isinstance(v, list):
                for d in v:
                    for result in gen_dict_extract(key, d):
                        yield result


def gen_leaf_nodes(node: dict|list) -> Generator:
    """Yield a all leaf nodes from a container"""
    if isinstance(node, dict):
        leaves = []
        for value in node.values():
            leaves.extend(gen_leaf_nodes(value))
        yield leaves
    elif isinstance(node, list):
        leaves = []
        for item in node:
            leaves.extend(gen_leaf_nodes(item))
        yield leaves
    else:
        yield [node]


def set_pbar(pbar: tqdm, color: str, desc: str, last=False):
    """Update tqdm progress bar by one tick (close if last=True)."""
    formatted = f"{desc[:MAX_PBAR_DESC_LEN-4].strip()}"
    if len(desc) > MAX_PBAR_DESC_LEN:
        formatted = f"{formatted}..."
    pbar.set_description(f"{color}{formatted.ljust(MAX_PBAR_DESC_LEN)}{Color.NC}")
    if last:
        pbar.close()
    else:
        pbar.update(1)


def parse_selection(selection: str, num_classes: int) -> set[int]:
    """Parse user input from the class selection menu."""
    result = set()
    groups = selection.split(",")
    for g in groups:
        pair = g.split("-")
        first, last = int(pair[0]), int(pair[-1])
        if first < 1 or last > num_classes:
            raise ValueError(f"Selection is out of range")
        result.update(range(int(first), int(last)+1))
    return result


def select_classes(p: Piazza) -> tuple[list[ClassInfo], set[int]]:
    """
    Pulls all classes from Piazza and prompts the user to choose classes to
    archive. Returns a list of ClassInfo for all classes and a set of integers
    corresponding to the user's selection.
    """
    profile, classes = p.get_user_profile(), []
    for i, c in enumerate(profile["all_classes"].values()):
        classes.append(ClassInfo(num=c["num"], term=c["term"], id=c["id"], json=c))
        print(f"{i+1}: {str(classes[-1])}")

    print(f"\n{Color.MAGENTA}Enter the classes you would like to archive"+\
          f" as a comma-separated list.\nEntries can be either numbers or"+\
          f" ranges.\nExample: 1,5-7,9-12{Color.NC}")

    try:
        return classes, parse_selection(input(">>> "), len(classes))
    except Exception as e:
        print(f"{Color.FAIL}Invalid selection. {e}{Color.NC}")
        exit(1)


def auth() -> tuple[Optional[str], Optional[str]]:
    """Read email and password from the secrets file."""
    try:
        f = open(SECRETS_FILENAME, "r")
        secrets = json.load(f)
        f.close()
        return secrets["email"], secrets["password"]
    except:
        print(f"{Color.WARNING}{SECRETS_FILENAME} file is missing or invalid.{Color.NC}")
        return None, None


def make_piazza_client() -> Piazza:
    """
    Create a Piazza api client. Attempt to read credentials from secrets
    file. If the secrets file is missing, prompt the user instead.
    """
    try:
        p = Piazza()
        email, password = auth()
        if None not in (email, password):
            print(f"{Color.CYAN}Authenticating as {email}{Color.NC}...\n")
        p.user_login(email=email, password=password)
        return p
    except exceptions.AuthenticationError as e:
        print(f"{Color.FAIL}Authentication Error: {e}{Color.NC}\n")
        exit(1)


def archive_class_info(path: str, class_info: ClassInfo):
    """
    Fetches and saves class info to a file if it does not already exist.
    Returns the class info json (read from the file if it already exists).
    """
    if os.path.isfile(path):
        print(f"{Color.WARNING}Already archived: \"{path}\"{Color.NC}")
        with open(path, "r") as f:
            return json.loads(f.read())

    try:
        info_file = open(path, "w")
        info_file.write(json.dumps(class_info.json, indent=2))
        info_file.close()
        print(f"{Color.GREEN}Successfully archived class info{Color.NC}")
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive class info: {e}{Color.NC}")


def archive_class_stats(path: str, nw: Network) -> dict:
    """
    Fetches and saves class stats to a file if it does not already exist.
    Returns the class stats json (read from the file if it already exists).
    """
    if os.path.isfile(path):
        print(f"{Color.WARNING}Already archived: \"{path}\"{Color.NC}")
        with open(path, "r") as f:
            return json.loads(f.read())

    try:
        print(f"{Color.CYAN}Fetching course statistics...{Color.NC}")
        stats = nw.get_statistics()
        stats_file = open(path, "w")
        stats_file.write(json.dumps(stats, indent=2))
        stats_file.close()
        print(f"{Color.GREEN}Successfully archived class stats{Color.NC}")
        return stats
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive class stats: {e}{Color.NC}")
        return {}


def archive_posts(base_path: str, prefix: str, nw: Network) -> list[dict]:
    """
    Fetches and saves class posts to a directory if they do not already exist.
    Returns the a list of post jsons (read from disk if it already exists).
    """
    try:
        pathlib.Path(f"{base_path}/posts").mkdir(parents=True, exist_ok=True)

        feed = nw.get_feed(limit=999999, offset=0)["feed"]
        feed.sort(key=lambda info: int(info["nr"]))

        pbar, posts = tqdm(feed, dynamic_ncols=True), []
        for post_info in feed:
            post_num = post_info["nr"]
            path = f"{base_path}/{prefix}/{post_num}.json"

            filename = f"{post_num}.json"
            subject = post_info["subject"]

            if os.path.isfile(path):
                set_pbar(pbar, Color.WARNING, f"Already archived {filename}")
                post_file = open(path, "r")
                posts.append(json.loads(post_file.read()))
                post_file.close()
            else:
                set_pbar(pbar, Color.GREEN, f"{post_num}.json | {subject}")
                post = nw.get_post(post_info["id"])
                posts_file = open(path, "w")
                posts_file.write(json.dumps(post, indent=2))
                posts_file.close()
                posts.append(post)
                time.sleep(PIAZZA_RATE_LIMIT)

        set_pbar(pbar, Color.GREEN, f"Successfully archived {len(feed)} posts", last=True)
        return posts
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive posts: {e}{Color.NC}")
        return []


def archive_users(path: str, posts: list[dict], nw: Network) -> list[dict]:
    """
    Fetches and saves class users to a file if it does not already exist.
    Returns the class users json (read from the file if it already exists).
    """
    if os.path.isfile(path):
        print(f"{Color.WARNING}Already archived: \"{path}\"{Color.NC}")
        with open(path, "r") as f:
            return json.loads(f.read())

    try:
        uids = set()
        for post in posts:
            # Extract user ids from posts (only course staff can use the
            # get_all_users api)
            for uid in gen_dict_extract("uid", post):
                uids.add(uid)

        users = nw.get_users(list(uids))
        users_file = open(path, "w")
        users_file.write(json.dumps(users, indent=2))
        print(f"{Color.GREEN}Successfully archived {len(users)} users{Color.NC}")
        return users
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive users: {e}{Color.NC}")
        return []


def archive_user_photos(path: str, users: list[dict]):
    """Fetch user photos from Piazza and save them to disk."""
    pathlib.Path(path).mkdir(parents=True, exist_ok=True)

    pbar = tqdm(users, dynamic_ncols=True)
    for user in users:
        url = user["photo_url"]
        uid = user["id"]
        filename = user["photo"]
        dst = f"{path}/{filename}"

        if os.path.isfile(dst):
            set_pbar(pbar, Color.WARNING, f"Already archived {filename}")
            continue
        elif url:
            set_pbar(pbar, Color.GREEN, f"{filename}")
            res = requests.get(url)
            f = open(dst, "wb")
            f.write(res.content)
            f.close()
        else:
            set_pbar(pbar, Color.WARNING, f"User id {uid} has no photo")

    set_pbar(pbar, Color.GREEN, f"Successfully archived {len(users)} user photos", last=True)


def extract_links(posts: dict) -> list[str]:
    """Extract all s3 bucket links from posts json"""
    leaf_text = "".join([str(node) for node in gen_leaf_nodes(posts)])
    r = r"(?:(?:http[s]?://)?(?:piazza\.com))?/redirect/s3\?bucket=uploads[^\'\"\s)]*"
    links = re.findall(r, leaf_text)
    return list(set(links))


def archive_assets(posts: list[dict], base_path: str, url_prefix: str) -> str:
    """Extract s3 assets from posts and return posts json with converted urls"""

    posts_json_str = json.dumps({ "posts": posts }, indent=2)

    def convert_link(link):
        """Convert link and update the posts json string"""
        nonlocal posts_json_str
        decoded = unquote(link[link.find("prefix=") + len("prefix="):])
        posts_json_str = posts_json_str.replace(link, f"{url_prefix}/{decoded}")
        return f"{base_path}/{url_prefix}/{decoded}"

    links = extract_links(json.loads(posts_json_str))
    pbar = tqdm(links, dynamic_ncols=True)

    # Check if assets are already downloaded
    links_to_archive = []
    for link in links:
        dst = convert_link(link)
        filename = os.path.split(dst)[1]
        if os.path.isfile(dst):
            set_pbar(pbar, Color.WARNING, f"Already archived {filename}")
        else:
            links_to_archive.append(link)

    # Generate grequests GET requests for links
    make_url = lambda p: f"https://piazza.com{p}" if p[0] == "/" else p
    reqs = [grequests.get(make_url(link)) for link in links_to_archive]

    # Fetch assets asynchronously, 8 at a time
    for i, res in grequests.imap_enumerated(reqs, size=8):
        link = links_to_archive[i] # Indices come back in arbitrary order
        dst = convert_link(link)
        dir, filename = os.path.split(dst)

        if res is None:
            raise ValueError(f"Request failed: {reqs[i]}")

        set_pbar(pbar, Color.GREEN, filename)
        pathlib.Path(dir).mkdir(parents=True, exist_ok=True)
        f = open(dst, "wb")
        f.write(res.content)
        f.close()

    set_pbar(pbar, Color.GREEN, f"Successfully archived {len(links)} assets", last=True)
    return posts_json_str


def main(cwd):
    print(f"\n{Color.BLUE}{STARTUP_BANNER}{Color.NC}\n")
    p = make_piazza_client()
    classes, selection = select_classes(p)

    for i in selection:
        curr_class = classes[i-1]
        curr_path = f"{cwd}/{str(curr_class)}"
        pathlib.Path(curr_path).mkdir(parents=True, exist_ok=True)

        print(f"\n{Color.BOLD}{Color.CYAN}{str(curr_class)}:{Color.NC}")
        network = p.network(curr_class.id)

        print(f"\n{Color.BLUE}Archiving class info{Color.NC}")
        archive_class_info(f"{curr_path}/info.json", curr_class)

        print(f"\n{Color.BLUE}Archiving class stats{Color.NC}")
        archive_class_stats(f"{curr_path}/stats.json", network)

        print(f"\n{Color.BLUE}Archiving class posts{Color.NC}", end=" ")
        print(f"{Color.WARNING}(rate limit: {PIAZZA_RATE_LIMIT} req/s){Color.NC}")
        posts = archive_posts(curr_path, "posts", network)

        print(f"\n{Color.BLUE}Archiving assets from posts{Color.NC}")
        with open(f"{curr_path}/posts.json", "w") as f:
            f.write(archive_assets(posts, curr_path, "assets"))

        print(f"\n{Color.BLUE}Archiving users {Color.NC}")
        users = archive_users(f"{curr_path}/users.json", posts, network)

        print(f"\n{Color.BLUE}Archiving user photos {Color.NC}")
        archive_user_photos(f"{curr_path}/assets", users)

    print(f"\n{Color.GREEN}Archival completed!{Color.NC}")


if __name__ == "__main__":
    CURRENT_WORKING_DIR = os.path.dirname(os.path.realpath(__file__))
    main(CURRENT_WORKING_DIR)

