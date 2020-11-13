const express = require('express');
const cookieParser = require('cookie-parser');
const {generateRandomString, authenticateUser, authenticatePass, urlsForUser} = require('./helper_functions');
const app = express();
app.use(cookieParser());
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
}

//Use body parser to parse the request body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Set the view engine as embedded JS
app.set('view engine', 'ejs');

///////////////////////////GET METHODS//////////////////////////////////////////

//Send 'Hello!' to browser at '/'
app.get('/', (req, res) => {
  res.send('Hello!');
  //Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
  
  //Cookies that have been signed
  console.log('Signed cookies: ', req.signedCookies);
});

//Send 'urlDatabase object' to browser at '/urls.json'
app.get('/urls.json', (req, res) => {
  res.send(urlDatabase);
});

app.get('/register', (req, res) => {
  const regUser = users;
  const templateVar = {regUser};
  res.render('urls_register', templateVar);
});

app.get('/login', (req, res) => {
  const regUser = users;
  const templateVar = {regUser};
  res.render('urls_login', templateVar);
});


//Render the urls_index view at '/urls'
app.get('/urls', (req, res) => {
  const userID = req.cookies.user_id
  const regUser = users[userID];
  if (!regUser) {
    res.status(302).send('Please login or register.')
    return;
  }
  const userUrl = urlsForUser(urlDatabase, userID);
  const templateVar = {userUrl, regUser};
  console.log(userUrl)
  res.render('urls_index', templateVar);
});

//Render the urls_new view at '/urls/new'
app.get('/urls/new', (req, res) => {
  const userID = req.cookies.user_id
  const regUser = users[userID];
  if (!regUser) {
    res.redirect('/login');
  } else {
    const templateVar = {users, regUser};
    res.render('urls_new', templateVar);
  }
});

//Navigate to the website usig longURL from '/u/:shortURL'
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//Render the urls_show view at '/urls:shortURL'
app.get('/urls/:shortURL', (req, res) => {
  const templateVar = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users};
  res.render('urls_show', templateVar);
});

//Send the HTML content to browser at '/hello'
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Print to console once connection with client is established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

//////////////////////////////POST METHODS//////////////////////////////////////


//Create a new shortURL: longURL property for urlDatabase
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Edit the longURL of a selected shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.updatedLongURL;
  res.redirect(`/urls`);
});

//POST to handle log in
app.post('/login', (req, res) => {
  const authenticateEmail = authenticateUser(users, req.body.email);
  const authenticatePassword = authenticatePass(users, req.body.password);
  if (authenticateEmail.user) {
    if (authenticatePassword.user){
      res.cookie('user_id', authenticatePassword.user_id);
      res.redirect('/urls');
    } else {
      res.status(403).send(authenticatePassword.error);
    }
  } else {
    res.status(403).send(authenticateEmail.error);
  }
});

//POST to handle log out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  if (req.body.email !== '' && req.body.password !== '') {
    const authenticate = authenticateUser(users, req.body.email);
    if (authenticate.user) {
      res.status(400).send(`400 error: User already exists, please login`);
    } else {
      const userId = generateRandomString();
      users[userId] = {
        id: 'id0' + Math.floor(Math.random()*10),
        email: req.body.email,
        password: req.body.password
      };
      res.cookie('user_id', userId);
      res.redirect('/login');
    }
  } else {
    res.status(400).send(`400 error: Invalid email and password`);
  }
});

//Delete an existing shortURL: longURL property from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});