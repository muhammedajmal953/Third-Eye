const Users = require("../model/userModel");
const bcrypt = require("bcrypt");

//handle user Profile View
exports.view_profile = async (req, res) => {
    try {
      const id = req.session.user;
  
      const user = await Users.findOne({ _id: id });
  
      if (user) {
        return res.render("./Users/userProfile", { user });
      }
    } catch (error) { 
        
    }
  };
  
  //handle edit profile  get
  
  exports.edit_profile = async (req, res) => {
    try {
      const id = req.query.id;
  
      const user = await Users.findOne({ _id: id });
  
      if (user) {
        return res.render("./Users/editProfile", { user, message: '' });
      }
    } catch (error) { }
  };
  
  //edtit profile saving
  exports.update_profile = async (req, res) => {
    try {
      const id = req.query.id;
      const { email, username, phone } = req.body;
  
      const updates = {
        email,
        username,
        phone
      };
      await Users.findByIdAndUpdate(id, updates);
      res.redirect("/user/profile");
    } catch (error) { }
  };
  
  //change password updating
  exports.change_password = async (req, res) => {
    try {
      let password = req.query.password;
  
      const { oldPassword, newPassword } = req.body;
  
      // Retrieve the user's current password from the database
      const user = await Users.findOne({ password });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Compare the provided old password with the one stored in the database
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordMatch) {
        return res.render("./Users/editProfile", { user, message: 'Password changed Succesfully' });
      }
  
      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the user's password in the database
      await Users.updateOne({ _id: user._id }, { password: hashedNewPassword });
  
      res.redirect("/user/profile");
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  