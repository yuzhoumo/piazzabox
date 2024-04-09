from piazza_api import Piazza, exceptions
from piazza_api.network import Network
from collections import namedtuple
from typing import Optional
import json
import pathlib
import os
import time


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


class ClassInfo(namedtuple("ClassInfo", ["num", "term", "id"])):
    def __str__(self):
        return f"{self.num} {self.term} ({self.id})"


def parse_selection(selection, num_classes):
    result = set()
    ranges = selection.split(',')
    for r in ranges:
        t = r.split('-')
        if len(t) == 1:
            i = int(t[0])
            if i < 1 or i > num_classes:
                raise ValueError(f'Invalid selection {i}')
            result.add(i)
        else:
            first, last = t
            for i in range(int(first), int(last)+1):
                if i < 1 or i > num_classes:
                    raise ValueError(f'Invalid selection {i}')
                result.add(i)

    return result


def select_classes(p: Piazza) -> tuple[list[ClassInfo], set[int]]:
    profile, classes = p.get_user_profile(), []
    for i, c in profile["all_classes"].values():
        classes.append(ClassInfo(num=c["num"], term=c["term"], id=c["id"]))
        print(f"{i+1}: {str(c)}")

    print(f'\n{Color.MAGENTA}Choose the classes you want to archive." +\
            "\nExamples:\t1\t2-5\t3-5,9-10{Color.NC}')

    try:
        return classes, parse_selection(input('> '), len(classes))
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
        print(f'{Color.WARNING}SECRETS file missing or invalid. Please enter your credentials below.{Color.NC}')
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


def save_class_info(base_path: str, class_info: ClassInfo):
    info_file = open(f"{base_path}/info.json", "w")
    info_file.write(json.dumps(class_info, indent=2))
    info_file.close()


def save_class_stats(base_path: str, network: Network):
    try:
        print(f"{Color.CYAN}Fetching course statistics...{Color.NC}")
        stats_file = open(f"{base_path}/stats.json", "w")
        stats_file.write(json.dumps(network.get_statistics(), indent=2))
        stats_file.close()
        print(f"{Color.GREEN}Course stats saved to stats.json{Color.NC}")
    except Exception as e:
        print(f"{Color.FAIL}Failed to fetch stats: {e}{Color.NC}")


def save_class_posts(base_path: str, network: Network):
    posts_file = open(f"{base_path}/posts.json", "w")
    posts = network.iter_all_posts()
    posts_file.write('{"posts": [\n')
    cnt = 1
    for post in enumerate(posts):
        posts_file.write(json.dumps(post, indent=2))
        last = posts_file.tell()
        posts_file.write(",\n")
        print(f"Current progress: {cnt} posts")
        cnt += 1
        time.sleep(1)
    posts_file.seek(last)
    posts_file.write('\n]}\n')
    posts_file.close()
    print(f"{Color.GREEN}Successfully archived {cnt} posts{Color.NC}")


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
        save_class_info(curr_path, curr_class)
        save_class_stats(curr_path, network)
        save_class_posts(curr_path, network)

    print(f"{Color.GREEN}All done!{Color.NC}")


if __name__ == "__main__":
    CURRENT_WORKING_DIR = os.path.dirname(os.path.realpath(__file__))
    main(CURRENT_WORKING_DIR)
