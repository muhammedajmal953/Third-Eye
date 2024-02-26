

const mongoose = require('mongoose');


const UsersSchema = mongoose.Schema({
  username: { type: String},
  email: { type: String},
  password: { type: String},
  address: {
  },
  phone: { type: Number },
  gender: String,
  isBlocked: Boolean,
  googleId:{type:String}
});

const Users = mongoose.model('Users', UsersSchema);             
 
module.exports= Users; 

