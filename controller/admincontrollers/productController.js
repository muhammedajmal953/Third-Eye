const sharp = require("sharp");
const Catagory = require("../../model/catagoryModel");
const Product = require("../../model/productModel");

exports.products = async (req, res) => {
  try {
    const totalProduct = await Product.find();
    const curPage = req.query.page || 1;
    const limit = 8;

    const totalPages = Math.ceil(totalProduct.length / limit);

    const skip = (curPage - 1) * limit;

    const product = await Product.find().skip(skip).limit(limit);

    res.render("./admin/productList", { product: product, totalPages });
  } catch (error) { 
    res.render('admin/admin404')
  }
};


exports.add_products = async (req, res) => {
  try {
    // Extract image URLs from the uploaded files
    const imageUrls = [];

    if (req.files) {
      for (i = 0; i < req.files.length; i++) {
        const imageBuffer = await sharp(req.files[i].path)
          .resize({ width: 500, height: 500, fit: sharp.fit.cover })
          .toBuffer();
        const filename = `cropped_${req.files[i].originalname}`;
        imageUrls[i] = filename;

        await sharp(imageBuffer).toFile(`./uploads/products/${filename}`);
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
      isListed: true,
    });

    // Save the new product to the database
    await addProduct.save();

    // Redirect to the products page after successful addition
    res.redirect("/admin/products");
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error adding product:", error);
    res.render('admin/admin404')
  }
};

// Edit product
exports.edit_products = async (req, res) => {
  try {
    // Extract product ID from request parameters
    const productId = req.params.id;
    const productData = {};
    const deletedImages = [...req.body.deletedImages];
    

    // Check if product name, description, price, quantity, and category are provided in the request body
    if (req.body.productName) {
      productData.productName = req.body.productName;
    }
    if (req.body.description) {
      productData.description = req.body.description;
    }
    if (req.body.price) {
     
      productData.price = Number(req.body.price);
     
    }
    if (req.body.quantity) {
      productData.quantity = Number(req.body.quantity);
    }
    if (req.body.catagory) {
      productData.catagory = req.body.catagory;
    }
    if (req.files&&req.files.length > 0) {
      const imageUrls = [];
      for (i = 0; i < req.files.length; i++) {
        const imageBuffer = await sharp(req.files[i].path)
          .resize({ width: 500, height: 500, fit: sharp.fit.cover })
          .toBuffer();
        const filename = `cropped_${req.files[i].originalname}`;
        imageUrls[i] = filename;

        await sharp(imageBuffer).toFile(`./uploads/products/${filename}`);
      }
      const existingProduct = await Product.findById(productId);

     

      const mergedImages = [...existingProduct.images, ...imageUrls];

      if (mergedImages.length > 5) {
        return res.json('reduce images')
      }
      productData.images = mergedImages;
    }


    // Update the product in the database
    let updatedProduct = await Product.findByIdAndUpdate(productId, productData);
    console.log();
    deletedImages.forEach(index => {
     updatedProduct.images.splice(index,1)
    })
    updatedProduct.save()
    

    // Redirect to the products page after successful update
    res.json('success')
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error editing product:", error);
    res.render('admin/admin404')
  }
};

// Unlist product
exports.unlist_product = async (req, res) => {
  try {
    // Update the product to mark it as unlisted
    await Product.updateOne(
      { _id: req.query.id },
      {
        isListed: false,
      }
    );
    // Redirect to the products page
    res.redirect("/admin/products");
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error unlisting product:", error);
    res.render('admin/admin404')
  }
};

// List product
exports.list_products = async (req, res) => {
  try {
    // Update the product to mark it as listed
    await Product.updateOne(
      { _id: req.query.id },
      {
        isListed: true,
      }
    );
    // Redirect to the unlisted products page
    res.redirect("/admin/unListedProducts");
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error listing product:", error);
    res.render('admin/admin404')
  }
};

