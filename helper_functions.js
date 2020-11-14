const bcrypt = require('bcrypt');


//Generate a randome string as shortURL when creating a new url entry
const generateRandomString = function() {
  let r = Math.random().toString(36).substring(7);
  return r;
};


//authenticates the entered e-mail:
//returns user details if e-mail is valid
//returns error if e-mail is invalid
const authenticateUser = function(userDb, userEmail) {
  for (let user in userDb) {
    if (userDb[user].email === userEmail) {
      return {error: null, user: userDb[user]};
    }
  }
  return {error: 'Incorrect username or password', user: null};
};


//authenticates the entered password:
//returns user details if password is valid
//returns error if password is invalid
const authenticatePass = function(userDb, userPass) {
  for (let user in userDb) {
    let dbPass = userDb[user].password;
    let compare = bcrypt.compareSync(userPass, dbPass);
    if (compare) {
      return {error: null, user_id: user, user: userDb[user]};
    }
  }
  return {error: 'Invalid password. Try again.', user: null};
};


//returns all user urls for the logged in user
const urlsForUser = function(urlDb, id) {
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
};