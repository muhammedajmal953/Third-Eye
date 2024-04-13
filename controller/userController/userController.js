const mongoose = require("mongoose");
const Catagory = require("../../model/catagoryModel");
const Product = require("../../model/productModel");
const Users = require("../../model/userModel");
const { generateOtp } = require("../../services/generateOtp");
const otpModel = require("../../model/otpModel");
const sendMail = require("../../services/emailSender");
const bcrypt = require("bcrypt");
const { name } = require("ejs");
const generateRandomString = require("../../services/generateShortId");
const Wallet = require("../../model/walletModel");
const Referal = require("../../model/referalModel");
const CatagoryOffer = require("../../model/offerModel");
const ProductOffer = require("../../model/productOfferModel")

let globalEmail;
let globalPhone;
let globalUsername;
let globalPassword;
let globalShortId;

//handling landing page
exports.landing = async (req, res) => {
  try {
    if (req.session.user) {
      return res.redirect("/user/home");
    }
    const catagory = await Catagory.find().limit(5);
    const product = await Product.find().limit(5);
    // Rendering user home page and passing retrieved categories and products to the view
    res.render("./Users/landing", { catagory: catagory, product: product });
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.get_login = (req, res) => {
  try {
    const message = req.query.message

    if (req.session.user) {
      return res.redirect("/user/home");
    }
    return res.render("./Users/userLogin", { message });
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.get_signup = (req, res) => {
  let referalId = req.query.referalId || ''
  
  if (!referalId) {
    return res.render("./Users/userSignUp", { message: "", referalId: '' })

  }
  res.render("./Users/userSignUp", { message: "", referalId }); // Rendering user signup page
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
          res.redirect("/user/home?message=success");
        } else {

          // Redirect to login page with an alert for invalid credentials
          res.redirect("/user/login?message=incorrect password");
        }
      });
    } else {
      // Redirect to login page with an alert for invalid credentials
      res.redirect("/user/login?message=incorrect email or password");
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
  } catch (error) {

  }
};

//User registration handling
exports.user_SignUp = async (req, res) => {
  try {
    const referalId = req.query.referalId
    const { email, username, password, phone } = req.body;
    //checking existing user
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.render("./Users/userSignUp", {
        message: "this email is already used",referalId
      });
    }

    //hashing the password that user registered
    bcrypt.hash(password, 10, (err, hash) => {
      globalPassword = hash;
    });
    let shortId = generateRandomString()
    globalEmail = email;
    globalPhone = phone;
    globalUsername = username;
    globalShortId = shortId
    req.session.referalId = referalId
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

  const referals = await Referal.find() 

  const referal = referals[0]

  try {

    const savedOtp = await otpModel.findOne({
      email: globalEmail,
      otp: userOtp,
    });

    if (!savedOtp) {
      return res.json('Otp Is Wrong');
    }

    if (userOtp === savedOtp.otp) {
      if (req.session.forgot) {
        return res.json('forgot')
      }







      const userSave = new Users({
        username: globalUsername,
        email: globalEmail,
        phone: globalPhone,
        password: globalPassword,
        shortId: globalShortId,
        isBlocked: false,
      });

      await userSave.save();




      if (req.session.referalId) {
        const user = await Users.findOne({ shortId: req.session.referalId })
        if (user) {

          let wallet = await Wallet.findOne({ userId: user._id })
          if (!wallet) {
            const newWallet = new Wallet({
              userId: user._id,
              balance: referal.referalOffer,
              transaction: [{ status: `Credited`, amount: `${referal.referalOffer}`, date: Date.now() }]
            })
            await newWallet.save()
          }

          let updateWallet = await Wallet.updateOne({ userId: user._id }, { $inc: { balance: referal.referalOffer }, $push: { transaction: { status: `Credited`, amount: referal.referalOffer, date: Date.now() } } })
         
         
         
         
          
         
          const newUser = await Users.findOne({ shortId: globalShortId })
          if (newUser) {
            let wallet = new Wallet({
              userId: newUser._id,
              balance: referal.referedOffer,
              transaction: [{ status: `Credited`, amount: referal.referedOffer, date: Date.now() }]
            })
            await wallet.save()
          }
        }
      }

    }

    res.json('success')

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

//forgot password

exports.forgotPassword = (req, res) => {
  try {
    let message = req.query.message
    res.render('Users/ForgotPassword', { message })

  } catch (error) {

    console.log(error);

  }
}



exports.forgotOtp = async (req, res) => {
  const email = req.body.email
  const user = await Users.find({ email: email })

  if (!user) {

    return res.redirect('/user/forgotPassword?message=enter a valid email')
  }
  globalEmail = email
  OTP = generateOtp();
  console.log(OTP);

  sendMail(email, OTP);

  const otpStore = new otpModel({
    email: email,
    otp: OTP,
  });

  await otpStore.save();
  req.session.forgot = 1
  res.render('Users/otpVerification', { message: '' })
}

exports.newPassword = async (req, res) => {
  try {
    let password = req.body.password
    let newPassword = await bcrypt.hash(password, 10);

    await Users.updateOne({ email: globalEmail }, { $set: { password: newPassword } })
    await otpModel.deleteOne({ email: globalEmail });
    globalEmail = null
    res.redirect('/user/login?message=password changed successfully')
  } catch (error) {

  }
}

exports.get_home = async (req, res) => {
  try {
    // Retrieving categories and products from the database
    const catagory = await Catagory.find();
    const products = await Product.find({ isListed: true, quantity: { $gt: 0 } }).limit(4)
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()

    const message = req.query.message

    for (let product of products) {
      for (item of productOffer) {
        if (product.productName === item.productName) {
          product.pOffer = item.offer
        }
      }
      for (item of catagoryOffer) {
        if (product.catagory === item.catagoryName) {
          product.cOffer = item.offer
        }
      }
    }


    res.render("./Users/home", { catagory: catagory, product: products, message });
  } catch (error) {
    console.log(error);
  }
};



//logout user
exports.user_logout = (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/user");
  } catch (error) { }
};
