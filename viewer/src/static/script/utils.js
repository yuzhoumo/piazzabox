var formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = (date.getDay() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().substring(-2);
  return `${month}/${day}/${year}`;
};

var getReplies = (children) => {
  return (children ?? []).filter(
    (c) => c.type === "followup" || c.type === "feedback",
  );
};

const getInstructorAnswer = (currentPost) => {
  const children = currentPost?.children;
  const answer = (children ?? []).filter((c) => c.type === "i_answer");
  return answer.length > 0 ? answer[0].history[0] : {};
};

var getInstAnsContent = (currentPost) => {
  return getInstructorAnswer(currentPost)?.content;
}

var getInstAnsDate = (currentPost) => {
  const created = getInstructorAnswer(currentPost)?.created
  return created ? formatDate(created) : "";
}

var getInstAnsName = (currentPost, userMap) => {
  const ans = getInstructorAnswer(currentPost)
  const name = ans.uid_a ? getAnonName(ans.uid_a, currentPost.id) : userMap?.get(ans.uid)?.name;
  return name;
}

var getStudentAnswer = (currentPost) => {
  const children = currentPost?.children;
  const answer = (children ?? []).filter((c) => c.type === "s_answer");
  return answer.length > 0 ? answer[0].history[0] : {};
};

var getStudAnsContent = (currentPost) => {
  return getStudentAnswer(currentPost)?.content;
}

var getStudAnsDate = (currentPost) => {
  const created = getStudentAnswer(currentPost)?.created
  return created ? formatDate(created) : "";
}

var getStudAnsName = (currentPost, userMap) => {
  const ans = getStudentAnswer(currentPost)
  const name = ans.uid_a ? getAnonName(ans.uid_a, currentPost.id) : userMap?.get(ans.uid)?.name;
  return name;
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
