const requestUtils = require("../utils/requestUtils");
const User = require("../models/user");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request incomming http request
 * @returns {object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // getting current user based on the "Authorization" request header

  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user
  const current = await requestUtils.getCredentials(request);
  if(!current) return null;
  
  //Find current user from database and return that user if credentials are not null
  const user = await User.findOne({ email: current[0]}).exec();
  if(user !== null){
    if(await user.checkPassword(current[1])) return user;
    else return null;
  }
  else return null;
};

module.exports = { getCurrentUser };
