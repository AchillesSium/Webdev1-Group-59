const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts } = require('./controllers/products');
const User = require('./models/user');
const Product = require('./models/product');
const { getAllUsers, viewUser, updateUser, deleteUser, registerUser } = require('./controllers/users');

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
 * @param {http.ServerResponse} response send response to user
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
 * @param {string} prefix fix id pattern
 * @returns {boolean} return boolean value
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
 * @returns {boolean} return boolean value
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 *  Does the given user have right to access content
 * 
 * @param {http.ServerResponse} response send response to user
 * @param {object} user current user
 * @param {string} role role of the current user or user under process
 */
const checkAuth = (response, user, role = '') => {
  if(!user){
    responseUtils.basicAuthChallenge(response);
    return false;
  }  
  else if(role !== '' && user.role !== role){
    responseUtils.forbidden(response);
    return false;
  } 
  else return true;
};

const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }
  const currentUser = await getCurrentUser(request);
  const requestBody = await parseBodyJson(request);

  return breakingComplexity(request, response, currentUser, requestBody);
};

function breakingComplexity(request, response, currentUser, requestBody){
  if (matchUserId(filePath)) {
    if (!checkAuth(response, currentUser, 'admin')) return;
    const userId = url.split('/').pop();
    if (method.toUpperCase() === 'GET') {
      return viewUser(response, userId, currentUser);
    }else if (method.toUpperCase() === 'PUT') {
      return updateUser(response, userId, currentUser, requestBody);
    }else if (method.toUpperCase() === 'DELETE') {
      return deleteUser(response, userId, currentUser);
    }
  }

  if (!(filePath in allowedMethods)) return responseUtils.notFound(response);
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);
  if (!allowedMethods[filePath].includes(method.toUpperCase())) {
    return responseUtils.methodNotAllowed(response);
  }
  
  return breakingComplexity2(request, response, currentUser, requestBody);
}

function breakingComplexity2(request, response, currentUser, requestBody){
  if (!acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    if(checkAuth(response, currentUser, 'admin')) return getAllUsers(response);
  }
  return breakingComplexity3(request, response, currentUser, requestBody);
}

function breakingComplexity3(request, response, currentUser, requestBody){
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }
    
    if(userBody !== null){
      return registerUser(response, requestBody);
    }else{
      return responseUtils.badRequest(response, "Bad Request");
    }
  }
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    if(checkAuth(response, currentUser)) return getAllProducts(response);
  }
}

module.exports = { handleRequest };
