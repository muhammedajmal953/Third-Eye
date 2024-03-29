const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userId:ObjectId,
    products: [{
        productId: ObjectId,
        quantity: Number,
        catagory:String,
        cartQty: {
            type: Number, min:1 },
        productName: String,
        price: Number,
        imageUrl:String
    }],
    totalPrice: {type: Number,min:1 }

    

});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;