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
  for (let key in data) {
    if (data[key].userID === id) {
      userUrl[key] = data[key];
    }
  }
  return userUrl
}

module.exports = {userFinder, urlsForUser};