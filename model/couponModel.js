const  mongoose  = require("mongoose");

const couponShema = mongoose.Schema({
    code: String,
    offer: Number,
    minimum: Number,
    validity:Date
})

const Coupon = mongoose.model('Coupon', couponShema)

module.exports=Coupon