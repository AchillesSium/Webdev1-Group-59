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
        clone.querySelectorAll('.cart-minus-plus-button')[0].addEventListener("click", updateProductCount);
        clone.querySelectorAll('.cart-minus-plus-button')[1].setAttribute('id', "minus-" + product._id);
        clone.querySelectorAll('.cart-minus-plus-button')[1].addEventListener("click", updateProductCount);
        cartContain.appendChild(clone);
    });
}

//Return all products from cart
const getProductsfromCart = async (sessionStorage) => {
    const cart = await JSON.parse(JSON.stringify(sessionStorage));
    const product_store = await getJSON('/api/products');
    let cart_products = [];

    for (const item in cart) {
        const product_detail = product_store.find(product => product._id === item);
        product_detail['amount'] = cart[item]+'x';
        cart_products.push(product_detail);
    };

    return cart_products;
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
    productsFromCart();
}

function clearProductList() {
    document.querySelector('#cart-container').innerHTML = '';
}

function clearCart(){
    for(item in sessionStorage){
        sessionStorage.removeItem(item);
    }
    clearProductList();
}

function newOrder(){
    createNotification("Succesfully created an order!", "notifications-container");
    clearCart();
}

productsFromCart();
document.getElementById('place-order-button').addEventListener('click', newOrder);