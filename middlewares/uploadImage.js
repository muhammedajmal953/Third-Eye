const multer = require("multer")
const path=require('path')




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/catagory')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
  
  const upload = multer({ storage: storage })

  const storageProduct = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/products')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
  })
  const uploadProduct = multer({ storage: storageProduct })



  module.exports={upload,uploadProduct}