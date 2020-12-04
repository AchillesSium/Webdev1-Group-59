const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    // TODO: 9.4 Implement this
    
    name: {
            type: String,
            trim: true,		
            required: true
        },
    description: {
            type: String,
            required: true
        },
    price: {
            type: Number,
            required: true
        }, 
    _id: {
            type: String,
            trim: true
        }
});

// Omit the version key when serialized to JSON
productSchema.set('toJSON', { virtuals: false, versionKey: false });

const Product = new mongoose.model('Product', productSchema);
module.exports = Product;