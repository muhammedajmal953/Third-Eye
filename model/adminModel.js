const mongoose = require("mongoose");

const schema1 = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
});

const Admin = mongoose.model("admins", schema1);

module.exports = Admin
