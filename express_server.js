const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const userFinder = require('./helper/helper')


app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieParser());

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const generateRandomString = function() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length; // 62
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.random() * charactersLength);
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Corrected typo
    urls: urlDatabase
  }
    res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Corrected typo
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  //check edge case
  // if (!urlDatabase.hasOwnProperty(id)) {
  //   res.send("this doesn't exist!")
  // }
  delete urlDatabase[id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const newURL = req.body.longURL;//get the longURL
  urlDatabase[req.params.id] = newURL;
  res.redirect(`/urls`)
})

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars)
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
})

app.get("/register", (req, res) => {

  res.render("register", {user:undefined})//,{user:undefined})
})

app.post("/register", (req, res) => {
  const newUser = req.body
  const id = generateRandomString();
  const userExist = userFinder(newUser.email, users);
  if (userExist) {
    return res.status(400).send('E-mail already exist!')
  }
  if (newUser.email && newUser.password) {
    users[id] = { id, email: newUser.email, password: newUser.password };

    // Respond first before setting the cookie
    // res.status(200).send('Registration successful!').end(() => {
      res.cookie('user_id', id);
      res.redirect("/urls");
    // });
  } else {
    res.status(400).send('E-mail or password are empty!');
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
    res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const enterUser = req.body
  const userExist = userFinder(enterUser.email, users);
  if (userExist) {
    if(users[userExist].password === enterUser.password){
      res.cookie('user_id', userExist)
      return res.redirect("/urls");
    }
  }
  res.status(400).send('E-mail or password are wrong!');
});
