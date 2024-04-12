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
  const index = rand % anonNames.length;
  const name = anonNames[index].name + (repeatNum ? " " + (repeatNum + 1) : "");
  return {
    icon: "static/img/" + anonNames[index].icon,
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
  const children = currentPost.children;
  const postAnswer = children.filter((c) => c.type === type);
  return postAnswer.length > 0 ? postAnswer[0].history[idx] : null;
};

var getPostReplies = (children) => {
  const filter = c => (c.type === "followup" || c.type === "feedback");
  return children.filter(filter);
};

var getPostAnswerAuthor = (answer, userMap) => {
  if (answer?.uid_a) {
    return getAnonName(answer.uid_a, currentPost.id);
  } else if (answer?.uid) {
    return userMap.get(answer.uid)?.name;
  }
  return "";
}

var getInstructorsAnswer = (currentPost, idx) => {
  return getCollectiveAnswer(currentPost, "i_answer", idx);
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
  return getPostAnswer(answer, userMap);
};

var getStudentsAnswer = (currentPost, idx) => {
  return getCollectiveAnswer(currentPost, "s_answer", idx);
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
  return getPostAnswer(answer, userMap);
};