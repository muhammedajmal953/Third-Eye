
const path=require('path')
const nodemailer=require('nodemailer')
require('dotenv').config({path:'../.env'})


const transportMail = nodemailer.createTransport({
    
    service:'gmail',
    auth:{
           user:process.env.Myemail,
          pass:process.env.Mypassword
    }
})


const sendMail = async (to, text) => {
    console.log(process.env.Mypassword);
    
    try {
       const mailOptions={
        from:process.env.Myemail,
        to:to,
        text:`your verication for email ${to} : ${text}`

       } 
       const info=await transportMail.sendMail(mailOptions)
       console.log('mail send successfully',info.response);
       return info
    } catch (error) {
        console.error('Error occurred while sending email:', error);
    }
}


module.exports=sendMail


