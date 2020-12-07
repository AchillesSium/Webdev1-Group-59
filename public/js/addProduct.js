/**
 *       - Handle product form submission
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful creation
 *       - Reset the form back to empty after successful creation
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
const form = document.getElementById('register-form');
form.onsubmit = function(event){
    event.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const image = document.getElementById('image').value;
    
    let formData;
    formData = {'name':name, 'description':description, 'price':price, 'image' :image};
    if(formData !== ''){
        const responseJson = postOrPutJSON('/api/products', 'POST', formData);
        form.reset();
        createNotification('Register Successfully!', 'notifications-container', true);
    }else{
        createNotification('Product data not Found', 'notifications-container', false);
    }
};


