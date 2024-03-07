const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const orderSchema = mongoose.Schema({
    userID: ObjectId,
    shippingAddress: String,
    odrderedDate: {
        type: Date,
        default: Date.now
    },
    items: [{
        productId: ObjectId,
        productName:String,
        price: Number,
        cartQty: Number,
        imageUrl:String
    }],
    paymentMethod: String,
    totalAmount: Number,
    status: {
        type: String,
        default:'pending'
    },
    deleveredAt: Date
})

const Order=mongoose.model('Order',orderSchema)
module.exports= Order