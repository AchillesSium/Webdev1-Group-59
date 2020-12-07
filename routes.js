const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts, viewProduct, createProduct } = require('./controllers/products');
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
  '/api/users': ['GET', 'PUT'],
  '/api/products': ['GET', 'POST'],
  '/api/createProduct' : ['POST'],
  'api/orders' : ['GET', 'POST']
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
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} return boolean value
 */
const matchProductId = url => {
  return matchIdRoute(url, 'products');
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} return boolean value
 */
const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
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

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }

  const currentUser = await getCurrentUser(request);

  if (matchUserId(filePath)) {
    
    //Check user authentication 
    if (!checkAuth(response, currentUser, 'admin')) return;

    //Get user ID from coming url
    const userId = url.split('/').pop();

    //return user if it exists
    if (method.toUpperCase() === 'GET') {
      return viewUser(response, userId, currentUser);
    }
    //update user
    else if (method.toUpperCase() === 'PUT') {
      const requestBody = await parseBodyJson(request);
      return await updateUser(response, userId, currentUser, requestBody);
    }
    //delete a user
    else if (method.toUpperCase() === 'DELETE') {
      return deleteUser(response, userId, currentUser);
    }
  }

  if (matchProductId(filePath)) {

    //check user authentication
    if (!checkAuth(response, currentUser)) return;

    //Get product ID from coming url
    const productId = url.split('/').pop();

    //Return product if ID exists
    if (method.toUpperCase() === 'GET') {
      return viewProduct(response, productId);
    }
    //Update a product
    else if (method.toUpperCase() === 'PUT') {
      const requestBody = await parseBodyJson(request);
      return updateProduct(response, productId, requestBody);
    }
    //delete a product
    else if (method.toUpperCase() === 'DELETE') {
      return deleteProduct(response, productId);
    }
  }

  if (matchOrderId(filePath)) {

    //check user authentication
    if(!hasCorrectAuth(response, user, 'admin')) return;

    //Get order ID from coming url
    const orderId = url.split('/').pop();

    //Return order if ID exists
    if(method.toUpperCase() === 'GET'){
      return viewOrder(response, orderId);
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
    //get the current user and check it
    if(checkAuth(response, currentUser, 'admin')) return getAllUsers(response);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if request is not in JSON
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    const userBody = await parseBodyJson(request);
    //try to save the new user request
    if(userBody !== null){
      return registerUser(response, userBody);
    }else{
      return responseUtils.badRequest(response, "Bad Request");
    }
  }

  // Returning all products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    if(checkAuth(response, currentUser)) return getAllProducts(response);
  }

  // creating a new product
  if (filePath === '/api/createProduct' && method.toUpperCase() === 'POST') {
      
    // Fail if request is not in JSON
      if (!isJson(request)) {
        return badRequest(response, 'Invalid Content-Type. Expected application/json');
      }
      // Parse request body into JSON
      const productBody = await parseBodyJson(request);
      //try to save the new product
      if(productBody !== null){
        return createProduct(response, productBody);
      }else{
        return responseUtils.badRequest(response, "Bad Request");
      }
    }
  
    // GET all orders
    if (filePath === '/api/orders' && method.toUpperCase() === 'GET'){
      // Check user and send orders
      if(checkAuth(response, currentUser)) return getAllOrders(response, currentUser);
    }
  
    // POST a new order
    if (filePath === '/api/orders' && method.toUpperCase() === 'POST'){
      // Check user signed in
      if(!checkAuth(response, currentUser)) return;
      // Fail if not a JSON request
      if (!isJson(request)) {
        return badRequest(response, 'Invalid Content-Type. Expected application/json');
      }
      // Parse request body into JSON
      const orderBody = await parseBodyJson(request);
      // try to save the new order
      if(orderBody !== null){
        return createOrder(response, orderBody);
      }else{
        return responseUtils.badRequest(response, "Bad Request");
      }
    }
};

module.exports = { handleRequest };

module.exports = { handleRequest };
