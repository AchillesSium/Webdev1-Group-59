const Product = require("../models/product");
const responseUtils = require("../utils/responseUtils");
/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response sending response to user
 */
const getAllProducts = async response => {
  
  const onload = await Product.find({});
  //const onload = await require("../products.json");
  return responseUtils.sendJson(response, onload);
};


const createProduct = async (response, productBody) => {
  if(err) return badRequest(response, "Bad Request");
  const newProduct = new Product(productBody);
  await newProduct.save();
  return createdResource(response, newProduct);
};


const viewProduct = async (response, productId) => {
  const onload = await Product.findById(productId).exec();
  if(!onload) return notFound(response);
   return sendJson(response, onload);
};


const deleteProduct = async (response, productId) => {
  const deletedProduct = await Product.findById(productId).exec();
  if(!deletedProduct) return notFound(response);
  await Product.deleteOne({ _id: productId });
  return sendJson(response, deletedProduct);
};


const updateProduct = async (response, productId, productBody) => {
    const updatedProduct = await Product.findById(productId).exec();
    if(err) return badRequest(response, "Bad Request");
    if(!updatedProduct) return notFound(response);
    updatedProduct.name = productData.name;
    updatedProduct.description = productData.description;
    updatedProduct.price = productData.price;
    updatedProduct.image = productData.image;
    await updatedProduct.save();
    return sendJson(response, updatedProduct);
};

module.exports = { getAllProducts, viewProduct, deleteProduct, updateProduct, createProduct };
