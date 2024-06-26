const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");


const orderSchema = mongoose.Schema({
    userId: ObjectId,
    username: String,
    email:String,
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
        imageUrl: String,
        offerApplied:Number,
        status: { type: String, default: 'Odered' }
    }],
    paymentMethod: String,
    totalAmount: Number,
    totalDiscount:Number,
    deleveredAt: Date,
    paymentId:String
})

const Order=mongoose.model('Order',orderSchema)
module.exports= Order