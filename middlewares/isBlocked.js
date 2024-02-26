const { findOne } = require("../model/adminModel");
const Users = require("../model/userModel");




async function isBlocked (req ,res, next){
    try {
        const userToBlock = await Users.findOne({ _id: req.session.user })
        if (userToBlock.isBlocked === true) {
            req.session.user=null
            return res.render("./Users/userLogin",{message:'You are blocked With admin'});
        }
        return next()
       
     } catch (error) {
       
     }
   
}



module.exports=isBlocked