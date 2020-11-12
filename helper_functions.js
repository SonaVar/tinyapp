//Generate a randome string as shortURL when creating a new url entry
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};


function getUser(userDb, userId) {
  for (let user in userDb) {
    if (user === userId) {
      return {error: null, user: userDb[user]};
    }
  }
  return {error: 'email', user: null};
};

function authenticateUser(userDb, userEmail) {
  for (let user in userDb) {
    if (userDb[user].email === userEmail /*&& userDb[user].password === userPass*/) {
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

module.exports = {
  generateRandomString,
  getUser,
  authenticateUser,
  authenticatePass
}