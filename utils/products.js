
//Getting data from product.json file
const data = {
    products: require('../products.json').map(product => ({ ...product }))
};
//Function to get all products and then return a copy of products
const getAllProducts = () => {
    const copyProducts = JSON.parse(JSON.stringify(data.products));
    return copyProducts; 
};

module.exports = {
    getAllProducts
};