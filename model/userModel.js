

const mongoose = require('mongoose');


const UsersSchema = mongoose.Schema({
  username: { type: String},
  email: { type: String},
  password: { type: String},
  address: [{
    houseName: { type: String },
    village:{type:String},
    city: { type: String },
    state: { type: String },
    pincode:{type:Number}  
  }],
  phone: { type: Number },
  shortId: String,
  isBlocked: Boolean,
});

const Users = mongoose.model('Users', UsersSchema);             
 
module.exports= Users; 

