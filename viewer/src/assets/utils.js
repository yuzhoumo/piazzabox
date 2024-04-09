const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = (date.getDay() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().substring(-2);
  return `${month}/${day}/${year}`;
};

const getPosts = async () => {
  return (await (await fetch("/posts.json")).json()).posts;
};

const getReplies = (children) => {
  return (children ?? []).filter(
    (c) => c.type === "followup" || c.type === "feedback",
  );
};

const getInstructorAnswer = (children) => {
  const answer = (children ?? []).filter((c) => c.type === "i_answer");
  return answer.length > 0 ? answer[0].history[0] : {};
};

const getStudentAnswer = (children) => {
  const answer = (children ?? []).filter((c) => c.type === "s_answer");
  return answer.length > 0 ? answer[0].history[0] : {};
};

function getAnonProfile(anonUID, postID) {
  const anonNames = [
    {
      icon: "/assets/icons/anon_icon-01.jpg",
      name: "Anonymous Atom",
    },
    {
      icon: "/assets/icons/anon_icon-02.jpg",
      name: "Anonymous Helix",
    },
    {
      icon: "/assets/icons/anon_icon-03.jpg",
      name: "Anonymous Mouse",
    },
    {
      icon: "/assets/icons/anon_icon-04.jpg",
      name: "Anonymous Beaker",
    },
    {
      icon: "/assets/icons/anon_icon-05.jpg",
      name: "Anonymous Calc",
    },
    {
      icon: "/assets/icons/anon_icon-06.jpg",
      name: "Anonymous Comp",
    },
    {
      icon: "/assets/icons/anon_icon-07.jpg",
      name: "Anonymous Gear",
    },
    {
      icon: "/assets/icons/anon_icon-08.jpg",
      name: "Anonymous Scale",
    },
    {
      icon: "/assets/icons/anon_icon-09.jpg",
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

function getAnonName(anonUID, postID) {
  return getAnonProfile(anonUID, postID).name;
}

function getAnonIcon(anonUID, postID) {
  return getAnonProfile(anonUID, postID).icon;
}

function getUserIcon(uid) {
  // TODO(joe): implement
  return "/assets/icons/default.svg";
}
