const express = require("express");
const app = express();
const {userFinder, urlsForUser, checkUrl} = require('./helper/helper')
const dotenv = require("dotenv");
const cookieSession = require('cookie-session')
dotenv.config();
const port = process.env.PORT; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "schang9m@163.com",
  },
};
//hash the password 
users["userRandomID"].password = bcrypt.hashSync(process.env.USER1_PASSWORD, salt);
users["aJ48lW"].password = bcrypt.hashSync(process.env.USER2_PASSWORD, salt);

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
  const id = req.session.user_id
  const templateVars = {
    user: users[id], // Corrected typo
    urls: urlsForUser(id, urlDatabase)
  }
  if (!users[id]) {
    return res.send("Please Login or Register first")
  }
    res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id
  const templateVars = {
    user: users[id],
  }
  if (!users[id]){
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  const id = req.session.user_id
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
  const id = req.session.user_id
  const userUrl = urlsForUser(id, urlDatabase);
  checkUrl(shortUrl, id, userUrl, urlDatabase);
  const newURL = req.body.longURL;//get the longURL
  urlDatabase[req.params.id].longURL = newURL;
  res.redirect(`/urls`)
})

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const id = req.session.user_id
  if (!users[id]){
    return res.send("You need to be signin")
  };
  const dbId = generateRandomString();
  // console.log(req.body.longURL)
  urlDatabase[dbId] = {
    longURL: req.body.longURL,
    userID: id
  };  
  res.redirect(`/urls/${dbId}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id
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
  delete req.session.user_id;
  res.redirect(`/login`);
})

app.get("/register", (req, res) => {
  if (users[req.session.user_id]){
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
    if (users[req.session.user_id]){
      res.redirect("/urls")
    }
    res.render("login")
  })
  
  app.post("/login", (req, res) => {
    const enterUser = req.body
    const userExist = userFinder(enterUser.email, users);
    if (userExist) {
      if (bcrypt.compareSync(enterUser.password, users[userExist].password)){
        req.session.user_id = users[userExist].id;
        return res.redirect("/urls");
      }
    }
    res.status(400).send('E-mail or password are wrong!');
  });
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });