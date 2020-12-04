const User = require("../models/user");
const { sendJson, badRequest, createdResource, notFound } = require('../utils/responseUtils');
const responseUtils = require('../utils/responseUtils');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response send response to user
 */
const getAllUsers = async response => {

  const onload = await User.find({});
  return sendJson(response, onload);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response send response to user
 * @param {string} userId incomming ID of user to be deleted
 * @param {object} currentUser (mongoose document object) requesting user
 */
const deleteUser = async (response, userId, currentUser) => {
  
  const deletedUser = await User.findById(userId).exec();
  if(!deletedUser) return notFound(response);
  else if(userId === currentUser.id){
    return badRequest(response, "Bad Request");
  }
  await User.deleteOne({_id : userId});
  return sendJson(response, deletedUser);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response send response to user
 * @param {string} userId user to be updated
 * @param {object} currentUser (mongoose document object) requesting user
 * @param {object} userData JSON data from request body
 */
const updateUser = async (response, userId, currentUser, userData) => {

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
  if (userId === currentUser.id) {
		return responseUtils.badRequest(response, "Updating own data is not allowed");
	}
	else if (!userData.role || (userData.role !== 'customer' && userData.role !== 'admin')) {
		return responseUtils.badRequest(response, "Bad Request");
	}
	else if(currentUser.role !== 'admin'){
		return responseUtils.forbidden(response); 
	}
	else if(currentUser.role === 'admin'){
		const user = await User.findById(userId).exec();
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
 * @param {http.ServerResponse} response send response to user
 * @param {string} userId requesting user ID
 * @param {object} currentUser (mongoose document object) requesting user
 */
const viewUser = async (response, userId, currentUser) => {
  
  // const onload = await User.findById(userId).exec();
  // if(!onload) return notFound(response);
  // return sendJson(response, onload);
  if(currentUser.role !== 'admin'){
		return forbidden(response); 
    }
	else if(currentUser.role === 'admin'){
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
 * @param {http.ServerResponse} response send response to user
 * @param {object} userData JSON data from request body
 */
const registerUser = async (response, userData) => {
  
  try{
    const newUser = new User(userData);
    newUser.role = 'customer';
    await newUser.save();
    return createdResource(response, newUser);
  }catch(err){
    return badRequest(response, "Bad Request");
  }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };
