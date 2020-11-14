const { assert } = require('chai');

const { authenticateUser } = require('../helper_functions');

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

describe('authenticateUser', function() {
  it('should return a user with valid email', function() {
    const user = authenticateUser(testUsers, "user@example.com")
    const expectedOutput = "userRandomID";
    assert(expectedOutput, user.id);
  });
  it('should return null for a user with invalid email', function() {
    const result = authenticateUser(testUsers, "user1@example.com")
    assert.isNull(result.user);
  });
});