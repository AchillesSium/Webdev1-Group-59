const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    customerId: { 
        type: String, 
        required: true 
    },
    items: { 
        type: Array, 
        required: true, 
        minlength:1, }
});

const orderedItemSchema = new Schema({
    product: { 
        type: {
            _id: { 
                required: true, 
                type: String 
            },
            name: { 
                required: true, 
                type: String 
            },
            price: { 
                required: true, 
                type: Number, 
                min: 0.01 
            },
            description: { 
                type: String 
            }
        }, 
        required: true 
    },
    quantity: { 
        required: true, 
        type: Number, 
        min:1 
    }
});


// Omit the version key when serialized to JSON
orderSchema.set('toJSON', { virtuals: false, versionKey: false });
orderedItemSchema.set('toJSON', { virtuals: false, versionKey: false });

const Order = new mongoose.model('Order', orderSchema);
const OrderedItem = new mongoose.model('OrderedItem', orderedItemSchema);
module.exports = { Order, OrderedItem };
