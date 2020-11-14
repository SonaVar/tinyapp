const express = require('express');
const cookieSession = require('cookie-session');
const {generateRandomString, authenticateUser, authenticatePass, urlsForUser} = require('./helper_functions');
const bcrypt = require('bcrypt');
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
})
);
const PORT = 8080;
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "id01" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "id02" }
};
const users = {
  "id01": {
    id: "id01",
    email: "Jack@example.com",
    password: "purple-monkey-dinosaur"
  },
  "id02": {
    id: "id02",
    email: "Jill@example.com",
    password: "dishwasher-funk"
  }
};

//Use body parser to parse the request body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Set the view engine as embedded JS
app.set('view engine', 'ejs');


//if user is logged in, redirect to /urls. If user is not logged in, redirect to /login
app.get('/', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});


//if user is logged in, returns HTML with:
//the site header
//a list (or table) of URLs the user has created, each list item containing:
//1. a short URL
//2. the short URL's matching long URL
//3. an edit button which makes a GET request to /urls/:id
//4. a delete button which makes a POST request to /urls/:id/delete
//a link to "Create a New Short Link" which makes a GET request to /urls/new
//if user is not logged in, returns HTML with a relevant error message
app.get('/urls', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    res.status(302).send('Please login or register.');
    return;
  }
  const userUrl = urlsForUser(urlDatabase, userID);
  const templateVar = {userUrl, regUser};
  res.render('urls_index', templateVar);
});


//if user is logged in, returns HTML with:
//the site header
//a form which contains:
//1. a text input field for the original (long) URL
//2. a submit button which makes a POST request to /urls
//if user is not logged in, redirects to the /login page
app.get('/urls/new', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    res.redirect('/login');
  } else {
    const templateVar = {users, regUser};
    res.render('urls_new', templateVar);
  }
});


//if user is logged in and owns the URL for the given ID, returns HTML with:
//the site header
//the short URL (for the given ID)
//a form which contains:
//1. the corresponding long URL
//2. an update button which makes a POST request to /urls/:id
//if a URL for the given ID does not exist, returns HTML with a relevant error message
//if user is not logged in, returns HTML with a relevant error message
//if user is logged it but does not own the URL with the given ID, returns HTML with a relevant error message
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!urlDatabase[shortURL] || !regUser || urlDatabase[shortURL].userID !== userID) {
    res.status(404).send('ERROR 404: Page not Found');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVar = {
    shortURL,
    longURL,
    regUser
  };
  res.render('urls_show', templateVar);
});


//if URL for the given ID exists, redirects to the corresponding long URL
//if URL for the given ID does not exist, returns HTML with a relevant error message
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const long = urlDatabase[shortURL].longURL;
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!long || !regUser) {
    res.status(404).send('ERROR 404: Page not Found');
    return;
  }
  res.redirect(`http://${long}`);
});


//if user is logged in, redirects to /urls
//if user is not logged in, returns HTML with:
//a form which contains:
//1. input fields for email and password
//2. submit button that makes a POST request to /login
app.get('/login', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    const templateVar = {regUser};
    res.render('urls_login', templateVar);
  } else {
    res.redirect('/urls');
  }
});


//if user is logged in, redirects to /urls
//if user is not logged in, returns HTML with:
//a form which contains:
//1. input fields for email and password
//2. a register button that makes a POST request to /register
app.get('/register', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    const templateVar = {regUser};
    res.render('urls_register', templateVar);
  } else {
    res.redirect('/urls');
  }
});


//Print to console once connection with client is established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


//if user is not logged in, returns HTML with a relevant error message
app.post('/urls', (req, res) => {
  const userID = req.session['user_id'];
  if (!userID) {
    res.status(400).send('Please login to continue.');
    return;
  }
});


//if user is logged in,
//generates a short URL, saves it, and associates it with the user
//redirects to /urls
app.post('/urls/new', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session['user_id']
  };
  res.redirect('/urls');
});


//if user is logged in and owns the URL for the given ID:
//updates the URL
//redirects to /urls
//if user is not logged in, returns HTML with a relevant error message
//if user is logged in but does not own the URL for the given ID, returns HTML with a relevant error message
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser || urlDatabase[shortURL].userID !== userID) {
    res.status(404).send('ERROR 404: Page not Found');
    return;
  }
  urlDatabase[shortURL].longURL = req.body.updatedLongURL;
  res.redirect('/urls');
});


//if user is logged in and owns the URL for the given ID:
//deletes the URL
//redirects to /urls
//if user is not logged in, returns HTML with a relevant error message
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session['user_id'];
  const regUser = users[userID];
  if (!regUser) {
    res.status(404).send('ERROR 404: Page not Found');
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


//if email and password params match an existing user:
//sets a cookie
//redirects to /urls
//if email and password params don't match an existing user, returns HTML with a relevant error message
app.post('/login', (req, res) => {
  const authenticateEmail = authenticateUser(users, req.body.email);
  const authenticatePassword = authenticatePass(users, req.body.password);
  if (authenticateEmail.user) {
    if (authenticatePassword.user) {
      req.session['user_id'] = authenticatePassword.user_id;
      res.redirect('/urls');
    } else {
      res.status(403).send(authenticatePassword.error);
    }
  } else {
    res.status(403).send(authenticateEmail.error);
  }
});


//if email or password are empty, returns HTML with a relevant error message
//if email already exists, returns HTML with a relevant error message
//otherwise:
//creates a new user
//encrypts the new user's password with bcrypt
//sets a cookie
//redirects to /urls
app.post('/register', (req, res) => {
  if (req.body.email !== '' && req.body.password !== '') {
    const authenticate = authenticateUser(users, req.body.email);
    if (authenticate.user) {
      res.status(400).send(`400 error: User already exists, please login`);
    } else {
      const userId = generateRandomString();
      users[userId] = {
        id: userId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      req.session.user_id = userId;
      res.redirect('/urls');
    }
  } else {
    res.status(400).send(`400 error: Invalid email and password`);
  }
});


//deletes cookie and redirects to /urls
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});