/**
 * TODO: 8.3 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
const form = document.getElementById('register-form');
form.onsubmit = function(event){
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const passConfirm = document.getElementById('passwordConfirmation').value;
    if(pass.localeCompare(passConfirm) === 0){
        formData = {'name':name, 'email':email, 'password':pass};
        const responseJson = postOrPutJSON('/api/register', 'POST', formData);
        createNotification('Register Successfully!', 'notifications-container', true);
        form.reset();
        createNotification('Register Successfully!', 'notifications-container', true);
    }else{
        createNotification('Confirm Password not matched', 'notifications-container', false);
    }
};


