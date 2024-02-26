// Importing necessary modules
const express = require('express');
const userRoutes = express.Router(); // Creating a Router instance
const userControler = require('../controller/userController'); // Importing user controller
const Users = require('../model/userModel'); // Importing User model
const Catagory = require('../model/catagoryModel'); // Importing Category model
const Product = require('../model/productModel'); // Importing Product model
const { isLoggedIn } = require('../middlewares/isLoggedin'); // Importing isLoggedIn middleware
const isBlocked = require('../middlewares/isBlocked');

const passport = require('../services/passportAuth');


userRoutes.use(express.json());



//Route for landingpage
userRoutes.get('/', userControler.landing)


// Route for user login page
userRoutes.get('/login', userControler.get_login);
userRoutes.post('/login', userControler.user_login); // POST route for user login

//Route for google sign in
userRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
userRoutes.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/user/login'}),userControler.google_login)




// Route for user signup page
userRoutes.post('/signup', userControler.user_SignUp);
userRoutes.get('/signup', userControler.get_signup);
userRoutes.post('/verify-email', userControler.verifyEmail)
userRoutes.post('/resendOtp', userControler.resendOtp)


// Route for user home page
userRoutes.get('/home', isLoggedIn, isBlocked, userControler.get_home)

//Route for user shop page
userRoutes.get('/productList', isLoggedIn, isBlocked,userControler.get_products)

// Route for viewing product details
userRoutes.get('/product-details', isLoggedIn, isBlocked,userControler.view_products);

//Route for user profile

userRoutes.get('/profile',isLoggedIn,isBlocked,userControler.view_profile)


//logout user
userRoutes.get('/logout', userControler.user_logout)



module.exports = userRoutes; // Exporting userRoutes
