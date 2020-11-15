const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // TODO: 9.4 Implement this
  name : { type: String, required: true, minlength: 1, maxlength: 50, trim: true},
  email : { type: String, required: true, match: "/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/"},
  password : { type: String, required: true, minlength: 10, trim: true, set:encryptSetter },
  role : { type: String, lowercase: true, enum: ['admin', 'customer'], default: 'customer', trim: true}
});

function encryptSetter(password){
  if(password.length < 10 || password === undefined || password === null) return password;
  return bcrypt.hashSync(password);
}

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  // TODO: 9.4 Implement this
  return await bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
