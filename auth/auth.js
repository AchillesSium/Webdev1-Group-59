const requestUtils = require("../utils/requestUtils");
const userUtils = require("../utils/users");

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.4 Implement getting current user based on the "Authorization" request header

  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user
  var current = await requestUtils.getCredentials(request);
  if(current == undefined){
    return null;
  }else if(current === null){
    return null;
  }else if (current.length <= 1){
    return null;
  }
  var email = current[0];
  var password = current[1];
  const user = await User.findOne({ email: current[0]}).exec();
  //var user = userUtils.getUser(email, password);
  if(user != undefined){
    return user;
  }
  else{
    return null;
  }
};

module.exports = { getCurrentUser };
