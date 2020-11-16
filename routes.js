const responseUtils = require('./utils/responseUtils');
const usersUtils = require('./utils/users');
const requestUtils = require('./utils/requestUtils');
const productUtils = require('./utils/products');
const { acceptsJson, isJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const auth = require('./auth/auth');
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
    if (currentUser == null) {
      return responseUtils.basicAuthChallenge(response);
    }else if (currentUser.role !== 'admin') {
      return responseUtils.forbidden(response);
    }else if (currentUser.role == 'admin' && await currentUser.checkPassword(await getCredentials(request)[1])) {

      const usrid = filePath.split('/');
      const user = await User.findById(usrid[usrid.length - 1]).exec();

      if (!user) {
        return responseUtils.notFound(response);
      }

      if (method === 'GET') {
        return responseUtils.sendJson(response, user);
      }else if (method === 'PUT') {
        const requestBody = await parseBodyJson(request);
        if (!requestBody.role || (requestBody.role !== 'customer' && requestBody.role !== 'admin')) {
          return responseUtils.badRequest(response, "Bad Request");
        }else {
          user.role = requestBody.role;
          await user.save();
          return responseUtils.sendJson(response, user);
        }
      } else if (method === 'DELETE') {
        await User.deleteOne({ email: user.email });
        return responseUtils.sendJson(response, user);
      }

    } else {
      return responseUtils.basicAuthChallenge(response);
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
    if (!currentUser) {
      return responseUtils.basicAuthChallenge(response);
    }
    else if (currentUser.role == 'admin' && await currentUser.checkPassword(await getCredentials(request)[1])) {
      var users = await User.find({});
      return responseUtils.sendJson(response, users);
    }
    else return responseUtils.forbidden(response);
  }

  // if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
  //   var currentUser = await auth.getCurrentUser(request);
  //   if(currentUser == null) return responseUtils.basicAuthChallenge(response);
  //   var products = await productUtils.getAllProducts();
  //   return responseUtils.sendJson(response, products);
  // }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }

    // TODO: 8.3 Implement registration
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    let userBody = await requestUtils.parseBodyJson(request);
    // let userError = usersUtils.validateUser(userBody);
    // let userEmail = usersUtils.emailInUse(userBody.email);
    // if(userError.length){
    //   return responseUtils.badRequest(response, "Bad Request");
    // }else{
    //   if(userEmail){
    //     return responseUtils.badRequest(response, "Bad Request");
    //   }
    //   var  new_user = await usersUtils.saveNewUser(userBody);
    //   if(new_user.role != 'customer'){
    //     new_user = usersUtils.updateUserRole(new_user._id, 'customer')
    //   }
    //   return responseUtils.createdResource(response, new_user);
    // }
    const userData = {
      name: userBody.name,
      email: userBody.email,
      password: userBody.password
    };

    const newUser = new User(userData);

    let error = newUser.validateSync();
    if (error) {
      return responseUtils.badRequest(response, "Bad Request");
    } else {
      await newUser.save();
      return responseUtils.createdResource(response, newUser);
    }
  }

  // Returning products
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {

    var currentUser = await getCurrentUser(request);

    if (currentUser == null || !(await currentUser.checkPassword(await getCredentials(request)[1]))) {
      return responseUtils.basicAuthChallenge(response);
    }
    else if (headers['accept'] == null) {
      return responseUtils.contentTypeNotAcceptable(response);
    }
    else if (headers['accept'] !== 'application/json') {
      return responseUtils.contentTypeNotAcceptable(response);
    }
    else if (currentUser.role !== 'admin' && currentUser.role !== 'customer') {
      return responseUtils.forbidden(response);
    }
    else if (currentUser.role == 'admin' || currentUser.role == 'customer') {
      var users = await getAllProducts();
      return responseUtils.sendJson(response, users);
    }
    else {
      return responseUtils.basicAuthChallenge(response);
    }

  }
};

module.exports = { handleRequest };
