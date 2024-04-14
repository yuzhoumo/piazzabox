var cn = (classnames) => {
  return classnames.join(" ");
}

var containsInlineLatex = (post) => {
  return JSON.stringify(post).includes("$$");
}

var getInstructorEndorsers = (post) => {
  const filterFunc = t => (t.role === "ta" || t.role === "instructor")
  if (post?.tag_good) {
    return post.tag_good.filter(filterFunc);
  } else if (post?.tag_endorse) {
    return post.tag_endorse.filter(filterFunc);
  }
  return [];
}

var endorsementMessage = (endorsers, type) => {
  if (endorsers?.length > 0) {
	  return `~ An instructor (${endorsers[0].name}) endorsed this ${type} ~`;
  }
  return "";
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
  const i = rand % anonNames.length;
  const name = anonNames[i].name + (repeatNum ? " " + (repeatNum + 1) : "");
  return {
    icon: "static/lib/img/" + anonNames[i].icon,
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
  return filename ? `assets/photos/${filename}` : "static/lib/img/default.svg";
}

var formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = (date.getDay() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().substring(2, 4);
  return `${month}/${day}/${year}`;
};

var getPostAnswer = (currentPost, type) => {
  const children = currentPost?.children;
  const postAnswer = children?.filter((c) => c.type === type);
  return postAnswer?.length > 0 ? postAnswer[0] : null;
};

var getPostReplies = (currentPost) => {
  const children = currentPost?.children;
  const filter = c => (c.type === "followup" || c.type === "feedback");
  return children?.filter(filter) ?? [];
};

var getPostAuthor = (post, userMap, i) => {
  if (post?.history[i].uid_a) {
    return getAnonName(post.history[i].uid_a, post.id);
  } else if (post?.history[i].uid) {
    return userMap.get(post.history[i].uid)?.name;
  }
  return "";
}

var getInstructorsAnswer = (currentPost, index) => {
  return getPostAnswer(currentPost, "i_answer")?.history[index] ?? null;
};

var getInstructorsAnswerContent = (currentPost, index) => {
  return getInstructorsAnswer(currentPost, index)?.content ?? "";
};

var getInstructorsAnswerDate = (currentPost, index) => {
  const created = getInstructorsAnswer(currentPost, index)?.created;
  return created ? formatDate(created) : "";
};

var getInstructorsAnswerAuthor = (currentPost, userMap, index) => {
  const answer = getInstructorsAnswer(currentPost, index);
  if (answer?.uid_a) {
    return getAnonName(answer.uid_a, currentPost.id);
  }
  return userMap.get(answer?.uid)?.name ?? "";
};

var getStudentsAnswer = (currentPost, index) => {
  return getPostAnswer(currentPost, "s_answer")?.history[index] ?? null;
};

var getStudentsAnswerContent = (currentPost, index) => {
  return getStudentsAnswer(currentPost, index)?.content ?? "";
};

var getStudentsAnswerDate = (currentPost, index) => {
  const created = getStudentsAnswer(currentPost, index)?.created;
  return created ? formatDate(created) : "";
};

var getStudentsAnswerAuthor = (currentPost, userMap, index) => {
  const answer = getStudentsAnswer(currentPost, index);
  if (answer?.uid_a) {
    return getAnonName(answer.uid_a, currentPost.id);
  }
  return userMap.get(answer?.uid)?.name ?? "";
};
