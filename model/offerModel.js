
const mongoose = require("mongoose");

const catagoryOfferSchema = mongoose.Schema({
    catagoryName: String,
    offer: Number,
    validity: Date
})

const CatagoryOffer = mongoose.model('CatagoryOffer', catagoryOfferSchema)

module.exports = CatagoryOffer