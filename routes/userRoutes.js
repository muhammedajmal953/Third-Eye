// Importing necessary modules
const express = require('express');
const userRoutes = express.Router(); // Creating a Router instance
const userController = require('../controller/userController/userController'); // Importing user controller
const userOrderController = require('../controller/userController/userOrderController')
const cartController = require('../controller/userController/cartController');
const addressController = require('../controller/userController/addressController');
const userProfileController = require('../controller/userController/userProfileController')
const userProductController = require('../controller/userController/userProductController')

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


userRoutes.get('/forgotPassword',userController.forgotPassword)
userRoutes.post('/forgotPassword', userController.forgotOtp)

userRoutes.post('/newPassword',userController.newPassword)

// Route for user home page
userRoutes.get('/home', isLoggedIn, isBlocked, userController.get_home)

//Route for user shop page
userRoutes.get('/productList/:page', isLoggedIn, isBlocked, userProductController.get_products)

userRoutes.get('/product-search', isLoggedIn, isBlocked, userProductController.searchPage)

//router for search product
userRoutes.post('/searchProducts', userProductController.searchProducts)
// Route for viewing product details
userRoutes.get('/product-details', isLoggedIn, isBlocked, userProductController.view_products);
//add to wish list

userRoutes.post('/addToWishlist', userProductController.addToWishlist)
userRoutes.post('/wishlistRemove', userProductController.wishlistRemove)
//show wishlist
userRoutes.get('/showWishlist', isLoggedIn, isBlocked, userProductController.show_wishlist)

//Route for user profile

userRoutes.get('/profile', isLoggedIn, isBlocked, userProfileController.view_profile)
//get edit user
userRoutes.get('/profileEdit', isLoggedIn, isBlocked, userProfileController.edit_profile)
//save the editted profile
userRoutes.post('/profileUpdate', userProfileController.update_profile)

userRoutes.post("/changePassword", userProfileController.change_password)
//show addresses
userRoutes.get('/adresses', isLoggedIn, isBlocked, addressController.show_adress)
//add address
userRoutes.post('/addAdress', addressController.addAddress)
//edit address page render
userRoutes.get('/editAddress', addressController.get_editAddress)

userRoutes.post('/addressEdit', addressController.addressEdit)
userRoutes.post('/deleteAddress', addressController.deleteAddress)

//logout user
userRoutes.get('/logout', userController.user_logout)

//show Cart
userRoutes.get('/cart', isLoggedIn, isBlocked, cartController.show_cart)

userRoutes.post('/addToCart', cartController.addToCart)


userRoutes.post('/removeCart', cartController.removeCart)

userRoutes.post('/totalIncrement', cartController.totalIncrement)

userRoutes.post('/totalDecrement', cartController.totalDecrement)


userRoutes.get('/checkout', isLoggedIn, isBlocked, userOrderController.get_checkout)


userRoutes.post('/proceedOrder', userOrderController.orderPlace)

userRoutes.get('/orders', isLoggedIn, isBlocked, userOrderController.orderView)


userRoutes.get('/orderDetails', isLoggedIn, isBlocked, userOrderController.orderDetails)

userRoutes.post('/cancelOrder', userOrderController.cancelOrder)

userRoutes.post('/returnOrder', userOrderController.returnOrder)


userRoutes.get('/successOrder', isLoggedIn, isBlocked, userOrderController.successOrder)

//user wallet
userRoutes.get('/wallet',isLoggedIn, isBlocked, userProfileController.wallet)

//recharge wallet
userRoutes.post('/walletRecharge', userProfileController.walletRecharge)

userRoutes.get('/updateWallet', isLoggedIn, isBlocked, userProfileController.updateWallet)


userRoutes.post('/applyCoupon',cartController.applyCoupon)





module.exports = userRoutes; // Exporting userRoutes
