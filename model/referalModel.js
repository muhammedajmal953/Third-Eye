const  mongoose  = require("mongoose");

const referalSchema = new mongoose.Schema({
    referalOffer: Number,
    referedOffer: Number,
    Validity:Date
})

const Referal = mongoose.model('Referal', referalSchema)

module.exports=Referal