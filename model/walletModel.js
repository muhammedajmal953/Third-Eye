const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')


const walletShema = new mongoose.Schema({
    userId: ObjectId,
    balance: {
        type: Number,
        default:0
    },
    transaction: [
        {
            status: String,
            amount:Number,
            date:Date
        }
    ]
})

const Wallet = mongoose.model('wallet', walletShema)

module.exports=Wallet