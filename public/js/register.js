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
form.onsubmit = function(){
<<<<<<< HEAD
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const passConfirm = document.getElementById('passwordConfirmation').value;
    if(pass.localeCompare(passConfirm) === 0){
        formData = {'name':name, 'email':email, 'password':pass};
        const responseJson = postOrPutJSON('/api/register', 'POST', formData);
        createNotification('Register Successfully!', 'notifications-container', true);
=======
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var pass = document.getElementById('password').value;
    var passConfirm = document.getElementById('passwordConfirmation').value;
    let formData;
    if(pass.localeCompare(passConfirm) == 0){
        formData = {'name':name, 'email':email, 'password':pass};
        let responseJson = postOrPutJSON('/api/register', 'POST', formData);
>>>>>>> f2ccc4312f260053df5b1dbd5bc7243d705195c3
        form.reset();
        createNotification('Register Successfully!', 'notifications-container', true);
    }else{
        createNotification('Confirm Password not matched', 'notifications-container', false);
    }
};


