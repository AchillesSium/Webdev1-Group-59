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
<<<<<<< HEAD
  const current = await getCredentials(request);
  if(current === undefined){
=======
  var current = await requestUtils.getCredentials(request);
  if(current == undefined){
>>>>>>> f2ccc4312f260053df5b1dbd5bc7243d705195c3
    return null;
  }else if(current === null){
    return null;
  }else if (current.length <= 1){
    return null;
  }
<<<<<<< HEAD
  const email = current[0];
  const password = current[1];
  const user = getUser(email, password);
  if(user !== undefined){
=======
  var email = current[0];
  var password = current[1];
  var user = userUtils.getUser(email, password);
  if(user != undefined){
>>>>>>> f2ccc4312f260053df5b1dbd5bc7243d705195c3
    return user;
  }
  else{
    return null;
  }
};

module.exports = { getCurrentUser };
