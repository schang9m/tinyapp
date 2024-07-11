const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const {userFinder, urlsForUser, checkUrl} = require('./helper/helper')


app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieParser());

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "schang9m@163.com",
    password: "qwe123",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const id = req.cookies.user_id
  const templateVars = {
    user: users[req.cookies.user_id], // Corrected typo
    urls: urlsForUser(id, urlDatabase)
  }
  if (!users[req.cookies.user_id]) {
    return res.send("Please Login or Register first")
  }
    res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  }
  if (!users[req.cookies.user_id]){
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  const id = req.cookies.user_id
  const userUrl = urlsForUser(id, urlDatabase);
  checkUrl(shortUrl, id, userUrl, urlDatabase);
  //check edge case
  // if (!urlDatabase.hasOwnProperty(id)) {
  //   res.send("this doesn't exist!")
  // }
  delete urlDatabase[shortUrl];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const id = req.cookies.user_id
  const userUrl = urlsForUser(id, urlDatabase);
  checkUrl(shortUrl, id, userUrl, urlDatabase);
  const newURL = req.body.longURL;//get the longURL
  urlDatabase[req.params.id].longURL = newURL;
  res.redirect(`/urls`)
})

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  if (!users[req.cookies.user_id]){
    return res.send("You need to be signin")
  };
  const id = generateRandomString();
  console.log(req.body.longURL)
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id 
  };  
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id
  const shortUrl = req.params.id;
  if (!urlDatabase[shortUrl]){
    return res.send("This url doesn't exist!");
  }
  if (!id) {
    return res.send("You need to login!")
  }
  const userUrl = urlsForUser(id, urlDatabase);
  if (!userUrl[shortUrl]) {
    return res.send("You don't own the url!")
  }
  const templateVars = {
    user: users[id],
    id: req.params.id, 
    longURL: userUrl[shortUrl].longURL};
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


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  if (!urlDatabase[req.params.id]) {
    res.send("Id doesn't exist!");
  } 
  const longURL = urlDatabase[req.params.id].longURL
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
})

app.get("/register", (req, res) => {
  if (users[req.cookies.user_id]){
    res.redirect("/urls")
  }
  res.render("register")//,{user:undefined})
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
  if (users[req.cookies.user_id]){
    res.redirect("/urls")
  }
    res.render("login")
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
