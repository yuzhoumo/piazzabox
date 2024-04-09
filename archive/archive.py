from piazza_api import Piazza, exceptions
from piazza_api.network import Network
from collections import namedtuple
from typing import Generator, Optional
from urllib.parse import unquote
import time
import requests
import json
import pathlib
import os
import re


class Color:
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    NC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class ClassInfo(namedtuple("ClassInfo", ["num", "term", "id", "json"])):
    __slots__ = ()
    def __str__(self):
        return f"{self.num} {self.term} ({self.id})"


def gen_dict_extract(key: str, var: dict) -> Generator:
    """Yield all nested keys of name `key` from dict `var`."""
    if hasattr(var,'items'):
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
    """Yield a list of all leaf nodes from a container"""
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


def parse_selection(selection, num_classes):
    result = set()
    groups = selection.split(",")
    for g in groups:
        pair = g.split('-')
        first, last = int(pair[0]), int(pair[-1])
        if first < 1 or last > num_classes:
            raise ValueError(f'Selection is out of range')
        result.update(range(int(first), int(last)+1))
    return result


def select_classes(p: Piazza) -> tuple[list[ClassInfo], set[int]]:
    profile, classes = p.get_user_profile(), []
    for i, c in enumerate(profile["all_classes"].values()):
        classes.append(ClassInfo(num=c["num"], term=c["term"], id=c["id"], json=c))
        print(f"{i+1}: {str(classes[-1])}")

    print(f"\n{Color.MAGENTA}Select the classes you would like to archive."+\
          f"\nExamples:\t1\t5-7\t9-12{Color.NC}")

    try:
        return classes, parse_selection(input('>>> '), len(classes))
    except Exception as e:
        print(f'{Color.FAIL}Invalid selection. {e}{Color.NC}')
        exit(1)


def auth() -> tuple[Optional[str], Optional[str]]:
    try:
        f = open('SECRETS', 'r')
        secrets = json.load(f)
        f.close()
        return secrets['email'], secrets['password']
    except:
        print(f'{Color.WARNING}SECRETS file missing or invalid.{Color.NC}')
        return None, None


def make_piazza_client() -> Piazza:
    try:
        p = Piazza()
        email, password = auth()
        p.user_login(email=email, password=password)
        print(f'{Color.CYAN}Authenticating as {email}{Color.NC}')
        return p
    except exceptions.AuthenticationError as e:
        print(f'{Color.FAIL}Authentication Error: {e}{Color.NC}')
        exit(1)


def save_class_info(path: str, class_info: ClassInfo):
    try:
        info_file = open(path, "w")
        info_file.write(json.dumps(class_info.json, indent=2))
        info_file.close()
        print(f"{Color.GREEN}Successfully archived class info{Color.NC}")
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive class info: {e}{Color.NC}")


def save_class_stats(path: str, network: Network) -> dict:
    try:
        print(f"{Color.CYAN}Fetching course statistics...{Color.NC}")
        stats = network.get_statistics()
        stats_file = open(path, "w")
        stats_file.write(json.dumps(stats, indent=2))
        stats_file.close()
        print(f"{Color.GREEN}Successfully archived class stats{Color.NC}")
        return stats
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive class stats: {e}{Color.NC}")
        return {}


def save_class_posts(base_path: str, name: str, network: Network) -> list[dict]:
    try:
        pathlib.Path(f"{base_path}/posts").mkdir(parents=True, exist_ok=True)

        cnt, posts = 0, []
        for post_info in network.get_feed(limit=999999, offset=0)["feed"]:
            cnt += 1

            path = f"{base_path}/{name}/{post_info["nr"]}.json"
            if os.path.isfile(path):
                print(f'{Color.WARNING}Path exists, skipping: {path}{Color.NC}')
                continue

            post = network.get_post(post_info["id"])
            posts_file = open(path, "w")
            posts_file.write(json.dumps(post, indent=2))
            posts_file.close()
            posts.append(post)
            print(f"Current progress: {cnt} posts")
            time.sleep(1)

        posts.sort(key=lambda p: int(p["nr"]))

        print(f"{Color.GREEN}Successfully archived {cnt} posts{Color.NC}")
        return posts
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive posts: {e}{Color.NC}")
        return []


def save_class_users(path: str, posts: list[dict], network: Network) -> list[dict]:
    try:
        uids = set()
        for post in posts:
            for uid in gen_dict_extract("uid", post):
                uids.add(uid)
        users = network.get_users(list(uids))
        users_file = open(path, "w")
        users_file.write(json.dumps(users, indent=2))
        print(f"{Color.GREEN}Successfully archived {len(uids)} users{Color.NC}")
        return users
    except Exception as e:
        print(f"{Color.FAIL}Failed to archive users: {e}{Color.NC}")
        return []


def save_user_photos(path: str, users: list[dict]):
    pathlib.Path(path).mkdir(parents=True, exist_ok=True)

    for i, user in enumerate(users):
        url = user["photo_url"]
        dst = f"{path}/{user['photo']}"
        if os.path.isfile(dst):
            print(f'{Color.WARNING}Path exists, skipping: {dst}{Color.NC}')
            continue
        elif url:
            print(f"Current progress: {i+1} photos")
            res = requests.get(url)
            f = open(dst, "wb")
            f.write(res.content)
            f.close()


def extract_links(posts: dict) -> list[str]:
    """Extract links from posts json"""
    leaf_text = ''.join([str(node) for node in gen_leaf_nodes(posts)])
    r = r"(?:(?:http[s]?://)?(?:piazza\.com))?/redirect/s3\?bucket=uploads[^\'\"\s)]*"
    links = re.findall(r, leaf_text)
    return list(set(links))


def convert_piazza_s3_redirects(posts: list[dict], base_path: str, url_prefix: str) -> str:
    """Extract s3 assets and return new posts json text with links replaced"""

    posts_json_str = json.dumps({ "posts": posts }, indent=2)
    links = extract_links(json.loads(posts_json_str))
    num_links = len(links)

    for i, link in enumerate(links):
        decoded = unquote(link[link.find("prefix=") + len("prefix="):])
        posts_json_str = posts_json_str.replace(link, f"{url_prefix}/{decoded}")
        if not os.path.isfile(decoded):
            url = f"https://piazza.com{link}" if link[0] == "/" else link
            print(f"Downloading {i+1}/{num_links}: {url}")
            res = requests.get(url)
            prefix, filename = os.path.split(decoded)
            prefix = f"{url_prefix}/{prefix}"
            pathlib.Path(f"{base_path}/{prefix}").mkdir(parents=True, exist_ok=True)
            f = open(f"{base_path}/{prefix}/{filename}", "wb")
            f.write(res.content)
            f.close()
        else:
            print(f"Path exists, skipping: {decoded}")

    return posts_json_str


def main(cwd):
    print(f'{Color.MAGENTA}Welcome to the Piazza Archiver!{Color.NC}')

    p = make_piazza_client()
    classes, selection = select_classes(p)

    for i in selection:
        curr_class = classes[i-1]
        print(f'{Color.BLUE}Archiving {str(curr_class)}{Color.NC}')

        curr_path = f"{cwd}/{str(curr_class)}"
        pathlib.Path(curr_path).mkdir(parents=True, exist_ok=True)

        network = p.network(curr_class.id)
        save_class_info(f"{curr_path}/info.json", curr_class)
        save_class_stats(f"{curr_path}/stats.json", network)

        posts = save_class_posts(curr_path, "posts", network)
        with open(f"{curr_path}/posts.json", "w") as f:
            f.write(convert_piazza_s3_redirects(posts, curr_path, "assets"))

        users = save_class_users(f"{curr_path}/users.json", posts, network)
        save_user_photos(f"{curr_path}/assets", users)

    print(f"{Color.GREEN}Completed!{Color.NC}")


if __name__ == "__main__":
    CURRENT_WORKING_DIR = os.path.dirname(os.path.realpath(__file__))
    main(CURRENT_WORKING_DIR)

