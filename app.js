
const express = require("express");
const connectDB = require('./database/connection');
const session = require('express-session');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require("./routes/userRoutes");
const nocache = require("nocache");
require("dotenv").config()
const passport = require('./services/passportAuth');
 

   
// Defining the port for the server
const PORT = process.env.PORT

// Creating an instance of the Express application
const app = express();

// Setting the view engine to EJS
app.set('view engine', 'ejs');

// Establishing connection to the database
connectDB();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Using nocache middleware to prevent caching of responses
app.use(nocache());

// Serving static files from 'assets' and 'uploads' directories
app.use(express.static('assets'));
app.use(express.static('uploads'));

// Setting up session middleware for managing sessions
app.use(session({ 
  secret: process.env.Session_secret,   
  resave: false, 
  saveUninitialized: true,
  cookie: { maxAge: 6000000 } // Session cookie configuration
}));


app.use(passport.initialize())   


// Routing for admin and user functionalities
app.use('/admin', adminRoutes);
app.use('/', userRoutes); 

 
// Starting the server and listening on the defined port
app.listen(PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`);
});
      