const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const catagoryOfferSchema = mongoose.Schema({
    catagoryId: { type:ObjectId ,ref:'Catagory'},
    offer: Number,
    validity: Date
})

const CatagoryOffer = mongoose.model('CatagoryOffer', catagoryOfferSchema)

module.exports = CatagoryOffer