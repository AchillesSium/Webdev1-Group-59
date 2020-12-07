//List all the products on product.html

function listProducts(){
    let product_promise = getJSON('/api/products');
    let productTemp = document.querySelector('#product-template');
    let productContain = document.getElementById('products-container');
    product_promise.then(products => {
        products.forEach(product => {
            var clone = productTemp.content.cloneNode(true);
            clone.querySelector('.product-image').setAttribute('id', "image-"+product._id);
            clone.querySelector('.product-image').setAttribute('alt', "Product"+product.name);
            clone.querySelector('.product-image').setAttribute('src', product.image);
            clone.querySelector('h3').setAttribute('id', "name-"+product._id);
            clone.querySelector('.product-name').innerHTML = product.name;
            clone.querySelector('.product-description').setAttribute('id', "description-"+product._id);
            clone.querySelector('.product-description').innerHTML = product.description;
            clone.querySelector('.product-price').setAttribute('id', "price-"+product._id);
            clone.querySelector('.product-price').innerHTML = product.price;
            clone.querySelector('button').setAttribute('id', "add-to-cart-"+product._id);
            clone.querySelector('button').addEventListener("click", addedToCart);
            productContain.appendChild(clone);
        });
    });
}


//Added a product to the cart
function addedToCart(){
    const product_id = this.getAttribute("id").split("-")[3];
    const product_name = this.parentNode.querySelector('.product-name').textContent;
    if(!sessionStorage.getItem(product_id)) sessionStorage.setItem(product_id, 1);
    else sessionStorage.setItem(product_id, parseInt(sessionStorage.getItem(product_id))+1);
    createNotification("Added " +product_name+ " to cart!", "notifications-container");
}

listProducts();