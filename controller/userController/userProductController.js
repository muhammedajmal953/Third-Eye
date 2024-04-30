const Catagory = require("../../model/catagoryModel");
const Product = require("../../model/productModel");
const Wishlist = require("../../model/wishlistModel");
const CatagoryOffer = require("../../model/offerModel");
const ProductOffer = require("../../model/productOfferModel")

//handling Shop page rendering
exports.get_products = async (req, res) => {
  try {
    const page = req.params.page;
    const sortBy = req.query.sort;
    const totalProducts = await Product.find({ quantity: { $gt: 0 } });
    const limit = 6;
    const totalPages = Math.ceil(totalProducts.length / limit);
    const { category } = req.query;
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()
    // const sortBy = 'hiToLow';
    let sortCriteria = {};

    if (sortBy == "hiToLow") {
      sortCriteria = { price: -1 };
    } else if (sortBy == "lowToHi") {
      sortCriteria = { price: 1 };
    } else if (sortBy == "aToZ") {
      sortCriteria = { productName: 1 };
    } else if (sortBy == "zToA") {
      sortCriteria = { productName: -1 };
    }

    const skip = (page - 1) * limit;

    if (category) {
      const products = await Product.find({
        catagory: category,
        quantity: { $gt: 0 },
      })
        .sort(sortCriteria)

      //find offer
      for (let product of products) {
        for (item of productOffer) {
          if (product.productName === item.productName) {
            product.pOffer = item.offer
          }
        }
        for (item of catagoryOffer) {
          if (product.catagory === item.catagoryName) {
            product.cOffer = item.offer
          }
        }
      }

      const totalPages = Math.ceil(products.length / limit);
      const catagory = await Catagory.find();
      return res.render("./Users/productsGrid", {
        products: products,
        catagory: catagory,
        sortBy,
        totalPages,
        page,
      });
    }
    const products = await Product.find({ quantity: { $gt: 0 } })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);
    for (let product of products) {
      for (item of productOffer) {
        if (product.productName === item.productName) {
          product.pOffer = item.offer
        }
      }
      for (item of catagoryOffer) {
        if (product.catagory === item.catagoryName) {
          product.cOffer = item.offer || 0
        }
      }
    }
    const catagory = await Catagory.find();
    res.render("./Users/productsGrid", {
      products: products,
      catagory: catagory,
      sortBy,
      totalPages,
      page,
    });
  } catch (error) {
    console.log(error);
    res.render('Users/404error')
  }
};

exports.view_products = async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findOne({ _id: id });
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()


    for (item of productOffer) {
      if (product.productName === item.productName) {
        product.pOffer = item.offer
      }
      else {
        product.pOffer=0
      }
    }
    for (item of catagoryOffer) {
      
      if (product.catagory === item.catagoryName) {
        console.log("Category:", product.catagory, "Category Name:", item.catagoryName);
        product.cOffer = item.offer
        break
      } else {
        product.cOffer =0
      }
    }

    console.log(product.pOffer);
    res.render("./Users/ProductDetails", { product });
  } catch (error) {
    res.render('Users/404error')
  }
};

exports.searchPage = async (req, res) => {
  try {
    res.render("./Users/search", { products: [] });
  } catch {
    res.render('Users/404error')
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const text = req.body.text.trim();
    if (text === "") {
      return res.render("./Users/search", { products: [] });
    }
    const products = await Product.find({
      $or: [
        { productName: { $regex: text, $options: "i" } }, // Case-insensitive search for product name
        { description: { $regex: text, $options: "i" } }, // Case-insensitive search for product description
      ],
    });

    res.render("./Users/search", { products });
  } catch {
    res.render('Users/404error')
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const productId = req.query.productId
    const userId = req.session.user

    if (!userId) {
     return res.json('')
    }

    const wishlist = await Wishlist.findOne({ userId: userId })

    if (!wishlist) {
      const newWishList = new Wishlist({
        userId: userId,
        producIds: [productId]
      })
      await newWishList.save()
      return res.status(200).json('this product added to wishlist')
    }

    await Wishlist.findOneAndUpdate({ userId: userId }, { $addToSet: { producIds: productId } })

    res.status(200).json('this product added to wishlist')
  } catch {
    res.render('Users/404error')
  }

}

exports.show_wishlist = async (req, res) => {
  try {
    const userId = req.session.user
    const productOffer = await ProductOffer.find()
    const catagoryOffer = await CatagoryOffer.find()
    const wishList = await Wishlist.findOne({ userId: userId })
    let productIds = []
    if (wishList) {
      productIds = wishList.producIds
    }


    const products = []
    for (i = 0; i < productIds.length; i++) {
      const product = await Product.findOne({ _id: productIds[i] })
      products.push(product)
    }




    for (let product of products) {
      for (item of productOffer) {
        if (product.productName === item.productName) {
          product.pOffer = item.offer
        }
      }
      for (item of catagoryOffer) {
        if (product.catagory === item.catagoryName) {
          product.cOffer = item.offer
        }
      }
    }
    res.render('./Users/wishlist', { products })

  } catch (error) {

    console.log('wishlist',error);
    res.render('Users/404error')
  }
}


exports.wishlistRemove = async (req, res) => {
  const productId = req.query.productId
  const userId = req.session.user
  try {
    const remove = await Wishlist.updateOne({ userId: userId }, { $pull: { producIds: productId } })

    res.json('success')
  } catch (error) {
    res.render('Users/404error')
  }
}