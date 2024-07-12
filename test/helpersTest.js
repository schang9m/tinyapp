const { assert } = require('chai');

const { getUserByEmail } = require('../helper/helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
  });

  it('should return undefined with non-existent email', function() {
    const user = getUserByEmail("asdjio@xampe.com", testUsers)
    const expectedUserID = undefined;
    // Write your assert statement here
  });
});

const { urlsForUser } = require('../helper/helper');

describe('urlsForUser', function() {
  it('should return URLs that belong to the specified user', function() {
    const urlDatabase = {
      "shortURL1": { longURL: "https://www.example1.com", userID: "user1" },
      "shortURL2": { longURL: "https://www.example2.com", userID: "user2" },
      "shortURL3": { longURL: "https://www.example3.com", userID: "user1" }
    };

    const userId = "user1";
    const expectedURLs = {
      "shortURL1": { longURL: "https://www.example1.com", userID: "user1" },
      "shortURL3": { longURL: "https://www.example3.com", userID: "user1" }
    };

    const result = urlsForUser(userId, urlDatabase);

    assert.deepEqual(result, expectedURLs);
  });

  it('should return an empty object if no URLs belong to the specified user', function() {
    const urlDatabase = {
      "shortURL1": { longURL: "https://www.example1.com", userID: "user2" },
      "shortURL2": { longURL: "https://www.example2.com", userID: "user3" }
    };

    const userId = "user1";
    const result = urlsForUser(userId, urlDatabase);

    assert.deepEqual(result, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const urlDatabase = {};
    const userId = "user1";
    const result = urlsForUser(userId, urlDatabase);

    assert.deepEqual(result, {});
  });

  it('should not return any URLs that do not belong to the specified user', function() {
    const urlDatabase = {
      "shortURL1": { longURL: "https://www.example1.com", userID: "user1" },
      "shortURL2": { longURL: "https://www.example2.com", userID: "user2" },
      "shortURL3": { longURL: "https://www.example3.com", userID: "user1" }
    };

    const userId = "user1";
    const result = urlsForUser(userId, urlDatabase);

    // Check that no URL belonging to another user is included in the result
    assert.notProperty(result, "shortURL2");
  });
});
