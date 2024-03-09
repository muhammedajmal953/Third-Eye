const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
   
  },
  catagory: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
}],
  createdAt: {
    type: Date,
    default: Date.now
  },
  isListed:{
    type:Boolean,
    required:true,
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
