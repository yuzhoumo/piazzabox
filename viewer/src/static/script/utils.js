var cn = (classnames) => {
  return classnames.join(" ");
}

var containsInlineLatex = (post) => {
  return JSON.stringify(post).includes("$$");
}

var getAnonProfile = (anonUID, postID) => {
  const anonNames = [
    { icon: "anon_icon-01.jpg", name: "Atom"   },
    { icon: "anon_icon-02.jpg", name: "Helix"  },
    { icon: "anon_icon-03.jpg", name: "Mouse"  },
    { icon: "anon_icon-04.jpg", name: "Beaker" },
    { icon: "anon_icon-05.jpg", name: "Calc"   },
    { icon: "anon_icon-06.jpg", name: "Comp"   },
    { icon: "anon_icon-07.jpg", name: "Gear"   },
    { icon: "anon_icon-08.jpg", name: "Scale"  },
    { icon: "anon_icon-09.jpg", name: "Poet"   },
  ];
  /* reverse-engineered from minified Piazza js */
  const primes = [23, 29, 31, 37];
  const anonUserNum = parseInt(anonUID.substring(2)) + 1 || 0;
  const repeatNum = parseInt((anonUserNum - 1) / anonNames.length);
  const seed = postID.charCodeAt(postID.length - 1) || "0";
  const rand = primes[seed % primes.length] * anonUserNum + seed;
  const idx = rand % anonNames.length;
  const name = anonNames[idx].name + (repeatNum ? " " + (repeatNum + 1) : "");
  return {
    icon: "static/img/" + anonNames[idx].icon,
    name: "Anonymous "  + name,
  };
}

var getAnonName = (anonUID, postID) => {
  return getAnonProfile(anonUID, postID).name;
}

var getAnonIcon = (anonUID, postID) => {
  return getAnonProfile(anonUID, postID).icon;
}

var getUserIcon = (uid, userMap) => {
  const filename = userMap.get(uid)?.photo;
  return filename ? `assets/photos/${filename}` : "site/img/default.svg";
}

var formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = (date.getDay() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().substring(-2);
  return `${month}/${day}/${year}`;
};

var getPostAnswer = (currentPost, type, idx) => {
  const children = currentPost?.children;
  const postAnswer = children?.filter((c) => c.type === type);
  return postAnswer?.length > 0 ? postAnswer[0].history[idx] : null;
};

var getPostReplies = (currentPost) => {
  const children = currentPost?.children;
  const filter = c => (c.type === "followup" || c.type === "feedback");
  return children?.filter(filter) ?? [];
};

var getPostAuthor = (post, userMap) => {
  if (post?.uid_a) {
    return getAnonName(post.uid_a, post.id);
  } else if (post?.uid) {
    return userMap.get(post.uid)?.name;
  }
  return "";
}

var getInstructorsAnswer = (currentPost, index) => {
  return getPostAnswer(currentPost, "i_answer", index);
};

var getInstructorsAnswerContent = (currentPost) => {
  return getInstructorsAnswer(currentPost)?.content ?? "";
};

var getInstructorsAnswerDate = (currentPost) => {
  const created = getInstructorsAnswer(currentPost)?.created;
  return created ? formatDate(created) : "";
};

var getInstructorsAnswerAuthor = (currentPost, userMap) => {
  const answer = getInstructorsAnswer(currentPost);
  return getPostAuthor(answer, userMap);
};

var getStudentsAnswer = (currentPost, index) => {
  return getPostAnswer(currentPost, "s_answer", index);
};

var getStudentsAnswerContent = (currentPost) => {
  return getStudentsAnswer(currentPost)?.content ?? "";
};

var getStudentsAnswerDate = (currentPost) => {
  const created = getStudentsAnswer(currentPost)?.created;
  return created ? formatDate(created) : "";
};

var getStudentsAnswerAuthor = (currentPost, userMap) => {
  const answer = getStudentsAnswer(currentPost);
  return getPostAuthor(answer, userMap) ?? "";
};