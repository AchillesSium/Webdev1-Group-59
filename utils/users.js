/**
 * Week 08 utility file for user related operations
 *
 * NOTE: This file will be abandoned during week 09 when a database will be used
 * to store all data.
 */

const { use } = require('chai');

/**
 * Use this object to store users
 *
 * An object is used so that users can be reset to known values in tests
 * a plain const could not be redefined after initialization but object
 * properties do not have that restriction.
 */
const data = {
  // make copies of users (prevents changing from outside this module/file)
  users: require('../users.json').map(user => ({ ...user })),
  roles: ['customer', 'admin']
};

/**
 * Reset users back to their initial values (helper function for tests)
 *
 * NOTE: DO NOT EDIT OR USE THIS FUNCTION THIS IS ONLY MEANT TO BE USED BY TESTS
 * Later when database is used this will not be necessary anymore as tests can reset
 * database to a known state directly.
 */
const resetUsers = () => {
  // make copies of users (prevents changing from outside this module/file)
  data.users = require('../users.json').map(user => ({ ...user }));
};

var demoUsers = data.users;

/**
 * Generate a random string for use as user ID
 * @returns {string}
 */
const generateId = () => {
  let id;

  do {
    // Generate unique random id that is not already in use
    // Shamelessly borrowed from a Gist. See:
    // https://gist.github.com/gordonbrander/2230317

    id = Math.random().toString(36).substr(2, 9);
  } while (data.users.some(u => u._id === id));

  return id;
};

/**
 * Check if email is already in use by another user
 *
 * @param {string} email
 * @returns {boolean}
 */
const emailInUse = email => {
  // TODO: 8.3 Check if there already exists a user with a given email
  for(var i = 0; i < demoUsers.length; i++){
    let user = demoUsers[i];
    if(email == user.email){
      return true;
    }
  }
  return false;
};

/**
 * Return user object with the matching email and password or undefined if not found
 *
 * Returns a copy of the found user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Object|undefined}
 */
const getUser = (email, password) => {
  // TODO: 8.3 Get user whose email and password match the provided values
  for(var i = 0; i < demoUsers.length; i++){
    let user = demoUsers[i];
    if(email == user.email && password == user.password){
      var copyUser = JSON.parse(JSON.stringify(user));
      return copyUser;
    }
  }
  return undefined;
};

/**
 * Return user object with the matching ID or undefined if not found.
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId
 * @returns {Object|undefined}
 */
const getUserById = userId => {
  // TODO: 8.3 Find user by user id
  for(var i = 0; i < demoUsers.length; i++){
    let user = demoUsers[i];
    if(user._id == userId){
      var copyUser = JSON.parse(JSON.stringify(user));
      return copyUser;
    }
  }
  return undefined;
};

/**
 * Delete user by its ID and return the deleted user
 *
 * @param {string} userId
 * @returns {Object|undefined} deleted user or undefined if user does not exist
 */
const deleteUserById = userId => {
  // TODO: 8.3 Delete user with a given id
  for(var i = 0; i < demoUsers.length; i++){
    let user = demoUsers[i];
    if(user._id == userId){
      demoUsers.splice(i,1);
      return user;
    }
  }
  return undefined;
};

/**
 * Return all users
 *
 * Returns copies of the users and not the originals
 * to prevent modifying them outside of this module.
 *
 * @returns {Array<Object>} all users
 */
const getAllUsers = () => {
  // TODO: 8.3 Retrieve all users
  var copyAll = JSON.parse(JSON.stringify(demoUsers));
  return copyAll;
};

/**
 * Save new user
 *
 * Saves user only in memory until node process exits (no data persistence)
 * Save a copy and return a (different) copy of the created user
 * to prevent modifying the user outside this module.
 *
 * DO NOT MODIFY OR OVERWRITE users.json
 *
 * @param {Object} user
 * @returns {Object} copy of the created user
 */
const saveNewUser = user => {
  // TODO: 8.3 Save new user
  // Use generateId() to assign a unique id to the newly created user.
  let id  = generateId()
  user._id = id;
  user.role = 'customer';
  var copyUser = JSON.parse(JSON.stringify(user));
  demoUsers.push(copyUser)
  return copyUser;
};

/**
 * Update user's role
 *
 * Updates user's role or throws an error if role is unknown (not "customer" or "admin")
 *
 * Returns a copy of the user and not the original
 * to prevent modifying the user outside of this module.
 *
 * @param {string} userId
 * @param {string} role "customer" or "admin"
 * @returns {Object|undefined} copy of the updated user or undefined if user does not exist
 * @throws {Error} error object with message "Unknown role"
 */
const updateUserRole = (userId, role) => {
  // TODO: 8.3 Update user's role
  if(data.roles.includes(role)){
    for(var i = 0; i < demoUsers.length; i++){
      //var user = demoUsers[i];
      if(demoUsers[i]._id == userId){
        demoUsers[i].role = role;
        var copyUser = JSON.parse(JSON.stringify(demoUsers[i]));
        return copyUser;
      }
    }
  }
  else throw new Error('Unknown role');

  return undefined;
};

/**
 * Validate user object (Very simple and minimal validation)
 *
 * This function can be used to validate that user has all required
 * fields before saving it.
 *
 * @param {Object} user user object to be validated
 * @returns {Array<string>} Array of error messages or empty array if user is valid
 */
const validateUser = user => {
  // TODO: 8.3 Validate user before saving
  var errorMessages = [];
  if(user.name == undefined){
    errorMessages.push("Missing name");
  }
  else if(user.email == undefined){
    errorMessages.push("Missing email");
  }
  else if(user.password == undefined){
    errorMessages.push("Missing password");
  }
  else if(!data.roles.includes(user.role) && user.role != undefined){
    errorMessages.push("Unknown role");
  }

  return errorMessages;
};

module.exports = {
  deleteUserById,
  emailInUse,
  getAllUsers,
  getUser,
  getUserById,
  resetUsers,
  saveNewUser,
  updateUserRole,
  validateUser
};
