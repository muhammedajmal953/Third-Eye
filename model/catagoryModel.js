const mongoose = require('mongoose');



const CatagorySchema = mongoose.Schema({
  image: { type: String, required: true },
  catagoryName: { type: String, required: true },
  isActive:Boolean
});

const Catagory = mongoose.model('Catagory', CatagorySchema);

module.exports= Catagory;

