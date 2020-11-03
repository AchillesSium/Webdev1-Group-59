const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { emailInUse, getAllUsers, saveNewUser, validateUser, updateUserRole, getUserById, deleteUserById } = require('./utils/users');
const { sendJson, badRequest, createdResource, basicAuthChallenge, notFound, forbidden } = require('./utils/responseUtils');
const { getCurrentUser } = require('./auth/auth');
const { use } = require('chai');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET']
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
    const headArray = filePath.split('/');
    const userId = headArray[3];
    const usre = await getUserById(userId);
    if(usre === null){
      return notFound(response);
    }
    const currentUser = await getCurrentUser(request);
    if(currentUser === null){
      return basicAuthChallenge(response);
    }if(currentUser.role !== 'admin'){
      return responseUtils.forbidden(response);
    }

    if(request.method === 'GET'){
      if(currentUser.role === 'admin'){
        const userg = await getUserById(userId);
        console.log('userID' + userId);
        if(userg === null){
          return notFound(response);
        }else{
          return sendJson(response,userg);
        }
      }
    }

    if(request.method === 'PUT'){
      const body = await parseBodyJson(request);
      const role = body.role;
      if(role === undefined){
        return badRequest(response, 'role is missing');
      }else if (role !== 'customer'){
        if(role !== 'admin'){
          return badRequest(response, 'role is not valid');
        }
      }
      if(currentUser.role === 'admin'){
        const user = updateUserRole(userId,body.role);
        return sendJson(response, user);
      }
    } 
    
    if(request.method === "DELETE"){
      if(currentUser.role === 'admin'){
        const userd = deleteUserById(userId);
        return sendJson(response, userd);
      }
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
    const currentUsera = await getCurrentUser(request);
    if(currentUsera === null){
      return basicAuthChallenge(response);
    }else if(currentUsera.role !== 'admin'){
      return responseUtils.forbidden(response);
    }else if(currentUsera.role === 'admin'){
      const users = await getAllUsers();
      return sendJson(response, users);
    }
    return responseUtils.basicAuthChallenge(response);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.3 Implement registration
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    const userBody = await parseBodyJson(request);
    const userError = validateUser(userBody);
    if(userError.length){
      return badRequest(response, "Bad Request");
    }else{
      if(emailInUse(userBody.email)){
        return badRequest(response, "Bad Request");
      }
      let newUser = saveNewUser(userBody);
      if(newUser.role !== 'customer'){
        newUser = updateUserRole(newUser._id, 'customer');
      }
      return createdResource(response, newUser);
    }
  }
};

module.exports = { handleRequest };
