// Importing necessary modules
const express = require('express');
const userRoutes = express.Router(); // Creating a Router instance
const userController = require('../controller/userController'); // Importing user controller
const Users = require('../model/userModel'); // Importing User model
const Catagory = require('../model/catagoryModel'); // Importing Category model
const Product = require('../model/productModel'); // Importing Product model
const { isLoggedIn } = require('../middlewares/isLoggedin'); // Importing isLoggedIn middleware
const isBlocked = require('../middlewares/isBlocked');

const passport = require('../services/passportAuth');


userRoutes.use(express.json());



//Route for landingpage
userRoutes.get('/', userController.landing)


// Route for user login page
userRoutes.get('/login', userController.get_login);
userRoutes.post('/login', userController.user_login); // POST route for user login

// //Route for google sign in
// userRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
// userRoutes.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/user/login'}),userController.google_login)




// Route for user signup page
userRoutes.post('/signup', userController.user_SignUp);
userRoutes.get('/signup', userController.get_signup);
userRoutes.post('/verify-email', userController.verifyEmail)
userRoutes.post('/resendOtp', userController.resendOtp)


// Route for user home page
userRoutes.get('/home', isLoggedIn, isBlocked, userController.get_home)

//Route for user shop page
userRoutes.get('/productList/:page', isLoggedIn, isBlocked,userController.get_products)

userRoutes.get('/product-search', isLoggedIn, isBlocked, userController.searchPage)

//router for search product
userRoutes.post('/searchProducts',userController.searchProducts)
// Route for viewing product details
userRoutes.get('/product-details', isLoggedIn, isBlocked,userController.view_products);

//Route for user profile

userRoutes.get('/profile', isLoggedIn, isBlocked, userController.view_profile)
//get edit user
userRoutes.get('/profileEdit',isLoggedIn,isBlocked,userController.edit_profile)
//save the editted profile
userRoutes.post('/profileUpdate',userController.update_profile)

userRoutes.post("/changePassword", userController.change_password)
//show addresses
userRoutes.get('/adresses',isLoggedIn,isBlocked,userController.show_adress)
//add address
userRoutes.post('/addAdress',userController.addAddress)
//edit address page render
userRoutes.get('/editAddress',userController.get_editAddress)

userRoutes.post('/addressEdit',userController.addressEdit)
userRoutes.post('/deleteAddress',userController.deleteAddress)

//logout user
userRoutes.get('/logout', userController.user_logout)

//show Cart
userRoutes.get('/cart',isLoggedIn,isBlocked, userController.show_cart)

userRoutes.post('/addToCart', userController.addToCart)


userRoutes.post('/removeCart', userController.removeCart)

userRoutes.post('/totalIncrement', userController.totalIncrement)

userRoutes.post('/totalDecrement', userController.totalDecrement)


userRoutes.get('/checkout',isLoggedIn,isBlocked, userController.get_checkout)


userRoutes.post('/proceedOrder', userController.orderPlace)

userRoutes.get('/orders',isLoggedIn,isBlocked,userController.orderView)
 
module.exports = userRoutes; // Exporting userRoutes
