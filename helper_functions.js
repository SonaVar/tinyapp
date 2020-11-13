//Generate a randome string as shortURL when creating a new url entry
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};

function authenticateUser(userDb, userEmail) {
  for (let user in userDb) {
    if (userDb[user].email === userEmail) {
      return {error: null, user: userDb[user]};
    }
  }
  return {error: 'Incorrect username or password', user: null};
};

function authenticatePass(userDb, userPass) {
  for (let user in userDb) {
    if (userDb[user].password === userPass) {
      return {error: null, user_id: user, user: userDb[user]};
    }
  }
  return {error: 'Invalid password. Try again.', user: null};
};

function urlsForUser(urlDb, id) {
  let urlObj = {};
  for (let url in urlDb) {
    if (urlDb[url].userID === id) {
      urlObj[url] = urlDb[url].longURL;
    }
  }
  return urlObj;
};


module.exports = {
  generateRandomString,
  authenticateUser,
  authenticatePass,
  urlsForUser
}