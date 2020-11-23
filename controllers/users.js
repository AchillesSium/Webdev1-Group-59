const User = require("../models/user");
const { sendJson, badRequest, createdResource, notFound, forbidden } = require('../utils/responseUtils');
const responseUtils = require('../utils/responseUtils');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async response => {
  // TODO: 10.1 Implement this
  const onload = await User.find({});
  return sendJson(response, onload);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async (response, userId, currentUser) => {
  // TODO: 10.1 Implement this
  const delete_user = await User.findById(userId).exec();
  if(!delete_user) return notFound(response);
  else if(userId === currentUser.id){
    return badRequest(response, "Bad Request");
  }
  await User.deleteOne({_id : userId});
  return sendJson(response, delete_user);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {
  // TODO: 10.1 Implement this
  // if(userId === currentUser.id){
  //   return badRequest(response, "Bad Request");
  // }else{
  //   const update_user = await User.findById(userId).exec();
  //   if(!update_user) return notFound(response);
  //   try{
  //     update_user.role = userData.role;
  //     await update_user.save();
  //     return sendJson(response, update_user);
  //   }catch(err){
  //     return badRequest(response, "Bad Request");
  //   }
  // }
  if(currentUser.role !== 'admin'){
		return forbidden(response); 
	}
	if (!userData.role || (userData.role !== 'customer' && userData.role !== 'admin')) {
		return responseUtils.badRequest(response, "Bad Request");
	}
	if (userId == currentUser.id) {
		return responseUtils.badRequest(response, "Updating own data is not allowed");
	}
	if(currentUser.role == 'admin'){
		let user = await User.findById(userId).exec();
		if (!user) {
			return responseUtils.notFound(response);
		}
		else {
			user.role = userData.role;
			await user.save();
			return responseUtils.sendJson(response, user);
		}
	}
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async (response, userId, currentUser) => {
  // TODO: 10.1 Implement this
  // const onload = await User.findById(userId).exec();
  // if(!onload) return notFound(response);
  // return sendJson(response, onload);
  if(currentUser.role !== 'admin'){
		return forbidden(response); 
    }
	if(currentUser.role == 'admin'){
		const user = await User.findById(userId).exec();
		if (!user) {
			return responseUtils.notFound(response);
		}
		else {
			return responseUtils.sendJson(response, user);
		}
	}
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
  // TODO: 10.1 Implement this
  try{
    const new_user = new User(userData);
    new_user.role = 'customer';
    await new_user.save();
    return createdResource(response, new_user);
  }catch(err){
    return badRequest(response, "Bad Request");
  }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };
