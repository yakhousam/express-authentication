// in this example
// I use an array to store the new registred users
// I use a cookie to check the authentication
// I store an array of users in app.locals that persiste 
// will the server is running to mimic a database

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
// this middleware allow us to read req.body
app.use(express.urlencoded({ extended: false }));
// this middleware allow us to read the req.cookies
app.use(cookieParser());

// I store registred users in this array
// in production we should use a database
app.locals.users = [];

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/html/login.html');
});

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/html/register.html');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // I check if the username is not already used otherwise I redirect the user to the registration page
  if (app.locals.users.find(user => user.username === username))
    return res.redirect('/register');

  // I store the registred user in the array
  // In production we will store the user in the database
  app.locals.users.push({ username, password });

  // I create a cookie and i send it to the client browser
  // so everytime the client visit a page he will send this cookie
  // then I can check if he is loged in or not
  res.cookie('isAuthenticated', 1, { path: '/' });
  res.redirect('/profile');
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // same thing as registration less I don't sotre the user
  const user = app.locals.users.find(
    user => user.username === username && user.password === password
  );
  if (!user) {
    res.redirect('/login');
  } else {
    res.cookie('isAuthenticated', 1, { path: '/' });
    res.redirect('/profile');
  }
});

//this route act like a firewall
//if the user is not authenticated it will be redirected to the login page

app.use((req, res, next) => {
  // I checke if a cookie with a name isAuthenticated equal to true existe
  // If yes, I call next() to pass control to the next middleware function, 
  // otherwise I redirect the user to the login page
  if (!req.cookies.isAuthenticated) {
    return res.redirect('/login');
  }
  {
    next();
  }
});

// all the routes below are proteced by the above middelware.
// You can't access them if you are not loged in

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/html/index.html');
});
app.get('/profile', (req, res) => {
  res.sendFile(__dirname + '/html/profile.html');
});
app.get('/logout', (req, res) => {
  res.clearCookie('isAuthenticated', { path: '/' });
  res.redirect('/login');
});

app.listen(3000, () => {
  console.log('server is runnig on http://localhost:3000');
});
