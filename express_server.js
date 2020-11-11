const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Use body parser to parse the request body
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Set the view engine as embedded JS
app.set('view engine', 'ejs');

//Generate a randome string as shortURL when creating a new url entry
function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  return r;
};

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

//Edit the longURL of a selected shortURL
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.updatedLongURL;
  res.redirect(`/urls`);
});

//Render the urls_index view at '/urls'
app.get('/urls', (req, res) => {
  const templateVar = {urls: urlDatabase, username: req.cookies["username"]};
  res.render('urls_index', templateVar);
});

//Render the urls_new view at '/urls/new'
app.get('/urls/new', (req, res) => {
  const templateVar = {username: req.cookies["username"]};
  res.render('urls_new', templateVar);
});

//Create a new shortURL: longURL property for urlDatabase
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete an existing shortURL: longURL property from urlDatabase
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//Navigate to the website usig longURL from '/u/:shortURL'
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Render the urls_show view at '/urls:shortURL'
app.get('/urls/:shortURL', (req, res) => {
  const templateVar = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render('urls_show', templateVar);
});

//Send the HTML content to browser at '/hello'
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// app.get('/login', (req, res) => {
//   const templateVar = {username: req.body.username};
//   res.render('urls_index', templateVar);
// })

//POST to handle log in
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//POST to handle log out
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

//Print to console once connection with client is established
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});