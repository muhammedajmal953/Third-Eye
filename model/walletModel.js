const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')


const walletShema = new mongoose.Schema({
    userId: ObjectId,
    balance: {
        type: Number,
        default:0
    },
    history: [
        {
            status: String,
            paymentId:String,
            date:Date
        }
    ]
})

const Wallet = mongoose.model('wallet', walletShema)

module.exports=Wallet