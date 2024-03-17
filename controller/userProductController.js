const Catagory = require("../model/catagoryModel");
const Product = require("../model/productModel");

//handling Shop page rendering
exports.get_products = async (req, res) => {
    try {
      const page = req.params.page;
      const sortBy = req.query.sort;
      const totalProducts = await Product.find();
      const limit = 6;
      const totalPages = Math.ceil(totalProducts.length / limit);
      const { category } = req.query;
  
      console.log(category);
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
  
        const products = await Product.find({ catagory: category })
          .sort(sortCriteria)
          .skip(skip)
          .limit(limit);
          const totalPages = Math.ceil(products.length / limit);
        const catagory = await Catagory.find();
        return res.render("./Users/productsGrid", {
          products: products,
          catagory: catagory,
          sortBy,
          totalPages,
          page
        });
      }
      const products = await Product.find()
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit);
      const catagory = await Catagory.find();
      res.render("./Users/productsGrid", {
        products: products,
        catagory: catagory,
        sortBy,
        totalPages,
        page
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Oops  somthing Went Wrong...!!!");
    }
  };
  
exports.view_products = async (req, res) => {
    try {
      const id = req.query.id;
      const product = await Product.findOne({ _id: id });
      res.render("./Users/ProductDetails", { product });
    } catch (error) {
      res.status(500).send("Error occurred while fetching product details.");
    }
};
  


exports.searchPage = async (req, res) => {
    res.render("./Users/search", { products: [] });
  };
  
  exports.searchProducts = async (req, res) => {
    const text = req.body.text.trim();
    if (text==='') {
      return res.render("./Users/search", { products:[] });
     }
    const products = await Product.find({
      $or: [
        { productName: { $regex: text, $options: "i" } }, // Case-insensitive search for product name
        { description: { $regex: text, $options: "i" } }, // Case-insensitive search for product description
      ],
    });
   
    res.render("./Users/search", { products });
  };
  