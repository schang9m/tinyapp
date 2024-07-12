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
    return {error: "This url doesn't exist!", url:null};
  }
  if (!id){
    return {error: "You need to sign in!", url:null};
  }
  if (!userUrl[shortUrl]) {
    return {error: "You don't own the url!", url:null};
  }
  return {error: null, url:true}
}

const getUserByEmail = function(email, database) {
  // lookup magic...
  let user;
  for (let id in database) {
    if (database[id].email === email) {
      user = database[id];
    }
  }
  return user;
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

module.exports = {userFinder, urlsForUser, checkUrl, getUserByEmail, generateRandomString};