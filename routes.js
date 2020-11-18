const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson, getCredentials } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts } = require('./controllers/products');
const User = require('./models/user');

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

    var currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }else if (currentUser.role !== 'admin') {
      return responseUtils.forbidden(response);
    }

      const user_id = url.split('/').pop();

      if (method.toUpperCase() === 'GET') {
        const payload = await User.findbyId(user_id).exec();
        if(payload === undefined) return responseUtils.notFound(response);
        else return responseUtils.sendJson(response, payload);
      }
      

      else if (method.toUpperCase() === 'PUT') {
        const requestBody = await parseBodyJson(request);
        const update_user = await User.findbyId(user_id).exec();
        if(!update_user) return responseUtils.notFound(response);
        if (!requestBody.role || (requestBody.role !== 'customer' && requestBody.role !== 'admin')) {
          return responseUtils.badRequest(response);
        } else {
          update_user.role = requestBody.role;
          await update_user.save();
          return responseUtils.sendJson(response, update_user);
        }
      }
      

      else if (method.toUpperCase() === 'DELETE') {
        const delete_user = await User.findbyId(user_id).exec();
        if(!delete_user) return responseUtils.notFound(response);
        await User.deleteOne({ _id: user_id });
        return responseUtils.sendJson(response, delete_user);
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
  if (await !acceptsJson(request)) {
    return responseUtils.contentTypeNotAcceptable(response);
  }

  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    //get the current user and check it
    var currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }
    //if role admin then return all users in json
    else if (currentUser.role == 'admin') {
      var users = await User.find({});
      return responseUtils.sendJson(response, users);
    }
    else return responseUtils.forbidden(response);
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.3 Implement registration
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    let userBody = await parseBodyJson(request);
    //try to save the new user request
    try{
      const new_user = new User(userBody);
      new_user.role = 'customer';
      await new_user.save();
      return responseUtils.createdResource(response, new_user);
    }catch{
      return responseUtils.badRequest(response, "Bad Request");
    }
  }

  // Returning products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    var currentUser = await getCurrentUser(request);
    if(!currentUser){
      return responseUtils.basicAuthChallenge(response);
    }
    else return responseUtils.sendJson(response, getAllProducts());
  }
};

module.exports = { handleRequest };
