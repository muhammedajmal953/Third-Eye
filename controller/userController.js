const Catagory = require("../model/catagoryModel");
const Product = require("../model/productModel");
const Users = require("../model/userModel");
const nodemailer = require("nodemailer");
const { generateOtp } = require("../services/generateOtp");
const otpModel = require("../model/otpModel");
const sendMail = require("../services/emailSender");
const bcrypt = require('bcrypt')

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
    return res.render("./Users/userLogin", { message: '' });
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
      email: loginEmail
    });

    if (userData.isBlocked == true) {
      return res.render("./Users/userLogin", { message: 'You are blocked With admin' });
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

      })

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
    res.redirect('/user/home')
  } catch (error) {

  }
}



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
    })

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

    res.render("./Users/otpVerification");
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

    res.render("./Users/otpVerification");
  } catch {

  }
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

    const sortBy = req.query.sort
    console.log("sortBy : ", sortBy);
    // const sortBy = 'hiToLow';
    let sortCriteria = {}

    if (sortBy == 'hiToLow') {
      console.log("hitolow")
      sortCriteria = { price: -1 }

    } else if (sortBy == 'lowToHi') {
      sortCriteria = { price: 1 }
    } else if (sortBy == 'aToZ') {
      sortCriteria = { productName: 1 }
    } else if (sortBy == 'zToA') {
      sortCriteria = { productName: -1 }
    }


    const products = await Product.find().limit(15).sort(sortCriteria)
    console.log("products : ", products);
    const catagory = await Catagory.find()
    res.render('./Users/productsGrid', { products: products, catagory: catagory, sortBy })
  } catch (error) {
    res.status(500).send("Oops  somthing Went Wrong...!!!");
  }
};

//handle user Profile View
exports.view_profile =async (req,res) => {
  try {
    const id = req.session.user
    
    const user = await Users.findOne({ _id: id })
    
    if (user) {
      return res.render('./Users/userProfile',{user})
    }
  } catch (error) {
    
  }
}


//handling the Logout

exports.user_logout = (req, res) => {
  try {
      req.session.user=null
      res.redirect("/user");
  } catch (error) { }
};
