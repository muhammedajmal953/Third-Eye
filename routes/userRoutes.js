// Importing necessary modules
const express = require('express');
const userRoutes = express.Router(); // Creating a Router instance
const userController = require('../controller/userController/userController'); // Importing user controller
const userOrderController = require('../controller/userController/userOrderController')
const cartController = require('../controller/userController/cartController');
const addressController = require('../controller/userController/addressController');
const userProfileController = require('../controller/userController/userProfileController')
const userProductController = require('../controller/userController/userProductController')
const cancelledPaymentController = require('../controller/userController/cancelledPaymentController')

const { isLoggedIn } = require('../middlewares/isLoggedin'); // Importing isLoggedIn middleware
const isBlocked = require('../middlewares/isBlocked');

const passport = require('../services/passportAuth');


userRoutes.use(express.json());



//Route for landingpage
userRoutes.get('/', userController.landing)


// Route for user login page
userRoutes.get('/user/login', userController.get_login);
userRoutes.post('/user/login', userController.user_login); // POST route for user login

// //Route for google sign in
// userRoutes.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
// userRoutes.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/user/login'}),userController.google_login)




// Route for user signup page
userRoutes.post('/user/signup', userController.user_SignUp);
userRoutes.get('/user/signup', userController.get_signup);
userRoutes.post('/user/verify-email', userController.verifyEmail)
userRoutes.post('/user/resendOtp', userController.resendOtp)


userRoutes.get('/user/forgotPassword',userController.forgotPassword)
userRoutes.post('/user/forgotPassword', userController.forgotOtp)

userRoutes.post('/user/newPassword',userController.newPassword)

// Route for user home page
userRoutes.get('/user/home', isLoggedIn, isBlocked, userController.get_home)

//Route for user shop page
userRoutes.get('/user/productList/:page', userProductController.get_products)

userRoutes.get('/user/product-search', isLoggedIn, isBlocked, userProductController.searchPage)

//router for search product
userRoutes.post('/user/searchProducts', isLoggedIn, isBlocked, userProductController.searchProducts)
// Route for viewing product details
userRoutes.get('/user/product-details',  userProductController.view_products);
//add to wish list

userRoutes.post('/user/addToWishlist', userProductController.addToWishlist)
userRoutes.post('/user/wishlistRemove', userProductController.wishlistRemove)
//show wishlist
userRoutes.get('/user/showWishlist', isLoggedIn, isBlocked, userProductController.show_wishlist)

//Route for user profile

userRoutes.get('/user/profile', isLoggedIn, isBlocked, userProfileController.view_profile)
//get edit user
userRoutes.get('/user/profileEdit', isLoggedIn, isBlocked, userProfileController.edit_profile)
//save the editted profile
userRoutes.post('/user/profileUpdate', userProfileController.update_profile)

userRoutes.post("/user/changePassword", userProfileController.change_password)
//show addresses
userRoutes.get('/user/adresses', isLoggedIn, isBlocked, addressController.show_adress)
//add address
userRoutes.post('/user/addAdress', addressController.addAddress)
userRoutes.post('/user/addAdressCheckOut', addressController.addAddressCheckOut)
//edit address page render
userRoutes.get('/user/editAddress', addressController.get_editAddress)

userRoutes.post('/user/addressEdit', addressController.addressEdit)
userRoutes.post('/user/deleteAddress', addressController.deleteAddress)

//logout user
userRoutes.get('/user/logout', userController.user_logout)

//show Cart
userRoutes.get('/user/cart', isLoggedIn, isBlocked, cartController.show_cart)

userRoutes.post('/user/addToCart', isLoggedIn, isBlocked, cartController.addToCart)


userRoutes.post('/user/removeCart', cartController.removeCart)

userRoutes.post('/user/totalIncrement', cartController.totalIncrement)

userRoutes.post('/user/totalDecrement', cartController.totalDecrement)


userRoutes.get('/user/checkout', isLoggedIn, isBlocked, userOrderController.get_checkout)


userRoutes.post('/user/proceedOrder',isLoggedIn, isBlocked,  userOrderController.orderPlace)

userRoutes.get('/user/orders', isLoggedIn, isBlocked, userOrderController.orderView)


userRoutes.get('/user/orderDetails', isLoggedIn, isBlocked, userOrderController.orderDetails)

userRoutes.post('/user/cancelOrder', userOrderController.cancelOrder)

userRoutes.post('/user/returnOrder', userOrderController.returnOrder)


userRoutes.get('/user/successOrder', isLoggedIn, isBlocked, userOrderController.successOrder)

//user wallet
userRoutes.get('/user/wallet',isLoggedIn, isBlocked, userProfileController.wallet)

//recharge wallet
userRoutes.post('/user/walletRecharge', userProfileController.walletRecharge)
userRoutes.post('/user/walletWithDraw', userProfileController.walletWithDraw)

userRoutes.get('/user/updateWallet', isLoggedIn, isBlocked, userProfileController.updateWallet)



userRoutes.get('/user/newPassword', (req, res) => {
    res.render('Users/newPassword')
})


userRoutes.post('/user/applyCoupon',cartController.applyCoupon)
userRoutes.post('/user/removeCoupon',cartController.removeCoupon)


userRoutes.get('/user/cancelledPayment',isLoggedIn, isBlocked,cancelledPaymentController.cancelledPayment)
userRoutes.post('/user/quickPayment', cancelledPaymentController.quickPayment)

userRoutes.get('/user/successQuickPayment', cancelledPaymentController.successQuickPayement)

userRoutes.post('/user/invoiceDownload', userOrderController.invoiceDownload)


userRoutes.post('/user/clearFilter',userProductController.clearFilter)



module.exports = userRoutes; // Exporting userRoutes
