const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieParser());

// Set res.locals.username for all routes
app.use((req, res, next) => {
  res.locals.username = req.cookies["username"];
  next();
});

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
app.post("/login", (req, res) => {
  const name = req.body.username;
  if(!name) {
    return res.send("Please enter your username");
  }
  res.cookie('username', name);
  res.redirect(`/urls`)
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Corrected typo
    urls: urlDatabase
  }
  
  console.log("res.locals.username:", res.locals.username); 
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  res.redirect(`/urls`);
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
    username: req.cookies["username"], 
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
  console.log(req.body); // Log the POST request body to the console
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
  res.clearCookie("username");
  res.redirect(`/urls`);
})

app.get("/register", (req, res) => {
  res.render("register")
})