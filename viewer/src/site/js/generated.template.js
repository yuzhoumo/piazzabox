const getUsers = async () => {
  const userMap = new Map();
  ({{USERS}}).forEach(user => { userMap.set(user.id, user)});
  return userMap;
};

const getPosts = async () => {
  return ({{POSTS}}).posts;
};
