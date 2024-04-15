const Users = require("../../model/userModel");

//show address
exports.show_adress = async (req, res) => {
  try {
    const id = req.session.user;

    const user = await Users.findOne({ _id: id });

    res.render("./Users/address", { user });
  } catch (error) {
    res.render('Users/404error')
  }
};

//addind address
exports.addAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const { houseName, pincode, village, city, state } = req.body;

    const address = {
      pincode,
      houseName,
      village,
      city,
      state,
    };

    const user = await Users.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { address: address } }
    );

    res.redirect("/user/adresses");
  } catch (error) {
    res.render('Users/404error')
  }
};
exports.addAddressCheckOut = async (req, res) => {
  try {
    const id = req.query.id;
    const { houseName, pincode, village, city, state } = req.body;

    const address = {
      pincode,
      houseName,
      village,
      city,
      state,
    };

    const user = await Users.findByIdAndUpdate(
      { _id: id },
      { $addToSet: { address: address } }
    );

    res.redirect("/user/checkout");
  } catch (error) {
    res.render('Users/404error')
  }
};

exports.get_editAddress = async (req, res) => {
  try {
    const id = req.session.user;

    const index = req.query.index;
    const user = await Users.findById(id);

    const address = user.address[index];
    res.render("./Users/editAddress", { address, index });
  } catch (error) {
    console.log(error);
    res.render('Users/404error')
  }
};

//save the edited address
exports.addressEdit = async (req, res) => {
  try {


    const addressIndex = req.query.addressIndex;
    const userId = req.session.user;
    const { houseName, pincode, city, village, state } = req.body;
    const newAddress = {
      houseName,
      pincode,
      city,
      village,
      state,
    };

    const user = await Users.findById(userId);

    user.address[addressIndex] = newAddress;
    await user.save();

    res.redirect("/user/adresses");
  } catch (error) {
    res.render('Users/404error')
  }
};

//delete address
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const addressId = req.query.addressId;

    await Users.updateOne(
      { _id: userId },
      { $pull: { address: { _id: addressId } } }
    );
    res.redirect("/user/adresses");
  } catch (error) {
    res.render('Users/404error')
  }
};