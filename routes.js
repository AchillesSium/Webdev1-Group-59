const responseUtils = require('./utils/responseUtils');
const usersUtils = require('./utils/users');
const requestUtils = require('./utils/requestUtils');
const { acceptsJson, isJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const auth = require('./auth/auth');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix
 * @returns {boolean}
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  if (matchUserId(filePath)) {
    // TODO: 8.5 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    const currentUser = await auth.getCurrentUser(request);
    if(!currentUser){
      return responseUtils.basicAuthChallenge(response);
    }
    else if(currentUser.role !== 'admin'){
      return responseUtils.forbidden(response);
    }

    //Update or Delete method implementation
    //let head_array = filePath.split('/');
    let userId = url.split('/').pop();
    if(method.toUpperCase() == 'GET'){
      var user = await usersUtils.getUserById(userId);
      if(user === undefined) return responseUtils.notFound(response);
      else return responseUtils.sendJson(response, user);
    }
    else if(method.toUpperCase() == 'PUT'){
      var body = await requestUtils.parseBodyJson(request);
      //let role = body.role;
      try {
        const updated_user = usersUtils.updateUserRole(userId, body.role);
        if(updated_user === undefined) return responseUtils.notFound(response);
        else return responseUtils.sendJson(response, updated_user);
      } catch (error) {
        return responseUtils.badRequest(response);
      }
    } 
    else if(method.toUpperCase() === "DELETE"){
      var deleted_user = usersUtils.deleteUserById(userId);
      if(deleted_user == undefined) return responseUtils.notFound(response);
      else return responseUtils.sendJson(response, deleted_user);
    }
  }

  // Default to 404 Not Found if unknown url
  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

  // See: http://restcookbook.com/HTTP%20Methods/options/
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  // Check for allowable methods
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }

  // Require a correct accept header (require 'application/json' or '*/*')
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    // TODO: 8.3 Return all users as JSON
    // TODO: 8.4 Add authentication (only allowed to users with role "admin") 
    var currentUser = await auth.getCurrentUser(request);
    if(!currentUser){
      return responseUtils.basicAuthChallenge(response);
    }
    else if(currentUser.role === "admin"){
      return responseUtils.sendJson(response, usersUtils.getAllUsers());
    }
    else return responseUtils.forbidden(response);
  }

  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    var currentUser = await auth.getCurrentUser(request);
    if(currentUser == null) return responseUtils.basicAuthChallenge(response);
    var products = await usersUtils.getAllProducts();
    return responseUtils.sendJson(response, products);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.3 Implement registration
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    let userBody = await requestUtils.parseBodyJson(request);
    let userError = usersUtils.validateUser(userBody);
    let userEmail = usersUtils.emailInUse(userBody.email);
    if(userError.length){
      return responseUtils.badRequest(response, "Bad Request");
    }else{
      if(userEmail){
        return responseUtils.badRequest(response, "Bad Request");
      }
      var  new_user = usersUtils.saveNewUser(userBody);
      if(new_user.role != 'customer'){
        new_user = usersUtils.updateUserRole(new_user._id, 'customer')
      }
      return responseUtils.createdResource(response, new_user);
    }
  }
};

module.exports = { handleRequest };
