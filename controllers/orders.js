const Order = require('../models/order');
const { sendJson, notFound, badRequest, createdResource } = require('../utils/responseUtils');
/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response sending response to user
 * @param {Object} currentUser (mongoose document object) requesting user
 */
const getAllOrders = async (response, currentUser) => {
    if(currentUser.role === 'admin'){
        const onload = await Order.find({});
    }else{
        const onload = await Order.find({customerId: currentUser.id});
    }
    return sendJson(response, onload);
};

const viewOrder = async (response, orderId) => {
    const onload = await Order.findById(orderId).exec();
    if(!onload) return notFound(response);
    return sendJson(response, onload);
};

const createOrder = async (reponse, orderBody) => {
    if(err) return badRequest(response, "Bad Request");
    const newOrder = new Order(orderBody);
    await newOrder.save();
    return createdResource(response, newOrder);
};

module.exports = { getAllOrders, viewOrder, createOrder };