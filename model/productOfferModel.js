const mongoose = require("mongoose");

const productOfferSchema = mongoose.Schema({
    productName: String ,
    offer: Number,
    validity: Date
})

const ProductOffer = mongoose.model('ProductOffer', productOfferSchema)

module.exports = ProductOffer