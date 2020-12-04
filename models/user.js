const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function validatorName (val) {
	if (val.length < 1 || val.length > 50) {
		return false;
	}
	else if (val.substring(0, 1) === ' ' || val.substring(val.length-1, val.length) === ' '){
		return false;
	}
	else {
		return true;
	}
}


function validatorEmail(val) {
	const re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
	return re.test(String(val).toLowerCase());
}


function validatorRole (val) {
	if (val !== 'customer' && val !== 'admin') {
		return false;
	}
	else {
		return true;
	}
}


function validatorPassword (val) {
	if (val.length < 10 || !val || val === '') {
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
			validate: validatorName,			
			required: true
	},
	
	email: {
			type: String,
			validate: validatorEmail,
			required: true,
			index: { unique: true }
	},
	
	password: {
			type: String,
			required: true,
			validate: validatorPassword,	
			set: v => {if (v.length < 10 || !v || v === '') {
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
			validate: validatorRole
	}

});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password incoming user password
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = async function (password) {
	return bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
