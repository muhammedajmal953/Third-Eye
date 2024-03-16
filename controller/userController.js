const mongoose = require("mongoose");
const Catagory = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Users = require("../model/userModel");
const nodemailer = require("nodemailer");
const { generateOtp } = require("../services/generateOtp");
const otpModel = require("../model/otpModel");
const sendMail = require("../services/emailSender");
const bcrypt = require("bcrypt");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");
const { findById } = require("../model/adminModel");

let globalEmail;
let globalPhone;
let globalUsername;
let globalPassword;

//handling landing page
exports.landing = async (req, res) => {
  try {
    if (req.session.user) {
      return res.redirect("/user/home");
    }
    const catagory = await Catagory.find().limit(5);
    const product = await Product.find();
    // Rendering user home page and passing retrieved categories and products to the view
    res.render("./Users/landing", { catagory: catagory, product: product });
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.get_login = (req, res) => {
  try {
    if (req.session.user) {
      return res.redirect("/user/home");
    }
    return res.render("./Users/userLogin", { message: "" });
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.get_signup = (req, res) => {
  res.render("./Users/userSignUp", { message: "" }); // Rendering user signup page
};

exports.user_login = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { loginEmail, loginPassword } = req.body;

    // Find user data based on provided email and password
    const userData = await Users.findOne({
      email: loginEmail,
    });

    if (userData.isBlocked == true) {
      return res.render("./Users/userLogin", {
        message: "You are blocked With admin",
      });
    }

    // If user data exists
    if (userData) {
      // comparing the hashed password and login to home
      bcrypt.compare(loginPassword, userData.password, (err, result) => {
        if (err) {
          // Handle error
          console.error(err);
          res.redirect("/user/login");
          return;
        }

        if (result && userData.isBlocked === false) {
          req.session.user = userData._id;
          res.redirect("/user/home");
        } else {
          // Redirect to login page with an alert for invalid credentials
          res.redirect("/user/login");
        }
      });
    } else {
      // Redirect to login page with an alert for invalid credentials
      res.redirect("/user/login");
      res.status(400).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error logging in user:", error);
    res.status(400).json({ error: "Invalid credentials" });
  }
};

exports.google_login = async (req, res) => {
  try {
    res.redirect("/user/home");
  } catch (error) { }
};

//User registration handling
exports.user_SignUp = async (req, res) => {
  try {
    const { email, username, password, phone } = req.body;
    //checking existing user
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.render("./Users/userSignUp", {
        message: "this email is already used",
      });
    }

    //hashing the password that user registered
    bcrypt.hash(password, 10, (err, hash) => {
      globalPassword = hash;
    });

    globalEmail = email;
    globalPhone = phone;
    globalUsername = username;

    OTP = generateOtp();
    console.log(OTP);

    sendMail(email, OTP);

    const otpStore = new otpModel({
      email: email,
      otp: OTP,
    });

    await otpStore.save();

    res.render("./Users/otpVerification", { message: "" });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error signing up user:", error);
    res.status(500).send("Internal Server Error");
  }
};

//check otp is correct then save the user data
exports.verifyEmail = async (req, res) => {
  const userOtp = req.body.otp;
  const parsedotp = toString(userOtp);
  try {
    const savedOtp = await otpModel.findOne({
      email: globalEmail,
      otp: userOtp,
    });

    if (!savedOtp) {
      return res.render("./Users/otpVerification", { message: "wrong otp" });
    }

    if (userOtp === savedOtp.otp) {
      const userSave = new Users({
        username: globalUsername,
        email: globalEmail,
        phone: globalPhone,
        password: globalPassword,
        isBlocked: false,
      });

      await userSave.save();
    }
    res.render("./Users/userSignUp", { message: "email verified" });

    await otpModel.deleteOne({ email: globalEmail, otp: userOtp });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const newOtp = generateOtp();
    sendMail(globalEmail, newOtp);
    console.log(`your new otp:${newOtp}`);
    await otpModel.updateOne({ email: globalEmail }, { otp: newOtp });

    res.render("./Users/otpVerification", { message: "" });
  } catch { }
};

exports.get_home = async (req, res) => {
  try {
    // Retrieving categories and products from the database
    const catagory = await Catagory.find();
    const product = await Product.find().limit(5);
    // Rendering user home page and passing retrieved categories and products to the view
    res.render("./Users/home", { catagory: catagory, product: product });
  } catch (error) { }
};

exports.view_products = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    res.render("./Users/ProductDetails", { product });
  } catch (error) {
    res.status(500).send("Error occurred while fetching product details.");
  }
};

//handling Shop page rendering
exports.get_products = async (req, res) => {
  try {
    const page = req.params.page;
    const sortBy = req.query.sort;
    const totalProducts = await Product.find();
    const limit = 6;
    const totalPages = Math.ceil(totalProducts.length / limit);
    const { category } = req.query;

    console.log(category);
    // const sortBy = 'hiToLow';
    let sortCriteria = {};

    if (sortBy == "hiToLow") {
      sortCriteria = { price: -1 };
    } else if (sortBy == "lowToHi") {
      sortCriteria = { price: 1 };
    } else if (sortBy == "aToZ") {
      sortCriteria = { productName: 1 };
    } else if (sortBy == "zToA") {
      sortCriteria = { productName: -1 };
    }

    const skip = (page - 1) * limit;

    if (category) {

      const products = await Product.find({ catagory: category })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
        const totalPages = Math.ceil(products.length / limit);
      const catagory = await Catagory.find();
      return res.render("./Users/productsGrid", {
        products: products,
        catagory: catagory,
        sortBy,
        totalPages,
        page
      });
    }
    const products = await Product.find()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    const catagory = await Catagory.find();
    res.render("./Users/productsGrid", {
      products: products,
      catagory: catagory,
      sortBy,
      totalPages,
      page
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Oops  somthing Went Wrong...!!!");
  }
};


//handle user Profile View
exports.view_profile = async (req, res) => {
  try {
    const id = req.session.user;

    const user = await Users.findOne({ _id: id });

    if (user) {
      return res.render("./Users/userProfile", { user });
    }
  } catch (error) { }
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

//show address
exports.show_adress = async (req, res) => {
  try {
    const id = req.session.user;

    const user = await Users.findOne({ _id: id });

    res.render("./Users/address", { user });
  } catch (error) { }
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
  } catch (error) { }
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
  }
};

//save the edited address
exports.addressEdit = async (req, res) => {
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
  } catch (error) { }
};
//handling the Logout

//handling add to cart
exports.addToCart = async (req, res) => {
  try {
    let userId = req.session.user;
    let { productId } = req.query;

    const product = await Product.findOne({ _id: productId });
    let { productName, price, quantity } = product;
    let imageUrl = product.images[0];
    let cart = await Cart.findOne({ userId });
    let cartQty = 1;

    if (cart) {
      let cartTotal = cart.totalPrice;
      let itemIndex = cart.products.findIndex((p) => p.productId == productId);
      if (itemIndex > -1) {
        let productItem = cart.products[itemIndex];
        productItem.quantity = quantity;
        cart.products[itemIndex] = productItem;
      } else {
        cart.products.push({
          productId,
          productName,
          price,
          quantity,
          cartQty,
          imageUrl,
        });
        cart.totalPrice = cartTotal + price;
        cart = await cart.save();
      }
      res.redirect("/user/cart");
    } else {
      const newCart = new Cart({
        userId,
        products: [
          {
            productId,
            productName,
            price,
            quantity,
            cartQty,
            imageUrl,
          },
        ],
        totalPrice: price,
      });
      newCart.save();
      res.redirect("/user/cart");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

exports.show_cart = async (req, res) => {
  try {
    const userId = req.session.user;

    const userCart = await Cart.findOne({ userId: userId });
    if (!userCart) {
      return res.render("./Users/cart", { products: "", userCart: "" });
    }

    const products = userCart.products;
    const productQuantity = []

    for (i = 0; i < products.length; i++) {
      const prdct = await Product.findOne({ _id: products[i].productId })

      productQuantity[i] = prdct.quantity
    }

    console.log('data', productQuantity);

    res.render("./Users/cart", { products, userCart, productQuantity });
  } catch (error) { }
};

//remove from cart

exports.removeCart = async (req, res) => {
  try {
    const productId = req.query.productId;
    let price = parseInt(req.query.price); // Parse price to ensure it's a number
    let cartQty = parseInt(req.query.cartQty);

    price = price * cartQty;

    // Remove the product from the cart
    await Cart.updateOne(
      { "products._id": productId },
      { $pull: { products: { _id: productId } }, $inc: { totalPrice: -price } }
    );

    // Find the cart and update the total price

    // Send a success response back to the client
    res.status(200).json("Product removed from cart successfully.");
  } catch (error) {
    // Handle any errors that occur during the update operation
    console.error("Error removing product from cart:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.totalIncrement = async (req, res) => {
  try {
    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: price, "products.$.cartQty": 1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    res.status(200).json(totalPrice);
  } catch (error) {
    console.error("Error incrementing product quantity in cart:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.totalDecrement = async (req, res) => {
  try {
    console.log("accessed decrement");
    let price = parseInt(req.query.price);
    let indexId = req.query.indexId;

    const carUpdate = await Cart.updateOne(
      { "products._id": indexId },
      { $inc: { totalPrice: -price, "products.$.cartQty": -1 } }
    );
    const cart = await Cart.findOne({ "products._id": indexId });
    let totalPrice = cart.totalPrice;
    res.status(200).json(totalPrice);
  } catch (error) {
    console.error("Error incrementing product quantity in cart:", error);
    res.status(500).send("Internal server error.");
  }
};

exports.get_checkout = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await Users.findById(userId);
    const addresses = user.address;
    const cart = await Cart.findOne({ userId: userId });
    const products = cart.produts;
    res.render("./Users/checkout", {
      user,
      addresses,
      cart,
      products,
    });
  } catch (error) {

  }
};

exports.orderPlace = async (req, res) => {
  try {

    let userId = req.session.user;
    let { cart, address } = req.query;
    let user = await Users.findById(userId);
    let userCart = await Cart.findById(cart);
    let { username, email } = user;
    let { totalPrice, products } = userCart;
    let items = [];
    items = products;

    const order = new Order({
      username,
      email,
      userId,
      shippingAddress: address,
      items,
      totalAmount: totalPrice,
      paymentMethod: "Cod",
    });

    await order.save();
    await Cart.deleteOne({ _id: cart });
    for (i = 0; i < items.length; i++) {
      await Product.updateOne(
        { _id: items[i].productId },
        { $inc: { quantity: -items[i].cartQty } }
      );
    }
    res.send("product ordered");
  } catch (error) {
    console.error(error);
    res.status(500).send("order not placed");
  }
};

exports.orderView = async (req, res) => {
  try {
    const userId = req.session.user;

    const orders = await Order.find({ userId: userId }).sort({ odrderedDate: -1 });

    if (orders.length > 0) {

      const items = orders.flatMap((order) => order.items);

      const user = await Users.findById(userId);
      if (user) {
        console.log("User is ok");
      }

      res.render("./Users/orderList", { items, user });
    } else {
      console.log("No orders found for the user");
      // Render the view with an empty array of items
      res.render("./Users/orderList", { items: [], user });
    }
  } catch (error) {
    console.error("Error retrieving orders:", error);
    // Handle the error and render an error page or provide appropriate response
    res.status(500).send("Error retrieving orders");
  }
};

exports.searchPage = async (req, res) => {
  res.render("./Users/search", { products: [] });
};

exports.searchProducts = async (req, res) => {
  const text = req.body.text;

  const products = await Product.find({
    $or: [
      { productName: { $regex: text, $options: "i" } }, // Case-insensitive search for product name
      { description: { $regex: text, $options: "i" } }, // Case-insensitive search for product description
    ],
  });
  if (products) {
    res.render("./Users/search", { products });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { productId, cartQty } = req.query
    const userId = req.session.user
    const product = await Product.updateOne({ _id: productId }, { $inc: { quantity: cartQty } })

    await Order.updateOne(
      { userId: userId, 'items.productId': productId }, // Find the order with the specific product
      { $set: { 'items.$.status': 'Cancelled' } } // Update the status of the specific item
    );

    res.status(200).json({ message: 'Order successfully cancelled.' });

  } catch (error) {

  }
}

exports.orderDetails = async (req, res) => {
  try {
    const itemId = req.query.itemId
    console.log('id', itemId);
    const index = req.query.index
    console.log('index', index)
    const order = await Order.findOne({ 'items._id': itemId })

    const orderedItem = order.items.find(item => item._id.toString() === itemId);

    console.log(' orderedItem:', orderedItem);

    res.render('./Users/orderDetails', { order, orderedItem })
  } catch (error) {
    console.log(error);
  }
}




//logout user
exports.user_logout = (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/user");
  } catch (error) { }
};
