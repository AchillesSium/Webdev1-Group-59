const Product = require("../models/product");
const responseUtils = require("../utils/responseUtils");
/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
  // TODO: 10.1 Implement this
  // const onload = await Product.find({});
  // return responseUtils.sendJson(response, onload);
  const products = await require("../products.json");
  var copyproducts = products;
  return responseUtils.sendJson(response, copyproducts);
};

module.exports = { getAllProducts };
