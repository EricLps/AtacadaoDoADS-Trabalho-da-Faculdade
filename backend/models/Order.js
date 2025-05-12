const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    frete: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pendente'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
