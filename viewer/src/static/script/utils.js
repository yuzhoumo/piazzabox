var formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = (date.getDay() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().substring(-2);
  return `${month}/${day}/${year}`;
};

var getReplies = (children) => {
  return children.filter(
    c => (c.type === "followup" || c.type === "feedback")
  );
};

const getInstructorsAnswer = (data) => {
  const currentPost = JSON.parse(JSON.stringify(data));
  const children = currentPost.children;
  const answer = children.filter((c) => c.type === "i_answer");
  return answer.length > 0 ? answer[0].history[0] : null;
};

var getInstructorsAnswerContent = (currentPost) => {
  return getInstructorsAnswer(currentPost)?.content ?? '';
}

var getInstructorsAnswerDate = (currentPost) => {
  const created = getInstructorsAnswer(currentPost)?.created;
  return created ? formatDate(created) : "";
}

var getInstructorsAnswerAuthor = (currentPost, userMap) => {
  const answer = getInstructorsAnswer(currentPost);
  if (answer?.uid_a) {
    return getAnonName(answer.uid_a, currentPost.id);
  } else if (answer?.uid) {
    return userMap.get(answer.uid)?.name;
  }
  return "";
}

var getStudentsAnswer = (data) => {
  const currentPost = JSON.parse(JSON.stringify(data));
  const children = currentPost.children;
  const answer = children.filter((c) => c.type === "s_answer");
  return answer.length > 0 ? answer[0].history[0] : null;
};

var getStudentsAnswerContent = (currentPost) => {
  return getStudentsAnswer(currentPost)?.content ?? "";
}

var getStudentsAnswerDate = (currentPost) => {
  const created = getStudentsAnswer(currentPost)?.created;
  return created ? formatDate(created) : "";
}

var getStudentsAnswerAuthor = (currentPost, userMap) => {
  const answer = getStudentsAnswer(currentPost);
  if (answer?.uid_a) {
    return getAnonName(answer.uid_a, currentPost.id);
  } else if (answer?.uid) {
    return userMap.get(answer.uid)?.name;
  }
  return "";
}

var getAnonProfile = (anonUID, postID) => {
  const anonNames = [
    {
      icon: "site/img/anon_icon-01.jpg",
      name: "Anonymous Atom",
    },
    {
      icon: "site/img/anon_icon-02.jpg",
      name: "Anonymous Helix",
    },
    {
      icon: "site/img/anon_icon-03.jpg",
      name: "Anonymous Mouse",
    },
    {
      icon: "site/img/anon_icon-04.jpg",
      name: "Anonymous Beaker",
    },
    {
      icon: "site/img/anon_icon-05.jpg",
      name: "Anonymous Calc",
    },
    {
      icon: "site/img/anon_icon-06.jpg",
      name: "Anonymous Comp",
    },
    {
      icon: "site/img/anon_icon-07.jpg",
      name: "Anonymous Gear",
    },
    {
      icon: "site/img/anon_icon-08.jpg",
      name: "Anonymous Scale",
    },
    {
      icon: "site/img/anon_icon-09.jpg",
      name: "Anonymous Poet",
    },
  ];
  /* reverse-engineered from minified Piazza js */
  const primes = [23, 29, 31, 37];
  const anonUserNum = parseInt(anonUID.substring(2)) + 1 || 0;
  const repeatNum = parseInt((anonUserNum - 1) / anonNames.length);
  const seed = postID.charCodeAt(postID.length - 1) || "0";
  const rand = primes[seed % primes.length] * anonUserNum + seed;
  const index = rand % anonNames.length;
  return {
    icon: anonNames[index].icon,
    name:
    anonNames[index].name + (repeatNum ? " " + (repeatNum + 1) : ""),
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
