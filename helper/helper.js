//We recommend creating an user lookup helper function to keep your code DRY. 
//This function would take in an email as a parameter, and return either the entire user object or null if not found.
const userFinder = (email, users) => {
  for (let randomID in users) {
    if (users[randomID].email === email) {
      return randomID;
    }
  }
  return null;
}

const urlsForUser = (id, data) => {
  let userUrl = {};
  for (let shorUrl in data) {
    if (data[shorUrl].userID === id) {
      userUrl[shorUrl] = data[shorUrl];
    }
  }
  return userUrl
}

const checkUrl = (shortUrl, id, userUrl, database) => {
  if (!database[shortUrl]){
    return res.send("This url doesn't exist!");
  }
  if (!id){
    return res.send("You need to be signin");
  }
  if (!userUrl[shortUrl]) {
    return res.send("You don't own the url!");
  }
}

module.exports = {userFinder, urlsForUser, checkUrl};