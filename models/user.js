const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function validator_name (val) {
	if (val.length < 1 || val.length > 50) {
		return false;
	}
	else if (val.substring(0,1) == ' ' || val.substring(val.length-1, val.length) == ' '){
		return false;
	}
	else {
		return true;
	}
}


function validator_email(val) {
	const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	return re.test(String(val).toLowerCase());
}


function validator_role (val) {
	if (val !== 'customer' && val !== 'admin') {
		return false;
	}
	else {
		return true;
	}
}


function validator_password (val) {
	if (val.length < 10 || !val || val == '') {
		return false;
	}
	else {
		return true;
	}
}


const userSchema = new Schema({
  // TODO: 9.4 Implement this
  
	name: {
			type: String,
			trim: true,
			validate: validator_name,			
			required: true
	},
	
	email: {
			type: String,
			validate: validator_email,
			required: true,
			index: { unique: true }
	},
	
	password: {
			type: String,
			required: true,
			validate: validator_password,	
			set: v => {if (v.length < 10 || !v || v == '') {
						return v;
						}
						else {
						return bcrypt.hashSync(v, bcrypt.genSaltSync(10));
						}
			}
	},
	
	role: {
			type: String,
			lowercase: true,
			trim: true,
			default: 'customer',
			validate: validator_role
	}

});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
  // TODO: 9.4 Implement this
  
	return bcrypt.compare(password, this.password);
  
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
