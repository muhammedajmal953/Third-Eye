const mongoose = require("mongoose");
const path=require('path')
require('dotenv').config({path:'../.env'})

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.Mongo_Uri);
    console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);  
  }
};
module.exports = connectDB;
