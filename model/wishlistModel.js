const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')


const wishlistSchema = new mongoose.Schema({
    userId: ObjectId,
    producIds: [ ObjectId ]
    
})

const Wishlist = mongoose.model('Wishlist', wishlistSchema)

module.exports=Wishlist