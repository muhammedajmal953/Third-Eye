const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userId:ObjectId,
    products: [{
        productId: ObjectId,
        quantity: {
            type: Number, default:0 },
        productName: String,
        price: Number,
        imageUrl:String
    }],
    totalPrice:Number

    

});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;