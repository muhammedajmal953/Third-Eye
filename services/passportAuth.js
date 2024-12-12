const path = require('path')
require('dotenv').config({ path: '../.env' })

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const Users = require('../model/userModel')
 
// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });

// passport.deserializeUser(function (id, done) {
//     Users.findById(id).then((user) => {
//         done(null, user)
//     })
// });


   
// passport.use(new
//     GoogleStrategy({
      
//         callbackURL: 'http://localhost:5000/user/auth/google/callback'
//     }, async (accessToken, refreshToken, profile, done) => {
//         try {
//             const user = await Users.findOne({ googleId: profile.id })

//             if (user) {
//                 return done(null, user);
//             } else {
//                 const newUser = new Users({
//                     googleId: profile.id,
//                     username: profile.displayName,
//                     email: profile.emails[0].value
//                 })
//                 await newUser.save()
//                 return done(null, newUser);
//             }
//         } catch (error) {
//             return done(error)
//         }
//     }
//     ))



module.exports = passport