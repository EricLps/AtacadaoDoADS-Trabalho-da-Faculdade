const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    promoPrice: { type: Number },
    category: { type: String },
    stock: { type: Number, required: true },
    image: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
