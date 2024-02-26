const Admin = require('../model/adminModel');
const Catagory = require('../model/catagoryModel');
const Product = require('../model/productModel');
const Users = require('../model/userModel');
const sharp = require('sharp');



// Render login page
exports.get_login=(req,res)=>{
    try {
       if(req.session.admin)
       {
         // If admin is already logged in, redirect to dashboard
        return res.redirect('/admin/dashboard')
       }
       // not logged in redirect to login page
       return  res.render('./admin/login');
    } catch (error) {
      res.status(500).send("Internal Server Error");
      console.error("Error rendering login page:", error);
    }
}



//admin login handling

exports.admin_login =
  async (req, res) => {
  try {
    const { email, password } = req.body;
    const admins = await Admin.findOne({email:email,password:password});
    if (email == admins.email && password == admins.password) {
      req.session.admin=admins._id
      res.redirect("/admin/Dashboard");
    } else {
      req.session.error = "Invalid Credentials";
      return res.redirect("/admin");
    }
  } catch (error) {
    res.status(500).send("invalid credentials");
  }
  };


  //dash board rendering

exports.getDashoard=async(req,res)=>{
  try {
    const users= await Users.find()
    res.render('./admin/index',{users:users})
  } catch (error) {
    
  }
}


//userlist rendering
exports.userList=async(req,res)=>{
  try {
    const users= await Users.find()
    res.render('./admin/customers-details',{users:users})
  } catch (error) {
    
  }
}



//block user
exports.user_block = async (req, res) => {
  try {
    const id = req.query.id
    await Users.updateOne({ _id: id }, {
      $set: { isBlocked: true }
    })
    res.redirect('/admin/customers')
  } catch {

  }
}


//unblock user

exports.user_unblock = async (req, res) => {
  try {
    const id = req.query.id
    await Users.updateOne({ _id: id }, {
      $set: { isBlocked: false }
    })
    res.redirect('/admin/customers')
  } catch {

  }
}



//add catagory
exports.add_catagory = async (req, res) => {


  try {
     const existingCat=await Catagory.findOne({catagoryName:req.body.catagoryName})      
      if(existingCat){
        return res.render("./admin/addCatagory",{message:'catagory already exist'})
    
      }

    // adding catagory to data base
    let imageUrl
    const imageBuffer=await sharp(req.file.path)
    .resize({width:400,height:500,fit:sharp.fit.cover})
      .toBuffer()
      const filename=`cropped_${req.file.originalname}`
      imageUrl=filename

      await sharp(imageBuffer).toFile(`./uploads/catagory/${filename}`)
            
    const addCatagory = new Catagory({
      catagoryName: req.body.catagoryName,
      image:imageUrl,
      isActive: true
    });

    await addCatagory.save();
  //redirect to catagory list page after adding
    res.redirect('/admin/catagory');
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send("Internal Server Error");
  }
}



//editing catagory
exports.edit_catagory = async (req, res) => {
  try {
    // Check if a file was uploaded and set the image URL accordingly
    let imageUrl;
    if (req.file) {
      const imageBuffer=await sharp(req.file.path)
      .resize({width:400,height:500,fit:sharp.fit.cover})
        .toBuffer()
        const filename=`cropped_${req.file.originalname}`
        imageUrl=filename
  
        await sharp(imageBuffer).toFile(`./uploads/catagory/${filename}`)
    }

    // Update the category in the database
    await Catagory.findByIdAndUpdate({ _id: req.params.id }, {
      catagoryName: req.body.catagoryName,
      image: imageUrl,
      isActive: true
    });

    // Redirect to the categories page after successful update
    res.redirect('/admin/catagory');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error editing category:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Remove category
exports.remove_catagory = async (req, res) => {
  try {
    // Update the category to mark it as inactive
    await Catagory.updateOne({ _id: req.query.id }, {
      isActive: false
    });
    // Redirect to the categories page
    res.redirect('/admin/catagory');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error removing category:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Restore category
exports.unRemove_catagory = async (req, res) => {
  try {
    // Update the category to mark it as active
    await Catagory.updateOne({ _id: req.query.id }, {
      isActive: true
    });
    // Redirect to the unlisted categories page
    res.redirect('/admin/unlisted-catagory');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error restoring category:", error);
    res.status(500).send("Internal Server Error");
  }
}



exports.add_products = async (req, res) => {
  try {
    // Extract image URLs from the uploaded files
    const imageUrls = []


    if(req.files){
      for(i=0;i<req.files.length;i++){
        const imageBuffer=await sharp(req.files[i].path)
        .resize({width:400,height:500,fit:sharp.fit.cover})
          .toBuffer()
          const filename=`cropped_${req.files[i].originalname}`
          imageUrls[i]=filename

          await sharp(imageBuffer).toFile(`./uploads/products/${filename}`)
      }
    }
    
    // Create a new product instance
    const addProduct = new Product({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      quantity: req.body.quantity,
      catagory: req.body.catagory,
      images: imageUrls,
      isListed: true
    });

    // Save the new product to the database
    await addProduct.save();

    // Redirect to the products page after successful addition
    res.redirect('/admin/products');
  } catch (error) {
    // Handle any errors that occur during the process 
    console.error("Error adding product:", error);
    res.status(500).send("Internal Server Error");
  }
}


// Edit product
exports.edit_products = async (req, res) => {
  try {
    // Extract product ID from request parameters
    const productId = req.params.id;
    const productData = {};

    // Check if product name, description, price, quantity, and category are provided in the request body
    if (req.body.productName) {
      productData.productName = req.body.productName;
    }
    if (req.body.description) {
      productData.description = req.body.description;
    }
    if (req.body.price) {
      productData.price = req.body.price;
    }
    if (req.body.quantity) {
      productData.quantity = req.body.quantity;
    }
    if (req.body.catagory) {
      productData.catagory = req.body.catagory;
    }
    if (req.files.length > 0) {
      const imageUrls=[]
      for(i=0;i<req.files.length;i++){
        const imageBuffer=await sharp(req.files[i].path)
        .resize({width:400,height:500,fit:sharp.fit.cover})
          .toBuffer()
          const filename=`cropped_${req.files[i].originalname}`
          imageUrls[i]=filename

          await sharp(imageBuffer).toFile(`./uploads/products/${filename}`)
      }
      productData.images = imageUrls;
    }

    // Update the product in the database
    await Product.findByIdAndUpdate(productId, productData);
    
    // Redirect to the products page after successful update
    res.redirect('/admin/products');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error editing product:", error);
    res.status(500).send("Give The Correct Images");
  }
}

// Unlist product
exports.unlist_product = async (req, res) => {
  try {
    // Update the product to mark it as unlisted
    await Product.updateOne({ _id: req.query.id }, {
      isListed: false
    });
    // Redirect to the products page
    res.redirect('/admin/products');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error unlisting product:", error);
    res.status(500).send("Internal Server Error");
  }
}

// List product
exports.list_products = async (req, res) => {
  try {
    // Update the product to mark it as listed
    await Product.updateOne({ _id: req.query.id }, {
      isListed: true
    });
    // Redirect to the unlisted products page
    res.redirect('/admin/unListedProducts');
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error listing product:", error);
    res.status(500).send("Internal Server Error");
  }
}

// adminLogout handling
exports.admin_logout=(req,res)=>{

  try {
     req.session.destroy(()=>{
       res.redirect('/admin')
     })
  } catch (error) {
    
  }

}