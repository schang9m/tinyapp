const express = require("express");
const app = express();
const {userFinder, urlsForUser, checkUrl, getUserByEmail, generateRandomString} = require('./helper/helper');
const dotenv = require("dotenv");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

//import the datas
const users = require('./data/users');
const urlDatabase = require("./data/urlDatabase");

dotenv.config();
const port = process.env.PORT; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);


//hash the password
users["userRandomID"].password = bcrypt.hashSync(process.env.USER1_PASSWORD, salt);
users["aJ48lW"].password = bcrypt.hashSync(process.env.USER2_PASSWORD, salt);

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  urlDatabase.counter++
  if (!users[id]) {
    req.session.error = "Login first!"
    return res.redirect("/login")
  }
  const templateVars = {
    user: users[id], // Corrected typo
    urls: urlsForUser(id, urlDatabase),
    error: req.session.error
  };
  delete req.session.error;
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = {
    user: users[id],
    error: req.session.error
  };
  if (!users[id]) {
    req.session.error = "Login first!"
    return res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.delete("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const id = req.session.user_id;
  const userUrl = urlsForUser(id, urlDatabase);

  const {error, url} = checkUrl(shortUrl, id, userUrl, urlDatabase);
  if (error) {
    req.session.error= error;
    return res.redirect("/urls")
  }
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const id = req.session.user_id;
  const userUrl = urlsForUser(id, urlDatabase);
  const {error, url} = checkUrl(shortUrl, id, userUrl, urlDatabase);
  if (error) {
    req.session.error= error;
    return res.redirect("/urls")
  }
  const newURL = req.body.longURL;//get the longURL
  urlDatabase[req.params.id].longURL = newURL;
  urlDatabase[shortUrl].counter = 0;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const id = req.session.user_id;
  if (!users[id]) {
    req.session.error = "Login first!"
    return res.redirect("/login")
  }
  let dbId = generateRandomString();
  // console.log(req.body.longURL)
  urlDatabase[dbId] = {
    longURL: req.body.longURL,
    userID: id,
    counter: 0
  };
  res.redirect(`/urls/${dbId}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id;
  const shortUrl = req.params.id;
  const userUrl = urlsForUser(id, urlDatabase);
  const {error, url} = checkUrl(shortUrl, id, userUrl, urlDatabase);
  if (error) {
    req.session.error= error;
    return res.redirect("/login")
  }
  const templateVars = {
    user: users[id],
    id: req.params.id,
    longURL: userUrl[shortUrl].longURL,
    counter: userUrl[shortUrl].counter
  };

  res.render("urls_show", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]) {
    req.session.error = "Url doesn't exist!";
    return res.redirect("/login");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  urlDatabase[shortUrl].counter++;
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect(`/login`);
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  res.render("register");//,{user:undefined})
});

app.post("/register", (req, res) => {
  const newUser = req.body;
  let id = generateRandomString();
  const userExist = userFinder(newUser.email, users);
  if (userExist) {
    return res.status(400).send('E-mail already exist!');
  }
  if (newUser.email && newUser.password) {
    users[id] = { id, email: newUser.email, password: bcrypt.hashSync(newUser.password, salt) };
    
    // Respond first before setting the cookie
    // res.status(200).send('Registration successful!').end(() => {
    req.session.user_id = users[id].id;
    res.redirect("/urls");
    // });
  } else {
    res.status(400).send('E-mail or password are empty!');
  }
});
  
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const templateVars = {error: req.session.error}
  delete req.session.error;
  res.render("login",templateVars);
});
  
app.post("/login", (req, res) => {
  const enterUser = req.body;
  const userExist = userFinder(enterUser.email, users);
  if (userExist) {
    if (bcrypt.compareSync(enterUser.password, users[userExist].password)) {
      req.session.user_id = users[userExist].id;
      return res.redirect("/urls");
    }
  }
  req.session.error = "Invalid Email/Password!!"
  return res.redirect("/login")
});
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});