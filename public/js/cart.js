// List all products on cart.html

async function productIntoCart() {
    const cart = await getProductsfromCart(sessionStorage);
    let cart_temp = document.getElementById('cart-item-template');
    let cartContain = document.getElementById('cart-container');
    cart.forEach( product => {
        const clone = cart_temp.content.cloneNode(true);
        clone.querySelector('h3').setAttribute('id', "name-" + product._id);
        clone.querySelector('.product-name').innerHTML = product.name;
        clone.querySelector('.product-amount').setAttribute('id', "amount-" + product._id);
        clone.querySelector('.product-amount').innerHTML = product.amount;
        clone.querySelector('.product-price').setAttribute('id', "price-" + product._id);
        clone.querySelector('.product-price').innerHTML = product.price;
        clone.querySelectorAll('.cart-minus-plus-button')[0].setAttribute('id', "plus-" + product._id);
        clone.querySelectorAll('.cart-minus-plus-button')[0].addEventListener("click", updateCount);
        clone.querySelectorAll('.cart-minus-plus-button')[1].setAttribute('id', "minus-" + product._id);
        clone.querySelectorAll('.cart-minus-plus-button')[1].addEventListener("click", updateCount);
        cartContain.appendChild(clone);
    });
}
/**
 * Return all products from cart
 * @param Var sessionStorage
 * @returns Array<Object> all products
 */
const getProductsfromCart = async (sessionStorage) => {
    const cart = await JSON.parse(JSON.stringify(sessionStorage));
    const product_store = await getJSON('/api/products');
    const InCart_products = product_store.filter(product => product._id in cart)
    .map(product => {
        product['amount'] = cart[product._id]+'x'
        return product;
    });
    return InCart_products;
};

function updateCount() {
    const [count, id] = this.getAttribute("id").split("-");
    const product_name = this.parentNode.querySelector('.product-name').textContent;
    if(sessionStorage.getItem(id) === '1' && count === 'minus'){
        sessionStorage.removeItem(id);
    }else if(count === 'minus'){
        sessionStorage.setItem(id, parseInt(sessionStorage.getItem(id))-1);
    }else{
        sessionStorage.setItem(id, parseInt(sessionStorage.getItem(id))+1);
    }
    clearProductList();
    productIntoCart();
}

function clearProductList() {
    document.querySelector('#cart-container').innerHTML = '';
}

function clearCart(){
    // for(item in sessionStorage){
    //     sessionStorage.removeItem(item);
    // }
    sessionStorage = [];
    clearProductList();
}

function newOrder(){
    createNotification("Succesfully created an order!", "notifications-container");
    clearCart();
}

productIntoCart();
document.getElementById('place-order-button').addEventListener('click', newOrder);